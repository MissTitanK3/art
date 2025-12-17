"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TeleprompterHeader } from "@workspace/ui/patterns/features/teleprompter/teleprompter-header";
import { TeleprompterImportDrawer } from "@workspace/ui/patterns/features/teleprompter/teleprompter-import-drawer";
import { TeleprompterSettingsDrawer } from "@workspace/ui/patterns/features/teleprompter/teleprompter-settings-drawer";
import { TeleprompterScriptCard } from "@workspace/ui/patterns/features/teleprompter/teleprompter-script-card";
import { useFullscreenElement } from "@workspace/ui/hooks/use-fullscreen-element";
import { useAutoHide } from "@workspace/ui/hooks/use-auto-hide";
import { useViewportInfo } from "@workspace/ui/hooks/use-viewport-info";
import {
  BASE_MS_PER_CHAR,
  SPEED_PRESETS,
  PresetId,
  computeLineMsOrdered,
  estimateTotalMsOrdered,
  segmentsForLine as segmentsForLineShared,
} from "@workspace/ui/lib/teleprompter";
import { useTeleprompterEngine } from "@workspace/ui/hooks/use-teleprompter-engine";
import { useTeleprompterHotkeys } from "@workspace/ui/hooks/use-teleprompter-hotkeys";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { useTeleprompterStore } from "@workspace/store/useTeleprompterStore";
import {
  TELEPROMPTER_SCRIPTS as SCRIPTS,
  TELEPROMPTER_SCRIPT_META,
  TeleprompterScriptId as ScriptId,
} from "@/data/teleprompter-scripts";
export default function TeleprompterDataLayer() {
  const router = useRouter();
  const storeText = useTeleprompterStore((s) => s.text);
  const storeScriptId = useTeleprompterStore((s) => s.scriptId);
  const storeFontSize = useTeleprompterStore((s) => s.fontSize);
  const storeLineHeight = useTeleprompterStore((s) => s.lineHeight);
  const storeMirrorH = useTeleprompterStore((s) => s.mirrorH);
  const storeMirrorV = useTeleprompterStore((s) => s.mirrorV);
  const storePreset = useTeleprompterStore((s) => s.preset);
  const storeSpeed = useTeleprompterStore((s) => s.speed);
  const storeDefaultSpeed = useTeleprompterStore((s) => s.defaultSpeed);
  const storeFontFace = useTeleprompterStore((s) => s.fontFace);
  const storeCustomTextColor = useTeleprompterStore((s) => s.customTextColor);
  const storeCustomBgColor = useTeleprompterStore((s) => s.customBgColor);
  const storeCustomHighlightColor = useTeleprompterStore(
    (s) => s.customHighlightColor,
  );
  const storeOverlayColor = useTeleprompterStore((s) => s.overlayColor);
  const storeOverlayOpacity = useTeleprompterStore((s) => s.overlayOpacity);
  const storeCacheEnabled = useTeleprompterStore((s) => s.cacheEnabled);
  const bumpRev = useTeleprompterStore((s) => s.bumpRev);
  const s_setText = useTeleprompterStore((s) => s.setText);
  const s_setScriptId = useTeleprompterStore((s) => s.setScriptId);
  const s_setFontSize = useTeleprompterStore((s) => s.setFontSize);
  const s_setLineHeight = useTeleprompterStore((s) => s.setLineHeight);
  const s_setMirrorH = useTeleprompterStore((s) => s.setMirrorH);
  const s_setMirrorV = useTeleprompterStore((s) => s.setMirrorV);
  const s_setPreset = useTeleprompterStore((s) => s.setPreset);
  const s_setSpeed = useTeleprompterStore((s) => s.setSpeed);
  const s_setDefaultSpeed = useTeleprompterStore((s) => s.setDefaultSpeed);
  const s_setFontFace = useTeleprompterStore((s) => s.setFontFace);
  const s_setCustomTextColor = useTeleprompterStore(
    (s) => s.setCustomTextColor,
  );
  const s_setCustomBgColor = useTeleprompterStore((s) => s.setCustomBgColor);
  const s_setCustomHighlightColor = useTeleprompterStore(
    (s) => s.setCustomHighlightColor,
  );
  const s_setOverlayColor = useTeleprompterStore((s) => s.setOverlayColor);
  const s_setOverlayOpacity = useTeleprompterStore((s) => s.setOverlayOpacity);
  const s_setCacheEnabled = useTeleprompterStore((s) => s.setCacheEnabled);
  // Local UI defaults (stable for SSR); rehydrate from store after mount to avoid hydration mismatches
  const [scriptId, setScriptId] = useState<ScriptId>("full_narrative");
  const [text, setText] = useState<string>(SCRIPTS["full_narrative"]);
  const [fontSize, setFontSize] = useState<string>("text-xl");
  const [lineHeight, setLineHeight] = useState<string>("leading-8");
  const [mirrorH, setMirrorH] = useState<boolean>(false);
  const [mirrorV, setMirrorV] = useState<boolean>(false);
  const [preset, setPreset] = useState<PresetId>("briefing");
  const [speed, setSpeed] = useState<number>(1); // 0.25..2
  const [importOpen, setImportOpen] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [fontFace, setFontFace] = useState<string>("sans"); // sans|serif|mono|dyslexic
  const [customTextColor, setCustomTextColor] = useState<string>("#e5e7eb");
  const [customBgColor, setCustomBgColor] = useState<string>("#0b0f18");
  const [customHighlightColor, setCustomHighlightColor] =
    useState<string>("#22d3ee");
  const [overlayColor, setOverlayColor] = useState<string>("#000000");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0);
  const [defaultSpeed, setDefaultSpeed] = useState<number>(1);
  // Cue durations (configurable; static for now, no UI to change)
  // Tuned from field notes:
  // - Breath: ~0.5–1.5s -> default 1.0s
  // - Emphasis pause: ~1.0–1.5s -> default 1.2s
  // - Audience look/connection pause: ~2–4s -> default 3.0s
  const cuePauseMs = 1200;
  const cueBreatheMs = 1000;
  const cueLookupMs = 3000;
  const showSegmentBar = true;
  // timers now handled by engine
  const currentRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportHasFocus, setViewportHasFocus] = useState<boolean>(false);
  const [viewportHintDismissed, setViewportHintDismissed] =
    useState<boolean>(false);
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true);
  // line countdown handled by engine
  const [mobileControlsVisible, setMobileControlsVisible] =
    useState<boolean>(true);
  const [showFsControls, setShowFsControls] = useState<boolean>(true);
  const [orientationHintDismissed, setOrientationHintDismissed] =
    useState<boolean>(false);
  // Defer store syncing until after we rehydrate from persisted values
  const canSyncRef = useRef(false);
  // Sync local state to persisted store (only after rehydration completes)
  useEffect(() => {
    if (canSyncRef.current) s_setText(text);
  }, [text, s_setText]);
  useEffect(() => {
    if (canSyncRef.current) s_setScriptId(scriptId);
  }, [scriptId, s_setScriptId]);
  useEffect(() => {
    if (canSyncRef.current) s_setFontSize(fontSize);
  }, [fontSize, s_setFontSize]);
  useEffect(() => {
    if (canSyncRef.current) s_setLineHeight(lineHeight);
  }, [lineHeight, s_setLineHeight]);
  useEffect(() => {
    if (canSyncRef.current) s_setMirrorH(mirrorH);
  }, [mirrorH, s_setMirrorH]);
  useEffect(() => {
    if (canSyncRef.current) s_setMirrorV(mirrorV);
  }, [mirrorV, s_setMirrorV]);
  useEffect(() => {
    if (canSyncRef.current) s_setPreset(preset);
  }, [preset, s_setPreset]);
  useEffect(() => {
    if (canSyncRef.current) s_setSpeed(speed);
  }, [speed, s_setSpeed]);
  useEffect(() => {
    if (canSyncRef.current) s_setDefaultSpeed(defaultSpeed);
  }, [defaultSpeed, s_setDefaultSpeed]);
  useEffect(() => {
    if (canSyncRef.current) s_setFontFace(fontFace);
  }, [fontFace, s_setFontFace]);
  useEffect(() => {
    if (canSyncRef.current) s_setCustomTextColor(customTextColor);
  }, [customTextColor, s_setCustomTextColor]);
  useEffect(() => {
    if (canSyncRef.current) s_setCustomBgColor(customBgColor);
  }, [customBgColor, s_setCustomBgColor]);
  useEffect(() => {
    if (canSyncRef.current) s_setCustomHighlightColor(customHighlightColor);
  }, [customHighlightColor, s_setCustomHighlightColor]);
  useEffect(() => {
    if (canSyncRef.current) s_setOverlayColor(overlayColor);
  }, [overlayColor, s_setOverlayColor]);
  useEffect(() => {
    if (canSyncRef.current) s_setOverlayOpacity(overlayOpacity);
  }, [overlayOpacity, s_setOverlayOpacity]);
  useEffect(() => {
    if (canSyncRef.current) s_setCacheEnabled(cacheEnabled);
  }, [cacheEnabled, s_setCacheEnabled]);
  // Built-in import content is now handled by shared UI component; no local sync needed
  const computeLineMsFn = useCallback(
    (ln: string, spd: number) =>
      computeLineMsOrdered(ln, spd, {
        baseMsPerChar: BASE_MS_PER_CHAR,
        pauseMs: cuePauseMs,
        breatheMs: cueBreatheMs,
        lookupMs: cueLookupMs,
        minLineMs: 300,
      }),
    [cuePauseMs, cueBreatheMs, cueLookupMs],
  );
  const engine = useTeleprompterEngine(text, speed, computeLineMsFn);
  const {
    index,
    setIndex,
    playing,
    togglePlay,
    next,
    prev,
    rewind,
    progressPct,
    elapsedMs,
    plannedMsForCurrentLine,
    lineStartedAt,
  } = engine;
  const open = (href: string) => router.push(href);
  const lines = useMemo(() => text.split(/\r?\n/), [text]);
  const totalMs = useMemo(
    () =>
      estimateTotalMsOrdered(text, speed, {
        baseMsPerChar: BASE_MS_PER_CHAR,
        pauseMs: cuePauseMs,
        breatheMs: cueBreatheMs,
        lookupMs: cueLookupMs,
        minLineMs: 300,
      }),
    [text, speed, cuePauseMs, cueBreatheMs, cueLookupMs],
  );
  const humanTime = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };
  const countdownSegments = useMemo(
    () =>
      segmentsForLineShared(lines[index] ?? "", speed, {
        baseMsPerChar: BASE_MS_PER_CHAR,
        pauseMs: cuePauseMs,
        breatheMs: cueBreatheMs,
        lookupMs: cueLookupMs,
        minLineMs: 300,
      }),
    [lines, index, speed, cuePauseMs, cueBreatheMs, cueLookupMs],
  );
  const {
    ref: fsRef,
    isFullscreen,
    toggle: toggleFs,
  } = useFullscreenElement<HTMLDivElement>();
  useEffect(() => {
    setFullscreen(isFullscreen);
  }, [isFullscreen]);
  const toggleFullscreen = useCallback(async () => {
    try {
      await toggleFs();
    } catch (error) {
      console.warn("[teleprompter] toggle fullscreen failed", error);
    }
  }, [toggleFs]);
  const { isMobile, isPortrait } = useViewportInfo(768);
  const { visible: fsVisible, containerRef: autoHideRef } = useAutoHide(3000);
  useEffect(() => {
    setShowFsControls(fullscreen ? fsVisible : false);
  }, [fullscreen, fsVisible]);
  useEffect(() => {
    if (!fullscreen) return;
    const t = window.setTimeout(() => {
      try {
        const el = viewportRef.current;
        if (!el) return;
        const activeEl =
          typeof document !== "undefined"
            ? (document.activeElement as HTMLElement | null)
            : null;
        if (activeEl) {
          const tag = activeEl.tagName;
          const isEditable =
            activeEl.isContentEditable ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            activeEl.getAttribute("role") === "textbox";
          if (isEditable) return;
        }
        el.focus({ preventScroll: true } as FocusOptions);
      } catch (error) {
        console.warn("[teleprompter] failed to focus in fullscreen", error);
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, [fullscreen]);
  useTeleprompterHotkeys(viewportRef as React.RefObject<HTMLElement>, {
    togglePlay,
    next,
    prev,
    rewind,
    setSpeed,
    toggleHMirror: () => setMirrorH((v) => !v),
    toggleVMirror: () => setMirrorV((v) => !v),
    toggleFullscreen,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    try {
      const v = localStorage.getItem("teleprompter.viewportHintDismissed");
      if (v === "1") setViewportHintDismissed(true);
    } catch (error) {
      console.warn("[teleprompter] failed to read viewport hint", error);
    }
  }, []);
  const focusViewport = useCallback(() => {
    try {
      const el = viewportRef.current;
      if (!el) return;
      const activeEl =
        typeof document !== "undefined"
          ? (document.activeElement as HTMLElement | null)
          : null;
      if (activeEl) {
        const tag = activeEl.tagName;
        const isEditable =
          activeEl.isContentEditable ||
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          activeEl.getAttribute("role") === "textbox";
        if (isEditable) return; // don't steal focus while typing
      }
      el.focus({ preventScroll: true } as FocusOptions);
    } catch (error) {
      console.warn("[teleprompter] focusViewport failed", error);
    }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    if (importOpen || settingsOpen) return;
    focusViewport();
    const t = window.setTimeout(() => focusViewport(), 120);
    return () => window.clearTimeout(t);
  }, [importOpen, settingsOpen, mounted, focusViewport]);
  useEffect(() => {
    if (!mounted || canSyncRef.current) return;
    try {
      if (storeScriptId) setScriptId(storeScriptId as ScriptId);
      if (storeText) setText(storeText);
      if (storeFontSize) setFontSize(storeFontSize);
      if (storeLineHeight) setLineHeight(storeLineHeight);
      if (typeof storeMirrorH !== "undefined") setMirrorH(!!storeMirrorH);
      if (typeof storeMirrorV !== "undefined") setMirrorV(!!storeMirrorV);
      if (storePreset) setPreset(storePreset as PresetId);
      if (typeof storeSpeed === "number") setSpeed(storeSpeed);
      if (typeof storeDefaultSpeed === "number")
        setDefaultSpeed(storeDefaultSpeed);
      if (storeFontFace) setFontFace(storeFontFace);
      if (storeCustomTextColor) setCustomTextColor(storeCustomTextColor);
      if (storeCustomBgColor) setCustomBgColor(storeCustomBgColor);
      if (storeCustomHighlightColor)
        setCustomHighlightColor(storeCustomHighlightColor);
      if (storeOverlayColor) setOverlayColor(storeOverlayColor);
      if (typeof storeOverlayOpacity === "number")
        setOverlayOpacity(storeOverlayOpacity);
      if (typeof storeCacheEnabled !== "undefined")
        setCacheEnabled(!!storeCacheEnabled);
    } finally {
      canSyncRef.current = true;
    }
  }, [
    mounted,
    storeScriptId,
    storeText,
    storeFontSize,
    storeLineHeight,
    storeMirrorH,
    storeMirrorV,
    storePreset,
    storeSpeed,
    storeDefaultSpeed,
    storeFontFace,
    storeCustomTextColor,
    storeCustomBgColor,
    storeCustomHighlightColor,
    storeOverlayColor,
    storeOverlayOpacity,
    storeCacheEnabled,
  ]);
  const shellProps = {
    containerRef: (el: HTMLDivElement | null) => {
      (fsRef as any).current = el;
      (autoHideRef as any).current = el;
      viewportRef.current = el;
    },
    currentRef: (el: HTMLDivElement | null) => (currentRef.current = el),
    scrollRef: (el: HTMLDivElement | null) => (scrollRef.current = el),
    onFocus: () => setViewportHasFocus(true),
    onBlur: () => setViewportHasFocus(false),
    fullscreen,
    showFsControls,
    onToggleFullscreen: toggleFullscreen,
    index,
    theme: preset !== "custom" ? (preset as any) : "custom",
    custom:
      preset === "custom"
        ? {
            textColor: customTextColor,
            bgColor: customBgColor,
            highlightColor: customHighlightColor,
          }
        : undefined,
    font: {
      sizeClass: fontSize,
      lineHeightClass: lineHeight,
      face: fontFace as any,
    },
    mirror: { h: mirrorH, v: mirrorV },
    overlay: { color: overlayColor, opacity: overlayOpacity },
    showLegend,
    countdown: {
      enabled: playing,
      totalMs: plannedMsForCurrentLine,
      startedAt: lineStartedAt ?? undefined,
      segments: countdownSegments,
    },
    legendDurations: {
      pauseMs: cuePauseMs,
      breatheMs: cueBreatheMs,
      lookupMs: cueLookupMs,
    },
    showSegmentBar,
  };
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-2 md:px-0">
      <TeleprompterHeader
        onImportOpen={() => setImportOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onToggleLegend={() => setShowLegend((v) => !v)}
        showLegend={showLegend}
        onToggleFullscreen={toggleFullscreen}
        fullscreen={fullscreen}
        onToggleMobileControls={() => setMobileControlsVisible((v) => !v)}
        mobileControlsVisible={mobileControlsVisible}
      />

      <TeleprompterScriptCard
        scriptId={scriptId}
        text={text}
        setText={setText}
        onReset={() => setText(SCRIPTS[scriptId])}
        onCopy={() => navigator.clipboard?.writeText(text)}
        onExportTxt={() => {
          const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "script.txt";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 0);
        }}
        onExportMd={() => {
          const md = `# Teleprompter Script\n\n` + text;
          const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "script.md";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 0);
        }}
        playing={playing}
        onPlayToggle={togglePlay}
        onPrev={prev}
        onNext={next}
        onRewind={rewind}
        progressPct={progressPct}
        elapsedMs={elapsedMs}
        totalMs={totalMs}
        humanTime={humanTime}
        speed={speed}
        onSpeedChange={setSpeed}
        mobileControlsVisible={mobileControlsVisible}
        mounted={mounted}
        shellProps={shellProps}
        viewportHasFocus={viewportHasFocus}
        viewportHintDismissed={viewportHintDismissed}
        onDismissViewportHint={() => {
          setViewportHintDismissed(true);
          try {
            localStorage.setItem("teleprompter.viewportHintDismissed", "1");
          } catch (error) {
            console.warn(
              "[teleprompter] failed to persist viewport hint",
              error,
            );
          }
        }}
        fullscreen={fullscreen}
        isMobile={isMobile}
        isPortrait={isPortrait}
        orientationHintDismissed={orientationHintDismissed}
        onDismissOrientationHint={() => setOrientationHintDismissed(true)}
      />

      <TeleprompterImportDrawer
        open={importOpen}
        onOpenChange={setImportOpen}
        onApplyText={(t) => {
          setText(t);
          setIndex(0);
        }}
        cacheEnabled={cacheEnabled}
        onCacheEnabledChange={(v) => setCacheEnabled(v)}
        onSaveNow={() => bumpRev()}
        builtinScripts={useMemo(
          () =>
            TELEPROMPTER_SCRIPT_META.map((m) => ({
              id: m.id,
              label: m.label,
              content: SCRIPTS[m.id],
            })),
          [],
        )}
        onApplyBuiltin={(id, text) => {
          setScriptId(id as ScriptId);
          setText(text);
          setIndex(0);
        }}
        onFetchDispatch={async (dispatchId) => {
          const client = getSupabaseBrowserClient();
          const { data, error } = await client
            .from("dispatch_submissions")
            .select("*, intended_action_notes, notes, summary, briefing")
            .eq("id", dispatchId)
            .maybeSingle();
          if (error) throw error;
          const d: any = data;
          const candidate =
            d?.briefing || d?.intended_action_notes || d?.summary || d?.notes;
          return {
            text: typeof candidate === "string" ? candidate : undefined,
            title: undefined,
          };
        }}
        onFetchAcademy={async (slug) => {
          const client = getSupabaseBrowserClient();
          let res = await client
            .from("academy_lessons")
            .select("content_md, content, body_md, body, title")
            .eq("slug", slug)
            .maybeSingle();
          if (res.error && res.error.code === "PGRST116") {
            res = await client
              .from("lessons")
              .select("content_md, content, body_md, body, title")
              .eq("slug", slug)
              .maybeSingle();
          }
          if (res.error) throw res.error;
          const d: any = res.data;
          const candidate =
            d?.content_md || d?.body_md || d?.content || d?.body;
          return {
            text: typeof candidate === "string" ? candidate : undefined,
            title: d?.title,
          };
        }}
        onScriptBuilderOpen={() => {
          try {
            window.open("/script-builder", "_blank", "noopener");
          } catch {
            router.push("/script-builder");
          }
        }}
      />

      <TeleprompterSettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        fontFace={fontFace as any}
        onFontFaceChange={(v) => setFontFace(v)}
        preset={preset as any}
        onPresetChange={(v) => setPreset(v)}
        customTextColor={customTextColor}
        onCustomTextColorChange={setCustomTextColor}
        customBgColor={customBgColor}
        onCustomBgColorChange={setCustomBgColor}
        customHighlightColor={customHighlightColor}
        onCustomHighlightColorChange={setCustomHighlightColor}
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
        onOverlayColorChange={setOverlayColor}
        onOverlayOpacityChange={setOverlayOpacity}
        onResetKeyboardHint={() => {
          try {
            localStorage.removeItem("teleprompter.viewportHintDismissed");
          } catch (error) {
            console.warn("[teleprompter] failed to reset viewport hint", error);
          }
          setViewportHintDismissed(false);
        }}
        defaultSpeed={defaultSpeed}
        onDefaultSpeedChange={setDefaultSpeed}
        onApplyDefaultSpeed={() => {
          setSpeed(defaultSpeed);
          bumpRev();
        }}
        onResetDefaultSpeed={() => {
          const v = SPEED_PRESETS.standard.value;
          setDefaultSpeed(v);
          setSpeed(v);
          bumpRev();
        }}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
        mirrorH={mirrorH}
        onMirrorHChange={(v) => setMirrorH(v)}
        mirrorV={mirrorV}
        onMirrorVChange={(v) => setMirrorV(v)}
      />
    </div>
  );
}

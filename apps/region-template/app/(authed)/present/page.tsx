"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
// Removed unused local UI imports (moved into shared components)
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
// import { Switch } from "@workspace/ui/components/switch";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import TeleprompterShell from "@workspace/ui/components/TeleprompterShell";
import KeyboardHint from "@workspace/ui/components/KeyboardHint";
import OrientationHint from "@workspace/ui/components/OrientationHint";
import TeleprompterSettings from "@workspace/ui/components/TeleprompterSettings";
import QuickActionsCard from "@workspace/ui/components/QuickActionsCard";
import TeleprompterImportContent from "@workspace/ui/components/TeleprompterImportContent";
import { useFullscreenElement } from "@workspace/ui/hooks/use-fullscreen-element";
import { useAutoHide } from "@workspace/ui/hooks/use-auto-hide";
import { useViewportInfo } from "@workspace/ui/hooks/use-viewport-info";
import { BASE_MS_PER_CHAR, SPEED_PRESETS, PresetId, computeLineMsOrdered, estimateTotalMsOrdered, segmentsForLine as segmentsForLineShared } from "@workspace/ui/lib/teleprompter";
import { useTeleprompterEngine } from "@workspace/ui/hooks/use-teleprompter-engine";
import { useTeleprompterHotkeys } from "@workspace/ui/hooks/use-teleprompter-hotkeys";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { useTeleprompterStore } from "@workspace/store/useTeleprompterStore";
import { TransportControls, SpeedControl } from "@workspace/ui/components/teleprompter-controls";
import { TELEPROMPTER_SCRIPTS as SCRIPTS, TELEPROMPTER_SCRIPT_META, TeleprompterScriptId as ScriptId } from "@/data/teleprompter-scripts";

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
  const storeCustomHighlightColor = useTeleprompterStore((s) => s.customHighlightColor);
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
  const s_setCustomTextColor = useTeleprompterStore((s) => s.setCustomTextColor);
  const s_setCustomBgColor = useTeleprompterStore((s) => s.setCustomBgColor);
  const s_setCustomHighlightColor = useTeleprompterStore((s) => s.setCustomHighlightColor);
  const s_setOverlayColor = useTeleprompterStore((s) => s.setOverlayColor);
  const s_setOverlayOpacity = useTeleprompterStore((s) => s.setOverlayOpacity);
  const s_setCacheEnabled = useTeleprompterStore((s) => s.setCacheEnabled);

  // Local UI defaults (stable for SSR); rehydrate from store after mount to avoid hydration mismatches
  const [scriptId, setScriptId] = React.useState<ScriptId>("full_narrative");
  const [text, setText] = React.useState<string>(SCRIPTS["full_narrative"]);
  const [fontSize, setFontSize] = React.useState<string>("text-xl");
  const [lineHeight, setLineHeight] = React.useState<string>("leading-8");
  const [mirrorH, setMirrorH] = React.useState<boolean>(false);
  const [mirrorV, setMirrorV] = React.useState<boolean>(false);
  const [preset, setPreset] = React.useState<PresetId>("briefing");
  const [speed, setSpeed] = React.useState<number>(1); // 0.25..2
  const [importOpen, setImportOpen] = React.useState<boolean>(false);
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);
  const [showLegend, setShowLegend] = React.useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [fontFace, setFontFace] = React.useState<string>("sans"); // sans|serif|mono|dyslexic
  const [customTextColor, setCustomTextColor] = React.useState<string>("#e5e7eb");
  const [customBgColor, setCustomBgColor] = React.useState<string>("#0b0f18");
  const [customHighlightColor, setCustomHighlightColor] = React.useState<string>("#22d3ee");
  const [overlayColor, setOverlayColor] = React.useState<string>("#000000");
  const [overlayOpacity, setOverlayOpacity] = React.useState<number>(0);
  const [defaultSpeed, setDefaultSpeed] = React.useState<number>(1);
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
  const currentRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportHasFocus, setViewportHasFocus] = React.useState<boolean>(false);
  const [viewportHintDismissed, setViewportHintDismissed] = React.useState<boolean>(false);
  const [cacheEnabled, setCacheEnabled] = React.useState<boolean>(true);
  // line countdown handled by engine
  const [mobileControlsVisible, setMobileControlsVisible] = React.useState<boolean>(true);
  const [showFsControls, setShowFsControls] = React.useState<boolean>(true);
  const [orientationHintDismissed, setOrientationHintDismissed] = React.useState<boolean>(false);
  // Defer store syncing until after we rehydrate from persisted values
  const canSyncRef = React.useRef(false);
  // Sync local state to persisted store (only after rehydration completes)
  React.useEffect(() => { if (canSyncRef.current) s_setText(text); }, [text, s_setText]);
  React.useEffect(() => { if (canSyncRef.current) s_setScriptId(scriptId); }, [scriptId, s_setScriptId]);
  React.useEffect(() => { if (canSyncRef.current) s_setFontSize(fontSize); }, [fontSize, s_setFontSize]);
  React.useEffect(() => { if (canSyncRef.current) s_setLineHeight(lineHeight); }, [lineHeight, s_setLineHeight]);
  React.useEffect(() => { if (canSyncRef.current) s_setMirrorH(mirrorH); }, [mirrorH, s_setMirrorH]);
  React.useEffect(() => { if (canSyncRef.current) s_setMirrorV(mirrorV); }, [mirrorV, s_setMirrorV]);
  React.useEffect(() => { if (canSyncRef.current) s_setPreset(preset); }, [preset, s_setPreset]);
  React.useEffect(() => { if (canSyncRef.current) s_setSpeed(speed); }, [speed, s_setSpeed]);
  React.useEffect(() => { if (canSyncRef.current) s_setDefaultSpeed(defaultSpeed); }, [defaultSpeed, s_setDefaultSpeed]);
  React.useEffect(() => { if (canSyncRef.current) s_setFontFace(fontFace); }, [fontFace, s_setFontFace]);
  React.useEffect(() => { if (canSyncRef.current) s_setCustomTextColor(customTextColor); }, [customTextColor, s_setCustomTextColor]);
  React.useEffect(() => { if (canSyncRef.current) s_setCustomBgColor(customBgColor); }, [customBgColor, s_setCustomBgColor]);
  React.useEffect(() => { if (canSyncRef.current) s_setCustomHighlightColor(customHighlightColor); }, [customHighlightColor, s_setCustomHighlightColor]);
  React.useEffect(() => { if (canSyncRef.current) s_setOverlayColor(overlayColor); }, [overlayColor, s_setOverlayColor]);
  React.useEffect(() => { if (canSyncRef.current) s_setOverlayOpacity(overlayOpacity); }, [overlayOpacity, s_setOverlayOpacity]);
  React.useEffect(() => { if (canSyncRef.current) s_setCacheEnabled(cacheEnabled); }, [cacheEnabled, s_setCacheEnabled]);
  // Built-in import content is now handled by shared UI component; no local sync needed

  const computeLineMsFn = React.useCallback((ln: string, spd: number) =>
    computeLineMsOrdered(ln, spd, {
      baseMsPerChar: BASE_MS_PER_CHAR,
      pauseMs: cuePauseMs,
      breatheMs: cueBreatheMs,
      lookupMs: cueLookupMs,
      minLineMs: 300,
    })
    , [cuePauseMs, cueBreatheMs, cueLookupMs]);

  const engine = useTeleprompterEngine(text, speed, computeLineMsFn);
  const { index, setIndex, playing, togglePlay, next, prev, rewind, progressPct, elapsedMs, plannedMsForCurrentLine, lineStartedAt } = engine;

  const open = (href: string) => router.push(href);

  const lines = React.useMemo(() => text.split(/\r?\n/), [text]);

  const totalMs = React.useMemo(() => estimateTotalMsOrdered(text, speed, {
    baseMsPerChar: BASE_MS_PER_CHAR,
    pauseMs: cuePauseMs,
    breatheMs: cueBreatheMs,
    lookupMs: cueLookupMs,
    minLineMs: 300,
  }), [text, speed, cuePauseMs, cueBreatheMs, cueLookupMs]);

  const humanTime = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const countdownSegments = React.useMemo(
    () => segmentsForLineShared(lines[index] ?? '', speed, {
      baseMsPerChar: BASE_MS_PER_CHAR,
      pauseMs: cuePauseMs,
      breatheMs: cueBreatheMs,
      lookupMs: cueLookupMs,
      minLineMs: 300,
    }),
    [lines, index, speed, cuePauseMs, cueBreatheMs, cueLookupMs]
  );

  const { ref: fsRef, isFullscreen, toggle: toggleFs } = useFullscreenElement<HTMLDivElement>();
  React.useEffect(() => { setFullscreen(isFullscreen); }, [isFullscreen]);
  const toggleFullscreen = React.useCallback(async () => {
    try {
      await toggleFs();
    } catch (err) {
      console.warn("Toggle fullscreen failed", err);
    }
  }, [toggleFs]);

  const { isMobile, isPortrait } = useViewportInfo(768);

  const { visible: fsVisible, containerRef: autoHideRef } = useAutoHide(3000);
  React.useEffect(() => { setShowFsControls(fullscreen ? fsVisible : false); }, [fullscreen, fsVisible]);

  React.useEffect(() => {
    if (!fullscreen) return;
    const t = window.setTimeout(() => {
      try {
        const el = viewportRef.current;
        if (!el) return;
        const activeEl = (typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);
        if (activeEl) {
          const tag = activeEl.tagName;
          const isEditable = activeEl.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || activeEl.getAttribute('role') === 'textbox';
          if (isEditable) return;
        }
        el.focus({ preventScroll: true } as FocusOptions);
      } catch (err) {
        console.warn("Viewport focus failed", err);
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

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('teleprompter.viewportHintDismissed');
      if (v === '1') setViewportHintDismissed(true);
    } catch (err) {
      console.warn("Failed to read viewport hint dismissal", err);
    }
  }, []);

  const focusViewport = React.useCallback(() => {
    try {
      const el = viewportRef.current;
      if (!el) return;
      const activeEl = (typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);
      if (activeEl) {
        const tag = activeEl.tagName;
        const isEditable =
          activeEl.isContentEditable ||
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          activeEl.getAttribute('role') === 'textbox';
        if (isEditable) return; // don't steal focus while typing
      }
      el.focus({ preventScroll: true } as FocusOptions);
    } catch (err) {
      console.warn("Failed to focus viewport", err);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (!importOpen && !settingsOpen) focusViewport();
  }, [mounted, focusViewport, importOpen, settingsOpen]);

  React.useEffect(() => {
    if (!mounted) return;
    if (!importOpen && !settingsOpen) {
      const t = window.setTimeout(() => focusViewport(), 120);
      return () => window.clearTimeout(t);
    }
  }, [importOpen, settingsOpen, mounted, focusViewport]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      if (storeScriptId) setScriptId(storeScriptId as ScriptId);
      if (storeText) setText(storeText);
      if (storeFontSize) setFontSize(storeFontSize);
      if (storeLineHeight) setLineHeight(storeLineHeight);
      if (typeof storeMirrorH !== 'undefined') setMirrorH(!!storeMirrorH);
      if (typeof storeMirrorV !== 'undefined') setMirrorV(!!storeMirrorV);
      if (storePreset) setPreset(storePreset as PresetId);
      if (typeof storeSpeed === 'number') setSpeed(storeSpeed);
      if (typeof storeDefaultSpeed === 'number') setDefaultSpeed(storeDefaultSpeed);
      if (storeFontFace) setFontFace(storeFontFace);
      if (storeCustomTextColor) setCustomTextColor(storeCustomTextColor);
      if (storeCustomBgColor) setCustomBgColor(storeCustomBgColor);
      if (storeCustomHighlightColor) setCustomHighlightColor(storeCustomHighlightColor);
      if (storeOverlayColor) setOverlayColor(storeOverlayColor);
      if (typeof storeOverlayOpacity === 'number') setOverlayOpacity(storeOverlayOpacity);
      if (typeof storeCacheEnabled !== 'undefined') setCacheEnabled(!!storeCacheEnabled);
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

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-2 md:px-0">
      <div className="flex flex-col gap-2 md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Teleprompter</h1>
        <hr className="border-t border-gray-200" />
        <div className="grid w-full md:flex-1 grid-cols-2 md:grid-cols-4 gap-2">
          <Button className="w-full" variant="outline" onClick={() => setImportOpen(true)}>Load Script</Button>
          <Button className="w-full" variant="outline" onClick={() => setShowLegend((v) => !v)}>{showLegend ? "Hide Cues" : "Show Cues"}</Button>
          <Button className="w-full" variant="outline" onClick={toggleFullscreen}>{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</Button>
          <Button className="w-full" variant="outline" onClick={() => setSettingsOpen(true)}>Settings</Button>
          <Button className="w-full md:hidden" variant="outline" onClick={() => setMobileControlsVisible((v) => !v)}>
            {mobileControlsVisible ? "Hide Controls" : "Show Controls"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col gap-2 w-full">
            <CardTitle>Script</CardTitle>
            <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
              <Button className="w-full" variant="outline" onClick={() => setText(SCRIPTS[scriptId])}>Reset</Button>
              <Button className="w-full" variant="light" onClick={() => navigator.clipboard?.writeText(text)}>Copy</Button>
              <Button className="w-full" variant="outline" onClick={() => {
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "script.txt"; a.click();
                setTimeout(() => URL.revokeObjectURL(url), 0);
              }}>Export .txt</Button>
              <Button className="w-full" variant="outline" onClick={() => {
                const md = `# Teleprompter Script\n\n` + text;
                const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "script.md"; a.click();
                setTimeout(() => URL.revokeObjectURL(url), 0);
              }}>Export .md</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Playback controls */}
          <div className={`mb-2 flex flex-wrap items-center gap-2 md:gap-3 ${mobileControlsVisible ? '' : 'hidden'} md:flex`}>
            {/* Primary transport controls - equal sizing */}
            <TransportControls
              className="mb-2 md:flex-1"
              playing={playing}
              onPlayToggle={togglePlay}
              onPrev={prev}
              onNext={next}
              onRewind={rewind}
            />
            <div className="ml-auto hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-40 overflow-hidden rounded bg-muted">
                <div className="h-2 bg-primary" style={{ width: `${progressPct}%` }} />
              </div>
              <span suppressHydrationWarning>
                {mounted ? `${humanTime(elapsedMs)} / ~${humanTime(totalMs)}` : "--:-- / ~--:--"}
              </span>
            </div>
          </div>

          {/* Speed row - separate line with equal-width treatment */}
          <div className={`${mobileControlsVisible ? '' : 'hidden'} md:block mb-2`}>
            <SpeedControl value={speed} onChange={setSpeed} />
          </div>

          {/* Reader viewport via shell */}
          <TeleprompterShell
            containerRef={(el) => {
              (fsRef as any).current = el as HTMLDivElement | null;
              (autoHideRef as any).current = el as HTMLDivElement | null;
              viewportRef.current = el as HTMLDivElement | null;
            }}
            currentRef={(el) => (currentRef.current = el)}
            scrollRef={(el) => (scrollRef.current = el)}
            onFocus={() => setViewportHasFocus(true)}
            onBlur={() => setViewportHasFocus(false)}
            fullscreen={fullscreen}
            showFsControls={showFsControls}
            onToggleFullscreen={toggleFullscreen}
            playing={playing}
            onPlayToggle={togglePlay}
            onPrev={prev}
            onNext={next}
            onRewind={rewind}
            progressPct={progressPct}
            speed={speed}
            onSpeedChange={setSpeed}
            text={text}
            index={index}
            theme={preset !== "custom" ? (preset as any) : "custom"}
            custom={preset === "custom" ? { textColor: customTextColor, bgColor: customBgColor, highlightColor: customHighlightColor } : undefined}
            font={{ sizeClass: fontSize, lineHeightClass: lineHeight, face: fontFace as any }}
            mirror={{ h: mirrorH, v: mirrorV }}
            overlay={{ color: overlayColor, opacity: overlayOpacity }}
            showLegend={showLegend}
            countdown={{ enabled: playing, totalMs: plannedMsForCurrentLine, startedAt: lineStartedAt ?? undefined, segments: countdownSegments }}
            legendDurations={{ pauseMs: cuePauseMs, breatheMs: cueBreatheMs, lookupMs: cueLookupMs }}
            showSegmentBar={showSegmentBar}
            overlays={
              <>
                {mounted && !viewportHasFocus && !playing && !viewportHintDismissed && (
                  <KeyboardHint
                    show
                    onDismiss={() => {
                      setViewportHintDismissed(true);
                      try {
                        localStorage.setItem('teleprompter.viewportHintDismissed', '1');
                      } catch (err) {
                        console.warn("Failed to persist viewport hint dismissal", err);
                      }
                    }}
                  >
                    Press Space to play (focus viewport first)
                  </KeyboardHint>
                )}
                {mounted && fullscreen && isMobile && isPortrait && !orientationHintDismissed && (
                  <OrientationHint
                    show
                    onDismiss={() => setOrientationHintDismissed(true)}
                  />
                )}
              </>
            }
          />
        </CardContent>
      </Card>

      <QuickActionsCard
        sections={[
          {
            title: "1) Watch → Create Scout Dispatch",
            actions: [
              { label: "Open Watch", onClick: () => open("/watch") },
              { label: "Open Team Request (Scout)", variant: "outline", onClick: () => open("/team-req?eventType=scout_check") },
            ],
          },
          {
            title: "2) Dispatch Comms",
            actions: [
              { label: "Open Dispatches", variant: "outline", onClick: () => open("/dispatches") },
              { label: "Open Schedules", variant: "outline", onClick: () => open("/schedules") },
            ],
          },
          {
            title: "3) Missing Persons Intake & Finalize",
            actions: [
              { label: "Open Intake", onClick: () => open("/missing-persons/intake") },
              { label: "Directory", variant: "outline", onClick: () => open("/missing-persons") },
            ],
          },
          {
            title: "4) Family Care",
            actions: [
              { label: "Open Meet‑A‑Need", onClick: () => open("/meet-a-need") },
            ],
          },
        ]}
      />

      {/* Import Drawer */}
      <Drawer open={importOpen} onOpenChange={setImportOpen}>
        <DrawerContent className="max-w-3xl bg-card text-card-foreground m-auto">
          <DrawerHeader>
            <DrawerTitle>Load Script</DrawerTitle>
            <DrawerDescription>Import a script from a file or paste text. Markdown and TXT supported.</DrawerDescription>
          </DrawerHeader>
          <TeleprompterImportContent
            onApplyText={(t) => { setText(t); setIndex(0); }}
            cacheEnabled={cacheEnabled}
            onCacheEnabledChange={(v) => setCacheEnabled(v)}
            onSaveNow={() => bumpRev()}
            builtinScripts={TELEPROMPTER_SCRIPT_META.map((m) => ({ id: m.id, label: m.label, content: SCRIPTS[m.id] }))}
            onApplyBuiltin={(id, text) => { setScriptId(id as ScriptId); setText(text); setIndex(0); }}
            onFetchDispatch={async (dispatchId) => {
              const client = getSupabaseBrowserClient();
              const { data, error } = await client
                .from("dispatch_submissions")
                .select("*, intended_action_notes, notes, summary, briefing")
                .eq("id", dispatchId)
                .maybeSingle();
              if (error) throw error;
              const d: any = data;
              const candidate = d?.briefing || d?.intended_action_notes || d?.summary || d?.notes;
              return { text: typeof candidate === 'string' ? candidate : undefined, title: undefined };
            }}
            onFetchAcademy={async (slug) => {
              const client = getSupabaseBrowserClient();
              let res = await client.from("academy_lessons").select("content_md, content, body_md, body, title").eq("slug", slug).maybeSingle();
              if (res.error && res.error.code === "PGRST116") {
                res = await client.from("lessons").select("content_md, content, body_md, body, title").eq("slug", slug).maybeSingle();
              }
              if (res.error) throw res.error;
              const d: any = res.data;
              const candidate = d?.content_md || d?.body_md || d?.content || d?.body;
              return { text: typeof candidate === 'string' ? candidate : undefined, title: d?.title };
            }}
          />
          <DrawerFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)}>Close</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  try { window.open('/script-builder', '_blank', 'noopener'); } catch { router.push('/script-builder'); }
                }}
                title="Open the Script Builder in a new tab"
              >
                Create Script ↗
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent className="max-w-3xl bg-card text-card-foreground m-auto">
          <DrawerHeader>
            <DrawerTitle>Teleprompter settings</DrawerTitle>
            <DrawerDescription>Font face, colors, overlay, defaults.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 p-4">
            <TeleprompterSettings
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
                  localStorage.removeItem('teleprompter.viewportHintDismissed');
                } catch (err) {
                  console.warn("Failed to reset viewport hint flag", err);
                }
                setViewportHintDismissed(false);
              }}
              defaultSpeed={defaultSpeed}
              onDefaultSpeedChange={setDefaultSpeed}
              onApplyDefaultSpeed={() => { setSpeed(defaultSpeed); bumpRev(); }}
              onResetDefaultSpeed={() => { const v = SPEED_PRESETS.standard.value; setDefaultSpeed(v); setSpeed(v); bumpRev(); }}
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
          <DrawerFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

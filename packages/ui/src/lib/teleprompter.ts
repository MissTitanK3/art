export const BASE_MS_PER_CHAR = 40;

export type PresetId = 'briefing' | 'studio' | 'night' | 'custom';

export const TELEPROMPTER_PRESETS: Record<PresetId, { cls: string; highlightCls: string; nextCls: string }> = {
  briefing: {
    cls: 'bg-white text-black dark:bg-zinc-950 dark:text-zinc-50',
    highlightCls: 'text-primary font-semibold',
    nextCls: 'text-muted-foreground',
  },
  studio: {
    cls: 'bg-background text-foreground',
    highlightCls: 'text-foreground font-bold',
    nextCls: 'text-muted-foreground',
  },
  night: {
    cls: 'bg-black text-cyan-300',
    highlightCls: 'text-cyan-200 font-semibold',
    nextCls: 'text-cyan-700',
  },
  custom: {
    cls: 'bg-transparent text-inherit',
    highlightCls: 'text-inherit font-semibold',
    nextCls: 'opacity-80',
  },
};

export type SpeedPresetId = 'impact' | 'slow' | 'standard' | 'fast' | 'quick';

export const SPEED_PRESETS: Record<SpeedPresetId, { label: string; value: number }> = {
  impact: { label: 'Impactful slow', value: 0.6 },
  slow: { label: 'Slow', value: 0.8 },
  standard: { label: 'Standard', value: 1.0 },
  fast: { label: 'Fast', value: 1.3 },
  quick: { label: 'Quick', value: 1.6 },
};

export const closestSpeedPresetId = (v: number): SpeedPresetId => {
  const entries = Object.entries(SPEED_PRESETS) as Array<[SpeedPresetId, { label: string; value: number }]>;
  let best: SpeedPresetId = 'standard';
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const [id, preset] of entries) {
    const d = Math.abs(v - preset.value);
    if (d < bestDiff) {
      best = id;
      bestDiff = d;
    }
  }
  return best;
};

export type CueChunk = { t: 'text' | 'pause' | 'lookup' | 'breathe'; v: string };

export const parseCues = (ln: string): CueChunk[] => {
  const parts: CueChunk[] = [];
  let rest = ln ?? '';
  const pattern = /\[(pause|look up|breathe)\]/i;
  while (rest.length) {
    const m = rest.match(pattern);
    if (!m) {
      parts.push({ t: 'text', v: rest });
      break;
    }
    const idx = m.index ?? 0;
    if (idx > 0) parts.push({ t: 'text', v: rest.slice(0, idx) });
    const cue = (m[1] || '').toLowerCase();
    if (cue === 'pause') parts.push({ t: 'pause', v: '[pause]' });
    else if (cue === 'look up') parts.push({ t: 'lookup', v: '[look up]' });
    else if (cue === 'breathe') parts.push({ t: 'breathe', v: '[breathe]' });
    rest = rest.slice((m.index ?? 0) + m[0].length);
  }
  return parts;
};

export const humanTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};

export const computeLineMs = (line: string, spd: number, baseMsPerChar: number = BASE_MS_PER_CHAR) => {
  let ms = Math.max(300, (Math.max(1, (line ?? '').trim().length) * baseMsPerChar) / Math.max(0.25, spd));
  if (/\[pause\]/i.test(line)) ms += 600;
  if (/\[breathe\]/i.test(line)) ms += 300;
  if (/[\[look up\]]/i.test(line)) ms += 1200;
  return ms;
};

export const estimateTotalMs = (text: string, spd: number, baseMsPerChar: number = BASE_MS_PER_CHAR) => {
  const lines = (text ?? '').split(/\r?\n/);
  const totalChars = lines.reduce((acc, l) => acc + Math.max(1, l.trim().length), 0);
  return Math.max(1, (totalChars * baseMsPerChar) / Math.max(0.25, spd));
};

// Advanced cue-aware timing (ordered segments with configurable durations)
export type LineToken =
  | { kind: 'text'; text: string }
  | { kind: 'cue'; cue: 'pause' | 'breathe' | 'lookup' | 'custom' };

export const tokenizeLine = (ln: string): LineToken[] => {
  const tokens: LineToken[] = [];
  let i = 0;
  const s = ln ?? '';
  const re = /\[(.+?)\]/g; // any bracket cue
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > i) tokens.push({ kind: 'text', text: s.slice(i, start) });
    const raw = (m[1] || '').trim().toLowerCase();
    let cue: 'pause' | 'breathe' | 'lookup' | 'custom' = 'custom';
    if (raw === 'pause') cue = 'pause';
    else if (raw === 'breathe') cue = 'breathe';
    else if (raw === 'look up') cue = 'lookup';
    tokens.push({ kind: 'cue', cue });
    i = end;
  }
  if (i < s.length) tokens.push({ kind: 'text', text: s.slice(i) });
  if (!tokens.length) tokens.push({ kind: 'text', text: s });
  return tokens;
};

export type Segment = { name: 'base' | 'pause' | 'breathe' | 'lookup' | 'custom'; durationMs: number };

export type SegmentConfig = {
  baseMsPerChar?: number;
  pauseMs?: number;
  breatheMs?: number;
  lookupMs?: number;
  minLineMs?: number;
};

export const segmentsForLine = (ln: string, spd: number, cfg: SegmentConfig = {}): Segment[] => {
  const baseMsPerChar = cfg.baseMsPerChar ?? BASE_MS_PER_CHAR;
  const pauseMs = cfg.pauseMs ?? 600;
  const breatheMs = cfg.breatheMs ?? 300;
  const lookupMs = cfg.lookupMs ?? 1200;
  const minLineMs = cfg.minLineMs ?? 300;

  const tokens = tokenizeLine(ln);
  const segs: Segment[] = [];
  let total = 0;
  for (const t of tokens) {
    if (t.kind === 'text') {
      const chars = Math.max(1, (t.text ?? '').trim().length);
      const ms = (chars * baseMsPerChar) / Math.max(0.25, spd);
      if (ms > 0) {
        segs.push({ name: 'base', durationMs: ms });
        total += ms;
      }
    } else {
      let ms = 0;
      if (t.cue === 'pause') ms = pauseMs;
      else if (t.cue === 'breathe') ms = breatheMs;
      else if (t.cue === 'lookup') ms = lookupMs;
      else ms = 250; // default for custom/unrecognized cues
      if (ms > 0) {
        segs.push({ name: t.cue, durationMs: ms });
        total += ms;
      }
    }
  }
  if (total < minLineMs) {
    const pad = minLineMs - total;
    const firstBase = segs.find((s) => s.name === 'base');
    if (firstBase) firstBase.durationMs += pad;
    else segs.unshift({ name: 'base', durationMs: pad });
  }
  return segs;
};

export const computeLineMsOrdered = (line: string, spd: number, cfg: SegmentConfig = {}) =>
  segmentsForLine(line, spd, cfg).reduce((a, s) => a + s.durationMs, 0);

export const estimateTotalMsOrdered = (text: string, spd: number, cfg: SegmentConfig = {}) => {
  const ls = (text ?? '').split(/\r?\n/);
  return ls.reduce((acc, ln) => acc + computeLineMsOrdered(ln, spd, cfg), 0);
};

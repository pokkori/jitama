import { useRef, useCallback } from "react";

/**
 * 和風BGM: 琴風（三角波）+ 尺八風（サイン波）+ 和太鼓
 * BPM 90、ニ短調ペンタトニック
 * 外部ファイル不要（Web Audio API 完結）
 */

// D minor pentatonic: D E F A C
// BPM 90 → 1拍 = 667ms
const BPM = 90;
const BEAT = 60 / BPM; // 0.667s

// ペンタトニックスケール (Hz) — D3〜D5
const PENTA = [
  146.83, // D3
  164.81, // E3
  174.61, // F3
  220.00, // A3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  440.00, // A4
  523.25, // C5
  587.33, // D5
];

// 琴メロディーパターン（拍インデックス × PENTAインデックス）
const KOTO_MELODY = [
  6, 8, 7, 5, 6, 4, 5, 3,
  6, 8, 10, 8, 6, 5, 4, 3,
];

// コード進行（D minor: Dm / Am / F / C）
const CHORD_ROOTS = [146.83, 220.00, 174.61, 261.63];

export function useKanjiBGM() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBeatRef = useRef<number>(0);
  const beatIndexRef = useRef<number>(0);
  const mutedRef = useRef<boolean>(false);
  const runningRef = useRef<boolean>(false);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => { /* noop */ });
    }
    return ctxRef.current;
  }, []);

  const note = useCallback(
    (
      freq: number,
      type: OscillatorType,
      startTime: number,
      duration: number,
      vol: number,
      detune = 0
    ) => {
      try {
        const ctx = getCtx();
        const gain = ctx.createGain();
        gain.connect(masterGainRef.current ?? ctx.destination);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(gain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      } catch { /* silent fail */ }
    },
    [getCtx]
  );

  const scheduleBeat = useCallback(() => {
    if (!runningRef.current) return;
    const ctx = getCtx();
    const lookAhead = 0.12; // 秒
    const scheduleInterval = 80; // ms

    while (nextBeatRef.current < ctx.currentTime + lookAhead) {
      const t = nextBeatRef.current;
      const bi = beatIndexRef.current;
      const bar = Math.floor(bi / 16);
      const bInBar = bi % 16;

      if (!mutedRef.current) {
        // --- 琴（三角波・メロディ）---
        const kotoFreq = PENTA[KOTO_MELODY[bInBar]];
        note(kotoFreq, "triangle", t, BEAT * 0.7, 0.22);
        // オクターブ上で薄く重ねる（琴の倍音感）
        if (bInBar % 4 === 0) {
          note(kotoFreq * 2, "triangle", t, BEAT * 0.4, 0.08);
        }

        // --- 尺八（サイン波・コード感）BPM 2拍ごと ---
        if (bInBar % 2 === 0) {
          const chordRoot = CHORD_ROOTS[Math.floor(bInBar / 4) % 4];
          note(chordRoot, "sine", t, BEAT * 1.8, 0.14, -8);
          note(chordRoot * 1.5, "sine", t + 0.03, BEAT * 1.6, 0.09);
        }

        // --- 和太鼓（ノイズ近似・4拍ごと）---
        if (bInBar % 4 === 0) {
          // 低周波バーストで太鼓感
          note(80, "sawtooth", t, 0.08, 0.35);
          note(60, "triangle", t, 0.12, 0.25);
        }
        // 裏拍（8拍ごと）に小太鼓
        if (bInBar % 8 === 4) {
          note(160, "sawtooth", t, 0.05, 0.18);
        }
      }

      nextBeatRef.current += BEAT;
      beatIndexRef.current = (bi + 1) % (16 * 4); // 4小節ループ
    }

    schedulerTimerRef.current = setTimeout(scheduleBeat, scheduleInterval);
  }, [getCtx, note]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    try {
      const ctx = getCtx();
      const master = ctx.createGain();
      master.gain.value = 0.65;
      master.connect(ctx.destination);
      masterGainRef.current = master;
      runningRef.current = true;
      nextBeatRef.current = ctx.currentTime + 0.1;
      beatIndexRef.current = 0;
      scheduleBeat();
    } catch { /* silent fail */ }
  }, [getCtx, scheduleBeat]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (masterGainRef.current) {
      try {
        masterGainRef.current.gain.exponentialRampToValueAtTime(
          0.001,
          (ctxRef.current?.currentTime ?? 0) + 0.3
        );
      } catch { /* noop */ }
      masterGainRef.current = null;
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        muted ? 0 : 0.65,
        ctxRef.current.currentTime,
        0.05
      );
    }
  }, []);

  return { start, stop, setMuted };
}

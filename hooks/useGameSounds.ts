import { useRef, useCallback } from "react";

export function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freq: number, type: OscillatorType, dur: number, vol = 0.3, delay = 0) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch { /* silent fail */ }
  }, [getCtx]);

  // 合体音 — レベルに応じて音が高くなる
  const playMerge = useCallback((level: number) => {
    const baseFreq = 261 + level * 40; // C4 → higher
    tone(baseFreq, "triangle", 0.12, 0.4);
    if (level >= 5) {
      // 大きな合体は和音を追加
      tone(baseFreq * 1.25, "triangle", 0.1, 0.3, 0.08);
    }
    if (level >= 8) {
      // 超大合体はファンファーレ
      tone(baseFreq * 1.5, "sine", 0.15, 0.35, 0.15);
    }
  }, [tone]);

  // ピース落下 「コトッ」
  const playDrop = useCallback(() => {
    tone(220, "triangle", 0.06, 0.2);
  }, [tone]);

  // ゲームオーバー
  const playGameOver = useCallback(() => {
    [400, 320, 240, 180].forEach((f, i) => tone(f, "sawtooth", 0.2, 0.3, i * 0.12));
  }, [tone]);

  // ハイスコア
  const playHighScore = useCallback(() => {
    const seq = [523, 659, 784, 1047, 1319];
    seq.forEach((f, i) => tone(f, "triangle", 0.25, 0.4, i * 0.1));
  }, [tone]);

  return { playMerge, playDrop, playGameOver, playHighScore };
}

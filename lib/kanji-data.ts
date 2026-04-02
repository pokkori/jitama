export interface KanjiLevel {
  level: number;
  char: string;
  meaning: string; // English meaning for global players
  reading: string; // Japanese reading (kun/on) for JLPT study
  radius: number;
  color: number;       // Base hex color for Phaser fill
  colorInner: number;  // Inner gradient color (lighter/darker)
  glowColor: number;   // Glow/bloom color
  glowAlpha: number;   // Glow intensity (0.0–1.0)
  textColor: string;   // CSS color for kanji text
  score: number;
  jlpt: "N5" | "N4" | "N3" | "N2" | "N1" | "常用";
}

// Suika-style progression: each level is visually satisfying
// Same character merges = next level character
export const KANJI_LEVELS: KanjiLevel[] = [
  // level 0: 一 — 深紫
  { level: 0, char: "一", meaning: "one",       reading: "いち / ひと(つ)", radius: 26,  color: 0x6d28d9, colorInner: 0x4a2d7a, glowColor: 0x8b5cf6, glowAlpha: 0.35, textColor: "#e9d5ff", score: 1,   jlpt: "N5" },
  // level 1: 二 — 深青
  { level: 1, char: "二", meaning: "two",       reading: "に / ふた(つ)",   radius: 33,  color: 0x1d4ed8, colorInner: 0x1e3a8a, glowColor: 0x3b82f6, glowAlpha: 0.35, textColor: "#bfdbfe", score: 3,   jlpt: "N5" },
  // level 2: 三 — 深緑
  { level: 2, char: "三", meaning: "three",     reading: "さん / み(つ)",   radius: 40,  color: 0x059669, colorInner: 0x064e3b, glowColor: 0x10b981, glowAlpha: 0.35, textColor: "#a7f3d0", score: 6,   jlpt: "N5" },
  // level 3: 十 — 茶
  { level: 3, char: "十", meaning: "ten",       reading: "じゅう / とお",   radius: 48,  color: 0x92400e, colorInner: 0x451a03, glowColor: 0xd97706, glowAlpha: 0.40, textColor: "#fde68a", score: 10,  jlpt: "N5" },
  // level 4: 木 — 深赤
  { level: 4, char: "木", meaning: "tree",      reading: "もく / き",       radius: 57,  color: 0xb91c1c, colorInner: 0x7f1d1d, glowColor: 0xef4444, glowAlpha: 0.40, textColor: "#fecaca", score: 15,  jlpt: "N5" },
  // level 5: 林 — マゼンタ
  { level: 5, char: "林", meaning: "grove",     reading: "りん / はやし",   radius: 68,  color: 0x9d174d, colorInner: 0x500724, glowColor: 0xec4899, glowAlpha: 0.40, textColor: "#fbcfe8", score: 21,  jlpt: "N4" },
  // level 6: 森 — ティール
  { level: 6, char: "森", meaning: "forest",    reading: "しん / もり",     radius: 81,  color: 0x0e7490, colorInner: 0x083344, glowColor: 0x22d3ee, glowAlpha: 0.45, textColor: "#a5f3fc", score: 28,  jlpt: "N4" },
  // level 7: 日 — オレンジ
  { level: 7, char: "日", meaning: "sun/day",   reading: "にち / ひ",       radius: 95,  color: 0xc2410c, colorInner: 0x7c2d12, glowColor: 0xfb923c, glowAlpha: 0.45, textColor: "#fed7aa", score: 36,  jlpt: "N5" },
  // level 8: 明 — インディゴ
  { level: 8, char: "明", meaning: "bright",    reading: "めい / あか(るい)",radius: 111, color: 0x4338ca, colorInner: 0x1e1b4b, glowColor: 0x818cf8, glowAlpha: 0.50, textColor: "#c7d2fe", score: 45,  jlpt: "N4" },
  // level 9: 晶 — ライム
  { level: 9, char: "晶", meaning: "sparkle",   reading: "しょう",          radius: 128, color: 0x3f6212, colorInner: 0x1a2e05, glowColor: 0xa3e635, glowAlpha: 0.55, textColor: "#d9f99d", score: 55,  jlpt: "常用" },
  // level 10: 品 — 赤金
  { level: 10, char: "品", meaning: "goods",    reading: "ひん / しな",     radius: 146, color: 0x991b1b, colorInner: 0x450a0a, glowColor: 0xfca5a5, glowAlpha: 0.55, textColor: "#fde68a", score: 66,  jlpt: "N3" },
  // level 11: 字 — 最高位ゴールド発光
  { level: 11, char: "字", meaning: "character", reading: "じ / あざ",     radius: 165, color: 0xb45309, colorInner: 0x3d1a00, glowColor: 0xFFD93D, glowAlpha: 0.80, textColor: "#FFD93D", score: 100, jlpt: "N5" },
];

export const MAX_LEVEL = KANJI_LEVELS.length - 1;

// Next piece is randomly chosen from first 5 levels
export function randomNextLevel(): number {
  const weights = [30, 25, 20, 15, 10]; // Lower levels appear more often
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) return i;
  }
  return 0;
}

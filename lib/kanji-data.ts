export interface KanjiLevel {
  level: number;
  char: string;
  meaning: string; // English meaning for global players
  reading: string; // Japanese reading (kun/on) for JLPT study
  radius: number;
  color: number; // Hex color for Phaser
  score: number;
  jlpt: "N5" | "N4" | "N3" | "N2" | "N1" | "常用";
}

// Suika-style progression: each level is visually satisfying
// Same character merges = next level character
export const KANJI_LEVELS: KanjiLevel[] = [
  { level: 0, char: "一", meaning: "one", reading: "いち / ひと(つ)", radius: 26, color: 0xfde68a, score: 1, jlpt: "N5" },
  { level: 1, char: "二", meaning: "two", reading: "に / ふた(つ)", radius: 33, color: 0xfcd34d, score: 3, jlpt: "N5" },
  { level: 2, char: "三", meaning: "three", reading: "さん / み(つ)", radius: 40, color: 0xfbbf24, score: 6, jlpt: "N5" },
  { level: 3, char: "十", meaning: "ten", reading: "じゅう / とお", radius: 48, color: 0xf59e0b, score: 10, jlpt: "N5" },
  { level: 4, char: "木", meaning: "tree", reading: "もく / き", radius: 57, color: 0x86efac, score: 15, jlpt: "N5" },
  { level: 5, char: "林", meaning: "grove", reading: "りん / はやし", radius: 68, color: 0x4ade80, score: 21, jlpt: "N4" },
  { level: 6, char: "森", meaning: "forest", reading: "しん / もり", radius: 81, color: 0x22c55e, score: 28, jlpt: "N4" },
  { level: 7, char: "日", meaning: "sun/day", reading: "にち / ひ", radius: 95, color: 0x67e8f9, score: 36, jlpt: "N5" },
  { level: 8, char: "明", meaning: "bright", reading: "めい / あか(るい)", radius: 111, color: 0x22d3ee, score: 45, jlpt: "N4" },
  { level: 9, char: "晶", meaning: "sparkle", reading: "しょう", radius: 128, color: 0xa78bfa, score: 55, jlpt: "常用" },
  { level: 10, char: "品", meaning: "goods", reading: "ひん / しな", radius: 146, color: 0x818cf8, score: 66, jlpt: "N3" },
  // Final boss — cannot merge further, huge score bonus
  { level: 11, char: "字", meaning: "character", reading: "じ / あざ", radius: 165, color: 0xf472b6, score: 100, jlpt: "N5" },
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

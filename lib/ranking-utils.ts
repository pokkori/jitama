/**
 * 字玉 JITAMA — 段位システム
 * スコアに応じて段位を返す。ゲームオーバー画面・ランキングで使用する。
 */

export interface Rank {
  /** 段位名（日本語） */
  label: string;
  /** 段位名（英語） */
  labelEn: string;
  /** 絵文字アイコン */
  icon: string;
  /** 最低スコア */
  minScore: number;
  /** Tailwind 風グラデーション（CSS文字列） */
  gradient: string;
  /** テキストカラー（CSS文字列） */
  textColor: string;
  /** 段位インデックス（0=最低） */
  tier: number;
}

export const RANKS: Rank[] = [
  {
    tier: 0,
    label: "見習い書生",
    labelEn: "Beginner",
    icon: "",
    minScore: 0,
    gradient: "linear-gradient(135deg, #4b5563, #374151)",
    textColor: "#9ca3af",
  },
  {
    tier: 1,
    label: "漢字入門",
    labelEn: "Novice",
    icon: "",
    minScore: 500,
    gradient: "linear-gradient(135deg, #065f46, #047857)",
    textColor: "#6ee7b7",
  },
  {
    tier: 2,
    label: "漢字修行中",
    labelEn: "Apprentice",
    icon: "",
    minScore: 1500,
    gradient: "linear-gradient(135deg, #1e40af, #1d4ed8)",
    textColor: "#93c5fd",
  },
  {
    tier: 3,
    label: "漢字使い",
    labelEn: "Practitioner",
    icon: "",
    minScore: 3000,
    gradient: "linear-gradient(135deg, #5b21b6, #7c3aed)",
    textColor: "#c4b5fd",
  },
  {
    tier: 4,
    label: "漢字の達人",
    labelEn: "Expert",
    icon: "",
    minScore: 5000,
    gradient: "linear-gradient(135deg, #92400e, #b45309)",
    textColor: "#fcd34d",
  },
  {
    tier: 5,
    label: "字玉の申し子",
    labelEn: "Master",
    icon: "",
    minScore: 8000,
    gradient: "linear-gradient(135deg, #831843, #be185d)",
    textColor: "#f9a8d4",
  },
  {
    tier: 6,
    label: "字玉マスター",
    labelEn: "Grand Master",
    icon: "",
    minScore: 12000,
    gradient: "linear-gradient(135deg, #78350f, #d97706, #fbbf24)",
    textColor: "#fef3c7",
  },
];

/**
 * スコアから段位を返す
 */
export function getRankFromScore(score: number): Rank {
  // 高い方から順に確認
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].minScore) return RANKS[i];
  }
  return RANKS[0];
}

/**
 * 次の段位までの必要スコアと進捗率を返す
 * @returns { nextRank, required, progress } — 最高段位の場合 nextRank は null
 */
export function getRankProgress(score: number): {
  currentRank: Rank;
  nextRank: Rank | null;
  required: number;
  progress: number; // 0〜100
} {
  const currentRank = getRankFromScore(score);
  const nextTier = currentRank.tier + 1;
  const nextRank = RANKS[nextTier] ?? null;

  if (!nextRank) {
    return { currentRank, nextRank: null, required: 0, progress: 100 };
  }

  const rangeStart = currentRank.minScore;
  const rangeEnd = nextRank.minScore;
  const progress = Math.min(100, Math.round(((score - rangeStart) / (rangeEnd - rangeStart)) * 100));
  const required = rangeEnd - score;

  return { currentRank, nextRank, required, progress };
}

/**
 * 段位が上がったかチェックする（ゲーム中のスコア変化を渡す）
 */
export function didRankUp(prevScore: number, newScore: number): boolean {
  return getRankFromScore(prevScore).tier < getRankFromScore(newScore).tier;
}

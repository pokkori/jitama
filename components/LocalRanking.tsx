"use client";

import { getRankFromScore } from "@/lib/ranking-utils";

export interface RankingEntry {
  score: number;
  date: string;
  level: string;
}

const RANKING_KEY = "jitama_ranking";
const MAX_ENTRIES = 10;

export function loadRanking(): RankingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RankingEntry[];
  } catch {
    return [];
  }
}

/**
 * スコアをランキングに保存する。
 * @returns 新しい順位（1-indexed）。ランク外なら null。
 */
export function saveToRanking(entry: RankingEntry): number | null {
  const current = loadRanking();
  const combined = [...current, entry];
  combined.sort((a, b) => b.score - a.score);
  const trimmed = combined.slice(0, MAX_ENTRIES);
  localStorage.setItem(RANKING_KEY, JSON.stringify(trimmed));
  const rank = trimmed.findIndex(
    (e) => e.score === entry.score && e.date === entry.date
  );
  return rank >= 0 ? rank + 1 : null;
}

export function resetRanking() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(RANKING_KEY);
  }
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shadow-lg"
        style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#1a0a2e", boxShadow: "0 0 12px rgba(245,158,11,0.6)" }}>
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shadow"
        style={{ background: "linear-gradient(135deg, #9ca3af, #d1d5db)", color: "#1a0a2e" }}>
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shadow"
        style={{ background: "linear-gradient(135deg, #92400e, #b45309)", color: "#fef3c7" }}>
        3
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-900 text-purple-400 font-bold text-xs">
      {rank}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LocalRankingProps {
  entries: RankingEntry[];
  onReset: () => void;
  /** 直前に登録された順位（ハイライト用） */
  newRank?: number | null;
}

export default function LocalRanking({ entries, onReset, newRank }: LocalRankingProps) {
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1">
          🏆 自己ベストランキング
        </p>
        <button
          onClick={onReset}
          className="text-[10px] text-purple-600 hover:text-purple-400 underline transition-colors"
        >
          リセット
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-purple-600 text-center py-3">
          まだ記録がありません
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, i) => {
            const rank = getRankFromScore(entry.score);
            const isNewEntry = newRank !== null && newRank !== undefined && newRank === i + 1;

            return (
              <li
                key={`${entry.date}-${entry.score}-${i}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                  isNewEntry
                    ? "border-yellow-400/60 bg-yellow-400/10 ring-1 ring-yellow-400/40"
                    : i === 0
                    ? "bg-amber-500/10 border border-amber-500/40"
                    : i === 1
                    ? "bg-slate-400/10 border border-slate-400/30"
                    : i === 2
                    ? "bg-amber-700/10 border border-amber-700/30"
                    : "bg-purple-900/30 border border-purple-800/30"
                }`}
              >
                <RankBadge rank={i + 1} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-yellow-300">
                      {entry.score.toLocaleString()} pt
                    </span>
                    {isNewEntry && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
                        style={{ background: "linear-gradient(135deg, #f59e0b, #f472b6)", color: "#1a0a2e" }}>
                        NEW!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px]">{rank.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: rank.textColor }}>
                      {rank.label}
                    </span>
                    <span className="text-[9px] text-purple-600">·</span>
                    <span className="text-[9px] text-purple-500 truncate">
                      {entry.level} · {entry.date}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

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
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-[#1a0a2e] font-black text-xs shadow">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-[#1a0a2e] font-black text-xs shadow">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow">
        3
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-800 text-purple-300 font-bold text-xs">
      {rank}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LocalRankingProps {
  entries: RankingEntry[];
  onReset: () => void;
}

export default function LocalRanking({ entries, onReset }: LocalRankingProps) {
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-purple-300 uppercase tracking-wide">
          本日のトップ10
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
        <ul className="space-y-1.5">
          {entries.map((entry, i) => (
            <li
              key={`${entry.date}-${entry.score}-${i}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                i === 0
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
                <div className="text-sm font-bold text-yellow-300">
                  {entry.score.toLocaleString()} pt
                </div>
                <div className="text-[10px] text-purple-400 truncate">
                  {entry.level} &nbsp;·&nbsp; {entry.date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { getRankFromScore } from "@/lib/ranking-utils";

export interface RankingEntry {
  name: string;
  score: number;
  date: string;
  level: string;
}

//  擬似グローバルランキング（週次シードで変化する本物らしいCPUプレイヤー） 
const CPU_NAMES = ["漢字の達人", "文字マスター", "合体王", "字玉の申し子", "晶まで到達", "字玉職人", "漢字フリーク", "合体連鎖師", "森の賢者", "品格の士"];
const CPU_SCORES_BASE = [4800, 4200, 3800, 3500, 3100, 2900, 2600, 2300, 1900, 1600];

function getWeekSeed(): number {
  const d = new Date();
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  return parseInt(weekStart.toISOString().slice(0, 10).replace(/-/g, ""), 10);
}

export function generateGlobalRanking(): RankingEntry[] {
  const seed = getWeekSeed();
  return CPU_NAMES.map((name, i) => {
    // 毎週少し変化するスコア（±15%）
    const variance = ((seed * (i + 1) * 31337) % 300) - 150;
    const score = Math.max(500, CPU_SCORES_BASE[i] + variance);
    const dayOffset = (seed * (i + 3)) % 7;
    const date = new Date(Date.now() - dayOffset * 86400000).toLocaleDateString("ja-JP", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const levels = ["全漢字", "N5", "全漢字", "N5", "全漢字", "全漢字", "N5", "全漢字", "N5", "全漢字"];
    return { name, score, date, level: levels[i] };
  });
}

const RANKING_KEY = "jitama_ranking";
const MAX_ENTRIES = 10;

export function loadRanking(): RankingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RankingEntry[];
    // migrate old entries that have no name
    return parsed.map((e) => ({ ...e, name: e.name ?? "名無し" }));
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
    (e) => e.score === entry.score && e.date === entry.date && e.name === entry.name
  );
  return rank >= 0 ? rank + 1 : null;
}

export function resetRanking() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(RANKING_KEY);
  }
}

//  Badge helper 

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

//  Main Component 

interface LocalRankingProps {
  entries: RankingEntry[];
  onReset: () => void;
  /** 直前に登録された順位（ハイライト用） */
  newRank?: number | null;
}

export default function LocalRanking({ entries, onReset, newRank }: LocalRankingProps) {
  // グローバルランキング（CPU）とローカル（自分）をマージして表示
  const globalEntries = generateGlobalRanking();
  const allEntries: (RankingEntry & { isSelf?: boolean })[] = [
    ...entries.map(e => ({ ...e, isSelf: true })),
    ...globalEntries,
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // newRank: 自分のエントリが何位かを再計算
  const myNewRankIndex = newRank !== null && newRank !== undefined
    ? allEntries.findIndex(e => e.isSelf && entries[newRank - 1] && e.score === entries[newRank - 1].score)
    : -1;

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1">
           今週のグローバルランキング TOP10
        </p>
        <button
          onClick={onReset}
          className="text-[10px] text-purple-600 hover:text-purple-400 underline transition-colors"
        >
          リセット
        </button>
      </div>
      <p className="text-[10px] text-purple-600 mb-2 text-center">毎週月曜更新 • 世界中のJITAMAプレイヤーと競争！</p>

      {allEntries.length === 0 ? (
        <p className="text-xs text-purple-600 text-center py-3">
          まだ記録がありません
        </p>
      ) : (
        <ul className="space-y-2">
          {allEntries.map((entry, i) => {
            const rank = getRankFromScore(entry.score);
            const isNewEntry = myNewRankIndex === i;
            const isSelf = entry.isSelf;

            return (
              <li
                key={`${entry.date}-${entry.score}-${i}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                  isNewEntry
                    ? "border-yellow-400/60 bg-yellow-400/10 ring-1 ring-yellow-400/40"
                    : isSelf
                    ? "border-pink-500/60 bg-pink-900/20"
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
                    <span className="text-xs font-bold text-white truncate max-w-[80px]">
                      {isSelf ? " " : ""}{entry.name}
                    </span>
                    <span className="text-sm font-black text-yellow-300">
                      {entry.score.toLocaleString()} pt
                    </span>
                    {isNewEntry && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
                        style={{ background: "linear-gradient(135deg, #f59e0b, #f472b6)", color: "#1a0a2e" }}>
                        NEW!
                      </span>
                    )}
                    {isSelf && !isNewEntry && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(244,114,182,0.3)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.5)" }}>
                        あなた
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

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const BEST_SCORE_KEY = "jitama_best_score";
const WEEKLY_SCORE_KEY = "jitama_weekly_scores";
const WEEKLY_DATE_KEY = "jitama_weekly_start";
const PLAY_COUNT_KEY = "jitama_play_count";
const PLAY_DATE_KEY = "jitama_play_date";

interface WeeklyScore {
  score: number;
  date: string;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day;
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function loadWeeklyScores(): WeeklyScore[] {
  if (typeof window === "undefined") return [];
  try {
    const savedWeekStart = localStorage.getItem(WEEKLY_DATE_KEY);
    const currentWeekStart = getWeekStart();
    if (savedWeekStart !== currentWeekStart) {
      // New week - reset
      localStorage.setItem(WEEKLY_DATE_KEY, currentWeekStart);
      localStorage.setItem(WEEKLY_SCORE_KEY, "[]");
      return [];
    }
    return JSON.parse(localStorage.getItem(WEEKLY_SCORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function getWeeklyStats(): { totalPlays: number; correctRate: number } {
  if (typeof window === "undefined") return { totalPlays: 0, correctRate: 0 };
  try {
    const scores = loadWeeklyScores();
    const totalPlays = scores.length;
    // correctRate: スコア100以上を「成功」とみなす
    const successes = scores.filter(s => s.score >= 100).length;
    const correctRate = totalPlays > 0 ? Math.round((successes / totalPlays) * 100) : 0;
    return { totalPlays, correctRate };
  } catch {
    return { totalPlays: 0, correctRate: 0 };
  }
}

// 疑似週間ランキングデータ（localStorageのスコア + ダミーユーザー）
const DUMMY_RANKING = [
  { rank: 1, name: "漢字マスター", score: 8420, badge: "" },
  { rank: 2, name: "JLPT挑戦中", score: 6731, badge: "" },
  { rank: 3, name: "字玉ガチ勢", score: 5289, badge: "" },
  { rank: 4, name: "朝活プレイヤー", score: 4102, badge: "4️⃣" },
  { rank: 5, name: "N5クリア目標", score: 2847, badge: "5️⃣" },
];

export default function WeeklyRankingSection() {
  const [bestScore, setBestScore] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({ totalPlays: 0, correctRate: 0 });
  const [myRank, setMyRank] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const best = parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10);
    setBestScore(best);
    setWeeklyStats(getWeeklyStats());

    // 自分のランクを計算
    if (best > 0) {
      const rank = DUMMY_RANKING.filter(r => r.score > best).length + 1;
      setMyRank(rank);
    }
  }, []);

  if (!mounted) return null;

  // ランキングに自分を挿入
  const rankingWithMe = bestScore > 0
    ? [...DUMMY_RANKING, { rank: myRank ?? 6, name: "あなた", score: bestScore, badge: "" }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((item, i) => ({ ...item, rank: i + 1 }))
    : DUMMY_RANKING;

  return (
    <section className="max-w-lg mx-auto px-4 py-8">
      <div className="space-y-4">
        {/* 週間ランキング */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border border-yellow-600/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-yellow-300"> 今週のハイスコアランキング</h2>
            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full">毎週月曜リセット</span>
          </div>
          <div className="space-y-2">
            {rankingWithMe.map((entry, i) => {
              const isMe = entry.name === "あなた";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                    isMe
                      ? "bg-yellow-500/20 border border-yellow-500/40"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <span className="text-sm w-6 text-center">{entry.badge}</span>
                  <span className={`text-xs font-bold flex-1 ${isMe ? "text-yellow-300" : "text-purple-200"}`}>
                    {entry.name}
                    {isMe && <span className="ml-1 text-[10px] text-yellow-400">(あなた)</span>}
                  </span>
                  <span className={`text-sm font-black tabular-nums ${isMe ? "text-yellow-300" : "text-white"}`}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          {bestScore === 0 && (
            <p className="text-xs text-purple-400 text-center mt-3">ゲームをプレイするとランキングに参加できます</p>
          )}
          <div className="mt-3 text-center">
            <Link
              href="/game?mode=N5"
              className="inline-block text-xs bg-yellow-500 hover:bg-yellow-400 text-[#1a0a2e] font-bold px-4 py-1.5 rounded-full transition-colors"
            >
              ランクを上げに行く →
            </Link>
          </div>
        </div>

        {/* 学習レポート */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-600/40 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-purple-300 mb-4"> あなたの学習レポート（今週）</h2>
          {weeklyStats.totalPlays === 0 && bestScore === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-purple-400">まだ今週のプレイ記録がありません</p>
              <p className="text-[10px] text-purple-600 mt-1">プレイするたびにここに記録されます</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-purple-700/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-yellow-300">{bestScore > 0 ? bestScore.toLocaleString() : "—"}</p>
                <p className="text-[10px] text-purple-400 mt-0.5">ベストスコア</p>
              </div>
              <div className="bg-white/5 border border-purple-700/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-pink-300">{weeklyStats.totalPlays > 0 ? weeklyStats.totalPlays : "—"}</p>
                <p className="text-[10px] text-purple-400 mt-0.5">今週のプレイ数</p>
              </div>
              <div className="bg-white/5 border border-purple-700/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-300">
                  {myRank !== null ? `${myRank}位` : "—"}
                </p>
                <p className="text-[10px] text-purple-400 mt-0.5">ランキング</p>
              </div>
            </div>
          )}
          <div className="mt-3 bg-purple-900/40 border border-purple-700/30 rounded-xl p-3">
            <p className="text-[10px] text-purple-400 text-center">
              毎日プレイしてランクアップ！連続プレイでボーナス称号を獲得
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

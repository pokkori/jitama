"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import KomojuButton from "@/components/KomojuButton";
import KanjiQuiz from "@/components/KanjiQuiz";
import { JLPT_MODES, type JlptLevel } from "@/lib/jlpt";

const KanjiGame = dynamic(() => import("@/components/KanjiGame"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-[#1a0a2e]">
      <div className="text-center">
        <div className="text-4xl mb-4">字玉</div>
        <div className="text-purple-300 text-sm">ゲームを読み込み中...</div>
      </div>
    </div>
  ),
});

const FREE_LIMIT = 5;
const PLAY_COUNT_KEY = "jitama_play_count";
const PLAY_DATE_KEY = "jitama_play_date";
const BEST_SCORE_KEY = "jitama_best_score";
const STREAK_KEY = "jitama_streak";
const STREAK_DATE_KEY = "jitama_streak_date";

// 難易度設定
export type DifficultyLevel = "easy" | "normal" | "hard";
const DIFFICULTY_KEY = "jitama_difficulty";
const DIFFICULTY_LABELS: Record<DifficultyLevel, { label: string; desc: string; emoji: string; speedFactor: number }> = {
  easy:   { label: "かんたん", desc: "落下スピード遅め・N5基本漢字多め", emoji: "🌱", speedFactor: 0.7 },
  normal: { label: "ふつう",   desc: "バランス良い標準設定", emoji: "⭐", speedFactor: 1.0 },
  hard:   { label: "むずかしい", desc: "落下スピード速め・難しい漢字多め", emoji: "🔥", speedFactor: 1.4 },
};

function getSavedDifficulty(): DifficultyLevel {
  if (typeof window === "undefined") return "normal";
  const v = localStorage.getItem(DIFFICULTY_KEY);
  if (v === "easy" || v === "normal" || v === "hard") return v;
  return "normal";
}

// 学習統計
const STATS_KEY = "jitama_stats";
interface LearningStats {
  totalGames: number;
  weekGames: number;
  weekStartDate: string;
  correctAnswers: number;
  totalAnswers: number;
}

function loadLearningStats(): LearningStats {
  if (typeof window === "undefined") return { totalGames: 0, weekGames: 0, weekStartDate: getMonday(), correctAnswers: 0, totalAnswers: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { totalGames: 0, weekGames: 0, weekStartDate: getMonday(), correctAnswers: 0, totalAnswers: 0 };
    const parsed = JSON.parse(raw) as LearningStats;
    // 週リセット
    if (parsed.weekStartDate !== getMonday()) {
      parsed.weekGames = 0;
      parsed.weekStartDate = getMonday();
    }
    return parsed;
  } catch { return { totalGames: 0, weekGames: 0, weekStartDate: getMonday(), correctAnswers: 0, totalAnswers: 0 }; }
}

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function incrementGameStats(): LearningStats {
  const stats = loadLearningStats();
  stats.totalGames += 1;
  stats.weekGames += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10);
}

function updateBestScore(score: number): { isNew: boolean; best: number } {
  const current = getBestScore();
  if (score > current) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
    return { isNew: true, best: score };
  }
  return { isNew: false, best: current };
}

function getGameStreak(): number {
  if (typeof window === "undefined") return 0;
  const lastDate = localStorage.getItem(STREAK_DATE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10);
  if (lastDate === today) return streak;
  if (lastDate === yesterday) return streak;
  return 0;
}

function incrementGameStreak(): number {
  const lastDate = localStorage.getItem(STREAK_DATE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10);
  if (lastDate === today) return streak;
  if (lastDate === yesterday) streak += 1;
  else streak = 1;
  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(STREAK_DATE_KEY, today);
  return streak;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getPlayCount(): number {
  if (typeof window === "undefined") return 0;
  const savedDate = localStorage.getItem(PLAY_DATE_KEY);
  const today = getTodayStr();
  if (savedDate !== today) {
    localStorage.setItem(PLAY_DATE_KEY, today);
    localStorage.setItem(PLAY_COUNT_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(PLAY_COUNT_KEY) ?? "0", 10);
}

function incrementPlayCount(): number {
  const current = getPlayCount();
  const next = current + 1;
  localStorage.setItem(PLAY_COUNT_KEY, String(next));
  localStorage.setItem(PLAY_DATE_KEY, getTodayStr());
  return next;
}

// JLPT levels that require premium
const PREMIUM_JLPT_MODES: JlptLevel[] = ["N4", "N3_N1"];

function JLPTPaywall({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
        <div className="text-4xl mb-3">🎌</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">JLPT N4〜N1はプレミアム</h2>
        <p className="text-sm text-gray-500 mb-4">
          月額¥480でN4・N3・N2・N1の<br />上級漢字パックが使い放題
        </p>
        <ul className="text-sm text-gray-600 space-y-1 mb-5 text-left">
          <li>✓ 無制限プレイ（1日5回制限なし）</li>
          <li>✓ N4 / N3〜N1 上級漢字パック解放</li>
          <li>✓ 字玉の開発を応援</li>
        </ul>
        <KomojuButton
          planId="standard"
          planLabel="¥480/月で解放する"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl mb-2 transition-colors disabled:opacity-50"
        />
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 mt-2 block w-full">
          閉じる
        </button>
      </div>
    </div>
  );
}

type GameTab = "merge" | "quiz";

function GamePageInner() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showPayjpModal, setShowPayjpModal] = useState(false);
  const [showJlptPaywall, setShowJlptPaywall] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("normal");
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [learningStats, setLearningStats] = useState<LearningStats>({ totalGames: 0, weekGames: 0, weekStartDate: "", correctAnswers: 0, totalAnswers: 0 });
  const [activeTab, setActiveTab] = useState<GameTab>("merge");
  const [bestScore, setBestScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [newBestScore, setNewBestScore] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read mode from URL param, default to "all"
  const modeParam = (searchParams.get("mode") ?? "all") as JlptLevel;
  const validModes: JlptLevel[] = ["all", "N5", "N4", "N3_N1"];
  const currentMode: JlptLevel = validModes.includes(modeParam) ? modeParam : "all";
  const currentModeInfo = JLPT_MODES.find((m) => m.key === currentMode) ?? JLPT_MODES[0];

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        const premium = data.isPremium ?? false;
        setIsPremium(premium);
        // If user directly navigated to a premium JLPT mode without being premium,
        // show the paywall immediately
        if (!premium && PREMIUM_JLPT_MODES.includes(currentMode)) {
          setShowJlptPaywall(true);
        }
      })
      .catch(() => {
        setIsPremium(false);
        if (PREMIUM_JLPT_MODES.includes(currentMode)) {
          setShowJlptPaywall(true);
        }
      });

    setPlayCount(getPlayCount());
    setBestScore(getBestScore());
    setGameStreak(getGameStreak());
    setDifficulty(getSavedDifficulty());
    setLearningStats(loadLearningStats());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDifficultyChange = (d: DifficultyLevel) => {
    setDifficulty(d);
    localStorage.setItem(DIFFICULTY_KEY, d);
    setShowDifficultySelect(false);
  };

  const handleGameOver = (score?: number) => {
    // ストリーク更新
    const newStreak = incrementGameStreak();
    setGameStreak(newStreak);
    // 学習統計更新
    const stats = incrementGameStats();
    setLearningStats(stats);
    // ベストスコア更新
    if (score !== undefined) {
      const result = updateBestScore(score);
      setBestScore(result.best);
      if (result.isNew) setNewBestScore(true);
    }
    if (isPremium) return;
    const newCount = incrementPlayCount();
    setPlayCount(newCount);
    if (newCount >= FREE_LIMIT) {
      setShowLimitDialog(true);
    }
  };

  const handlePaySuccess = () => {
    setShowPayjpModal(false);
    router.push("/success");
  };

  const handleModeSelect = (mode: JlptLevel) => {
    // If selecting a premium JLPT mode and user is not premium, show paywall
    if (PREMIUM_JLPT_MODES.includes(mode) && !isPremium) {
      setShowModeSelect(false);
      setShowJlptPaywall(true);
      return;
    }
    setShowModeSelect(false);
    if (mode === currentMode) return;
    // Navigate with mode param — page reloads naturally
    router.push(`/game?mode=${mode}`);
  };


  if (isPremium === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a0a2e]">
        <div className="text-center">
          <div className="text-4xl mb-4">字玉</div>
          <div className="text-purple-300 text-sm">読み込み中...</div>
        </div>
      </div>
    );
  }

  const remainingPlays = Math.max(0, FREE_LIMIT - playCount);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1a0a2e]">
      {/* Stats Bar */}
      <div className="w-full max-w-[400px] bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-b border-purple-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {bestScore > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-300">
              <span>🏆</span>
              <span className="font-bold">{bestScore.toLocaleString()}</span>
              {newBestScore && <span className="text-green-400 text-[10px] font-bold animate-pulse">NEW!</span>}
            </div>
          )}
          {gameStreak >= 1 && (
            <div className="flex items-center gap-1 text-xs text-orange-300">
              <span>🔥</span>
              <span className="font-bold">{gameStreak}日連続！</span>
            </div>
          )}
          {!isPremium && (
            <div className="text-xs text-purple-300">
              {remainingPlays > 0
                ? `残り ${remainingPlays} 回`
                : "本日終了"}
            </div>
          )}
          {isPremium && (
            <div className="text-xs text-green-400 font-bold">✓ プレミアム</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 難易度ボタン */}
          <button
            onClick={() => setShowDifficultySelect(true)}
            className="text-xs bg-indigo-700/70 hover:bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-full transition-colors"
            title="難易度設定"
          >
            {DIFFICULTY_LABELS[difficulty].emoji} {DIFFICULTY_LABELS[difficulty].label}
          </button>
          {/* 学習統計ボタン */}
          <button
            onClick={() => setShowStatsPanel(true)}
            className="text-xs bg-purple-700/60 hover:bg-purple-600 text-white font-bold px-2.5 py-1 rounded-full transition-colors"
            title="学習統計"
          >
            📊
          </button>
          {!isPremium && (
            <button
              onClick={() => setShowPayjpModal(true)}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded-full transition-colors"
            >
              ⭐ 無制限
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="w-full max-w-[400px] flex border-b border-purple-800">
        <button
          onClick={() => setActiveTab("merge")}
          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
            activeTab === "merge"
              ? "text-yellow-300 border-b-2 border-yellow-300"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          🀄 マージゲーム
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
            activeTab === "quiz"
              ? "text-yellow-300 border-b-2 border-yellow-300"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          🎌 漢字クイズ
        </button>
      </div>

      {/* 今日の問題シェアバー */}
      <div className="w-full max-w-[400px] bg-[#1a0a2e]/60 border-b border-purple-800/30 px-4 py-1.5 flex items-center justify-between">
        <span className="text-[10px] text-purple-500">
          📅 今日のチャレンジ: {new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
        </span>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("字玉JITAMAで今日のチャレンジに挑戦中！漢字を合体させて高スコアを目指せ🀄\nhttps://jitama.vercel.app?daily=" + new Date().toISOString().slice(0, 10) + "\n#字玉 #JITAMA #漢字パズル")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-200 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          友達に挑戦状を送る
        </a>
      </div>

      {/* JLPT Mode Indicator Bar — Merge mode only */}
      {activeTab === "merge" && (
        <div className="w-full max-w-[400px] bg-[#1a0a2e]/90 border-b border-purple-800/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentModeInfo.emoji}</span>
            <span className="text-xs text-purple-200 font-medium">{currentModeInfo.label}</span>
            {currentMode !== "all" && (
              <span className="text-[10px] bg-purple-700/60 text-purple-200 px-2 py-0.5 rounded-full">
                {currentModeInfo.descriptionEn}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModeSelect(true)}
            className="text-xs text-purple-400 hover:text-purple-200 border border-purple-700 hover:border-purple-500 px-3 py-1 rounded-full transition-colors"
          >
            モード変更
          </button>
        </div>
      )}

      {activeTab === "merge" ? (
        <KanjiGame onGameOver={handleGameOver} jlptMode={currentMode} />
      ) : (
        <KanjiQuiz isPremium={isPremium ?? false} onOpenPayjp={() => setShowPayjpModal(true)} />
      )}

      {/* Mode Selection Dialog */}
      {showModeSelect && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a0a2e] border border-purple-600 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-2xl mb-1">🎌</div>
              <h2 className="text-lg font-bold text-white">ゲームモード選択</h2>
              <p className="text-xs text-purple-400 mt-1">
                Learn Kanji while playing!<br />Perfect for JLPT prep 🎌
              </p>
            </div>
            <div className="space-y-3">
              {JLPT_MODES.map((mode) => {
                const needsPremium = PREMIUM_JLPT_MODES.includes(mode.key) && !isPremium;
                return (
                  <button
                    key={mode.key}
                    onClick={() => handleModeSelect(mode.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      currentMode === mode.key
                        ? "border-purple-400 bg-purple-700/40"
                        : needsPremium
                        ? "border-amber-700/60 bg-amber-900/20 hover:bg-amber-900/30 hover:border-amber-600"
                        : "border-purple-800 bg-white/5 hover:bg-white/10 hover:border-purple-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mode.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{mode.label}</span>
                          <span className="text-[10px] text-purple-400">{mode.labelEn}</span>
                          {currentMode === mode.key && (
                            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                              選択中
                            </span>
                          )}
                          {needsPremium && (
                            <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-auto">
                              ⭐ プレミアム
                            </span>
                          )}
                          {!needsPremium && mode.key !== "all" && mode.key !== "N5" && isPremium && (
                            <span className="text-[10px] bg-green-700 text-white px-1.5 py-0.5 rounded-full ml-auto">
                              解放済み
                            </span>
                          )}
                          {mode.key === "N5" && (
                            <span className="text-[10px] bg-green-600/80 text-white px-1.5 py-0.5 rounded-full ml-auto">
                              無料
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-300 mt-0.5">{mode.description}</p>
                        <p className="text-[10px] text-purple-500">{mode.descriptionEn}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowModeSelect(false)}
              className="w-full mt-4 text-xs text-purple-500 hover:text-purple-400 underline"
            >
              キャンセル / Cancel
            </button>
          </div>
        </div>
      )}

      {/* Limit Dialog (shown after 5th game over) */}
      {showLimitDialog && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a0a2e] border border-purple-600 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h2 className="text-xl font-bold text-white mb-2">
              本日の無料プレイ（{FREE_LIMIT}回）を使い切りました
            </h2>
            <p className="text-purple-300 text-sm mb-6">
              プレミアムプランで無制限にプレイできます
            </p>
            <p className="text-3xl font-black text-white mb-4">
              ¥480<span className="text-base font-normal text-purple-400">/月</span>
            </p>
            <ul className="text-sm text-purple-200 space-y-1 mb-6 text-left">
              <li>✓ 1日の制限なし・無制限プレイ</li>
              <li>✓ JLPT N4 漢字パック解放 📗</li>
              <li>✓ JLPT N3〜N1 上級漢字パック解放 🏆</li>
              <li>✓ 字玉の開発を応援</li>
            </ul>
            <button
              onClick={() => {
                setShowLimitDialog(false);
                setShowPayjpModal(true);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mb-3 transition-colors"
            >
              今すぐプレミアムになる
            </button>
            <button
              onClick={() => setShowLimitDialog(false)}
              className="text-xs text-purple-500 hover:text-purple-400 underline"
            >
              明日また無料でプレイする
            </button>
          </div>
        </div>
      )}

      {/* 難易度選択ダイアログ */}
      {showDifficultySelect && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a0a2e] border border-purple-600 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-2xl mb-1">⚙️</div>
              <h2 className="text-lg font-bold text-white">難易度を選ぼう</h2>
              <p className="text-xs text-purple-400 mt-1">設定は次のゲームから反映されます</p>
            </div>
            <div className="space-y-3">
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((key) => {
                const d = DIFFICULTY_LABELS[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleDifficultyChange(key)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      difficulty === key
                        ? "border-purple-400 bg-purple-700/40"
                        : "border-purple-800 bg-white/5 hover:bg-white/10 hover:border-purple-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{d.label}</span>
                          {difficulty === key && (
                            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full">選択中</span>
                          )}
                        </div>
                        <p className="text-xs text-purple-300 mt-0.5">{d.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowDifficultySelect(false)}
              className="w-full mt-4 text-xs text-purple-500 hover:text-purple-400 underline"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 学習統計パネル */}
      {showStatsPanel && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a0a2e] border border-purple-600 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-2xl mb-1">📊</div>
              <h2 className="text-lg font-bold text-white">学習統計ダッシュボード</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-purple-900/40 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-yellow-300">{learningStats.weekGames}</p>
                <p className="text-[10px] text-purple-500 mt-0.5">今週のプレイ</p>
              </div>
              <div className="bg-purple-900/40 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-green-400">{learningStats.totalGames}</p>
                <p className="text-[10px] text-purple-500 mt-0.5">累計プレイ</p>
              </div>
              <div className="bg-purple-900/40 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-orange-300">{gameStreak}</p>
                <p className="text-[10px] text-purple-500 mt-0.5">連続プレイ日</p>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-800/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-purple-400 font-bold mb-2">🏆 ベストスコア</p>
              <p className="text-2xl font-black text-yellow-300">{bestScore > 0 ? bestScore.toLocaleString() : "まだ記録なし"}</p>
            </div>
            <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-indigo-400 font-bold mb-1">現在の難易度</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{DIFFICULTY_LABELS[difficulty].emoji}</span>
                <span className="text-sm font-bold text-white">{DIFFICULTY_LABELS[difficulty].label}</span>
              </div>
            </div>
            <button
              onClick={() => setShowStatsPanel(false)}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* JLPT Premium Paywall */}
      {showJlptPaywall && (
        <JLPTPaywall
          onClose={() => {
            setShowJlptPaywall(false);
            // If user is on a premium mode and closes paywall, redirect to N5 (free mode)
            if (PREMIUM_JLPT_MODES.includes(currentMode)) {
              router.push("/game?mode=N5");
            }
          }}
        />
      )}

      {/* Komoju Payment Modal */}
      {showPayjpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl relative">
            <button
              onClick={() => setShowPayjpModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <div className="text-4xl mb-3">🀄</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">プレミアムプランに登録</h2>
            <p className="text-sm text-gray-500 mb-4">月額¥480で無制限プレイ + JLPT N4〜N1漢字パック</p>
            <KomojuButton
              planId="standard"
              planLabel="¥480/月で解放する"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#1a0a2e]">
          <div className="text-center">
            <div className="text-4xl mb-4">字玉</div>
            <div className="text-purple-300 text-sm">読み込み中...</div>
          </div>
        </div>
      }
    >
      <GamePageInner />
    </Suspense>
  );
}

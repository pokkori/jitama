"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PayjpModal from "@/components/PayjpModal";
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

function GamePageInner() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showPayjpModal, setShowPayjpModal] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showModeSelect, setShowModeSelect] = useState(false);
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
      .then((data) => setIsPremium(data.isPremium ?? false))
      .catch(() => setIsPremium(false));

    setPlayCount(getPlayCount());
  }, []);

  const handleGameOver = () => {
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
    setShowModeSelect(false);
    if (mode === currentMode) return;
    // Navigate with mode param — page reloads naturally
    router.push(`/game?mode=${mode}`);
  };

  const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "";

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
      {/* Premium Banner — non-premium users only */}
      {!isPremium && (
        <div className="w-full max-w-[400px] bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-b border-purple-700 px-4 py-2 flex items-center justify-between">
          <div className="text-xs text-purple-300">
            {remainingPlays > 0
              ? `本日あと ${remainingPlays} 回無料プレイ可`
              : "本日の無料プレイ回数を使い切りました"}
          </div>
          <button
            onClick={() => setShowPayjpModal(true)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded-full transition-colors"
          >
            ⭐ プレミアムで無制限
          </button>
        </div>
      )}

      {/* JLPT Mode Indicator Bar */}
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

      <KanjiGame onGameOver={handleGameOver} jlptMode={currentMode} />

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
              {JLPT_MODES.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => handleModeSelect(mode.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    currentMode === mode.key
                      ? "border-purple-400 bg-purple-700/40"
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
                      </div>
                      <p className="text-xs text-purple-300 mt-0.5">{mode.description}</p>
                      <p className="text-[10px] text-purple-500">{mode.descriptionEn}</p>
                    </div>
                  </div>
                </button>
              ))}
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
              <li>✓ 追加漢字パック（近日公開）</li>
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

      {/* PAY.JP Modal */}
      {showPayjpModal && (
        <PayjpModal
          publicKey={publicKey}
          planLabel="プレミアムプラン ¥480/月 — 無制限プレイ"
          onSuccess={handlePaySuccess}
          onClose={() => setShowPayjpModal(false)}
        />
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

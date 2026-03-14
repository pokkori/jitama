"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import PayjpModal from "@/components/PayjpModal";
import { useRouter } from "next/navigation";

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

export default function GamePage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showPayjpModal, setShowPayjpModal] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const router = useRouter();

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

      <KanjiGame onGameOver={handleGameOver} />

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

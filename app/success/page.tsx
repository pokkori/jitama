"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const [showConfetti, setShowConfetti] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    // Komoju session verify
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetch(`/api/komoju/verify?session_id=${sessionId}`).catch(() => {});
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Simple CSS confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ["#fbbf24", "#f472b6", "#a78bfa", "#34d399", "#60a5fa"][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-md w-full text-center">
        {/* Title */}
        <div className="text-6xl mb-4"></div>
        <div className="text-5xl font-bold mb-2">
          <span className="text-yellow-300">字</span>
          <span className="text-pink-400">玉</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-white">
          プレミアム登録完了！
        </h1>
        <p className="text-purple-300 mb-8">
          ありがとうございます。これで無制限に遊べます！
        </p>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-700 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-white mb-4 text-center">プレミアム特典</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl mt-0.5"></span>
              <div>
                <p className="font-bold text-white">無制限プレイ</p>
                <p className="text-sm text-purple-300">1日の制限なし。何回でも楽しめます</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl mt-0.5"></span>
              <div>
                <p className="font-bold text-white">JLPT N4〜N1 漢字パック解放</p>
                <p className="text-sm text-purple-300">JLPTモードで読み・意味を学びながらプレイ</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl mt-0.5"></span>
              <div>
                <p className="font-bold text-white">字玉の開発を応援</p>
                <p className="text-sm text-purple-300">あなたのサポートがゲームを進化させます</p>
              </div>
            </li>
          </ul>
        </div>

        {/* 3 Steps Guide */}
        <div className="bg-white/5 border border-purple-800 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-purple-300 mb-4">スタートガイド</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <p className="text-sm text-white">下のボタンでゲームを開始</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <p className="text-sm text-white">漢字を合体させてハイスコアを狙う</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <p className="text-sm text-white">スコアをXでシェアして友達と競おう！</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/game"
          className="block w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform mb-3"
        >
          ゲームを始める →
        </Link>
        <Link
          href="/game?mode=N4"
          className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base py-3 rounded-2xl hover:scale-105 transition-transform mb-4"
        >
          JLPT N4モードで遊ぶ →
        </Link>
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 underline">
          トップページに戻る
        </Link>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#1a0a2e] text-white flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-purple-400">読み込み中...</p>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}

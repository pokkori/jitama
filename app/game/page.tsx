"use client";

import dynamic from "next/dynamic";

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

export default function GamePage() {
  return <KanjiGame />;
}

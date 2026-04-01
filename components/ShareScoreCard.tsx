"use client";
import { useCallback } from "react";
import { getRankFromScore, type Rank } from "@/lib/ranking-utils";

interface ShareScoreCardProps {
  score: number;
  gameName?: string;
  gameUrl?: string;
  hashtags?: string[];
}

// Canvas 1200x630 OGP画像を生成してXシェア + ダウンロード
export function useShareScoreCard({
  score,
  gameName = "字玉 JITAMA",
  gameUrl = "https://jitama.vercel.app",
  hashtags = ["字玉JITAMA", "漢字ゲーム"],
}: ShareScoreCardProps) {
  const generateAndShare = useCallback(async () => {
    const rank: Rank = getRankFromScore(score);

    // tier別ランクカラー
    const rankColor =
      rank.tier >= 6 ? "#fbbf24"   // 字玉マスター: ゴールド
      : rank.tier >= 5 ? "#f472b6" // 字玉の申し子: ピンク
      : rank.tier >= 4 ? "#fcd34d" // 漢字の達人: 黄
      : rank.tier >= 3 ? "#c4b5fd" // 漢字使い: パープル
      : rank.tier >= 2 ? "#93c5fd" // 漢字修行中: ブルー
      : rank.tier >= 1 ? "#6ee7b7" // 漢字入門: グリーン
      : "#9ca3af";                  // 見習い書生: グレー

    // Canvas生成
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- 背景グラデーション ---
    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, "#1A1A2E");
    bg.addColorStop(0.5, "#16213E");
    bg.addColorStop(1, "#0F0A1E");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);

    // --- オーブ（背景装飾）---
    ctx.save();
    ctx.globalAlpha = 1;
    const grad1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 280);
    grad1.addColorStop(0, "rgba(124,58,237,0.25)");
    grad1.addColorStop(1, "rgba(124,58,237,0)");
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 500, 400);

    const grad2 = ctx.createRadialGradient(1000, 480, 0, 1000, 480, 300);
    grad2.addColorStop(0, "rgba(251,191,36,0.2)");
    grad2.addColorStop(1, "rgba(251,191,36,0)");
    ctx.fillStyle = grad2;
    ctx.fillRect(700, 280, 500, 350);

    const grad3 = ctx.createRadialGradient(600, 315, 0, 600, 315, 350);
    grad3.addColorStop(0, "rgba(59,130,246,0.12)");
    grad3.addColorStop(1, "rgba(59,130,246,0)");
    ctx.fillStyle = grad3;
    ctx.fillRect(250, 0, 700, 630);
    ctx.restore();

    // --- グラスモーフィズムカード ---
    const cardX = 80, cardY = 60, cardW = 1040, cardH = 510;
    const cardRadius = 32;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cardX + cardRadius, cardY);
    ctx.lineTo(cardX + cardW - cardRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardRadius);
    ctx.lineTo(cardX + cardW, cardY + cardH - cardRadius);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardRadius, cardY + cardH);
    ctx.lineTo(cardX + cardRadius, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardRadius);
    ctx.lineTo(cardX, cardY + cardRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // --- ゲーム名 ---
    ctx.save();
    ctx.font = "bold 38px 'Arial', sans-serif";
    ctx.fillStyle = "rgba(167,139,250,0.9)";
    ctx.textAlign = "center";
    ctx.fillText(gameName, 600, 145);
    ctx.restore();

    // --- スコア数値（金色グロー） ---
    ctx.save();
    ctx.font = "black 160px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(251,191,36,0.7)";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#FBBF24";
    ctx.fillText(score.toLocaleString(), 600, 340);
    ctx.shadowBlur = 0;
    ctx.restore();

    // pt ラベル
    ctx.save();
    ctx.font = "bold 48px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(251,191,36,0.7)";
    ctx.fillText("pt", 600, 395);
    ctx.restore();

    // --- ランク表示 ---
    const rankBadgeX = 600;
    const rankBadgeY = 455;
    ctx.save();
    ctx.font = "bold 52px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = rankColor;
    ctx.shadowBlur = 30;
    ctx.fillStyle = rankColor;
    ctx.fillText(rank.label, rankBadgeX, rankBadgeY);
    ctx.shadowBlur = 0;
    ctx.restore();

    // --- URL ---
    ctx.save();
    ctx.font = "24px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(167,139,250,0.6)";
    ctx.fillText(gameUrl, 600, 530);
    ctx.restore();

    // --- ハッシュタグ ---
    ctx.save();
    ctx.font = "22px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(167,139,250,0.45)";
    ctx.fillText(hashtags.map(t => `#${t}`).join("  "), 600, 562);
    ctx.restore();

    // --- 画像ダウンロード ---
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `jitama_score_${score}.png`;
    link.click();

    // --- Xシェア ---
    const rank2 = getRankFromScore(score);
    const text = `字玉JITAMAでスコア${score.toLocaleString()}pt達成！段位：${rank2.label}\n${hashtags.map(t => `#${t}`).join(" ")}\n${gameUrl}`;
    setTimeout(() => {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }, 500);
  }, [score, gameName, gameUrl, hashtags]);

  return { generateAndShare };
}

// ボタンコンポーネント（KanjiGame.tsx から呼び出す用）
export default function ShareScoreCardButton({
  score,
  gameName,
  gameUrl,
  hashtags,
}: ShareScoreCardProps) {
  const { generateAndShare } = useShareScoreCard({ score, gameName, gameUrl, hashtags });

  return (
    <button
      onClick={generateAndShare}
      aria-label="スコア画像をダウンロードしてXでシェアする"
      className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl mb-2 transition-colors"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid rgba(251,191,36,0.4)",
        color: "#FBBF24",
        boxShadow: "0 0 16px rgba(251,191,36,0.2)",
        minHeight: 44,
      }}
    >
      {/* 画像+Xアイコン */}
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="14" rx="2" stroke="#FBBF24" strokeWidth="1.8" />
        <path d="M3 17l5-5 3 3 4-4 6 6" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      スコア画像を作ってXでシェア
      <svg viewBox="0 0 24 24" width={14} height={14} fill="#FBBF24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </button>
  );
}

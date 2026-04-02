"use client";

import { useEffect, useState } from "react";
import { loadStreak, updateStreak, type StreakData } from "@/lib/streak";

const STREAK_KEY = "jitama";

/* Flame SVG */
function FlameSvg({ color = "#fde047" }: { color?: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 24 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="jitamaFlameGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 2 18 10 18 17 C18 23.627 15.314 26 12 26 C8.686 26 6 23.627 6 17 C6 10 12 2 12 2Z"
        fill="url(#jitamaFlameGrad)"
      />
      <path
        d="M12 12 C12 12 15 16 15 20 C15 22.761 13.657 24 12 24 C10.343 24 9 22.761 9 20 C9 16 12 12 12 12Z"
        fill="rgba(255,220,100,0.8)"
      />
    </svg>
  );
}

/* Shield SVG */
function ShieldSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" fill="#818cf8" opacity="0.85" />
    </svg>
  );
}

export default function StreakBanner() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = loadStreak(STREAK_KEY);
    setStreakData(data);
    setMounted(true);
  }, []);

  if (!mounted || !streakData || streakData.count < 2) return null;

  const streak = streakData.count;
  const isWeekComplete = streak >= 7;
  const flameColor = streak >= 30 ? "#FFD93D" : streak >= 7 ? "#FF8C42" : "#fde047";

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold min-h-[44px] mb-4"
      style={{
        background: isWeekComplete
          ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(168,85,247,0.2) 100%)"
          : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        border: isWeekComplete
          ? "1px solid rgba(234,179,8,0.45)"
          : "1px solid rgba(255,255,255,0.12)",
        color: flameColor,
        boxShadow: isWeekComplete
          ? "0 0 20px rgba(234,179,8,0.4)"
          : "0 0 12px rgba(234,179,8,0.2)",
      }}
      aria-label={`${streak}日連続プレイ中`}
    >
      <FlameSvg color={flameColor} />
      {isWeekComplete ? (
        <span>{streak}日連続 — 今週クリア！</span>
      ) : (
        <span>{streak}日連続プレイ中！</span>
      )}
      {streakData.shieldCount > 0 && (
        <span
          className="flex items-center gap-0.5 text-xs opacity-75"
          aria-label={`シールド残${streakData.shieldCount}回`}
        >
          <ShieldSvg />
          {streakData.shieldCount}
        </span>
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  angle: number;
}

interface MergeParticleProps {
  /** 発火する漢字レベル（0-11）。変わるたびにバーストする */
  triggerLevel: number | null;
  /** バースト中心のX座標（px）。未指定時は画面中央 */
  x?: number;
  /** バースト中心のY座標（px）。未指定時は画面中央 */
  y?: number;
}

const GOLD_COLORS = [
  "#ffd700", "#ffed4a", "#f59e0b", "#d97706",
  "#dc2626", "#c2410c", "#7c3aed", "#ffffff",
];

let particleCounter = 0;

const MergeParticle: React.FC<MergeParticleProps> = ({ triggerLevel, x, y }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevTriggerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (triggerLevel === null || triggerLevel === prevTriggerRef.current) return;
    prevTriggerRef.current = triggerLevel;

    // 8方向バースト（レベルが高いほど粒が多い）
    const count = Math.min(8 + triggerLevel * 1.5, 20);
    const cx = x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 200);
    const cy = y ?? 300;

    const newParticles: Particle[] = Array.from({ length: Math.floor(count) }, (_, i) => {
      const angle = (i / Math.floor(count)) * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      return {
        id: ++particleCounter,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: GOLD_COLORS[i % GOLD_COLORS.length],
        size: 6 + Math.random() * 8,
        angle,
      };
    });

    setParticles(newParticles);
    startTimeRef.current = performance.now();

    // 1.2秒後に消去
    const timer = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(timer);
  }, [triggerLevel, x, y]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes particle-burst {
          0%   { opacity: 1; transform: translate(var(--px), var(--py)) scale(1) rotate(0deg); }
          60%  { opacity: 0.8; }
          100% { opacity: 0; transform: translate(calc(var(--px) * 3.5), calc(var(--py) * 3.5 + 60px)) scale(0.3) rotate(360deg); }
        }
        @keyframes kanji-pop {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.3); }
          40%  { opacity: 1; transform: translate(-50%,-50%) scale(1.3); }
          70%  { opacity: 1; transform: translate(-50%,-50%) scale(0.9); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(1.1); }
        }
      `}</style>

      {/* 8方向光子パーティクル */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--px" as any]: `${p.vx * 20}px`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--py" as any]: `${p.vy * 20}px`,
            animation: `particle-burst 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            animationDelay: `${Math.random() * 80}ms`,
          }}
        />
      ))}

      {/* 合体漢字スケールポップ */}
      {particles.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: x ?? "50%",
            top: y ?? 300,
            animation: "kanji-pop 1.0s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            fontSize: 48,
            fontWeight: 900,
            color: "#ffd700",
            textShadow: "0 0 30px #ffd700, 0 0 60px #d97706",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default MergeParticle;

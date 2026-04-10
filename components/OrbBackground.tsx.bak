"use client";
import React from "react";

// 漢字/和テーマ: 赤(#dc2626)・金(#d97706)・朱(#c2410c)・紫(#7c3aed)の8オーブ
const orbs = [
  { size: 340, left: 8,  top: 5,  color: "rgba(220,38,38,0.18)",  duration: 9,  delay: 0,   blur: 90 },
  { size: 260, left: 78, top: 12, color: "rgba(217,119,6,0.14)",  duration: 12, delay: 1.5, blur: 80 },
  { size: 300, left: 42, top: 60, color: "rgba(194,65,12,0.16)",  duration: 10, delay: 0.8, blur: 95 },
  { size: 210, left: 88, top: 55, color: "rgba(124,58,237,0.15)", duration: 7,  delay: 2.2, blur: 65 },
  { size: 380, left: 5,  top: 72, color: "rgba(220,38,38,0.10)",  duration: 13, delay: 0.3, blur: 105},
  { size: 190, left: 58, top: 18, color: "rgba(217,119,6,0.12)",  duration: 6,  delay: 1.0, blur: 70 },
  { size: 270, left: 28, top: 38, color: "rgba(124,58,237,0.13)", duration: 11, delay: 3.0, blur: 88 },
  { size: 230, left: 68, top: 82, color: "rgba(194,65,12,0.11)",  duration: 8,  delay: 0.6, blur: 78 },
];

const OrbBackground = React.memo(function OrbBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 40%, #0d1a2e 100%)",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes orbFloat {
          0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.55; }
          25%  { transform: translate(-50%, -50%) translate(16px, -22px) scale(1.07); opacity: 0.85; }
          50%  { transform: translate(-50%, -50%) translate(-10px, -36px) scale(0.93); opacity: 0.65; }
          75%  { transform: translate(-50%, -50%) translate(20px, -14px) scale(1.03); opacity: 0.80; }
          100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.55; }
        }
      `}</style>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            animation: `orbFloat ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
});

export default OrbBackground;

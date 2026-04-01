"use client";
import React, { useEffect, useRef, useState } from "react";

export type MascotPose = "idle" | "correct" | "wrong" | "levelup";

interface Props {
  pose: MascotPose;
  size?: number;
}

// 漢博士（かんはかせ）: 眼鏡・白髪・和服のお爺さん SVGキャラ
function KanjiSensei({ blink, pose }: { blink: boolean; pose: MascotPose }) {
  // ポーズ別のオフセット/回転
  const bodyY = pose === "correct" ? -8 : pose === "levelup" ? -6 : 0;
  const tilt = pose === "wrong" ? "rotate(-8deg)" : pose === "levelup" ? "rotate(5deg)" : "rotate(0deg)";
  const eyeH = blink ? 1 : 7;

  return (
    <svg
      viewBox="0 0 100 120"
      width="100%"
      height="100%"
      style={{ overflow: "visible", transform: tilt, transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      {/* 和服（着物）本体 */}
      <ellipse cx="50" cy={90 + bodyY} rx="28" ry="22" fill="#4a1c6e" />
      <ellipse cx="50" cy={88 + bodyY} rx="24" ry="18" fill="#6b2fa0" />
      {/* 着物の前合わせ */}
      <line x1="50" y1={72 + bodyY} x2="50" y2={108 + bodyY} stroke="#c4a0e8" strokeWidth="2" />
      {/* 帯 */}
      <rect x="30" y={91 + bodyY} width="40" height="6" rx="2" fill="#d97706" opacity="0.9" />

      {/* 首 */}
      <rect x="44" y={64 + bodyY} width="12" height="10" rx="4" fill="#f5d5a0" />

      {/* 頭部 */}
      <ellipse cx="50" cy={52 + bodyY} rx="22" ry="20" fill="#f5d5a0" />

      {/* 白髪（後ろ） */}
      <path d={`M28 ${48 + bodyY} Q20 ${30 + bodyY} 32 ${20 + bodyY}`} stroke="#e8e8e8" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={`M72 ${48 + bodyY} Q80 ${30 + bodyY} 68 ${20 + bodyY}`} stroke="#e8e8e8" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* 白髪（前・分け目） */}
      <path d={`M36 ${34 + bodyY} Q50 ${26 + bodyY} 64 ${34 + bodyY}`} stroke="#e8e8e8" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* 眉毛（白）*/}
      <path d={`M36 ${44 + bodyY} Q40 ${41 + bodyY} 44 ${44 + bodyY}`} stroke="#cccccc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={`M56 ${44 + bodyY} Q60 ${41 + bodyY} 64 ${44 + bodyY}`} stroke="#cccccc" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 眼鏡フレーム */}
      <rect x="33" y={46 + bodyY} width="13" height="eyeH" rx="4" fill="none" stroke="#8b5e3c" strokeWidth="2" />
      <rect x="54" y={46 + bodyY} width="13" height="eyeH" rx="4" fill="none" stroke="#8b5e3c" strokeWidth="2" />
      <line x1="46" y1={49 + bodyY} x2="54" y2={49 + bodyY} stroke="#8b5e3c" strokeWidth="1.5" />
      {/* 眼鏡つる */}
      <line x1="33" y1={49 + bodyY} x2="28" y2={51 + bodyY} stroke="#8b5e3c" strokeWidth="1.5" />
      <line x1="67" y1={49 + bodyY} x2="72" y2={51 + bodyY} stroke="#8b5e3c" strokeWidth="1.5" />

      {/* 目 */}
      <ellipse cx="39.5" cy={50 + bodyY} rx="3" ry={eyeH / 2.2} fill="#2c1810" />
      <ellipse cx="60.5" cy={50 + bodyY} rx="3" ry={eyeH / 2.2} fill="#2c1810" />

      {/* 口（ポーズ別） */}
      {pose === "correct" && (
        <path d={`M43 ${60 + bodyY} Q50 ${66 + bodyY} 57 ${60 + bodyY}`} stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {pose === "wrong" && (
        <path d={`M43 ${63 + bodyY} Q50 ${59 + bodyY} 57 ${63 + bodyY}`} stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {(pose === "idle" || pose === "levelup") && (
        <path d={`M44 ${61 + bodyY} Q50 ${64 + bodyY} 56 ${61 + bodyY}`} stroke="#c2410c" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* 手（左）*/}
      <ellipse cx={28 + (pose === "levelup" ? -4 : 0)} cy={82 + bodyY + (pose === "levelup" ? -10 : 0)} rx="6" ry="5" fill="#f5d5a0"
        style={{ transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }} />

      {/* 扇子（levelupポーズ時） */}
      {pose === "levelup" && (
        <g transform={`translate(20, ${55 + bodyY})`}>
          <path d="M0 0 Q-10 -18 8 -22 Q26 -20 20 0 Z" fill="#d97706" opacity="0.9" />
          <path d="M0 0 Q5 -22 8 -22" stroke="#7c3aed" strokeWidth="1.5" fill="none" />
          <path d="M0 0 Q0 -21 8 -22" stroke="#dc2626" strokeWidth="1.5" fill="none" />
          <path d="M0 0 Q-5 -20 8 -22" stroke="#d97706" strokeWidth="1.5" fill="none" />
          <rect x="-1" y="0" width="3" height="8" rx="1" fill="#8b5e3c" />
        </g>
      )}

      {/* 巻物（correctポーズ時） */}
      {pose === "correct" && (
        <g transform={`translate(68, ${72 + bodyY})`}>
          <rect x="-8" y="-4" width="20" height="14" rx="3" fill="#f5e6c8" stroke="#8b5e3c" strokeWidth="1.5" />
          <line x1="-5" y1="0" x2="9" y2="0" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="-5" y1="4" x2="9" y2="4" stroke="#dc2626" strokeWidth="1" />
          <circle cx="-8" cy="3" r="4" fill="#c4a0e8" />
          <circle cx="12" cy="3" r="4" fill="#c4a0e8" />
        </g>
      )}

      {/* wrongポーズ: 頭を抱える手 */}
      {pose === "wrong" && (
        <>
          <ellipse cx="33" cy={44 + bodyY} rx="7" ry="5" fill="#f5d5a0" transform={`rotate(-20, 33, ${44 + bodyY})`} />
          <ellipse cx="67" cy={44 + bodyY} rx="7" ry="5" fill="#f5d5a0" transform={`rotate(20, 67, ${44 + bodyY})`} />
        </>
      )}

      {/* 汗（wrongポーズ時） */}
      {pose === "wrong" && (
        <ellipse cx="72" cy={42 + bodyY} rx="4" ry="6" fill="#60a5fa" opacity="0.8" transform={`rotate(-20, 72, ${42 + bodyY})`} />
      )}
    </svg>
  );
}

const KanjiMascot: React.FC<Props> = ({ pose, size = 120 }) => {
  const [blink, setBlink] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 4秒ごとに瞬き
  useEffect(() => {
    const schedule = () => {
      blinkTimerRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          schedule();
        }, 150);
      }, 4000 + Math.random() * 1000);
    };
    schedule();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // idle: 呼吸のような浮かび上がりアニメ
  const floatStyle: React.CSSProperties =
    pose === "idle"
      ? {
          animation: "mascot-float 3s ease-in-out infinite",
          willChange: "transform",
        }
      : pose === "correct"
      ? {
          animation: "mascot-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }
      : {};

  return (
    <>
      <style>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes mascot-bounce {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-18px) scale(1.1); }
          70%  { transform: translateY(-8px) scale(0.95); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          width: size,
          height: size * 1.2,
          display: "inline-block",
          ...floatStyle,
        }}
      >
        <KanjiSensei blink={blink} pose={pose} />
      </div>
    </>
  );
};

export default KanjiMascot;

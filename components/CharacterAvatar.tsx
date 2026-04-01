"use client";
import { useEffect, useState } from "react";

export type Emotion = "normal" | "happy" | "sad" | "surprised";

interface CharacterAvatarProps {
  emotion?: Emotion;
  message?: string;
  size?: number;
  className?: string;
}

const EMOTION_CONFIG = {
  normal: { eyeScaleY: 1, mouthPath: "M 35 62 Q 50 68 65 62", eyebrowOffset: 0, blushOpacity: 0, bodyAnimation: "avatar-idle", color: "#FF6B35" },
  happy: { eyeScaleY: 0.3, mouthPath: "M 32 60 Q 50 75 68 60", eyebrowOffset: -3, blushOpacity: 0.7, bodyAnimation: "avatar-bounce", color: "#FF8C42" },
  sad: { eyeScaleY: 1, mouthPath: "M 35 68 Q 50 60 65 68", eyebrowOffset: 4, blushOpacity: 0, bodyAnimation: "avatar-droop", color: "#6B8FBF" },
  surprised: { eyeScaleY: 1.3, mouthPath: "M 44 64 Q 50 72 56 64", eyebrowOffset: -6, blushOpacity: 0.3, bodyAnimation: "avatar-shake", color: "#FF6B35" },
} as const;

export default function CharacterAvatar({ emotion = "normal", message, size = 120, className = "" }: CharacterAvatarProps) {
  const config = EMOTION_CONFIG[emotion];
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const scheduleNextBlink = (): ReturnType<typeof setTimeout> => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); scheduleNextBlink(); }, 150);
      }, delay);
    };
    const timer = scheduleNextBlink();
    return () => clearTimeout(timer);
  }, []);

  const eyeScaleY = blinking ? 0.05 : config.eyeScaleY;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size + (message ? 60 : 0) }}>
      {message && (
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10" style={{ animation: "bubble-appear 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <div className="relative px-3 py-2 text-sm font-bold text-gray-800 rounded-2xl shadow-lg" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.6)", maxWidth: 180, whiteSpace: "nowrap" }}>
            {message}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid rgba(255,255,255,0.92)" }} />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ animation: `${config.bodyAnimation} 2s ease-in-out infinite` }}>
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`キャラクターアバター（${emotion}）`} role="img">
          <ellipse cx="50" cy="95" rx="22" ry="5" fill="rgba(0,0,0,0.12)" style={{ animation: "shadow-pulse 2s ease-in-out infinite" }} />
          <circle cx="50" cy="55" r="28" fill={config.color} />
          <ellipse cx="44" cy="48" rx="10" ry="7" fill="rgba(255,255,255,0.2)" />
          <circle cx="50" cy="30" r="22" fill={config.color} />
          <ellipse cx="43" cy="22" rx="8" ry="6" fill="rgba(255,255,255,0.25)" />
          <ellipse cx="30" cy="24" rx="7" ry="9" fill={config.color} style={{ transform: "rotate(-15deg)", transformOrigin: "30px 24px" }} />
          <ellipse cx="30" cy="24" rx="4" ry="6" fill="rgba(255,255,255,0.4)" style={{ transform: "rotate(-15deg)", transformOrigin: "30px 24px" }} />
          <ellipse cx="70" cy="24" rx="7" ry="9" fill={config.color} style={{ transform: "rotate(15deg)", transformOrigin: "70px 24px" }} />
          <ellipse cx="70" cy="24" rx="4" ry="6" fill="rgba(255,255,255,0.4)" style={{ transform: "rotate(15deg)", transformOrigin: "70px 24px" }} />
          <path d={`M 33 ${22 + config.eyebrowOffset} Q 38 ${19 + config.eyebrowOffset} 43 ${22 + config.eyebrowOffset}`} stroke="rgba(80,40,0,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d={`M 57 ${22 + config.eyebrowOffset} Q 62 ${19 + config.eyebrowOffset} 67 ${22 + config.eyebrowOffset}`} stroke="rgba(80,40,0,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: "38px 28px", transition: "transform 0.08s ease" }}>
            <ellipse cx="38" cy="28" rx="5" ry="5" fill="#2C1810" />
            <ellipse cx="36" cy="26" rx="1.5" ry="1.5" fill="white" />
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: "62px 28px", transition: "transform 0.08s ease" }}>
            <ellipse cx="62" cy="28" rx="5" ry="5" fill="#2C1810" />
            <ellipse cx="60" cy="26" rx="1.5" ry="1.5" fill="white" />
          </g>
          <ellipse cx="28" cy="34" rx="6" ry="4" fill="rgba(255,100,100,0.5)" opacity={config.blushOpacity} />
          <ellipse cx="72" cy="34" rx="6" ry="4" fill="rgba(255,100,100,0.5)" opacity={config.blushOpacity} />
          <ellipse cx="50" cy="33" rx="2" ry="1.5" fill="rgba(80,40,0,0.35)" />
          <path d={config.mouthPath} stroke="rgba(80,40,0,0.6)" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transition: "d 0.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
          <ellipse cx="22" cy="60" rx="7" ry="6" fill={config.color} />
          <ellipse cx="78" cy="60" rx="7" ry="6" fill={config.color} />
          <ellipse cx="40" cy="84" rx="8" ry="6" fill={config.color} />
          <ellipse cx="60" cy="84" rx="8" ry="6" fill={config.color} />
        </svg>
      </div>
      <style>{`
        @keyframes avatar-idle { 0%,100%{transform:translateX(-50%) translateY(0) rotate(0deg)} 25%{transform:translateX(-50%) translateY(-3px) rotate(-1deg)} 75%{transform:translateX(-50%) translateY(-2px) rotate(1deg)} }
        @keyframes avatar-bounce { 0%,100%{transform:translateX(-50%) translateY(0) scaleY(1) scaleX(1)} 20%{transform:translateX(-50%) translateY(-10px) scaleY(1.05) scaleX(0.95)} 40%{transform:translateX(-50%) translateY(0) scaleY(0.92) scaleX(1.08)} 60%{transform:translateX(-50%) translateY(-5px) scaleY(1.02) scaleX(0.98)} 80%{transform:translateX(-50%) translateY(0) scaleY(0.97) scaleX(1.03)} }
        @keyframes avatar-droop { 0%,100%{transform:translateX(-50%) translateY(0) rotate(0deg)} 50%{transform:translateX(-50%) translateY(4px) rotate(-2deg)} }
        @keyframes avatar-shake { 0%,100%{transform:translateX(-50%) rotate(0deg) scale(1)} 15%{transform:translateX(calc(-50% - 4px)) rotate(-3deg) scale(1.05)} 30%{transform:translateX(calc(-50% + 4px)) rotate(3deg) scale(1.05)} 45%{transform:translateX(calc(-50% - 2px)) rotate(-2deg) scale(1.02)} 60%{transform:translateX(calc(-50% + 2px)) rotate(2deg) scale(1.02)} }
        @keyframes shadow-pulse { 0%,100%{transform:scaleX(1);opacity:0.5} 50%{transform:scaleX(0.8);opacity:0.3} }
        @keyframes bubble-appear { from{opacity:0;transform:translateX(-50%) scale(0.6) translateY(8px)} to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}

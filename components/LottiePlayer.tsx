'use client';
import { useEffect } from 'react';

type LottieState = 'idle' | 'happy' | 'sad' | 'fever';

interface Props {
  state: LottieState;
  onComplete?: () => void;
}

// フォールバック版: inline SVGアニメーション（Lottieファイル未配置時）
export function LottiePlayer({ state, onComplete }: Props) {
  useEffect(() => {
    if (state === 'idle') return;
    const duration = state === 'fever' ? 2000 : 800;
    const timer = setTimeout(() => onComplete?.(), duration);
    return () => clearTimeout(timer);
  }, [state, onComplete]);

  if (state === 'idle') return null;

  const isFever = state === 'fever';
  const isHappy = state === 'happy';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isFever ? 'rgba(255,100,0,0.08)' : 'transparent',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes lottie-burst {
          0%   { opacity: 0; transform: scale(0.2) rotate(-10deg); }
          25%  { opacity: 1; transform: scale(1.35) rotate(6deg); }
          55%  { opacity: 1; transform: scale(1.0) rotate(-3deg); }
          85%  { opacity: 0.8; transform: scale(1.05) rotate(1deg); }
          100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
        }
        @keyframes lottie-sad {
          0%   { opacity: 0; transform: scale(0.3) translateY(0); }
          20%  { opacity: 1; transform: scale(1.1) translateY(-8px); }
          60%  { opacity: 1; transform: scale(0.95) translateY(4px); }
          100% { opacity: 0; transform: scale(0.8) translateY(16px); }
        }
        @keyframes lottie-fever {
          0%   { opacity: 0; transform: scale(0.5); }
          15%  { opacity: 1; transform: scale(1.2); }
          50%  { opacity: 1; transform: scale(1.0); }
          80%  { opacity: 0.9; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        @keyframes lottie-sparkle-1 {
          0%   { opacity: 0; transform: translate(0,0) scale(0); }
          30%  { opacity: 1; transform: translate(-40px,-50px) scale(1); }
          100% { opacity: 0; transform: translate(-70px,-90px) scale(0.5); }
        }
        @keyframes lottie-sparkle-2 {
          0%   { opacity: 0; transform: translate(0,0) scale(0); }
          30%  { opacity: 1; transform: translate(50px,-40px) scale(1); }
          100% { opacity: 0; transform: translate(85px,-75px) scale(0.5); }
        }
        @keyframes lottie-sparkle-3 {
          0%   { opacity: 0; transform: translate(0,0) scale(0); }
          30%  { opacity: 1; transform: translate(35px,55px) scale(1); }
          100% { opacity: 0; transform: translate(65px,95px) scale(0.5); }
        }
        @keyframes lottie-sparkle-4 {
          0%   { opacity: 0; transform: translate(0,0) scale(0); }
          30%  { opacity: 1; transform: translate(-45px,45px) scale(1); }
          100% { opacity: 0; transform: translate(-80px,80px) scale(0.5); }
        }
        @keyframes lottie-drop-1 {
          0%   { opacity: 0; transform: translate(0,0); }
          20%  { opacity: 1; transform: translate(-20px, 10px); }
          100% { opacity: 0; transform: translate(-30px, 60px); }
        }
        @keyframes lottie-drop-2 {
          0%   { opacity: 0; transform: translate(0,0); }
          20%  { opacity: 1; transform: translate(15px, 5px); }
          100% { opacity: 0; transform: translate(25px, 55px); }
        }
        @keyframes lottie-fever-ring {
          0%   { opacity: 0; transform: scale(0.6); }
          20%  { opacity: 0.7; transform: scale(1.0); }
          100% { opacity: 0; transform: scale(2.2); }
        }
      `}</style>

      {/* 主SVG演出 */}
      <div style={{ position: 'relative', width: isFever ? '180px' : '120px', height: isFever ? '180px' : '120px' }}>
        {/* フィーバー: 拡散リング */}
        {isFever && (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '3px solid rgba(255,180,0,0.6)',
              animation: 'lottie-fever-ring 2s ease-out forwards',
            }} />
            <div style={{
              position: 'absolute', inset: '12px',
              borderRadius: '50%',
              border: '2px solid rgba(255,120,0,0.5)',
              animation: 'lottie-fever-ring 2s ease-out 0.15s forwards',
            }} />
          </>
        )}

        {/* メインSVG */}
        <svg
          width={isFever ? 180 : 120}
          height={isFever ? 180 : 120}
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            inset: 0,
            animation: isFever
              ? 'lottie-fever 2s cubic-bezier(0.22,1,0.36,1) forwards'
              : isHappy
              ? 'lottie-burst 0.8s cubic-bezier(0.22,1,0.36,1) forwards'
              : 'lottie-sad 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          {isHappy || isFever ? (
            // 正解・フィーバー: 星バースト
            <>
              <circle cx="60" cy="60" r="36" fill={isFever ? 'rgba(255,180,0,0.25)' : 'rgba(255,220,50,0.2)'} />
              {/* 星8本 */}
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const r = isFever ? 44 : 38;
                const x1 = 60 + Math.cos(rad) * 20;
                const y1 = 60 + Math.sin(rad) * 20;
                const x2 = 60 + Math.cos(rad) * r;
                const y2 = 60 + Math.sin(rad) * r;
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isFever ? '#FFD700' : '#FFD93D'}
                    strokeWidth={isFever ? 3.5 : 2.5}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* 中央円 */}
              <circle cx="60" cy="60" r={isFever ? 22 : 16}
                fill={isFever ? '#FF8C42' : '#FFD93D'}
                opacity="0.9"
              />
              {/* 中央小円 */}
              <circle cx="60" cy="60" r={isFever ? 10 : 7}
                fill={isFever ? '#FFD700' : '#FFFACD'}
                opacity="0.95"
              />
            </>
          ) : (
            // 不正解: 水しぶき
            <>
              {/* 雫1 */}
              <ellipse cx="50" cy="55" rx="6" ry="8" fill="#93c5fd" opacity="0.8" />
              {/* 雫2 */}
              <ellipse cx="70" cy="58" rx="5" ry="7" fill="#60a5fa" opacity="0.75" />
              {/* 雫3 */}
              <ellipse cx="60" cy="45" rx="4" ry="6" fill="#a5b4fc" opacity="0.7" />
              {/* X印 */}
              <line x1="46" y1="46" x2="74" y2="74" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
              <line x1="74" y1="46" x2="46" y2="74" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
            </>
          )}
        </svg>

        {/* パーティクル（happy/fever時） */}
        {(isHappy || isFever) && (
          <>
            {[
              { anim: 'lottie-sparkle-1', color: '#FFD93D', size: 8, delay: '0.05s' },
              { anim: 'lottie-sparkle-2', color: '#FF8C42', size: 7, delay: '0.1s' },
              { anim: 'lottie-sparkle-3', color: '#a78bfa', size: 6, delay: '0.15s' },
              { anim: 'lottie-sparkle-4', color: '#34d399', size: 7, delay: '0.08s' },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: p.size, height: p.size,
                borderRadius: '50%',
                background: p.color,
                animation: `${p.anim} ${isFever ? '2s' : '0.8s'} cubic-bezier(0.22,1,0.36,1) ${p.delay} forwards`,
              }} />
            ))}
          </>
        )}

        {/* 雫パーティクル（sad時） */}
        {state === 'sad' && (
          <>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 6, height: 9, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: '#93c5fd',
              animation: 'lottie-drop-1 0.8s ease-out forwards',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 5, height: 8, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: '#60a5fa',
              animation: 'lottie-drop-2 0.8s ease-out 0.1s forwards',
            }} />
          </>
        )}
      </div>
    </div>
  );
}

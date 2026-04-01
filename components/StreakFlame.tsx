'use client';

interface Props {
  streak: number;
}

export function StreakFlame({ streak }: Props) {
  if (streak < 1) return null;

  const level = streak >= 30 ? 'large' : streak >= 7 ? 'medium' : 'small';
  const scale = level === 'large' ? 1.7 : level === 'medium' ? 1.3 : 1.0;
  const speed = level === 'large' ? 0.7 : level === 'medium' ? 1.0 : 1.4;
  const color = streak >= 30 ? '#FFD93D' : streak >= 7 ? '#FF8C42' : '#FF6B35';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
      }}
      aria-label={`${streak}日連続ストリーク`}
    >
      <style>{`
        @keyframes flameWave {
          0%,100% { transform: scaleY(1) skewX(-3deg); }
          50%      { transform: scaleY(1.1) skewX(3deg); }
        }
      `}</style>
      <svg
        width="24"
        height="32"
        viewBox="0 0 24 32"
        aria-hidden="true"
        style={{ animation: `flameWave ${speed}s ease-in-out infinite` }}
      >
        <defs>
          <linearGradient id="flameGradKanji" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path
          d="M12 2 C12 2 18 10 18 17 C18 23.627 15.314 26 12 26 C8.686 26 6 23.627 6 17 C6 10 12 2 12 2Z"
          fill="url(#flameGradKanji)"
        />
        <path
          d="M12 12 C12 12 15 16 15 20 C15 22.761 13.657 24 12 24 C10.343 24 9 22.761 9 20 C9 16 12 12 12 12Z"
          fill="rgba(255,220,100,0.8)"
        />
      </svg>
      <span style={{ fontSize: '14px', fontWeight: 700, color }}>{streak}日</span>
    </div>
  );
}

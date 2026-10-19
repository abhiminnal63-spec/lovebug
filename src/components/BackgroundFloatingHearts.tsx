import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  top?: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  type: 'heart' | 'daisy' | 'sparkle';
}

export const BackgroundFloatingHearts: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const types: ('heart' | 'daisy' | 'sparkle')[] = ['heart', 'daisy', 'heart', 'sparkle', 'heart'];

    for (let i = 0; i < 18; i++) {
      list.push({
        id: i,
        left: `${(i * 5.6 + Math.random() * 3) % 96}%`,
        size: 14 + (i % 4) * 6,
        duration: 16 + (i % 6) * 4,
        delay: (i * 1.5) % 12,
        opacity: 0.25 + (i % 3) * 0.15,
        type: types[i % types.length],
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.left,
            bottom: '-40px',
            animation: `heartFloatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.type === 'heart' && (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="#E66B9A"
              className="drop-shadow-xs"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}

          {p.type === 'daisy' && (
            <div
              className="animate-gentle-sway"
              style={{ width: p.size, height: p.size }}
            >
              <svg viewBox="0 0 36 36" width={p.size} height={p.size}>
                {/* 8 white petals */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                  <ellipse
                    key={idx}
                    cx="18"
                    cy="8"
                    rx="3.5"
                    ry="6.5"
                    fill="#FFFDF7"
                    stroke="#F0D5DF"
                    strokeWidth="0.8"
                    transform={`rotate(${angle} 18 18)`}
                  />
                ))}
                {/* Yellow center */}
                <circle cx="18" cy="18" r="4.5" fill="#FFDA69" />
              </svg>
            </div>
          )}

          {p.type === 'sparkle' && (
            <svg
              width={p.size * 0.9}
              height={p.size * 0.9}
              viewBox="0 0 24 24"
              fill="#E8B575"
              className="animate-twinkle"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

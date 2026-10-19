import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HeartParticle {
  id: string;
  x: number;
  y: number;
  destX: number;
  destY: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
  scaleFactor: number;
}

interface ConfettiHeartOverlayProps {
  triggerKey?: number | string;
  origin?: { x: number; y: number } | null;
  count?: number;
}

const HEART_COLORS = [
  '#E66B9A', // Strawberry blush
  '#FF5E7E', // Bright romantic rose
  '#D7A5E8', // Soft lavender
  '#FF8FA3', // Pastel coral pink
  '#FFB3C6', // Baby pink
  '#B73F65', // Deep berry
  '#FFD166', // Golden champagne sparkle
];

export const ConfettiHeartOverlay: React.FC<ConfettiHeartOverlayProps> = ({
  triggerKey,
  origin,
  count = 32,
}) => {
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  useEffect(() => {
    if (!triggerKey) return;

    // Determine burst origin: use provided coordinates or default to center of viewport
    const startX = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const startY = origin?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 300);

    const newParticles: HeartParticle[] = [];

    for (let i = 0; i < count; i++) {
      // Radial spread: angle from 0 to 2*PI, with varied velocity radius
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 80 + Math.random() * 190;
      
      // Upward buoyancy bias
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - 80 - Math.random() * 120;

      newParticles.push({
        id: `${triggerKey}-${i}-${Date.now()}`,
        x: startX,
        y: startY,
        destX,
        destY,
        size: 16 + Math.floor(Math.random() * 22),
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        rotation: (Math.random() - 0.5) * 60,
        duration: 1.2 + Math.random() * 0.8,
        delay: Math.random() * 0.12,
        scaleFactor: 0.9 + Math.random() * 0.5,
      });
    }

    setParticles(newParticles);

    // Auto cleanup after animation finishes
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2400);

    return () => clearTimeout(timer);
  }, [triggerKey, origin, count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 0,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: p.x + p.destX,
              y: p.y + p.destY,
              scale: [0, 1.35 * p.scaleFactor, 1 * p.scaleFactor, 0.7 * p.scaleFactor],
              opacity: [0, 1, 0.95, 0],
              rotate: [0, p.rotation * 0.5, p.rotation, p.rotation * 1.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.18, 0.89, 0.32, 1], // Custom spring-like cubic bezier
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 drop-shadow-sm will-change-transform"
            style={{ width: p.size, height: p.size }}
          >
            <svg
              viewBox="0 0 24 24"
              width={p.size}
              height={p.size}
              fill={p.color}
              stroke="#FFFDF7"
              strokeWidth="0.75"
              className="drop-shadow-xs"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

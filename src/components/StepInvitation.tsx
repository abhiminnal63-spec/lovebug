import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';

interface StepInvitationProps {
  onYes: (origin?: { x: number; y: number }) => void;
  onDecline: () => void;
}

interface ReactionStage {
  image: string;
  tag: string;
  subtitle: string;
  alt: string;
  noLabel: string;
}

const REACTION_STAGES: ReactionStage[] = [
  {
    image: '/src/assets/images/couple_invitation_1792415502092.jpg',
    tag: '💌 A little question for you 💌',
    subtitle: "I've been wanting to ask you something special.",
    alt: 'Adorable cute couple holding a glowing heart together',
    noLabel: 'no... 🥺',
  },
  {
    image: '/src/assets/images/couple_sad_1792415806306.jpg',
    tag: '🥺 Wait, are you sure? 🥺',
    subtitle: 'Wait... are you really thinking of saying no? 🥺',
    alt: 'Cute couple looking sad and pouting with big teary eyes',
    noLabel: 'hehe, are you sure? 🥺',
  },
  {
    image: '/src/assets/images/couple_heartbroken_1792415807021.jpg',
    tag: '💔 Our Heart is Breaking... 💔',
    subtitle: 'Our little heart is cracking into two... 💔😭',
    alt: 'Cute couple crying tearfully holding a cracked pink heart',
    noLabel: 'pretty please? 💗',
  },
  {
    image: '/src/assets/images/couple_devastated_1792415807351.jpg',
    tag: '🌧️ 100% EMOTIONAL DAMAGE 🌧️',
    subtitle: 'CRITICAL EMOTIONAL DAMAGE! Sobbing waterfalls! 🌧️😭',
    alt: 'Cute couple comically devastated weeping waterfalls of tears under a raincloud',
    noLabel: 'just click YES already! 💕',
  },
];

export const StepInvitation: React.FC<StepInvitationProps> = ({ onYes, onDecline }) => {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Determine stage based on number of dodges / no clicks
  // 0 -> hopeful, 1-2 -> sad, 3-4 -> heartbroken, 5+ -> emotional damage
  const stageIndex =
    dodgeCount === 0
      ? 0
      : dodgeCount <= 2
      ? 1
      : dodgeCount <= 4
      ? 2
      : 3;

  const currentStage = REACTION_STAGES[stageIndex];

  // Perform playful dodge within safe container bounds and trigger stage transition
  const handleDodge = () => {
    sound.playBoing();
    setDodgeCount((prev) => prev + 1);

    if (containerRef.current && noButtonRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = noButtonRef.current.getBoundingClientRect();

      // Keep button strictly inside container bounds without escaping
      const maxX = (containerRect.width - btnRect.width) / 2 - 20;
      const maxY = 65; // Up/down safe displacement

      // Generate a new random offset away from center
      const randomX = (Math.random() * 2 - 1) * Math.max(20, maxX);
      const randomY = (Math.random() * 2 - 1) * maxY;

      setNoPosition({
        x: Math.round(randomX),
        y: Math.round(randomY),
      });
    } else {
      const offsets = [
        { x: -50, y: 30 },
        { x: 50, y: -25 },
        { x: -40, y: -30 },
        { x: 45, y: 35 },
      ];
      setNoPosition(offsets[dodgeCount % offsets.length]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4 py-6">
      {/* Warm Ivory Main Card */}
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-xl p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-300">
        {/* Decorative corner ribbons & daisies */}
        <div className="absolute -top-3 -right-3 text-2xl select-none rotate-12">🌸</div>
        <div className="absolute -top-3 -left-3 text-2xl select-none -rotate-12">🌼</div>

        {/* Dynamic Header Ribbon / Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FBE8EE] border border-[#F0D5DF] text-xs font-bold text-[#E66B9A] tracking-wider uppercase mb-3 shadow-xs transition-all">
          <span>{currentStage.tag}</span>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#542B3D] tracking-wide mb-1 font-romantic">
          🌼 I have a tiny question for you... 🌼
        </h2>

        {/* Dynamic Subtitle */}
        <p className="text-xs sm:text-sm text-[#8C6A79] mb-4 min-h-[20px] transition-all font-medium">
          {currentStage.subtitle}
        </p>

        {/* Progressive Reaction Image with Smooth Crossfade */}
        <div className="relative mx-auto my-3 w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-radial from-[#FBE8EE] to-transparent rounded-full -z-10 transform scale-95" />
          <AnimatePresence mode="wait">
            <motion.img
              key={currentStage.image}
              src={currentStage.image}
              alt={currentStage.alt}
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full h-full object-contain rounded-3xl drop-shadow-md select-none will-change-transform"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
        </div>

        {/* Big Romantic Question */}
        <div className="my-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#B73F65] leading-snug font-romantic">
            Will you go on a date with me? 💗
          </h1>
        </div>

        {/* Interactive Buttons Container */}
        <div
          ref={containerRef}
          className="relative min-h-[125px] flex flex-col items-center justify-center gap-3 mt-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            {/* YES Button - Prominent Strawberry Pink Pill that progressively expands */}
            <button
              onClick={(e) => {
                sound.playCelebration();
                onYes({ x: e.clientX, y: e.clientY });
              }}
              className="bg-[#E66B9A] hover:bg-[#D95386] active:scale-95 text-white font-extrabold text-base sm:text-lg px-8 py-3.5 rounded-full shadow-lg shadow-[#E66B9A]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 will-change-transform"
              style={{
                transform: `scale(${1 + Math.min(dodgeCount * 0.08, 0.5)})`,
              }}
            >
              <span>YES, ABSOLUTELY! 💕</span>
            </button>

            {/* NO Button - Playful Dodging Button changing label & triggering damage stages */}
            <button
              ref={noButtonRef}
              onMouseEnter={handleDodge}
              onTouchStart={handleDodge}
              onClick={handleDodge}
              style={{
                transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                transition: 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="bg-[#F8DCE6] hover:bg-[#F2CCD9] text-[#542B3D] font-bold text-sm px-5 py-3 rounded-full border border-[#F0D5DF] shadow-xs cursor-pointer select-none will-change-transform"
              aria-label="No option"
            >
              <span>{currentStage.noLabel}</span>
            </button>
          </div>

          {/* Gentle Respectful Alternative for Consent */}
          <div className="mt-4 pt-2">
            <button
              onClick={() => {
                sound.playSoftTap();
                onDecline();
              }}
              className="text-xs text-[#8C6A79] hover:text-[#542B3D] underline underline-offset-4 decoration-[#F0D5DF] hover:decoration-[#E66B9A] transition-colors cursor-pointer"
            >
              I would rather not
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

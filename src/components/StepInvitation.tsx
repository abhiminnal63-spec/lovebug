
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';

import invitationImage from '../assets/images/couple_invitation_1792415502092.jpg';
import sadImage from '../assets/images/couple_sad_1792415806306.jpg';
import heartbrokenImage from '../assets/images/couple_heartbroken_1792415807021.jpg';
import devastatedImage from '../assets/images/couple_devastated_1792415807351.jpg';

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
    image: invitationImage,
    tag: '💌 A little question for you 💌',
    subtitle: "I've been wanting to ask you something special.",
    alt: 'Cute couple holding a glowing heart together',
    noLabel: 'no... 🥺',
  },
  {
    image: sadImage,
    tag: '🥺 Wait, are you sure? 🥺',
    subtitle: 'Wait... are you really thinking of saying no? 🥺',
    alt: 'Cute couple looking sad with teary eyes',
    noLabel: 'hehe, are you sure? 🥺',
  },
  {
    image: heartbrokenImage,
    tag: '💔 Our Heart is Breaking... 💔',
    subtitle: 'Our little heart is cracking into two... 💔😭',
    alt: 'Cute couple crying while holding a broken heart',
    noLabel: 'pretty please? 💗',
  },
  {
    image: devastatedImage,
    tag: '🌧️ 100% EMOTIONAL DAMAGE 🌧️',
    subtitle: 'CRITICAL EMOTIONAL DAMAGE! Sobbing waterfalls! 🌧️😭',
    alt: 'Cute couple comically devastated under a raincloud',
    noLabel: 'just click YES already! 💕',
  },
];

export const StepInvitation: React.FC<StepInvitationProps> = ({
  onYes,
  onDecline,
}) => {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const stageIndex =
    dodgeCount === 0 ? 0 :
    dodgeCount <= 2 ? 1 :
    dodgeCount <= 4 ? 2 : 3;

  const currentStage = REACTION_STAGES[stageIndex];

  const handleDodge = () => {
    sound.playBoing();
    setDodgeCount((previous) => previous + 1);

    if (containerRef.current && noButtonRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = noButtonRef.current.getBoundingClientRect();

      const maxX = Math.max(
        20,
        (containerRect.width - buttonRect.width) / 2 - 20
      );
      const maxY = 45;

      setNoPosition({
        x: Math.round((Math.random() * 2 - 1) * maxX),
        y: Math.round((Math.random() * 2 - 1) * maxY),
      });
    } else {
      const offsets = [
        { x: -40, y: 25 },
        { x: 40, y: -20 },
        { x: -30, y: -25 },
        { x: 30, y: 25 },
      ];

      setNoPosition(offsets[dodgeCount % offsets.length]);
    }
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-md px-4 py-6">
      <div className="relative overflow-hidden rounded-[28px] border-2 border-[#F0D5DF] bg-[#FFFDF7] p-6 text-center shadow-xl transition-all duration-300 sm:p-8">
        <div className="absolute -right-3 -top-3 rotate-12 select-none text-2xl">
          🌸
        </div>
        <div className="absolute -left-3 -top-3 -rotate-12 select-none text-2xl">
          🌼
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#F0D5DF] bg-[#FBE8EE] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E66B9A] shadow-sm">
          <span>{currentStage.tag}</span>
        </div>

        <h2 className="mb-1 font-romantic text-xl font-bold tracking-wide text-[#542B3D] sm:text-2xl">
          🌼 I have a tiny question for you... 🌼
        </h2>

        <p className="mb-4 min-h-[20px] text-xs font-medium text-[#8C6A79] transition-all sm:text-sm">
          {currentStage.subtitle}
        </p>

        <div className="relative mx-auto my-3 flex h-52 w-52 items-center justify-center overflow-hidden rounded-full sm:h-60 sm:w-60">
          <div className="absolute inset-0 rounded-full bg-[#FBE8EE] opacity-60" />

          <AnimatePresence mode="wait">
            <motion.img
              key={currentStage.image}
              src={currentStage.image}
              alt={currentStage.alt}
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="relative h-full w-full select-none object-contain drop-shadow-md"
              draggable={false}
              onError={(event) => {
                console.error(
                  'Failed to load invitation image:',
                  event.currentTarget.src
                );
              }}
            />
          </AnimatePresence>
        </div>

        <div className="my-4">
          <h1 className="font-romantic text-2xl font-extrabold leading-snug text-[#B73F65] sm:text-3xl">
            Will you go on a date with me? 💗
          </h1>
        </div>

        <div
          ref={containerRef}
          className="relative mt-4 flex min-h-[125px] flex-col items-center justify-center gap-3"
        >
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                sound.playCelebration();
                onYes({
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#E66B9A] px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#E66B9A]/30 transition-colors hover:bg-[#D95386] active:scale-95 sm:text-lg"
              style={{
                transform: `scale(${1 + Math.min(dodgeCount * 0.08, 0.5)})`,
              }}
            >
              <span>YES, ABSOLUTELY! 💕</span>
            </button>

            <button
              ref={noButtonRef}
              type="button"
              onMouseEnter={handleDodge}
              onTouchStart={handleDodge}
              onClick={handleDodge}
              style={{
                transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                transition:
                  'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="cursor-pointer select-none rounded-full border border-[#F0D5DF] bg-[#F8DCE6] px-5 py-3 text-sm font-bold text-[#542B3D] shadow-sm hover:bg-[#F2CCD9]"
              aria-label="No option"
            >
              <span>{currentStage.noLabel}</span>
            </button>
          </div>

          <div className="mt-4 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playSoftTap();
                onDecline();
              }}
              className="cursor-pointer text-xs text-[#8C6A79] underline decoration-[#F0D5DF] underline-offset-4 transition-colors hover:text-[#542B3D] hover:decoration-[#E66B9A]"
            >
              I would rather not
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
            

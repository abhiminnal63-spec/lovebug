import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import celebrationSticker from '../assets/images/celebration_sticker_1792412861747.jpg';
import coupleCelebration from '../assets/images/couple_celebration_1792415502796.jpg';

interface StepCelebrationProps {
  onNext: () => void;
}

export const StepCelebration: React.FC<StepCelebrationProps> = ({ onNext }) => {
  useEffect(() => {
    sound.playCelebration();

    // Gentle pastel confetti burst
    const end = Date.now() + 1200;
    const colors = ['#E66B9A', '#D7A5E8', '#FFB7D5', '#FFE5A3', '#FFFDF7'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4 py-6">
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden transition-all">
        {/* Celebration Badges */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFE3EB] border border-[#F0D5DF] text-xs font-extrabold text-[#B73F65] tracking-wider uppercase mb-3 shadow-xs animate-bounce">
          <span>🎉 BEST NEWS EVER! 🎉</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#B73F65] tracking-wide mb-2 font-romantic leading-snug">
          WAIT... YOU SAID YES?! 🥹💗
        </h1>

        <p className="text-sm sm:text-base text-[#8C6A79] mb-4">
          I was practicing my happy dance just in case!
        </p>

        {/* Happy Couple Image with Celebration Sticker Backdrop */}
        <div className="relative mx-auto my-3 w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
          <img
            src={celebrationSticker}
            alt="Celebration sparkle sticker background"
            className="absolute inset-0 w-full h-full object-contain opacity-40 scale-110 pointer-events-none rounded-3xl"
            referrerPolicy="no-referrer"
          />
          <img
            src={coupleCelebration}
            alt="Adorable happy cute couple leaping in joy"
            className="relative z-10 w-full h-full object-contain rounded-3xl animate-float-slow drop-shadow-md select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Cute quote */}
        <div className="my-4 px-4 py-2 bg-[#FBE8EE]/60 rounded-2xl border border-[#F0D5DF]">
          <p className="text-xs text-[#542B3D] italic">
            "My heart is doing the happiest dance right now!" 💑✨
          </p>
        </div>

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              sound.playSoftTap();
              onNext();
            }}
            className="w-full bg-[#E66B9A] hover:bg-[#D95386] active:scale-95 text-white font-extrabold text-base sm:text-lg py-3.5 px-6 rounded-full shadow-lg shadow-[#E66B9A]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>okay okay, what's next? →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

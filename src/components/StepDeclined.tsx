
import React from 'react';
import { sound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';
import gentleCouple from '../assets/images/couple_gentle_1792415503612.jpg';

interface StepDeclinedProps {
  onRestart: () => void;
}

export const StepDeclined: React.FC<StepDeclinedProps> = ({
  onRestart,
}) => {
  return (
    <div className="relative z-10 mx-auto w-full max-w-md px-4 py-8">
      <div className="relative overflow-hidden rounded-[28px] border-2 border-[#F0D5DF] bg-[#FFFDF7] p-6 text-center shadow-xl sm:p-8">
        {/* Header tag */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#F0D5DF] bg-[#FBE8EE] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8C6A79] shadow-sm">
          <span>🌷 With Appreciation 🌷</span>
        </div>

        {/* Heading */}
        <h1 className="mb-3 font-romantic text-2xl font-bold text-[#542B3D] sm:text-3xl">
          Thank you for being honest 🌷
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-[#8C6A79] sm:text-base">
          No pressure at all! You are wonderful, and your feelings always
          matter most. Wishing you a truly lovely day filled with warmth
          and sweet moments.
        </p>

        {/* Gentle couple image */}
        <div className="mx-auto my-4 flex h-52 w-full max-w-[220px] items-center justify-center">
          <img
            src={gentleCouple}
            alt="Gentle sweet couple smiling and waving warmly"
            className="h-full w-full rounded-2xl object-contain drop-shadow-sm"
            loading="eager"
            onError={(event) => {
              console.error(
                'Failed to load the gentle couple image:',
                event.currentTarget.src
              );
            }}
          />
        </div>

        {/* Start over button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              onRestart();
            }}
            className="mx-auto flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#F0D5DF] bg-[#F8DCE6] px-6 py-3 text-sm font-bold text-[#542B3D] transition-all hover:bg-[#F2CCD9] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>start over ↻</span>
          </button>
        </div>
      </div>
    </div>
  );
};

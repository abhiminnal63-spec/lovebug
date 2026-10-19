import React from 'react';
import { sound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';

interface StepDeclinedProps {
  onRestart: () => void;
}

export const StepDeclined: React.FC<StepDeclinedProps> = ({ onRestart }) => {
  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4 py-8">
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FBE8EE] border border-[#F0D5DF] text-xs font-bold text-[#8C6A79] tracking-wider uppercase mb-3 shadow-xs">
          <span>🌷 With Appreciation 🌷</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#542B3D] mb-3 font-romantic">
          Thank you for being honest 🌷
        </h1>

        <p className="text-sm text-[#8C6A79] leading-relaxed mb-6">
          No pressure at all! You are wonderful, and your feelings always matter most. Wishing you a truly lovely day filled with warmth and sweet moments.
        </p>

        {/* Gentle couple gesture */}
        <div className="w-44 h-44 mx-auto my-4 flex items-center justify-center">
          <img
            src="/src/assets/images/couple_gentle_1792415503612.jpg"
            alt="Gentle sweet couple smiling and waving warmly"
            className="w-full h-full object-contain rounded-2xl drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Start over button */}
        <div className="mt-6">
          <button
            onClick={() => {
              sound.playSoftTap();
              onRestart();
            }}
            className="bg-[#F8DCE6] hover:bg-[#F2CCD9] text-[#542B3D] font-bold text-sm px-6 py-3 rounded-full border border-[#F0D5DF] transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>start over ↻</span>
          </button>
        </div>
      </div>
    </div>
  );
};

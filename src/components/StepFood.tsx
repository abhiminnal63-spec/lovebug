import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { FoodOption } from '../types';

interface StepFoodProps {
  initialFood: string;
  onNext: (food: string) => void;
  onBack: () => void;
}

export const FOOD_OPTIONS: FoodOption[] = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕', tagline: 'Cheesy slices & smiles' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣', tagline: 'Fresh rolls & chopsticks' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔', tagline: 'Gourmet patties & fries' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝', tagline: 'Romantic candlelight noodles' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮', tagline: 'Fiesta crunch & flavor' },
  { id: 'ramen', label: 'Ramen', emoji: '🍜', tagline: 'Warm comforting broth' },
  { id: 'surprise', label: 'Surprise me', emoji: '🎁', tagline: "A secret chef's special" },
];

export const StepFood: React.FC<StepFoodProps> = ({
  initialFood,
  onNext,
  onBack,
}) => {
  const [selectedFood, setSelectedFood] = useState<string>(initialFood || 'pasta');

  const handleSelect = (id: string) => {
    sound.playSoftTap();
    setSelectedFood(id);
  };

  const handleContinue = () => {
    sound.playSoftTap();
    onNext(selectedFood);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 px-4 py-6">
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-xl p-6 sm:p-8 relative">
        {/* Back Button */}
        <button
          onClick={() => {
            sound.playSoftTap();
            onBack();
          }}
          className="absolute top-5 left-5 p-2 rounded-full text-[#8C6A79] hover:text-[#542B3D] hover:bg-[#FBE8EE] transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="text-center mb-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#FBE8EE] border border-[#F0D5DF] text-xs font-bold text-[#E66B9A] tracking-wider uppercase shadow-xs">
            Step 2 of 4 • Feast
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#542B3D] text-center mb-1 font-romantic">
          What are we craving, cutie? 🍓
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A79] text-center mb-6">
          Pick your date-night vibe.
        </p>

        {/* Food Cards Grid: 3 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {FOOD_OPTIONS.map((item) => {
            const isSelected = selectedFood === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative p-3.5 rounded-[20px] text-center flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#FFEBF2] border-2 border-[#E66B9A] shadow-md scale-[1.03]'
                    : 'bg-[#FFFDF7] border border-[#F0D5DF] hover:bg-[#FBE8EE]/60 hover:-translate-y-0.5'
                }`}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E66B9A] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}

                <span className="text-3xl sm:text-4xl mb-1.5 transform hover:scale-110 transition-transform">
                  {item.emoji}
                </span>

                <span className="text-sm font-extrabold text-[#542B3D] mb-0.5">
                  {item.label}
                </span>

                <span className="text-[11px] text-[#8C6A79] line-clamp-1">
                  {item.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected preview chip */}
        <div className="text-center mb-5">
          <p className="text-xs text-[#8C6A79]">
            Craving:{' '}
            <span className="font-bold text-[#E66B9A]">
              {FOOD_OPTIONS.find((f) => f.id === selectedFood)?.emoji}{' '}
              {FOOD_OPTIONS.find((f) => f.id === selectedFood)?.label}
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-[#E66B9A] hover:bg-[#D95386] active:scale-95 text-white font-extrabold text-base py-3.5 px-6 rounded-full shadow-lg shadow-[#E66B9A]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>perfect, let's go! 💕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

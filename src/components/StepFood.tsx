
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
  {
    id: 'chaya_kadi',
    label: 'Chaya & Kadi',
    emoji: '☕',
    tagline: 'Chaya, pazhampori & snacks',
  },
  {
    id: 'mandi',
    label: 'Mandi',
    emoji: '🍗',
    tagline: 'A feast to share together',
  },
  {
    id: 'dessert',
    label: 'Desserts',
    emoji: '🍰',
    tagline: 'Something sweet for us',
  },
  {
    id: 'kerala_meals',
    label: 'Kerala Meals',
    emoji: '🍛',
    tagline: 'Naadan food favourites',
  },
  {
    id: 'biriyani',
    label: 'Biriyani',
    emoji: '🍲',
    tagline: 'Aromatic and delicious',
  },
  {
    id: 'shawarma',
    label: 'Shawarma',
    emoji: '🌯',
    tagline: 'Spicy street-food favourite',
  },
  {
    id: 'ice_cream',
    label: 'Ice Cream',
    emoji: '🍨',
    tagline: 'A cool little treat',
  },
  {
    id: 'surprise',
    label: 'Surprise me',
    emoji: '🎁',
    tagline: 'Let it be a sweet surprise',
  },
];

export const StepFood: React.FC<StepFoodProps> = ({
  initialFood,
  onNext,
  onBack,
}) => {
  const validInitialFood = FOOD_OPTIONS.some(
    (item) => item.id === initialFood
  )
    ? initialFood
    : 'mandi';

  const [selectedFood, setSelectedFood] =
    useState<string>(validInitialFood);

  const handleSelect = (id: string) => {
    sound.playSoftTap();
    setSelectedFood(id);
  };

  const handleContinue = () => {
    sound.playSoftTap();
    onNext(selectedFood);
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-6">
      <div className="relative rounded-[28px] border-2 border-[#F0D5DF] bg-[#FFFDF7] p-6 shadow-xl sm:p-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => {
            sound.playSoftTap();
            onBack();
          }}
          className="absolute left-5 top-5 cursor-pointer rounded-full p-2 text-[#8C6A79] transition-all hover:bg-[#FBE8EE] hover:text-[#542B3D]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Header tag */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-[#F0D5DF] bg-[#FBE8EE] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E66B9A] shadow-sm">
            Step 2 of 4 • Feast
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-1 text-center font-romantic text-2xl font-bold text-[#542B3D] sm:text-3xl">
          Entha kazhikkan thonnunne, cutie? 🍓
        </h1>

        <p className="mb-6 text-center text-xs text-[#8C6A79] sm:text-sm">
          Pick your perfect date-night feast.
        </p>

        {/* Responsive food-card grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FOOD_OPTIONS.map((item) => {
            const isSelected = selectedFood === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-pressed={isSelected}
                className={`relative flex cursor-pointer select-none flex-col items-center justify-center rounded-[20px] p-3.5 text-center transition-all ${
                  isSelected
                    ? 'scale-[1.03] border-2 border-[#E66B9A] bg-[#FFEBF2] shadow-md'
                    : 'border border-[#F0D5DF] bg-[#FFFDF7] hover:-translate-y-0.5 hover:bg-[#FBE8EE]/60'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E66B9A] text-[10px] text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}

                <span className="mb-1.5 text-3xl transition-transform hover:scale-110 sm:text-4xl">
                  {item.emoji}
                </span>

                <span className="mb-0.5 text-sm font-extrabold text-[#542B3D]">
                  {item.label}
                </span>

                <span className="line-clamp-1 text-[11px] text-[#8C6A79]">
                  {item.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected food preview */}
        <div className="mb-5 text-center">
          <p className="text-xs text-[#8C6A79]">
            Craving:{' '}
            <span className="font-bold text-[#E66B9A]">
              {FOOD_OPTIONS.find(
                (item) => item.id === selectedFood
              )?.emoji}{' '}
              {FOOD_OPTIONS.find(
                (item) => item.id === selectedFood
              )?.label}
            </span>
          </p>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E66B9A] px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#E66B9A]/30 transition-all hover:-translate-y-0.5 hover:bg-[#D95386] active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>perfect, let's go! 💕</span>
        </button>
      </div>
    </div>
  );
};

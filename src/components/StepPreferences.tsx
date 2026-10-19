import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, Check, Heart, Sparkles } from 'lucide-react';

interface StepPreferencesProps {
  initialPreferences: string[];
  initialNote: string;
  onNext: (preferences: string[], note: string) => void;
  onBack: () => void;
}

const PREFERENCE_OPTIONS = [
  { id: 'cozy', label: 'Somewhere cozy 🕯️', desc: 'Soft warm lighting & quiet booths' },
  { id: 'photos', label: "Let's take cute pictures 📸", desc: 'Polaroids & sweet photo spots' },
  { id: 'surprise', label: 'A little surprise, please 🎁', desc: 'A tiny sweet gift or flowers' },
  { id: 'quality_time', label: 'Just us and good food 💗', desc: 'Deep talks & endless laughs' },
];

export const StepPreferences: React.FC<StepPreferencesProps> = ({
  initialPreferences,
  initialNote,
  onNext,
  onBack,
}) => {
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(initialPreferences || []);
  const [note, setNote] = useState<string>(initialNote || '');

  const togglePreference = (id: string) => {
    sound.playSoftTap();
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    sound.playSoftTap();
    onNext(selectedPrefs, note);
  };

  const handleSkip = () => {
    sound.playSoftTap();
    onNext([], '');
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4 py-6">
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
            Step 3 of 4 • Vibes
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#542B3D] text-center mb-1 font-romantic">
          A few little details 💌
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A79] text-center mb-5">
          Let's make it feel just right.
        </p>

        {/* Preference Chips */}
        <div className="space-y-2.5 mb-5">
          <label className="block text-xs font-bold text-[#542B3D] uppercase tracking-wider">
            Choose our date vibes (tap any that sound fun)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREFERENCE_OPTIONS.map((item) => {
              const isSelected = selectedPrefs.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePreference(item.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#FFEBF2] border-2 border-[#E66B9A] shadow-xs'
                      : 'bg-[#FFFDF7] border border-[#F0D5DF] hover:bg-[#FBE8EE]/60'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#E66B9A] border-[#E66B9A] text-white'
                        : 'border-[#D9BDCC] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#542B3D] leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[#8C6A79] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Note Field */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="additional-note"
              className="text-xs font-bold text-[#542B3D] uppercase tracking-wider"
            >
              Anything else I should know? 🌸
            </label>
            <span className="text-[11px] text-[#8C6A79]">
              {note.length}/300
            </span>
          </div>
          <textarea
            id="additional-note"
            maxLength={300}
            rows={3}
            placeholder="Dietary preferences, favorite sweet treats, songs you love, or just a sweet hello..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#FFFDF7] border-2 border-[#F0D5DF] focus:border-[#E66B9A] focus:outline-none rounded-[14px] p-3 text-xs text-[#542B3D] placeholder-[#A88B98] shadow-inner transition-colors resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-[#E66B9A] hover:bg-[#D95386] active:scale-95 text-white font-extrabold text-base py-3.5 px-6 rounded-full shadow-lg shadow-[#E66B9A]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>one last little surprise →</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-xs font-bold text-[#8C6A79] hover:text-[#542B3D] py-2 transition-colors cursor-pointer"
          >
            skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

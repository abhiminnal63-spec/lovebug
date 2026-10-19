import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';

interface StepDateTimeProps {
  initialDate: string;
  initialTime: string;
  onNext: (date: string, time: string) => void;
  onBack: () => void;
}

export const StepDateTime: React.FC<StepDateTimeProps> = ({
  initialDate,
  initialTime,
  onNext,
  onBack,
}) => {
  const [date, setDate] = useState<string>(initialDate);
  const [time, setTime] = useState<string>(initialTime || '6:00 PM');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate today's date in YYYY-MM-DD for min validation
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${year}-${month}-${day}`;

  const timeOptions = [
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
  ];

  // Friendly date preview
  const getFormattedDatePreview = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      return parsed.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleContinue = () => {
    sound.playSoftTap();
    if (!date) {
      setErrorMessage('Please pick a lovely day for our date! 📅');
      return;
    }
    if (date < minDateStr) {
      setErrorMessage('Please pick today or a future date! Time travel is still in beta 🕰️');
      return;
    }
    if (!time) {
      setErrorMessage('Please select what time works best for you! ⏰');
      return;
    }

    setErrorMessage(null);
    onNext(date, time);
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
            Step 1 of 4 • Scheduling
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#542B3D] text-center mb-1 font-romantic">
          Let's make a little memory 🌷
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A79] text-center mb-6">
          When would you like our little adventure to begin?
        </p>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Pick a Day */}
          <div>
            <label
              htmlFor="date-input"
              className="block text-sm font-bold text-[#542B3D] mb-2 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-[#E66B9A]" />
              Pick a day 📅
            </label>
            <input
              id="date-input"
              type="date"
              min={minDateStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-[#FFFDF7] border-2 border-[#F0D5DF] focus:border-[#E66B9A] focus:outline-none rounded-[14px] px-4 py-3 text-sm text-[#542B3D] font-medium shadow-inner transition-colors"
            />
            {date && (
              <p className="text-xs text-[#E66B9A] font-semibold mt-1.5 px-1">
                ✨ {getFormattedDatePreview(date)}
              </p>
            )}
          </div>

          {/* Pick a Time */}
          <div>
            <label className="block text-sm font-bold text-[#542B3D] mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E66B9A]" />
              What time? ⏰
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeOptions.map((t) => {
                const isSelected = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sound.playSoftTap();
                      setTime(t);
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E66B9A] text-white shadow-md shadow-[#E66B9A]/30 scale-[1.02]'
                        : 'bg-[#FBE8EE]/70 hover:bg-[#F8DCE6] text-[#542B3D] border border-[#F0D5DF]'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#FFE5EC] border border-[#F5A9BC] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#B73F65] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-[#E66B9A] hover:bg-[#D95386] active:scale-95 text-white font-extrabold text-base py-3.5 px-6 rounded-full shadow-lg shadow-[#E66B9A]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>that's our date! 💌</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

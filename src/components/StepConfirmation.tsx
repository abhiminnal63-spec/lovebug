import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { FOOD_OPTIONS } from './StepFood';
import { GeneratedPoem } from '../types';
import {
  Calendar,
  Clock,
  Utensils,
  Sparkles,
  MessageCircle,
  RotateCcw,
  Heart,
  Camera,
  BookOpen,
  Download,
  Share2,
  Check,
} from 'lucide-react';

interface StepConfirmationProps {
  selectedDate: string;
  selectedTime: string;
  selectedFood: string;
  selectedPreferences: string[];
  additionalNote: string;
  onRestart: () => void;
  onOpenPhotoStudio: () => void;
  onTriggerHearts?: (origin?: { x: number; y: number }) => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  selectedDate,
  selectedTime,
  selectedFood,
  selectedPreferences,
  additionalNote,
  onRestart,
  onOpenPhotoStudio,
  onTriggerHearts,
}) => {
  const [poemData, setPoemData] = useState<GeneratedPoem | null>(null);
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    onTriggerHearts?.();
  }, []);

  // Format readable date
  const getReadableDate = (dateStr: string) => {
    if (!dateStr) return 'A special upcoming day';
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

  const foodObj = FOOD_OPTIONS.find((f) => f.id === selectedFood) || {
    label: selectedFood || 'Good Food',
    emoji: '🍽️',
  };

  const readableDate = getReadableDate(selectedDate);

  // Preference labels
  const prefLabels: Record<string, string> = {
    cozy: 'Somewhere cozy 🕯️',
    photos: "Let's take cute pictures 📸",
    surprise: 'A little surprise, please 🎁',
    quality_time: 'Just us and good food 💗',
  };

  // WhatsApp share link builder
  const handleWhatsAppShare = () => {
    sound.playSoftTap();
    const lines = [
      "Yay! It's official—we have a date! 💗✨",
      '',
      `📅 Date: ${readableDate}`,
      `⏰ Time: ${selectedTime || 'To be decided'}`,
      `🍽️ Craving: ${foodObj.emoji} ${foodObj.label}`,
    ];

    if (selectedPreferences.length > 0) {
      lines.push(
        `✨ Vibe: ${selectedPreferences.map((p) => prefLabels[p] || p).join(', ')}`
      );
    }

    if (additionalNote.trim()) {
      lines.push(`💌 Little Note: "${additionalNote.trim()}"`);
    }

    lines.push('');
    lines.push("Out of everything in the world, I can't wait to spend this moment with you! 🌷💕");

    const message = lines.join('\n');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Download iCalendar (.ics) file
  const handleDownloadICS = () => {
    sound.playSoftTap();
    if (!selectedDate) return;

    const [year, month, day] = selectedDate.split('-').map(Number);
    // Parse time, e.g., "6:00 PM"
    let hour = 18;
    let minute = 0;
    if (selectedTime) {
      const [timePart, modifier] = selectedTime.split(' ');
      const [h, m] = timePart.split(':').map(Number);
      hour = modifier === 'PM' && h !== 12 ? h + 12 : modifier === 'AM' && h === 12 ? 0 : h;
      minute = m || 0;
    }

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const formatICSDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LOVEBUG//Romantic Date//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      'SUMMARY:🌷 Our Romantic Date! 💗',
      `DESCRIPTION:A special date together! Craving: ${foodObj.label} ${foodObj.emoji}.`,
      'LOCATION:Our Favorite Cozy Spot',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'romantic_date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate romantic love poem via AI backend
  const handleGeneratePoem = async () => {
    sound.playSoftTap();
    setIsGeneratingPoem(true);
    try {
      const res = await fetch('/api/gemini/romantic-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: readableDate,
          time: selectedTime,
          food: foodObj.label,
          preferences: selectedPreferences.map((p) => prefLabels[p] || p),
          note: additionalNote,
        }),
      });
      const data = await res.json();
      setPoemData(data);
      sound.playCelebration();
    } catch (err) {
      console.error(err);
      setPoemData({
        note: "Every moment with you turns into my favorite memory. I already have butterflies counting down the hours until our date!",
        poem: "A table for two and your sweetest smile,\nWe'll laugh and we'll chat for a long lovely while.\nWith good food to share and my hand held in yours,\nYou're the sweetest adventure my heart could adore.",
        mascotQuote: "I did a happy puppy tail-wag dance for this date! 🐾💕",
      });
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  const copyShareText = () => {
    sound.playSoftTap();
    const text = `Our Date Invitation: ${readableDate} at ${selectedTime || 'evening'} for ${foodObj.label} ${foodObj.emoji}! 💗`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 px-4 py-6">
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-2xl p-6 sm:p-8 relative overflow-hidden transition-all">
        {/* Header Tag */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFE3EB] border border-[#F0D5DF] text-xs font-extrabold text-[#B73F65] tracking-wider uppercase shadow-xs">
            💌 Sealed with Love • Date Confirmed 💌
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#B73F65] text-center mb-1 font-romantic">
          it's a date, then. 💗
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A79] text-center mb-5">
          I'm already looking forward to spending this little moment with you.
        </p>

        {/* Love Letter Envelope & Flower Sticker Header Illustrations */}
        <div className="relative mx-auto my-2 w-full max-w-[340px] flex items-center justify-center">
          <div className="relative w-48 h-36 sm:w-56 sm:h-44">
            <img
              src="/src/assets/images/love_letter_1792412862034.jpg"
              alt="Romantic vintage love letter envelope"
              className="w-full h-full object-contain rounded-2xl drop-shadow-md select-none transform -rotate-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 sm:w-28 sm:h-28">
            <img
              src="/src/assets/images/flower_sticker_1792412861330.jpg"
              alt="Bouquet of daisies with pink ribbon"
              className="w-full h-full object-contain drop-shadow-sm select-none transform rotate-6"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Personal Romantic Message Card */}
        <div className="my-5 p-4 bg-[#FBE8EE]/60 border border-[#F0D5DF] rounded-2xl text-center">
          <p className="text-sm sm:text-base font-romantic text-[#542B3D] italic leading-relaxed">
            "Out of all the little things in this world, spending time with you sounds pretty wonderful. 🌷"
          </p>
        </div>

        {/* Actual Selected Details Summary */}
        <div className="bg-white border-2 border-[#F0D5DF] rounded-2xl p-4 sm:p-5 shadow-xs mb-6 space-y-3">
          <h2 className="text-xs font-extrabold text-[#E66B9A] uppercase tracking-wider border-b border-[#F0D5DF]/70 pb-1.5 flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#E66B9A]" />
            Our Date Itinerary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#542B3D]">
            {/* Date */}
            <div className="flex items-center gap-2.5 p-2 bg-[#FFFDF7] rounded-xl border border-[#F5E1EA]">
              <Calendar className="w-4 h-4 text-[#E66B9A] shrink-0" />
              <div>
                <span className="text-[10px] text-[#8C6A79] block">Day</span>
                <span className="font-bold">{readableDate}</span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2.5 p-2 bg-[#FFFDF7] rounded-xl border border-[#F5E1EA]">
              <Clock className="w-4 h-4 text-[#E66B9A] shrink-0" />
              <div>
                <span className="text-[10px] text-[#8C6A79] block">Time</span>
                <span className="font-bold">{selectedTime || 'Whenever you like'}</span>
              </div>
            </div>

            {/* Food Craving */}
            <div className="flex items-center gap-2.5 p-2 bg-[#FFFDF7] rounded-xl border border-[#F5E1EA] sm:col-span-2">
              <span className="text-xl shrink-0">{foodObj.emoji}</span>
              <div>
                <span className="text-[10px] text-[#8C6A79] block">Food Craving</span>
                <span className="font-bold text-[#B73F65]">{foodObj.label}</span>
              </div>
            </div>
          </div>

          {/* Preferences (omitted if empty) */}
          {selectedPreferences.length > 0 && (
            <div className="pt-2 border-t border-[#F0D5DF]/50">
              <span className="text-[10px] text-[#8C6A79] block mb-1">Date Vibes</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPreferences.map((p) => (
                  <span
                    key={p}
                    className="inline-block bg-[#FFEBF2] text-[#B73F65] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#F0D5DF]"
                  >
                    {prefLabels[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional note (omitted if empty) */}
          {additionalNote.trim() && (
            <div className="pt-2 border-t border-[#F0D5DF]/50">
              <span className="text-[10px] text-[#8C6A79] block mb-0.5">Special Note</span>
              <p className="text-xs text-[#542B3D] italic bg-[#FFFDF7] p-2.5 rounded-xl border border-[#F0D5DF]">
                "{additionalNote}"
              </p>
            </div>
          )}
        </div>

        {/* AI Generated Romantic Poem Section */}
        {poemData && (
          <div className="mb-6 p-4 sm:p-5 bg-[#FFF0F5] border-2 border-[#F2CAD7] rounded-2xl shadow-xs transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E66B9A] uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-[#E66B9A]" />
              A Handwritten AI Love Poem for Us
            </div>
            <p className="text-xs text-[#8C6A79] mb-3">{poemData.note}</p>
            <div className="p-3 bg-white/80 rounded-xl border border-[#F5D5E2]">
              <p className="text-sm font-romantic italic text-[#B73F65] whitespace-pre-line text-center leading-relaxed">
                {poemData.poem}
              </p>
            </div>
            <p className="text-[11px] text-[#542B3D] font-semibold text-center mt-2.5">
              {poemData.mascotQuote}
            </p>
          </div>
        )}

        {/* Interactive Feature Pills */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={handleGeneratePoem}
            disabled={isGeneratingPoem}
            className="p-3 bg-[#FFEBF2] hover:bg-[#FCD7E5] text-[#B73F65] rounded-2xl border border-[#F0D5DF] text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#E66B9A]" />
            <span>{isGeneratingPoem ? 'Writing poem...' : '✨ Generate AI Poem'}</span>
          </button>

          <button
            onClick={() => {
              sound.playSoftTap();
              onOpenPhotoStudio();
            }}
            className="p-3 bg-[#F2E7FE] hover:bg-[#E5D2FC] text-[#542B3D] rounded-2xl border border-[#E0C7FA] text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 active:scale-95"
          >
            <Camera className="w-4 h-4 text-[#A259FF]" />
            <span>📸 Custom Polaroid Studio</span>
          </button>
        </div>

        {/* Primary Action: Send on WhatsApp Button */}
        <div className="space-y-3">
          <button
            onClick={(e) => {
              handleWhatsAppShare();
              onTriggerHearts?.({ x: e.clientX, y: e.clientY });
            }}
            className="w-full bg-[#25D366] hover:bg-[#20BE5C] active:scale-95 text-white font-extrabold text-base py-3.5 px-6 rounded-full shadow-lg shadow-[#25D366]/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>send our plans on WhatsApp 💌</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadICS}
              className="bg-[#FFFDF7] hover:bg-[#FBE8EE] text-[#542B3D] text-xs font-bold py-2.5 px-3 rounded-full border border-[#F0D5DF] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#E66B9A]" />
              Add to Calendar
            </button>

            <button
              onClick={copyShareText}
              className="bg-[#FFFDF7] hover:bg-[#FBE8EE] text-[#542B3D] text-xs font-bold py-2.5 px-3 rounded-full border border-[#F0D5DF] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#E66B9A]" />
                  Copy Plan
                </>
              )}
            </button>
          </div>

          {/* Restart Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                sound.playSoftTap();
                onRestart();
              }}
              className="text-xs text-[#8C6A79] hover:text-[#542B3D] font-bold py-1.5 px-4 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>start over ↻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

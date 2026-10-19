
import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { FOOD_OPTIONS } from './StepFood';
import { GeneratedPoem } from '../types';
import loveLetter from '../assets/images/love_letter_1792412862034.jpg';
import flowerSticker from '../assets/images/flower_sticker_1792412861330.jpg';
import {
  Calendar,
  Clock,
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

  const prefLabels: Record<string, string> = {
    cozy: 'Somewhere cozy 🕯️',
    photos: "Let's take cute pictures 📸",
    surprise: 'A little surprise, please 🎁',
    quality_time: 'Just us and good food 💗',
  };

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
        `✨ Vibe: ${selectedPreferences
          .map((p) => prefLabels[p] || p)
          .join(', ')}`
      );
    }

    if (additionalNote.trim()) {
      lines.push(`💌 Little Note: "${additionalNote.trim()}"`);
    }

    lines.push('');
    lines.push(
      "Out of everything in the world, I can't wait to spend this moment with you! 🌷💕"
    );

    const message = lines.join('\n');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    sound.playSoftTap();

    if (!selectedDate) return;

    const [year, month, day] = selectedDate.split('-').map(Number);

    let hour = 18;
    let minute = 0;

    if (selectedTime) {
      const [timePart, modifier] = selectedTime.split(' ');
      const [h, m] = timePart.split(':').map(Number);

      hour =
        modifier === 'PM' && h !== 12
          ? h + 12
          : modifier === 'AM' && h === 12
            ? 0
            : h;

      minute = m || 0;
    }

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(
      startDate.getTime() + 2 * 60 * 60 * 1000
    );

    const formatICSDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LOVEBUG//Romantic Date//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      'SUMMARY:Our Romantic Date!',
      `DESCRIPTION:A special date together! Craving: ${foodObj.label} ${foodObj.emoji}.`,
      'LOCATION:Our Favorite Cozy Spot',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });

    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(blob);

    link.href = objectUrl;
    link.setAttribute('download', 'romantic_date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  };

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
          preferences: selectedPreferences.map(
            (p) => prefLabels[p] || p
          ),
          note: additionalNote,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not generate the poem.');
      }

      const data = await res.json();
      setPoemData(data);
      sound.playCelebration();
    } catch (err) {
      console.error(err);

      setPoemData({
        note: 'Every moment with you turns into my favorite memory. I already have butterflies counting down the hours until our date!',
        poem: "A table for two and your sweetest smile,\nWe'll laugh and we'll chat for a long lovely while.\nWith good food to share and my hand held in yours,\nYou're the sweetest adventure my heart could adore.",
        mascotQuote: 'I did a happy puppy tail-wag dance for this date! 🐾💕',
      });
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  const copyShareText = async () => {
    sound.playSoftTap();

    const text = `Our Date Invitation: ${readableDate} at ${selectedTime || 'evening'} for ${foodObj.label} ${foodObj.emoji}! 💗`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Could not copy the plan:', err);
    }
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-6">
      <div className="relative overflow-hidden rounded-[28px] border-2 border-[#F0D5DF] bg-[#FFFDF7] p-6 shadow-2xl transition-all sm:p-8">

        {/* Header */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-[#F0D5DF] bg-[#FFE3EB] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#B73F65] shadow-sm">
            💌 Sealed with Love • Date Confirmed 💌
          </span>
        </div>

        <h1 className="mb-1 text-center font-romantic text-3xl font-extrabold text-[#B73F65] sm:text-4xl">
          it's a date, then. 💗
        </h1>

        <p className="mb-5 text-center text-xs text-[#8C6A79] sm:text-sm">
          I'm already looking forward to spending this little moment with you.
        </p>

        {/* Fixed illustration asset imports */}
        <div className="relative mx-auto my-2 flex w-full max-w-[340px] items-center justify-center">
          <div className="relative h-36 w-48 sm:h-44 sm:w-56">
            <img
              src={loveLetter}
              alt="Romantic vintage love letter envelope"
              className="h-full w-full select-none transform rounded-2xl object-contain drop-shadow-md -rotate-1"
              loading="eager"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 h-24 w-24 sm:h-28 sm:w-28">
            <img
              src={flowerSticker}
              alt="Bouquet of daisies with pink ribbon"
              className="h-full w-full select-none transform object-contain drop-shadow-sm rotate-6"
              loading="eager"
            />
          </div>
        </div>

        {/* Romantic message */}
        <div className="my-5 rounded-2xl border border-[#F0D5DF] bg-[#FBE8EE]/60 p-4 text-center">
          <p className="font-romantic text-sm italic leading-relaxed text-[#542B3D] sm:text-base">
            "Out of all the little things in this world, spending time with you sounds pretty wonderful. 🌷"
          </p>
        </div>

        {/* Date itinerary */}
        <div className="mb-6 space-y-3 rounded-2xl border-2 border-[#F0D5DF] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="flex items-center gap-1.5 border-b border-[#F0D5DF]/70 pb-1.5 font-sans text-xs font-extrabold uppercase tracking-wider text-[#E66B9A]">
            <Sparkles className="h-3.5 w-3.5 text-[#E66B9A]" />
            Our Date Itinerary
          </h2>

          <div className="grid grid-cols-1 gap-3 text-xs text-[#542B3D] sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-[#F5E1EA] bg-[#FFFDF7] p-2">
              <Calendar className="h-4 w-4 shrink-0 text-[#E66B9A]" />
              <div>
                <span className="block text-[10px] text-[#8C6A79]">Day</span>
                <span className="font-bold">{readableDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#F5E1EA] bg-[#FFFDF7] p-2">
              <Clock className="h-4 w-4 shrink-0 text-[#E66B9A]" />
              <div>
                <span className="block text-[10px] text-[#8C6A79]">Time</span>
                <span className="font-bold">
                  {selectedTime || 'Whenever you like'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#F5E1EA] bg-[#FFFDF7] p-2 sm:col-span-2">
              <span className="shrink-0 text-xl">{foodObj.emoji}</span>
              <div>
                <span className="block text-[10px] text-[#8C6A79]">Food Craving</span>
                <span className="font-bold text-[#B73F65]">{foodObj.label}</span>
              </div>
            </div>
          </div>

          {selectedPreferences.length > 0 && (
            <div className="border-t border-[#F0D5DF]/50 pt-2">
              <span className="mb-1 block text-[10px] text-[#8C6A79]">Date Vibes</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPreferences.map((p) => (
                  <span
                    key={p}
                    className="inline-block rounded-full border border-[#F0D5DF] bg-[#FFEBF2] px-2.5 py-1 text-[11px] font-bold text-[#B73F65]"
                  >
                    {prefLabels[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {additionalNote.trim() && (
            <div className="border-t border-[#F0D5DF]/50 pt-2">
              <span className="mb-0.5 block text-[10px] text-[#8C6A79]">Special Note</span>
              <p className="rounded-xl border border-[#F0D5DF] bg-[#FFFDF7] p-2.5 text-xs italic text-[#542B3D]">
                "{additionalNote}"
              </p>
            </div>
          )}
        </div>

        {/* AI poem */}
        {poemData && (
          <div className="mb-6 rounded-2xl border-2 border-[#F2CAD7] bg-[#FFF0F5] p-4 shadow-sm transition-all sm:p-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E66B9A]">
              <Heart className="h-3.5 w-3.5 fill-[#E66B9A]" />
              A Handwritten AI Love Poem for Us
            </div>
            <p className="mb-3 text-xs text-[#8C6A79]">{poemData.note}</p>
            <div className="rounded-xl border border-[#F5D5E2] bg-white/80 p-3">
              <p className="whitespace-pre-line text-center font-romantic text-sm italic leading-relaxed text-[#B73F65]">
                {poemData.poem}
              </p>
            </div>
            <p className="mt-2.5 text-center text-[11px] font-semibold text-[#542B3D]">
              {poemData.mascotQuote}
            </p>
          </div>
        )}

        {/* Interactive features */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGeneratePoem}
            disabled={isGeneratingPoem}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-[#F0D5DF] bg-[#FFEBF2] p-3 text-center text-xs font-bold text-[#B73F65] transition-all hover:bg-[#FCD7E5] active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            <BookOpen className="h-4 w-4 text-[#E66B9A]" />
            <span>{isGeneratingPoem ? 'Writing poem...' : '✨ Generate AI Poem'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playSoftTap();
              onOpenPhotoStudio();
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-[#E0C7FA] bg-[#F2E7FE] p-3 text-center text-xs font-bold text-[#542B3D] transition-all hover:bg-[#E5D2FC] active:scale-95"
          >
            <Camera className="h-4 w-4 text-[#A259FF]" />
            <span>📸 Custom Polaroid Studio</span>
          </button>
        </div>

        {/* WhatsApp and secondary actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={(e) => {
              handleWhatsAppShare();
              onTriggerHearts?.({ x: e.clientX, y: e.clientY });
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:-translate-y-0.5 hover:bg-[#20BE5C] active:scale-95"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            <span>send our plans on WhatsApp 💌</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadICS}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#F0D5DF] bg-[#FFFDF7] px-3 py-2.5 text-xs font-bold text-[#542B3D] shadow-sm transition-all hover:bg-[#FBE8EE]"
            >
              <Download className="h-3.5 w-3.5 text-[#E66B9A]" />
              Add to Calendar
            </button>

            <button
              type="button"
              onClick={copyShareText}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#F0D5DF] bg-[#FFFDF7] px-3 py-2.5 text-xs font-bold text-[#542B3D] shadow-sm transition-all hover:bg-[#FBE8EE]"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#E66B9A]" />
                  Copy Plan
                </>
              )}
            </button>
          </div>

          {/* Restart */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                sound.playSoftTap();
                onRestart();
              }}
              className="mx-auto flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-[#8C6A79] transition-colors hover:text-[#542B3D]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>start over ↻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
      

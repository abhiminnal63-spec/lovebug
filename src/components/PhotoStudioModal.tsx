import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, Sparkles, Wand2, Download, RefreshCw, Heart, AlertCircle, Edit3 } from 'lucide-react';

interface PhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateVibe?: string;
}

export const PhotoStudioModal: React.FC<PhotoStudioModalProps> = ({
  isOpen,
  onClose,
  dateVibe,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3'>('1:1');
  const [polaroidCaption, setPolaroidCaption] = useState('Our Sweet Date Memory 💖');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit mode state
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const promptSuggestions = [
    'Two cute chibi kittens sharing a strawberry milkshake with two straws',
    'Chibi couple having a cozy candlelit pizza date with fairy lights',
    'Fluffy puppy holding a bouquet of pink daisies and sweet treats',
    'Romantic picnic under cherry blossoms with cupcakes and tea',
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) {
      setErrorMessage('Please type a cute idea for our date memory! 🎨');
      return;
    }

    sound.playSoftTap();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse,
          aspectRatio,
          style: 'kawaii romantic',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create polaroid');
      }

      setGeneratedImage(data.imageUrl);
      sound.playCelebration();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Could not generate photo right now. Please try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt.trim()) return;

    sound.playSoftTap();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: generatedImage,
          prompt: editPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to edit polaroid');
      }

      setGeneratedImage(data.imageUrl);
      setEditPrompt('');
      setIsEditing(false);
      sound.playCelebration();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not edit photo. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    sound.playSoftTap();
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'our_date_polaroid.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFDF7] border-2 border-[#F0D5DF] rounded-[28px] shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 relative transition-all">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playSoftTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#8C6A79] hover:text-[#542B3D] hover:bg-[#FBE8EE] rounded-full transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE3EB] text-[#B73F65] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E66B9A]" />
            Powered by gemini-nano-banana-2.1
          </span>
          <h2 className="text-2xl font-bold text-[#542B3D] font-romantic">
            Custom Date Polaroid Studio 📸
          </h2>
          <p className="text-xs text-[#8C6A79]">
            Create or edit an ultra-cute custom keepsake for our date!
          </p>
        </div>

        {/* Polaroid Display or Placeholder */}
        <div className="my-4 flex flex-col items-center">
          <div className="bg-white p-3 pb-8 rounded-xl shadow-lg border border-[#F0D5DF] w-full max-w-[280px] transform hover:rotate-1 transition-transform">
            <div className="w-full aspect-square bg-[#FDF0F4] rounded-lg overflow-hidden flex items-center justify-center relative border border-[#F5E1EA]">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Our generated polaroid memory"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-2 text-3xl flex items-center justify-center rounded-full bg-[#FFE3EB]">
                    🎨
                  </div>
                  <p className="text-xs font-bold text-[#B73F65]">
                    Your Polaroid will appear here!
                  </p>
                  <p className="text-[10px] text-[#8C6A79] mt-1">
                    Describe your dream memory below.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 bg-[#FFFDF7]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#E66B9A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[#E66B9A]">
                    Sprinkling AI magic... ✨
                  </p>
                </div>
              )}
            </div>

            {/* Handwritten Caption Area */}
            <div className="mt-3 text-center">
              <input
                type="text"
                value={polaroidCaption}
                onChange={(e) => setPolaroidCaption(e.target.value)}
                placeholder="Write a sweet polaroid caption..."
                className="w-full text-center text-xs font-romantic font-bold text-[#542B3D] border-b border-dashed border-[#F0D5DF] focus:border-[#E66B9A] focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {generatedImage && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDownload}
                className="bg-[#E66B9A] hover:bg-[#D95386] text-white text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Keepsake
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#FFFDF7] hover:bg-[#FBE8EE] text-[#542B3D] text-xs font-bold py-1.5 px-3 rounded-full border border-[#F0D5DF] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#E66B9A]" />
                {isEditing ? 'Cancel Edit' : 'Edit Image'}
              </button>
            </div>
          )}
        </div>

        {/* Edit Image Input Box */}
        {isEditing && generatedImage && (
          <div className="mb-4 p-3.5 bg-[#FFF0F5] border border-[#F5CAD9] rounded-2xl">
            <label className="block text-xs font-bold text-[#B73F65] mb-1.5 flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-[#E66B9A]" />
              How would you like to edit this polaroid?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g. Add sparkling hearts and fairy lights around it"
                className="flex-1 bg-white border border-[#F0D5DF] rounded-xl px-3 py-2 text-xs text-[#542B3D] focus:border-[#E66B9A] focus:outline-none"
              />
              <button
                onClick={handleEdit}
                disabled={isLoading || !editPrompt.trim()}
                className="bg-[#E66B9A] hover:bg-[#D95386] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Prompt Input Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#542B3D] mb-1.5">
              Describe our dream date scene:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. Cute couple eating ramen under glowing lanterns..."
                className="flex-1 bg-white border-2 border-[#F0D5DF] focus:border-[#E66B9A] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#542B3D] font-medium"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="bg-[#E66B9A] hover:bg-[#D95386] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div>
            <span className="text-[11px] text-[#8C6A79] block mb-1 font-semibold">
              Or tap a cute idea:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(s);
                    handleGenerate(s);
                  }}
                  className="bg-[#FBE8EE] hover:bg-[#F8DCE6] text-[#542B3D] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#F0D5DF] transition-all cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F0D5DF]/60 text-xs text-[#8C6A79]">
            <span className="font-semibold">Format:</span>
            <div className="flex gap-1.5">
              {(['1:1', '3:4', '4:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-[#E66B9A] text-white'
                      : 'bg-[#FBE8EE] text-[#542B3D]'
                  }`}
                >
                  {ratio === '1:1' ? 'Square' : ratio === '3:4' ? 'Portrait' : 'Landscape'}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#FFE5EC] border border-[#F5A9BC] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#B73F65]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

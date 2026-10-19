import React, { useState } from 'react';
import { StepId, DateInvitationState } from './types';
import { sound } from './utils/audio';
import { BackgroundFloatingHearts } from './components/BackgroundFloatingHearts';
import { StepInvitation } from './components/StepInvitation';
import { StepCelebration } from './components/StepCelebration';
import { StepDateTime } from './components/StepDateTime';
import { StepFood } from './components/StepFood';
import { StepPreferences } from './components/StepPreferences';
import { StepConfirmation } from './components/StepConfirmation';
import { StepDeclined } from './components/StepDeclined';
import { ThreeLovebugScene } from './components/ThreeLovebugScene';
import { PhotoStudioModal } from './components/PhotoStudioModal';
import { ConfettiHeartOverlay } from './components/ConfettiHeartOverlay';
import { Volume2, VolumeX, Sparkles, Box, Heart } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<DateInvitationState>({
    currentStep: 'invitation',
    selectedDate: '',
    selectedTime: '6:00 PM',
    selectedFood: 'pasta',
    selectedPreferences: [],
    additionalNote: '',
    musicEnabled: true,
    show3DScene: false,
  });

  const [showPhotoStudio, setShowPhotoStudio] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{
    key: number;
    origin?: { x: number; y: number } | null;
  }>({
    key: 0,
    origin: null,
  });

  const triggerHearts = (origin?: { x: number; y: number }) => {
    setHeartBurst((prev) => ({
      key: prev.key + 1,
      origin: origin ?? null,
    }));
  };

  // Automatically start and unmute the romantic song when the user enters the site
  React.useEffect(() => {
    // Attempt immediate playback
    sound.toggleMusic(true);

    // Browser autoplay policy handler: ensure audio context resumes on any initial interaction
    const handleFirstInteraction = () => {
      sound.toggleMusic(true);
      setState((prev) => ({ ...prev, musicEnabled: true }));
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Audio toggle
  const toggleMusic = () => {
    const nextState = !state.musicEnabled;
    const isPlaying = sound.toggleMusic(nextState);
    setState((prev) => ({ ...prev, musicEnabled: isPlaying }));
  };

  // 3D Scene modal toggle
  const toggle3DScene = () => {
    sound.playSoftTap();
    setState((prev) => ({ ...prev, show3DScene: !prev.show3DScene }));
  };

  // Reset all state to clean initial
  const handleRestart = () => {
    sound.playSoftTap();
    setState({
      currentStep: 'invitation',
      selectedDate: '',
      selectedTime: '6:00 PM',
      selectedFood: 'pasta',
      selectedPreferences: [],
      additionalNote: '',
      musicEnabled: state.musicEnabled,
      show3DScene: false,
    });
  };

  // Step progression helpers
  const goToStep = (step: StepId) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  return (
    <div className="min-h-screen bg-[#FBE8EE] text-[#542B3D] flex flex-col justify-between relative selection:bg-[#FFE3EB] selection:text-[#B73F65]">
      {/* Decorative Floating Romantic Particle Accents */}
      <BackgroundFloatingHearts />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#FFFDF7] border-2 border-[#F0D5DF] shadow-xs flex items-center justify-center text-lg transform hover:scale-105 transition-transform">
            🐞
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-[#B73F65] font-romantic block leading-none">
              LOVEBUG
            </span>
            <span className="text-[10px] text-[#8C6A79] font-medium tracking-wide">
              a sweet date invitation
            </span>
          </div>
        </div>

        {/* Top Control Buttons: Music & 3D Companion */}
        <div className="flex items-center gap-2">
          {/* 3D Lovebug Companion Button */}
          <button
            onClick={toggle3DScene}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              state.show3DScene
                ? 'bg-[#E66B9A] text-white border-[#E66B9A]'
                : 'bg-[#FFFDF7] hover:bg-[#F8DCE6] text-[#542B3D] border-[#F0D5DF]'
            }`}
            aria-label="Toggle 3D Lovebug Companion"
          >
            <Box className="w-3.5 h-3.5 text-[#E66B9A]" />
            <span className="hidden sm:inline">3D Lovebug</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              state.musicEnabled
                ? 'bg-[#FFE3EB] text-[#B73F65] border-[#F5A9BC]'
                : 'bg-[#FFFDF7] hover:bg-[#F8DCE6] text-[#8C6A79] border-[#F0D5DF]'
            }`}
            aria-label="Toggle romantic music box"
          >
            {state.musicEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#E66B9A]" />
                <span className="hidden sm:inline">Music Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8C6A79]" />
                <span className="hidden sm:inline">Music Muted</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Step Content Container */}
      <main className="flex-1 flex items-center justify-center w-full px-2 sm:px-4 py-4 relative z-10">
        {state.currentStep === 'invitation' && (
          <StepInvitation
            onYes={(origin) => {
              triggerHearts(origin);
              goToStep('yes_celebration');
            }}
            onDecline={() => goToStep('declined')}
          />
        )}

        {state.currentStep === 'yes_celebration' && (
          <StepCelebration onNext={() => goToStep('date_and_time')} />
        )}

        {state.currentStep === 'date_and_time' && (
          <StepDateTime
            initialDate={state.selectedDate}
            initialTime={state.selectedTime}
            onNext={(date, time) => {
              setState((prev) => ({
                ...prev,
                selectedDate: date,
                selectedTime: time,
                currentStep: 'food_selection',
              }));
            }}
            onBack={() => goToStep('invitation')}
          />
        )}

        {state.currentStep === 'food_selection' && (
          <StepFood
            initialFood={state.selectedFood}
            onNext={(food) => {
              setState((prev) => ({
                ...prev,
                selectedFood: food,
                currentStep: 'optional_preferences',
              }));
            }}
            onBack={() => goToStep('date_and_time')}
          />
        )}

        {state.currentStep === 'optional_preferences' && (
          <StepPreferences
            initialPreferences={state.selectedPreferences}
            initialNote={state.additionalNote}
            onNext={(preferences, note) => {
              triggerHearts();
              setState((prev) => ({
                ...prev,
                selectedPreferences: preferences,
                additionalNote: note,
                currentStep: 'final_confirmation',
              }));
            }}
            onBack={() => goToStep('food_selection')}
          />
        )}

        {state.currentStep === 'final_confirmation' && (
          <StepConfirmation
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            selectedFood={state.selectedFood}
            selectedPreferences={state.selectedPreferences}
            additionalNote={state.additionalNote}
            onRestart={handleRestart}
            onOpenPhotoStudio={() => setShowPhotoStudio(true)}
            onTriggerHearts={(origin) => triggerHearts(origin)}
          />
        )}

        {state.currentStep === 'declined' && (
          <StepDeclined onRestart={handleRestart} />
        )}
      </main>

      {/* Confetti Heart Celebration Overlay using Framer Motion */}
      <ConfettiHeartOverlay
        triggerKey={heartBurst.key}
        origin={heartBurst.origin}
      />

      {/* 3D Lovebug Companion Overlay Modal */}
      {state.show3DScene && (
        <ThreeLovebugScene
          isOpenAsModal={true}
          onClose={() => setState((prev) => ({ ...prev, show3DScene: false }))}
        />
      )}

      {/* Custom AI Polaroid / Sticker Studio Modal */}
      <PhotoStudioModal
        isOpen={showPhotoStudio}
        onClose={() => setShowPhotoStudio(false)}
        dateVibe={state.selectedFood}
      />

      {/* Footer Accents */}
      <footer className="relative z-10 py-3 text-center text-[11px] text-[#8C6A79]">
        <div className="flex items-center justify-center gap-1">
          <span>Handcrafted with</span>
          <Heart className="w-3 h-3 text-[#E66B9A] fill-[#E66B9A]" />
          <span>for a sweet little memory</span>
        </div>
      </footer>
    </div>
  );
}

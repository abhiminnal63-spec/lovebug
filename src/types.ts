export type StepId =
  | 'invitation'
  | 'yes_celebration'
  | 'date_and_time'
  | 'food_selection'
  | 'optional_preferences'
  | 'final_confirmation'
  | 'declined';

export interface FoodOption {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
}

export interface PreferenceOption {
  id: string;
  label: string;
  description?: string;
}

export interface DateInvitationState {
  currentStep: StepId;
  selectedDate: string;
  selectedTime: string;
  selectedFood: string;
  selectedPreferences: string[];
  additionalNote: string;
  musicEnabled: boolean;
  show3DScene: boolean;
}

export interface GeneratedPoem {
  note: string;
  poem: string;
  mascotQuote: string;
}

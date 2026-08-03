import type { MoodValue } from '../db/moodLog';

export const MOOD_OPTIONS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: 'feliz', emoji: '😊', label: 'Feliz' },
  { value: 'neutra', emoji: '😐', label: 'Neutra' },
  { value: 'sensivel', emoji: '🥺', label: 'Sensível' },
  { value: 'irritada', emoji: '😠', label: 'Irritada' },
  { value: 'cansada', emoji: '😴', label: 'Cansada' },
];

export const MOOD_CONTENT: Record<MoodValue, { emoji: string; label: string }> = MOOD_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = { emoji: option.emoji, label: option.label };
    return acc;
  },
  {} as Record<MoodValue, { emoji: string; label: string }>
);

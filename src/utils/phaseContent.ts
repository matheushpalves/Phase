import { colors } from '../theme/colors';
import { DayPhase } from './cycleCalculations';

export type PhaseContent = {
  bannerTitle: string;
  emoji: string;
  cycleLabel: string;
  homeDescription: string;
  tipDescription: string;
  color: string;
  textOnColor: string;
  gradient: [string, string];
};

export const phaseContent: Record<DayPhase, PhaseContent> = {
  flow: {
    bannerTitle: 'MODO CÓDIGO VERMELHO',
    emoji: '🩸',
    cycleLabel: 'Menstruação',
    homeDescription: 'Ela está no período, general. Chá quentinho e paciência extra caem bem hoje.',
    tipDescription:
      'Ela pode estar mais sensível hoje, general. Chocolate na mão, paciência no bolso e nada de discussão boba. Você é o suporte, não o problema. 💪',
    color: colors.flow,
    textOnColor: '#FFFFFF',
    gradient: ['#66000C', '#31000A'],
  },
  fertile: {
    bannerTitle: 'ZONA FÉRTIL',
    emoji: '🎯',
    cycleLabel: 'Fértil',
    homeDescription: 'Atenção total, soldado. Camisinha em dobro hoje — ela pode engravidar.',
    tipDescription:
      'É pico de fertilidade, general. Se não tá nos planos aumentar a tropa, capricha na proteção hoje. 🎯',
    color: colors.fertile,
    textOnColor: '#241400',
    gradient: ['#4F2200', '#3A0C00'],
  },
  safe: {
    bannerTitle: 'LIBERADO GERAL',
    emoji: '✅',
    cycleLabel: 'Liberado',
    homeDescription: 'Sem alerta hoje, comandante. Terreno livre, só aproveitar.',
    tipDescription: 'Dia tranquilo, sem código de alerta ativo. Aproveita a folga e manda ver. 😌',
    color: colors.safe,
    textOnColor: '#FFFFFF',
    gradient: ['#0B3A78', '#051B3C'],
  },
};

export function pmsHint(): PhaseContent {
  return {
    bannerTitle: 'TPM À VISTA',
    emoji: '🍫',
    cycleLabel: 'TPM',
    homeDescription: 'TPM rondando, soldado. Leve chocolate e paciência — o clima pode virar sem aviso.',
    tipDescription:
      'Fase de TPM, general. Sensibilidade pode estar no talo — ofereça chocolate, escute mais, discuta menos. 🍫',
    color: colors.fertile,
    textOnColor: '#241400',
    gradient: ['#4F2200', '#3A0C00'],
  };
}

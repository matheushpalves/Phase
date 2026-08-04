import type * as ExpoNotifications from 'expo-notifications';
import { LogBox, Platform } from 'react-native';
import { Account } from '../db/auth';
import { CycleProfile } from '../db/cycleProfile';
import { addDays, getDayInfo, parseISODate } from './cycleCalculations';
import { phaseContent, pmsHint } from './phaseContent';
import { RELATIONSHIP_LABELS } from './relationship';

const NOTIFICATION_HOUR = 9;
const DAILY_TIP_HOUR_NOON = 12;
const DAILY_TIP_HOUR_EVENING = 18;
const SCHEDULING_HORIZON_DAYS = 60;
/** Two tips a day adds up fast against iOS's 64-pending-notification cap, so this window is much shorter than the event horizon above. */
const DAILY_TIP_HORIZON_DAYS = 20;
const CHANNEL_ID = 'phase-cycle-updates';

// expo-notifications itself prints this the moment it's required inside Expo Go
// (by design, on every load) — it's expected and disappears in a real dev/production
// build, so we silence just this one known, harmless warning instead of all logs.
LogBox.ignoreLogs(['`expo-notifications` functionality is not fully supported in Expo Go']);

// expo-notifications throws at import time in Expo Go (SDK 53+ removed this
// functionality there), so the require itself must be guarded — a try/catch
// around code that *uses* the module isn't enough, since the module's own
// top-level side effects run during `require`, before any of our code executes.
let Notifications: typeof ExpoNotifications | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  Notifications = null;
}

export async function ensureNotificationChannel() {
  if (!Notifications) return;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Atualizações do ciclo',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 150, 200],
        lightColor: '#4C6FEE',
      });
    }
  } catch {
    // Notifications aren't available in this environment (e.g. Expo Go, web).
    // The app should keep working without them; only a development/production build gets alerts.
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    await ensureNotificationChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return !!requested.granted;
  } catch {
    return false;
  }
}

function atHour(date: Date, hour: number): Date {
  const result = new Date(date);
  result.setHours(hour, 0, 0, 0);
  return result;
}

function atNotificationHour(date: Date): Date {
  return atHour(date, NOTIFICATION_HOUR);
}

/** Next occurrence (today or later) of an annual month/day, e.g. a birthday or anniversary. */
function nextAnnualOccurrence(month: number, day: number, from: Date): Date {
  const candidate = new Date(from.getFullYear(), month, day);
  candidate.setHours(0, 0, 0, 0);
  if (candidate.getTime() < from.getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

type PlannedNotification = {
  date: Date;
  title: string;
  body: string;
};

function buildPlannedNotifications(account: Account | null, profile: CycleProfile): PlannedNotification[] {
  const name = profile.partner_name || 'ela';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizonEnd = addDays(today, SCHEDULING_HORIZON_DAYS);

  const planned: PlannedNotification[] = [];
  let previousPhase = getDayInfo(addDays(today, -1), profile);

  for (let offset = 0; offset <= SCHEDULING_HORIZON_DAYS; offset++) {
    const date = addDays(today, offset);
    const info = getDayInfo(date, profile);

    const enteringFlow = info.phase === 'flow' && previousPhase.phase !== 'flow';
    const enteringFertile = info.phase === 'fertile' && previousPhase.phase !== 'fertile';
    const enteringSafe =
      info.phase === 'safe' && !info.isPmsWindow && (previousPhase.phase === 'flow' || previousPhase.phase === 'fertile');
    const enteringPms = info.isPmsWindow && !previousPhase.isPmsWindow && info.phase !== 'flow';

    if (offset > 0 && enteringFlow) {
      planned.push({
        date: atNotificationHour(date),
        title: `${name} está entrando no ciclo 🌸`,
        body: `O período da ${name} deve começar hoje. Fica de olho e manda um carinho.`,
      });
    }

    if (enteringFertile) {
      planned.push({
        date: atNotificationHour(date),
        title: 'Período fértil começando 💜',
        body: `A ${name} está entrando no período fértil. Atenção redobrada se vocês não estiverem buscando bebê.`,
      });
    }

    if (enteringSafe) {
      planned.push({
        date: atNotificationHour(date),
        title: 'Pode rolar 😏',
        body: 'Nenhum risco especial hoje. Dia livre, aproveitem!',
      });
    }

    if (enteringPms) {
      planned.push({
        date: atNotificationHour(date),
        title: `TPM da ${name} chegando 🍫`,
        body: 'Hora de comprar absorvente e chocolate. Ela vai agradecer.',
      });
    }

    if (offset <= DAILY_TIP_HORIZON_DAYS) {
      const dayContent = info.isPmsWindow && info.phase === 'safe' ? pmsHint() : phaseContent[info.phase];
      const tipTitle = `${dayContent.emoji} ${dayContent.bannerTitle}`;
      planned.push({ date: atHour(date, DAILY_TIP_HOUR_NOON), title: tipTitle, body: dayContent.tipDescription });
      planned.push({ date: atHour(date, DAILY_TIP_HOUR_EVENING), title: tipTitle, body: dayContent.tipDescription });
    }

    previousPhase = info;
  }

  if (account?.birthday) {
    const birthDate = parseISODate(account.birthday);
    const occurrence = nextAnnualOccurrence(birthDate.getMonth(), birthDate.getDate(), today);
    if (occurrence.getTime() <= horizonEnd.getTime()) {
      const age = occurrence.getFullYear() - birthDate.getFullYear();
      planned.push({
        date: atNotificationHour(occurrence),
        title: '🎂 Feliz aniversário!',
        body: `Hoje você completa ${age} anos, general. Aproveita o dia! 🎉`,
      });
    }
  }

  if (profile.partner_birthday) {
    const birthDate = parseISODate(profile.partner_birthday);
    const occurrence = nextAnnualOccurrence(birthDate.getMonth(), birthDate.getDate(), today);
    if (occurrence.getTime() <= horizonEnd.getTime()) {
      const age = occurrence.getFullYear() - birthDate.getFullYear();
      planned.push({
        date: atNotificationHour(occurrence),
        title: `🎂 Aniversário da ${name}!`,
        body: `A ${name} completa ${age} anos hoje. Não esquece o presente, soldado. 🎁`,
      });
    }
  }

  if (profile.relationship_start_date) {
    const startDate = parseISODate(profile.relationship_start_date);
    const occurrence = nextAnnualOccurrence(startDate.getMonth(), startDate.getDate(), today);
    const years = occurrence.getFullYear() - startDate.getFullYear();
    if (occurrence.getTime() <= horizonEnd.getTime() && years > 0) {
      const relationshipLabel = profile.relationship_status ? RELATIONSHIP_LABELS[profile.relationship_status] : 'namoro';
      planned.push({
        date: atNotificationHour(occurrence),
        title: `💍 Aniversário de ${relationshipLabel}!`,
        body: `Hoje fazem ${years} ${years === 1 ? 'ano' : 'anos'} de ${relationshipLabel} com a ${name}. Comemora direito, comandante. 🎉`,
      });
    }
  }

  return planned;
}

export async function syncScheduledNotifications(account: Account | null, profile: CycleProfile | null): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!profile || !profile.onboarding_completed) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    const planned = buildPlannedNotifications(account, profile);

    for (const item of planned) {
      if (item.date.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
        },
      });
    }
  } catch {
    // See note above.
  }
}

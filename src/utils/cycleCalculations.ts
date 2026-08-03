import { CycleProfile } from '../db/cycleProfile';

export type DayPhase = 'flow' | 'fertile' | 'safe';

export type DayInfo = {
  date: string; // yyyy-MM-dd
  phase: DayPhase;
  isPmsWindow: boolean;
  cycleDayNumber: number; // 1-indexed day within its cycle
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / MS_PER_DAY);
}

/** Ovulation is estimated as 14 days before the next period starts (luteal phase length). */
const LUTEAL_PHASE_DAYS = 14;
/** Fertile window = the 5 days before ovulation plus the day of ovulation itself. */
const FERTILE_WINDOW_BEFORE_OVULATION = 5;
/** PMS / TPM window used only for notification purposes, not shown on the calendar. */
const PMS_WINDOW_DAYS = 5;

export function getDayInfo(date: Date, profile: Pick<CycleProfile, 'last_period_start' | 'cycle_length' | 'period_length'>): DayInfo {
  const lastPeriodStart = parseISODate(profile.last_period_start);
  const cycleLength = profile.cycle_length;
  const periodLength = profile.period_length;

  const daysSinceStart = diffInDays(date, lastPeriodStart);
  const cycleIndex = Math.floor(daysSinceStart / cycleLength);
  const dayInCycle = daysSinceStart - cycleIndex * cycleLength; // 0-indexed

  const ovulationDayInCycle = cycleLength - LUTEAL_PHASE_DAYS;
  const fertileStart = ovulationDayInCycle - FERTILE_WINDOW_BEFORE_OVULATION;
  const fertileEnd = ovulationDayInCycle;
  const pmsStart = cycleLength - PMS_WINDOW_DAYS;

  let phase: DayPhase = 'safe';
  if (dayInCycle >= 0 && dayInCycle < periodLength) {
    phase = 'flow';
  } else if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) {
    phase = 'fertile';
  }

  const isPmsWindow = dayInCycle >= pmsStart && dayInCycle < cycleLength && phase !== 'flow';

  return {
    date: toISODate(date),
    phase,
    isPmsWindow,
    cycleDayNumber: dayInCycle + 1,
  };
}

export function getNextOccurrence(
  profile: Pick<CycleProfile, 'last_period_start' | 'cycle_length' | 'period_length'>,
  kind: 'periodStart' | 'ovulation' | 'pmsStart' | 'fertileStart',
  fromDate: Date = new Date()
): Date {
  const lastPeriodStart = parseISODate(profile.last_period_start);
  const cycleLength = profile.cycle_length;

  let offsetInCycle = 0;
  if (kind === 'periodStart') offsetInCycle = 0;
  if (kind === 'ovulation') offsetInCycle = cycleLength - LUTEAL_PHASE_DAYS;
  if (kind === 'fertileStart') offsetInCycle = cycleLength - LUTEAL_PHASE_DAYS - FERTILE_WINDOW_BEFORE_OVULATION;
  if (kind === 'pmsStart') offsetInCycle = cycleLength - PMS_WINDOW_DAYS;

  const daysSinceStart = diffInDays(fromDate, lastPeriodStart);
  let cycleIndex = Math.floor(daysSinceStart / cycleLength);
  let candidate = addDays(lastPeriodStart, cycleIndex * cycleLength + offsetInCycle);

  const fromMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  if (diffInDays(candidate, fromMidnight) < 0) {
    cycleIndex += 1;
    candidate = addDays(lastPeriodStart, cycleIndex * cycleLength + offsetInCycle);
  }

  return candidate;
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const WEEKDAY_LABELS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatLongDatePt(date: Date): string {
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${weekdays[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES_PT[date.getMonth()]}`;
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

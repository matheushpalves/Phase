import { getDb } from './database';

export type MoodValue = 'feliz' | 'neutra' | 'sensivel' | 'irritada' | 'cansada';

export type MoodLogEntry = {
  id: number;
  account_id: number;
  date: string; // ISO date (yyyy-MM-dd)
  mood: MoodValue;
  created_at: string;
  updated_at: string;
};

export async function getMoodLogs(accountId: number): Promise<MoodLogEntry[]> {
  const db = await getDb();
  return db.getAllAsync<MoodLogEntry>('SELECT * FROM mood_log WHERE account_id = ? ORDER BY date DESC', accountId);
}

export async function getMoodForDate(accountId: number, date: string): Promise<MoodLogEntry | null> {
  const db = await getDb();
  const entry = await db.getFirstAsync<MoodLogEntry>(
    'SELECT * FROM mood_log WHERE account_id = ? AND date = ?',
    accountId,
    date
  );
  return entry ?? null;
}

export async function setMoodForDate(accountId: number, date: string, mood: MoodValue): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO mood_log (account_id, date, mood)
     VALUES (?, ?, ?)
     ON CONFLICT(account_id, date) DO UPDATE SET mood = excluded.mood, updated_at = datetime('now')`,
    accountId,
    date,
    mood
  );
}

import { getDb } from './database';

export type CycleLogEntry = {
  id: number;
  account_id: number;
  start_date: string; // ISO date (yyyy-MM-dd)
  created_at: string;
};

export async function getCycleLogs(accountId: number): Promise<CycleLogEntry[]> {
  const db = await getDb();
  return db.getAllAsync<CycleLogEntry>(
    'SELECT * FROM cycle_log WHERE account_id = ? ORDER BY start_date DESC',
    accountId
  );
}

/**
 * Logs an observed period start date. If it's the most recent one on record,
 * it also becomes the profile's anchor date for future predictions — logging
 * an older/backfilled date only adds history without disturbing predictions.
 */
export async function addCycleLogEntry(accountId: number, startDate: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO cycle_log (account_id, start_date) VALUES (?, ?)', accountId, startDate);

  const latest = await db.getFirstAsync<{ start_date: string }>(
    'SELECT start_date FROM cycle_log WHERE account_id = ? ORDER BY start_date DESC LIMIT 1',
    accountId
  );
  if (latest) {
    await db.runAsync(
      `UPDATE cycle_profile SET last_period_start = ? WHERE account_id = ?`,
      latest.start_date,
      accountId
    );
  }
}

import { getDb } from './database';

export type RelationshipStatus = 'namorando' | 'noivos' | 'casados';

export type CycleProfile = {
  id: number;
  account_id: number;
  partner_name: string;
  partner_avatar_uri: string | null;
  partner_birthday: string | null; // ISO date (yyyy-MM-dd)
  relationship_start_date: string | null; // ISO date (yyyy-MM-dd)
  relationship_status: RelationshipStatus | null;
  last_period_start: string; // ISO date (yyyy-MM-dd)
  cycle_length: number;
  period_length: number;
  onboarding_completed: number;
  updated_at: string;
};

export type NotificationSettings = {
  id: number;
  account_id: number;
  cycle_start_enabled: number;
  fertile_window_enabled: number;
  safe_days_enabled: number;
  pms_enabled: number;
};

export async function getCycleProfile(accountId: number): Promise<CycleProfile | null> {
  const db = await getDb();
  const profile = await db.getFirstAsync<CycleProfile>(
    'SELECT * FROM cycle_profile WHERE account_id = ? ORDER BY id DESC LIMIT 1',
    accountId
  );
  return profile ?? null;
}

export async function saveCycleProfile(
  accountId: number,
  data: { partnerName: string; lastPeriodStart: string; cycleLength: number; periodLength: number }
): Promise<CycleProfile> {
  const db = await getDb();
  const existing = await getCycleProfile(accountId);

  if (existing) {
    await db.runAsync(
      `UPDATE cycle_profile
       SET partner_name = ?, last_period_start = ?, cycle_length = ?, period_length = ?, onboarding_completed = 1, updated_at = datetime('now')
       WHERE id = ?`,
      data.partnerName,
      data.lastPeriodStart,
      data.cycleLength,
      data.periodLength,
      existing.id
    );
    return {
      ...existing,
      partner_name: data.partnerName,
      last_period_start: data.lastPeriodStart,
      cycle_length: data.cycleLength,
      period_length: data.periodLength,
      onboarding_completed: 1,
    };
  }

  const result = await db.runAsync(
    `INSERT INTO cycle_profile (account_id, partner_name, last_period_start, cycle_length, period_length, onboarding_completed)
     VALUES (?, ?, ?, ?, ?, 1)`,
    accountId,
    data.partnerName,
    data.lastPeriodStart,
    data.cycleLength,
    data.periodLength
  );

  return {
    id: result.lastInsertRowId,
    account_id: accountId,
    partner_name: data.partnerName,
    partner_avatar_uri: null,
    partner_birthday: null,
    relationship_start_date: null,
    relationship_status: null,
    last_period_start: data.lastPeriodStart,
    cycle_length: data.cycleLength,
    period_length: data.periodLength,
    onboarding_completed: 1,
    updated_at: new Date().toISOString(),
  };
}

export async function updatePartnerAvatar(accountId: number, avatarUri: string | null): Promise<void> {
  const db = await getDb();
  const existing = await getCycleProfile(accountId);
  if (existing) {
    await db.runAsync('UPDATE cycle_profile SET partner_avatar_uri = ? WHERE id = ?', avatarUri, existing.id);
  }
}

export async function updatePartnerBirthday(accountId: number, birthday: string | null): Promise<void> {
  const db = await getDb();
  const existing = await getCycleProfile(accountId);
  if (existing) {
    await db.runAsync('UPDATE cycle_profile SET partner_birthday = ? WHERE id = ?', birthday, existing.id);
  }
}

export async function updateRelationshipDetails(
  accountId: number,
  data: { startDate: string | null; status: RelationshipStatus | null }
): Promise<void> {
  const db = await getDb();
  const existing = await getCycleProfile(accountId);
  if (existing) {
    await db.runAsync(
      'UPDATE cycle_profile SET relationship_start_date = ?, relationship_status = ? WHERE id = ?',
      data.startDate,
      data.status,
      existing.id
    );
  }
}

export async function savePartnerName(accountId: number, partnerName: string): Promise<void> {
  const db = await getDb();
  const existing = await getCycleProfile(accountId);
  if (existing) {
    await db.runAsync('UPDATE cycle_profile SET partner_name = ? WHERE id = ?', partnerName, existing.id);
  } else {
    await db.runAsync(
      `INSERT INTO cycle_profile (account_id, partner_name, last_period_start, cycle_length, period_length, onboarding_completed)
       VALUES (?, ?, ?, 28, 5, 0)`,
      accountId,
      partnerName,
      new Date().toISOString().slice(0, 10)
    );
  }
}

export async function getNotificationSettings(accountId: number): Promise<NotificationSettings | null> {
  const db = await getDb();
  const settings = await db.getFirstAsync<NotificationSettings>(
    'SELECT * FROM notification_settings WHERE account_id = ?',
    accountId
  );
  return settings ?? null;
}

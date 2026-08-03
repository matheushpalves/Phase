import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'phase.db';
const DATABASE_VERSION = 4;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function addColumnIfMissing(db: SQLite.SQLiteDatabase, table: string, column: string, definition: string) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  const hasColumn = columns.some((c) => c.name === column);
  if (!hasColumn) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

// Every statement here is intentionally idempotent (CREATE TABLE IF NOT EXISTS,
// addColumnIfMissing) and runs unconditionally on every app boot, instead of being
// gated behind PRAGMA user_version checks. That gating previously left some devices
// stuck on a stale schema when a migration step got skipped, so self-healing on
// every launch is safer than trusting a recorded version number.
async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

    CREATE TABLE IF NOT EXISTS account (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cycle_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      partner_name TEXT NOT NULL,
      last_period_start TEXT NOT NULL,
      cycle_length INTEGER NOT NULL DEFAULT 28,
      period_length INTEGER NOT NULL DEFAULT 5,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES account (id)
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      cycle_start_enabled INTEGER NOT NULL DEFAULT 1,
      fertile_window_enabled INTEGER NOT NULL DEFAULT 1,
      safe_days_enabled INTEGER NOT NULL DEFAULT 1,
      pms_enabled INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (account_id) REFERENCES account (id)
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      account_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES account (id)
    );
  `);

  await addColumnIfMissing(db, 'account', 'name', `TEXT NOT NULL DEFAULT ''`);
  await addColumnIfMissing(db, 'account', 'avatar_uri', 'TEXT');
  await addColumnIfMissing(db, 'cycle_profile', 'partner_avatar_uri', 'TEXT');
  await addColumnIfMissing(db, 'account', 'birthday', 'TEXT');
  await addColumnIfMissing(db, 'cycle_profile', 'partner_birthday', 'TEXT');
  await addColumnIfMissing(db, 'cycle_profile', 'relationship_start_date', 'TEXT');
  await addColumnIfMissing(db, 'cycle_profile', 'relationship_status', 'TEXT');

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

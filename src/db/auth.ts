import * as Crypto from 'expo-crypto';
import { getDb } from './database';

export type Account = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  avatar_uri: string | null;
  birthday: string | null; // ISO date (yyyy-MM-dd)
  created_at: string;
};

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `phase-salt::${password}`);
}

export async function createAccount(name: string, email: string, password: string): Promise<Account> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const existing = await db.getFirstAsync<Account>('SELECT * FROM account WHERE email = ?', normalizedEmail);
  if (existing) {
    throw new Error('Já existe uma conta com esse e-mail.');
  }

  const result = await db.runAsync(
    'INSERT INTO account (name, email, password_hash) VALUES (?, ?, ?)',
    name,
    normalizedEmail,
    passwordHash
  );

  await db.runAsync(
    'INSERT INTO notification_settings (account_id) VALUES (?)',
    result.lastInsertRowId
  );

  await setSession(result.lastInsertRowId);

  return {
    id: result.lastInsertRowId,
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    avatar_uri: null,
    birthday: null,
    created_at: new Date().toISOString(),
  };
}

export async function login(email: string, password: string): Promise<Account> {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const account = await db.getFirstAsync<Account>(
    'SELECT * FROM account WHERE email = ? AND password_hash = ?',
    normalizedEmail,
    passwordHash
  );

  if (!account) {
    throw new Error('E-mail ou senha inválidos.');
  }

  await setSession(account.id);
  return account;
}

export async function updateAvatar(accountId: number, avatarUri: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE account SET avatar_uri = ? WHERE id = ?', avatarUri, accountId);
}

export async function updateBirthday(accountId: number, birthday: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE account SET birthday = ? WHERE id = ?', birthday, accountId);
}

export async function logout(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM session WHERE id = 1');
}

async function setSession(accountId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO session (id, account_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET account_id = excluded.account_id',
    accountId
  );
}

export async function getCurrentAccount(): Promise<Account | null> {
  const db = await getDb();
  const session = await db.getFirstAsync<{ account_id: number }>('SELECT account_id FROM session WHERE id = 1');
  if (!session?.account_id) return null;

  const account = await db.getFirstAsync<Account>('SELECT * FROM account WHERE id = ?', session.account_id);
  return account ?? null;
}

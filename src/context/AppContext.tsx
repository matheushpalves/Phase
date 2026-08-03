import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  getCurrentAccount,
  login as loginDb,
  logout as logoutDb,
  createAccount as createAccountDb,
  updateAvatar as updateAccountAvatarDb,
  updateBirthday as updateAccountBirthdayDb,
} from '../db/auth';
import {
  CycleProfile,
  RelationshipStatus,
  getCycleProfile,
  saveCycleProfile as saveCycleProfileDb,
  savePartnerName as savePartnerNameDb,
  updatePartnerAvatar as updatePartnerAvatarDb,
  updatePartnerBirthday as updatePartnerBirthdayDb,
  updateRelationshipDetails as updateRelationshipDetailsDb,
} from '../db/cycleProfile';
import { syncScheduledNotifications } from '../utils/notifications';

type AppState = {
  isLoading: boolean;
  account: Account | null;
  cycleProfile: CycleProfile | null;
  login: (email: string, password: string) => Promise<void>;
  createAccount: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  savePartnerName: (name: string) => Promise<void>;
  saveCycleDetails: (data: { lastPeriodStart: string; cycleLength: number; periodLength: number }) => Promise<void>;
  updateUserAvatar: (uri: string | null) => Promise<void>;
  updatePartnerAvatar: (uri: string | null) => Promise<void>;
  updateUserBirthday: (date: string | null) => Promise<void>;
  updatePartnerBirthday: (date: string | null) => Promise<void>;
  updateRelationshipDetails: (data: { startDate: string | null; status: RelationshipStatus | null }) => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [cycleProfile, setCycleProfile] = useState<CycleProfile | null>(null);

  const refreshProfile = useCallback(async (accountId: number) => {
    const [profile, currentAccount] = await Promise.all([getCycleProfile(accountId), getCurrentAccount()]);
    setCycleProfile(profile);
    if (currentAccount) {
      setAccount(currentAccount);
    }
    await syncScheduledNotifications(currentAccount, profile);
    return profile;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const current = await getCurrentAccount();
        setAccount(current);
        if (current) {
          await refreshProfile(current.id);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const acc = await loginDb(email, password);
    setAccount(acc);
    await refreshProfile(acc.id);
  }, [refreshProfile]);

  const createAccount = useCallback(async (name: string, email: string, password: string) => {
    const acc = await createAccountDb(name, email, password);
    setAccount(acc);
    setCycleProfile(null);
  }, []);

  const logout = useCallback(async () => {
    await logoutDb();
    setAccount(null);
    setCycleProfile(null);
  }, []);

  const savePartnerName = useCallback(async (name: string) => {
    if (!account) return;
    await savePartnerNameDb(account.id, name);
    await refreshProfile(account.id);
  }, [account, refreshProfile]);

  const saveCycleDetails = useCallback(async (data: { lastPeriodStart: string; cycleLength: number; periodLength: number }) => {
    if (!account) return;
    const currentName = cycleProfile?.partner_name ?? '';
    await saveCycleProfileDb(account.id, { partnerName: currentName, ...data });
    await refreshProfile(account.id);
  }, [account, cycleProfile, refreshProfile]);

  const updateUserAvatar = useCallback(async (uri: string | null) => {
    if (!account) return;
    await updateAccountAvatarDb(account.id, uri);
    setAccount((prev) => (prev ? { ...prev, avatar_uri: uri } : prev));
  }, [account]);

  const updatePartnerAvatar = useCallback(async (uri: string | null) => {
    if (!account) return;
    await updatePartnerAvatarDb(account.id, uri);
    await refreshProfile(account.id);
  }, [account, refreshProfile]);

  const updateUserBirthday = useCallback(async (date: string | null) => {
    if (!account) return;
    await updateAccountBirthdayDb(account.id, date);
    await refreshProfile(account.id);
  }, [account, refreshProfile]);

  const updatePartnerBirthday = useCallback(async (date: string | null) => {
    if (!account) return;
    await updatePartnerBirthdayDb(account.id, date);
    await refreshProfile(account.id);
  }, [account, refreshProfile]);

  const updateRelationshipDetails = useCallback(async (data: { startDate: string | null; status: RelationshipStatus | null }) => {
    if (!account) return;
    await updateRelationshipDetailsDb(account.id, data);
    await refreshProfile(account.id);
  }, [account, refreshProfile]);

  const value = useMemo<AppState>(() => ({
    isLoading,
    account,
    cycleProfile,
    login,
    createAccount,
    logout,
    savePartnerName,
    saveCycleDetails,
    updateUserAvatar,
    updatePartnerAvatar,
    updateUserBirthday,
    updatePartnerBirthday,
    updateRelationshipDetails,
  }), [
    isLoading,
    account,
    cycleProfile,
    login,
    createAccount,
    logout,
    savePartnerName,
    saveCycleDetails,
    updateUserAvatar,
    updatePartnerAvatar,
    updateUserBirthday,
    updatePartnerBirthday,
    updateRelationshipDetails,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

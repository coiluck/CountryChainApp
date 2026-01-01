// userState.ts
import { Store } from '@tauri-apps/plugin-store';

interface SettingsState {
  bgColor: 'light' | 'dark' | 'midnight';
  themeColor: 'kokone' | 'summer' | 'autumn' | 'purple' | 'blue' | 'miku';
  font: string;
  lang: string;
  seVolume: number;
  bgmVolume: number;
  bgmId: number;
  gameMode: string;
  mapDisplay: boolean;
}

interface userData {
  level: number;
  exp: number;
  accomplishedAchievements: number[];
  gainedAchievements: number[];
  achievementProgress: Record<number, number>;
  dailyAchievements: number[];
  dailyAchievementsAccomplished: number[];
  dailyAchievementsGained: number[];
  lastDailyUpdate: number | null;
  dailyProgress: Record<number, number>;
  isFirstTime: boolean;
  stamina: number;
  lastStaminaUpdate: number;
}

const initialSettingsState: SettingsState = {
  bgColor: 'light',
  themeColor: 'kokone',
  font: "'rounded-mplus-1c-regular', sans-serif",
  lang: 'en',
  seVolume: 0.7,
  bgmVolume: 0.4,
  bgmId: 1,
  gameMode: 'normal',
  mapDisplay: true,
};

const initialUserData: userData = {
  level: 1,
  exp: 0,
  accomplishedAchievements: [],
  gainedAchievements: [],
  achievementProgress: {},
  dailyAchievements: [],
  dailyAchievementsAccomplished: [],
  dailyAchievementsGained: [],
  lastDailyUpdate: null,
  dailyProgress: {},
  isFirstTime: true,
  stamina: 3,
  lastStaminaUpdate: Date.now(),
};

export const settingsState = structuredClone(initialSettingsState);
export const userState = structuredClone(initialUserData);

let settingsStoreCache: Store | null = null;
let userDataStoreCache: Store | null = null;

async function getSettingsStore(): Promise<Store> {
  if (!settingsStoreCache) {
    settingsStoreCache = await Store.load('settings.json');

    // 初期値
    const existing = await settingsStoreCache.get<SettingsState>('settings');
    if (!existing) {
      console.log('初期値を設定');
      await settingsStoreCache.set('settings', initialSettingsState);
      await settingsStoreCache.save();
    }
  }
  return settingsStoreCache;
}
async function getUserDataStore(): Promise<Store> {
  if (!userDataStoreCache) {
    userDataStoreCache = await Store.load('userdata.json');

    // 初期値
    const existing = await userDataStoreCache.get<userData>('userdata');
    if (!existing) {
      await userDataStoreCache.set('userdata', initialUserData);
      await userDataStoreCache.save();
    }
  }
  return userDataStoreCache;
}

export async function saveSettingsData() {
  const store = await getSettingsStore();
  await store.set('settings', settingsState);
  await store.save();
}
export async function saveUserData() {
  const store = await getUserDataStore();
  await store.set('userdata', userState);
  await store.save();
}

export async function applyStore() {
  const settingsStore = await getSettingsStore();
  const storedSettings = await settingsStore.get<SettingsState>('settings');
  if (storedSettings) Object.assign(settingsState, storedSettings);

  const userStore = await getUserDataStore();
  const storedUser = await userStore.get<userData>('userdata');
  if (storedUser) Object.assign(userState, storedUser);
}

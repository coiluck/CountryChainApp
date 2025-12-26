// missions.ts
import { userState } from './userState';

export function shouldResetDaily() {
  const currentTime = new Date();
  const lastUpdate = userState.lastDailyUpdate;

  if (!lastUpdate) return true;

  const lastUpdateDate = new Date(lastUpdate);

  const lastResetTime = new Date(lastUpdate);
  lastResetTime.setHours(4, 0, 0, 0);

  // lastUpdateが午前4時より前だった場合、前日の午前4時にする
  if (lastUpdateDate.getHours() < 4) {
    lastResetTime.setDate(lastResetTime.getDate() - 1);
  }

  // 現在時刻の「午前4時」を計算
  const currentResetTime = new Date(currentTime);
  currentResetTime.setHours(4, 0, 0, 0);

  // 現在時刻が午前4時より前の場合、前日の午前4時にする
  if (currentTime.getHours() < 4) {
    currentResetTime.setDate(currentResetTime.getDate() - 1);
  }

  // 最後の更新時刻と現在時刻の「午前4時」が異なる = 午前4時をまたいだ
  return lastResetTime.getTime() !== currentResetTime.getTime();
}

interface DailyAchievement {
  id: number;
  jaDescription: string;
  enDescription: string;
  slot: number;
  exp: number;
}

let dailyAchievementsData: DailyAchievement[] | null = null;

async function loadDailyAchievementsData() {
  const response = await fetch('/json/daily.json');
  if (!dailyAchievementsData) {
    dailyAchievementsData = await response.json();
  }
  return dailyAchievementsData;
}

export async function decideDailyAchievements() {
  const data = await loadDailyAchievementsData();
  if (!data) return;

  const slot1data = data.filter(item => item.slot === 1);
  const slot2data = data.filter(item => item.slot === 2);
  const slot3data = data.filter(item => item.slot === 3);

  const pickRandom = (array: DailyAchievement[]) => {
    if (array.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  const selectedSlot1 = pickRandom(slot1data);
  const selectedSlot2 = pickRandom(slot2data);
  const selectedSlot3 = pickRandom(slot3data);

  if (!selectedSlot1 || !selectedSlot2 || !selectedSlot3) {
    console.error('Failed to select daily achievements');
    return null;
  }

  return [selectedSlot1, selectedSlot2, selectedSlot3];
}
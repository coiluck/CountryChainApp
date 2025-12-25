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

export function decideDailyAchievements() {
  // 後で書く
}
// judgeAchievements.ts
import { settingsState, userState, saveUserData} from './userState';
import { landlockedCountries, surroundedCountries, worldTop5Countries, stanCountries, equatorCountries, dailyCountryMissions, getArea } from './countryAreaData';

export async function judgePlayAchievements() {
  await increaseProgress(1, 1, 'daily');
  if (settingsState.gameMode === 'easy') {
    await increaseProgress(2, 1, 'daily');
  } else if (settingsState.gameMode === 'normal') {
    await increaseProgress(3, 1, 'daily');
  }
  await increaseProgress(1, 1, 'achievement');
  await increaseProgress(2, 1, 'achievement');
  await increaseProgress(3, 1, 'achievement');
}
export async function judgeAchievements(usedCountries: Set<string>, mistakes: number, isWin: boolean) {
  const userCountriesArray = Array.from(usedCountries);
  // ゲーム終了時・TOPに戻るときに呼ぶ
  // 1, 2, 3の実績は開始時に別で判定する
  if (isWin) {
    // 勝利
    await increaseProgress(4, 1, 'daily');
    await increaseProgress(4, 1, 'achievement');
    await increaseProgress(5, 1, 'achievement');
    await increaseProgress(6, 1, 'achievement');
    if (settingsState.gameMode === 'normal') {
      await increaseProgress(7, 1, 'achievement');
    }
    if (userCountriesArray.length <= 10) {
      await increaseProgress(8, 1, 'achievement');
    }
    if (mistakes === 0) {
      await increaseProgress(9, 1, 'achievement');
    }
    if (mistakes === 2) {
      await increaseProgress(10, 1, 'achievement');
    }
    if (surroundedCountries.includes(userCountriesArray[userCountriesArray.length - 1])) {
      await increaseProgress(15, 1, 'achievement');
    }
  } else {
    // 負け
    if (userCountriesArray.length <= 5) {
      await increaseProgress(11, 1, 'achievement');
    }
  }
  // 合計ターン
  await increaseProgress(5, userCountriesArray.length, 'daily');
  await increaseProgress(6, userCountriesArray.length, 'daily');
  await increaseProgress(12, userCountriesArray.length, 'achievement');

  // CANとGRLが配列内で隣接
  for (let i = 0; i < userCountriesArray.length - 1; i++) {
    if (
      (userCountriesArray[i] === 'CAN' && userCountriesArray[i + 1] === 'GRL') ||
      (userCountriesArray[i] === 'GRL' && userCountriesArray[i + 1] === 'CAN')
    ) {
      await increaseProgress(13, 1, 'achievement');
    }
  }
  // スタン系
  const stanCount = userCountriesArray.filter(c => stanCountries.includes(c)).length;
  await increaseProgress(14, stanCount, 'achievement');
  // 面積TOP5
  const top5Count = userCountriesArray.filter(c => worldTop5Countries.includes(c)).length;
  await increaseProgress(16, top5Count, 'achievement');

  // 内陸国5連続
  let maxLandlockedStreak = 0;
  let currentLandlockedStreak = 0;
  for (const country of userCountriesArray) {
    if (landlockedCountries.includes(country)) {
      currentLandlockedStreak++;
      maxLandlockedStreak = Math.max(maxLandlockedStreak, currentLandlockedStreak);
    } else {
      currentLandlockedStreak = 0;
    }
  }
  await increaseProgress(17, maxLandlockedStreak, 'achievement');

  // アフリカ大陸40連続
  const africaAreas = ['westNorthAfrica', 'centralAfrica', 'eastSouthAfrica'];
  let maxAfricaStreak = 0;
  let currentAfricaStreak = 0;
  for (const country of userCountriesArray) {
    const area = getArea(country);
    if (area && africaAreas.includes(area)) {
      currentAfricaStreak++;
      maxAfricaStreak = Math.max(maxAfricaStreak, currentAfricaStreak);
    } else {
      currentAfricaStreak = 0;
    }
  }
  await increaseProgress(18, maxAfricaStreak, 'achievement');

  // 三大陸周遊記って二大陸じゃん
  const continentMap: { [key: string]: string } = {
    'eastEurope': 'Europe',
    'westEurope': 'Europe',
    'northAndMiddleAmerica': 'NorthAmerica',
    'southAmerica': 'SouthAmerica',
    'westNorthAfrica': 'Africa',
    'centralAfrica': 'Africa',
    'eastSouthAfrica': 'Africa',
    'eastAsia': 'Asia',
    'westAsia': 'Asia',
    'oceania': 'Oceania'
  };
  const continents = new Set<string>();
  for (const country of userCountriesArray) {
    const area = getArea(country);
    if (area && continentMap[area]) {
      continents.add(continentMap[area]);
    }
  }
  await increaseProgress(19, continents.size, 'achievement');

  // 地域系デイリー
  let hasAsia = false;
  let hasEurope = false;
  let hasAfrica = false;
  for (const country of userCountriesArray) {
    const area = getArea(country);
    if (!area) continue;
    const continent = continentMap[area];

    if (landlockedCountries.includes(country)) {
      await increaseProgress(8, 1, 'daily');
    }

    if (continent === 'Europe') {
      await increaseProgress(9, 1, 'daily');
      hasEurope = true;
    } else if (continent === 'Africa') {
      await increaseProgress(10, 1, 'daily');
      hasAfrica = true;
    } else if (continent === 'Asia') {
      await increaseProgress(11, 1, 'daily');
      hasAsia = true;
    } else if (continent === 'SouthAmerica') {
      await increaseProgress(12, 1, 'daily');
    }

    if (equatorCountries.includes(country)) {
      await increaseProgress(13, 1, 'daily');
    }

    // 特定の国を言うデイリー
    const mission = dailyCountryMissions.find(m => m.country === country);
    if (mission) {
      await increaseProgress(mission.id, 1, 'daily');
    }
  }
  const trueArray = [hasAsia, hasEurope, hasAfrica].filter(Boolean) as boolean[];
  await increaseProgress(7, trueArray.length, 'daily');

  // 最後に保存
  saveUserData();
}


// json用
let achievementData: any[] | null = null;
async function loadAchievementData() {
  const response = await fetch('/json/achievement.json');
  if (!achievementData) {
    achievementData = await response.json();
  }
  return achievementData;
}

let dailyData: any[] | null = null;
async function loadDailyData() {
  const response = await fetch('/json/daily.json');
  if (!dailyData) {
    dailyData = await response.json();
  }
  return dailyData;
}

// 増加処理（汎用）
async function increaseProgress(achievementId: number, amount: number, target: string) {
  const data = target === 'achievement' ? await loadAchievementData() : await loadDailyData();
  if (!data) return;

  const item = data.find((i: any) => i.id === achievementId);
  if (!item) return;
  const maxProgress = item.maxProgress;

  if (target === 'daily' && !userState.dailyAchievements.includes(achievementId)) {
    return;
  }

  const progressMap = target === 'achievement' ? userState.achievementProgress : userState.dailyProgress;
  const accomplishedList = target === 'achievement' ? userState.accomplishedAchievements : userState.dailyAchievementsAccomplished;
  const gainedList = target === 'achievement' ? userState.gainedAchievements : userState.dailyAchievementsGained;

  if (gainedList.includes(achievementId)) return;
  if (accomplishedList.includes(achievementId)) return;

  // 進捗更新
  let currentProgress = progressMap[achievementId] || 0;
  if (item?.isCumulative === true) {
    currentProgress += amount;
  } else {
    currentProgress = Math.max(currentProgress, amount);
  }
  if (currentProgress > maxProgress) {
    currentProgress = maxProgress;
  }
  progressMap[achievementId] = currentProgress;

  // 達成判定
  if (currentProgress >= maxProgress &&
    !accomplishedList.includes(achievementId) &&
    !gainedList.includes(achievementId)
  ) {
    accomplishedList.push(achievementId);
  }
}
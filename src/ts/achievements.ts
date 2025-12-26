// achievements.ts
export function setUpAchievements() {
  setUpAchievementsTabs();
  setUpUser();
  setUpAchievementsDaily();
  setUpAchievementsAchievement();
}

function setUpUser() {
  const level = document.getElementById('achievements-user-level') as HTMLElement;
  level.textContent = userState.level.toString();
  const levelBar = document.querySelector('.achievements-user-level-bar-fill') as HTMLElement;
  levelBar.style.width = `${userState.exp % 100}%`;
  const levelText = document.querySelector('.achievements-user-level-text.experience') as HTMLElement;
  levelText.textContent = `${userState.exp % 100}/100`;
}

import { shouldResetDaily, decideDailyAchievements } from './modules/missions';
import { saveUserData } from './modules/userState';

interface DailyAchievementItem {
  id: number;
  jaDescription: string;
  enDescription: string;
  slot: number;
  exp: number;
}

async function setUpAchievementsDaily() {
  const dailyContainer = document.querySelector('.achievements-tabs-content-item.daily') as HTMLElement;
  if (!dailyContainer) return;
  dailyContainer.innerHTML = '';
  dailyContainer.scrollTop = 0;

  // 更新処理
  const isNeedUpdate = shouldResetDaily();
  if (isNeedUpdate) {
    userState.lastDailyUpdate = Date.now();
    const newDailyAchievements = await decideDailyAchievements();
    if (newDailyAchievements) {
      userState.dailyAchievements = newDailyAchievements.map((item: any) => item.id);
      userState.dailyAchievementsAccomplished = [];
      userState.dailyAchievementsGained = [];

      saveUserData();
    }
  }

  const response = await fetch('/json/daily.json');
  const dailyAchievementsData = await response.json() as DailyAchievementItem[];

  for (const achievementItemId of userState.dailyAchievements) {
    const achievement = dailyAchievementsData.find((item) => item.id === achievementItemId);
    if (!achievement) continue;

    const achievementItem = document.createElement('div');
    achievementItem.classList.add('achievement-item');

    let buttonHtml = '';
    if (userState.dailyAchievementsAccomplished.includes(achievement.id)) {
      buttonHtml = `<div class="achievement-item-accomplished atodetukeru-button">報酬を獲得</div>`;
    } else if (userState.dailyAchievementsGained.includes(achievement.id)) {
      buttonHtml = `<div class="achievement-item-gained">獲得済み</div>`;
      achievementItem.classList.add('gained');
    } else {
      buttonHtml = `<div class="achievement-item-exp-text">+${achievement.exp} EXP</div>`;
    }
    const description = settingsState.lang === 'ja' ? achievement.jaDescription : achievement.enDescription;

    achievementItem.innerHTML = `
      <div class="achievement-item-info">
        <div class="achievement-item-icon"></div>
        <div class="achievement-item-text">
          <div class="achievement-item-description">${description}</div>
        </div>
        ${buttonHtml}
      </div>
      <div class="achievement-item-progress">
        <div class="achievement-item-progress-bar">
          <div class="achievement-item-progress-bar-fill" style="width: 20%;"></div>
        </div>
    `;

    const element = achievementItem.querySelector('.atodetukeru-button') as HTMLElement;
    if (element) {
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        getExp(achievement.exp);
        achievementItem.classList.add('gained');
        achievementItem.innerHTML = `
          <div class="achievement-item-info">
            <div class="achievement-item-icon"></div>
            <div class="achievement-item-text">
              <div class="achievement-item-description">${description}</div>
            </div>
            <div class="achievement-item-gained">獲得済み</div>
          </div>
          <div class="achievement-item-progress">
            <div class="achievement-item-progress-bar">
              <div class="achievement-item-progress-bar-fill" style="width: 20%;"></div>
            </div>
          </div>
        `;
      });
    }
    dailyContainer.appendChild(achievementItem);
  }
}

import { settingsState, userState } from './modules/userState';

interface AchievementItem {
  id: number;
  jaName: string;
  enName: string;
  jaDescription: string;
  enDescription: string;
  exp: number;
}
async function setUpAchievementsAchievement() {
  const response = await fetch('/json/achievement.json');
  const achievementData = await response.json() as AchievementItem[];
  if (!achievementData) return;

  const achievementContainer = document.querySelector('.achievements-tabs-content-item.achievement') as HTMLElement;
  achievementContainer.innerHTML = '';
  achievementContainer.scrollTop = 0;

  achievementData.sort((a, b) => {
    const getPriority = (id: number) => {
      const isGained = userState.gainedAchievements.includes(id);
      const isAccomplished = userState.accomplishedAchievements.includes(id);

      // 達成済み && 報酬を受け取っていない
      if (isAccomplished && !isGained) return 0;
      // 未達成
      if (!isAccomplished && !isGained) return 1;
      // 獲得済み
      return 2;
    };

    return getPriority(a.id) - getPriority(b.id);
  });

  for (const achievement of achievementData) {
    const name = settingsState.lang === 'ja' ? achievement.jaName : achievement.enName;
    const description = settingsState.lang === 'ja' ? achievement.jaDescription : achievement.enDescription;

    let buttonHtml = '';
    if (userState.gainedAchievements.includes(achievement.id)) {
      // 獲得済み
      buttonHtml = `<div class="achievement-item-gained">獲得済み</div>`;
    } else if (userState.accomplishedAchievements.includes(achievement.id)) {
      // 達成済み && 未獲得
      buttonHtml = `<div class="achievement-item-accomplished atodetukeru-button">報酬を獲得</div>`;
    } else {
      // 未達成
      buttonHtml = `<div class="achievement-item-exp-text">+${achievement.exp} EXP</div>`;
    }

    const achievementItem = document.createElement('div');
    achievementItem.classList.add('achievement-item');
    if (userState.gainedAchievements.includes(achievement.id)) {
      achievementItem.classList.add('gained'); // 獲得済みはうすく表示
    }
    achievementItem.dataset.id = achievement.id.toString(); // 獲得時のソート用
    achievementItem.innerHTML = `
      <div class="achievement-item-info">
        <div class="achievement-item-icon"></div>
        <div class="achievement-item-text">
          <div class="achievement-item-name">${name}</div>
          <div class="achievement-item-description">${description}</div>
        </div>
        ${buttonHtml}
      </div>
      <div class="achievement-item-progress">
        <div class="achievement-item-progress-bar">
          <div class="achievement-item-progress-bar-fill" style="width: 20%;"></div>
        </div>
      </div>
    `;

    const element = achievementItem.querySelector('.atodetukeru-button') as HTMLElement;

    if (element) {
      element.addEventListener('click', (e) => {
        e.stopPropagation();

        getExp(achievement.exp);

        achievementItem.style.height = '0px';
        achievementItem.style.paddingTop = '0px';
        achievementItem.style.paddingBottom = '0px';
        achievementItem.style.opacity = '0';
        achievementItem.style.marginTop = '0px';
        achievementItem.style.marginBottom = '-15px';
        setTimeout(() => {
          achievementItem.classList.add('gained');
          achievementItem.innerHTML = `
            <div class="achievement-item-info">
              <div class="achievement-item-icon"></div>
              <div class="achievement-item-text">
                <div class="achievement-item-name">${name}</div>
                <div class="achievement-item-description">${description}</div>
              </div>
              <div class="achievement-item-gained">獲得済み</div>
            </div>
            <div class="achievement-item-progress">
              <div class="achievement-item-progress-bar">
                <div class="achievement-item-progress-bar-fill" style="width: 20%;"></div>
              </div>
            </div>
          `;

          const allItems = achievementContainer.querySelectorAll('.achievement-item') as NodeListOf<HTMLElement>;
          let targetNode: HTMLElement | null = null;
          for (const item of allItems) {
            if (item === achievementItem) continue;

            // 「獲得済み」かつ「IDが自分より大きい」要素の前
            if (item.classList.contains('gained')) {
                const currentId = Number(item.dataset.id);
                if (currentId > achievement.id) {
                    targetNode = item;
                    break;
                }
            }
          }

          if (targetNode) {
            achievementContainer.insertBefore(achievementItem, targetNode);
          } else {
            // 見つからない => 自分が一番大きいID or 獲得済みが他にない
            achievementContainer.appendChild(achievementItem);
          }

          achievementItem.style.height = '';
          achievementItem.style.paddingTop = '';
          achievementItem.style.paddingBottom = '';
          achievementItem.style.opacity = '';
          achievementItem.style.marginTop = '';
          achievementItem.style.marginBottom = '';
        }, 300);
      }, { once: true });
    }
    achievementContainer.appendChild(achievementItem);
  }
}
function getExp(exp: number) {
  userState.exp += exp;
  let leveledUp = false;
  while (userState.exp >= 100) {
    userState.exp -= 100;
    userState.level++;
    leveledUp = true;
  }
  if (leveledUp) {
    // 音を鳴らす
  }
  // saveUserData();
  setUpUser();
}


function setUpAchievementsTabs() {
  const background = document.querySelector('.achievements-tabs-background') as HTMLElement;
  const container = document.querySelector('.achievements-tabs-container') as HTMLElement;
  const tabs = container.querySelectorAll('.achievements-tabs-label-item') as NodeListOf<HTMLElement>;
  const content = container.querySelector('.achievements-tabs-content') as HTMLElement;

  let isScrolling = false; // スクロール中かどうかのフラグ

  function moveGlider(targetElement: HTMLElement) {
    if (!targetElement) return;

    const width = targetElement.offsetWidth;
    const left = targetElement.offsetLeft;

    background.style.width = `${width}px`;
    background.style.transform = `translateX(${left}px)`;
  }

  // 初期位置を設定
  const activeTab = container.querySelector('.achievements-tabs-label-item.current') as HTMLElement;
  if (activeTab) {
    moveGlider(activeTab);
  } else {
    tabs[0].classList.add('current');
    moveGlider(tabs[0]);
  }

  // タブクリックで切り替え
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      isScrolling = true;
      tabs.forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
      moveGlider(tab);
      content.scrollTo({
        left: content.offsetWidth * idx,
        behavior: 'smooth'
      });
      setTimeout(() => {
        isScrolling = false;
      }, 300); // transitionの時間
    });
  });

  // スクロールでタブ状態を更新
  content.addEventListener('scroll', () => {
    if (isScrolling) return;

    const idx = Math.round(content.scrollLeft / content.offsetWidth);
    tabs.forEach((t, i) => {
      if (i === idx) {
        t.classList.add('current');
        moveGlider(t);
      } else {
        t.classList.remove('current');
      }
    });
  });
}
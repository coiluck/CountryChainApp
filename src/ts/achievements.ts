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
  levelBar.style.width = `${userState.exp / userState.level * 100}%`;
  const levelText = document.querySelector('.achievements-user-level-text.experience') as HTMLElement;
  levelText.textContent = `${userState.exp}/100`;
}

function setUpAchievementsDaily() {
  // atode
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
  const response = await fetch('./src/json/achievement.json');
  const achievementData = await response.json()  as AchievementItem[];
  if (!achievementData) return;

  const achievementContainer = document.querySelector('.achievements-tabs-content-item.achievement') as HTMLElement;
  achievementContainer.innerHTML = '';

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
    const achievementItem = document.createElement('div');
    achievementItem.classList.add('achievement-item');

    let element = document.createElement('div') as HTMLElement;
    if (userState.gainedAchievements.includes(achievement.id)) {
      // 獲得済み (Gained)
      achievementItem.classList.add('gained');
      element.classList.add('achievement-item-gained');
      element.textContent = `獲得済み`;
    } else if (userState.accomplishedAchievements.includes(achievement.id)) {
      // 達成済み (Accomplished / 未受け取り)
      element.classList.add('achievement-item-accomplished');
      element.textContent = `報酬を獲得`;
    } else {
      // 未達成 (Default)
      element.classList.add('achievement-item-exp-text');
      element.textContent = `+${achievement.exp} EXP`;
    }
    achievementItem.innerHTML = `
      <div class="achievement-item-info">
        <div class="achievement-item-icon"></div>
        <div class="achievement-item-text">
          <div class="achievement-item-name">${name}</div>
          <div class="achievement-item-description">${description}</div>
        </div>
        ${element.outerHTML}
      </div>
      <div class="achievement-item-progress">
        <div class="achievement-item-progress-bar">
          <div class="achievement-item-progress-bar-fill" style="width: 20%;"></div>
        </div>
      </div>
    `;

    achievementContainer.appendChild(achievementItem);
  }
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
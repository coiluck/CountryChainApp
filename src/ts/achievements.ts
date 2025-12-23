// achievements.ts
export function setUpAchievements() {
  setUpAchievementsTabs();
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
  const activeTab = container.querySelector('.achievements-tabs-label-item.active') as HTMLElement;
  if (activeTab) {
    moveGlider(activeTab);
  }

  // タブクリックで切り替え
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      isScrolling = true;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
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
        t.classList.add('active');
        moveGlider(t);
      } else {
        t.classList.remove('active');
      }
    });
  });
}
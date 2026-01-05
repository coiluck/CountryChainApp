// settings.ts
export function setUpSettings() {
  const settingsContent = document.querySelectorAll('.settings-item-content');
  settingsContent.forEach(content => {
    content.innerHTML = ''
  });
  setUpColorSettings();
  setUpFontSettings();
  setUpLangSettings();
  setUpSEVolumeSettings();
  setUpBGMVolumeSettings();
  setUpBGMSettings();
  setUpGameModeSettings();
  setUpMapDisplaySettings();
}

import { settingsState, userState, saveSettingsData } from './modules/userState';
import { audioPlayer } from './modules/audio';

const bgList = [
  {
    name: 'light',
    textColor: '#333',
    bgColor: '#e6e8ea',
    bgBrightColor: '#f5f7fa',
    borderColor: '#ccc',
    metaColor: '#ccc',
    reqLevel: 1
  },
  {
    name: 'dark',
    textColor: '#fff3f1',
    bgColor: '#1e1e1e',
    bgBrightColor: '#2e2e2e',
    borderColor: '#888',
    metaColor: '#555',
    reqLevel: 6
  },
  {
    name: 'midnight',
    textColor: '#fff3f1',
    bgColor: '#0a0f1e',
    bgBrightColor: '#152040',
    borderColor: '#888',
    metaColor: '#444',
    reqLevel: 13
  }
];

const themeList = [
  {
    name: 'kokone',
    primaryColor: '#ff7f7e',
    secondaryColor: '#ffbe7e',
    themeContrastColor: '#fff',
    unlockLevel: 1,
  },
  {
    name: 'summer',
    primaryColor: '#4B9DA9',
    secondaryColor: '#a9574b',
    themeContrastColor: '#2e2e2e',
    unlockLevel: 2,
  },
  {
    name: 'autumn',
    primaryColor: '#fc5a03',
    secondaryColor: '#eba12a',
    themeContrastColor: '#FCDEC0',
    unlockLevel: 7,
  },
  {
    name: 'purple',
    primaryColor: '#ba5b9b',
    secondaryColor: '#E49BA6',
    themeContrastColor: '#FFE3E5',
    unlockLevel: 12,
  },
  {
    name: 'blue',
    primaryColor: '#3F72AF',
    secondaryColor: '#40b37f',
    themeContrastColor: '#112D4E',
    unlockLevel: 15,
  },
  {
    name: 'miku',
    primaryColor: '#08D9D6',
    secondaryColor: '#FF2E63',
    themeContrastColor: '#252A34',
    unlockLevel: 18,
  },
];

const fontList = [
  {
    name: 'Rounded M+',
    value: "'rounded-mplus-1c-regular', sans-serif",
    reqLevel: 1
  },
  {
    name: 'Tanuki Magic',
    value: "'tanuki-magic', sans-serif",
    reqLevel: 5
  },
  {
    name: 'Logo Type Gothic',
    value: "'logo-type-gothic', sans-serif",
    reqLevel: 10
  },
  {
    name: 'Mamelon',
    value: "'mamelon', sans-serif",
    reqLevel: 20
  },
];

export const bgmList = [
  {
    id: 1,
    title: 'settingsBGMTitle1',
    file: 'jump',
    reqLevel: 1
  },
  {
    id: 2,
    title: 'settingsBGMTitle2',
    file: 'lazy-mode-on',
    reqLevel: 3
  },
  {
    id: 3,
    title: 'settingsBGMTitle3',
    file: 'sekiranun',
    reqLevel: 9
  },
  {
    id: 4,
    title: 'settingsBGMTitle4',
    file: 'tokimeki',
    reqLevel: 17
  }
]

async function setUpColorSettings() {
  const colorSettings = document.querySelector('.settings-item-content.color');
  if (!colorSettings) {
    return;
  }
  colorSettings.innerHTML = '';

  // ラベル
  const bgColorLabel = document.createElement('div');
  bgColorLabel.classList.add('settings-color-label');
  bgColorLabel.dataset.translation = 'settingsColorBgLabel';
  bgColorLabel.textContent = await getTranslatedText('settingsColorBgLabel', []) || '';
  colorSettings.appendChild(bgColorLabel);
  // bg
  const bgColorContainer = document.createElement('div');
  bgColorContainer.classList.add('settings-color-item-container');
  colorSettings.appendChild(bgColorContainer);

  for (const bgData of bgList) {
    const bgColorItem = document.createElement('div');
    bgColorItem.classList.add('settings-color-item');
    bgColorItem.style.backgroundColor = bgData.bgColor;
    if (bgData.reqLevel > userState.level) {
      bgColorItem.classList.add('locked');
      bgColorItem.style.setProperty('--unlock-level', `"Lv.${bgData.reqLevel.toString()}"`);
    }
    if (settingsState.bgColor === bgData.name) {
      bgColorItem.classList.add('selected');
    }
    bgColorContainer.appendChild(bgColorItem);
    bgColorItem.addEventListener('click', () => {
      if (bgData.reqLevel > userState.level) {
        audioPlayer.playSE('disable');
        return;
      }
      audioPlayer.playSE('click');

      bgColorContainer.querySelectorAll('.settings-color-item').forEach(item => {
        item.classList.remove('selected');
      });
      bgColorItem.classList.add('selected');
      document.documentElement.style.setProperty('--bg', bgData.bgColor);
      document.documentElement.style.setProperty('--bg-bright', bgData.bgBrightColor);
      document.documentElement.style.setProperty('--border-color', bgData.borderColor);
      document.documentElement.style.setProperty('--meta', bgData.metaColor);
      document.documentElement.style.setProperty('--text-color', bgData.textColor);
      settingsState.bgColor = bgData.name as 'light' | 'dark' | 'midnight';
      saveSettingsData();
    });
  }

  // ラベル
  const mainColorLabel = document.createElement('div');
  mainColorLabel.classList.add('settings-color-label');
  mainColorLabel.dataset.translation = 'settingsColorMainLabel';
  mainColorLabel.textContent = await getTranslatedText('settingsColorMainLabel', []) || '';
  colorSettings.appendChild(mainColorLabel);
  // main
  const mainColorContainer = document.createElement('div');
  mainColorContainer.classList.add('settings-color-item-container');
  colorSettings.appendChild(mainColorContainer);

  for (const themeData of themeList) {
    const themeColorItem = document.createElement('div');
    themeColorItem.classList.add('settings-color-item');
    // 中に二つの色を入れる
    const themeFirstColor = document.createElement('div');
    themeFirstColor.style.backgroundColor = themeData.primaryColor;
    themeFirstColor.classList.add('settings-color-item-block');
    themeColorItem.appendChild(themeFirstColor);
    const themeSecondColor = document.createElement('div');
    themeSecondColor.style.backgroundColor = themeData.secondaryColor;
    themeSecondColor.classList.add('settings-color-item-block');
    themeColorItem.appendChild(themeSecondColor);
    if (themeData.unlockLevel > userState.level) {
      themeColorItem.classList.add('locked');
      themeColorItem.style.setProperty('--unlock-level', `"Lv.${themeData.unlockLevel.toString()}"`);
    }
    if (settingsState.themeColor === themeData.name) {
      themeColorItem.classList.add('selected');
    }
    mainColorContainer.appendChild(themeColorItem);
    themeColorItem.addEventListener('click', () => {
      if (themeData.unlockLevel > userState.level) {
        audioPlayer.playSE('disable');
        return;
      }
      audioPlayer.playSE('click');
      mainColorContainer.querySelectorAll('.settings-color-item').forEach(item => {
        item.classList.remove('selected');
      });
      themeColorItem.classList.add('selected');
      document.documentElement.style.setProperty('--primary-color', themeData.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', themeData.secondaryColor);
      document.documentElement.style.setProperty('--theme-contrast-color', themeData.themeContrastColor);
      settingsState.themeColor = themeData.name as 'kokone' | 'summer' | 'autumn' | 'purple' | 'blue' | 'miku';
      saveSettingsData();
    });
  }
}

export function applyTheme() {
  const currentBg = bgList.find(bg => bg.name === settingsState.bgColor);
  if (currentBg) {
    document.documentElement.style.setProperty('--bg', currentBg.bgColor);
    document.documentElement.style.setProperty('--bg-bright', currentBg.bgBrightColor);
    document.documentElement.style.setProperty('--border-color', currentBg.borderColor);
    document.documentElement.style.setProperty('--meta', currentBg.metaColor);
    document.documentElement.style.setProperty('--text-color', currentBg.textColor);
  }

  const currentTheme = themeList.find(theme => theme.name === settingsState.themeColor);
  if (currentTheme) {
    document.documentElement.style.setProperty('--primary-color', currentTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', currentTheme.secondaryColor);
    document.documentElement.style.setProperty('--theme-contrast-color', currentTheme.themeContrastColor);
  }
}

function setUpFontSettings() {
  const fontSettings = document.querySelector('.settings-item-content.font') as HTMLElement;

  if (fontSettings) {
    fontSettings.innerHTML = '';

    const radioContainer = document.createElement('div');
    radioContainer.classList.add('radio-group');
    fontList.forEach(font => {
      const isLocked = font.reqLevel > userState.level;
      const label = document.createElement('label');
      if (isLocked) {
        label.classList.add('locked');
      }
      label.innerHTML = `
        <input type="radio" name="font-selection" value="${font.value}" ${isLocked ? 'disabled' : ''}>
        <span class="settings-radio-icon"></span>
        <span class="settings-radio-text">
          ${font.name}
          ${isLocked ? `<span class="locked-text">(Lv.${font.reqLevel})</span>` : ''}
        </span>
      `;

      radioContainer.appendChild(label);
    });
    fontSettings.appendChild(radioContainer);

    // イベントリスナ
    const radios = fontSettings.querySelectorAll<HTMLInputElement>('input[name="font-selection"]');
    radios.forEach((radio) => {
      if (settingsState.font === radio.value) {
        radio.checked = true;
        document.documentElement.style.setProperty('--font', settingsState.font);
      }
      radio.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.disabled) {
          audioPlayer.playSE('disable');
          return;
        }
        audioPlayer.playSE('click');
        settingsState.font = target.value;
        document.documentElement.style.setProperty('--font', target.value);
        // 保存処理
        saveSettingsData();
      });
    });
  }
}

import { applyTranslationsToDocument } from './modules/translation';

async function setUpLangSettings() {
  const langSettingsContainer = document.querySelector('.settings-item-content.lang');
  if (!langSettingsContainer) {
    return;
  }
  langSettingsContainer.innerHTML = `
      <div class="settings-lang-item ja">日本語</div>
      <div class="settings-lang-item en">English</div>
    `;
  // 初期選択
  const initialLang = settingsState.lang as 'ja' | 'en';
  const initialLangItem = langSettingsContainer.querySelector<HTMLElement>(`.settings-lang-item.${initialLang}`);
  if (initialLangItem) {
    initialLangItem.classList.add('selected');
  }
  // イベントリスナ
  const langItems = langSettingsContainer.querySelectorAll<HTMLElement>('.settings-lang-item');
  langItems.forEach((item: HTMLElement) => {
    item.addEventListener('click', () => {
      audioPlayer.playSE('click');

      langItems.forEach((item: HTMLElement) => {
        item.classList.remove('selected');
      });
      item.classList.add('selected');
      settingsState.lang = item.classList.contains('ja') ? 'ja' : 'en';
      applyTranslationsToDocument();
      saveSettingsData();
    });
  });
}

function setUpSEVolumeSettings() {
  const soundEffectSettingsContainer = document.querySelector('.settings-item-content.se-volume');
  if (!soundEffectSettingsContainer) {
    return;
  }
  soundEffectSettingsContainer.innerHTML = `
    <input type="range" min="0" max="100" value="50" step="10" id="setting-se-volume" class="setting-range-slider">
    <div class="settings-se-volume-label">--%</div>
  `;
  const seVolumeInput = soundEffectSettingsContainer.querySelector<HTMLInputElement>('input[id="setting-se-volume"]');
  const seVolumeLabel = soundEffectSettingsContainer.querySelector<HTMLElement>('.settings-se-volume-label')
  if (seVolumeInput && seVolumeLabel) {
    const currentVolume = Math.round(settingsState.seVolume * 100);
    seVolumeInput.value = currentVolume.toString();
    seVolumeLabel.textContent = `${currentVolume}%`;
    audioPlayer.setSEVolume(settingsState.seVolume);
    seVolumeInput.addEventListener('input', () => {
      const newVal = parseInt(seVolumeInput.value);
      settingsState.seVolume = newVal / 100;
      seVolumeLabel.textContent = `${newVal}%`;
      audioPlayer.setSEVolume(newVal / 100);
    });
    seVolumeInput.addEventListener('change', () => {
      audioPlayer.playSE('click');
      saveSettingsData();
    });
  }
}

function setUpBGMVolumeSettings() {
  const bgmVolumeSettingsContainer = document.querySelector('.settings-item-content.bgm-volume');
  if (!bgmVolumeSettingsContainer) {
    return;
  }
  bgmVolumeSettingsContainer.innerHTML = `
    <input type="range" min="0" max="100" value="50" step="10" id="setting-bgm-volume" class="setting-range-slider">
    <div class="settings-bgm-volume-label">--%</div>
  `;
  const bgmVolumeInput = bgmVolumeSettingsContainer.querySelector<HTMLInputElement>('input[id="setting-bgm-volume"]');
  const bgmVolumeLabel = bgmVolumeSettingsContainer.querySelector<HTMLElement>('.settings-bgm-volume-label')
  if (bgmVolumeInput && bgmVolumeLabel) {
    const currentVolume = Math.round(settingsState.bgmVolume * 100);
    bgmVolumeInput.value = currentVolume.toString();
    bgmVolumeLabel.textContent = `${currentVolume}%`;
    audioPlayer.setBGMVolume(settingsState.bgmVolume);
    bgmVolumeInput.addEventListener('input', () => {
      const newVal = parseInt(bgmVolumeInput.value);
      settingsState.bgmVolume = newVal / 100;
      bgmVolumeLabel.textContent = `${newVal}%`;
      audioPlayer.setBGMVolume(newVal / 100);
    });
    bgmVolumeInput.addEventListener('change', () => {
      // audioPlayer.playSE('click'); bgmの大きさで判断するからいらないか
      saveSettingsData();
    });
  }
}

import { getTranslatedText } from './modules/translation';

async function setUpBGMSettings() {
  const bgmSettingsContainer = document.querySelector('.settings-item-content.bgm');
  if (!bgmSettingsContainer) {
    return;
  }
  bgmSettingsContainer.innerHTML = `
    <div class="settings-bgm-button back"></div>
    <div class="settings-bgm-item-border">
      <div class="settings-bgm-item-container"></div>
    </div>
    <div class="settings-bgm-button next"></div>
  `;

  const backButton = bgmSettingsContainer.querySelector<HTMLElement>('.settings-bgm-button.back');
  const nextButton = bgmSettingsContainer.querySelector<HTMLElement>('.settings-bgm-button.next');
  const bgmItemContainer = bgmSettingsContainer.querySelector<HTMLElement>('.settings-bgm-item-container');
  if (!backButton || !nextButton || !bgmItemContainer) return;

  let currentIndex = bgmList.findIndex(bgm => bgm.id === settingsState.bgmId);
  if (currentIndex === -1) currentIndex = 0;

  let isAnimating = false;

  const renderItems = async () => {
    bgmItemContainer.innerHTML = '';
    const prevIndex = (currentIndex - 1 + bgmList.length) % bgmList.length;
    const nextIndex = (currentIndex + 1) % bgmList.length;
    const indices = [prevIndex, currentIndex, nextIndex];

    // 3つの要素を作成
    for (const index of indices) {
      const item = document.createElement('div');
      item.classList.add('settings-bgm-item');
      const bgmData = bgmList[index];
      const translateKey = bgmData.title;
      const translatedText = await getTranslatedText(translateKey, []);
      item.textContent = translatedText || bgmData.title;
      if (bgmData.reqLevel > userState.level) {
        item.classList.add('locked');
        item.textContent += ` (Lv.${bgmData.reqLevel})`;
      }
      bgmItemContainer.appendChild(item);
    }
    bgmItemContainer.classList.add('no-transition');
    bgmItemContainer.style.transform = 'translateX(-100%)';
    bgmItemContainer.offsetHeight;
    requestAnimationFrame(() => {
      bgmItemContainer.classList.remove('no-transition');
    });
  };

  // 初期描画
  await renderItems();

  // 前へ
  backButton.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    audioPlayer.playSE('click');
    bgmItemContainer.style.transform = 'translateX(0%)';
    setTimeout(async () => {
      currentIndex = (currentIndex - 1 + bgmList.length) % bgmList.length;
      const targetBGM = bgmList[currentIndex];
      if (userState.level >= targetBGM.reqLevel) {
        settingsState.bgmId = targetBGM.id;
        audioPlayer.playBGM(targetBGM.file);
        saveSettingsData();
      }
      await renderItems();
      isAnimating = false;
    }, 500);
  });

  // 次へ
  nextButton.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    audioPlayer.playSE('click');
    bgmItemContainer.style.transform = 'translateX(-200%)';
    setTimeout(async () => {
      currentIndex = (currentIndex + 1) % bgmList.length;
      const targetBGM = bgmList[currentIndex];
      if (userState.level >= targetBGM.reqLevel) {
        settingsState.bgmId = targetBGM.id;
        audioPlayer.playBGM(targetBGM.file);
        saveSettingsData();
      }
      await renderItems();
      isAnimating = false;
    }, 500);
  });
}

function setUpGameModeSettings() {
  const gameModeSettingsContainer = document.querySelector('.settings-item-content.game-mode');
  if (!gameModeSettingsContainer) {
    return;
  }
  gameModeSettingsContainer.innerHTML = `
    <div class="settings-game-mode-item easy">Easy</div>
    <div class="settings-game-mode-item normal">Normal</div>
  `;
  // 初期選択
  const initialGameMode = settingsState.gameMode as 'normal' | 'easy';
  const initialGameModeItem = gameModeSettingsContainer.querySelector<HTMLElement>(`.settings-game-mode-item.${initialGameMode}`);
  if (initialGameModeItem) {
    initialGameModeItem.classList.add('selected');
  }
  // イベントリスナ
  const gameModeItems = gameModeSettingsContainer.querySelectorAll<HTMLElement>('.settings-game-mode-item');
  gameModeItems.forEach((item: HTMLElement) => {
    item.addEventListener('click', () => {
      audioPlayer.playSE('click');

      gameModeItems.forEach((item: HTMLElement) => {
        item.classList.remove('selected');
      });
      item.classList.add('selected');
      settingsState.gameMode = item.classList.contains('normal') ? 'normal' : 'easy';
      saveSettingsData();
    });
  });
}

function setUpMapDisplaySettings() {
  const mapDisplaySettingsContainer = document.querySelector('.settings-item-content.map-display');
  if (!mapDisplaySettingsContainer) {
    return;
  }
  const mapDisplayLabel = settingsState.mapDisplay ? 'checked' : '';
  mapDisplaySettingsContainer.innerHTML = `
    <div class="settings-map-display-label">Off</div>
    <label class="switch">
      <input type="checkbox" id="setting-map-display" ${mapDisplayLabel}>
      <span class="slider"></span>
    </label>
    <div class="settings-map-display-label">On</div>
  `;

  const mapDisplayCheckbox = mapDisplaySettingsContainer.querySelector<HTMLInputElement>('input[id="setting-map-display"]');
  if (mapDisplayCheckbox) {
    mapDisplayCheckbox.addEventListener('change', () => {
      audioPlayer.playSE('click');
      settingsState.mapDisplay = mapDisplayCheckbox.checked;
      saveSettingsData();
    });
  }
}
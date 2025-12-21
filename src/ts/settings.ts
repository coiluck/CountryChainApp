// settings.ts
export function setUpSettings() {
  const settingsContent = document.querySelectorAll('.settings-item-content');
  settingsContent.forEach(content => {
    content.innerHTML = ''
  });
  setUpColorSettings();
  setUpFontSettings();
  setUpLangSettings();
  setUpMapDisplaySettings();
}

import { settingsState, userState, saveSettingsData } from './modules/userState';

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
    reqLevel: 7
  },
  {
    name: 'midnight',
    textColor: '#fff3f1',
    bgColor: '#0a0f1e',
    bgBrightColor: '#152040',
    borderColor: '#888',
    metaColor: '#333',
    reqLevel: 12
  }
];


function setUpColorSettings() {
  const colorSettings = document.querySelector('.settings-item-content.color');
  if (!colorSettings) {
    return;
  }
  colorSettings.innerHTML = '';

  // ラベル
  const bgColorLabel = document.createElement('div');
  bgColorLabel.classList.add('settings-color-label');
  bgColorLabel.dataset.translation = 'settingsColorBgLabel';
  bgColorLabel.textContent = '背景の色';
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
        return;
      }
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
  mainColorLabel.textContent = 'メインの色';
  colorSettings.appendChild(mainColorLabel);
  // main
  const mainColorContainer = document.createElement('div');
  mainColorContainer.classList.add('settings-color-item-container');
  colorSettings.appendChild(mainColorContainer);
}

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
        if (target.disabled) return;
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
      settingsState.mapDisplay = mapDisplayCheckbox.checked;
      saveSettingsData();
    });
  }
}
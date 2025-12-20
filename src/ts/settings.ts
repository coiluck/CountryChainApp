// settings.ts
export function setUpSettings() {
  const settingsContent = document.querySelectorAll('.settings-item-content');
  settingsContent.forEach(content => {
    content.innerHTML = ''
  });
  setUpFontSettings();
  setUpLangSettings();
}

import { settingsState } from './modules/userState';

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
      const isLocked = font.reqLevel > settingsState.level;
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
        // 後で書く
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
    });
  });
}
import { applyStore, userState, saveUserData, saveSettingsData, settingsState } from "./modules/userState";
import { applyTranslationsToDocument } from "./modules/translation";
import { applyTheme } from "./settings";
import { renderStamina } from "./modules/stamina";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  if (userState.isFirstTime) {
    // 言語設定
    const systemLocale = navigator.language || navigator.languages[0] || 'en';
    const language = systemLocale.startsWith('ja') ? 'ja' : 'en';
    settingsState.lang = language;
    await saveSettingsData();

    // フラグを消す
    userState.isFirstTime = false;
    await saveUserData();
  }
  applyTheme();
  await applyTranslationsToDocument();
  renderStamina();
  preloadRewardAds();
  loadBanner();
});

import { loadBanner, showBanner, preloadRewardAds } from "./modules/ads";
import { bgmList } from "./settings";
import { audioPlayer } from "./modules/audio";
import { initEarthMap } from './top';

// これはロゴ表示後に呼び出す
export async function setUpMainContent() {
  await showBanner();
  audioPlayer.setBGMVolume(settingsState.bgmVolume);
  audioPlayer.setSEVolume(settingsState.seVolume);
  const bgm = bgmList.find(bgm => bgm.id === settingsState.bgmId);
  if (bgm) {
    audioPlayer.playBGM(bgm.file);
  }
  initEarthMap();
}
import { applyStore, userState, saveUserData, saveSettingsData, settingsState } from "./modules/userState";
import { applyTranslationsToDocument } from "./modules/translation";
import { applyTheme } from "./settings";

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
});

import { applyStore } from "./modules/userState";
import { applyTranslationsToDocument } from "./modules/translation";
import { applyTheme } from "./settings";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  applyTheme();
  await applyTranslationsToDocument();
});

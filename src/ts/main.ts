import { applyStore } from "./modules/userState";
import { applyTranslationsToDocument } from "./modules/translation";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  await applyTranslationsToDocument();
});

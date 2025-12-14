// translation.ts
type Lang = 'ja' | 'en';

function applyTranslationsToDocument(lang: Lang) {
  document.documentElement.lang = lang;
  // set
  const nodes = document.querySelectorAll('[data-translation]');
  nodes.forEach((el: Element) => {
    const translation = el.getAttribute('data-translation');
    if (translation) {
      el.textContent = translation;
    }
  });
}

let translationData: object | null = null;

async function loadTranslationData() {
  const response = await fetch('./src/json/translation.json');
  if (!translationData) {
    translationData = await response.json();
  }
  return translationData;
}
// logo.js
import { changeModal } from './modules/changeModal';

document.addEventListener('DOMContentLoaded', () => {
  changeModal('logo', null, 500);
  setTimeout(() => {
    const logoAnimationArray = ['bounce', 'scale', 'jump'];
    const logoAnimation = logoAnimationArray[Math.floor(Math.random() * logoAnimationArray.length)];

    const textTop = "KOKONE";
    const textBottom = "Project";
    const animationDelay = 0.07; // 秒

    const topElement = document.getElementById('logo-text-top');
    const bottomElement = document.getElementById('logo-text-bottom');

    // テキストを分割してアニメーションを適用
    const createAnimatedText = (text: string, delayStart: number = 0) => {
      return text.split('').map((char: string, index: number) => {
        const delay = (delayStart + index * animationDelay).toFixed(1);
        return `<span class="animate-${logoAnimation}" style="animation-delay: ${delay}s">${char}</span>`;
      }).join('');
    };

    // テキストをレンダリング
    if (topElement && bottomElement) {
      topElement.innerHTML = createAnimatedText(textTop, 0);
      bottomElement.innerHTML = createAnimatedText(textBottom, textTop.length * animationDelay + 0.15);
    }

    const totalAnimationTime = (textTop.length * animationDelay + 0.2) + (textBottom.length - 1) * animationDelay + 0.6;
    setTimeout(() => {
      changeModal('game', null, 500, true);
    }, totalAnimationTime * 1000 + 500); // 500msは待機時間
  }, 500);
});
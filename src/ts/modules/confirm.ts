// confirm.ts
import { staminaAds, reviveAds } from './ads';
import { recoverStaminaByAds } from './stamina';
import { audioPlayer } from './audio';
import { getTranslatedText } from './translation';

export function showConfirm(
  message: string,
  isNeedCancelButton: boolean = false,
  okEvent: 'stamina' | 'revive' | 'exit' = 'exit'
) {
  const alreadyConfirm = document.querySelector('.confirm-window');
  if (alreadyConfirm) {
    alreadyConfirm.remove();
  }

  const confirm = document.createElement('div');
  confirm.className = 'confirm-window';
  confirm.innerHTML = `
    <div class="confirm-window-message">${message}</div>
    <div class="confirm-window-buttons">
      ${isNeedCancelButton ? `<button class="confirm-window-button cancel-button">Cancel</button>` : ''}
      <button class="confirm-window-button ok-button">OK</button>
    </div>
  `;

  const okButton = confirm.querySelector('.confirm-window-button.ok-button');
  const cancelButton = confirm.querySelector('.confirm-window-button.cancel-button');

  if (okButton) {
    okButton.addEventListener('click', async () => {
      audioPlayer.playSE('click');
      switch (okEvent) {
        case 'stamina':
          try {
            // 広告を表示
            const rewarded = await staminaAds.show();
            closeConfirmWindow();
            if (rewarded) {
              // 報酬を獲得
              recoverStaminaByAds();
              const text = await getTranslatedText('confirmRecoveredStamina', []) || '';
              showConfirm(text, false, 'exit');
            } else {
              // 広告を最後まで見なかった、または表示に失敗
              const text = await getTranslatedText('confirmNotImplementedReward', []) || '';
              showConfirm(text, false, 'exit');
            }
          } catch (error) {
            console.error('広告表示エラー:', error);
            closeConfirmWindow();
            const text = await getTranslatedText('confirmFailedToShowAd', []) || '';
            showConfirm(text, false, 'exit');
          }
          break;

        case 'revive':
          try {
            // 広告を表示
            const rewarded = await reviveAds.show();
            closeConfirmWindow();
            if (rewarded) {
              // 報酬を獲得
              // 復活処理は後で書く
              const text = await getTranslatedText('confirmResurrect', []) || '';
              showConfirm(text, false, 'exit');
            } else {
              // 広告を最後まで見なかった、または表示に失敗
              const text = await getTranslatedText('confirmNotImplementedReward', []) || '';
              showConfirm(text, false, 'exit');
            }
          } catch (error) {
            console.error('広告表示エラー:', error);
            closeConfirmWindow();
            const text = await getTranslatedText('confirmFailedToShowAd', []) || '';
            showConfirm(text, false, 'exit');
          }
          break;

        case 'exit':
          closeConfirmWindow();
          break;
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      audioPlayer.playSE('click');
      closeConfirmWindow();
    });
  }

  const closeConfirmWindow = () => {
    confirm.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(confirm);
    }, 500);
  };

  document.body.appendChild(confirm);
}
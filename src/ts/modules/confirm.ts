// confirm.ts
import { staminaAds, reviveAds } from './ads';
import { recoverStaminaByAds } from './stamina';

export function showConfirm(message: string, isNeedCancelButton: boolean = false, okEvent: 'stamina' | 'revive' | 'exit' = 'exit') {
  const alreadyConfirm = document.querySelector('.confirm-window');
  if (alreadyConfirm) {
    // alreadyConfirm.remove();
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
      switch (okEvent) {
        case 'stamina':
          try {
            // 広告を表示
            const rewarded = await staminaAds.show();
            closeConfirmWindow();
            if (rewarded) {
              // 報酬を獲得
              recoverStaminaByAds();
              showConfirm('スタミナが2回復しました', false, 'exit');
            } else {
              // 広告を最後まで見なかった、または表示に失敗
              showConfirm('広告が中断されました', false, 'exit');
            }
          } catch (error) {
            console.error('広告表示エラー:', error);
            showConfirm('広告の表示に失敗しました', false, 'exit');
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
              showConfirm('復活！', false, 'exit');
            } else {
              // 広告を最後まで見なかった、または表示に失敗
              showConfirm('広告が中断されました', false, 'exit');
            }
          } catch (error) {
            console.error('広告表示エラー:', error);
            showConfirm('広告の表示に失敗しました', false, 'exit');
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
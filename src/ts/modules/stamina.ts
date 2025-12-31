// stamina.ts
import { userState, saveUserData } from './userState';

const MAX_STAMINA = 3;
const STAMINA_RECOVERY_MS = 20 * 60 * 1000; // 20分ごとに回復


function updateStaminaState(): void {
  const now = Date.now();
  const elapsed = Math.max(0, now - userState.lastStaminaUpdate);

  // 経過時間分の回復量を計算
  const recovered = Math.floor(elapsed / STAMINA_RECOVERY_MS);
  const newStamina = Math.min(userState.stamina + recovered, MAX_STAMINA);

  // userStateを更新
  userState.stamina = newStamina;

  if (newStamina >= MAX_STAMINA) {
    userState.lastStaminaUpdate = now;
  } else {
    // 満タンでない -> 端数時間を保持
    const remainder = elapsed % STAMINA_RECOVERY_MS;
    userState.lastStaminaUpdate = now - remainder;
  }
}

export function getStaminaInfo() {
  updateStaminaState();

  const now = Date.now();
  const isFull = userState.stamina >= MAX_STAMINA;

  // 次の回復までの時間を計算
  let nextRecoverIn = 0;
  if (!isFull) {
    const elapsed = now - userState.lastStaminaUpdate;
    nextRecoverIn = STAMINA_RECOVERY_MS - elapsed;
  }

  return {
    current: userState.stamina,
    max: MAX_STAMINA,
    nextRecoverIn: nextRecoverIn,
    isFull: isFull
  };
}

let staminaTimerInterval: number | null = null;

export function renderStamina() {
  const container = document.getElementById('top-stamina-container');
  if (!container) return;
  container.innerHTML = '';
  if (staminaTimerInterval) {
    window.clearInterval(staminaTimerInterval);
    staminaTimerInterval = null;
  }

  // デバッグ用、後で消す
  // 後で書く
  if (userState.stamina === 3) {
    consumeStamina();
  } else if (userState.stamina === 0) {
    recoverStaminaByAds();
  }
  console.log(userState.stamina);

  const iconContainer = document.createElement('div');
  iconContainer.className = 'top-stamina-icon-container';
  container.appendChild(iconContainer);
  const textContainer = document.createElement('div');
  textContainer.className = 'top-stamina-text-container';
  container.appendChild(textContainer);

  const info = getStaminaInfo();

  // icon
  for (let i = 0; i < info.max; i++) {
    const icon = document.createElement('div');
    if (i < info.current) {
      icon.className = 'top-stamina-icon-fill top-stamina-icon';
    } else {
      icon.className = 'top-stamina-icon-line top-stamina-icon';
    }
    iconContainer.appendChild(icon);
  }

  // タイマー
  let lastStamina = info.current;

  const updateTimerText = () => {
    const currentInfo = getStaminaInfo();

    // 回復後に再描画
    if (currentInfo.current !== lastStamina) {
      renderStamina();
      return;
    }

    if (currentInfo.isFull) {
      textContainer.innerText = 'MAX';
    } else {
      const totalSeconds = Math.floor(currentInfo.nextRecoverIn / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      // ゼロ埋め
      textContainer.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  };

  updateTimerText();
  staminaTimerInterval = window.setInterval(updateTimerText, 1000);
}

export async function consumeStamina(): Promise<boolean> {
  updateStaminaState();

  if (userState.stamina <= 0) {
    // 広告を見て回復する
    // 後で書く
    return false;
  }
  // スタミナを1消費
  userState.stamina -= 1;

  await saveUserData();
  renderStamina();
  return true;
}

// 広告で回復
export async function recoverStaminaByAds(): Promise<void> {
  updateStaminaState();

  const ADS_RECOVER_AMOUNT = 2;
  userState.stamina = Math.min(userState.stamina + ADS_RECOVER_AMOUNT, MAX_STAMINA);

  if (userState.stamina >= MAX_STAMINA) {
    userState.lastStaminaUpdate = Date.now();
  }
  await saveUserData();
  renderStamina();
}
// userState.ts
interface SettingsState {
  level: number;
  font: string;
  lang: string;
  gameMode: string;
  difficulty: string;
  onlyUnitedNations: boolean;
}

const initialState: SettingsState = {
  level: 10,
  font: "'rounded-mplus-1c-regular', sans-serif",
  lang: 'en',
  gameMode: 'worldMap',
  difficulty: 'easy',
  onlyUnitedNations: false,
};

export const settingsState = structuredClone(initialState); // 初期化

export function setSettingsState(newState: Partial<SettingsState>) {
  Object.assign(settingsState, newState);
}
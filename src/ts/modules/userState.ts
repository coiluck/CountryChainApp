// userState.ts
interface SettingsState {
  lang: string;
  gameMode: string;
  difficulty: string;
  onlyUnitedNations: boolean;
}

const initialState: SettingsState = {
  lang: 'en',
  gameMode: 'worldMap',
  difficulty: 'easy',
  onlyUnitedNations: false,
};

export const settingsState = structuredClone(initialState); // 初期化

export function setSettingsState(newState: Partial<SettingsState>) {
  Object.assign(settingsState, newState);
}
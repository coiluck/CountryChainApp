// userState.ts
interface SettingsState {
  font: string;
  lang: string;
  seVolume: number;
  gameMode: string;
  mapDisplay: boolean;
}

interface userData {
  level: number;
  exp: number;
}

const initialState: SettingsState = {
  font: "'rounded-mplus-1c-regular', sans-serif",
  lang: 'en',
  seVolume: 0.5,
  gameMode: 'normal',
  mapDisplay: true,
};

const initialUserData: userData = {
  level: 1,
  exp: 0,
};

export const settingsState = structuredClone(initialState);
export const userData = structuredClone(initialUserData);

export function setSettingsState(newState: Partial<SettingsState>) {
  Object.assign(settingsState, newState);
}
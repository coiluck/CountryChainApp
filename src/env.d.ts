// src/env.d.ts
// ts用の型定義らしい
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_APP_ID: string;
  readonly VITE_ADMOB_BANNER_ID: string;
  readonly VITE_ADMOB_REWARD_1_ID: string;
  readonly VITE_ADMOB_REWARD_2_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
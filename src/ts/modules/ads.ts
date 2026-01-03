// ads.ts
import { BannerAd, RewardedAd } from "tauri-plugin-admob-api";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

const AD_IDS = {
  banner: import.meta.env.VITE_AD_UNIT_BANNER,
  reward1: import.meta.env.VITE_AD_UNIT_STAMINA,
  reward2: import.meta.env.VITE_AD_UNIT_REVIVE,
} as const;

const AD_TIMEOUT = 30000;

let bannerInstance: BannerAd | null = null;

export const showBanner = async () => {
  try {
    if (bannerInstance) {
      await bannerInstance.show();
      return;
    }
    bannerInstance = new BannerAd({
      adUnitId: AD_IDS.banner,
      position: "top",
    });
    await bannerInstance.load();
    await bannerInstance.show();

    window.dispatchEvent(new Event('resize'));
  } catch (error) {
    console.error("Failed to show banner ad:", error);
    bannerInstance = null;
    throw error;
  }
};

interface RewardEvent {
  adId: number;
  reward?: {
    type: string;
    amount: number;
  };
}

class RewardAds {
  private ad: RewardedAd | null = null;
  private isLoading = false;
  private isShowing = false;
  private adUnitId: string;
  private loadPromise: Promise<void> | null = null;

  constructor(adUnitId: string) {
    this.adUnitId = adUnitId;
    this.createAdInstance();
  }

  private createAdInstance() {
    this.ad = new RewardedAd({ adUnitId: this.adUnitId });
  }

  private async setupEventListeners(adId: number): Promise<{
    waitForResult: () => Promise<boolean>;
    cleanup: () => void;
  }> {
    const listeners: UnlistenFn[] = [];
    let rewardEarned = false;
    let resolvePromise: ((value: boolean) => void) | null = null;

    const resultPromise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });

    // 報酬獲得イベント
    const unlistenReward = await listen<RewardEvent>(
      "admob://rewarded.reward",
      (event) => {
        if (event.payload.adId === adId) {
          console.log("Reward earned:", event.payload.reward);
          rewardEarned = true;
        }
      }
    );
    listeners.push(unlistenReward);

    // 広告が閉じられた
    const unlistenDismiss = await listen<{ adId: number }>(
      "admob://rewarded.dismiss",
      (event) => {
        if (event.payload.adId === adId && resolvePromise) {
          resolvePromise(rewardEarned);
        }
      }
    );
    listeners.push(unlistenDismiss);

    // 表示失敗
    const unlistenShowFail = await listen<{ adId: number; error: string }>(
      "admob://rewarded.showFail",
      (event) => {
        if (event.payload.adId === adId && resolvePromise) {
          console.error("Ad failed to show:", event.payload.error);
          resolvePromise(false);
        }
      }
    );
    listeners.push(unlistenShowFail);

    const cleanup = () => {
      listeners.forEach((unlisten) => unlisten());
    };

    return {
      waitForResult: () => resultPromise,
      cleanup,
    };
  }

  async load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (!this.ad) {
      return;
    }

    // 既にロード済みかチェック
    const loaded = await this.ad.isLoaded();
    if (loaded) {
      return;
    }

    this.isLoading = true;

    this.loadPromise = (async () => {
      try {
        await Promise.race([
          this.ad!.load(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Ad load timeout")), AD_TIMEOUT)
          ),
        ]);
      } catch (error) {
        console.error(`Failed to load reward ad (${this.adUnitId}):`, error);
        this.ad = null;
        this.createAdInstance();
        throw error;
      } finally {
        this.isLoading = false;
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  async show(): Promise<boolean> {
    if (this.isShowing) {
      console.warn("Ad is already showing");
      return false;
    }

    if (!this.ad) {
      this.createAdInstance();
    }

    try {
      // ロード済みかチェック
      const loaded = await this.ad!.isLoaded();
      if (!loaded) {
        await this.load();
      }

      // ロード後に再度チェック
      const isNowLoaded = await this.ad!.isLoaded();
      if (!isNowLoaded) {
        return false;
      }

      this.isShowing = true;

      // イベントリスナーをセットアップ
      const { waitForResult, cleanup } = await this.setupEventListeners(
        this.ad!.id
      );

      try {
        // 広告を表示
        await this.ad!.show();

        // 結果を待つ（タイムアウト付き）
        const result = await Promise.race([
          waitForResult(),
          new Promise<boolean>((resolve) =>
            setTimeout(() => {
              console.warn("Ad result timeout");
              resolve(false);
            }, 60000) // 60秒でタイムアウト
          ),
        ]);

        return result;
      } catch (error) {
        console.error("Error during ad.show():", error);
        return false;
      } finally {
        cleanup();
        this.isShowing = false;

        if (this.ad) {
          this.ad.destroy();
          // これはnode_modules/tauri-plugin-admob-api/には存在しないメソッド
          // 勝手に追加しただけだからnpm installやnpm updateを行うと消される、注意！！！！
          // これはnode_modules/tauri-plugin-admob-api内のindex.cjsとcommon.d.tsを更新前に保存しておいて
        }

        // 次の広告をプリロード
        this.ad = null;
        this.createAdInstance();
        this.preload();
      }
    } catch (error) {
      console.error(`Failed to show reward ad (${this.adUnitId}):`, error);
      this.isShowing = false;
      return false;
    }
  }

  preload(): void {
    if (this.isLoading || this.isShowing) {
      return;
    }

    setTimeout(() => {
      this.load().catch(console.error);
    }, 500);
  }

  getStatus() {
    return {
      isLoading: this.isLoading,
      isShowing: this.isShowing,
      hasAd: this.ad !== null,
      adId: this.ad?.id,
    };
  }
}

export const staminaAds = new RewardAds(AD_IDS.reward1);
export const reviveAds = new RewardAds(AD_IDS.reward2);

export const preloadRewardAds = () => {
  staminaAds.preload();
  reviveAds.preload();
};
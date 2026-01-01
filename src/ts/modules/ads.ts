// ads.ts
import { BannerAd, RewardedAd } from "tauri-plugin-admob-api";

export const showBanner = async () => {
  const banner = new BannerAd({
    adUnitId: "ca-app-pub-3940256099942544/9214589741",
    position: "top",
  });
  await banner.load();
  await banner.show();
};
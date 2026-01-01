// audio.ts
class AudioPlayer {
  private bgmAudio: HTMLAudioElement | null = null;
  private seAudio: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.5;
  private seVolume: number = 0.5;

  setSEVolume(volume: number) {
    this.seVolume = volume;
    if (this.seAudio) {
      this.seAudio.volume = volume;
    }
  }

  setBGMVolume(volume: number) {
    this.bgmVolume = volume;
    if (this.bgmAudio) {
      this.bgmAudio.volume = volume;
    }
  }

  playSE(seFileName: string) {
    const wavList = ['lose', 'win', 'click'];
    const extension = wavList.includes(seFileName) ? 'wav' : 'mp3';

    const path = `/src/assets/se/${seFileName}.${extension}`;

    const audio = new Audio(path);
    audio.volume = this.seVolume;

    audio.play().catch((e) => {
      console.error(`SE play error: ${seFileName}`, e);
    });

    this.seAudio = audio;
  }

  playBGM(bgmFileName: string) {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    const wavList = ['jump'];
    const extension = wavList.includes(bgmFileName) ? 'wav' : 'mp3';

    const path = `/src/assets/bgm/${bgmFileName}.${extension}`;

    const audio = new Audio(path);
    audio.volume = this.bgmVolume;
    audio.loop = true;

    audio.play().catch((e) => {
      console.error(`BGM play error: ${bgmFileName}`, e);
    });

    this.bgmAudio = audio;
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
  }
}

const audioPlayer = new AudioPlayer();

export { audioPlayer };
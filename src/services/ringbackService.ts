import {Platform} from 'react-native';
import Sound from 'react-native-sound';

// Short progress beep for the caller (not a ringtone).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const beepAsset = require('../assets/sounds/call_beep.mp3');

/**
 * Soft repeating beep for outgoing calls (caller only), until answer / end.
 */
class RingbackService {
  private sound: Sound | null = null;
  private starting = false;
  private shouldPlay = false;
  private playGeneration = 0;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  start() {
    if (this.shouldPlay && (this.sound || this.starting)) {
      return;
    }

    this.stop(false);
    this.shouldPlay = true;
    this.starting = true;
    const gen = ++this.playGeneration;

    try {
      // Android: Playback so MediaPlayer can play while Agora holds the mic.
      // iOS: Ambient mixes without taking over the call session.
      Sound.setCategory(Platform.OS === 'android' ? 'Playback' : 'Ambient', true);
    } catch {
      /* ignore */
    }

    const onReady = (sound: Sound, error?: any) => {
      if (error || !sound) {
        this.starting = false;
        if (gen === this.playGeneration) {
          this.sound = null;
        }
        console.warn('[Ringback] load failed', error);
        return;
      }
      if (!this.shouldPlay || gen !== this.playGeneration) {
        try {
          sound.release();
        } catch {
          /* ignore */
        }
        return;
      }

      this.sound = sound;
      this.starting = false;
      try {
        sound.setVolume(Platform.OS === 'android' ? 0.7 : 0.55);
        sound.setNumberOfLoops(-1);
      } catch {
        /* ignore */
      }
      this.playLooping(sound, gen);
    };

    // Android: load res/raw first (most reliable). Metro asset as fallback.
    if (Platform.OS === 'android') {
      const raw = new Sound('call_beep', Sound.MAIN_BUNDLE, err => {
        if (!err) {
          onReady(raw);
          return;
        }
        console.warn('[Ringback] android raw failed, trying metro asset', err);
        const bundled = new Sound(beepAsset, err2 => onReady(bundled, err2));
      });
      return;
    }

    const bundled = new Sound(beepAsset, err => {
      if (!err) {
        onReady(bundled);
        return;
      }
      console.warn('[Ringback] asset load failed, trying main bundle', err);
      const main = new Sound('call_beep.mp3', Sound.MAIN_BUNDLE, err2 =>
        onReady(main, err2),
      );
    });
  }

  private clearRestartTimer() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private playLooping(sound: Sound, gen: number) {
    if (!this.shouldPlay || gen !== this.playGeneration) {
      return;
    }

    try {
      sound.play(success => {
        if (!this.shouldPlay || gen !== this.playGeneration) {
          return;
        }
        this.clearRestartTimer();
        this.restartTimer = setTimeout(() => {
          if (!this.shouldPlay || gen !== this.playGeneration || !this.sound) {
            return;
          }
          try {
            this.sound.setCurrentTime(0);
          } catch {
            /* ignore */
          }
          this.playLooping(this.sound, gen);
        }, success ? 30 : 250);
      });
    } catch (e) {
      console.warn('[Ringback] play error', e);
    }
  }

  private releaseCurrent() {
    this.clearRestartTimer();
    const current = this.sound;
    this.sound = null;
    if (!current) {
      return;
    }
    try {
      current.stop(() => {
        try {
          current.release();
        } catch {
          /* ignore */
        }
      });
    } catch {
      try {
        current.release();
      } catch {
        /* ignore */
      }
    }
  }

  stop(resetFlags = true) {
    if (resetFlags) {
      this.shouldPlay = false;
      this.starting = false;
      this.playGeneration += 1;
    }
    this.releaseCurrent();
  }
}

export const ringbackService = new RingbackService();
export default ringbackService;

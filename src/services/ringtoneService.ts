import {Platform} from 'react-native';
import Sound from 'react-native-sound';

// Classic telephone ringtone (not synthetic beeps).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ringtoneAsset = require('../assets/sounds/incoming_call.mp3');

/**
 * Loops a real telephone ringtone for incoming calls.
 */
class RingtoneService {
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
      Sound.setCategory('Playback', true);
    } catch {
      /* ignore */
    }

    const onReady = (sound: Sound, error?: any) => {
      if (error || !sound) {
        this.starting = false;
        if (gen === this.playGeneration) {
          this.sound = null;
        }
        console.warn('[Ringtone] load failed', error);
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
        sound.setVolume(1);
        sound.setNumberOfLoops(-1);
      } catch {
        /* ignore */
      }
      this.playLooping(sound, gen);
    };

    // Prefer Metro asset first so the ringtone updates with JS bundle.
    const bundled = new Sound(ringtoneAsset, err => {
      if (!err) {
        onReady(bundled);
        return;
      }
      console.warn('[Ringtone] asset load failed, trying native bundle', err);
      if (Platform.OS === 'android') {
        const raw = new Sound('incoming_call', Sound.MAIN_BUNDLE, err2 =>
          onReady(raw, err2),
        );
      } else {
        const main = new Sound('incoming_call.mp3', Sound.MAIN_BUNDLE, err2 =>
          onReady(main, err2),
        );
      }
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
        // Native infinite loop may never hit this. If it does, restart.
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
      console.warn('[Ringtone] play error', e);
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

export const ringtoneService = new RingtoneService();
export default ringtoneService;

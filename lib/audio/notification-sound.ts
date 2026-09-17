/**
 * notification-sound.ts
 * Bộ tổng hợp âm thanh chuông báo Web Audio API thuần (Không phụ thuộc file mp3/wav ngoài).
 * Âm thanh "Ding-dong-chime" êm dịu, du dương phong cách lễ tân boutique, không gây giật mình.
 */

class NotificationSoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cal_admin_sound_enabled");
      this.soundEnabled = stored === null ? true : stored === "true";

      // Lắng nghe tương tác đầu tiên của người dùng để kích hoạt AudioContext (Chrome Autoplay Policy)
      const unlockAudio = () => {
        this.initContext();
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume().catch(() => {});
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };
      window.addEventListener("click", unlockAudio, { once: true });
      window.addEventListener("keydown", unlockAudio, { once: true });
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!this.audioCtx || this.audioCtx.state === "closed") {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("cal_admin_sound_enabled", String(enabled));
    }
  }

  public toggle(): boolean {
    const next = !this.soundEnabled;
    this.setEnabled(next);
    if (next) {
      this.playDing();
    }
    return next;
  }

  /**
   * Phát tiếng chuông "Ding" ngân vang du dương (Hợp âm Trưởng: C6 -> E6 -> G6 -> C7)
   */
  public playDing(): boolean {
    if (!this.soundEnabled) return false;

    const ctx = this.initContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;

      // Nốt 1: C6 (1046.5 Hz) - Chạm nhẹ ban đầu
      this.playHarmonicTone(ctx, 1046.5, now, 0.5, 0.15);

      // Nốt 2: E6 (1318.5 Hz) - Âm vang ngọt ngào
      this.playHarmonicTone(ctx, 1318.5, now + 0.08, 0.65, 0.22);

      // Nốt 3: G6 (1567.98 Hz) - Âm cao sáng trong
      this.playHarmonicTone(ctx, 1567.98, now + 0.16, 0.85, 0.25);

      // Nốt 4: C7 (2093.0 Hz) - Âm đuôi ngân lấp lánh (Shimmer)
      this.playHarmonicTone(ctx, 2093.0, now + 0.24, 1.1, 0.12);

      return true;
    } catch (err) {
      console.warn("[AUDIO_SYNTH_WARN]", err);
      return false;
    }
  }

  private playHarmonicTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    peakGain: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sóng sin thuần mang lại âm thanh trong trẻo, tròn trịa
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, startTime);

    // Envelope âm lượng: tăng nhanh trong 15ms rồi giảm dần mượt mà theo hàm mũ (exponential decay)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const soundSynthesizer = new NotificationSoundSynthesizer();

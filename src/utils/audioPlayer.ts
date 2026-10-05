// Audio Player Utility for Mueen Assistant
// Unified Human Egyptian Audio: Google Gemini 10-quota + Microsoft Edge Egyptian Voice (Shakir & Salma)

export type VoiceEngineType = 'gemini_human' | 'edge_tts' | 'idle';

export interface VoiceQuotaInfo {
  totalLimit: number;
  used: number;
  remaining: number;
  resetDate: string;
}

class MueenAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: string | null = null;
  private currentEngine: VoiceEngineType = 'idle';
  private quotaInfo: VoiceQuotaInfo = { totalLimit: 10, used: 0, remaining: 10, resetDate: '' };
  private onStateChangeCallbacks: Set<
    (isPlaying: boolean, activeId: string | null, engine: VoiceEngineType) => void
  > = new Set();
  private onQuotaChangeCallbacks: Set<(quota: VoiceQuotaInfo) => void> = new Set();

  constructor() {
    this.refreshQuota();
  }

  public async refreshQuota(): Promise<VoiceQuotaInfo> {
    if (typeof window === 'undefined') return this.quotaInfo;
    try {
      const res = await fetch('/api/tts/quota');
      if (res.ok) {
        const data = await res.json();
        this.quotaInfo = data;
        this.onQuotaChangeCallbacks.forEach((cb) => cb(this.quotaInfo));
      }
    } catch {}
    return this.quotaInfo;
  }

  public getQuota(): VoiceQuotaInfo {
    return { ...this.quotaInfo };
  }

  public subscribe(
    cb: (isPlaying: boolean, activeId: string | null, engine: VoiceEngineType) => void
  ) {
    this.onStateChangeCallbacks.add(cb);
    return () => {
      this.onStateChangeCallbacks.delete(cb);
    };
  }

  public subscribeQuota(cb: (quota: VoiceQuotaInfo) => void) {
    this.onQuotaChangeCallbacks.add(cb);
    cb(this.quotaInfo);
    return () => {
      this.onQuotaChangeCallbacks.delete(cb);
    };
  }

  private notify(isPlaying: boolean, activeId: string | null, engine: VoiceEngineType) {
    this.currentPlayingId = isPlaying ? activeId : null;
    this.currentEngine = isPlaying ? engine : 'idle';
    this.onStateChangeCallbacks.forEach((cb) =>
      cb(isPlaying, this.currentPlayingId, this.currentEngine)
    );
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.notify(false, null, 'idle');
  }

  public async speak(
    text: string,
    messageId: string = 'global'
  ): Promise<void> {
    if (!text || typeof window === 'undefined') return;

    this.stop();

    // Sanitize text: keep concise for spoken clarity
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'تم استعراض الكود في الشات.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~]/g, '')
      .replace(/https?:\/\/\S+/g, 'الرابط المرفق')
      .trim();

    if (!cleanText) {
      this.notify(false, null, 'idle');
      return;
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText.slice(0, 450),
          voice: 'Puck',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.remainingRequests !== undefined) {
          this.quotaInfo = {
            ...this.quotaInfo,
            remaining: data.remainingRequests,
            used: Math.max(0, 10 - data.remainingRequests),
          };
          this.onQuotaChangeCallbacks.forEach((cb) => cb(this.quotaInfo));
        }

        if (data.audioData) {
          const mimeType = data.mimeType || (data.provider === 'edge_tts' ? 'audio/mp3' : 'audio/wav');
          const audioBlob = this.base64ToBlob(data.audioData, mimeType);
          if (audioBlob instanceof Blob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;

            audio.onended = () => {
              this.notify(false, null, 'idle');
              URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
              this.notify(false, null, 'idle');
            };

            const engineType: VoiceEngineType = data.provider === 'gemini' ? 'gemini_human' : 'edge_tts';
            this.notify(true, messageId, engineType);
            await audio.play();
            return;
          }
        }
      }
    } catch (err) {
      console.warn('TTS playback notice:', err);
    }

    this.notify(false, null, 'idle');
  }

  private base64ToBlob(base64: string, mimeType: string): Blob | null {
    try {
      if (!base64 || typeof base64 !== 'string') return null;
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const byteCharacters = atob(cleanBase64.trim());
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (e) {
      console.warn('base64ToBlob conversion notice:', e);
      return null;
    }
  }

  public isCurrentlyPlaying(messageId?: string): boolean {
    if (!messageId) return this.currentPlayingId !== null;
    return this.currentPlayingId === messageId;
  }
}

export const mueenAudio = new MueenAudioPlayer();

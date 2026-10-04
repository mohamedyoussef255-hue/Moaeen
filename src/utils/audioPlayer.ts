// Audio Player Utility for Mueen Assistant
// Intelligent dual-engine: Gemini Human TTS (/api/tts) + High-Fidelity Natural Speech Synthesis

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export type VoiceEngineType = 'gemini_human' | 'browser_natural' | 'idle';

class MueenAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: string | null = null;
  private currentEngine: VoiceEngineType = 'idle';
  private onStateChangeCallbacks: Set<
    (isPlaying: boolean, activeId: string | null, engine: VoiceEngineType) => void
  > = new Set();

  public subscribe(
    cb: (isPlaying: boolean, activeId: string | null, engine: VoiceEngineType) => void
  ) {
    this.onStateChangeCallbacks.add(cb);
    return () => {
      this.onStateChangeCallbacks.delete(cb);
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify(false, null, 'idle');
  }

  public async speak(text: string, messageId: string = 'global'): Promise<void> {
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
      // 1. Try Gemini 3.8 Flash Lite TTS (Realistic Human Voice)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText.slice(0, 450), // keep focused for natural delivery
          voice: 'Puck',
        }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.audioData && !data.fallback) {
          const audioBlob = this.base64ToBlob(data.audioData, 'audio/wav');
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          audio.onended = () => {
            this.notify(false, null, 'idle');
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            this.fallbackWebSpeech(cleanText, messageId);
          };

          this.notify(true, messageId, 'gemini_human');
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Gemini TTS provider note, falling back to natural browser speech:', err);
    }

    // 2. High-Fidelity Natural Browser Speech
    this.fallbackWebSpeech(cleanText, messageId);
  }

  private fallbackWebSpeech(text: string, messageId: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notify(false, null, 'idle');
      return;
    }

    window.speechSynthesis.cancel();

    // Refresh voices if empty
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }

    // Find the highest quality human-sounding Arabic voice
    const arabicVoices = cachedVoices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('ar') ||
        v.lang.toLowerCase().includes('arabic') ||
        v.name.toLowerCase().includes('arabic')
    );

    // Prioritize Online / Natural / Neural / Google voices over legacy monotone synthesizers
    const naturalVoice =
      arabicVoices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Online') ||
          v.name.includes('Neural') ||
          v.name.includes('Google') ||
          v.name.includes('Shakir') ||
          v.name.includes('Salma') ||
          v.name.includes('Maged') ||
          v.name.includes('Tarik')
      ) ||
      arabicVoices.find((v) => v.lang === 'ar-EG') ||
      arabicVoices.find((v) => v.lang === 'ar-SA') ||
      arabicVoices[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = naturalVoice ? naturalVoice.lang : 'ar-EG';

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Tune rate and pitch to sound human, relaxed, and natural (avoid robotic high-pitch/monotone)
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.notify(false, null, 'idle');
    };

    utterance.onerror = () => {
      this.notify(false, null, 'idle');
    };

    this.notify(true, messageId, 'browser_natural');
    window.speechSynthesis.speak(utterance);
  }

  private base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  public isCurrentlyPlaying(messageId?: string): boolean {
    if (!messageId) return this.currentPlayingId !== null;
    return this.currentPlayingId === messageId;
  }

  public getAvailableArabicVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (cachedVoices.length === 0) cachedVoices = window.speechSynthesis.getVoices();
    return cachedVoices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('ar') ||
        v.lang.toLowerCase().includes('arabic') ||
        v.name.toLowerCase().includes('arabic')
    );
  }
}

export const mueenAudio = new MueenAudioPlayer();

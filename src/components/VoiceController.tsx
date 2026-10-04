import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, Loader2, AlertCircle } from 'lucide-react';

interface VoiceControllerProps {
  onSpeechInput: (text: string) => void;
  isGenerating: boolean;
  voiceMode: boolean;
  lastAssistantText?: string;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  onSpeechInput,
  isGenerating,
  voiceMode,
  lastAssistantText,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const speechCapturedRef = useRef(false);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ar-EG'; // Egyptian Arabic default

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            speechCapturedRef.current = true;
            stopRecording(false);
            onSpeechInput(transcript.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition notice:', e?.error);
          // If speech recognition had an error, MediaRecorder fallback will handle it
        };

        recognition.onend = () => {
          if (!speechCapturedRef.current && isListening) {
            // MediaRecorder will finalize on stop
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition init err:', err);
      }
    }

    return () => {
      cleanupStreams();
    };
  }, [onSpeechInput, isListening]);

  const cleanupStreams = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    speechCapturedRef.current = false;
    audioChunksRef.current = [];
    stopPlayback();

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          return;
        } catch (e) {
          console.warn('Recognition start fallback failed:', e);
        }
      }
      setErrorMessage('المايكروفون غير متاح في هذا الإطار، يمكنك كتابة رسالتك.');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      // 1. Request microphone access explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Start MediaRecorder as reliable capture
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
          else mimeType = '';
        }
      }

      if (typeof MediaRecorder !== 'undefined') {
        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (!speechCapturedRef.current && audioChunksRef.current.length > 0) {
            await transcribeRecordedAudio(recorder.mimeType || 'audio/webm');
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
      }

      // 3. Try Web Speech API simultaneously for instant recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition notice:', e);
        }
      }

      // 4. Update UI & Timer
      setIsListening(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 20) {
            stopRecording(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission status:', err?.name || err);
      // Attempt alternate SpeechRecognition if getUserMedia was denied by iframe
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          return;
        } catch (e) {
          // ignore
        }
      }

      setIsListening(false);
      if (
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        String(err).includes('not allowed')
      ) {
        setErrorMessage('يرجى السماح بالمايكروفون من إعدادات المتصفح (أيقونة القفل 🔒)، أو كتابة استفسارك.');
      } else {
        setErrorMessage('تعذر تشغيل المايكروفون في المتصفح حالياً، يمكنك الكتابة في الشات.');
      }
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const stopRecording = (cancel = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (cancel) {
          speechCapturedRef.current = true; // prevent transcription
        }
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  };

  const transcribeRecordedAudio = async (mimeType: string) => {
    if (audioChunksRef.current.length === 0) return;

    setIsTranscribing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          if (!base64Data) {
            setIsTranscribing(false);
            return;
          }

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Data,
              mimeType: audioBlob.type || 'audio/webm',
            }),
          });

          const data = await response.json();
          if (data.transcript && data.transcript.trim()) {
            onSpeechInput(data.transcript.trim());
          } else {
            setErrorMessage('لم يتم التقاط صوت واضح، يرجى المحاولة مرة أخرى.');
            setTimeout(() => setErrorMessage(null), 4000);
          }
        } catch (e) {
          console.warn('Transcription error:', e);
          setErrorMessage('تعذر تحويل الصوت، يرجى إعادة المحاولة.');
          setTimeout(() => setErrorMessage(null), 4000);
        } finally {
          setIsTranscribing(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (e) {
      console.warn('Blob reading error:', e);
      setIsTranscribing(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playGeminiTTS = async (text: string) => {
    if (!text) return;
    stopPlayback();
    setIsAudioLoading(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Puck' }),
      });

      const data = await res.json();
      if (data.audioData) {
        const audioBlob = base64ToBlob(data.audioData, 'audio/wav');
        const audioUrl = URL.createObjectURL(audioBlob);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
        };
        audioRef.current.onerror = () => {
          setIsPlayingAudio(false);
          fallbackWebSpeech(text);
        };

        setIsPlayingAudio(true);
        await audioRef.current.play();
      } else {
        fallbackWebSpeech(text);
      }
    } catch (err) {
      console.warn('Gemini TTS failed, falling back to Web Speech:', err);
      fallbackWebSpeech(text);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-EG';
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Speech-to-Text Button */}
      <button
        type="button"
        onClick={() => {
          if (isListening) {
            stopRecording(false);
          } else {
            startRecording();
          }
        }}
        disabled={isGenerating || isTranscribing}
        className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 relative ${
          isListening
            ? 'bg-red-500/25 border-red-500 text-red-300 animate-pulse shadow-lg shadow-red-500/30 ring-2 ring-red-500/40'
            : isTranscribing
            ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-sm'
        }`}
        title={
          isListening
            ? `اضغط لإيقاف التسجيل الصوتي (${recordingSeconds} ثانية)`
            : isTranscribing
            ? 'جاري تحويل صوتك إلى نص عبر Gemini...'
            : 'اضغط للتحدث بالمايكروفون وسيقوم مُعِين بالرد عليك'
        }
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-[11px] font-bold text-amber-300 hidden md:inline">جاري المعالجة...</span>
          </>
        ) : isListening ? (
          <>
            <MicOff className="w-4 h-4 text-red-400 animate-ping" />
            <span className="text-[11px] font-black text-red-400">إيقاف ({recordingSeconds}s)</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-300 hidden sm:inline">تحدث بالمايك</span>
          </>
        )}
      </button>

      {/* Replay or Play Last Assistant Message */}
      {lastAssistantText && (
        <button
          type="button"
          onClick={() => {
            if (isPlayingAudio) {
              stopPlayback();
            } else {
              playGeminiTTS(lastAssistantText);
            }
          }}
          disabled={isAudioLoading}
          className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
            isPlayingAudio
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 hover:bg-slate-800'
          }`}
          title={isPlayingAudio ? 'إيقاف الصوت' : 'استماع صوتي للرد الأخير (Gemini Voice)'}
        >
          {isAudioLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          ) : isPlayingAudio ? (
            <Square className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Voice Status Waves and Live Timer */}
      {(isListening || isPlayingAudio || isTranscribing) && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-md">
          {isListening && (
            <>
              <div className="w-1.5 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-red-400 mr-1 font-bold">
                تحدث الآن ({recordingSeconds}s)...
              </span>
            </>
          )}

          {isTranscribing && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="text-[11px] text-amber-400 font-medium">
                جاري تفريغ الصوت ذكياً...
              </span>
            </>
          )}

          {isPlayingAudio && (
            <>
              <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-emerald-400 mr-1 font-medium">
                جاري التحدث الصوتي...
              </span>
            </>
          )}
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="absolute -top-10 right-0 bg-red-950/95 border border-red-500/50 text-red-200 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

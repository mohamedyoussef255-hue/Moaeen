import React, { useState, useRef, useEffect } from 'react';
import { EzoutiApp, ChatMessage, PersonaMode } from '../types/assistant';
import { mueenAudio } from '../utils/audioPlayer';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  Play,
  Square,
  HelpCircle,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface EmbedVoiceWidgetProps {
  app: EzoutiApp;
}

export const EmbedVoiceWidget: React.FC<EmbedVoiceWidgetProps> = ({ app }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-voice',
      role: 'assistant',
      persona: 'hybrid',
      text: `يا هلا بيك! أنا مُعِين، مرشدك الصوتي الذكي في ${app.name}. اسألني بصوتك أو كتابة وأنا هدلك على أي زرار أو صفحة خطوة بخطوة.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Subscribe to audio player changes
  useEffect(() => {
    const unsub = mueenAudio.subscribe((isPlaying) => {
      setIsPlayingAudio(isPlaying);
    });
    return () => {
      unsub();
      mueenAudio.stop();
    };
  }, []);

  // Web Speech Recognition for the mic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-EG';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [app]);

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setRecognitionError(null);
        } catch {
          setIsListening(false);
        }
      } else {
        setRecognitionError('خاصية المايك غير مدعومة بالمتصفح الحالي.');
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
          appContext: app.id,
          personaMode: 'hybrid',
          voiceMode: true, // Always short spoken answers (1-3 sentences)
          customApp: app.id.startsWith('custom_') ? app : undefined,
        }),
      });

      const data = await response.json();
      const reply = data.reply || `أنا معاك في ${app.name}، اضغط على الصفحة المطلوبة من القائمة الرئيسية.`;

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        persona: 'hybrid',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (autoSpeak) {
        mueenAudio.speak(reply, assistantMsg.id);
      }
    } catch {
      const fallback = `أنا معاك يا غالي خطوة بخطوة، تقدر تفتح ${app.routes[0]?.name || 'الصفحة الرئيسية'} من القائمة.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          persona: 'hybrid',
          text: fallback,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (autoSpeak) mueenAudio.speak(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="h-screen w-screen flex flex-col justify-end p-3 bg-transparent font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-slate-950">
      {/* Sleek Floating Voice Card */}
      <div className="w-full max-w-sm mx-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
        {/* Compact Header */}
        <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Glowing Soundwave Orb */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 scale-105 animate-pulse'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">مُعِين</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-400 font-bold">المرشد الصوتي</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                تطبيق: {app.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                if (autoSpeak) mueenAudio.stop();
              }}
              className={`p-1.5 rounded-xl border transition ${
                autoSpeak
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={autoSpeak ? 'الصوت التلقائي شغال' : 'الصوت التلقائي موقف'}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Parent Close Button */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.parent) {
                  window.parent.postMessage('ezouti-close-assistant', '*');
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Spoken Voice Bubble */}
        <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
          {lastAssistantMessage && (
            <div className="space-y-2 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed relative">
                {/* Live soundwave animation if audio is playing */}
                {isPlayingAudio && (
                  <div className="flex items-center gap-1 mb-2 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="mr-1">مُعِين يتحدث بصوته الآن...</span>
                  </div>
                )}
                {lastAssistantMessage.text}
              </div>

              {/* Re-play audio button */}
              <button
                onClick={() => mueenAudio.speak(lastAssistantMessage.text, lastAssistantMessage.id)}
                className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
              >
                <Play className="w-3 h-3 fill-emerald-400" />
                <span>إعادة الاستماع للصوت</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>مُعِين يجهز الرد الصوتي...</span>
            </div>
          )}

          {/* Quick Guidance Questions */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            {[
              `ازاي استخدم ${app.name}؟`,
              'أين أجد صفحة العمليات؟',
              'شرح الخطوة التالية',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                disabled={isGenerating}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Input & Mic Action Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 space-y-2">
          {recognitionError && (
            <span className="text-[10px] text-red-400 block text-center">
              {recognitionError}
            </span>
          )}

          <div className="flex items-center gap-2">
            {/* Direct Mic Button */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-2xl flex items-center justify-center transition shadow-lg shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 hover:scale-105 shadow-emerald-500/20'
              }`}
              title={isListening ? 'جاري الاستماع... انقر للإيقاف' : 'تحدث بالصوت'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Quick Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              placeholder={isListening ? 'تحدث الآن، أسمعك...' : 'تحدث بالمايك أو اكتب هنا...'}
              disabled={isGenerating}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isGenerating}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 transition disabled:opacity-30 shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

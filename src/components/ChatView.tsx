import React, { useState, useRef, useEffect } from 'react';
import { PersonaMode, EzoutiApp, ChatMessage } from '../types/assistant';
import { VoiceController } from './VoiceController';
import { mueenAudio, VoiceEngineType } from '../utils/audioPlayer';
import {
  Send,
  Sparkles,
  Briefcase,
  Cpu,
  Zap,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Square,
  Mic,
  Play,
  Info,
  X,
} from 'lucide-react';

interface ChatViewProps {
  selectedPersona: PersonaMode;
  selectedApp: EzoutiApp;
  voiceMode: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  onClearHistory: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  selectedPersona,
  selectedApp,
  voiceMode,
  messages,
  onSendMessage,
  isGenerating,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [currentEngine, setCurrentEngine] = useState<VoiceEngineType>('idle');
  const [showVoiceInfoModal, setShowVoiceInfoModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  // Subscribe to audio player changes
  useEffect(() => {
    const unsubscribe = mueenAudio.subscribe((isPlaying, activeId, engine) => {
      setPlayingMessageId(isPlaying ? activeId : null);
      setCurrentEngine(engine);
    });
    return () => {
      unsubscribe();
      mueenAudio.stop();
    };
  }, []);

  // Auto-speak new assistant responses when autoSpeak is on
  useEffect(() => {
    if (!autoSpeak) return;

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg &&
      lastMsg.role === 'assistant' &&
      lastMsg.id !== lastSpokenMessageIdRef.current &&
      !isGenerating
    ) {
      lastSpokenMessageIdRef.current = lastMsg.id;
      // Short delay to let UI render
      const timer = setTimeout(() => {
        mueenAudio.speak(lastMsg.text, lastMsg.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [messages, isGenerating, autoSpeak]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePlayMessage = (id: string, text: string) => {
    if (playingMessageId === id) {
      mueenAudio.stop();
    } else {
      mueenAudio.speak(text, id);
    }
  };

  const handleTestVoice = () => {
    mueenAudio.speak(
      `يا هلا بيك يا غالي! أنا مُعِين، صوتك ومرشدك الذكي في ${selectedApp.name}. أنا هنا لمساعدتك خطوة بخطوة في أي استفسار تقني أو تجاري.`,
      'test_voice'
    );
  };

  const getPersonaBadge = (persona?: PersonaMode) => {
    switch (persona) {
      case 'waddah':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Briefcase className="w-3 h-3" />
            وضاح (مستشار البزنس)
          </span>
        );
      case 'captain_luka':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Cpu className="w-3 h-3" />
            كابتن لوكا (معماري النظم)
          </span>
        );
      case 'luka_fast':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/30">
            <Zap className="w-3 h-3" />
            لوكا السريع ⚡
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold">
            <Sparkles className="w-3 h-3 text-amber-300" />
            مُعِين (وضاح & كابتن لوكا & لوكا السريع)
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto px-4 py-3">
      {/* Top Context & Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 mb-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-400/30"
            style={{ backgroundColor: selectedApp.color }}
          />
          <span className="text-slate-400">التطبيق النشط:</span>
          <span className="font-bold text-white text-sm">{selectedApp.name}</span>
          <span className="text-slate-500 hidden sm:inline text-[11px]">
            ({selectedApp.tagline})
          </span>
        </div>

        {/* Voice Toggles & Helpers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Info Button */}
          <button
            onClick={() => setShowVoiceInfoModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[11px]"
            title="توضيح محرك الصوت البشري وحالة الكوتا"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>نظام الصوت</span>
          </button>

          {/* Test Voice Button */}
          <button
            onClick={handleTestVoice}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition text-[11px] font-semibold"
            title="اختبار سماع صوت مُعِين للتأكد من عمل الصوت على جهازك"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>تجربة صوت مُعِين</span>
          </button>

          {/* Auto-Speak Toggle */}
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) mueenAudio.stop();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition text-[11px] font-bold ${
              autoSpeak
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="تشغيل أو إيقاف نطق الردود تلقائياً بالصوت"
          >
            {autoSpeak ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>الرد الصوتي التلقائي: شغال 🔊</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>الرد الصوتي التلقائي: موقف</span>
              </>
            )}
          </button>

          {/* Clear Session */}
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition text-[11px] px-2 py-1 rounded-lg hover:bg-slate-800"
            title="مسح المحادثة وبدء جلسة جديدة"
          >
            <RotateCcw className="w-3 h-3" />
            <span>جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
        {messages.map((message) => {
          const isPlayingThis = playingMessageId === message.id;

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  message.role === 'user'
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 text-white shadow-emerald-500/20'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm transition ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : `bg-slate-900/95 border text-slate-100 rounded-tl-none ${
                        isPlayingThis
                          ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800'
                      }`
                }`}
              >
                {/* Header Info for Assistant */}
                {message.role === 'assistant' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      {getPersonaBadge(message.persona)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        شركة عزوتي IT
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Hear This Message Audio Button */}
                      <button
                        onClick={() => handleTogglePlayMessage(message.id, message.text)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                          isPlayingThis
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                            : 'bg-slate-800/90 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                        title={isPlayingThis ? 'إيقاف نطق هذه الرسالة' : 'استمع لهذه الرسالة بصوت مُعِين'}
                      >
                        {isPlayingThis ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                            <span>إيقاف الصوت</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>استمع للرد بصوت مُعِين 🔊</span>
                          </>
                        )}
                      </button>

                      {/* Copy Text */}
                      <button
                        onClick={() => handleCopy(message.id, message.text)}
                        className="p-1 text-slate-400 hover:text-emerald-400 transition rounded"
                        title="نسخ النص"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {message.text}
                </div>

                {/* Timestamp & Active Playing Wave indicator */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[10px]">
                  <div className="text-slate-500">{message.timestamp}</div>
                  {isPlayingThis && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="mr-1">
                        {currentEngine === 'gemini_human'
                          ? 'صوت مُعِين البشري الفائق (Gemini Voice) 🎙️'
                          : 'صوت النطق العربي الطبيعي المطور 🎧'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-700 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-100" />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping delay-200" />
              </div>
              <span className="text-xs text-slate-300 font-medium">
                مُعِين يفكر بأدق إجابة لطلبك...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions for the Active App */}
      <div className="pt-2 pb-1 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-emerald-400" />
          أسئلة سريعة:
        </span>
        {selectedApp.sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(q)}
            disabled={isGenerating}
            className="text-xs shrink-0 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar with Prominent Microphone & Send */}
      <form onSubmit={handleSubmit} className="mt-2 relative">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/95 border-2 border-slate-800 focus-within:border-emerald-500 shadow-2xl transition">
          {/* Voice Microphone Controller */}
          <VoiceController
            onSpeechInput={(spokenText) => onSendMessage(spokenText)}
            isGenerating={isGenerating}
            voiceMode={voiceMode}
            lastAssistantText={
              [...messages].reverse().find((m) => m.role === 'assistant')?.text
            }
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              autoSpeak
                ? 'اضغط المايكروفون للتحدث بصوتك، أو اكتب سؤالك هنا (وسيرد مُعِين بصوته)...'
                : `اسأل مُعِين عن ${selectedApp.name}، أو أي استفسار تقني أو تجاري...`
            }
            disabled={isGenerating}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2 font-sans"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className={`px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              inputText.trim() && !isGenerating
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black hover:opacity-95 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="إرسال"
          >
            <span className="text-xs font-bold hidden sm:inline">إرسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </form>

      {/* Voice System Details Modal */}
      {showVoiceInfoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  تفاصيل محرك الصوت البشري لـ "مُعِين"
                </h3>
              </div>
              <button
                onClick={() => setShowVoiceInfoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">
                  1. أين يذهب صوت معين البشري؟
                </span>
                <p className="text-slate-400">
                  يعتمد صوت مُعِين البشري فائق الواقعية على أحدث نماذج Google (Gemini 3.8 Flash Lite TTS). في الباقة التجريبية المجانية لـ Google AI Studio، تضع جوجل حداً أقصى للاستخدام المجاني قدره <strong className="text-white">10 طلبات صوتية فقط في اليوم الواحد</strong>.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">
                  2. لماذا كانت الرسائل تتحول إلى صوت آلي (روبوت)؟
                </span>
                <p className="text-slate-400">
                  بمجرد استهلاك الـ 10 طلبات اليومية المجانية، كان المتصفح ينتقل افتراضياً للمحرك الآلي القديم لنظام التشغيل لتفادي توقف الصوت.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block">
                  3. ما التحديثات التي قمنا بها لإبقاء الصوت بشرياً؟
                </span>
                <ul className="list-disc list-inside text-slate-400 space-y-1 pr-1">
                  <li>
                    <strong className="text-slate-200">ذاكرة تخزين مؤقت (Cache):</strong> العبارات الشائعة والترحيبية تُحفظ بصوت مُعِين البشري ولا تستهلك أي رصيد عند إعادة سماعها.
                  </li>
                  <li>
                    <strong className="text-slate-200">محرك نطق عربي مطور (Neural Arabic):</strong> في حال انتهاء الحصة اليومية، يتم اختيار أنقى صوت عربي بشري طبيعي بالمتصفح بلهجة ونبرة هادئة وموزونة بدلاً من الروبوت.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  handleTestVoice();
                  setShowVoiceInfoModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                تجربة الصوت الآن 🔊
              </button>

              <button
                onClick={() => setShowVoiceInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

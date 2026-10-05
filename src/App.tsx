import React, { useState, useEffect } from 'react';
import { PersonaMode, EzoutiApp, ChatMessage } from './types/assistant';
import { INITIAL_APPS, EZOUTI_COMPANY_INFO } from './data/ezoutiData';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { EmbedVoiceWidget } from './components/EmbedVoiceWidget';
import { AppSimulator } from './components/AppSimulator';
import { EmbedGuide } from './components/EmbedGuide';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ScholarlyEngine } from './components/ScholarlyEngine';
import { EzoutiLogo } from './components/EzoutiLogo';
import { mueenAudio } from './utils/audioPlayer';
import { Bot, Send, Volume2, X } from 'lucide-react';

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaMode>('hybrid');
  const [voiceMode, setVoiceMode] = useState<boolean>(true);
  const [allApps, setAllApps] = useState<EzoutiApp[]>(INITIAL_APPS);
  const [selectedApp, setSelectedApp] = useState<EzoutiApp>(INITIAL_APPS[0]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Check if opened inside iframe embed mode (?embed=true)
  const isEmbedMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';

  // Initial welcome message reflecting the combined persona and company origin
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      persona: 'hybrid',
      text: `يا هلا بيك يا غالي ونورتنا! 🌟\nأنا "مُعِين"—المساعد الذكي والاستثنائي الذي يدمج بين شخصيات "وضاح"، و"كابتن لوكا"، و"كابتن لوكا السريع".\nتم ابتكاري وتطويري حصرياً بواسطة "شركة عزوتي للبرمجيات وتكنولوجيا المعلومات" (EZWATY IT) من خلال مالكها والمطور "محمد يوسف"، وتعود كافة حقوق الملكية الفكرية وتصميمي وتصميم المشاريع التي أديرها بالكامل وبشكل حصري للمطور (وهو رجل ورئيس المعماريين) ولـ "شركة عزوتي للبرمجيات وتكنولوجيا المعلومات".\n\nمعاك هنا:\n* روح "وضاح": صديقك الجدع ومستشارك الذكي للبزنس والمبيعات واستراتيجيات السوق.\n* عقل "كابتن لوكا": مهندس البرمجيات المخضرم (Senior Software Architect) لتحليل وبناء أعتى النظم وقواعد البيانات (PostgreSQL, React, Node.js).\n* إنجاز "لوكا السريع": عملي حاسم، حلول قاطعة وأكواد برمجية نظيفة وجاهزة بأقصى سرعة.\n\nتطبيقاتنا المربوطة:\n1. 🛒 منصة "عزوة" (Ezwa) للشراء الجماعي الذكي والتسويق بالعمولة.\n2. 🏢 منصة "عزوتي إي آر بي" (Ezouti ERP) لإدارة الموارد المؤسسية.\n3. ⛽ نظام متابعة أصول كارجاز (تكويد QR وتكامل SAP FI-AA ومحطات CNG).\n4. 🛡️ تطبيق "ستوب" (STOP) لمراقبة السلامة وبيئة العمل.\n\nوكذلك جاهز لأي استفسار في الاقتصاد، الفن، الرياضة، السياسة، والدين بمنهجية كبار علماء المسلمين (ابن خلدون، الخوارزمي، البيروني، وابن سينا) وثقافات العالم. اتفضل، إيه مشروعنا أو استفسارك؟`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Handle URL param for app pre-selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlApp = new URLSearchParams(window.location.search).get('app');
      if (urlApp) {
        const found = allApps.find((a) => a.id === urlApp);
        if (found) setSelectedApp(found);
      }
    }
  }, [allApps]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
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
          appContext: selectedApp.id,
          personaMode: selectedPersona,
          voiceMode,
          customApp: selectedApp.id.startsWith('custom_') ? selectedApp : undefined,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'أهلاً بك يا فندم، أنا دائماً في خدمتك!';

      const assistantMsg: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        role: 'assistant',
        persona: selectedPersona,
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If voice mode is on, trigger audio automatically
      if (voiceMode) {
        triggerAutoVoice(replyText);
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        persona: selectedPersona,
        text: 'حصل ضغط شبكة لحظي يا فندم، أنا معاك خطوة بخطوة وجاهز للإجابة، كرر سؤالك من فضلك!',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerAutoVoice = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
        audio.play().catch((err) => console.warn('Audio auto-play prevented:', err));
      }
    } catch (e) {
      console.warn('Voice play error:', e);
    }
  };

  const handleAddNewApp = (newApp: EzoutiApp) => {
    setAllApps((prev) => [newApp, ...prev]);
    setSelectedApp(newApp);
    setActiveTab('chat');
    const welcomeMsg = `أهلاً بك يا غالي! تم استيعاب وفحص مشروع "${newApp.name}" (${newApp.tagline}) بنجاح! 🚀\nتعرفت على ${newApp.routes.length} شاشة ومسار:\n${newApp.routes.map((r, i) => `${i + 1}. ${r.name} (${r.path})`).join('\n')}\nأنا الآن جاهز للإجابة بصوتي أو كتابياً لإرشادك وإرشاد أي مستخدم خطوة بخطوة.`;
    setMessages((prev) => [
      ...prev,
      {
        id: `learned-${Date.now()}`,
        role: 'assistant',
        persona: selectedPersona,
        text: welcomeMsg,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    mueenAudio.speak(
      `أهلاً بك يا غالي! تم استيعاب وفحص مشروع ${newApp.name} بنجاح. أنا الآن جاهز للإجابة بصوتي ومرافقة أي مستخدم خطوة بخطوة!`,
      `learned_${Date.now()}`
    );
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        persona: selectedPersona,
        text: `بدأنا جلسة جديدة يا غالي في سياق "${selectedApp.name}". وضاح وكابتن لوكا ولوكا السريع في خدمتك، اسألني في أي شيء!`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // If viewed as embed iframe inside external apps via widget
  if (isEmbedMode) {
    return <EmbedVoiceWidget app={selectedApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-['Cairo',sans-serif]">
      {/* Top Main Navigation Header */}
      <Header
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        voiceMode={voiceMode}
        onToggleVoiceMode={() => setVoiceMode(!voiceMode)}
        selectedApp={selectedApp}
        allApps={allApps}
        onSelectApp={(app) => {
          setSelectedApp(app);
          // Add system notice when switching app
          setMessages((prev) => [
            ...prev,
            {
              id: `switch-${Date.now()}`,
              role: 'assistant',
              persona: selectedPersona,
              text: `تحول سياق المساعد الآن إلى "${app.name}" (${app.tagline}). أنا جاهز للإجابة عن أي استفسار متعلق بهذا التطبيق ووظائفه.`,
              timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatView
            selectedPersona={selectedPersona}
            selectedApp={selectedApp}
            voiceMode={voiceMode}
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'simulator' && (
          <AppSimulator
            currentApp={selectedApp}
            onSelectApp={setSelectedApp}
            allApps={allApps}
            selectedPersona={selectedPersona}
            onAddNewApp={handleAddNewApp}
          />
        )}

        {activeTab === 'embed' && (
          <EmbedGuide selectedApp={selectedApp} allApps={allApps} />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBase
            apps={allApps}
            onAddNewApp={handleAddNewApp}
            onSelectAppToChat={(app) => {
              setSelectedApp(app);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'scholars' && (
          <ScholarlyEngine
            onAskQuestion={(question) => {
              setActiveTab('chat');
              handleSendMessage(question);
            }}
          />
        )}
      </main>

      {/* Footer Credential */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <EzoutiLogo size="sm" variant="full" />
            <div className="text-right text-[11px] text-slate-400 border-r border-slate-800 pr-3">
              <div>© {new Date().getFullYear()} {EZOUTI_COMPANY_INFO.companyName}</div>
              <div className="text-slate-500">كافة حقوق الملكية الفكرية وتصميم المساعد (مُعِين) محفوظة حصرياً للمطور {EZOUTI_COMPANY_INFO.developerName}.</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مُعِين الذكي مدعوم بتقنيات الذكاء الاصطناعي والصوت المتقدمة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

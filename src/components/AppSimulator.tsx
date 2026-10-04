import React, { useState } from 'react';
import { EzoutiApp, PersonaMode } from '../types/assistant';
import { EzoutiLogo } from './EzoutiLogo';
import { ProjectUploader } from './ProjectUploader';
import { mueenAudio } from '../utils/audioPlayer';
import {
  Users,
  Building2,
  Flame,
  ShieldAlert,
  Search,
  ExternalLink,
  Bot,
  MessageSquare,
  QrCode,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Loader2,
  FolderUp,
  Volume2,
  Sparkles,
  HelpCircle,
  FileCode,
} from 'lucide-react';

interface AppSimulatorProps {
  currentApp: EzoutiApp;
  onSelectApp: (app: EzoutiApp) => void;
  allApps: EzoutiApp[];
  selectedPersona: PersonaMode;
  onAddNewApp?: (app: EzoutiApp) => void;
}

export const AppSimulator: React.FC<AppSimulatorProps> = ({
  currentApp,
  onSelectApp,
  allApps,
  selectedPersona,
  onAddNewApp,
}) => {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [widgetMessages, setWidgetMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: `يا هلا بيك! أنا "مُعِين"، مرافقك الذكي داخل ${currentApp.name}. أي صفحة أو وظيفة محتاج تفهمها أو خطوة عايز تنفذها، وضاح وكابتن لوكا معاك خطوة بخطوة.`,
    },
  ]);
  const [widgetInput, setWidgetInput] = useState('');
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);

  const activeRoute = currentApp.routes[activeRouteIndex] || currentApp.routes[0];

  const handleAskWidget = async (promptText: string) => {
    if (!promptText.trim() || isWidgetLoading) return;

    const newMsgs = [...widgetMessages, { role: 'user' as const, text: promptText }];
    setWidgetMessages(newMsgs);
    setWidgetInput('');
    setIsWidgetLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.text })),
          appContext: currentApp.id,
          personaMode: selectedPersona,
          voiceMode: false,
          customApp: currentApp,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setWidgetMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.reply },
        ]);
        // Auto-play response in widget
        mueenAudio.speak(data.reply, 'sim_widget');
      }
    } catch (e) {
      console.error(e);
      setWidgetMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'معلش يا فندم حصل ضغط في الشبكة، أنا معاك وجرب تسألني تاني.',
        },
      ]);
    } finally {
      setIsWidgetLoading(false);
    }
  };

  const handleProjectLearned = (newApp: EzoutiApp) => {
    if (onAddNewApp) {
      onAddNewApp(newApp);
    }
    onSelectApp(newApp);
    setActiveRouteIndex(0);
    setShowUploader(false);
    setWidgetMessages([
      {
        role: 'assistant',
        text: `أهلاً بك! تم استيعاب وفحص مشروع "${newApp.name}" بالكامل بنجاح. أنا الآن على علم بكافة صفحاته (${newApp.routes.map(r => r.name).join('، ')}) ومستعد لتوجيه المستخدمين خطوة بخطوة!`,
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* App Switcher Tabs & Project Upload Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>مُحاكي التطبيقات الحية</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Simulator
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              تصفح التطبيق واضغط على الزر العائم بالأسفل لاختبار مساعدة مُعِين الصوتية لصفحاتك!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload My Project Folder Button */}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:scale-105 transition shadow-md shadow-emerald-500/20"
          >
            <FolderUp className="w-4 h-4" />
            <span>ارفع مشروع تطبيقك (مجلد / Zip) 📂</span>
          </button>

          {/* List of Available Apps */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {allApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onSelectApp(app);
                  setActiveRouteIndex(0);
                  setWidgetMessages([
                    {
                      role: 'assistant',
                      text: `أهلاً بك في ${app.name}! أنا جاهز لتوجيهك وشرح وظائف هذا النظام بالكامل.`,
                    },
                  ]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  currentApp.id === app.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: app.color }}
                />
                <span>{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Uploader Modal / Section */}
      {showUploader && (
        <ProjectUploader
          onProjectLearned={handleProjectLearned}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Simulated Device Window */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl min-h-[580px] flex flex-col">
        {/* Browser Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-1 text-xs text-slate-400 w-1/2 justify-center font-mono">
            <span className="text-emerald-400 font-bold">ezouti.com/{currentApp.id}</span>
            <span>{activeRoute?.path}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">SDK v2.4 متصل</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Sub-Header / Navigation inside Simulated App */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: currentApp.color }}
            >
              {currentApp.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {currentApp.name}
              </h3>
              <p className="text-[11px] text-slate-400">{currentApp.tagline}</p>
            </div>
          </div>

          {/* Navigation Tabs of the App */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {currentApp.routes.map((route, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveRouteIndex(idx);
                  setWidgetMessages((prev) => [
                    ...prev,
                    {
                      role: 'assistant',
                      text: `أنت الآن في صفحة "${route.name}" (${route.path}). وظيفتها الأساسية: ${route.description}. محتاج تعرف خطوة معينة؟`,
                    },
                  ]);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  activeRouteIndex === idx
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {route.name}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated App Body Content */}
        <div className="p-6 flex-1 bg-gradient-to-b from-slate-950 to-slate-900 overflow-y-auto">
          {/* CARGAS SIMULATION */}
          {currentApp.id === 'cargas' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    موديول أصول محطات الغاز الطبيعي (CNG)
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    محطة كارجاز - قطاع مدينة نصر (ضاغط رقم 4)
                  </h4>
                  <p className="text-xs text-slate-400">
                    كود الأصل في SAP: <span className="font-mono text-cyan-400">FA-CNG-88210</span> | الباركود: <span className="font-mono text-cyan-400">QR-GAS-991</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <QrCode className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">حالة التكامل اللحظي</span>
                    <span className="text-xs font-bold text-emerald-400">متزامن مع SAP FI-AA</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">ضغط التشغيل الحالي</span>
                  <div className="text-xl font-bold text-white mt-1">250 Bar</div>
                  <span className="text-[10px] text-emerald-400">ضمن الحدود الآمنة القياسية</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">تاريخ آخر صيانة وقائية</span>
                  <div className="text-xl font-bold text-white mt-1">15 سبتمبر 2026</div>
                  <span className="text-[10px] text-cyan-400">الفحص القادم بعد 12 يوماً</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">القيمة الدفترية للأصل</span>
                  <div className="text-xl font-bold text-white mt-1">1,450,000 ج.م</div>
                  <span className="text-[10px] text-slate-400">إهلاك سنوي 10% خط مستقيم</span>
                </div>
              </div>
            </div>
          )}

          {/* EZWA SIMULATION */}
          {currentApp.id === 'ezwa' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    صفقات الشراء الجماعي الذكي (Group Buying Deal)
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    صفقة شاشات ذكية 65 بوصة 4K - باقة تجار التجزئة
                  </h4>
                  <p className="text-xs text-slate-400">
                    السعر الفردي: <span className="line-through text-red-400">18,500 ج.م</span> | سعر الشراء الجماعي: <span className="font-bold text-emerald-400">14,200 ج.م</span>
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">اكتمال النصاب</div>
                  <div className="text-2xl font-black text-amber-400">82%</div>
                  <span className="text-[10px] text-slate-400">متبقي 9 قطع وتغلق الصفقة</span>
                </div>
              </div>
            </div>
          )}

          {/* EZOUTI ERP SIMULATION */}
          {currentApp.id === 'ezouti_erp' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Ezouti ERP - الإصدار المؤسسي
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    لوحة تحكم المخازن والفاتورة الإلكترونية الموحدة
                  </h4>
                  <p className="text-xs text-slate-400">
                    قاعدة البيانات: PostgreSQL | مصلحة الضرائب المصرية: متصل ونشط
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">فواتير اليوم المعتمدة</div>
                  <div className="text-2xl font-black text-cyan-400">348 فاتورة</div>
                </div>
              </div>
            </div>
          )}

          {/* STOP SAFETY SIMULATION */}
          {currentApp.id === 'stop' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                    نظام STOP للسلامة والصحة المهنية (HSE)
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    رصد السلوكيات الميدانية والتدخل الفوري لمنع الحوادث
                  </h4>
                  <p className="text-xs text-slate-400">
                    متوافق مع معايير OSHA ومسار التدخل السريع (CAPA)
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">أيام بدون إصابات هادرة</div>
                  <div className="text-2xl font-black text-emerald-400">412 يوماً</div>
                </div>
              </div>
            </div>
          )}

          {/* UNIVERSAL ADVISOR SIMULATION */}
          {currentApp.id === 'universal' && (
            <div className="space-y-6">
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5">
                <h4 className="text-base font-bold text-white">
                  المساعد الموسوعي ومنهجية علماء المسلمين والعالم
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  محرك استشاري يدمج التحليل الاقتصادي، الاستراتيجيات الرقمية، وعمق التراث الحضاري العربي والإسلامي (ابن خلدون، الخوارزمي، البيروني، ابن سينا) مع العالمية.
                </p>
              </div>
            </div>
          )}

          {/* LEARNED / CUSTOM APP DYNAMIC MOCKUP */}
          {!['cargas', 'ezwa', 'ezouti_erp', 'stop', 'universal'].includes(currentApp.id) && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                    ✨ مشروع تم استيعابه وفحصه بنجاح
                  </span>
                  <h4 className="text-lg font-black text-white mt-2">
                    {currentApp.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {currentApp.description}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left">
                  <span className="text-[10px] text-slate-400 block">الصفحة المعروضة حالياً:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {activeRoute?.path} ({activeRoute?.name})
                  </span>
                </div>
              </div>

              {/* Active Screen Details & Mock Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>محتوى شاشة "{activeRoute?.name}"</span>
                  </h5>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeRoute?.description}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">العملية الأساسية</span>
                    <div className="text-sm font-bold text-slate-200">عرض وتحديث البيانات</div>
                    <span className="text-[10px] text-emerald-400">متصل وجاهز للاستخدام</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">حالة المستخدم</span>
                    <div className="text-sm font-bold text-slate-200">مستخدم موثق (Logged In)</div>
                    <span className="text-[10px] text-cyan-400">كامل الصلاحيات</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">مرشدك الذكي</span>
                    <div className="text-sm font-bold text-emerald-400">مُعِين نشط بالصوت 🎙️</div>
                    <span className="text-[10px] text-slate-400">اضغط الزر بالأسفل للشات</span>
                  </div>
                </div>

                {/* Simulated Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setIsWidgetOpen(true);
                      handleAskWidget(`كيف أستخدم صفحة ${activeRoute?.name} وما هي خطواتها؟`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <Bot className="w-4 h-4" />
                    <span>اسأل مُعِين عن وظائف هذه الصفحة</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsWidgetOpen(true);
                      handleAskWidget(`أين أجد باقي صفحات التطبيق؟`);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    خريطة صفحات هذا المشروع
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Assistant Floating Action Button (FAB) inside Simulated App */}
        <div className="absolute bottom-6 left-6 z-30">
          <button
            onClick={() => setIsWidgetOpen(!isWidgetOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition border-2 border-white/20 group ring-4 ring-emerald-500/20"
            title="مساعد مُعِين الذكي المدمج"
          >
            <Bot className="w-7 h-7 text-slate-950 group-hover:rotate-12 transition" />
          </button>
        </div>

        {/* Embedded Assistant Popover Modal inside Simulated App */}
        {isWidgetOpen && (
          <div className="absolute bottom-24 left-6 w-[360px] sm:w-[400px] max-h-[500px] h-[480px] bg-slate-950/95 border border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            {/* Widget Top Bar */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    مساعد عزوتي الذكي مُعِين ({currentApp.name})
                  </h5>
                  <span className="text-[10px] text-emerald-400">
                    مُعِين: وضاح & كابتن لوكا جاهز للرد بالصوت
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsWidgetOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Widget Chat History */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {widgetMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => mueenAudio.speak(msg.text, `sim_${i}`)}
                        className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>استمع بالصوت</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isWidgetLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 p-2 rounded-xl w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>مُعِين يفكر بالإجابة...</span>
                </div>
              )}
            </div>

            {/* Widget Input */}
            <div className="p-2 border-t border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={widgetInput}
                  onChange={(e) => setWidgetInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskWidget(widgetInput);
                  }}
                  placeholder="اسأل مُعِين عن أي صفحة في هذا التطبيق..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleAskWidget(widgetInput)}
                  disabled={!widgetInput.trim() || isWidgetLoading}
                  className="p-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

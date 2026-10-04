import React, { useState } from 'react';
import { EzoutiApp, PersonaMode } from '../types/assistant';
import { EZOUTI_COMPANY_INFO } from '../data/ezoutiData';
import { EzoutiLogo } from './EzoutiLogo';
import {
  Code,
  Copy,
  Check,
  Globe,
  Terminal,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Sliders,
  Smartphone,
  BookOpen,
  ArrowRight,
  Workflow,
  HelpCircle,
  Play,
} from 'lucide-react';

interface EmbedGuideProps {
  selectedApp: EzoutiApp;
  allApps: EzoutiApp[];
}

export const EmbedGuide: React.FC<EmbedGuideProps> = ({ selectedApp, allApps }) => {
  const [activeTab, setActiveTab] = useState<'ultra' | 'custom' | 'react' | 'api' | 'sdk'>('ultra');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom App Generator State
  const [customAppName, setCustomAppName] = useState('تطبيقي الخاص (My App)');
  const [customAppId, setCustomAppId] = useState('my_custom_app');
  const [customAppColor, setCustomAppColor] = useState('#10b981');
  const [customAppPosition, setCustomAppPosition] = useState<'bottom-left' | 'bottom-right'>('bottom-left');
  const [customPersona, setCustomPersona] = useState<PersonaMode>('hybrid');
  const [customRoutes, setCustomRoutes] = useState('/dashboard, /orders, /profile, /settings');

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://ezouti-assistant.run.app';

  const copySnippet = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Ultra-Fast 1-Line Script (The simplest ever)
  const ultraFastScript = `<script src="${currentHost}/embed/widget.js" async></script>`;

  // Custom generated snippets
  const customScriptSnippet = `<!-- 1. أضف هذا السطر في نهاية وسم <body> في صفحات تطبيقك -->
<script
  src="${currentHost}/embed/widget.js"
  data-app-id="${customAppId}"
  data-position="${customAppPosition}"
  data-color="${customAppColor}"
  async
></script>`;

  const customReactSnippet = `// 2. كود React / Next.js لتضمين مساعد "مُعِين" (وضاح وكابتن لوكا)
import React, { useEffect } from 'react';

export const MueenAssistantWidget: React.FC = () => {
  useEffect(() => {
    // حقن ويدجت المساعد الذكي مُعِين
    const script = document.createElement('script');
    script.src = '${currentHost}/embed/widget.js';
    script.setAttribute('data-app-id', '${customAppId}');
    script.setAttribute('data-position', '${customAppPosition}');
    script.setAttribute('data-color', '${customAppColor}');
    script.async = true;
    document.body.appendChild(script);

    // إرسال سياق الصفحة الحالية للمساعد عند تغير المسار
    const handleRouteChange = () => {
      window.postMessage({
        type: 'EZOUTI_UPDATE_CONTEXT',
        payload: {
          appId: '${customAppId}',
          appName: '${customAppName}',
          currentPath: window.location.pathname,
          activeRoutes: [${customRoutes.split(',').map((r) => `'${r.trim()}'`).join(', ')}],
        }
      }, '*');
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      const existing = document.querySelector('script[src*="widget.js"]');
      if (existing) existing.remove();
    };
  }, []);

  return null;
};`;

  const customCurlSnippet = `# 3. استدعاء المساعد عبر REST API (لتطبيقات الجوال Flutter / React Native أو الخادم)
curl -X POST "${currentHost}/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "appContext": "${customAppId}",
    "personaMode": "${customPersona}",
    "voiceMode": false,
    "customApp": {
      "id": "${customAppId}",
      "name": "${customAppName}",
      "tagline": "نظام تابع ومربوط بمساعد عزوتي الموحد (مُعِين)",
      "routes": [
        {"path": "/home", "name": "الرئيسية", "description": "لوحة التحكم الرئيسية"}
      ]
    },
    "messages": [
      {
        "role": "user",
        "content": "يا مُعِين، أنا في صفحة الطلبات وعايز أعرف خطوة إلغاء الطلب؟"
      }
    ]
  }'`;

  const customContextSyncSnippet = `// 4. كود إرسال معلومات المستخدم وسياق الشاشة فورياً من داخل تطبيقك
function updateAssistantContext(userRole, currentScreen, actionId) {
  window.postMessage({
    type: 'EZOUTI_CONTEXT_SYNC',
    appId: '${customAppId}',
    context: {
      screen: currentScreen, // e.g. "/checkout"
      user: {
        role: userRole,      // e.g. "merchant" | "customer" | "admin"
        userId: "USR-1029"
      },
      currentAction: actionId
    }
  }, '*');
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Code className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>دليل ربط وتضمين المساعد الذكي</span>
                <span className="text-emerald-400 font-black text-2xl">"مُعِين"</span>
                <span>في أي تطبيق تابع لك</span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              يمكنك ربط هذا المساعد الذكي بأي تطبيق تملكه (موقع ويب، متجر إلكتروني، نظام داخلي، أو تطبيق جوال)
              ليعمل كمساعد ذكي صوتي وتقني داخل تطبيقك، يتعرف على صفحاته، ويوجه مستخدميك خطوة بخطوة!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <EzoutiLogo size="sm" variant="full" />
            <div className="border-r border-slate-800 pr-2 text-right">
              <span className="text-[10px] text-slate-400 block">الملكية الفكرية الحصرية:</span>
              <span className="text-xs font-bold text-emerald-400">{EZOUTI_COMPANY_INFO.developerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Fast 1-Step Integration Hero Card */}
      <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/80 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Zap className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-1">
                ⚡ أسرع وأبسط طريقة للربط (في 5 ثوانٍ فقط وبدون أي تعقيد)
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                انسخ هذا السطر الواحد وضعه في موقعك أو تطبيقك.. وانتهى الأمر!
              </h3>
            </div>
          </div>

          <button
            onClick={() => copySnippet('ultra_fast', ultraFastScript)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-105 transition shadow-lg shadow-emerald-500/30 active:scale-95 shrink-0"
          >
            {copiedKey === 'ultra_fast' ? (
              <>
                <Check className="w-5 h-5 text-slate-950" />
                <span>تم النسخ بنجاح! جاهز للصق</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-slate-950" />
                <span>نسخ كود السطر الواحد الآن 📋</span>
              </>
            )}
          </button>
        </div>

        {/* The 1-Line Code Box */}
        <div className="mt-4">
          <div className="text-xs text-slate-300 mb-2 font-medium">
            الصق هذا الكود في أي صفحة HTML قبل إغلاق وسم <code className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">&lt;/body&gt;</code>:
          </div>
          <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto flex items-center justify-between gap-4">
            <code className="whitespace-pre">{ultraFastScript}</code>
            <button
              onClick={() => copySnippet('ultra_fast', ultraFastScript)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0"
            >
              {copiedKey === 'ultra_fast' ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>
        </div>

        {/* 3 Quick Visual Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
            <span>انسخ السطر البرمجي أعلاه بنقرة واحدة.</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
            <span>الصقه في موقعك قبل نهاية الصفحة.</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
            <span>يظهر "مُعِين" فورياً بالمايك والشات والشرح التلقائي!</span>
          </div>
        </div>
      </div>

      {/* Interactive Custom App Configurator */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                أداة تخصيص خيارات التطبيق الخاص (اختياري للمطورين)
              </h3>
              <p className="text-[11px] text-slate-400">
                إذا أردت تخصيص اسم تطبيقك ولونه أو صفحاته، عدل الحقول أدناه لتوليد كود مخصص لك فوراً:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">اسم تطبيقك</label>
            <input
              type="text"
              value={customAppName}
              onChange={(e) => setCustomAppName(e.target.value)}
              placeholder="مثلاً: تطبيق متجري الذكي"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">معرف التطبيق (App ID)</label>
            <input
              type="text"
              value={customAppId}
              onChange={(e) => setCustomAppId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="my_shop_app"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">موقع الزر العائم</label>
            <select
              value={customAppPosition}
              onChange={(e: any) => setCustomAppPosition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            >
              <option value="bottom-left">أسفل اليسار (bottom-left) - موصى به للعربية</option>
              <option value="bottom-right">أسفل اليمين (bottom-right)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">لون الزر المميز</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customAppColor}
                onChange={(e) => setCustomAppColor(e.target.value)}
                className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-mono">{customAppColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
            مسارات وصفحات تطبيقك (افصل بينها بفواصل)
          </label>
          <input
            type="text"
            value={customRoutes}
            onChange={(e) => setCustomRoutes(e.target.value)}
            placeholder="/dashboard, /products, /cart, /checkout, /account"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
          />
        </div>
      </div>

      {/* Integration Code Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'custom'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>كود Script Tag المخصص</span>
          </button>

          <button
            onClick={() => setActiveTab('react')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'react'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مكون React / Next.js</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'api'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>استدعاء REST API المباشر</span>
          </button>

          <button
            onClick={() => setActiveTab('sdk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'sdk'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>مزامنة سياق الصفحة والمستخدم</span>
          </button>
        </div>

        {/* Tab Code Panes */}
        <div className="p-5">
          {activeTab === 'custom' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">
                  انسخ هذا الكود المخصص وضعْه قبل إغلاق وسم <code className="text-emerald-400">&lt;/body&gt;</code> في صفحات تطبيقك:
                </span>
                <button
                  onClick={() => copySnippet('script', customScriptSnippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copiedKey === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ كود التضمين</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre">
                {customScriptSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'react' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">
                  مكون React مخصص لتطبيقك جاهز للنسخ:
                </span>
                <button
                  onClick={() => copySnippet('react', customReactSnippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copiedKey === 'react' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ مكون React</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre">
                {customReactSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">
                  أمر cURL لاستدعاء المساعد من خادمك أو تطبيق الجوال (Flutter / React Native):
                </span>
                <button
                  onClick={() => copySnippet('api', customCurlSnippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copiedKey === 'api' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ أمر API</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-amber-300 font-mono overflow-x-auto whitespace-pre">
                {customCurlSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'sdk' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">
                  دالة JavaScript لإرسال بيانات الشاشة وهوية المستخدم لحظياً للمساعد:
                </span>
                <button
                  onClick={() => copySnippet('sdk', customContextSyncSnippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copiedKey === 'sdk' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ دالة المزامنة</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-purple-300 font-mono overflow-x-auto whitespace-pre">
                {customContextSyncSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Integration Advantages & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>تعرف تلقائي على سياق تطبيقك</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            المساعد يشرح للمستخدمين صفحات تطبيقك المحددة خطوة بخطوة بالاسم والمسار، مع الالتزام بعدم اختراع ميزات غير موجودة.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>عزل آمن (Sandbox Isolation)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            يعمل الويدجت في بيئة معزولة لا تؤثر على تصميم تطبيقك ولا تستهلك موارده، مع دعم كامل للغة العربية واللهجة المصرية.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
            <Zap className="w-4 h-4" />
            <span>دعم التفاعل الصوتي الشامل</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            يدعم مستخدمو تطبيقك التحدث بالصوت والاستماع للإجابات الصوتية الموجزة (1-3 جمل)، مع دعم تفريغ الصوت عبر Gemini Transcribe.
          </p>
        </div>
      </div>
    </div>
  );
};

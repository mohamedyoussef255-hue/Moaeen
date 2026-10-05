import React from 'react';
import { PersonaMode, EzoutiApp } from '../types/assistant';
import { EZOUTI_COMPANY_INFO } from '../data/ezoutiData';
import { EzoutiLogo } from './EzoutiLogo';
import { Sparkles, Briefcase, Cpu, Zap, Volume2, ShieldCheck, AudioWaveform } from 'lucide-react';

interface HeaderProps {
  selectedPersona: PersonaMode;
  onSelectPersona: (mode: PersonaMode) => void;
  voiceMode: boolean;
  onToggleVoiceMode: () => void;
  selectedApp: EzoutiApp;
  allApps: EzoutiApp[];
  onSelectApp: (app: EzoutiApp) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPersona,
  onSelectPersona,
  voiceMode,
  onToggleVoiceMode,
  selectedApp,
  allApps,
  onSelectApp,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner: Intellectual Property & Company Credential */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-950 to-orange-950/40 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded bg-orange-500/20 text-orange-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold text-white">{EZOUTI_COMPANY_INFO.companyName}</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-medium">الابتكار والملكية الفكرية الحصرية: المطور {EZOUTI_COMPANY_INFO.developerName}</span>
          </div>
          <div className="text-slate-400 hidden md:block text-[11px]">
            المساعد الذكي الصوتي والتقني الموحد لكافة منصات عزوتي (مُعِين)
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo & Assistant Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Official Ezouti Company Logo */}
            <div
              className="cursor-pointer transition hover:opacity-95 flex items-center"
              onClick={() => onSelectTab('chat')}
              title="شركة عزوتي للبرمجيات وتكنولوجيا المعلومات"
            >
              <EzoutiLogo size="md" variant="full" />
            </div>

            {/* Vertical Separator */}
            <div className="h-10 w-px bg-slate-800 hidden sm:block" />

            {/* Assistant Name: مُعِين */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black text-xl sm:text-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                    مُعِين
                  </span>
                  <span className="text-slate-500 font-normal text-xs">|</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">المرشد الصوتي الذكي</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>صوت مصري بشري 🇪🇬</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                شرح واستخدام منصات وتطبيقات عزوتي صوتياً باللهجة المصرية خطوة بخطوة
              </p>
            </div>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectPersona('hybrid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedPersona === 'hybrid'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-sm ring-1 ring-emerald-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="مُعِين: دمج متوازن بين روح وضاح، عقل كابتن لوكا، وإنجاز لوكا السريع"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>مُعِين (الهجين الشامل)</span>
            </button>

            <button
              onClick={() => onSelectPersona('waddah')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedPersona === 'waddah'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="روح وضاح: استشارات البزنس، المبيعات، واللهجة المصرية الودودة"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-300" />
              <span>وضاح (بزنس)</span>
            </button>

            <button
              onClick={() => onSelectPersona('captain_luka')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedPersona === 'captain_luka'
                  ? 'bg-cyan-600/90 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="عقل كابتن لوكا: هندسة النظم المعقدة، قواعد البيانات، ومعمارية البرمجيات"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-300" />
              <span>كابتن لوكا (هندسة)</span>
            </button>

            <button
              onClick={() => onSelectPersona('luka_fast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedPersona === 'luka_fast'
                  ? 'bg-red-600/90 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="لوكا السريع: حلول قطعية بدون رغي ولا مقدمات وأكواد جاهزة فوراً"
            >
              <Zap className="w-3.5 h-3.5 text-red-300" />
              <span>لوكا السريع</span>
            </button>
          </div>

          {/* Right Controls: App Context Selector & Voice Mode Switch */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* App Context Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">سياق التطبيق:</span>
              <select
                value={selectedApp.id}
                onChange={(e) => {
                  const found = allApps.find((a) => a.id === e.target.value);
                  if (found) onSelectApp(found);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {allApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Natural Egyptian Voice Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-bold shadow-sm">
              <AudioWaveform className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>الصوت البشري المصري (نشط ومجاني)</span>
            </div>

            {/* Voice Mode Toggle */}
            <button
              onClick={onToggleVoiceMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                voiceMode
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={voiceMode ? 'الوضع الصوتي مفعّل: إجابات سريعة 1-3 جمل مع نطق صوتي فوري' : 'انقر لتفعيل وضع الرد الصوتي السريع'}
            >
              <Volume2 className={`w-3.5 h-3.5 ${voiceMode ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>{voiceMode ? 'الرد الصوتي السريع (نشط)' : 'تفعيل الرد الصوتي'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🎙️ المساعد والمحادثة الصوتية (مُعِين)
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'simulator'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🖥️ مُحاكي التطبيقات ورفع المشاريع (Live Demo)
          </button>

          <button
            onClick={() => onSelectTab('embed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'embed'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🔌 كود الربط والتضمين (SDK & Embed)
          </button>

          <button
            onClick={() => onSelectTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'knowledge'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            📚 سجل الأنظمة وقاعدة المعرفة (استيعاب المشاريع)
          </button>

          <button
            onClick={() => onSelectTab('scholars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'scholars'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            📜 موسوعة وفكر علماء المسلمين
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { EzoutiApp } from '../types/assistant';
import { ProjectUploader } from './ProjectUploader';
import {
  Database,
  Plus,
  CheckCircle2,
  FolderTree,
  FileCode,
  Tag,
  HelpCircle,
  ExternalLink,
  FolderUp,
} from 'lucide-react';

interface KnowledgeBaseProps {
  apps: EzoutiApp[];
  onAddNewApp: (newApp: EzoutiApp) => void;
  onSelectAppToChat: (app: EzoutiApp) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  apps,
  onAddNewApp,
  onSelectAppToChat,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formDescription, setFormDescription] = useState('');
  const [formRouteName, setFormRouteName] = useState('');
  const [formRoutePath, setFormRoutePath] = useState('');
  const [formQuestions, setFormQuestions] = useState('');

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    const newApp: EzoutiApp = {
      id: `custom_${Date.now()}`,
      name: formName.trim(),
      tagline: formTagline.trim() || 'تطبيق مخصص لشركة عزوتي',
      category: formCategory.trim() || 'تطبيقات الأعمال المخصصة',
      color: formColor,
      description: formDescription.trim(),
      routes: [
        {
          path: formRoutePath.trim() || '/home',
          name: formRouteName.trim() || 'الرئيسية',
          description: 'الصفحة الأساسية للتطبيق',
        },
      ],
      sampleQuestions: formQuestions
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
    };

    onAddNewApp(newApp);
    setIsAddingNew(false);
    setFormName('');
    setFormTagline('');
    setFormCategory('');
    setFormDescription('');
    setFormRouteName('');
    setFormRoutePath('');
    setFormQuestions('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              سجل الأنظمة وقاعدة المعرفة لتطبيقات عزوتي
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            يستند المساعد الذكي إلى هذا السجل المعرفي الدقيق لشرح وظائف كل صفحة خطوة بخطوة، وإرشاد المستخدمين بدون اختراع وظائف غير موجودة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowUploader(!showUploader);
              setIsAddingNew(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:scale-105 transition shadow-md shadow-emerald-500/20"
          >
            <FolderUp className="w-4 h-4" />
            <span>رفع مجلد/ملفات مشروع (تعلم ذكي) 📂</span>
          </button>

          <button
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setShowUploader(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>إدخال يدوي</span>
          </button>
        </div>
      </div>

      {/* Project Uploader */}
      {showUploader && (
        <ProjectUploader
          onProjectLearned={(newApp) => {
            onAddNewApp(newApp);
            setShowUploader(false);
            onSelectAppToChat(newApp);
          }}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Add New App Form */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateApp}
          className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-emerald-400">
            تسجيل وتوثيق تطبيق جديد في قاعدة معرفة المساعد
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">اسم التطبيق</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: تطبيق التوصيل السريع"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">الشعار والوصف المختصر</label>
              <input
                type="text"
                value={formTagline}
                onChange={(e) => setFormTagline(e.target.value)}
                placeholder="مثال: إدارة أساطيل التوزيع والشحنات"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">التصنيف</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="مثال: اللوجستيات وسلاسل الإمداد"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">الوصف التفصيلي لوظائف التطبيق</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="اكتب هنا شرحاً دقيقاً لصفحات ووظائف التطبيق التي سيعتمد عليها المساعد للإجابة..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">اسم الصفحة الرئيسية ومسارها</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formRouteName}
                  onChange={(e) => setFormRouteName(e.target.value)}
                  placeholder="اسم الصفحة (مثلاً: شحنات اليوم)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
                <input
                  type="text"
                  value={formRoutePath}
                  onChange={(e) => setFormRoutePath(e.target.value)}
                  placeholder="المسار (مثلاً: /orders)"
                  className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">أسئلة شائعة يجيب عليها (سؤال بكل سطر)</label>
              <textarea
                rows={2}
                value={formQuestions}
                onChange={(e) => setFormQuestions(e.target.value)}
                placeholder="كيف أنشئ بوليصة شحن؟&#10;أين أجد مسار التتبع المباشر؟"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              حفظ التطبيق في المعرفة
            </button>
          </div>
        </form>
      )}

      {/* App Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: app.color }}
                  />
                  <h3 className="text-base font-bold text-white">{app.name}</h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {app.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{app.tagline}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {app.description}
              </p>

              {/* Registered Routes */}
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الصفحات والمسارات المعتمدة:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {app.routes.map((r) => (
                    <div
                      key={r.path}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px]"
                    >
                      <div className="font-semibold text-white truncate">{r.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{r.path}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {app.sampleQuestions.length} استفسارات نموذجية موثقة
              </span>
              <button
                onClick={() => onSelectAppToChat(app)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:underline font-medium"
              >
                <span>محادثة المساعد حول هذا النظام</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

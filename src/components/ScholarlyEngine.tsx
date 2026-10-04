import React from 'react';
import { SCHOLARS_METHODOLOGY } from '../data/ezoutiData';
import {
  BookOpen,
  Scale,
  Compass,
  Lightbulb,
  Globe2,
  TrendingUp,
  Award,
  Palette,
  Landmark,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ScholarlyEngineProps {
  onAskQuestion: (question: string) => void;
}

export const ScholarlyEngine: React.FC<ScholarlyEngineProps> = ({ onAskQuestion }) => {
  const multidisciplinaryTopics = [
    {
      title: 'الاقتصاد ودورات الأسواق (منهج ابن خلدون)',
      icon: TrendingUp,
      color: '#10b981',
      description: 'تحليل أثر الضرائب والعدالة ومستوى الإنفاق على حركة الأسواق، ومقارنة ذلك بمنصات الشراء الجماعي والـ ERP.',
      samplePrompt: 'كيف يفسر منهج ابن خلدون في "المقدمة" نجاح نموذج الشراء الجماعي كأداة لتحفيز حركة التجارة وتقليل التضخم؟',
    },
    {
      title: 'العلوم الدقيقة والخوارزميات (منهج الخوارزمي)',
      icon: Compass,
      color: '#06b6d4',
      description: 'التجريد المنطقي الصارم، سلامة خوارزميات الحساب، وتصميم معماريات البرمجيات وقواعد البيانات الآمنة.',
      samplePrompt: 'كيف تسهم خوارزميات الجبر والحساب المنطقي للخوارزمي في تصميم بنية حساب العمولات المعقدة وموازين المراجعة؟',
    },
    {
      title: 'التشخيص وحل المشكلات المعقدة (ابن سينا والرازي)',
      icon: Lightbulb,
      color: '#f59e0b',
      description: 'فحص جذور العلل التقنية (Root Cause Analysis) بدلاً من معالجة الأعراض السطحية في النظم الصناعية والسلامة.',
      samplePrompt: 'كيف نطبق منهج التشخيص الشامل للرازي وابن سينا في تتبع أسباب أعطال ضواغط الغاز في محطات كارجاز وحوادث السلامة STOP؟',
    },
    {
      title: 'البحث المقارن والانفتاح العالمي (منهج البيروني)',
      icon: Globe2,
      color: '#8b5cf6',
      description: 'التحري النزيه، الحياد العلمي، وفهم ثقافات وحضارات شعوب العالم في الفنون والرياضة والسياسة.',
      samplePrompt: 'بمنهجية البيروني المقارنة: كيف نقارن بين معايير السلامة المهنية الدولية (OSHA) وثقافة العمل الجماعي في الحضارات المختلفة؟',
    },
    {
      title: 'الفنون والعمارة والجماليات',
      icon: Palette,
      color: '#ec4899',
      description: 'التناغم البصري، النسب الذهبية في التصميم الهندسي وواجهات المستخدم (UI/UX) المستوحاة من العمارة الإسلامية والعالمية.',
      samplePrompt: 'ما هي الروابط الفلسفية بين جماليات الهندسة الإسلامية (الأرابيسك والنسب) وتصميم واجهات وتجربة المستخدم الحديثة؟',
    },
    {
      title: 'الرياضة وتحليلات الأداء التكتيكي',
      icon: Award,
      color: '#3b82f6',
      description: 'علم الحركة، الإحصائيات المتقدمة، التكتيك الرياضي، والروح الرياضية كمنظومة أخلاقية وعلمية.',
      samplePrompt: 'كيف غيرت تحليلات البيانات الضخمة (Expected Goals وHeatmaps) خطط كرة القدم الحديثة؟',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Intro Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              الموسوعة المعرفية ومنهجية كبار علماء المسلمين والعالم
            </h2>
            <p className="text-xs text-indigo-300">
              العلم الأصيل، التحليل الرصين، والانفتاح على آفاق المعرفة الإنسانية المعاصرة
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          يمتاز مساعد شركة عزوتي (تطوير محمد يوسف) بعمق فكري فريد؛ فهو لا يقتصر على كتابة الكود وإدارة التجارة، بل يستحضر رصانة ومنهجية البحث العلمي لكبار فلاسفة وعلماء الحضارة العربية والإسلامية، موظفاً هذا الفكر الرائد للإجابة عن أسئلة الاقتصاد، الدين والتراث، السياسة، الفنون، والرياضة بتوازن وحكمة بالغة.
        </p>
      </div>

      {/* Scholars Pillars */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>ركائز المنهج العلمي في إجابات المساعد الذكي</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCHOLARS_METHODOLOGY.map((scholar, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-emerald-400">{scholar.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {scholar.concept}
                </span>
              </div>

              <blockquote className="text-xs italic text-slate-300 border-r-2 border-emerald-500/50 pr-3 my-2 font-serif">
                "{scholar.quote}"
              </blockquote>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong className="text-slate-300">تطبيق المنهج في المساعد: </strong>
                {scholar.applicationInAssistant}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Multidisciplinary Explorations */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <span>آفاق الاستشارة المعرفية الشاملة (انقر على أي موضوع لاختبار المساعد فورا)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {multidisciplinaryTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="p-2 rounded-xl text-white"
                      style={{ backgroundColor: `${topic.color}25`, color: topic.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">{topic.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <button
                  onClick={() => onAskQuestion(topic.samplePrompt)}
                  className="mt-2 text-right p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-emerald-300 transition group flex items-center justify-between"
                >
                  <span className="truncate max-w-[240px] text-[11px]">{topic.samplePrompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition text-emerald-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

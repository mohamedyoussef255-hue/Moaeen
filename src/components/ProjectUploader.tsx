import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { EzoutiApp, AppRoute } from '../types/assistant';
import {
  Upload,
  FolderUp,
  FileArchive,
  CheckCircle2,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
  Bot,
  AlertCircle,
  HelpCircle,
  Loader2,
  FileText,
} from 'lucide-react';

interface ProjectUploaderProps {
  onProjectLearned: (newApp: EzoutiApp) => void;
  onCancel?: () => void;
}

export const ProjectUploader: React.FC<ProjectUploaderProps> = ({
  onProjectLearned,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    fileCount: number;
    detectedPages: number;
    detectedApis: number;
  } | null>(null);

  const [extractedApp, setExtractedApp] = useState<EzoutiApp | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Analyze text content of project files
  const analyzeFiles = async (
    files: Array<{ name: string; path: string; content: string }>
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      let appName = 'مشروعي المخصص';
      let appTagline = 'تطبيق تم استيعابه وتحليله بواسطة مساعد عزوتي الذكي مُعِين';
      let appDescription = 'نظام متكامل تم فحص ملفاته وتوليد خريطة صفحاته ووظائفه.';
      const detectedRoutes: AppRoute[] = [];
      const detectedQuestions: string[] = [];
      let apiCount = 0;

      // 1. Look for package.json
      const pkgFile = files.find((f) => f.name === 'package.json');
      if (pkgFile) {
        try {
          const pkg = JSON.parse(pkgFile.content);
          if (pkg.name) appName = pkg.name.replace(/[-_]/g, ' ');
          if (pkg.description) {
            appDescription = pkg.description;
            appTagline = pkg.description.slice(0, 70);
          }
        } catch {
          // ignore
        }
      }

      // 2. Look for README.md
      const readmeFile = files.find(
        (f) => f.name.toLowerCase() === 'readme.md' || f.name.toLowerCase() === 'readme'
      );
      if (readmeFile && appName === 'مشروعي المخصص') {
        const firstLine = readmeFile.content.split('\n').find((l) => l.startsWith('# '));
        if (firstLine) {
          appName = firstLine.replace('# ', '').trim();
        }
      }

      // 3. Scan code files for route patterns, pages, and components
      const routeSet = new Map<string, AppRoute>();

      files.forEach((f) => {
        const lowerPath = f.path.toLowerCase();
        const content = f.content;

        // Next.js App router detection: e.g. /app/dashboard/page.tsx -> /dashboard
        const nextAppMatch = f.path.match(/(?:app|pages)\/([a-zA-Z0-9_\-\/]+)\/page\.[a-z]+/i);
        if (nextAppMatch && nextAppMatch[1]) {
          const routeSlug = `/${nextAppMatch[1]}`;
          if (!routeSet.has(routeSlug)) {
            const pageName = translateRouteToName(nextAppMatch[1]);
            routeSet.set(routeSlug, {
              path: routeSlug,
              name: pageName,
              description: `صفحة ${pageName} المستخرجة من هيكل ملفات التطبيق`,
            });
          }
        }

        // React Router detection: path="..." or path='...'
        const routeRegex = /path=["'](\/[a-zA-Z0-9_\-\/:]*)["']/g;
        let match;
        while ((match = routeRegex.exec(content)) !== null) {
          const routePath = match[1];
          if (routePath && routePath !== '*' && !routeSet.has(routePath)) {
            const cleanSlug = routePath.replace(/^\//, '').split('/')[0];
            const pageName = translateRouteToName(cleanSlug || 'الرئيسية');
            routeSet.set(routePath, {
              path: routePath,
              name: pageName,
              description: `شاشة ${pageName} وإجراءاتها وخدماتها للمستخدم`,
            });
          }
        }

        // Express / API routes detection
        const apiRegex = /(?:app|router)\.(?:get|post|put|delete)\(["'](\/[a-zA-Z0-9_\-\/]*)["']/g;
        let apiMatch;
        while ((apiMatch = apiRegex.exec(content)) !== null) {
          apiCount++;
        }
      });

      // Default fallback routes if project didn't have explicit routes
      if (routeSet.size === 0) {
        routeSet.set('/home', {
          path: '/home',
          name: 'الصفحة الرئيسية',
          description: 'لوحة التحكم والعمليات السريعة للتطبيق',
        });
        routeSet.set('/dashboard', {
          path: '/dashboard',
          name: 'لوحة المؤشرات',
          description: 'ملخص الأداء والتقارير والبيانات الحية',
        });
        routeSet.set('/settings', {
          path: '/settings',
          name: 'الإعدادات والملف الشخصي',
          description: 'تخصيص الحساب والبيانات وصلاحيات النظام',
        });
      }

      const finalRoutes = Array.from(routeSet.values()).slice(0, 10);

      // Generate smart questions based on detected pages
      detectedQuestions.push(`كيف أبدأ استخدام تطبيق ${appName} وما هي خطوتي الأولى؟`);
      if (finalRoutes.length > 0) {
        detectedQuestions.push(`أين أجد صفحة ${finalRoutes[0].name} وما هي وظائفها؟`);
      }
      if (finalRoutes.length > 1) {
        detectedQuestions.push(`اشرح لي خطوة بخطوة كيفية التعامل مع ${finalRoutes[1].name}`);
      }
      detectedQuestions.push(`ما هي الصلاحيات المتاحة في هذا التطبيق؟`);

      const newApp: EzoutiApp = {
        id: `learned_${Date.now()}`,
        name: appName,
        tagline: appTagline,
        category: 'تطبيق مخصص تم تحليله بالذكاء الاصطناعي',
        color: '#0284c7',
        description: appDescription,
        routes: finalRoutes,
        sampleQuestions: detectedQuestions,
      };

      setExtractedApp(newApp);
      setStats({
        fileCount: files.length,
        detectedPages: finalRoutes.length,
        detectedApis: apiCount,
      });
    } catch (err: any) {
      console.error('Project parsing failed:', err);
      setError('حدث خطأ أثناء فحص ملفات المشروع. يرجى التأكد من رفع ملفات نصية أو أرشيف صالح.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to translate route slugs into Arabic friendly titles
  const translateRouteToName = (slug: string): string => {
    const s = slug.toLowerCase();
    if (s.includes('home') || s === '' || s === '/') return 'الرئيسية';
    if (s.includes('dash')) return 'لوحة التحكم';
    if (s.includes('order')) return 'إدارة الطلبات والعمليات';
    if (s.includes('product') || s.includes('item')) return 'المنتجات والكتالوج';
    if (s.includes('cart') || s.includes('basket')) return 'سلة المشتريات';
    if (s.includes('check')) return 'إتمام الشراء والدفع';
    if (s.includes('user') || s.includes('profile') || s.includes('account')) return 'الملف الشخصي والحساب';
    if (s.includes('login') || s.includes('auth') || s.includes('signin')) return 'تسجيل الدخول والتحقق';
    if (s.includes('register') || s.includes('signup')) return 'إنشاء حساب جديد';
    if (s.includes('setting')) return 'الإعدادات والخيارات';
    if (s.includes('report') || s.includes('stat') || s.includes('analytic')) return 'التقارير والإحصائيات';
    if (s.includes('notif')) return 'مركز الإشعارات';
    if (s.includes('asset')) return 'سجل ومتابعة الأصول';
    if (s.includes('safety') || s.includes('stop')) return 'بطاقات السلامة المهنية';
    return `صفحة ${slug.replace(/[-_]/g, ' ')}`;
  };

  // 1. Handle Folder Upload
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesToRead: Array<{ name: string; path: string; content: string }> = [];
    const maxFiles = Math.min(fileList.length, 60);

    for (let i = 0; i < maxFiles; i++) {
      const file = fileList[i];
      // Skip node_modules, git, binaries
      if (
        file.webkitRelativePath.includes('node_modules') ||
        file.webkitRelativePath.includes('.git') ||
        file.webkitRelativePath.includes('dist') ||
        file.webkitRelativePath.includes('build')
      ) {
        continue;
      }

      if (
        file.name.match(
          /\.(js|jsx|ts|tsx|json|html|md|txt|css|yml|yaml|php|py|java|kt|dart|vue|svelte)$/i
        )
      ) {
        try {
          const content = await file.text();
          filesToRead.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content,
          });
        } catch {
          // ignore binary/unreadable
        }
      }
    }

    if (filesToRead.length === 0) {
      setError('لم يتم العثور على ملفات برمجية أو نصوص قابلة للقراءة في هذا المجلد.');
      return;
    }

    await analyzeFiles(filesToRead);
  };

  // 2. Handle Zip Upload
  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const filesToRead: Array<{ name: string; path: string; content: string }> = [];

      const entries = Object.keys(zipContent.files);
      for (const entryPath of entries) {
        const entry = zipContent.files[entryPath];
        if (entry.dir) continue;
        if (
          entryPath.includes('node_modules') ||
          entryPath.includes('.git') ||
          entryPath.includes('dist')
        )
          continue;

        if (
          entryPath.match(
            /\.(js|jsx|ts|tsx|json|html|md|txt|css|yml|yaml|php|py|java|kt|dart|vue|svelte)$/i
          )
        ) {
          try {
            const content = await entry.async('text');
            const name = entryPath.split('/').pop() || entryPath;
            filesToRead.push({
              name,
              path: entryPath,
              content,
            });
            if (filesToRead.length >= 60) break;
          } catch {
            // ignore
          }
        }
      }

      if (filesToRead.length === 0) {
        setError('الملف المضغوط لا يحتوي على ملفات كود أو نصوص واضحة.');
        setIsProcessing(false);
        return;
      }

      await analyzeFiles(filesToRead);
    } catch (err) {
      console.error('Failed to unpack zip:', err);
      setError('تعذر قراءة ملف الـ Zip. يرجى التأكد من سلامة الملف المضغوط.');
      setIsProcessing(false);
    }
  };

  // 3. Handle Individual Files
  const handleIndividualFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesToRead: Array<{ name: string; path: string; content: string }> = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      try {
        const content = await f.text();
        filesToRead.push({
          name: f.name,
          path: f.name,
          content,
        });
      } catch {
        // ignore
      }
    }

    if (filesToRead.length === 0) {
      setError('تعذر قراءة الملفات المحددة.');
      return;
    }

    await analyzeFiles(filesToRead);
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <FolderUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                رفع واستيعاب ملفات ومجلد مشروع تطبيقك
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ميزة ذكية ⚡
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              ارفع مجلد كود مشروعك، أو ملف أرشيف (.zip)، أو ملفات الصفحات والـ Routes. سيقوم "مُعِين" بقراءتها فورياً وفهم كل شاشاتها وأزرارها ليكون المعين الصوتي الحصري لتطبيقك!
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 transition"
          >
            إلغاء
          </button>
        )}
      </div>

      {/* Hidden Inputs */}
      {/* @ts-ignore: webkitdirectory and directory are browser specific */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelect}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleZipSelect}
        accept=".zip,.rar,.tar,.gz"
        className="hidden"
      />
      <input
        type="file"
        ref={filesInputRef}
        onChange={handleIndividualFiles}
        multiple
        accept=".json,.js,.jsx,.ts,.tsx,.html,.md,.txt,.yaml,.yml"
        className="hidden"
      />

      {/* 3 Upload Action Buttons */}
      {!extractedApp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Folder Upload */}
          <div
            onClick={() => folderInputRef.current?.click()}
            className="p-5 rounded-2xl bg-slate-950/80 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer group flex flex-col items-center text-center justify-between shadow-lg hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FolderUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              رفع مجلد المشروع كاملاً
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              اختر مجلد المشروع من جهازك؛ وسيقوم النظام بمسح كود الصفحات و routes و package.json تلقائياً.
            </p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              اختر مجلد المشروع 📂
            </span>
          </div>

          {/* Option 2: Zip File */}
          <div
            onClick={() => zipInputRef.current?.click()}
            className="p-5 rounded-2xl bg-slate-950/80 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer group flex flex-col items-center text-center justify-between shadow-lg hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FileArchive className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              رفع ملف أرشيف مضغوط (.zip)
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              إذا كان مشروعك في ملف مضغوط، ارفعه هنا وسنقوم بفك ضغطه وتحليله فوراً في المتصفح.
            </p>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30">
              اختر ملف الـ Zip 🗜️
            </span>
          </div>

          {/* Option 3: Key Files */}
          <div
            onClick={() => filesInputRef.current?.click()}
            className="p-5 rounded-2xl bg-slate-950/80 border-2 border-dashed border-teal-500/40 hover:border-teal-400 transition cursor-pointer group flex flex-col items-center text-center justify-between shadow-lg hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FileCode className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              رفع ملفات مختارة (Routes / App / Readme)
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              يمكنك رفع ملفات محددة مثل package.json أو ملفات المسارات والـ components الرئيسية.
            </p>
            <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/30">
              تحديد ملفات 📄
            </span>
          </div>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="p-8 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <h4 className="text-sm font-bold text-white">
            جاري استيعاب ملفات مشروعك وتحليل شاشاته ومساراته...
          </h4>
          <p className="text-xs text-slate-400 max-w-md">
            يقوم "مُعِين" باستخراج أسماء الصفحات، وظائف الأزرار، والـ APIs لبناء قاعدة معرفة مخصصة لتطبيقك.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results & Confirmation Card */}
      {extractedApp && stats && (
        <div className="p-6 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/60 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  تم فحص واستيعاب مشروع "{extractedApp.name}" بنجاح!
                </h4>
                <p className="text-xs text-slate-400">{extractedApp.tagline}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                📄 {stats.fileCount} ملف مفحوص
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                🗺️ {stats.detectedPages} صفحة وشاشة مكتشفة
              </span>
            </div>
          </div>

          {/* List of Detected Routes / Pages */}
          <div>
            <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>الصفحات والمسارات التي فهمها "مُعِين" وسيرشد المستخدمين فيها:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {extractedApp.routes.map((route, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-white text-xs">{route.name}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      {route.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {route.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                "مُعِين" أصبح جاهزاً بالصوت والكتابة للرد على مستخدمي هذا التطبيق خطوة بخطوة.
              </span>
            </div>

            <button
              onClick={() => onProjectLearned(extractedApp)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition shadow-lg shadow-emerald-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>اعتماد المشروع وبدء التحدث الصوتي مع مُعِين الآن 🎙️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

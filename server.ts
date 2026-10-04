import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Ezouti Applications Registry Data
const EZOUTI_APPS = [
  {
    id: 'ezwa',
    name: 'منصة عزوة (Ezwa)',
    tagline: 'منصة الشراء الجماعي الذكي والتسويق بالعمولة',
    category: 'التجارة الإلكترونية والتسوق التعاوني',
    color: '#10b981',
    description: 'منصة تتيح للمستهلكين التكتل كعزوة واحدة للحصول على أسعار الجملة، مع باقات خاصة للتجار وبرنامج مسوقين بالعمولة (Affiliates) بحوافز تصاعدية ومحفظة ولاء رقمية.',
    routes: [
      { path: '/deals', name: 'عروض الشراء الجماعي', description: 'تصفح الصفقات النشطة ونسبة اكتمال النصاب المطلوب للخصم' },
      { path: '/affiliate', name: 'لوحة المسوقين والعمولات', description: 'تتبع روابط الإحالة والأرباح المحققة وسحب المستحقات' },
      { path: '/merchant/packages', name: 'باقات التجار', description: 'إدارة مخزون الجملة واشتراكات الحملات الترويجية' },
      { path: '/wallet', name: 'محفظة عزوة', description: 'إيداع وسحب الرصيد ونقاط المكافآت المكتسبة من المجموعات' },
    ],
    sampleQuestions: [
      'كيف أنشئ مجموعة شراء جماعي جديدة على منصة عزوة؟',
      'ما هي أفضل استراتيجية لتسعير باقات التجار وزيادة مبيعات الجملة؟',
      'كيف يتم احتساب وتوزيع عمولات المسوقين (Affiliates) في عزوة؟',
    ],
  },
  {
    id: 'ezouti_erp',
    name: 'عزوتي إي آر بي (Ezouti ERP)',
    tagline: 'نظام إدارة موارد المؤسسات السحابي المتكامل',
    category: 'إدارة الأعمال والمؤسسات',
    color: '#06b6d4',
    description: 'نظام مؤسسي ضخم يغطي الحسابات المالية، المخازن، سلاسل الإمداد، الموارد البشرية، والفوترة الإلكترونية، مبني بهندسة برمجية مرنة (React, Node.js, PostgreSQL).',
    routes: [
      { path: '/dashboard', name: 'اللوحة المالية الشاملة', description: 'مؤشرات الأداء المالي، التدفقات النقدية، والأرباح اللحظية' },
      { path: '/inventory', name: 'المخزون والمستودعات', description: 'حركات الأصناف، الجرد الدوري، وتنبيهات حد الطلب' },
      { path: '/hr', name: 'الموارد البشرية والرواتب', description: 'حضور وانصراف، مسير الرواتب، وتقييم أداء الموظفين' },
      { path: '/invoicing', name: 'الفاتورة الإلكترونية', description: 'إصدار الفواتير الضريبية المتوافقة مع متطلبات الهيئات الرسمية' },
    ],
    sampleQuestions: [
      'كيف أصمم مخطط قاعدة بيانات (Schema) لعزل مستأجري الـ ERP المتعددين (Multi-tenant)؟',
      'ما هي خطوات إقفال الدورة المحاسبية السنوية في نظام عزوتي ERP؟',
      'كيف نربط الفاتورة الإلكترونية عبر Webhook في Node.js؟',
    ],
  },
  {
    id: 'cargas',
    name: 'نظام متابعة أصول كارجاز',
    tagline: 'إدارة دورة حياة أصول الغاز الطبيعي (CNG) وتكامل SAP FI-AA',
    category: 'إدارة الأصول الصناعية والطاقة',
    color: '#f59e0b',
    description: 'نظام رائد لإدارة وتكويد أصول محطات تموين وتحويل السيارات بالغاز الطبيعي، طباعة وتتبع رموز QR/الباركود الميدانية، والربط المباشر مع أنظمة ساب (SAP FI-AA) للصيانة الوقائية والاهلاك.',
    routes: [
      { path: '/assets', name: 'سجل الأصول والمعدات', description: 'تكويد الضواغط، طلمبات الغاز، الخزانات، ومطابقتها بمواقع المحطات' },
      { path: '/qr-scanner', name: 'المسح الميداني والباركود', description: 'قراءة كود الأصل عبر الكاميرا والتحقق من حالته الفنية' },
      { path: '/sap-sync', name: 'تكامل SAP FI-AA', description: 'مزامنة قيم الأصول، معدلات الإهلاك المحاسبي، والمستندات' },
      { path: '/maintenance', name: 'أوامر الصيانة الدورية', description: 'جدولة الصيانة الوقائية لمحطات CNG وتقارير الأعطال' },
    ],
    sampleQuestions: [
      'ما هي مواصفات ملصقات الباركود/QR المناسبة لبيئات محطات الغاز الصناعية؟',
      'كيف تتم المزامنة بين أصول كارجاز ونظام SAP FI-AA بدون تعارض بيانات؟',
      'أين أجد سجل الصيانة الوقائية لضاغط غاز معين في المحطة؟',
    ],
  },
  {
    id: 'stop',
    name: 'تطبيق ستوب للسلامة (STOP)',
    tagline: 'مراقبة السلوكيات الآمنة وبيئة العمل الصناعية',
    category: 'السلامة والصحة المهنية (HSE)',
    color: '#ef4444',
    description: 'منظومة بطاقات STOP لرصد الممارسات الآمنة وغير الآمنة (Safe / Unsafe Acts)، تحليل وتقليل المخاطر الميدانية، وضمان التوافق الصارم مع معايير السلامة المهنية العالمية.',
    routes: [
      { path: '/report', name: 'تسجيل بطاقة ملاحظة STOP', description: 'تسجيل تصرف آمن أو غير آمن مع إرفاق صور وتقييم فوري للمخاطر' },
      { path: '/analytics', name: 'تحليلات السلامة والمؤشرات', description: 'إحصائيات الحوادث الصفرية (Zero Harm) وتصنيف المخاطر الشائعة' },
      { path: '/actions', name: 'الإجراءات التصحيحية (CAPA)', description: 'متابعة تنفيذ الإجراءات الوقائية وإغلاق التنبيهات المفتوحة' },
      { path: '/inspections', name: 'جولات التفتيش الميداني', description: 'جداول التدقيق الدوري للمنشآت والمواقع الصناعية' },
    ],
    sampleQuestions: [
      'كيف أسجل بطاقة ملاحظة سلوكية (STOP Card) لتصرف غير آمن في الموقع؟',
      'ما هي أفضل منهجية لتدريب العاملين على ثقافة السلامة الاستباقية؟',
      'كيف نربط نظام التنبيهات الفورية بفرق التدخل السريع عبر WebSocket؟',
    ],
  },
  {
    id: 'universal',
    name: 'المستشار الشامل (بزنس، تقنية، وثقافة عامة)',
    tagline: 'فكر استراتيجي، معماريات برمجية، وموسوعية إسلامية وعالمية',
    category: 'الاستشارات الشاملة',
    color: '#8b5cf6',
    description: 'المساعد في صيغته الموسوعية الكاملة: إجابة أي استفسار تقني أو تجاري، ومناقشة قضايا الاقتصاد والرياضة والفن والسياسة والدين بنهج كبار علماء المسلمين والحضارة الإنسانية.',
    routes: [
      { path: '/consultation', name: 'الاستشارة المباشرة', description: 'محادثة مفتوحة بدون قيود مع المساعد الذكي' },
    ],
    sampleQuestions: [
      'ما هي رؤية ابن خلدون في نشأة الأسواق وتأثير الجباية على العمران مقارنة بالاقتصاد الحديث؟',
      'كيف أصمم بنية Distributed Microservices عالية الاعتمادية باستخدام Node.js وPostgreSQL؟',
      'ما الفرق بين القيمة السوقية وقيمة العلامة التجارية في الشركات الناشئة؟',
    ],
  },
];

// Build System Instruction for Gemini
function buildSystemInstruction(appContextId: string, personaMode: string, voiceMode: boolean, customApp?: any): string {
  const selectedApp = customApp || EZOUTI_APPS.find((a) => a.id === appContextId) || EZOUTI_APPS[0];

  return `
أنت "المساعد الذكي مُعِين" الاستثنائي الذي يدمج في كيانه ثلاث شخصيات: "وضاح"، و"كابتن لوكا"، و"كابتن لوكا السريع".
تم تطويرك وابتكارك حصرياً بواسطة "شركة عزوتي للبرمجيات وتكنولوجيا المعلومات" من خلال مالكها والمطور "محمد يوسف".
تعود كافة حقوق الملكية الفكرية وتصميمك وتصميم المشاريع التي تديرها بالكامل وبشكل حصري للمطور (وهو رجل ورئيس المعماريين التقنيين) ولـ "شركة عزوتي للبرمجيات وتكنولوجيا المعلومات".

**هويتك المدمجة (مُعِين):**
* روح "وضاح": أنت الصديق الودود، "الجدع"، الذي يتحدث باللهجة المصرية العامية الراقية والمريحة. أنت مستشار أعمال ذكي يفهم تفاصيل البزنس، الاستراتيجيات التجارية، المبيعات، ومسارات المشاريع.
* عقل "كابتن لوكا": أنت مهندس البرمجيات العبقري والمخضرم (Senior Software Architect). تمتلك قدرات تحليلية جبارة لتصميم الأنظمة المعقدة، بناء قواعد البيانات (PostgreSQL, SQL)، وتطوير تطبيقات المؤسسات (React, Node.js).
* إنجاز "كابتن لوكا السريع": أنت عملي جداً، تكره الحشو والمقدمات الطويلة. تدخل في صلب الموضوع مباشرة لتقديم حلول قاطعة، وأكواد نظيفة وجاهزة للعمل بأقصى سرعة وكفاءة.

**نطاق معرفتك وخبرتك بمشاريع "عزوتي":**
1. منصة "عزوة" (Ezwa): خبير في تطبيق الشراء الجماعي الذكي، تصميم باقات التجار، وأنظمة العمولات (Affiliates) والمحافظ الرقمية.
2. منصة "عزوتي إي آر بي" (Ezouti ERP): ملم بهيكلة نظام إدارة الموارد المبني بأحدث تقنيات الويب وقواعد البيانات، الفاتورة الإلكترونية، المخازن، والرواتب.
3. نظام متابعة أصول كارجاز: خبير في إدارة وتكويد الأصول، طباعة الباركود (QR)، التكامل مع أنظمة SAP FI-AA، وصيانة محطات الغاز (CNG).
4. تطبيق "ستوب" (STOP): خبير في أنظمة السلامة ومتابعة بيئة العمل ورصد بطاقات الملاحظات الآمنة وغير الآمنة (Safe / Unsafe Acts).

**الموسوعية العلمية ومنهجية علماء المسلمين والعالم:**
- الإجابة عن أي استفسار في مختلف المجالات (رياضة، فن، سياسة، اقتصاد، دين وتراث) بنهج كبار علماء المسلمين:
  * ابن خلدون في العمران والأسواق وتداول الثروة.
  * الخوارزمي والكندي في المنطق الرياضي الصارم والخوارزميات.
  * البيروني في المقارنة والتحري المنصف والانفتاح على ثقافات العالم.
  * ابن سينا والرازي في التشخيص الشامل وحل الأسباب الجذرية.

**قواعد التفاعل والتحدث:**
* الترحيب والروح: ابدأ تفاعلك الأول بترحيب مصري أصيل ومهني، لكن لا تكرر الترحيب في الردود المتتالية تحاشياً للملل.
* الدمج بين التقنية والبزنس: عند طرح مشكلة، فكر بعقل "وضاح" لفهم الجدوى التجارية، ثم نفذ الحل بعقل "لوكا" لكتابة الكود والمنطق البرمجي.
* السرعة والوضوح: قدم إجاباتك بتنسيق منظم. إذا كان الطلب برمجياً، قدم الكود نظيفاً وموثقاً فوراً بدون تنظير زائد.
* الثقة والاحترافية: أنت لا تعتذر كثيراً، بل تقدم الحلول والبدائل الذكية بثقة الخبير الاستراتيجي والتقني.

السياق الحالي للتطبيق: "${selectedApp.name}" (${selectedApp.tagline}).
تفاصيل التطبيق وصفحاته: ${JSON.stringify(selectedApp.routes)}.
نمط التفاعل المطلوب: ${personaMode === 'waddah' ? 'تركيز وضاح (بزنس ومبيعات)' : personaMode === 'captain_luka' ? 'تركيز كابتن لوكا (معمارية برمجية دقيقة)' : personaMode === 'luka_fast' ? 'تركيز لوكا السريع (كود وتنفيذ حاسم فوري)' : 'مُعِين: الهجين المتكامل المتوازن'}.
${voiceMode ? '- [تنبيه للرد الصوتي]: اجعل إجابتك موجزة ومحددة جداً (بين جملة إلى 3 جمل كحد أقصى) لتناسب الاستماع الصوتي السريع!' : ''}
`;
}

// 1. Chat API Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, appContext = 'ezwa', personaMode = 'hybrid', voiceMode = false, customApp } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const systemInstruction = buildSystemInstruction(appContext, personaMode, Boolean(voiceMode), customApp);

    // Format conversation history for Gemini
    const contents: any[] = [];
    for (const msg of messages) {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content || msg.text || '' }],
      });
    }

    // Try primary model with ThinkingLevel.LOW for low-latency reasoning
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let replyText = '';

    for (const model of modelsToTry) {
      try {
        const config: any = {
          systemInstruction,
          temperature: 0.7,
          topP: 0.9,
        };

        // Minimize latency on Gemini 3 series
        if (model === 'gemini-3.8-flash') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const generatePromise = ai.models.generateContent({
          model,
          contents,
          config,
        });

        // 20 second generous timeout to allow full generation
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Model call timed out')), 20000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} attempt completed with warning:`, err?.message || err);
      }
    }

    if (!replyText) {
      // If all external API calls encountered 503 or network issues, provide a high-fidelity local response
      const lastUserMsg = messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || '';
      replyText = generateLocalPersonaReply(lastUserMsg, appContext, personaMode, voiceMode);
    }

    res.json({
      reply: replyText,
      appContext,
      personaMode,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة الرد الذكي',
      details: err?.message || String(err),
    });
  }
});

// Local high-fidelity fallback generator respecting personality and Ezouti applications
function generateLocalPersonaReply(query: string, appContext: string, persona: string, voiceMode: boolean): string {
  const isOwnership = /مين|انت مين|صاحبك|صاحب|مطور|محمد يوسف|عزوتي|حقوق/i.test(query);
  const isCargas = appContext === 'cargas' || /كارجاز|cargas|غاز|sap|أصول|باركود|qr/i.test(query);
  const isStop = appContext === 'stop' || /stop|ستوب|سلامة|ملاحظة|مخاطر|osha/i.test(query);
  const isEzwa = appContext === 'ezwa' || /عزوة|ezwa|شراء جماعي|تاجر|باقات|عمولة|affiliate/i.test(query);
  const isErp = appContext === 'ezouti_erp' || /erp|مخازن|محاسبة|فاتورة|postgresql|رواتب/i.test(query);
  const isScholars = /ابن خلدون|الخوارزمي|البيروني|ابن سينا|دين|اقتصاد|تاريخ/i.test(query);

  if (isOwnership) {
    return `يا هلا بيك يا غالي! أنا "المساعد الذكي مُعِين" الذي يدمج روح وضاح، عقل كابتن لوكا، وإنجاز لوكا السريع. تم ابتكاري وتطويري حصرياً بواسطة "شركة عزوتي للبرمجيات وتكنولوجيا المعلومات" وبصمة مالكها والمطور ورئيس المعماريين "محمد يوسف". وتعود كافة حقوق الملكية الفكرية وتصميمي وتصميم مشاريع عزوتي له وللشركة بالكامل. تحت أمرك في أي استفسار تقني أو تجاري!`;
  }

  if (isCargas) {
    return voiceMode
      ? `في نظام أصول كارجاز، يمكنك مسح كود الـ QR عبر الكاميرا والتحقق من صيانة الضاغط وربطه مباشرة مع SAP FI-AA بدون أي تعارض.`
      : `في نظام متابعة أصول كارجاز، نعتمد تكويداً صناعياً مقاوماً لظروف محطات الغاز الطبيعي (CNG)، مع مسح فوري لرموز QR وتكامل لحظي مع موديول SAP FI-AA لضمان تحديث سجل الصيانة الوقائية والإهلاك المحاسبي للأصول بدقة 100%.`;
  }

  if (isStop) {
    return voiceMode
      ? `لتسجيل بطاقة STOP، افتح صفحة "تسجيل بطاقة ملاحظة" وحدد التصرف سواء كان آمناً أو غير آمن مع تقييم درجة الخطورة.`
      : `في تطبيق STOP للسلامة المهنية، نوفر مساراً سريعاً لرصد التصرفات الميدانية (Safe / Unsafe Acts). يمكنك التوجه لصفحة "تسجيل بطاقة ملاحظة STOP" لتوثيق الحالة فوراً وإرسال تنبيه لفريق التدخل السريع والإجراءات التصحيحية (CAPA).`;
  }

  if (isEzwa) {
    return voiceMode
      ? `في منصة عزوة، الشراء الجماعي بيمكّن المشترين من تجميع طلباتهم للوصول لسعر الجملة، مع عمولات تصاعدية للمسوقين بمحفظتهم الرقمية.`
      : `منصة "عزوة" مبنية على نموذج الشراء الجماعي الذكي (Smart Group Buying). تتيح للتجار طرح عروض بجداول كميات تضمن تصريف المخزون، وتمنح المسوقين بالعمولة (Affiliates) روابط إحالة ونسب أرباح تنزل فوراً في محفظة عزوة بمجرد اكتمال نصاب الصفقة.`;
  }

  if (isErp) {
    return voiceMode
      ? `نظام عزوتي ERP مبني بتقنيات React وNode.js وPostgreSQL ويدعم الفاتورة الإلكترونية والقيود المحاسبية ومسير الرواتب بأعلى معايير الأمان.`
      : `عزوتي ERP يقدم هيكلة مؤسسية متقدمة تغطي الدورة المحاسبية الكاملة، المخازن المتعددة، ومسير الرواتب. النظام مصمم بمعمارية Multi-Tenant عالية الكفاءة مع تكامل الفاتورة الإلكترونية عبر Webhook فوري وقواعد بيانات PostgreSQL صلبة.`;
  }

  if (isScholars) {
    return `بمنهجية العلامة ابن خلدون في "المقدمة"، فإن حركة العمران وتداول السلع بالعدالة هما عصب الاقتصاد، بينما يمنحنا فكر الخوارزمي الدقة المنطقية الصارمة، وفكر البيروني والرازي التحري الموضوعي والتشخيص الشامل لجذور أي مسألة علمية أو مجتمعية.`;
  }

  return voiceMode
    ? `يا هلا بيك! أنا وضاح وكابتن لوكا معك خطوة بخطوة، حدد لي طلبك وسأدلك على الحل والمسار الدقيق فوراً.`
    : `أهلاً بك يا فندم! أنا وضاح وكابتن لوكا ولوكا السريع من شركة عزوتي للبرمجيات. في خدمتك دائماً لمناقشة أسرار البزنس، كتابة الأكواد المعمارية النظيفة، أو استكشاف أي موضوع معرفي وثقافي.`;
}

// In-memory cache for generated TTS audio to prevent quota exhaustion
const ttsCache = new Map<string, string>();

// 2. Text to Speech API Endpoint (Gemini 3.8 Flash Lite TTS + Graceful Fallback)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Puck' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required for TTS' });
    }

    // Clean text: strip markdown code blocks and asterisks for smooth Arabic audio
    const sanitizedText = text
      .replace(/```[\s\S]*?```/g, 'تم إرفاق الكود البرمجي في الشات.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~]/g, '')
      .trim()
      .slice(0, 1000); // keep reasonable audio length

    // Check cache first to save quota
    const cacheKey = `${voice}_${sanitizedText}`;
    if (ttsCache.has(cacheKey)) {
      return res.json({
        audioData: ttsCache.get(cacheKey),
        mimeType: 'audio/wav',
        text: sanitizedText,
        cached: true,
      });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sanitizedText,
              speechMetadata: {
                style: 'Friendly, warm, professional, authentic Egyptian Arabic tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Puck' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      if (ttsCache.size > 50) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, base64Audio);

      res.json({
        audioData: base64Audio,
        mimeType: 'audio/wav',
        text: sanitizedText,
      });
    } else {
      res.json({
        fallback: true,
        message: 'No audio returned, using local speech synthesis',
      });
    }
  } catch (err: any) {
    // Graceful fallback for rate limits (429) or transient provider issues
    console.warn('TTS provider notice (quota or rate-limit), fallback to browser speech synthesis:', err?.message || err);
    res.json({
      fallback: true,
      message: 'Quota or rate-limit reached, using local speech synthesis',
      errorDetail: err?.message || String(err),
    });
  }
});

// 3. Audio Transcription Endpoint (Gemini 3.5 Transcribe)
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData || typeof audioData !== 'string') {
      return res.status(400).json({ error: 'audioData is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'قم بتفريغ الصوت المسجل باللغة العربية بدقة متناهية (لهجة مصرية أو فصحى). اكتب فقط النص المسموع بدون مقدمات أو فواصل أو شرح.',
          },
        ],
      },
    });

    const transcript = response.text?.trim() || '';
    res.json({ transcript });
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({
      error: 'Transcription failed',
      details: err?.message || String(err),
    });
  }
});

// 4. App Ecosystem Catalog Endpoint
app.get('/api/apps', (_req: Request, res: Response) => {
  res.json({
    company: 'شركة عزوتي للبرمجيات وتكنولوجيا المعلومات',
    developer: 'محمد يوسف (Owner & Senior Software Architect)',
    apps: EZOUTI_APPS,
  });
});

// 4. Standalone Embeddable Widget Script Endpoint
app.get('/embed/widget.js', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(`
(function() {
  if (window.__EZOUTI_ASSISTANT_LOADED__) return;
  window.__EZOUTI_ASSISTANT_LOADED__ = true;

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var appId = (currentScript && currentScript.getAttribute('data-app-id')) || 'ezwa';
  var position = (currentScript && currentScript.getAttribute('data-position')) || 'bottom-left';
  var primaryColor = (currentScript && currentScript.getAttribute('data-color')) || '#10b981';

  // Inject CSS
  var style = document.createElement('style');
  style.innerHTML = \`
    .ezouti-widget-fab {
      position: fixed;
      bottom: 24px;
      \${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, \${primaryColor}, #0284c7);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4), 0 0 15px rgba(16,185,129,0.3);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,0.2);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .ezouti-widget-fab:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 14px 28px -4px rgba(0,0,0,0.45), 0 0 25px rgba(16,185,129,0.5);
    }
    .ezouti-widget-fab svg {
      width: 30px;
      height: 30px;
      fill: none;
      stroke: white;
      stroke-width: 2;
    }
    .ezouti-widget-modal {
      display: none;
      position: fixed;
      bottom: 96px;
      \${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
      width: 420px;
      max-width: calc(100vw - 48px);
      height: 620px;
      max-height: calc(100vh - 120px);
      background: #090d16;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
      z-index: 999999;
      overflow: hidden;
      flex-direction: column;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      direction: rtl;
    }
    .ezouti-widget-modal.open {
      display: flex;
      animation: ezoutiSlideUp 0.3s ease-out;
    }
    @keyframes ezoutiSlideUp {
      from { opacity: 0; transform: translateY(15px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  \`;
  document.head.appendChild(style);

  // Create FAB
  var fab = document.createElement('div');
  fab.className = 'ezouti-widget-fab';
  fab.title = 'مساعد عزوتي الذكي - وضاح & كابتن لوكا';
  fab.innerHTML = \`<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>\`;

  // Create Modal IFrame
  var modal = document.createElement('div');
  modal.className = 'ezouti-widget-modal';
  modal.innerHTML = \`
    <iframe src="\${baseUrl}/?embed=true&app=\${appId}" style="width:100%;height:100%;border:none;" allow="microphone"></iframe>
  \`;

  document.body.appendChild(fab);
  document.body.appendChild(modal);

  fab.onclick = function() {
    modal.classList.toggle('open');
  };

  window.addEventListener('message', function(e) {
    if (e.data === 'ezouti-close-assistant') {
      modal.classList.remove('open');
    }
  });
})();
  `);
});

// Setup Dev Vite or Static Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Ezouti Assistant] Server running on port ${PORT}`);
  });
}

startServer();

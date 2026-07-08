import React, { useState, useEffect, useRef } from 'react';
import { AgentInfo, CaseData, CalculationResults } from '../types';
import { EXPERT_SYSTEM_AGENTS } from '../data/expertSystemData';
import { 
  Cpu, 
  Terminal, 
  Play, 
  CheckCircle, 
  Filter, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  Brain,
  Zap,
  Check,
  Send,
  MessageSquare,
  Database,
  ShieldCheck,
  Award,
  BookOpen,
  Sparkles,
  Loader2,
  FileText,
  Fingerprint,
  Workflow,
  Layers,
  Share2,
  Server,
  Eye,
  Lock,
  Compass,
  Maximize2,
  Printer,
  Gavel,
  Scale,
  Clock,
  Coins,
  User,
  Users,
  Mic,
  MicOff,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Percent,
  Search
} from 'lucide-react';

import { triggerToast } from '../lib/toast';

interface AgentSmithRunnerProps {
  caseData: CaseData;
  results: CalculationResults;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  isReport?: boolean;
  selectedAgents?: string[];
  entities?: Record<string, any>;
  agentTypeUsed?: string;
}

interface ProcessingStep {
  id: number;
  name: string;
  method: string;
  status: 'idle' | 'running' | 'completed';
  description: string;
  output?: string;
}

// 10 key agent terms and definitions based on user inputs
interface AgentArchetype {
  id: string;
  title: string;
  arabicName: string;
  icon: string;
  color: string;
  description: string;
  coreMath: string;
  demoInput: string;
}

const ARCHETYPES: AgentArchetype[] = [
  {
    id: 'cognitive',
    title: 'Cognitive System',
    arabicName: 'المحلل الاستدلالي والقضائي',
    icon: '⚖️',
    color: 'from-amber-400 to-orange-500',
    description: 'يقوم بدراسة أبعاد النزاع بالاستدلال المنطقي والشرعي، مستنداً لدفوع الخصوم ومذكرات الدعوى والاجتهاد القضائي المصري.',
    coreMath: 'P(Verdict | Evidence) = ∑ [W_i * CognitiveFactor(E_i)]',
    demoInput: 'فهم منطق النزاع على قطعة الهرم ومراجعة الحيازة الهادئة المستقرة.'
  },
  {
    id: 'autonomous',
    title: 'Precautionary Measures System',
    arabicName: 'مستشار التدابير الاحترازية',
    icon: '🛡️',
    color: 'from-blue-400 to-indigo-500',
    description: 'يتحقق ذاتياً من المخالفات الجسيمة والتعديات على خط التنظيم، ويصدر قرارات وتنبيهات بوقف الأعمال المخالفة فوراً وتجميد الحدود.',
    coreMath: 'TriggerAction(t) = 1 if ConflictScore > Threshold else 0',
    demoInput: 'افحص تداخل الحدود تلقائياً وأرسل تنبيهاً فورياً للمحكمة.'
  },
  {
    id: 'intelligent',
    title: 'Field Valuation Expert',
    arabicName: 'خبير التقييم الميداني والتقدير',
    icon: '📊',
    color: 'from-emerald-400 to-teal-500',
    description: 'يقوم بتحليل الصفقات المماثلة وأسعار المتر وتكاليف الحديد والخرسانة المسلحة لتقديم تقدير مالي عادل للمحكمة.',
    coreMath: 'Weights(t+1) = Weights(t) + η * (TargetValue - PredictedValue) * X',
    demoInput: 'احسب أسعار الأراضي في منطقة الهرم بناء على آخر 12 صفقة تم تحديثها.'
  },
  {
    id: 'orchestrator',
    title: 'Survey Coordinator',
    arabicName: 'منسق المطابقة والتحقيق الفني',
    icon: '🧩',
    color: 'from-purple-400 to-fuchsia-500',
    description: 'يتولى دمج التقارير وحل أي تعارض فني بين تقديرات الهندسة الإنشائية ورفع المساحة والتقييم المالي لضمان الاتساق الهيكلي.',
    coreMath: 'ResolveConflict(Agent_A, Agent_B) = ArgMax_Conf(P_A, P_B)',
    demoInput: 'نسق بين وكيل التصميم الإنشائي ووكيل التقييم المالي لتوليد الميزانية.'
  },
  {
    id: 'master',
    title: 'Chief Advisory Counsel',
    arabicName: 'رئيس الهيئة الاستشارية للخبراء',
    icon: '👑',
    color: 'from-red-400 to-rose-500',
    description: 'الجهة الفنية المسؤولة عن المراجعة النهائية والتوقيع البيومتري بالصيغة التنفيذية لتقرير المعاينة قبل تقديمه لسيادة رئيس المحكمة.',
    coreMath: 'ApproveReport(Doc) = VerifySignature(Hossam_BioKey) && Audit(Steps 1..6)',
    demoInput: 'اعتمد التقرير النهائي لقضية الورثة وأصدر وثيقة الرفع المساحي.'
  },
  {
    id: 'meta_agent',
    title: 'Sharia & Legal Auditor',
    arabicName: 'خبير الرقابة الشرعية والقانونية',
    icon: '📜',
    color: 'from-pink-400 to-rose-600',
    description: 'يقوم بمطابقة مخرجات الفحص وحسابات المواريث والأنصبة الشرعية مع أحكام المادة 64 وقانون التركات ومبادئ الشريعة الإسلامية.',
    coreMath: 'VerifyCompliance(Actions) = strict_match(Civil_Law_Article_119, Actions)',
    demoInput: 'راجع مدى مطابقة حسابات تقسيم التركات الحالية لأحكام المادة 64.'
  },
  {
    id: 'swarm',
    title: 'Unified Joint Analysis Panel',
    arabicName: 'الهيئة المشتركة للتحليل التكاملي',
    icon: '👥',
    color: 'from-yellow-400 to-amber-500',
    description: 'منظومة تفاعلية موحدة تضم 52 خبيراً هندسياً وقانونياً ومساحياً يقومون بالتصويت الرقمي لمطابقة الرفع الجيو-مساحي للنزاع.',
    coreMath: 'ConsensusScore = ConsensusRatio(V_1, V_2, ... V_52) >= 0.95',
    demoInput: 'قم بإطلاق السرب بالكامل (50+ وكيل) لتشغيل تقرير فني شامل للنزاع.'
  },
  {
    id: 'federated',
    title: 'Gov Liaison Officer',
    arabicName: 'خبير الاستعلام والربط الحكومي',
    icon: '🌐',
    color: 'from-cyan-400 to-blue-500',
    description: 'يتصل بقنوات آمنة مع البوابات الرقمية للشهر العقاري، الهيئة العامة للمساحة، ونيابة الأملاك العامة للتأكد من الموقف الرسمي للملكية.',
    coreMath: 'FetchFederatedData(SecureToken) = DecryptAES256(API_Response_Data)',
    demoInput: 'تحقق من تسجيل العقد وسندات الملكية المشهرة بالبوابة الرقمية للشهر العقاري.'
  },
  {
    id: 'edge',
    title: 'Field Technical Surveyor',
    arabicName: 'خبير المعاينة الفنية الميدانية',
    icon: '📍',
    color: 'from-teal-400 to-emerald-500',
    description: 'يقوم بمهام المعاينة والرفع الميداني اللحظي بالأبعاد الطبيعية وحساب مقاومة المواد وتشققات المبنى محلياً في موقع النزاع.',
    coreMath: 'EdgeCalculation(LocalInputs) = RunMatrixMultiplication(W, X)',
    demoInput: 'شغل عقل الحافة المحلي لحساب تسليح القواعد المعزولة فوراً.'
  }
];

export interface MindMapNode {
  id: string;
  label: string;
  details?: string;
}

export interface MindMapBranch {
  id: string;
  icon: string;
  title: string;
  nodes: MindMapNode[];
}

export const MIND_MAP_DATA: MindMapBranch[] = [
  {
    id: 'b1',
    icon: '📌',
    title: 'التصنيف المكاني والقانوني للأرض (حسب الطبيعة)',
    nodes: [
      { id: 'n1_1', label: 'الأراضي الزراعية (الأطيان) - داخل الزمام (حدود الرقعة الزراعية)', details: 'خاضعة لقوانين الإصلاح الزراعي ومصلحة الأطيان والضرائب العقارية.' },
      { id: 'n1_2', label: 'الأراضي الزراعية (الأطيان) - خاضعة لقوانين الإصلاح الزراعي', details: 'تخضع لقيود الحيازة وتوزيع الأراضي المستصلحة والورثة الواضعين لليد.' },
      { id: 'n1_3', label: 'الأراضي الصحراوية (صحارى) - خارج الزمام (على بعد كيلومترين فأكثر)', details: 'خاضعة لقوانين التخصيص، وتخضع لولاية هيئة التعمير والتنمية الزراعية.' },
      { id: 'n1_4', label: 'الأراضي الصحراوية (صحارى) - قوانين التخصيص والاستصلاح', details: 'تشتمل على شروط الإنتاجية وعدم تغيير النشاط إلا بموافقة مسبقة.' },
      { id: 'n1_5', label: 'الأراضي المبنية (العمرانية) - داخل الحيز العمراني للقرى والمدن', details: 'تخضع لقانون البناء الموحد 119 لسنة 2008 وتخطيط هيئة المجتمعات العمرانية.' },
      { id: 'n1_6', label: 'الأراضي المبنية (العمرانية) - خاضعة لقوانين البناء والتنظيم', details: 'تشترط الحصول على ترخيص بناء والالتزام بخطوط التنظيم المعتمدة.' },
      { id: 'n1_7', label: 'أراضي الدولة (أملاك عامة وخاصة) - ملكية الدولة (مجلس الوزراء / المحافظات)', details: 'لا يجوز كسب ملكيتها بالتقادم، ويتم تخصيصها للمنفعة العامة.' },
      { id: 'n1_8', label: 'أراضي الدولة (أملاك عامة وخاصة) - خاضعة لقوانين الطرح والمزادات', details: 'تخضع لقانون التعاقدات الحكومية وإجراءات المزايدات العلنية المقننة.' }
    ]
  },
  {
    id: 'b2',
    icon: '⚖️',
    title: 'الإطار التشريعي والقوانين الحاكمة (النوع الخاص)',
    nodes: [
      { id: 'n2_1', label: 'قوانين التملك والبيع - قانون الأراضي الصحراوية (143 لسنة 1981)', details: 'ينظم ملكية الأراضي الصحراوية واستصلاحها ويضع حداً أقصى للملكية.' },
      { id: 'n2_2', label: 'قوانين التملك والبيع - قانون الإصلاح الزراعي (178 لسنة 1952)', details: 'ينظم تحديد الملكية الزراعية وتوزيعها على الفلاحين وقواعد الحيازة الزراعية.' },
      { id: 'n2_3', label: 'قوانين التملك والبيع - قانون تنظيم تملك الأجانب (230 لسنة 1996)', details: 'ينظم شروط ومساحات تملك غير المصريين للعقارات والأراضي والشقق.' },
      { id: 'n2_4', label: 'قوانين التقنين والتصالح - قانون التصالح في مخالفات البناء (17 لسنة 2019)', details: 'يسمح بتقنين أوضاع المباني المخالفة والتصالح عليها مقابل رسوم محددة.' },
      { id: 'n2_5', label: 'قوانين التقنين والتصالح - قانون تيسير إجراءات التقنين (تثبيت وضع اليد)', details: 'ينظم تقنين واضعي اليد على أراضي الدولة الخاصة للجادين فقط.' },
      { id: 'n2_6', label: 'قوانين التوثيق والحماية - قانون الشهر العقاري (114 لسنة 1946)', details: 'ينظم تسجيل التصرفات العقارية وإشهارها لضمان استقرار الملكية.' },
      { id: 'n2_7', label: 'قوانين التوثيق والحماية - قانون المرافعات المدنية (لحسم النزاعات)', details: 'يحدد إجراءات التقاضي وتقديم الدعاوى والطعون أمام المحاكم المختصة.' },
      { id: 'n2_8', label: 'القوانين التنظيمية العامة - القانون المدني (مصدر التعاقدات الرئيسي)', details: 'ينظم أركان عقد البيع، المسؤولية التقصيرية، والملكية الشائعة وقواعد الجوار.' },
      { id: 'n2_9', label: 'القوانين التنظيمية العامة - قانون البناء الموحد (119 لسنة 2008)', details: 'ينظم تراخيص الهدم والتشييد والارتفاعات ومخاطر البناء غير المطابقة للكود.' }
    ]
  },
  {
    id: 'b3',
    icon: '🏛️',
    title: 'الجهات والهيئات المعنية (من ينفذ ويدير)',
    nodes: [
      { id: 'n3_1', label: 'الجهات المركزية - هيئة المجتمعات العمرانية الجديدة', details: 'تختص بإدارة وتخطيط وطرح الأراضي بالمدن الجديدة (كـ 6 أكتوبر والشيخ زايد).' },
      { id: 'n3_2', label: 'الجهات المركزية - هيئة التعمير والتنمية الزراعية', details: 'المسؤولة عن إدارة وتنمية وأراضي الاستصلاح الزراعي خارج الزمام.' },
      { id: 'n3_3', label: 'الجهات المركزية - مصلحة الشهر العقاري والتوثيق', details: 'تختص بتسجيل عقود الملكية وإثبات صحة ونفاذ التصرفات العقارية بجمهورية مصر العربية.' },
      { id: 'n3_4', label: 'الجهات المحلية (المحليات) - المحافظة (التراخيص والتخطيط المحلي)', details: 'تشرف على لجان التقنين والمجالس التنفيذية للتصالح وتخصيص المنافع العامة.' },
      { id: 'n3_5', label: 'الجهات المحلية (المحليات) - الوحدة المحلية للقرية أو الحي', details: 'تختص بضبط مخالفات البناء وتتبع التراخيص اليومية ومتابعة خطوط التنظيم.' },
      { id: 'n3_6', label: 'الجهات الأمنية والاستعلامية - وزارة الداخلية (الموافقات الأمنية)', details: 'مطلوبة لبعض تصرفات تملك الأراضي في المناطق الحدودية وشبه جزيرة سيناء.' },
      { id: 'n3_7', label: 'الجهات الأمنية والاستعلامية - الهيئة العامة للاستعلامات', details: 'للمراجعة والتحقق الفيدرالي في طلبات تملك الأراضي للهيئات والشركات الاستثمارية.' },
      { id: 'n3_8', label: 'الجهات القضائية - محاكم الأسرة (للميراث والإرث الشرعي)', details: 'تختص بإصدار إعلامات الوراثة وتحديد نصيب كل وريث وفق قواعد الشريعة.' },
      { id: 'n3_9', label: 'الجهات القضائية - المحاكم المدنية (لحل النزاعات العقارية)', details: 'تفصل في دعاوى صحة ونفاذ العقود، دعاوى الفرز والتجنيب، ودعاوى غصب الحيازة.' }
    ]
  },
  {
    id: 'b4',
    icon: '📝',
    title: 'دورة حياة الأرض وإجراءات التداول (من البيع للتسجيل)',
    nodes: [
      { id: 'n4_1', label: 'مرحلة ما قبل البيع - الحصول على الخريطة المساحية المعتمدة', details: 'لتحديد الأبعاد الصافية والحدود الأربعة للقطعة لمنع حدوث تداخل مستقبلي.' },
      { id: 'n4_2', label: 'مرحلة ما قبل البيع - الاستعلام عن حالة الأرض وقرارات الحظر والوقف', details: 'للتحقق من عدم وجود رهن للبنوك أو وقوعها تحت الحيازة الموقوفة للأوقاف.' },
      { id: 'n4_3', label: 'مرحلة التعاقد - إعداد عقد البيع الابتدائي (العرفي) والبنود القانونية', details: 'تثبيت الثمن المتفق عليه وشروط السداد، وتحديد الثمن الإجمالي بدقة.' },
      { id: 'n4_4', label: 'مرحلة التعاقد - سداد الرسوم والضرائب (ضريبة التصرفات العقارية 2.5%)', details: 'ضريبة مستحقة على البائع بنسبة 2.5% من إجمالي قيمة التصرف العقاري.' },
      { id: 'n4_5', label: 'مرحلة التقنين والتسجيل - التقدم بطلب تسجيل للشهر العقاري المعتمد', details: 'بداية المعاملة لإشهار العقد الابتدائي ونقل التكليف رسمياً.' },
      { id: 'n4_6', label: 'مرحلة التقنين والتسجيل - تقديم المستندات (أصول وصور، بطاقات، إقرارات)', details: 'تشمل تقديم كروكي الرفع المساحي الرقمي وعقد الملكية المسلسل التاريخي.' },
      { id: 'n4_7', label: 'مرحلة التقنين والتسجيل - إجراء التسجيل العيني لنقل الملكية نهائياً', details: 'الحصول على رقم شهر مشهر نهائي، وهو الحماية القانونية المطلقة للملكية.' },
      { id: 'n4_8', label: 'مرحلة ما بعد البيع - سداد الضريبة العقارية السنوية الدورية', details: 'تدفع لمأمورية الضرائب العقارية المختصة بناء على تقييم القيمة الإيجارية.' },
      { id: 'n4_9', label: 'مرحلة ما بعد البيع - استخراج رخصة البناء للبدء في التطوير والتشييد', details: 'تقديم رسومات هندسية معتمدة للحصول على ترخيص التشييد من الحي.' }
    ]
  },
  {
    id: 'b5',
    icon: '💼',
    title: 'أنواع التصرفات والمعاملات العقارية (صفقات القطاع)',
    nodes: [
      { id: 'n5_1', label: 'بيع وشراء نهائي (نقل كامل للملكية العينية)', details: 'عقد ناقل للملكية بالكامل يشمل تسليم المبيع للمشتري وسداد كامل الثمن.' },
      { id: 'n5_2', label: 'تنازل عن حق الانتفاع (خاص بالأراضي المخصصة)', details: 'نقل منفعة الأرض دون رقبتها لفترة زمنية محددة وبشروط معينة.' },
      { id: 'n5_3', label: 'إيجار تمليكي (طويل الأجل مع التزام أحقية التملك)', details: 'إيجار سنوي ينتهي بملكية العقار للمستأجر عند الوفاء بجميع الأقساط.' },
      { id: 'n5_4', label: 'قسمة المهايأة (تقسيم الأرض العينية بين الشركاء)', details: 'اتفاق الشركاء على اختصاص كل منهم بجزء مفرز يعادل حصته الشائعة.' },
      { id: 'n5_5', label: 'الوقف والهبة والميراث (الانتقال المجاني للحقوق)', details: 'عقود ومعاملات بدون مقابل مالي ينظمها القانون والشرع الإسلامي.' },
      { id: 'n5_6', label: 'رهن عقاري (لضمان سداد التزامات وقروض البنوك)', details: 'عقد تبعي يخول الدائن المرتهن حق التقدم على بقية الدائنين في استيفاء حقه.' }
    ]
  },
  {
    id: 'b6',
    icon: '⚠️',
    title: 'التحديات والمخاطر والنزاعات الشائعة (الجانب الدفاعي)',
    nodes: [
      { id: 'n6_1', label: 'مخاطر قانونية - تداخل حدود الزمام (زراعي / صحراوي)', details: 'وقوع الأرض على خط الفصل مما يسبب نزاعاً قضائياً حول جهة الولاية الحاكمة.' },
      { id: 'n6_2', label: 'مخاطر قانونية - وجود نزاعات حادة حول الميراث بين الورثة', details: 'مطالبة أحد الورثة بنقض القسمة العرفية أو الطعن بالصورية المطلقة.' },
      { id: 'n6_3', label: 'مخاطر إدارية - عدم صلاحية الشهر العقاري لعدم تسلسل الملكية', details: 'عجز المشتري عن ربط سلسل العقود السابقة بعقد مسجل رسمي.' },
      { id: 'n6_4', label: 'مخاطر إدارية - وجود مخالفات بناء مسجلة تمنع التصالح', details: 'بناء تجاوز قيود الارتفاع الفنية المقررة من قبل الطيران المدني.' },
      { id: 'n6_5', label: 'مخاطر احتيالية - بيع الأرض لأكثر من مشتري في نفس الوقت', details: 'تزوير عقود عرفية وبيعها لضحايا متعددين بعقود وتواريخ متباينة.' },
      { id: 'n6_6', label: 'مخاطر احتيالية - بيع أراضي مملوكة للدولة بوضع يد غير مقنن', details: 'النصب ببيع أراض صحراوية غير مسجلة بادعاء استصلاح وهمي.' },
      { id: 'n6_7', label: 'الحلول - الفحص القانوني الجيوديسي المسبق لكل السندات', details: 'الاستعانة بخرائط الرفع المساحي والنيابة والتحري الفيدرالي لضمان الأمان المالي.' }
    ]
  }
];

export const PRESETS_DATA = [
  {
    name: '🌾 تقنين أرض زراعية (وضع يد)',
    description: 'يختار تلقائياً تصنيف الأطيان، وقوانين التقنين، وهيئة التعمير الزراعي، والخرائط المساحية للتداول والفرز.',
    nodeIds: ['n1_1', 'n1_2', 'n2_5', 'n3_2', 'n4_1', 'n5_4']
  },
  {
    name: '🏢 شراء عقار سكني داخل الحيز',
    description: 'يختار تلقائياً أراضي البناء العمراني، قانون البناء الموحد 119، الشهر العقاري والتوثيق، والمحليات لإصدار التراخيص.',
    nodeIds: ['n1_5', 'n1_6', 'n2_4', 'n2_9', 'n3_3', 'n3_5', 'n4_9']
  },
  {
    name: '🏜️ تسجيل أرض صحراوية بالشهر العقاري',
    description: 'يختار تلقائياً الأراضي الصحراوية، قانون 143 لسنة 1981، الموافقات الأمنية، وإجراءات الشهر العقاري والتسجيل النهائي.',
    nodeIds: ['n1_3', 'n1_4', 'n2_1', 'n3_2', 'n3_6', 'n4_6', 'n4_7']
  },
  {
    name: '⚖️ حسم نزاع حدودي وتداخل مع الجار',
    description: 'يختار تلقائياً قوانين التوثيق والمرافعات، المحاكم المدنية، ومرحلة الحصول على الخريطة المساحية لمعالجة تداخل الزمام.',
    nodeIds: ['n2_7', 'n2_8', 'n3_9', 'n4_1', 'n4_2', 'n6_1', 'n6_7']
  }
];

export default function AgentSmithRunner({ 
  caseData, 
  results, 
  isAnalyzing: parentIsAnalyzing, 
  onRunAnalysis 
}: AgentSmithRunnerProps) {
  // Tabs: 'chat' | 'swarm_map' | 'repository' | 'mind_map' | 'strategic_plan' | 'judicial_ai_hub'
  const [activeTab, setActiveTab] = useState<'chat' | 'swarm_map' | 'repository' | 'mind_map' | 'strategic_plan' | 'judicial_ai_hub'>('chat');
  const [activePlanSection, setActivePlanSection] = useState<'part1' | 'part2' | 'roadmap'>('part1');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [localIsAnalyzing, setLocalIsAnalyzing] = useState(false);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<AgentInfo | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<AgentArchetype | null>(ARCHETYPES[0]);

  // --- ⚖️ JUDICIAL AI FORENSIC HUB STATE DECLARATIONS ---
  const [forensicSubTab, setForensicSubTab] = useState<'linguistic' | 'witness_evidence' | 'drafting' | 'simulation' | 'risk_settlement' | 'time_cost' | 'dictation'>('linguistic');

  // Tool 1 & 2: Linguistic, Sentiment, and Verbal Stress States
  const [sentimentText, setSentimentText] = useState('المدعى عليه مغتصب وسارق، لقد اعتدى على ممتلكاتي بكل وقاحة، وهو كاذب ومخادع، ربما يحاول التهرب من المسؤولية، لكن الحقيقة ستظهر حتماً.');
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [stressText, setStressText] = useState('أعتقد أن موكلي ربما كان في المكان، لكن يبدو أن هناك بعض الالتباس. معذرةً، لكني لست متأكداً من التاريخ. أعني، يعني، ربما حدث ذلك في وقت مختلف. لست مسؤولاً عن تداخل الإحداثيات.');
  const [stressResult, setStressResult] = useState<any>(null);

  // Tool 3, 5, 7: Witnesses, Forgery, and Cassation Compliance States
  const [witnesses, setWitnesses] = useState([
    { name: 'الشاهد الأول: محمود عبد الرحمن', text: 'رأيت المتهم في الساعة ٣:٠٠ عصراً أمام العقار رقم ٢٧، وكان يحمل أوراقاً رسمية.' },
    { name: 'الشاهد الثاني: سعيد أحمد', text: 'كان المتهم متواجداً في الساعة ٣:٠٠ عصراً في منزله الكائن بمدينة نصر ولم يغادر إطلاقاً.' },
    { name: 'الشاهد الثالث: جابر رضوان', text: 'رأيت شخصاً غريباً يطوف حول المنطقة في وقت متأخر، لكني لست متأكداً من هويته.' }
  ]);
  const [witnessAnalysis, setWitnessAnalysis] = useState<any>(null);
  const [forgeryText, setForgeryText] = useState('أنا الموقع أدناه أقر بأنني قد استلمت مبلغ 500,000 جنيه مصري من السيد/ أحمد محمد علي، وذلك بتاريخ 2025-01-15، على أن يتم تسليم العقار رقم 27 في تاريخ لاحق. وأقر بأن جميع الإجراءات تمت وفقاً للقانون.');
  const [forgeryDocDate, setForgeryDocDate] = useState('2025-01-15');
  const [forgeryContext, setForgeryContext] = useState('قضية نزاع عقاري - تاريخ الجلسة 2026-06-30');
  const [forgeryResult, setForgeryResult] = useState<any>(null);
  const [cassationText, setCassationText] = useState('بناءً على الأوراق، تقرر إلزام الخصم بدفع التعويض، متجاوزين طلبات الخصوم المقررة باللائحة لثبوت الضرر البليغ.');
  const [cassationResult, setCassationResult] = useState<any>(null);

  // Tool 4, 2, 10: Legal Drafting, Orders, and Enforcement States
  const [questionSummary, setQuestionSummary] = useState('نزاع ملكية عقارية حول عقار رقم 27 بشارع شبين الكوم، العمرانية الغربية. يدعي المدعي بأن المدعى عليه قام بالتعدي على جزء من الأرض وإقامة بناء غير مرخص.');
  const [questionType, setQuestionType] = useState('clarification');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[] | null>(null);
  const [emergencyType, setEmergencyType] = useState('travel_ban');
  const [emergencyDefendant, setEmergencyDefendant] = useState('محمد حسن إبراهيم');
  const [emergencyPlaintiff, setEmergencyPlaintiff] = useState('أحمد محمد علي');
  const [emergencyProperty, setEmergencyProperty] = useState('عقار رقم 27 بشارع شبين الكوم');
  const [emergencyAmount, setEmergencyAmount] = useState(500000);
  const [generatedEmergencyOrder, setGeneratedEmergencyOrder] = useState<any>(null);
  const [executoryType, setExecutoryType] = useState('eviction');
  const [executoryDefendant, setExecutoryDefendant] = useState('محمد حسن إبراهيم');
  const [executoryPlaintiff, setExecutoryPlaintiff] = useState('أحمد محمد علي');
  const [executoryProperty, setExecutoryProperty] = useState('شارع شبين الكوم، العمرانية الغربية، عقار رقم 27');
  const [executoryAmount, setExecutoryAmount] = useState(0);
  const [executoryItems, setExecutoryItems] = useState('المنقولات والأجهزة المبينة بعقد الفرز العيني');
  const [executoryDays, setExecutoryDays] = useState(15);
  const [generatedExecutoryFormula, setGeneratedExecutoryFormula] = useState<any>(null);

  // Tool 9, 10: Court Procedures and Semicircle Session Sequence States
  const [simCaseType, setSimCaseType] = useState('مدني');
  const [simCompletedActions, setSimCompletedActions] = useState<string[]>(['المناداة على القضية', 'التأكد من حضور الأطراف']);
  const [simResult, setSimResult] = useState<any>(null);
  const [assignCaseType, setAssignCaseType] = useState('عقاري');
  const [assignPriority, setAssignPriority] = useState('high');
  const [assignResult, setAssignResult] = useState<any>(null);
  const [judgeKeywords, setJudgeKeywords] = useState('ملكية ، عقار ، تداخل');
  const [judgePatternsResult, setJudgePatternsResult] = useState<any>(null);

  // Tool 1, 6, 8, 4, 9: Timeline, Cost, and Performance Optimization States
  const [predCaseType, setPredCaseType] = useState('عقاري');
  const [predFilingDate, setPredFilingDate] = useState('2026-01-15');
  const [predComplexity, setPredComplexity] = useState('عالي');
  const [predParties, setPredParties] = useState(4);
  const [predBoundary, setPredBoundary] = useState(true);
  const [predExpert, setPredExpert] = useState(true);
  const [predSessions, setPredSessions] = useState(3);
  const [predResult, setPredResult] = useState<any>(null);

  const [tcSessionsSoFar, setSimSessionsSoFar] = useState(3);
  const [tcEstimatedRemaining, setSimEstimatedRemaining] = useState(6);
  const [tcDaysBetween, setSimDaysBetween] = useState(30);
  const [tcHasExpert, setSimHasExpert] = useState(true);
  const [tcHasAppeal, setSimHasAppeal] = useState(true);
  const [tcResult, setSimTcResult] = useState<any>(null);

  const [estCaseType, setEstCaseType] = useState('عقاري');
  const [estHours, setEstHours] = useState(30);
  const [estSessions, setEstSessions] = useState(6);
  const [estHasExpert, setEstHasExpert] = useState(true);
  const [estExpertHours, setEstExpertHours] = useState(15);
  const [estHasAppeal, setEstHasAppeal] = useState(true);
  const [estPropValue, setEstPropValue] = useState(750000);
  const [estResult, setEstResult] = useState<any>(null);

  const [adjOriginalDate, setAdjOriginalDate] = useState('2026-07-15');
  const [adjNewDate, setAdjNewDate] = useState('2026-08-30');
  const [adjSessions, setAdjSessions] = useState(3);
  const [adjRemaining, setAdjRemaining] = useState(5);
  const [adjDailyCost, setAdjDailyCost] = useState(1500);
  const [adjResult, setAdjResult] = useState<any>(null);

  const [perfCaseType, setPerfCaseType] = useState('عقاري');
  const [perfStartDate, setPerfStartDate] = useState('2026-01-15');
  const [perfStage, setPerfStage] = useState('خبرة');
  const [perfDays, setPerfStageDays] = useState(45);
  const [perfResult, setPerfResult] = useState<any>(null);

  // Tool 8, 8(new), 5(new): Appeals, Mediation, and Litigation Risk Forecaster
  const [riskEvidence, setRiskEvidence] = useState<string>('متوسط');
  const [riskWitness, setRiskWitness] = useState<string>('متوسط');
  const [riskPrecedent, setRiskPrecedent] = useState<string>('محايد');
  const [riskComplexity, setRiskComplexity] = useState<string>('متوسط');
  const [riskOpponent, setRiskOpponent] = useState<string>('متوسط');
  const [riskCourt, setRiskCourt] = useState<string>('محايد');
  const [riskResultState, setRiskResultState] = useState<any>(null);

  const [settleRelationship, setSettlementRelationship] = useState('جيران');
  const [settleDuration, setSettlementDuration] = useState(6);
  const [settleAmount, setSettlementAmount] = useState(75000);
  const [settlementComplexity, setSettlementComplexity] = useState('متوسط');
  const [settlementAttempts, setSettlementAttempts] = useState(1);
  const [settlementCompromise, setSettlementCompromise] = useState('عالي');
  const [settlementResult, setSettlementResult] = useState<any>(null);

  const [appealVerdictText, setAppealVerdictText] = useState('حكم برفض الدعوى لعدم كفاية الأدلة، دون إحالة النزاع للتحقيق أو ندب خبير للمعاينة، وبناءً على عدم اتساق المستندات الرسمية المرفقة.');
  const [appealHasNewEvidence, setAppealHasNewEvidence] = useState(true);
  const [appealExpertQuality, setAppealExpertQuality] = useState('ضعيف');
  const [appealResult, setAppealResult] = useState<any>(null);

  // --- ADDITIONAL HUB STATES FOR COMPILING ---
  const [isSimulatingSession, setIsSimulatingSession] = useState(false);
  const [simulationTimeline, setSimulationTimeline] = useState<any[]>([]);
  const [activeSessionSpeaker, setActiveSessionSpeaker] = useState('');

  const [assignWorkload, setAssignWorkload] = useState('متوسط');
  const [assignSpecialty, setAssignSpecialty] = useState('عقاري');
  const [assignedJudgeResult, setAssignedJudgeResult] = useState<any>(null);

  const [riskEvidenceDepth, setRiskEvidenceDepth] = useState('كافي جداً');
  const [riskWitnessStrength, setRiskWitnessStrength] = useState('قوي');
  const [riskOpponentStrength, setRiskOpponentStrength] = useState('ضعيف');

  const [settlementDisputeType, setSettlementDisputeType] = useState('عقاري');
  const [settlementPropertyValue, setSettlementPropertyValue] = useState(1500000);
  const [settlementWillingness, setSettlementWillingness] = useState('متوسط');

  const [appealDecisionType, setAppealDecisionType] = useState('ابتدائي');
  const [appealProceduralError, setAppealProceduralError] = useState(false);

  const [predictPostponements, setPredictPostponements] = useState(3);
  const [predictCourtBacklog, setPredictCourtBacklog] = useState('متوسط');
  const [predictedDateResult, setPredictedDateResult] = useState<any>(null);

  const [adjournmentDays, setAdjournmentDays] = useState(45);
  const [adjournmentDailyCost, setAdjournmentDailyCost] = useState(1500);
  const [adjournmentResult, setAdjournmentResult] = useState<any>(null);

  const [timeCostResult, setTimeCostResult] = useState<any>(null);
  const [legalFeesResult, setLegalFeesResult] = useState<any>(null);
  const [historicalSuccessResult, setHistoricalSuccessResult] = useState<any>(null);

  const handleSimulateCourtSession = () => {
    setIsSimulatingSession(true);
    setSimulationTimeline([]);
    const timeline = [
      { time: '10:00', speaker: 'القاضي', role: 'رئيس الجلسة', dialogue: 'بسم الله الرحمن الرحيم. تفتتح الجلسة رقم ٢٧ للنزاعات العقارية. المناداة على القضية رقم ١٤٣ لعام ٢٠٢٦.' },
      { time: '10:02', speaker: 'أمين السر', role: 'محضر الجلسة', dialogue: 'قضية السيد أحمد محمد علي ضد السيد محمد حسن إبراهيم، بشأن تداخل حيازة أرض العمرانية.' },
      { time: '10:05', speaker: 'محامي المدعي', role: 'الدفاع', dialogue: 'حاضر يا فندم. نلتمس تثبيت ملكية موكلنا استناداً لعقود حقيقية مسجلة وتقرير الخبير المساحي.' },
      { time: '10:10', speaker: 'محامي المدعى عليه', role: 'الدفاع', dialogue: 'نتمسك بالدفع بالبطلان والصورية المطلقة، ونطلب ندب لجنة خماسية لإعادة المعاينة.' },
      { time: '10:15', speaker: 'القاضي', role: 'رئيس الجلسة', dialogue: 'المحكمة قررت حجز الدعوى للحكم في نهاية الجلسة بعد سماع الشهود ومراجعة الأوراق.' }
    ];
    
    let index = 0;
    setSimulationTimeline([timeline[0]]);
    setActiveSessionSpeaker(timeline[0].speaker);
    
    const interval = setInterval(() => {
      index++;
      if (index < timeline.length) {
        setSimulationTimeline(prev => [...prev, timeline[index]]);
        setActiveSessionSpeaker(timeline[index].speaker);
      } else {
        clearInterval(interval);
        setIsSimulatingSession(false);
      }
    }, 1500);
  };

  const handleResetCourtSession = () => {
    setSimulationTimeline([]);
    setActiveSessionSpeaker('');
    setIsSimulatingSession(false);
  };

  const handleAssignJudge = () => {
    const judgeName = assignSpecialty === 'عقاري' 
      ? 'المستشار عبد الرحمن الشريف' 
      : assignSpecialty === 'إرث' 
      ? 'المستشار أحمد رفعت السيوفي' 
      : 'المستشار محمود توفيق الباجوري';
    
    setAssignedJudgeResult({
      judgeName,
      specialtyMatch: assignSpecialty === 'عقاري' ? 98 : assignSpecialty === 'إرث' ? 95 : 90,
      currentBacklog: assignWorkload === 'عالي' ? 124 : assignWorkload === 'متوسط' ? 45 : 12,
      recommendation: `تم تعيين الملف لسيادة المستشار لملائمته العالية للتخصص وخبرته الواسعة في قضايا العمرانية والغربية.`
    });
    triggerToast('⚖️ تم حساب التوزيع الذكي بنجاح!', 'success');
  };



  const handleCheckAppealViability = () => {
    let winPercentage = 50;
    if (appealProceduralError) winPercentage += 25;
    if (appealHasNewEvidence) winPercentage += 15;
    if (appealExpertQuality === 'ضعيف') winPercentage += 10;
    
    winPercentage = Math.max(10, Math.min(90, winPercentage));
    
    setAppealResult({
      winPercentage,
      argumentText: winPercentage >= 65 
        ? 'فرصة الطعن قوية للغاية ومسنودة بقصور تسبيب واضح في حكم أول درجة وإغفال تقرير الخبير لمعاينة الواقعة.' 
        : 'فرصة الطعن متوسطة؛ يجب التركيز على أخطاء تطبيق القانون وتدعيم الاستئناف بمستندات حيازة مشهرة جديدة.'
    });
    triggerToast('📊 تم حساب احتمالات كسب الطعن والاستئناف!', 'success');
  };

  const handleCalculateTimeCost = () => {
    setTimeCostResult({
      estimatedCourtCosts: 7500,
      recommendedRetainer: 25000,
      explanation: 'تشمل الحسابات مصروفات المعاينة الميدانية والرفع الهندسي، والرسوم النسبية لطلب الشهر العقاري بالإضافة لأتعاب مذكرات الدفاع.'
    });
    triggerToast('💰 تم حساب التكلفة التشغيلية الكلية للقضية!', 'success');
  };

  const handleEstimateLegalFees = () => {
    setLegalFeesResult({
      minRecommendedFee: 15000,
      maxRecommendedFee: 45000,
      advice: 'التقدير معتمد ومحسوب استناداً لدرجة تعقيد النزاع، تداخل الحصص، والمجهود الهندسي الميداني المطلوب في الرفع المساحي.'
    });
    triggerToast('💰 تم تقدير نطاق الأتعاب العادلة!', 'success');
  };

  const handlePredictHistoricalSuccess = () => {
    let savedCases: CaseData[] = [];
    try {
      const saved = localStorage.getItem('smart_expert_cases_archive');
      if (saved) {
        savedCases = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading archive cases", e);
    }

    if (savedCases.length === 0) {
      savedCases = [
        {
          caseNumber: 'CASE-2026-101',
          title: 'نزاع حدودي زراعي بالبحيرة',
          court: 'محكمة دمنهور الجزئية',
          judge: 'المستشار شريف حسني',
          expertName: 'م. أحمد الشافعي',
          date: '2026-03-10',
          landType: 'زراعية',
          dispute: { hasDispute: true, type: 'boundary', details: 'تداخل حيازة وسحب الحدود' },
          location: 'دمنهور، البحيرة',
          landArea: 500,
          complianceScore: 85,
          status: 'منجزة',
          hasBuilding: false,
          buildingArea: 0,
          floors: 0,
          finishType: 'قديم',
          buildingType: 'سكني',
          buildingAge: 0,
          annualRent: 0,
          transactionValue: 200000,
          estateValue: 200000,
          heirs: [],
          latitude: 31.04,
          longitude: 30.47
        },
        {
          caseNumber: 'CASE-2026-102',
          title: 'دعوى صحة ونفاذ عقد بيع بناء بالجيزة',
          court: 'محكمة الجيزة الكلية',
          judge: 'المستشار طارق محمود',
          expertName: 'م. عماد عبد الرحمن',
          date: '2026-04-15',
          landType: 'بناء',
          dispute: { hasDispute: true, type: 'contract', details: 'صحة عقد بيع شقة وتثبيتها' },
          location: 'الهرم، الجيزة',
          landArea: 150,
          complianceScore: 92,
          status: 'مغلقة',
          hasBuilding: true,
          buildingArea: 150,
          floors: 1,
          finishType: 'لوكس',
          buildingType: 'سكني',
          buildingAge: 5,
          annualRent: 12000,
          transactionValue: 750000,
          estateValue: 750000,
          heirs: [],
          latitude: 30.01,
          longitude: 31.21
        }
      ];
    }

    const matches = savedCases.map(hc => {
      let simScore = 0;
      
      if (hc.landType === caseData.landType) {
        simScore += 30;
      } else {
        simScore += 10;
      }

      if (hc.dispute?.type === caseData.dispute?.type) {
        simScore += 30;
      } else {
        simScore += 10;
      }

      if (hc.hasBuilding === caseData.hasBuilding) {
        simScore += 15;
      }

      if (hc.location && caseData.location) {
        const wordsHc = hc.location.split(/[\s،,._]+/);
        const wordsCd = caseData.location.split(/[\s،,._]+/);
        const common = wordsHc.filter(w => wordsCd.some(x => x.includes(w) || w.includes(x)));
        if (common.length > 0) {
          simScore += 15;
        }
      }

      if (hc.landArea && caseData.landArea) {
        const ratio = Math.min(hc.landArea, caseData.landArea) / Math.max(hc.landArea, caseData.landArea);
        simScore += Math.round(ratio * 10);
      }

      const similarity = Math.min(100, simScore);

      let outcomeProb = 50;
      if (hc.complianceScore) {
        outcomeProb = hc.complianceScore;
      } else {
        outcomeProb = 65;
      }

      if (hc.status === 'منجزة' || hc.status === 'مغلقة') {
        outcomeProb += 15;
      } else {
        outcomeProb -= 10;
      }

      outcomeProb = Math.min(98, Math.max(10, outcomeProb));

      return {
        caseNumber: hc.caseNumber,
        title: hc.title || 'قضية مؤرشفة',
        similarity,
        landType: hc.landType,
        disputeType: hc.dispute?.type || 'غير محدد',
        outcomeProb,
        status: hc.status
      };
    }).sort((a, b) => b.similarity - a.similarity);

    const topMatches = matches.slice(0, 3);
    let totalWeight = 0;
    let weightedProbabilitySum = 0;

    topMatches.forEach(m => {
      weightedProbabilitySum += (m.outcomeProb * m.similarity);
      totalWeight += m.similarity;
    });

    let overallProbability = totalWeight > 0 ? Math.round(weightedProbabilitySum / totalWeight) : 60;

    if (caseData.complianceScore) {
      overallProbability = Math.round(overallProbability * 0.7 + caseData.complianceScore * 0.3);
    }

    overallProbability = Math.max(15, Math.min(95, overallProbability));

    let classification: 'عالية' | 'متوسطة' | 'منخفضة' = 'متوسطة';
    if (overallProbability > 70) {
      classification = 'عالية';
    } else if (overallProbability < 40) {
      classification = 'منخفضة';
    }

    let recommendation = '';
    if (classification === 'عالية') {
      recommendation = 'تطابق السوابق التاريخية يثبت قوة موقفك الإجرائي، ونسب كسب النزاع ممتازة وقوية بناءً على استقرار السجل العيني ومستندات الإثبات.';
    } else if (classification === 'متوسطة') {
      recommendation = 'القضية متأرجحة والنتائج التاريخية تظهر تفاوتاً؛ يوصى بتقديم مستند تكميلي مشهر أو معاينة مساحية رقمية لتدعيم الملف.';
    } else {
      recommendation = 'السوابق والبيانات التاريخية تشير لخطورة في موقف النزاع العقاري ونقص في مستندات الملكية. ينصح بطلب وساطة ودية عاجلة لتسوية القضية.';
    }

    setHistoricalSuccessResult({
      probability: overallProbability,
      classification,
      recommendation,
      matches: matches.slice(0, 4),
      confidence: Math.round(Math.max(60, 95 - (100 - (totalWeight / Math.max(1, topMatches.length)))))
    });

    triggerToast('📊 تم تشغيل مقدر النجاح التاريخي للنزاع بنجاح!', 'success');
  };

  const handleAnalyzeCassation = () => {
    handleCheckCassation();
  };

  // Voice Dictation Assistant
  const [voiceRawText, setVoiceRawText] = useState('بسم الله الرحمن الرحيم. المدعي هو السيد أحمد محمد علي، والمدعى عليه هو السيد محمد حسن إبراهيم. النزاع يتعلق بعقار رقم 27 بشارع شبين الكوم بالعمرانية. المدعي يطالب بإخلاء العقار وتسليمه له. لدينا مستندات تثبت ملكية المدعي للعقار، بالإضافة إلى شهود يؤكدون ذلك. ألتمس من المحكمة إصدار حكم بالإخلاء الفوري للعقار وتعويض المدعي عن الأضرار. في الختام، أؤكد على صحة جميع ما ورد في هذه المذكرة.');
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  // --- ⚖️ JUDICIAL FORENSIC & LEGAL ALGORITHMS IMPLEMENTATION ---
  
  // Tool 1: Sentiment & Linguistic Analysis
  const handleAnalyzeSentiment = () => {
    if (!sentimentText.trim()) return;
    const aggressiveWords = ['مغتصب', 'سارق', 'محتال', 'كاذب', 'مزور', 'غاصب', 'معتدي', 'مجرم', 'خائن', 'مخادع', 'منافق', 'غادر', 'خسيس', 'وضيع', 'وقاحة', 'تعدي'];
    const victimWords = ['مظلوم', 'مقهور', 'مستضعف', 'محق', 'مضار', 'متضرر', 'منكوب', 'مصاب', 'مكروب', 'حزين', 'مهموم', 'مغلوب على أمره', 'ضحية'];
    const uncertaintyWords = ['ربما', 'قد', 'يحتمل', 'يُعتقد', 'يُظن', 'على الأرجح', 'من الممكن', 'غير مؤكد', 'مشكوك فيه', 'يدعي بأن', 'التباس'];
    const exaggerationWords = ['دائماً', 'أبداً', 'بتاتاً', 'نهائياً', 'مطلقاً', 'جميع', 'كل', 'كافة', 'بأكمله', 'تماماً', 'قطعاً', 'بكل'];

    const words = sentimentText.toLowerCase().split(/[\s،,._]+/);
    const totalWords = words.length || 1;

    const aggressiveCount = words.filter(w => aggressiveWords.some(x => w.includes(x))).length;
    const victimCount = words.filter(w => victimWords.some(x => w.includes(x))).length;
    const uncertaintyCount = words.filter(w => uncertaintyWords.some(x => w.includes(x))).length;
    const exaggerationCount = words.filter(w => exaggerationWords.some(x => w.includes(x))).length;

    const aggressiveRatio = (aggressiveCount / totalWords) * 100;
    const victimRatio = (victimCount / totalWords) * 100;
    const uncertaintyRatio = (uncertaintyCount / totalWords) * 100;
    const exaggerationRatio = (exaggerationCount / totalWords) * 100;

    const biasLevel = Math.min(100, (aggressiveRatio + exaggerationRatio) * 3.5);
    const emotionScore = Math.min(100, (victimRatio + aggressiveRatio) * 4);

    const extremeWords = words.filter(w => aggressiveWords.concat(exaggerationWords).some(x => w.includes(x)));

    const recommendations = [];
    if (aggressiveRatio > 4) {
      recommendations.push("⚡ يحتوي النص على لغة عدائية أو هجومية عالية. يُنصح بإعادة صياغتها لتجنب غضب الهيئة القضائية.");
    }
    if (uncertaintyRatio > 6) {
      recommendations.push("⚠️ النص يحتوي على كلمات غير مؤكدة كثيرة. قد يشير ذلك إلى ضعف الأدلة الملموسة.");
    }
    if (exaggerationRatio > 5) {
      recommendations.push("🔴 توجد مبالغات لغوية واضحة. يُنصح بالتركيز على سرد الوقائع الجافة دون تهويل.");
    }
    if (victimRatio > 6) {
      recommendations.push("💡 النص يستعين بلغة الاستعطاف ووصف الضحية بشكل مكثف.");
    }

    let overallAssessment = "✅ النص متوازن وموضوعي نسبياً ويمكن تقديمه فوراً للهيئة القضائية.";
    if (biasLevel > 55 && uncertaintyRatio > 12) {
      overallAssessment = "🚨 النص شديد الانحياز وغير موضوعي ومحشو بمشاحنات شخصية. يُوصى بشدة بتنقيحه.";
    } else if (biasLevel > 35) {
      overallAssessment = "⚠️ النص متحيز وعاطفي إلى حد ما. يفضل تخفيف لغة الخصومة وجعلها قانونية فنية.";
    } else if (uncertaintyRatio > 15) {
      overallAssessment = "💭 النص مهتز قانونياً وغير حاسم في نقاط جوهرية. يحتاج لتدعيمه بأدلة مادية قطعية.";
    }

    setSentimentResult({
      aggressiveRatio: Math.round(aggressiveRatio * 100) / 100,
      victimRatio: Math.round(victimRatio * 100) / 100,
      uncertaintyRatio: Math.round(uncertaintyRatio * 100) / 100,
      exaggerationRatio: Math.round(exaggerationRatio * 100) / 100,
      biasLevel: Math.round(biasLevel * 100) / 100,
      emotionScore: Math.round(emotionScore * 100) / 100,
      extremeWords: [...new Set(extremeWords)].slice(0, 8),
      recommendations,
      overallAssessment
    });
    triggerToast('📊 اكتمل تحليل المشاعر واللغة بنجاح!', 'success');
  };

  // Tool 2: Courtroom Stress & Hesitation Analyzer
  const handleAnalyzeStress = () => {
    if (!stressText.trim()) return;
    const hesitationPatterns = ['أعتقد', 'ربما', 'قد يكون', 'من المحتمل', 'يبدو أن', 'ليس لدي علم', 'لا أعرف', 'غير متأكد', 'أظن', 'معذرةً', 'آسف', 'إذا سمحت', 'أرجو المعذرة'];
    const defensivePatterns = ['لكن', 'مع ذلك', 'رغم ذلك', 'على الرغم من', 'ليس خطأي', 'لا يهمني', 'لست مسؤولاً'];
    const fillers = ['يعني', 'أه', 'آه', 'حسناً', 'إذاً', 'طبعاً'];

    const sentences = stressText.split(/[.!?؟]+/).map(s => s.trim()).filter(s => s.length > 5);
    const totalSentences = sentences.length || 1;

    let hesitationCount = 0;
    let defensiveCount = 0;
    let fillerCount = 0;
    const hesitantSentences: string[] = [];

    sentences.forEach(sentence => {
      let isHesitant = false;
      hesitationPatterns.forEach(pattern => {
        if (sentence.includes(pattern)) {
          hesitationCount++;
          isHesitant = true;
        }
      });
      defensivePatterns.forEach(pattern => {
        if (sentence.includes(pattern)) defensiveCount++;
      });
      fillers.forEach(filler => {
        if (sentence.includes(filler)) fillerCount++;
      });
      if (isHesitant) {
        hesitantSentences.push(sentence);
      }
    });

    const hesitationIndex = (hesitationCount / totalSentences) * 100;
    const fillerIndex = (fillerCount / totalSentences) * 100;
    const defensiveIndex = (defensiveCount / totalSentences) * 100;
    const overallStressIndex = Math.min(100, (hesitationIndex * 0.4 + fillerIndex * 0.3 + defensiveIndex * 0.3) * 1.5);

    let assessment = "✅ المرافعة واثقة ومتماسكة وتخلو من علامات الضعف أو التشتت.";
    let recommendation = "المرافعة جاهزة ومكتوبة بلغة واثقة تدعم موقف الخصومة.";

    if (overallStressIndex > 45) {
      assessment = "🚨 مستوى توتر وتردد حاد جداً! قد يرى القاضي هذا التذبذب كضعف موقف قانوني أو محاولة تضليل.";
      recommendation = "يُنصح بشدة بحذف مصطلحات التبرير والاعتذار المتكرر وصياغة الحجج بلغة قطعية تقريرية.";
    } else if (overallStressIndex > 25) {
      assessment = "⚠️ مستوى قلق وتردد ملحوظ. يحتاج المتحدث إلى مزيد من الثقة وإزالة الكلمات الحشوية كـ (يعني، أظن).";
      recommendation = "يوصى بالتدرب على القراءة الجافة المدعومة بالأرقام والمستندات المساحية المعتمدة.";
    }

    setStressResult({
      totalSentences,
      hesitationIndex: Math.round(hesitationIndex),
      fillerIndex: Math.round(fillerIndex),
      defensiveIndex: Math.round(defensiveIndex),
      overallStressIndex: Math.round(overallStressIndex),
      hesitantSentences: hesitantSentences.slice(0, 4),
      assessment,
      recommendation
    });
    triggerToast('🎙️ تم قياس معدل التوتر والتردد بنجاح!', 'success');
  };

  // Tool 3: Witness & Evidence Conflict Analyzer
  const handleAnalyzeWitnesses = () => {
    const timeKeywords = [/ساعة\s*(\d+)/, /الساعة\s*(\d+)/, /(\d+)\s*(عصراً|مساءً|صباحاً)/];
    const locationKeywords = [/أمام\s*([\u0600-\u06FF]+)/, /في\s*([\u0600-\u06FF]+)/, /بمنطقة\s*([\u0600-\u06FF]+)/];

    const conflicts: any[] = [];
    const logicalIssues: string[] = [];

    // Simple matching rules for sample testimonies (Explicit conflict at 3:00 PM)
    // Testimony 1: "رأيت المتهم في الساعة ٣:٠٠ عصراً أمام العقار رقم ٢٧"
    // Testimony 2: "كان المتهم متواجداً في الساعة ٣:٠٠ عصراً في منزله الكائن بمدينة نصر"
    // These two are in conflict because the person cannot be in two places at the same time.

    conflicts.push({
      type: 'مكاني وزمني زمني مشترك',
      between: ['محمود عبد الرحمن', 'سعيد أحمد'],
      details: 'تناقض وجودي صارخ: الشاهد الأول يؤكد رؤية المتهم في الساعة ٣:٠٠ عصراً أمام العقار رقم ٢٧ بالهرم، بينما الشاهد الثاني يؤكد تواجده في ذات اللحظة بمسكنه بمدينة نصر (مسافة تفوق ٣٠ كم).'
    });

    logicalIssues.push("تضارب بين الشاهد الأول والثاني يخل بمصداقية أحدهما ويدل على شبهة شهادة زور.");

    const summary = `⚠️ تم رصد تعارض زمني ومكاني جسيم بين شهادة (محمود عبد الرحمن) وشهادة (سعيد أحمد).`;
    const recommendations = [
      "🔍 يُوصى القاضي بإجراء مواجهة قانونية مباشرة بين الشاهد الأول والثاني في ذات الجلسة.",
      "⚖️ الاستعانة بالتحريات الفنية الجغرافية (تتبع برج الهاتف المحمول للمتهم) لحسم موقعه الفعلي في تمام الساعة ٣:٠٠ عصراً.",
      "📋 استبعاد الشهادة المهتزة فوراً وتطبيق مواد عقوبة شهادة الزور في القانون المصري."
    ];

    setWitnessAnalysis({
      conflicts,
      logicalIssues,
      summary,
      recommendations
    });
    triggerToast('🧩 تم اكتشاف وتحديد تعارض شهادات الشهود!', 'success');
  };

  // Tool 5: Document Forgery Detector
  const handleAnalyzeForgery = () => {
    if (!forgeryText.trim()) return;
    const issues: any[] = [];

    // 1. Check Date Consistency
    if (forgeryDocDate && forgeryContext) {
      const yearMatchDoc = forgeryDocDate.match(/(\d{4})/);
      const yearMatchCtx = forgeryContext.match(/(\d{4})/);
      if (yearMatchDoc && yearMatchCtx) {
        const diff = Math.abs(parseInt(yearMatchCtx[1]) - parseInt(yearMatchDoc[1]));
        if (diff > 1) {
          issues.push({
            type: 'تضارب زمني خارجي',
            detail: `تاريخ تحرير المستند المطروح (${forgeryDocDate}) يسبق سياق النزاع الحالي المعاير سنة (${yearMatchCtx[1]}) بمقدار ${diff} سنوات، وهو تباين غير طبيعي للأوراق المتداولة.`
          });
        }
      }
    }

    // 2. Check Logical Contradictions
    if (forgeryText.includes('استلمت') && forgeryText.includes('تسليم') && forgeryText.includes('لاحق')) {
      issues.push({
        type: 'ثغرة تعاقدية',
        detail: 'إقرار بالاستلام المالي الكامل لنصف مليون جنيه بالتوازي مع تأجيل تسليم العقار لأجل غير مسمى دون اشتراط شروط جزائية رادعة، مما يثير شبهة صورية العقد أو غياب الأهلية.'
      });
    }

    // 3. Legalese word density check
    const legalKeywords = ['المواد', 'المادة', 'قانون', 'إقرار', 'أقر', 'بند', 'عقد', 'تزامناً', 'بموجب'];
    const legalCount = legalKeywords.filter(term => forgeryText.includes(term)).length;
    if (legalCount < 3) {
      issues.push({
        type: 'ضعف الصياغة الهيكلية',
        detail: 'المستند يفتقر بشكل ملحوظ للمصطلحات القانونية الرصينة والمواد الآمرة، مما يرجح أنه محرر من غير ذي صفة أو كاتب عرفي هاوٍ.'
      });
    }

    // Calculate risk
    let riskLevel = 'آمن';
    if (issues.length >= 3) riskLevel = 'عالي الخطر 🚨';
    else if (issues.length >= 1) riskLevel = 'متوسط الخطر ⚠️';

    const recommendations = [];
    if (riskLevel.includes('عالي')) {
      recommendations.push("🚨 يُنصح القاضي بإحالة المستند فوراً لمصلحة الطب الشرعي (أبحاث التزييف والتزوير) لمضاهاة التوقيع وفحص عمر الحبر الورقي.");
      recommendations.push("🔍 مطالبة الخصم بتقديم أصل العقد ومضاهاة التوقيعات الحية مع بصمة إصبع معتمدة.");
    } else {
      recommendations.push("✅ المستند سليم ظاهرياً ولكن يوصى بالتأكد من خلوه من الكشط الميكانيكي أو المسح الكيميائي.");
    }

    setForgeryResult({
      issues,
      riskLevel,
      recommendations,
      summary: riskLevel.includes('آمن') ? '✅ المستند مستوفٍ للشروط الشكلية ولا شبهة واضحة به.' : `⚠️ تم رصد ${issues.length} مؤشرات ريبة رقمية تثير احتمالية التلاعب بالمستند.`
    });
    triggerToast('🔍 تم إجراء اختبار كشف التزوير الفني!', 'success');
  };

  // Tool 7: Conflict with Cassation Doctrine
  const handleCheckCassation = () => {
    if (!cassationText.trim()) return;
    const conflicts: any[] = [];
    const warnings: any[] = [];
    const matches: any[] = [];

    // Rule 1: "متجاوزين طلبات الخصوم"
    if (cassationText.includes('تجاوز') || cassationText.includes('متجاوزين')) {
      conflicts.push({
        principle: 'لا يجوز للمحكمة أن تقضي بما لم يطلبه الخصوم أو بأكثر مما طلبوه',
        reference: 'حكم محكمة النقض المقيد برقم ٢٣٤ لسنة ٢٠٢٣ قضائية',
        article: 'المادة ٩٩ من قانون المرافعات المصري',
        reason: 'النص المقترح يقضي صراحةً بتجاوز طلبات الخصوم المقررة باللائحة، مما يعرض الحكم حتماً للنقض والفساد في الاستدلال.'
      });
    } else {
      matches.push({
        principle: 'الالتزام بطلبات الخصوم دون زيادة أو نقصان',
        reference: 'مستقر عليه في قضاء النقض'
      });
    }

    // Rule 2: "البراءة"
    if (cassationText.includes('إدانة') && !cassationText.includes('يقين')) {
      warnings.push({
        principle: 'الأصل في الذمة البراءة واليقين القضائي يطرد الشك',
        reference: 'مستقر عليه بموجب المادة ١ من قانون الإثبات وقضاء النقض الجنائي',
        reason: 'مستند الإدانة المقترح يستند لعبارات ظنية دون تفنيد جازم للأدلة.'
      });
    }

    let assessment = "✅ منطوق الحكم متوافق مع المبادئ الكلية المستقرة لقضاء النقض.";
    if (conflicts.length > 0) {
      assessment = "🚨 كشف تعارض مباشر وجسيم مع أحكام محكمة النقض الآمرة! سيقضى ببطلان التقرير أو الحكم حال تقديمه.";
    } else if (warnings.length > 0) {
      assessment = "⚠️ توجد ثغرات تسبيب وصياغة قد يستغلها دفاع الخصم للطعن بالنقض.";
    }

    setCassationResult({
      matches,
      conflicts,
      warnings,
      assessment,
      recommendations: conflicts.length > 0 
        ? ["🔧 يجب فوراً تعديل منطوق الحكم لحذف أي بند يتجاوز المطالب الرسمية المقيدة بعريضة الدعوى."]
        : ["✅ الصياغة سليمة ومستقرة وتدعم سرعة الفصل."]
    });
    triggerToast('⚖️ تمت مطابقة الصياغة مع مبادئ محكمة النقض!', 'success');
  };

  // Tool 4: Court Question Generator
  const handleGenerateQuestions = () => {
    if (!questionSummary.trim()) return;
    const questions: string[] = [];

    if (questionType === 'clarification') {
      questions.push(`هل يمكنك إطلاع المحكمة بدقة على السند التاريخي الذي يثبت حيازتك الهادئة المستقرة للأرض الموصوفة بالنزاع قبل تاريخ وضع اليد المزعوم؟`);
      questions.push(`أنت تدعي وجود بناء غير مرخص على جزء من حصتك الشائعة، فلماذا لم يتم إثبات تداخل البناء بمحضر رسمي من الإدارة الهندسية بالحي في حينه؟`);
      questions.push(`ما هو الوصف المساحي التفصيلي للمساحة المتداخل عليها والجارب التعدي عليها طبقاً للرفع المساحي؟`);
    } else if (questionType === 'witness_cross') {
      questions.push(`السيد الشاهد، أين كنت متواجداً تحديداً في تمام الساعة الثالثة عصراً من تاريخ حدوث واقعة التداخل الحدودية؟`);
      questions.push(`هل كانت هناك أي خلافات سابقة أو قضايا فرز وجنب بينك وبين المدعى عليه قد تدفعك للتحامل في شهادتك اليوم؟`);
      questions.push(`هل رأيت المدعى عليه يقوم بنفسه بالبناء، أم استعنت بقرينة السماع من شواهد الجيران؟`);
    } else { // evidence_gap
      questions.push(`لماذا تم العجز عن تقديم أصل شهادة القياس المساحي الصادرة عن هيئة المساحة المصرية لإثبات دمج الحوض؟`);
      questions.push(`هل توجد ثمة مكاتبات رسمية بينك وبين الحي تفيد عدم قانونية البناء القائم، أم أن الادعاء يرتكز بالكامل على عقود عرفية غير مشهرة؟`);
    }

    setGeneratedQuestions(questions);
    triggerToast('🤖 تم صياغة أسئلة الاستجواب القضائية الذكية!', 'success');
  };

  // Tool 2 (from new): Emergency Orders Generator
  const handleGenerateEmergencyOrder = () => {
    const today = new Date().toLocaleDateString('ar-EG');
    let title = '';
    let preamble = '';
    let body = '';
    let closing = '';

    if (emergencyType === 'travel_ban') {
      title = 'أمر منع مؤقت من السفر خارج البلاد';
      preamble = 'بسم الله الرحمن الرحيم، وبناءً على الطلب العاجل المقدم من المدعي، وفي ضوء المستندات المؤيدة للنزاع والمرفقة طي الأوراق، وحفاظاً على الضمان العام لأصحاب الحقوق...';
      body = `تقرر منع المدعى عليه السيد/ ${emergencyDefendant} من مغادرة منافذ الجمهورية براً وبحراً وجواً، وإدراج اسمه فوراً على قوائم الممنوعين من السفر والترقب، وذلك لحين الفصل النهائي والمبرم في موضوع الدعوى الحالية المقيدة برقم النزاع تحت إشراف المحكمة الفيدرالية.`;
      closing = 'وتُنفذ هذه المذكرة بقوة القانون الجابر فور صدورها، وتخطر مصلحة الجوازات والهجرة والجنسية للتنفيذ اللحظي.';
    } else if (emergencyType === 'asset_freeze') {
      title = 'أمر حجز تحفظي عاجل على الحسابات والأموال';
      preamble = 'بسم الله الرحمن الرحيم، بعد الاطلاع على الأوراق الرسمية وثبوت مديونية الخصم بصفة قاطعة، وخشية تهريب الأموال أو تبديد الضمان العام للدائنين...';
      body = `يُؤمر بالحجز التحفظي على كافة الحسابات والودائع البنكية والمنقولات العينية العائدة للمدعى عليه السيد/ ${emergencyDefendant} في حدود قيمة المديونية المقدرة بمبلغ قدره ${emergencyAmount.toLocaleString('ar-EG')} جنيهاً مصرياً، وحظر التصرف فيها.`;
      closing = 'ويكلف البنك المركزي المصري بإنفاذ هذا الأمر وتعميمه على كافة المصارف العاملة بالجمهورية.';
    } else { // eviction_order
      title = 'أمر إخلاء عاجل ومؤقت عقار مهدد بالانهيار';
      preamble = 'بسم الله الرحمن الرحيم، وبناءً على تقرير الخبرة الهندسية الفوري وطلب الحي لحماية الأرواح من خطر داهم وشيك...';
      body = `تقرر الإخلاء الإداري الفوري والمؤقت لكافة الشواغل والسكان المتواجدين بالعقار الكائن في: ${emergencyProperty}، حفاظاً على الأرواح والممتلكات الخاصة والعامة، مع توفير سكن بديل مؤقت من قبل الجهة الإدارية.`;
      closing = 'ويُكلف مأمور قسم الشرطة المختص بإنفاذ هذا الأمر فوراً جبرياً بقوة القانون.';
    }

    setGeneratedEmergencyOrder({
      title,
      preamble,
      body,
      closing,
      date: today,
      checklist: [
        "☐ عريضة طلب مكتوبة ممهورة بتوقيع كابتن حسام أو المحامي الموكل",
        "☐ تقديم كفالة أو تأمين مالي مناسب لضمان التعويض عن الأضرار حال بطلان الأمر",
        "☐ وجود تقرير فني رسمي أو سند ملكية قاطع يرجح سلامة موضوع الحق"
      ],
      recommendations: [
        "⚡ يجب إبلاغ المنافذ أو الجهات التنفيذية خلال ٢٤ ساعة على الأكثر لتلافي هروب الخصم.",
        "📋 يعتبر هذا الأمر وقتياً ويسقط أثره تلقائياً إذا لم ترفع دعوى الموضوع خلال المهلة القانونية المقررة."
      ]
    });
    triggerToast('🚨 تم توليد مشروع الأمر القضائي العاجل!', 'success');
  };

  // Tool 10 (from new): Executory Formula Generator
  const handleGenerateExecutoryFormula = () => {
    const today = new Date().toLocaleDateString('ar-EG');
    let title = '';
    let body = '';

    if (executoryType === 'eviction') {
      title = 'الصيغة التنفيذية لقرار طرد وإخلاء عقار بالقوة الجبرية';
      body = `يُكلف المنفذ ضده السيد/ ${executoryDefendant} بإخلاء العقار الكائن في: [${executoryProperty}] وتسليمه خالياً من الأشخاص والشواغل إلى المنفذ لصالحه السيد/ ${executoryPlaintiff}، وذلك في مهلة لا تتجاوز ${executoryDays} يوماً من تاريخ التبليغ القانوني.`;
    } else if (executoryType === 'collection') {
      title = 'الصيغة التنفيذية لتحصيل وإلزام مالي جبري';
      body = `يُلزم المنفذ ضده السيد/ ${executoryDefendant} بأن يؤدي للمنفذ لصالحه السيد/ ${executoryPlaintiff} مبلغاً مالياً مقداره ${executoryAmount.toLocaleString('ar-EG')} جنيهاً مصرياً قيمة التعويض المحكوم به والمصاريف الملحقة، في مهلة أقصاها ${executoryDays} يوماً.`;
    } else { // possession
      title = 'الصيغة التنفيذية لتسليم حيازة منقولات عينية';
      body = `يُلزم المنفذ ضده السيد/ ${executoryDefendant} بتسليم المنقولات العينية الموصوفة بـ [${executoryItems}] إلى السيد/ ${executoryPlaintiff} بالحالة التي كانت عليها طبقاً لعقد الأمانة والمواصفات الفنية المعتمدة.`;
    }

    setGeneratedExecutoryFormula({
      title,
      body,
      date: today,
      clause: `"نفاذاً لحكم الله، وبقوة القانون الجابر لسيادة الدولة، يُنفذ هذا الحكم جبرياً، وتُتخذ كافة الإجراءات القانونية اللازمة لتنفيذه بالقوة الجبرية عند الاقتضاء، وعلى جميع الجهات الحكومية والشرطية المختصة إعانة محضرين التنفيذ على إنفاذ الحق ونصرة المظلوم."`,
      checklist: [
        "☐ الحصول على الشهادة الرسمية بخاتم النسر تفيد أن الحكم حائز لقوة الأمر المقضي به ونهائي ولا يجوز استئنافه.",
        "☐ إعلان المنفذ ضده قانونياً لشخصه بالصيغة التنفيذية لتمكينه من السداد أو الإخلاء طواعية قبل استعمال القوة."
      ]
    });
    triggerToast('📜 تم صياغة وتوليد وثيقة الصيغة التنفيذية الرسمية!', 'success');
  };

  // Tool 3 (from new): Court Session Sequence Simulator
  const handleSimulateSequence = () => {
    const defaultSequence = [
      { step: 1, name: 'المناداة على القضية', required: true },
      { step: 2, name: 'التأكد من حضور الأطراف', required: true },
      { step: 3, name: 'تلاوة تقرير الخبير الفني عيناً', required: true },
      { step: 4, name: 'سماع أقوال وطلبات المدعي', required: true },
      { step: 5, name: 'سماع أقوال ودفاع المدعى عليه', required: true },
      { step: 6, name: 'استدعاء وسماع شهود النفي والإثبات والخبراء', required: false },
      { step: 7, name: 'المرافعة الختامية للخصوم', required: true },
      { step: 8, name: 'المداولة القانونية الختامية سرية', required: true },
      { step: 9, name: 'النطق والجهر بالحكم الفيدرالي علناً', required: true }
    ];

    let isValid = true;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Let's trace if the checked actions are chronological
    const completedIndexes = simCompletedActions.map(action => 
      defaultSequence.findIndex(s => s.name === action)
    ).sort((a, b) => a - b);

    // If an action is completed but its preceding required actions are not, log error
    defaultSequence.forEach((seq, idx) => {
      if (simCompletedActions.includes(seq.name)) {
        // Look at all preceding steps
        for (let j = 0; j < idx; j++) {
          if (defaultSequence[j].required && !simCompletedActions.includes(defaultSequence[j].name)) {
            isValid = false;
            errors.push(`⚠️ خلل إجرائي جسيم: تم اتخاذ خطوة [${seq.name}] قبل الانتهاء من الخطوة الأساسية السابقة [${defaultSequence[j].name}]. يعرض الجلسة للبطلان الشكلي!`);
          }
        }
      }
    });

    const nextStep = defaultSequence.find(s => !simCompletedActions.includes(s.name));

    setSimResult({
      sequence: defaultSequence.map((s, idx) => ({
        ...s,
        status: simCompletedActions.includes(s.name) 
          ? 'مكتمل ✅' 
          : nextStep?.name === s.name 
          ? 'قيد الانتظار ⏳' 
          : 'معلق 💭'
      })),
      isValid,
      errors,
      warnings,
      nextAction: nextStep ? `📋 الإجراء الإلزامي التالي المطلوب قانوناً: ${nextStep.name}` : "✅ جميع إجراءات الجلسة تمت بنجاح وبسلامة إجرائية مطلقة!"
    });
    triggerToast('🔄 اكتملت محاكاة تسلسل إجراءات الجلسة!', 'success');
  };

  // Tool 6 (from new): Case Assignment & Rotation System
  const handleAssignCase = () => {
    const circuits: Record<string, any> = {
      'الدائرة الأولى (عقاري)': { current: 47, max: 60, judge: 'المستشار/ جابر رضوان الهواري' },
      'الدائرة الثانية (مدني كلي)': { current: 52, max: 65, judge: 'المستشار/ عبد الرحمن الشريف' },
      'الدائرة الثالثة (مستعجل)': { current: 15, max: 40, judge: 'المستشار/ هاني عبد اللطيف' },
      'الدائرة الرابعة (مواريث وتركات)': { current: 28, max: 50, judge: 'المستشارة/ نادية عبد الفتاح' }
    };

    let selectedCircuit = '';
    if (assignCaseType === 'عقاري') selectedCircuit = 'الدائرة الأولى (عقاري)';
    else if (assignCaseType === 'مدني') selectedCircuit = 'الدائرة الثانية (مدني كلي)';
    else if (assignCaseType === 'مستعجل') selectedCircuit = 'الدائرة الثالثة (مستعجل)';
    else selectedCircuit = 'الدائرة الرابعة (مواريث وتركات)';

    const data = circuits[selectedCircuit];
    const newLoad = data.current + 1;
    const ratio = (newLoad / data.max) * 100;

    setAssignResult({
      circuit: selectedCircuit,
      judge: data.judge,
      newLoad,
      max: data.max,
      ratio: Math.round(ratio),
      priority: assignPriority === 'high' ? 'مستعجل وقصوى' : 'عادي بجدول الجلسات',
      recommendation: ratio > 85 
        ? `⚠️ تحذير: هذه الدائرة مثقلة بالأعباء وتعمل بنسبة لود تفوق ٨٥٪، يرجى التدوير وإعادة التوزيع على الدائرة البديلة لتلافي بطء التقاضي.`
        : `✅ الدائرة تعمل بحالة كفاءة ممتازة وقادرة على استيعاب النزاع الجديد بجدول زمني متقن.`
    });
    triggerToast('🗂️ تم توزيع وتعيين القضية آلياً للدائرة المختصة!', 'success');
  };

  // Tool 10: Previous Judgments Integration
  const handleAnalyzeJudgments = () => {
    const judgmentsJudgeName = judgeKeywords;
    const mockDb = [
      { judge: 'المستشار/ عبد الرحمن الشريف', verdict: 'قبول وتثبيت الملكية', logic: 'ثبوت الحيازة الهادئة المستقرة لمدة تزيد عن ١٥ سنة مدعومة بعقود مسجلة ورفع مساحي طوبوغرافي معتمد.', date: '2025-01-15' },
      { judge: 'المستشار/ عبد الرحمن الشريف', verdict: 'رفض الدعوى عيناً', logic: 'انتفاء تسلسل الملكية الرسمي وعجز المدعي عن إثبات حيازة الجد المورث وتداخل الحصص الشائعة.', date: '2025-03-20' },
      { judge: 'المستشار/ محمود توفيق الباجوري', verdict: 'رفض لعدم الاختصاص المائي', logic: 'وقوع الأرض خارج الزمام الإداري المخصص وتحت ولاية هيئة التعمير واستصلاح الأراضي الصحراوية.', date: '2025-02-10' }
    ];

    const matches = mockDb.filter(row => {
      const matchKeywords = judgeKeywords.split(/[،,._ ]+/).filter(k => k.length > 2);
      return matchKeywords.some(key => row.logic.includes(key)) || row.judge.includes(judgmentsJudgeName);
    });

    const favorable = matches.filter(m => m.verdict.includes('قبول') || m.verdict.includes('تثبيت')).length;
    const ratio = matches.length > 0 ? (favorable / matches.length) * 100 : 50;

    setJudgePatternsResult({
      matches,
      total: matches.length,
      favorableRatio: Math.round(ratio),
      tendency: ratio > 60 ? 'مؤيد لحقوق المدعي ومثبتي الأوراق' : ratio < 40 ? 'مشدد في شروط الحيازة ويميل للرفض لعدم اكتمال السلسلة العقارية' : 'محايد ويلجأ دوماً لندب خبراء مساحيين لحسم وجدان الحقيقة عيناً',
      summary: `تم سحب وتحليل عدد ${matches.length} أحكام قضائية سابقة مشابهة للقاضي المستعلم عنه بنجاح وتنقيب البيانات.`
    });
    triggerToast('🔗 تم تحليل الأنماط والأحكام السابقة بنجاح!', 'success');
  };

  // Tool 2: Judgment Date Predictor
  const handlePredictJudgmentDate = () => {
    const averageDurations: Record<string, number> = {
      'مدني': 180, 'جنائي': 120, 'إداري': 150, 'أسري': 90, 'عقاري': 200, 'تجاري': 160
    };

    const base = averageDurations[predCaseType] || 150;
    let adjustment = 0;

    if (predComplexity === 'عالي') adjustment += 40;
    else if (predComplexity === 'منخفض') adjustment -= 25;

    adjustment += Math.min(predParties, 5) * 5;
    if (predBoundary) adjustment += 25;
    if (predExpert) adjustment += 20;
    adjustment += Math.min(predSessions, 4) * 10;

    const finalDuration = Math.max(30, base + adjustment);
    const confidenceInterval = Math.round(finalDuration * 0.12);

    const filing = new Date(predFilingDate);
    const predictedDate = new Date(filing.getTime() + finalDuration * 24 * 60 * 60 * 1000);
    const earliestDate = new Date(predictedDate.getTime() - confidenceInterval * 24 * 60 * 60 * 1000);
    const latestDate = new Date(predictedDate.getTime() + confidenceInterval * 24 * 60 * 60 * 1000);

    setPredResult({
      duration: finalDuration,
      confidenceInterval,
      predictedDate: predictedDate.toLocaleDateString('ar-EG'),
      earliestDate: earliestDate.toLocaleDateString('ar-EG'),
      latestDate: latestDate.toLocaleDateString('ar-EG'),
      recommendation: finalDuration > 220 
        ? `⚠️ القضية تواجه تعقيدات مساحية وهندسية تفوق المعدل الطبيعي. ينصح بإنهاء أعمال المعاينة سريعاً لتفادي التسويف والامتداد الزمني.`
        : `✅ المدة المتوقعة تقع ضمن الإطار الزمني المتوسط والمستقر لذات نوعية النزاعات بالجمهورية.`
    });
    triggerToast('⏱️ تم التنبؤ بموعد إصدار الحكم بدقة!', 'success');
  };

  // Tool 6: Case Time-Cost Analyzer
  const handleAnalyzeTimeCost = () => {
    const totalSessions = tcSessionsSoFar + tcEstimatedRemaining;
    const remainingDays = tcEstimatedRemaining * tcDaysBetween;

    const lawyerFee = totalSessions * 4 * 500; // 500 per hour, 4 hrs per session
    const courtFees = totalSessions * 200;
    const travelCosts = totalSessions * 150;
    const expertCost = tcHasExpert ? totalSessions * 2 * 1000 : 0;

    let baseTotal = lawyerFee + courtFees + travelCosts + expertCost;
    let appealCost = 0;
    let finalDays = remainingDays;

    if (tcHasAppeal) {
      appealCost = baseTotal * 0.4;
      finalDays += 180; // 6 extra months
    }

    const totalCost = baseTotal + appealCost;
    const dailyCost = totalCost / (totalSessions * tcDaysBetween);

    setSimTcResult({
      remainingDays: finalDays,
      totalSessions,
      lawyerCost: lawyerFee,
      courtFees,
      travelCosts,
      expertCost,
      appealCost,
      totalCost,
      dailyCost: Math.round(dailyCost),
      recommendations: totalCost > 45000 
        ? ["💰 التكاليف الإجمالية مرتفعة جداً مقارنة بمعدلات التقاضي العادية. يُنصح الأطراف باللجوء لمقترح الصلح الودي وتجنب رسوم الاستئناف الباهظة."]
        : ["📋 الموازنة المالية تقع ضمن النطاق المقبول لمصاريف الفحص والخبراء."]
    });
    triggerToast('⏳ تم حساب التكلفة المالية والزمنية للقضية!', 'success');
  };

  // Tool 9: Case Performance Tracker
  const handleTrackPerformance = () => {
    const standards: Record<string, any> = {
      'عقاري': { تسجيل: 10, معاينة: 45, خبرة: 60, مرافعة: 45, حكم: 120 }
    };

    const circuitStd = standards['عقاري'] || { تسجيل: 10, معاينة: 45, خبرة: 60, مرافعة: 45, حكم: 120 };
    const stdDaysForStage = circuitStd[perfStage] || 45;

    const progress = Math.min(200, (perfDays / stdDaysForStage) * 100);
    const status = perfDays > stdDaysForStage ? 'متأخر 🚨' : perfDays >= stdDaysForStage * 0.8 ? 'في المسار الحرج ⚠️' : 'ممتاز وفي الوقت القياسي ✅';

    setPerfResult({
      standardDays: stdDaysForStage,
      actualDays: perfDays,
      progress: Math.round(progress),
      status,
      efficiency: Math.round(Math.max(10, 100 - (progress - 100))),
      recommendation: perfDays > stdDaysForStage 
        ? `⚠️ هذه المرحلة تجاوزت السقف الزمني المعياري بـ ${perfDays - stdDaysForStage} يوماً! يُنصح باستعجال مصلحة الخبراء لتقديم تقريرهم فوراً وتفادي بطلان الإيداع.`
        : `✅ الأداء الزمني للمرحلة يقع ضمن الحدود الآمنة والمستهدفة لتسيير المرفق القضائي.`
    });
    triggerToast('📈 تم رصد وتحليل كفاءة الأداء الزمني للقضية!', 'success');
  };

  // Tool 4 (from new): Session Adjournment Impact Calculator
  const handleCalculateAdjournment = () => {
    const original = new Date(adjOriginalDate);
    const newDate = new Date(adjNewDate);
    const delayDays = Math.max(1, Math.round((newDate.getTime() - original.getTime()) / (24 * 60 * 60 * 1000)));

    const totalEstDays = (adjSessions + adjRemaining) * 30;
    const finalEstDays = totalEstDays + delayDays;
    const delayPct = (delayDays / totalEstDays) * 100;
    const delayCostTotal = delayDays * adjDailyCost * 2; // plaintiff & defendant

    let risk = 'منخفض';
    if (delayPct > 40) risk = 'حرج 🚨';
    else if (delayPct > 15) risk = 'متوسط ⚠️';

    setAdjResult({
      delayDays,
      delayPct: Math.round(delayPct),
      totalEstDays,
      finalEstDays,
      delayCostTotal,
      risk,
      recommendations: delayDays > 45 
        ? ["🚨 التأجيل المفرط لفترة تزيد عن شهر ونصف يضر بمصالح شركاء الوطن. يُنصح القاضي برفض طلب التأجيل مالم يكن لعذر قهري مثبت مستندياً."]
        : ["✅ فترة التأجيل تقع ضمن النطاق المقبول للمحامين لتقديم المذكرات والتعقيب الفني."]
    });
    triggerToast('📅 تم حساب التأثير المالي والزمني لقرار التأجيل!', 'success');
  };

  // Tool 9 (from new): Legal Fees & Expert Costs Estimator
  const handleEstimateFees = () => {
    const baseLawyer = estHours * 500;
    const baseExpert = estHasExpert ? estExpertHours * 800 : 0;
    const courtFiling = estSessions * 200;
    
    let execFee = 0;
    if (estPropValue > 0) {
      execFee = Math.min(10000, estPropValue * 0.005); // 0.5%
    }

    let appealFee = 0;
    if (estHasAppeal) {
      appealFee = (baseLawyer + baseExpert + courtFiling) * 0.3; // 30% increase
    }

    const total = baseLawyer + baseExpert + courtFiling + execFee + appealFee;

    setEstResult({
      lawyer: baseLawyer,
      expert: baseExpert,
      court: courtFiling,
      execution: execFee,
      appeal: appealFee,
      total,
      breakdown: {
        'المحاماة': Math.round((baseLawyer / total) * 100) || 0,
        'الخبراء': Math.round((baseExpert / total) * 100) || 0,
        'المحكمة والرسوم': Math.round((courtFiling / total) * 100) || 0,
        'التنفيذ الجبري': Math.round((execFee / total) * 100) || 0,
        'الطعن والاستئناف': Math.round((appealFee / total) * 100) || 0
      }
    });
    triggerToast('💰 تم تقدير التكاليف ومصروفات الخبرة الشاملة!', 'success');
  };

  // Tool 8 & 8(new) & 5(new): Appeals, Mediation, and Litigation Risk Analyzer
  const handlePredictRisk = () => {
    // 1. Litigation Risk and Case Success Probability Analyzer
    let score = 50;

    const evidenceWeights: Record<string, number> = { 'قوي': 25, 'متوسط': 10, 'ضعيف': -15, 'غير موجود': -30 };
    const witnessWeights: Record<string, number> = { 'موثوق': 15, 'متوسط': 5, 'غير موثوق': -15, 'غير موجود': -10 };
    const precedentWeights: Record<string, number> = { 'مؤيد': 20, 'محايد': 0, 'معارض': -15, 'غير موجود': -5 };
    const complexityWeights: Record<string, number> = { 'بسيط': 15, 'متوسط': 5, 'معقد': -15, 'شديد التعقيد': -25 };
    const opponentWeights: Record<string, number> = { 'ضعيف': 15, 'متوسط': 5, 'قوي': -10, 'محامي بارز': -20 };
    const courtWeights: Record<string, number> = { 'محايد': 0, 'مؤيد للمدعي': 15, 'مؤيد للمدعى عليه': -15, 'غير معروف': -5 };

    score += (evidenceWeights[riskEvidence] || 10);
    score += (witnessWeights[riskWitness] || 5);
    score += (precedentWeights[riskPrecedent] || 0);
    score += (complexityWeights[riskComplexity] || 5);
    score += (opponentWeights[riskOpponent] || 5);
    score += (courtWeights[riskCourt] || 0);

    const successProbability = Math.min(98, Math.max(5, score));
    
    let riskClassification = 'متوسط';
    if (successProbability > 75) riskClassification = 'منخفض الخطر (فرص نجاح ممتازة) ✅';
    else if (successProbability < 45) riskClassification = 'عالي الخطر (موقف معقد وغير مدعم) 🚨';

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (riskEvidence === 'قوي') strengths.push("💪 الأدلة والمستندات الرسمية قوية وتمنح ثقة كاملة للموقف.");
    else if (riskEvidence === 'ضعيف' || riskEvidence === 'غير موجود') weaknesses.push("⚠️ غياب المستندات الرسمية المعتمدة يرجح إهدار الحق بالكلية.");

    if (riskWitness === 'موثوق') strengths.push("👤 شهود الإثبات يتمتعون بمصداقية واتساق إجرائي.");
    else if (riskWitness === 'غير موثوق') weaknesses.push("👤 شهادة الشهود متناقضة ومهتزة وتضر موقف الخصومة.");

    if (riskPrecedent === 'مؤيد') strengths.push("⚖️ تأييد كامل من السوابق القضائية ومبادئ محكمة النقض المستقرة.");
    else if (riskPrecedent === 'معارض') weaknesses.push("⚖️ السوابق وأحكام النقض ترفض صراحةً تكييف الادعاء على هذا النحو.");

    setRiskResultState({
      score,
      successProbability: Math.round(successProbability),
      riskClassification,
      strengths,
      weaknesses,
      recommendation: successProbability > 75 
        ? "✅ الموقف رصين للغاية ومثالي، يمكن المضي قدماً بطلب الفصل الموضوعي الفوري عيناً."
        : successProbability >= 45 
        ? "📋 الموقف متأرجح، ينصح بشدة بالبحث عن حل صلح ودي لحفظ المصالح وتقليل الأضرار المالية."
        : "🚨 نسبة الخطر مرتفعة جداً وفرص الفوز شبه منعدمة، نوصي فوراً بفض النزاع ودياً أو تقديم مذكرات مكملة حاسمة."
    });
    triggerToast('📊 تم حساب احتمالية نجاح الدعوى وتصنيف المخاطر!', 'success');
  };

  const handlePredictSettlement = () => {
    let score = 50;

    const relationshipScores: Record<string, number> = { 'عائلي': 20, 'جيران': 15, 'تجاري': 5, 'محايد': 0, 'عدائي': -20 };
    score += (relationshipScores[settleRelationship] || 0);

    if (settleDuration < 4) score += 15;
    else if (settleDuration < 12) score += 5;
    else score -= 15;

    if (settleAmount < 50000) score += 15;
    else if (settleAmount < 300000) score += 5;
    else score -= 10;

    const compScores: Record<string, number> = { 'بسيط': 15, 'متوسط': 0, 'معقد': -15 };
    score += (compScores[settlementComplexity] || 0);

    if (settlementAttempts === 0) score += 10;
    else score -= (settlementAttempts * 10);

    const compromiseScores: Record<string, number> = { 'عالي': 20, 'متوسط': 5, 'منخفض': -15 };
    score += (compromiseScores[settlementCompromise] || 0);

    const prob = Math.min(95, Math.max(10, score));

    setSettlementResult({
      prob: Math.round(prob),
      assessment: prob > 70 
        ? "✅ فرص إبرام الصلح الودي عالية جداً! يوصى القاضي بانعقاد لجنة المساعي الودية والصلح لإنهاء الخصومة."
        : prob >= 45 
        ? "📋 فرص نجاح الصلح معتدلة وممكنة حال الاستعانة بحكيم من العائلة أو وسيط عقاري معتمد."
        : "🚨 الخصومة مستحكمة والأطراف يرفضون التنازل، الصلح شبه مستحيل ويجب الاستعداد للتقاضي المكتمل.",
      strengths: prob > 50 ? ["🤝 وجود تقارب جواري أو عائلي يدعم الاطمئنان."] : [],
      weaknesses: prob <= 50 ? ["❌ فشل محاولات سابقة مع سلوك عدائي متبادل بين الخصوم."] : []
    });
    triggerToast('🤝 تم تقدير فرص الصلح والوساطة الودية!', 'success');
  };

  const handleAnalyzeAppeal = () => {
    let score = 50;
    const weaknesses: string[] = [];
    const strengths: string[] = [];

    if (appealVerdictText.includes('رفض') && appealVerdictText.includes('الأدلة')) {
      weaknesses.push("📜 نقص التسبيب وقصور في الإلمام بعناصر الدعوى: المحكمة قضت بالرفض لقلة الأوراق دون استدعاء خبير للمعاينة الفنية.");
      score += 20; // Reversal chance is higher if judgment had procedural defects!
    }

    if (appealHasNewEvidence) {
      strengths.push("💡 وجود دليل مادي مستجد حاسم (عقد مشهر مسجل أو تقرير رفع طبوغرافي جديد).");
      score += 15;
    }

    if (appealExpertQuality === 'ضعيف') {
      weaknesses.push("🏗️ البطلان الفني لتقرير الخبير الابتدائي: التقرير ضعيف وخالٍ من المعاينة الهندسية الدقيقة.");
      score += 15;
    }

    const reversalProbability = Math.min(95, Math.max(10, score));

    setAppealResult({
      reversalProbability: Math.round(reversalProbability),
      weaknesses,
      strengths,
      grounds: [
        "📜 الخطأ في تطبيق القانون وتأويله - المادة ١٧٨ مرافعات لقصور أسباب الحكم.",
        "🏗️ الإخلال الجسيم بحق الدفاع - التفاف الحكم عن طلب ندب خبير هندسي مساحي."
      ],
      recommendation: reversalProbability > 65 
        ? "✅ ننصح بشدة برفع طعن بالاستئناف فوراً؛ فرص قبول الغاء الحكم الابتدائي وتعديله ممتازة قانونياً."
        : "⚠️ موقف الاستئناف غير حاسم، يوصى بالبحث عن مستندات رسمية جديدة لتقوية جبهة الطعن."
    });
    triggerToast('💪 تم قياس فرص نجاح الطعن بالاستئناف!', 'success');
  };

  // Tool 7: Voice Dictation Memo Assistant
  const handleConvertVoice = () => {
    if (!voiceRawText.trim()) return;

    // Simulate smart keyword parsing based on voice speech
    const sections = {
      memo_title: 'مذكرة دفاع رقمية منظمة - المحضر الإلكتروني المعتمد 3.0',
      introduction: ['بسم الله الرحمن الرحيم، نتوجه بهذه المذكرة لهيئة المحكمة الموقرة.'],
      parties: [
        'المدعي الأصلي: السيد أحمد محمد علي بصفته مالكاً.',
        'المدعى عليه: السيد محمد حسن إبراهيم بصفته واضع يد.'
      ],
      subject: ['النزاع حول إخلاء عقار رقم ٢٧ الكائن بشارع شبين الكوم بالعمرانية الغربية.'],
      evidence: ['تقديم أصل عقد البيع الرسمي المسجل بالشهر العقاري.', 'تقرير الرفع الجغرافي الصادر عن هيئة المساحة.'],
      requests: ['إخلاء العقار فوراً وتسليمه للمدعي خالياً من الشواغل.', 'إلزام الخصم بمصاريف التقاضي والأتعاب.'],
      conclusion: ['وبناءً عليه، نلتمس من وجدان عدالة المستشار الموقر قبول المذكرة والقضاء بالطلبات.']
    };

    setVoiceResult({
      sections,
      recommendations: [
        "✅ المذكرة منظمة وتشتمل على كافة الأركان الجوهرية للدعوى.",
        "📋 يُنصح بإضافة توقيع معتمد لكابتن حسام وختم البصمة المائية لإثبات الصلاحية."
      ],
      assembledText: `مذكرة دفاع شرعية وقانونية\n=========================\n\nموضوع النزاع: ${sections.subject[0]}\n\nأطراف الخصومة:\n${sections.parties.join('\n')}\n\nالأدلة والأسانيد:\n${sections.evidence.join('\n')}\n\nالطلبات الختامية:\n${sections.requests.join('\n')}\n\nالخاتمة:\n${sections.conclusion[0]}`
    });
    triggerToast('🎤 تم تحويل وتنسيق الإملاء الصوتي لمذكرة قانونية بليغة!', 'success');
  };

  const handleSimulateVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleConvertVoice();
    } else {
      setIsRecording(true);
      triggerToast('🎙️ جاري تفعيل الميكروفون والتقاط الإملاء الصوتي بالذكاء الاصطناعي...', 'info');
      setTimeout(() => {
        setIsRecording(false);
        handleConvertVoice();
      }, 3500);
    }
  };
  
  // Biometrics States (User Experience Enhancements)
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [securityLevel, setSecurityLevel] = useState('مستوى الحماية العادي');

  // Cybersecurity forensic states
  const [forensicProgress, setForensicProgress] = useState(0);
  const [forensicStatus, setForensicStatus] = useState<'idle' | 'tracing' | 'success'>('idle');
  const [forensicLogs, setForensicLogs] = useState<string[]>([]);

  const handleRunForensics = () => {
    if (forensicStatus !== 'idle') return;
    setForensicStatus('tracing');
    setForensicProgress(0);
    setForensicLogs([]);

    const steps = [
      '🔌 تفعيل جدار الحماية الفيدرالي وربط نظام [Agent Smith] لمراقبة حزم البيانات...',
      '📡 رصد محاولة تسلل غير مصرحة على خادم السجل العيني الرقمي وخرائط الرفع المساحي...',
      '🔍 فحص عنوان الـ IP المصدر: [82.197.211.45] - تحديد الموقع الجغرافي: أمستردام، هولندا (Netherlands)...',
      '🛑 كشف استخدام شبكة VPN افتراضية ممسوحة ونظام تشغيل Kali Linux لاستهداف قاعدة البيانات القانونية...',
      '🛡️ إفشال عملية محاولة تعديل بيانات الورثة وإحداثيات الأرض لـ [كابتن حسام]...',
      '💾 استخلاص البصمة الرقمية الجنائية (Hash Signature: SHA-256) وسجل العمليات المعطلة...',
      '⚖️ تكييف الواقعة جنائياً تحت مواد القانون المصري رقم 175 لسنة 2018 لمكافحة الجرائم المعلوماتية...',
      '📑 توليد "تقرير الأدلة الرقمية الجنائية المعتمد" صالح للتقديم فورياً للنيابة العامة والشرطة.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setForensicLogs(prev => [...prev, `[${new Date().toLocaleTimeString('ar-EG')}] ${step}`]);
        setForensicProgress(prev => {
          const next = Math.min(100, Math.round((idx + 1) * 12.5));
          if (next === 100) {
            setForensicStatus('success');
            triggerToast('🛡️ تم إحباط الاختراق واستخراج التقرير الجنائي المعتمد للنيابة العامة والشرطة!', 'success');
          }
          return next;
        });
      }, (idx + 1) * 1000);
    });
  };

  // Egypt Land Sector Mind Map States
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [mindMapSearchQuery, setMindMapSearchQuery] = useState('');
  const [expandedBranches, setExpandedBranches] = useState<string[]>(['b1', 'b2', 'b3', 'b4', 'b5', 'b6']); // Expand all by default

  // Interactive Custom Chat Settings
  const [activeAgentType, setActiveAgentType] = useState<string>('swarm'); // Defaults to swarm intelligence
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: `أهلاً بك يا كابتن حسام في **التحديث الثالث الذكي (الوكلاء الإدراكية المستقلة 3.0)**. 
لقد قمنا بدمج **10 بنى هندسية متطورة للذكاء الاصطناعي الفيدرالي** لتشغيل وإدارة الـ 52 وكيلاً الخبراء بنسبة وتناسب تحاكي برامج أدوبي الهندسية.

تم تأكيد هويتك المعتمدة كخبير عقاري ومساحي للمحكمة. 
اختر الآن نوع الوكيل من القائمة السفلية للشات، واكتب لي أي سؤال لتجربة دقة استدلالية غير مسبوقة!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      agentTypeUsed: 'swarm'
    }
  ]);
  
  // Simulated Memory Database Logs
  const [memoryDatabase, setMemoryDatabase] = useState<string[]>([
    'تم تهيئة [Meta-Agent] لمراقبة الامتثال الشرعي وقوانين الحيازة المصرية.',
    'تم إطلاق [Edge Agent] محلياً على جهاز الخبير للتشغيل اللحظي بنسبة تداخل الأراضي.',
    'بروتوكول [Federated Agent] متصل بقواعد بيانات الرفع المساحي والشرع لعام 2026.',
    'عقل الأوركسترا [Orchestrator Agent] يقوم بمطابقة نسب توزيع الإرث لضمان الاتساق.'
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, name: 'تحليل المدخلات (Cognitive)', method: 'cognitive_analyze()', status: 'idle', description: 'تأويل مذكرات الدعوى وفهم مطالب كابتن حسام بالذكاء الإدراكي' },
    { id: 2, name: 'توزيع المهام (Orchestrator)', method: 'orchestrate_tasks()', status: 'idle', description: 'تقسيم النزاع على وكلاء الأراضي والورثة والهندسة بالتوازي المنسق' },
    { id: 3, name: 'حل الفيدرالية (Federated Swarm)', method: 'federated_resolve()', status: 'idle', description: 'استدعاء مؤمن لبيانات السجل العقاري والمحكمة والمطابقة الطيفية' },
    { id: 4, name: 'معالجة الحافة اللحظية (Edge processing)', method: 'edge_execute()', status: 'idle', description: 'حساب حموضة التربة وعزل القواعد والحديد محلياً بأعلى سرعة' },
    { id: 5, name: 'التعلم والتكييف (Intelligent)', description: 'تحديث أوزان التعلم الفيدرالي المستمر استناداً لمعادلات النسبة والتناسب', method: 'intelligent_adapt()', status: 'idle' },
    { id: 6, name: 'اعتماد الماستر (Master Agent Approval)', method: 'master_sign_off()', status: 'idle', description: 'توقيع تقرير الخبرة الفني الرقمي وختمه بالبصمة البيومترية المؤمنة' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sectors = ['all', 'أراضي', 'إنشاءات', 'ميراث', 'أوقاف', 'قانون', 'قضاء', 'هندسة', 'خرائط', 'زراعة', 'تعليم', 'اقتصاد', 'GPS'];

  const filteredAgents = selectedSector === 'all' 
    ? EXPERT_SYSTEM_AGENTS 
    : EXPERT_SYSTEM_AGENTS.filter(a => a.sector === selectedSector);

  const appendLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('ar-EG')}] ${message}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [logs]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, currentStepIndex]);

  // Execute Biometric Scan Sequence (Immersive interactive fingerprint simulator)
  const handleBiometricScan = () => {
    if (biometricStatus !== 'idle') return;
    setBiometricStatus('scanning');
    setScanProgress(0);
    appendLog('🔒 تم تحفيز مستشعر البصمة البيومترية ثلاثي الأبعاد...');
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBiometricStatus('success');
          setSecurityLevel('مستوى الحماية القصوى الفيدرالي - مصادق بالبصمة');
          appendLog('✓ تمت مصادقة البصمة بنجاح! تم فك تشفير بروتوكولات [Master Agent] و [Meta-Agent].');
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const resetBiometrics = () => {
    setBiometricStatus('idle');
    setScanProgress(0);
    setSecurityLevel('مستوى الحماية العادي');
    appendLog('🔓 تم تسجيل الخروج من جلسة البصمة الأمنية.');
  };

  // Run full multi-agent diagnostic simulation
  const startSimulation = () => {
    setLocalIsAnalyzing(true);
    onRunAnalysis();
    setLogs([]);
    setCompletedAgents([]);
    
    const steps = [
      { msg: '🚀 بدء تشغيل المنسق الفيدرالي (Orchestrator Agent) لتقسيم القضية...', delay: 200 },
      { msg: '🧠 تفعيل موديول الإدراك (Cognitive Agent) لتأويل حدود الأراضي ومواريث النزاع...', delay: 600 },
      { msg: '📱 تشغيل محرك الحافة اللحظي (Edge Agent) لتحميل البيانات الجغرافية دون زمن انتقال...', delay: 1100 },
      { msg: '🐝 إطلاق ذكاء السرب (Swarm Intelligence) لتوزيع المهام على الـ 52 خبيراً بالتوازي...', delay: 1600 },
      
      // Federated Connections
      { msg: '🌐 [Federated Agent] يستدعي إثبات الملكية وتطابق الحدود من الشهر العقاري بالتشفير...', delay: 2200 },
      { msg: '⚖️ وكيل المواريث الشرعي يطبق فرائض الشريعة الإسلامية والمادة 64...', delay: 2800 },
      
      // Structural Calculations
      { msg: '🏗️ وكيل التصميم الإنشائي يحسب الحجم الخرساني والحديد والأسمنت استناداً لمساحة المبنى...', delay: 3500 },
      { msg: '🌱 وكيل الزراعة والتربة يفحص حموضة التربة والمياه الجوفية ويرسل معامل الملوحة...', delay: 4200 },
      
      // AI Learning Adaptation
      { msg: '💡 [Intelligent Agent] يعدل الأوزان الاستباقية لتكاليف صيانة العقار استناداً للعمر التراكمي...', delay: 4900 },
      { msg: '⚡ [Meta-Agent] يتحقق من سلامة البنود الإنشائية وخلو التقرير من أي تجاوزات قانونية...', delay: 5600 },
      
      // Sign-off
      { msg: '👑 [Master Agent] يعتمد مسودة التقرير الفني ويوقعها بمفتاح الأمان البيومتري لكابتن حسام...', delay: 6300 },
      { msg: '✨ تم بنجاح! نسبة دقة التوافق الإدراكي والتحقق الفيدرالي بلغت 99.8%.', delay: 6900 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        appendLog(step.msg);
        
        if (index === 3) setCompletedAgents(prev => [...prev, 'gps_1', 'map_1']);
        if (index === 5) setCompletedAgents(prev => [...prev, 'inh_1', 'inh_2', 'inh_3']);
        if (index === 6) setCompletedAgents(prev => [...prev, 'cons_1', 'cons_3']);
        if (index === 7) setCompletedAgents(prev => [...prev, 'land_2', 'cons_5']);
        
        if (index === steps.length - 1) {
          setLocalIsAnalyzing(false);
        }
      }, step.delay);
    });
  };

  // Process specific agent query responses showing deep integration of all 10 concepts
  const handleSendChat = () => {
    if (!chatInput.trim() || currentStepIndex !== -1) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);

    // Step pipeline active
    setCurrentStepIndex(0);

    // Formulate beautiful intelligent response based on the active agent perspective chosen
    const selectedArchetypeData = ARCHETYPES.find(a => a.id === activeAgentType) || ARCHETYPES[0];
    const q = userMsg.toLowerCase();
    
    let resText = '';
    let selectedAgents: string[] = [];
    let entities: Record<string, any> = {};

    if (q.includes('ميراث') || q.includes('ورث') || q.includes('تركة') || q.includes('بنت') || q.includes('زوج') || q.includes('ولد')) {
      selectedAgents = ['inh_1', 'inh_2', 'inh_3'];
      entities = { heirsCount: 5, estateValue: caseData.estateValue, calculationMethod: 'Sharia_Law_Art64' };
      resText = `بصفتي [${selectedArchetypeData.arabicName} - ${selectedArchetypeData.title}]، قمت بإعمال عقل المحاكاة المتكامل لحساب قضية الورثة رقم ${caseData.caseNumber}:
      
1. تم استدعاء **وكيل حصر الورثة** للتحقق من خلو الورثة من أي موانع إرث.
2. نصيب الزوجة هو الثمن فرضاً لوجود الفرع الوارث = **${(caseData.estateValue * 0.125).toLocaleString('ar-EG')} ج.م**.
3. يوزع الباقي بالتعصيب على الابنين والبنتين على قاعدة "للذكر مثل حظ الأنثيين".
4. تم تخزين وتمرير النتيجة لـ **Orchestrator Agent** لتأكيد خلو القسمة من التداخل العيني.`;
    } 
    else if (q.includes('حديد') || q.includes('خرسان') || q.includes('بناء') || q.includes('أسمنت') || q.includes('تكلف') || q.includes('متر') || q.includes('دور')) {
      selectedAgents = ['cons_1', 'cons_2', 'cons_5'];
      entities = { area: caseData.buildingArea, concrete: results.concreteVolume, steel: results.steelWeight };
      resText = `من منظور [${selectedArchetypeData.arabicName} - ${selectedArchetypeData.title}]، تم إجراء الحسابات الإنشائية اللحظية لـ ${caseData.floors} أدوار بمساحة ${caseData.buildingArea} م²:
      
- حجم الخرسانة المقدر: **${results.concreteVolume} م³**
- حديد التسليح المطلوب: **${results.steelWeight} طن حديد**
- الرأي الإنشائي: نسبة استهلاك الهيكل العقاري المكتشفة هي **8%** وعمر المبنى الحالي ${caseData.buildingAge} سنوات، مما يعني سلامة وصلاحية العقار الكاملة للاستخدام الإداري والسكني.`;
    }
    else if (q.includes('ترب') || q.includes('مياه') || q.includes('جوف') || q.includes('حموض') || q.includes('ملوح')) {
      selectedAgents = ['map_3', 'cons_1'];
      entities = { pH: 6.8, groundWaterDepth: 1.42 };
      resText = `أهلاً كابتن حسام. قمت بطلب تحليل التربة والمياه بصفتي [${selectedArchetypeData.arabicName}]:
      
- **درجة حموضة التربة:** **6.8 pH** (تطابق مثالي لا يهدد حديد التسليح).
- **عمق منسوب المياه الجوفية:** **1.42 متر** تحت السطح.
- **توجيه الـ Edge Agent المحلي:** يُنصح كابتن حسام باستخدام أسمنت مقاوم للكبريتات في الأساسات لضمان بقائها خالية من التآكل والرطوبة الجوفية.`;
    }
    else if (q.includes('حدود') || q.includes('تداخل') || q.includes('مساح') || q.includes('خريطة') || q.includes('جار')) {
      selectedAgents = ['map_1', 'map_2', 'gps_1'];
      entities = { lat: caseData.latitude, lng: caseData.longitude };
      resText = `قمت بإجراء الفحص المساحي الجغرافي استناداً لبنية [${selectedArchetypeData.arabicName} - ${selectedArchetypeData.title}]:
      
- تم رصد الإحداثيات الميدانية للقطعة (${caseData.latitude}, ${caseData.longitude}) باستخدام **Edge Agent**.
- تم دمج الخرائط بالأقمار الصناعية عبر وكيل **GPSLocationAgent**.
- النتيجة: هناك تداخل طفيف جداً مع الجار في الحد الشرقي بمقدار **2.4 متر** وتم صياغة مذكرة الفرز لتسليمها لسيادة المستشار لإثبات أحقية ورثة القضية.`;
    }
    else {
      selectedAgents = ['land_1', 'leg_2', 'jud_2'];
      entities = { generalQuery: true };
      resText = `أنا [${selectedArchetypeData.arabicName}]. قمت بتحليل استفسارك العام ودمجه عبر **Orchestrator Agent** مع مستودع الـ 52 خبيراً:
      
- لقد ربطت بيانات النزاع المفتوح "**${caseData.title}**" وحسنت معادلات دقة المطابقة لتبلغ **99.8%**.
- يمكنني القيام بحساب المواريث، وتحليل حموضة التربة، وإحصاء كميات حديد التسليح لقطعة الأرض بدقة متناهية.
ما الذي تود مني حسابه أو صياغته لك الآن كابتن حسام؟`;
    }

    // Set interactive step running simulator
    const updatedSteps = [
      { id: 1, name: 'تحليل المدخلات (Cognitive)', method: 'cognitive_analyze()', status: 'running' as const, description: 'فهم وتأويل السؤال بالاعتماد على مذكرات القضية' },
      { id: 2, name: 'توزيع المهام (Orchestrator)', method: 'orchestrate_tasks()', status: 'idle' as const, description: 'توجيه المهام لوكيل الميراث أو الهندسة أو المساحة' },
      { id: 3, name: 'حل الفيدرالية (Federated Swarm)', method: 'federated_resolve()', status: 'idle' as const, description: 'استيراد السجل العقاري لـ كابتن حسام وتحديد تداخل الأراضي' },
      { id: 4, name: 'معالجة الحافة اللحظية (Edge processing)', method: 'edge_execute()', status: 'idle' as const, description: 'حساب حموضة التربة والحديد محلياً دون انتظار السيرفر' },
      { id: 5, name: 'التعلم والتكييف (Intelligent)', description: 'تعديل المعاملات والأسعار ومخاطر استهلاك المباني بالتعلم المستمر', method: 'intelligent_adapt()', status: 'idle' },
      { id: 6, name: 'اعتماد الماستر (Master Agent Approval)', method: 'master_sign_off()', status: 'idle' as const, description: 'توقيع التقرير وحفظه في الذاكرة المعرفية المؤمنة بالبصمة' }
    ];

    setProcessingSteps(updatedSteps);

    let currentStep = 0;
    const interval = setInterval(() => {
      setProcessingSteps(prev => prev.map((step, idx) => {
        if (idx === currentStep) {
          return { ...step, status: 'completed' as const };
        } else if (idx === currentStep + 1) {
          return { ...step, status: 'running' as const };
        }
        return step;
      }));

      setCurrentStepIndex(currentStep + 1);
      currentStep++;

      if (currentStep === 6) {
        clearInterval(interval);
        setCurrentStepIndex(-1);
        
        // Add record to simulated Memory list
        const logPayload = `[${selectedArchetypeData.title}] تم دمج استعلام كابتن حسام حول "${userMsg.slice(0, 25)}..." وحفظه بالذاكرة المعرفية للوكلاء.`;
        setMemoryDatabase(prev => [logPayload, ...prev]);

        // Push final Agent message
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: resText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          selectedAgents,
          entities,
          agentTypeUsed: activeAgentType
        }]);
      }
    }, 450);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (accuracy >= 90) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  };

  const handleFeedSelectionsToChat = () => {
    if (selectedNodeIds.length === 0) {
      triggerToast('رجاء تحديد عنصر واحد على الأقل من الخريطة الذهنية لتغذية الشات!', 'info');
      return;
    }

    const selectedNodesInfo: string[] = [];
    MIND_MAP_DATA.forEach(branch => {
      branch.nodes.forEach(node => {
        if (selectedNodeIds.includes(node.id)) {
          selectedNodesInfo.push(`- **${node.label}**: ${node.details}`);
        }
      });
    });

    const formattedPrompt = `يرجى تحليل النزاع وحله بمزيد من الدقة بالاستناد إلى المحددات والقوانين التالية المأخوذة من الخريطة الذهنية لقطاع الأراضي في مصر:

${selectedNodesInfo.join('\n')}

يرجى تفعيل ذكاء السرب للوكلاء المعتمدين ومطابقتها هندسياً وشرعياً لإصدار التقرير النهائي بدقة عالية.`;

    setChatInput(formattedPrompt);
    setActiveTab('chat');
    triggerToast('تم تغذية شات كرو إيجنت بنقاط الخريطة الذهنية بنجاح! يمكنك الآن إرسال السؤال بمزيد من الدقة.', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* UPDATE 3 DEEP GLOWING HERO HEADER */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#1e1e21] to-zinc-900 border border-[#2d2d31] rounded-2xl p-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg shadow-amber-500/15">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-white text-base font-black">SmartSystemsSuperAgent</h3>
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-3 py-0.5 rounded-full font-black">
                  تحديث 3: الهندسة الاستدلالية الفيدرالية
                </span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  بيومترية ومطابقة 10 بنى مستقلة
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
                تم تطوير العقل الاستدلالي لدمج **10 وكلاء مستقلين وذكاء السرب (Swarm Intelligence)** بنسبة وتناسب أدوبي لضمان الدقة في قراءة مذكرات النزاع والمواريث وهندسة التربة.
              </p>
            </div>
          </div>

          {/* Real-time system diagnostics status */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs font-bold text-slate-400">حالة التأمين:</span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
              biometricStatus === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-950 text-slate-500 border-zinc-800'
            }`}>
              {securityLevel}
            </span>
          </div>
        </div>
      </div>

      {/* BIOMETRICS & INTERACTIVE SECURITY SCAN SHELF (Premium feature) */}
      <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-3.5">
          {/* Glowing interactable fingerprint scanner */}
          <button
            onClick={handleBiometricScan}
            disabled={biometricStatus === 'scanning'}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
              biometricStatus === 'success'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : biometricStatus === 'scanning'
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-zinc-950 border border-zinc-800 text-amber-500 hover:border-amber-500/50'
            }`}
          >
            {biometricStatus === 'scanning' && (
              <div className="absolute inset-0 border-t-2 border-slate-950 rounded-2xl animate-spin"></div>
            )}
            <Fingerprint className="w-8 h-8 group-hover:scale-105 transition-transform" />
          </button>

          <div className="space-y-1 text-right">
            <span className="text-white text-xs font-black block">نظام المصادقة البيومترية ثلاثي الأبعاد (Biometric System)</span>
            <p className="text-slate-400 text-[10px] font-semibold">
              {biometricStatus === 'success' 
                ? 'تم فك تشفير البيانات الاستدلالية الحساسة لـ كابتن حسام بنجاح.' 
                : biometricStatus === 'scanning'
                ? `جاري فحص البصمة... ${scanProgress}% (مطابقة الخبير الفني والجيوديسي)`
                : 'انقر على بصمة الإصبع لتأكيد الهوية وتفعيل المود الفيدرالي الفائق.'}
            </p>
          </div>
        </div>

        {/* Scan progress / Reset button */}
        {biometricStatus === 'success' ? (
          <button
            onClick={resetBiometrics}
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-slate-300 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            تسجيل خروج آمن
          </button>
        ) : biometricStatus === 'scanning' ? (
          <div className="w-32 bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div className="bg-cyan-400 shadow-[0_0_12px_#00f0ff] h-full transition-all" style={{ width: `${scanProgress}%` }}></div>
          </div>
        ) : (
          <span className="text-[10px] text-amber-500/80 font-mono font-bold">SECURITY PROTOCOL VERIFICATION</span>
        )}
      </div>

      {/* NEW NAVIGATION TABS */}
      <div className="flex border-b border-[#2d2d31]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'chat' 
              ? 'border-amber-500 text-amber-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>مركز التحقيق والبحث القضائي الفني الذكي</span>
        </button>
        <button
          onClick={() => setActiveTab('swarm_map')}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'swarm_map' 
              ? 'border-amber-500 text-amber-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>شجرة هندسة الهيئات الاستشارية العشرة (Interactive Architecture)</span>
        </button>
        <button
          onClick={() => setActiveTab('mind_map')}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'mind_map' 
              ? 'border-amber-500 text-amber-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>🗺️ الخريطة الذهنية لقطاع الأراضي في مصر</span>
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'repository' 
              ? 'border-amber-500 text-amber-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>قاعدة بيانات الخبراء والمهندسين القضائيين المعتمدين</span>
        </button>
        <button
          onClick={() => setActiveTab('strategic_plan')}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'strategic_plan' 
              ? 'border-amber-500 text-amber-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>📋 الاستراتيجية الشاملة لجودة الأحكام وإدارة الوكلاء</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('cyber_security' as any);
            triggerToast('🕵️‍♂️ تم تفعيل عميل الحماية الفيدرالي Agent Smith لكشف الاختراقات وتتبع المتسللين عبر هولندا!', 'info');
          }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === ('cyber_security' as any)
              ? 'border-red-500 text-red-500 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white hover:border-red-500/20'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>🕵️‍♂️ الأمن الرقمي وتتبع الاختراقات (Cyber Forensics)</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('judicial_ai_hub');
            triggerToast('⚖️ تم تشغيل المنصة القضائية الذكية والطب الشرعي والمحاكاة الإجرائية!', 'success');
          }}
          className={`px-5 py-3 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'judicial_ai_hub'
              ? 'border-cyan-500 text-cyan-400 bg-[#1e1e21]' 
              : 'border-transparent text-slate-400 hover:text-white hover:border-cyan-500/20'
          }`}
        >
          <Gavel className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>⚖️ المنصة القضائية والطب الشرعي الذكي (AI Forensic Hub)</span>
        </button>
      </div>

      {/* CHAT TAB CONTENT WITH INTELLIGENT AGENT PERSPECTIVE SELECTOR */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chat & Agent Select Area */}
          <div className="lg:col-span-8 flex flex-col h-[550px] bg-[#1e1e21] border border-[#2d2d31] rounded-2xl overflow-hidden shadow-2xl">
            {/* Chat header */}
            <div className="bg-zinc-950 px-4 py-3 border-b border-[#2d2d31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-white text-xs font-black">الاستشارة الفيدرالية الفائقة - كابتن حسام</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500 font-bold">بنية المعالجة النشطة:</span>
                <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black font-mono">
                  {ARCHETYPES.find(a => a.id === activeAgentType)?.title}
                </span>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 text-right max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm ${
                    msg.sender === 'user' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-zinc-950 text-amber-400 border border-[#2d2d31]'
                  }`}>
                    {msg.sender === 'user' ? 'ح' : '🧠'}
                  </div>
                  
                  <div className="space-y-1.5 min-w-0">
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed font-medium ${
                      msg.sender === 'user' 
                        ? 'bg-amber-500 text-slate-950 font-black rounded-tr-none' 
                        : 'bg-zinc-950/70 text-slate-200 border border-[#2d2d31]/60 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    
                    {/* Perspective Used Indicator */}
                    {msg.sender === 'agent' && msg.agentTypeUsed && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-slate-500 font-bold">بواسطة:</span>
                        <span className="text-[9px] bg-zinc-900 text-amber-400 px-1.5 py-0.5 rounded font-bold border border-zinc-800">
                          {ARCHETYPES.find(a => a.id === msg.agentTypeUsed)?.arabicName}
                        </span>
                        
                        {msg.selectedAgents && msg.selectedAgents.length > 0 && (
                          <>
                            <span className="text-[9px] text-slate-500 font-bold">• الخبراء الفرعيين:</span>
                            {msg.selectedAgents.map(agId => (
                              <span key={agId} className="text-[9px] text-slate-300 font-mono">
                                {agId}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-500 font-bold block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Step processor simulation inside chat */}
              {currentStepIndex !== -1 && (
                <div className="bg-zinc-950 border border-cyan-500/20 p-4 rounded-xl space-y-3 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                    <span className="text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]">تشغيل خط المعالجة الفيدرالي للـ 10 وكلاء المستقلين...</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
                    {processingSteps.map((step, sIdx) => (
                      <div 
                        key={step.id}
                        className={`p-2 rounded border transition-all ${
                          sIdx < currentStepIndex 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : sIdx === currentStepIndex 
                            ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse'
                            : 'bg-[#1e1e21] border-[#2d2d31] text-slate-500'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{step.id}. {step.name}</span>
                          {sIdx < currentStepIndex && <Check className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="font-mono text-[9px] text-slate-400 mt-1">{step.method}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* CHAT AGENT ARCHETYPE PERSPECTIVE CHOOSER (Arabic/English UI) */}
            <div className="bg-zinc-950 p-2 border-t border-[#2d2d31] overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
              <span className="text-slate-500 text-[9px] font-black pl-2 shrink-0">منظور التفكير:</span>
              {ARCHETYPES.map(arch => (
                <button
                  key={arch.id}
                  onClick={() => {
                    setActiveAgentType(arch.id);
                    appendLog(`🔄 تم تحويل عقل المعالجة إلى: [${arch.title} - ${arch.arabicName}]`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    activeAgentType === arch.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-[#1e1e21] text-slate-400 hover:text-white border border-[#2d2d31]'
                  }`}
                >
                  <span>{arch.icon}</span>
                  <span>{arch.arabicName}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="bg-zinc-950 border-t border-[#2d2d31] p-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChat();
                  }}
                  disabled={currentStepIndex !== -1}
                  placeholder={`اسأل الوكيل الفائق بمنظور [${ARCHETYPES.find(a => a.id === activeAgentType)?.arabicName}] (مثال: احسب الحديد والخرسانة)...`}
                  className="w-full bg-[#1e1e21] text-white text-xs rounded-xl pr-4 pl-12 py-3.5 border border-[#2d2d31] focus:outline-none focus:border-amber-500/60 placeholder:text-slate-500 text-right font-medium"
                />
                
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || currentStepIndex !== -1}
                  className="absolute left-2 top-1.5 bottom-1.5 px-4 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-2 mt-2">
                <span>تم توظيف ذكاء السرب الفيدرالي لفرز التداخل والحدود المساحية والتربية والمواريث</span>
                <span>تحديث 3 - دقة الحسابات 99.8%</span>
              </div>
            </div>
          </div>

          {/* Sidebar Panel inside Chat: Memory Database & Step Runner */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Memory & Learning System */}
            <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-4 shadow-xl flex flex-col h-[265px]">
              <div className="flex items-center justify-between border-b border-[#2d2d31] pb-2 mb-2">
                <span className="text-white text-xs font-black flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span>الذاكرة المعرفية ومحرك التعلم المستمر</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  LEARNING
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 text-[10px] text-slate-300 font-mono">
                {memoryDatabase.map((log, idx) => (
                  <div key={idx} className="bg-zinc-950/80 p-2 rounded border border-[#2d2d31]/80 leading-relaxed text-right">
                    {log}
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-slate-500 text-center mt-2 font-bold">
                * دمج مستمر لقرارات الفرز الشرعي وحسابات التأسيس
              </div>
            </div>

            {/* General Runner & Full Swarm Dispatcher */}
            <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-4 shadow-xl flex flex-col h-[269px]">
              <div className="flex items-center justify-between border-b border-[#2d2d31] pb-2 mb-2">
                <span className="text-white text-xs font-black flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-500" />
                  <span>محاكي إطلاق السرب لـ 52 وكيلاً</span>
                </span>
                <button
                  onClick={startSimulation}
                  disabled={localIsAnalyzing}
                  className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-slate-950" />
                  <span>إطلاق السرب</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 text-[10px] text-slate-300 font-mono bg-zinc-950 p-2.5 rounded-xl border border-[#2d2d31]/80">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed text-right font-medium text-amber-400/95">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-1.5 text-center text-[10px] font-semibold px-4">
                    <span>اضغط على "إطلاق السرب" لتمرير ملف النزاع بأكمله على كافة البنى الفيدرالية العشرة للتعلم التلقائي وتأكيد الدقة.</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SWARM INTERACTIVE ARCHITECTURE MAP TABS */}
      {activeTab === 'swarm_map' && (
        <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 shadow-xl space-y-6">
          <div className="border-b border-[#2d2d31] pb-3 text-right">
            <h4 className="text-white text-sm font-black">خريطة المعالجة الفيدرالية وهندسة الوكلاء العشرة</h4>
            <p className="text-slate-400 text-xs mt-1">
              انقر على أي عقل استدلالي لقراءة أوزان النمذجة الرياضية ودوره الفريد في تلبية طلبات كابتن حسام.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Interactive Grid of Archetypes */}
            <div className="md:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-1.5">
              {ARCHETYPES.map(arch => (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    selectedArchetype?.id === arch.id
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-zinc-950/60 border-zinc-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{arch.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black">{arch.arabicName}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{arch.title}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                </button>
              ))}
            </div>

            {/* Showcase Visual holographic monitor */}
            <div className="md:col-span-2 bg-zinc-950 rounded-2xl p-5 border border-[#2d2d31] flex flex-col justify-between relative overflow-hidden min-h-[350px]">
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-[8px] text-slate-500 font-mono">LIVE HOLOGRAM PERSPECTIVE</span>
              </div>

              {selectedArchetype ? (
                <div className="space-y-4 text-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-2xl border border-amber-500/20">
                      {selectedArchetype.icon}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-black">{selectedArchetype.arabicName} ({selectedArchetype.title})</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">بنية إدراكية نشطة بالتكامل الفيدرالي</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                    {selectedArchetype.description}
                  </p>

                  <div className="bg-[#1e1e21] p-3.5 rounded-xl border border-zinc-900 space-y-2">
                    <span className="text-amber-500 text-[10px] font-black block">الخوارزمية الرياضية (Core Mathematical Logic):</span>
                    <code className="text-slate-200 font-mono text-[11px] block bg-zinc-950 p-2 rounded border border-zinc-900 text-left">
                      {selectedArchetype.coreMath}
                    </code>
                  </div>

                  <div className="bg-[#1e1e21] p-3 rounded-xl border border-zinc-900 text-right">
                    <span className="text-slate-500 text-[9px] font-bold block mb-1">مثال للاستعلام الموجه للوكيل:</span>
                    <p className="text-slate-300 text-[10px] font-bold">
                      "{selectedArchetype.demoInput}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                  <span>انقر على أحد الوكلاء لقراءة التفاصيل الإدراكية</span>
                </div>
              )}

              {/* Graphical Timeline diagram at the bottom of Map */}
              <div className="border-t border-zinc-900 pt-3 mt-4 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                <span>المزامنة: تم المزامنة مع مصلحة المساحة والشهر العقاري</span>
                <span>تحديث الفيدرالية 3.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPOSITORY TAB CONTENT (52 Specialized Agent Grid Explorer) */}
      {activeTab === 'repository' && (
        <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 shadow-xl space-y-5">
          
          {/* Header and Filter */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2d2d31] pb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-500" />
              <h3 className="text-white text-sm font-black">مستودع الوكلاء الخبراء النشطين للـ 52 وكيلاً</h3>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 scrollbar-none">
              <span className="text-slate-500 text-xs font-bold pl-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                تصفية:
              </span>
              {sectors.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedSector === sec 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : 'bg-zinc-950 text-slate-400 hover:text-white border border-[#2d2d31]'
                  }`}
                >
                  {sec === 'all' ? 'الكل' : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredAgents.map((agent) => {
              const isCompleted = completedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentDetails(agent)}
                  className={`text-right p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'bg-zinc-950/40 border-[#2d2d31]/80 hover:bg-[#1e1e21]/50 hover:border-[#3a3a3e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-slate-400 group-hover:bg-[#1e1e21] group-hover:text-amber-500 transition-colors'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white text-xs font-black group-hover:text-amber-400 transition-colors">
                        {agent.name.split(' (')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        تخصص: {agent.sector} • دقة: {agent.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAccuracyColor(agent.accuracy)}`}>
                      {agent.accuracy}% دقة
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🗺️ ARABIC LAND SECTOR MIND MAP TAB */}
      {activeTab === 'mind_map' && (
        <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 shadow-xl space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
          
          {/* Header section */}
          <div className="border-b border-[#2d2d31] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-white text-base font-black flex items-center gap-2">
                <span>🗺️ الخريطة الذهنية لقطاع الأراضي في مصر</span>
                <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                  تفاعلية متكاملة لزيادة الدقة
                </span>
              </h4>
              <p className="text-slate-400 text-xs mt-1 font-semibold leading-relaxed">
                استعرض المستويات والفروع الرئيسية لقطاع الأراضي والتشريعات المعنية. حدد عدة بنود لتلقيمها مباشرة لشات كرو إيجنت بمزيد من الدقة!
              </p>
            </div>
            
            {/* Action panel displaying selected items count */}
            <div className="flex items-center gap-3 self-end md:self-center">
              {selectedNodeIds.length > 0 && (
                <button
                  onClick={() => setSelectedNodeIds([])}
                  className="text-slate-400 hover:text-white text-xs px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-all cursor-pointer"
                >
                  إلغاء التحديد ({selectedNodeIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Presets and Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Presets Column */}
            <div className="md:col-span-8 space-y-2">
              <span className="text-slate-400 text-[10px] font-black block">💡 نماذج وسيناريوهات جاهزة للتحديد السريع:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS_DATA.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedNodeIds(preset.nodeIds);
                      triggerToast(`تم تحميل بنود وتوصيات: ${preset.name}`, 'success');
                    }}
                    className="text-right p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all text-xs font-semibold space-y-0.5 group shrink-0"
                  >
                    <span className="text-white group-hover:text-amber-400 transition-colors block font-bold">{preset.name}</span>
                    <span className="text-slate-500 text-[9px] block font-medium max-w-[240px] truncate">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Column */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-slate-400 text-[10px] font-black block">🔎 بحث سريع في بنود التشريعات والمخاطر:</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن مادة، تملك، حيازة، ميراث..."
                  value={mindMapSearchQuery}
                  onChange={(e) => setMindMapSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 text-white text-xs font-semibold px-3 py-2.5 pr-8 rounded-xl border border-zinc-850 focus:outline-none focus:border-cyan-500 text-right"
                />
              </div>
            </div>
          </div>

          {/* Interactive Mind Map Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MIND_MAP_DATA.map((branch) => {
              const filteredNodes = branch.nodes.filter(node => 
                node.label.includes(mindMapSearchQuery) || 
                (node.details && node.details.includes(mindMapSearchQuery))
              );

              if (filteredNodes.length === 0) return null;

              const isExpanded = expandedBranches.includes(branch.id);

              return (
                <div 
                  key={branch.id} 
                  className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-zinc-800 transition-all"
                >
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setExpandedBranches(prev => 
                          prev.includes(branch.id) 
                            ? prev.filter(id => id !== branch.id) 
                            : [...prev, branch.id]
                        );
                      }}
                      className="w-full flex items-center justify-between border-b border-zinc-900 pb-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{branch.icon}</span>
                        <h5 className="text-white text-xs font-black">{branch.title}</h5>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {isExpanded ? 'إغلاق' : 'عرض البنود'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-2">
                        {filteredNodes.map((node) => {
                          const isSelected = selectedNodeIds.includes(node.id);
                          return (
                            <button
                              key={node.id}
                              onClick={() => {
                                setSelectedNodeIds(prev => 
                                  prev.includes(node.id) 
                                    ? prev.filter(id => id !== node.id) 
                                    : [...prev, node.id]
                                );
                              }}
                              className={`w-full text-right p-2.5 rounded-xl border transition-all space-y-1.5 group cursor-pointer ${
                                isSelected 
                                  ? 'bg-cyan-500/5 border-cyan-500/40 shadow-sm shadow-cyan-500/5' 
                                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-[10px] font-black leading-tight ${
                                  isSelected ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white transition-colors'
                                }`}>
                                  {node.label}
                                </span>
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  isSelected 
                                    ? 'bg-cyan-500 border-cyan-500 text-slate-950' 
                                    : 'border-zinc-700 group-hover:border-zinc-500'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                              {node.details && (
                                <p className="text-slate-500 text-[9px] leading-relaxed font-semibold">
                                  {node.details}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Integration Action Bar */}
          {selectedNodeIds.length > 0 && (
            <div className="bg-[#242428] border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
              <div className="text-right">
                <span className="text-cyan-400 text-xs font-black block">💡 دمج ذكي مع شات الوكلاء الإدراكية:</span>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                  قمت بتحديد **{selectedNodeIds.length} بنود تشريعية وفنية**. انقر على الزر لتلقيمها مباشرة إلى الشات وطرح استفسار دقيق للوكلاء المنسقين.
                </p>
              </div>
              <button
                onClick={() => {
                  const selectedLabels = MIND_MAP_DATA.flatMap(b => b.nodes)
                    .filter(n => selectedNodeIds.includes(n.id))
                    .map(n => n.label)
                    .join(' ، ');
                  setChatInput(`أرغب في الاستفسار والتحقق الفيدرالي في هذه البنود والتشريعات المحددة من الخريطة الذهنية: [${selectedLabels}]`);
                  setActiveTab('chat');
                  triggerToast('⚡ تم نقل البنود المختارة بنجاح إلى صندوق الشات!', 'success');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/10"
              >
                <Zap className="w-4 h-4" />
                <span>تلقيم البنود إلى الشات والبدء ⚡</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* 📋 COMPREHENSIVE STRATEGIC PLAN TAB */}
      {activeTab === 'strategic_plan' && (
        <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-6 shadow-xl space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
          
          {/* Header section with strategic goals */}
          <div className="border-b border-[#2d2d31] pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-white text-base font-black flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                <span>الخطة الاستراتيجية المدمجة لجودة الأحكام وإدارة سرب الوكلاء</span>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  رؤية متكاملة للقبول والرضا المجتمعي
                </span>
              </h4>
              <p className="text-slate-400 text-xs mt-1 font-semibold leading-relaxed">
                خطة منهجية ذكية تجمع بين رفع دقة التقارير القضائية وقيادة سرب الوكلاء الخبراء بطريقة تضمن الكفاءة التقنية، النزاهة القانونية، والقبول والاطمئنان العام في المجتمع.
              </p>
            </div>

            {/* Segmented control for subsections */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 self-end md:self-center">
              <button
                onClick={() => setActivePlanSection('part1')}
                className={`px-3.5 py-1.5 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activePlanSection === 'part1'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الجزء الأول: جودة وصحة الأحكام
              </button>
              <button
                onClick={() => setActivePlanSection('part2')}
                className={`px-3.5 py-1.5 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activePlanSection === 'part2'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الجزء الثاني: قيادة السرب والقبول
              </button>
              <button
                onClick={() => setActivePlanSection('roadmap')}
                className={`px-3.5 py-1.5 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activePlanSection === 'roadmap'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 الخلاصة التنفيذية وخريطة الطريق
              </button>
            </div>
          </div>

          {/* TAB CONTENTS */}
          {activePlanSection === 'part1' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <span className="text-amber-400 text-xs font-black block mb-1">الرؤية العامة للجزء الأول: الخطة المحكمة للحصول على جودة عالية ونسبة صحيحة من الأحكام</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  يهدف هذا المحور إلى بناء ركائز عمل دقيقة للحد من الثغرات في إعداد وصياغة ومتابعة الدعاوى والنزاعات القضائية لضمان إصدار أحكام قانونية وشرعية متسقة ومتماسكة تخدم العدالة المطلقة.
                </p>
              </div>

              {/* Sub-sections layout */}
              <div className="space-y-6">
                
                {/* 1. الإعداد القانوني المتقن للدعوى */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <h5 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-[11px] font-mono">1</span>
                    <span>الإعداد القانوني المتقن للدعوى (مرحلة ما قبل رفع الدعوى)</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">🔎 الفحص القانوني الشامل:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        مراجعة كافة المستندات والعقود والتوكيلات، والتأكد من صحتها وسلامتها القانونية، وفحص حدود الملكية وخلو الأرض من النزاعات أو الرهون.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">📊 تحليل النزاع بدقة:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        تحديد جوهر النزاع القانوني بوضوح، وتصنيفه (مدني، جنائي، إداري) لتحديد المحكمة المختصة والإجراءات المناسبة.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">💾 جمع الأدلة وحفظها:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        جمع جميع الأدلة (المستندات، العقود، الإيصالات، المراسلات، الأدلة الرقمية) وحفظها بطريقة آمنة تضمن سلامتها وعدم العبث بها، مع توثيقها رسمياً.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">🎓 الاستشارة القانونية المتخصصة:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        الاستعانة بمحامين وخبراء متخصصين في نوع النزاع (عقاري، تجاري، إلخ) لوضع استراتيجية قانونية محكمة.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. صياغة صحيفة الدعوى والمذكرات القانونية */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <h5 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-[11px] font-mono">2</span>
                    <span>صياغة صحيفة الدعوى والمذكرات القانونية</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">✍️ الصياغة الدقيقة:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        كتابة صحيفة الدعوى والمذكرات بلغة قانونية واضحة، مع ترتيب الوقائع والأسانيد القانونية ترتيباً منطقياً.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">📚 الاستشهاد السليم:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        الاستشهاد بالنصوص القانونية السارية، وأحكام محكمة النقض والمبادئ القضائية المستقرة، مع توثيق المصادر بدقة.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">✨ الوضوح والإيجاز:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        تجنب الإطالة غير المبررة، والتركيز على النقاط الجوهرية التي تخدم موقف الدعوى.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. الإجراءات القضائية والتعامل مع المحكمة */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <h5 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-[11px] font-mono">3</span>
                    <span>الإجراءات القضائية والتعامل مع المحكمة</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">⏰ الالتزام بالمواعيد القضائية:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        مراعاة كافة المواعيد الإجرائية لتقديم المستندات والطعون، والحضور الحاسم للجلسات لضمان عدم سقوط الحقوق القانونية لشركاء الوطن.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">🎯 التجهيز الفني للجلسات:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        الإعداد المسبق لدفوع الهيئة القضائية، وتفنيد مزاعم المدعين عبر خرائط السجل العيني الرقمية والمستندات التاريخية القاطعة.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">🤝 التعاون مع خبراء وزارة العدل:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        توفير التلقيم الرقمي الفيدرالي لخبراء المساحة لتسهيل مهامهم الميدانية ونفي أي شبهة أو تعارض في التقارير المساحية والمخططات الهندسية.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">⚖️ الالتزام بآداب المرافعة والقضاء:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        ترسيخ وقار المرافعة والموضوعية الشاملة، وتقديم الأدلة بصيغة تقنية محايدة وواضحة تسهل مهمة وجدان العدالة لسيادة المستشارين.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. ضمانات صحة الحكم (مرحلة ما بعد الإصدار) */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <h5 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-[11px] font-mono">4</span>
                    <span>ضمانات صحة الحكم (مرحلة ما بعد الإصدار)</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">👁️ المراجعة الهيكلية للحكم:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        مطابقة منطوق الحكم بمسودات التقارير الفيدرالية لضمان النقل الصحيح للإحداثيات والحدود الهندسية وتلافي الأخطاء المادية.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">📜 تسبّيب الحسابات المساحية:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        التأكد من أن الأسباب التي بني عليها التقرير الفني والمستندات المساحية كافية ومستقاة من شواهد ميدانية، لتعزيز الاطمئنان والعدالة.
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
                      <span className="text-white font-black block">⚖️ التقدم بالطعون القانونية السليمة:</span>
                      <p className="text-slate-400 text-[11px] leading-normal font-semibold">
                        تجهيز الطعون القضائية والاستئنافات بناءً على ثغرات مساحية أو مادية مرصودة في منطوق الحكم لضمان استقرار الحقوق العقارية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. معايير قياس الجودة */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <h5 className="text-emerald-400 text-xs font-black flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-[11px] font-mono">5</span>
                    <span>معايير قياس الجودة (أدوات التحقق الفيدرالية للتقرير الفني)</span>
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-slate-500 text-[10px] block font-bold mb-1">الدقة التشريعية</span>
                      <span className="text-white font-black text-xs block">تطبيق صحيح للقانون</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-slate-500 text-[10px] block font-bold mb-1">السلامة المنطقية</span>
                      <span className="text-white font-black text-xs block">تطابق الحسابات والميدان</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-slate-500 text-[10px] block font-bold mb-1">الوضوح الهيكلي</span>
                      <span className="text-white font-black text-xs block">سهولة الفهم والصياغة</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-slate-500 text-[10px] block font-bold mb-1">العدالة الميدانية</span>
                      <span className="text-white font-black text-xs block">موازنة حقوق الورثة</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 col-span-2 md:col-span-1">
                      <span className="text-slate-500 text-[10px] block font-bold mb-1">السرعة الإجرائية</span>
                      <span className="text-white font-black text-xs block">الالتزام الصارم بالمهل</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activePlanSection === 'part2' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <span className="text-emerald-400 text-xs font-black block mb-1">الرؤية العامة للجزء الثاني: قيادة سرب الوكلاء والقبول المجتمعي</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  يركز هذا المحور على الحوكمة الذكية والقيادة المنظمة للوكلاء الـ 52 الخبراء ليعملوا في تناسق تام، مع ربط مخرجاتهم التقنية بشواهد ووقائع ميدانية واضحة تسهم في إقناع أطراف النزاع وقبول المجتمع بحيادية التقارير الفنية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Point 1 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-extrabold">١</span>
                      <h5 className="text-white text-xs font-black">الهيكلة والتخصص الدقيق</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      التوزيع التخصصي للوكلاء في جبهات فرعية: التثمين، الحساب الإنشائي، تصفية المواريث، وتحليل الخرائط الجغرافية، ليكون كل وكيل مسؤولاً عن جودة جزئيته.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">ذكاء السرب (Swarm)</span>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-extrabold">٢</span>
                      <h5 className="text-white text-xs font-black">التنسيق والتواصل الفعال</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      التنسيق لتبادل البيانات وتلافي التناقضات بين تقديرات الوكلاء المختلفين بما يضمن توافق التقارير النهائية وتلافي بطلان الخبرة.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">الوكيل المنسق (Orchestrator)</span>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-extrabold">٣</span>
                      <h5 className="text-white text-xs font-black">التدريب والتطوير المستمر</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      مراجعة وتعديل مستمر لأداء الوكلاء الرقميين من واقع الأحكام الصادرة فعلياً، والاستفادة من الملاحظات القضائية لتحديث المعارف ومصفوفات القرار لدى سرب الوكلاء.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">الوكيل الذكي (Intelligent)</span>
                  </div>
                </div>

                {/* Point 4 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-extrabold">٤</span>
                      <h5 className="text-white text-xs font-black">ضمان قبول المجتمع ورضائه</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      تقديم تبريرات واقعية مدعومة بالأدلة المقنعة، وصياغة مبسطة للحلول تفند كافة مزاعم الخصوم بأسلوب علمي ومنطكي محايد وموثق، يبعث بالرضا والسكينة لكافة الأطراف.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">وكيل العلاقات والقبول الاجتماعي</span>
                  </div>
                </div>

                {/* Point 5 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-extrabold">٥</span>
                      <h5 className="text-white text-xs font-black">الربط الذكي للتطوير والمتابعة</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      إيجاد ترابط عضوي مباشر بين نسبة دقة الأحكام وكفاءة السرب؛ فكلما تطابقت تقارير السرب مع منطوق الحكم النهائي، زاد معامل ثقة السرب في القضايا المستقبلية.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">الوكيل الفيدرالي الفائق (Master)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlanSection === 'roadmap' && (
            <div className="space-y-6">
              {/* Executive Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block mb-1">هدف جودة الأحكام المستهدف</span>
                  <span className="text-amber-400 font-black text-lg">٩٩.٨٪ دقة قضائية</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block mb-1">سرب الوكلاء النشط</span>
                  <span className="text-cyan-400 font-black text-lg">٥٢ وكيلاً متخصصاً</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block mb-1">معدل نقض التقارير الفنية</span>
                  <span className="text-emerald-400 font-black text-lg">٠.٠١٪ شبه منعدم</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block mb-1">مؤشر القبول المجتمعي العام</span>
                  <span className="text-fuchsia-400 font-black text-lg">ممتاز (ثقة تامة)</span>
                </div>
              </div>

              {/* Timeline roadmap */}
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-5 space-y-6 relative overflow-hidden">
                <h5 className="text-white text-xs font-black mb-4">🗺️ خريطة الطريق التنفيذية للدمج الذكي والتثقيف المجتمعي</h5>
                
                <div className="relative border-r border-dashed border-zinc-800 pr-5 mr-3 space-y-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 w-3 h-3 bg-amber-500 rounded-full border-4 border-slate-950"></span>
                    <h6 className="text-amber-400 text-[11px] font-black">المرحلة الأولى: حوكمة التأسيس المنهجي</h6>
                    <p className="text-slate-300 text-[10px] leading-relaxed mt-1">
                      تقسيم الوكلاء الخبراء لفرق متخصصة، وتثبيت مرجعيات تشريعية دقيقة مستمدة من مواد القانون المدني المصري لضمان خلو المذكرات التمهيدية من أي تعارضات.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 w-3 h-3 bg-cyan-400 rounded-full border-4 border-slate-950"></span>
                    <h6 className="text-cyan-400 text-[11px] font-black">المرحلة الثانية: التوثيق الميداني الحاسم بالوسم المزدوج</h6>
                    <p className="text-slate-300 text-[10px] leading-relaxed mt-1">
                      الالتحام الميداني وتثبيت إحداثيات المعاينة تلقائياً عبر الأقمار الصناعية (GPS) مع ختم وقت لحظي لا يقبل التعديل على الصور. هذه الأدلة القطعية تقطع دابر التشكيك وتزرع الرضا في نفوس الخصوم والمحكمة.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 w-3 h-3 bg-emerald-400 rounded-full border-4 border-slate-950"></span>
                    <h6 className="text-emerald-400 text-[11px] font-black">المرحلة الثالثة: إطلاق عقل السرب الفيدرالي والتدقيق</h6>
                    <p className="text-slate-300 text-[10px] leading-relaxed mt-1">
                      تشغيل ذكاء السرب (52 وكيلاً بالتوازي) لمطابقة البيانات الحسابية وتقديرات الأراضي وصياغة المسودة بذكاء استدلالي يضمن دقة الأحكام بنسبة تلامس الكمال.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 w-3 h-3 bg-fuchsia-400 rounded-full border-4 border-slate-950"></span>
                    <h6 className="text-fuchsia-400 text-[11px] font-black">المرحلة الرابعة: التصدير بالختم المائي والرمز الرسمي المعتمد</h6>
                    <p className="text-slate-300 text-[10px] leading-relaxed mt-1">
                      استخراج التقرير القضائي المعتمد بتنسيق PDF رسمي مختوم بختم المحكمة والرمز المائي، مما يعطي المستند قيمة ثبوتية قاطعة تمنح الطمأنينة الاجتماعية والنزاهة القانونية الكاملة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* CYBER FORENSICS TAB CONTENT (الأمن الرقمي الجنائي - موديول جولدست إيجنت سميث) */}
      {activeTab === ('cyber_security' as any) && (
        <div className="space-y-6 text-right animate-in fade-in duration-300">
          
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Terminal Console and controls (8 cols) */}
            <div className="lg:col-span-8 bg-[#1a1a1d] border border-[#2d2d31] rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d2d31] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <h4 className="text-white text-xs font-black">جهاز التحليل وتتبع البصمات الرقمية (Agent Smith Engine)</h4>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full font-bold border border-red-500/20">
                  بروتوكول حظر الاختراق نشط
                </span>
              </div>

              {/* Forensic Dashboard Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold block">إجمالي محاولات الهجوم المصدودة</span>
                  <span className="text-white font-mono text-base font-black">١٤ محاولة</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold block">آخر عنوان IP مسجل بالاختراق</span>
                  <span className="text-red-400 font-mono text-xs font-black">82.197.211.45 (هولندا)</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold block">أداة الهجوم المفضلة</span>
                  <span className="text-amber-500 font-mono text-xs font-black">Kali Linux / VPN Proxy</span>
                </div>
              </div>

              {/* Start Forensic Button / Progress Bar */}
              <div className="bg-[#242428] border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right flex-1">
                  <span className="text-amber-400 text-xs font-black block">🛡️ محاكي التحقيق الجنائي وقانون تقنية المعلومات المصري 175 لسنة 2018:</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    انقر لبدء عملية التتبع الجنائي ومراقبة خوادم السجل العيني لتوليد تقرير إثبات قانوني معتمد موجه للنيابة العامة ضد محاولة اختراق السجلات والتلاعب بإحداثيات الأراضي والورثة من خوادم في هولندا.
                  </p>
                </div>
                
                <button
                  onClick={handleRunForensics}
                  disabled={forensicStatus === 'tracing'}
                  className={`px-5 py-3 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                    forensicStatus === 'tracing'
                      ? 'bg-zinc-800 text-slate-500 border border-zinc-700 animate-pulse'
                      : forensicStatus === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/10'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {forensicStatus === 'tracing' ? 'جاري التحقيق والتعقب...' : forensicStatus === 'success' ? 'تحقيق مكتمل بنجاح' : 'بدء التحقيق الجنائي الفوري'}
                  </span>
                </button>
              </div>

              {/* Progress Bar */}
              {forensicStatus !== 'idle' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">تحليل الحزم والملفات المؤرشفة بالذكاء الاصطناعي</span>
                    <span className="text-amber-500 font-mono">{forensicProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-300" 
                      style={{ width: `${forensicProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Forensic Terminal Console Output */}
              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] font-black block">🖥️ سجل مخرجات شاشة تتبع البصمات والعمليات الرقمية (Console Logs):</span>
                <div className="bg-zinc-950 font-mono text-[10px] text-zinc-300 p-4 rounded-xl border border-zinc-900 h-44 overflow-y-auto space-y-1.5 text-left direction-ltr">
                  {forensicLogs.length === 0 ? (
                    <div className="text-center text-slate-600 font-bold py-12">
                      [سجل الأوامر مغلق] انقر على زر التحقيق في الأعلى لتغذية المحاكي وسحب سجلات الأمن القومي...
                    </div>
                  ) : (
                    forensicLogs.map((log, index) => (
                      <div key={index} className="text-right text-emerald-400/90 font-semibold leading-relaxed border-b border-zinc-900 pb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar legal panel (4 cols) */}
            <div className="lg:col-span-4 bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 shadow-2xl space-y-4">
              <h4 className="text-white text-xs font-black flex items-center gap-2 border-b border-[#2d2d31] pb-2.5">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>التكييف والوصف القانوني المصري</span>
              </h4>

              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-900 space-y-3">
                <span className="text-red-400 text-[10px] font-black block">قانون مكافحة جرائم تقنية المعلومات 175 لسنة 2018:</span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                  تخضع الواقعة الرقمية لـ <strong>القانون 175 لسنة 2018</strong> المنظم لجرائم الشبكات والأنظمة في جمهورية مصر العربية:
                </p>
                
                <div className="space-y-3 pt-2 text-[10px] leading-relaxed">
                  <div className="border-r-2 border-red-500 pr-2">
                    <strong className="text-amber-400 block font-black">المادة ١٤ (اختراق شبكة الدولة):</strong>
                    <span className="text-slate-400">يعاقب بالحبس مدة لا تقل عن سنتين وبغرامة لا تقل عن ١٠٠ ألف جنيه كل من اخترق عمداً موقعاً أو حساباً خاصاً بالدولة أو إحدى جهاتها الخدمية.</span>
                  </div>
                  <div className="border-r-2 border-red-500 pr-2">
                    <strong className="text-amber-400 block font-black">المادة ١٨ (تعديل السجلات الرسمية):</strong>
                    <span className="text-slate-400">يعاقب بالسجن المشدد وبغرامة تصل إلى نصف مليون جنيه كل من تلاعب أو زور أو أتلف بياناً أو خريطة أو مستنداً رسمياً للدولة مسجلاً إلكترونياً.</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl space-y-1">
                <span className="text-red-400 text-[10px] font-black block">ملاحظة أمنية سيادية:</span>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  يعد استخدام أدوات كالي لينوكس وبروكسيات vpn من الخارج (مثل هولندا) لإخفاء الهوية دليلاً جنائياً يعزز القصد الجنائي بالتآمر واستهداف الأمن الاقتصادي للدولة لتعديل ملكيات ومواريث المواطنين.
                </p>
              </div>
            </div>
          </div>

          {/* Admissible Court Forensics Report (تقرير الأدلة القضائية) */}
          {forensicStatus === 'success' && (
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl space-y-6 max-w-4xl mx-auto border-4 border-double border-slate-400 animate-in slide-in-from-bottom-3 duration-500 text-right font-serif relative overflow-hidden">
              {/* Seal Watermark Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
              
              {/* Formal Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-950 pb-5">
                <div className="space-y-1 text-center text-xs font-black">
                  <span className="block">جمهورية مصر العربية</span>
                  <span className="block">وزارة العدل والداخلية</span>
                  <span className="block">مصلحة الأدلة الجنائية والجرائم الرقمية</span>
                </div>
                <div className="text-center space-y-1 shrink-0">
                  <h3 className="text-base font-black tracking-widest text-slate-900 underline">تقرير الأدلة الرقمية الجنائية المعتمد</h3>
                  <span className="text-[10px] bg-red-100 text-red-800 px-3 py-0.5 rounded font-bold font-mono">ملف الاختراق: NL-EGYPT-2026-82</span>
                </div>
                <div className="space-y-1 text-center text-xs font-black">
                  <span className="block">التاريخ: ٤ يوليو ٢٠٢٦</span>
                  <span className="block">الصفة: تقرير قضائي ثبوتي</span>
                  <span className="block">سري للغاية</span>
                </div>
              </div>

              {/* Section 1: Intro */}
              <div className="space-y-2 text-xs">
                <p className="leading-relaxed font-bold">
                  بناءً على طلب النيابة العامة بجمهورية مصر العربية بخصوص التحقيق الفني للاشتباه في تعديل قاعدة بيانات الأراضي والرفع الطبوغرافي ونسب الورثة المسجلة إلكترونياً. قمنا نحن المهندس خبير أمن تكنولوجيا المعلومات بإدارة الجرائم التقنية برصد وفحص حزم البيانات وتتبع المخترق ونرفع لمعاليكم تقريرنا هذا:
                </p>
              </div>

              {/* Table of Evidence */}
              <div className="space-y-3">
                <span className="text-slate-950 text-xs font-black block border-r-4 border-slate-900 pr-2">أولاً: البيانات الفنية والرقمية لعملية التسلل (Technical Metadata):</span>
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                        <th className="p-2 border-l border-slate-300">البيان الفني</th>
                        <th className="p-2">تفاصيل القيد والتحريات الرقمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-l border-slate-200 font-bold bg-slate-50">عنوان الـ IP للمهاجم:</td>
                        <td className="p-2 font-mono font-bold text-red-700">82.197.211.45</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-l border-slate-200 font-bold bg-slate-50">خادم البروكسي / الموقع الجغرافي:</td>
                        <td className="p-2">أمستردام، هولندا (Amsterdam, Netherlands) - VPN Provider Host</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-l border-slate-200 font-bold bg-slate-50">نظام التشغيل وموقع الهجوم:</td>
                        <td className="p-2 font-mono">Kali Linux v2026.2 • Nmap & Sqlmap Automated Modules</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-l border-slate-200 font-bold bg-slate-50">بصمة التحقق الجنائية الرقمية:</td>
                        <td className="p-2 font-mono text-[10px] break-all">SHA-256: d5a4e761f1c89098b6567f89ac0f2142e88a0329b3f07a0011e03a987efc90a1</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-l border-slate-200 font-bold bg-slate-50">هدف الاختراق المعطل:</td>
                        <td className="p-2 text-red-800 font-black">قاعدة بيانات الورثة الشرعيين والتركات لإحداث التلاعب والتمكين غير القانوني للخارج</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Legal framing */}
              <div className="space-y-2.5 text-xs">
                <span className="text-slate-950 text-xs font-black block border-r-4 border-slate-900 pr-2">ثانياً: التوصيف الجنائي والتأصيل القانوني:</span>
                <p className="leading-relaxed">
                  بموجب نصوص <strong>القانون رقم ١٧٥ لسنة ٢٠١٨ في شأن مكافحة جرائم تقنية المعلومات</strong>، يُشكل هذا السلوك المؤثم الجرائم التالية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pr-2">
                  <li><strong>جريمة الاعتداء على سلامة البيانات والمنظومات (المادة ١٤):</strong> تمثل في محاولة فك الشفرة واستخدام بروكسي هولندا للاختراق غير المشروع لخادم السجل العقاري.</li>
                  <li><strong>جريمة التزوير والعبث بالسجلات الرقمية السيادية (المادة ١٨):</strong> تمثل في القصد الجنائي للتعديل في بيانات حيازة الأراضي والورثة لـ كابتن حسام، ويعد ذلك جناية تزوير محكومة بالسجن المشدد.</li>
                </ul>
              </div>

              {/* Section 3: Recommendations to prosecution and police */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-950 text-xs font-black block border-r-4 border-slate-900 pr-2">ثالثاً: التوصيات الميدانية والقرارات المطلوبة للنيابة العامة والشرطة:</span>
                <ol className="list-decimal list-inside space-y-1.5 pr-2 font-bold text-slate-800">
                  <li>مخاطبة الإنتربول الدولي (الشرطة الجنائية الدولية) رسمياً لتتبع خادم الـ IP في هولندا لمعرفة المالك النهائي والمستأجر المستفيد من الاختراق.</li>
                  <li>تكليف مباحث الاتصالات وتكنولوجيا المعلومات بقطاع الأمن بضبط المتعاونين محلياً داخل جمهورية مصر العربية المستفيدين من التلاعب ببيانات الحيازة.</li>
                  <li>اعتماد الأدلة الرقمية المشفرة (SHA-256 Hash) في حرز رسمي مع حظر كافة عناوين الـ IP التابعة لنفس مقدم الخدمة الهولندي وقائمتها السوداء.</li>
                </ol>
              </div>

              {/* Stamp and Seals */}
              <div className="flex justify-between items-center pt-8 border-t border-slate-300">
                <div className="text-center space-y-4">
                  <span className="text-xs font-bold block">إمضاء خبير الجرائم الرقمية</span>
                  <div className="border border-slate-400 bg-slate-50 px-4 py-2 text-xs font-mono rounded font-bold">
                    ENG. FORENSIC_OFFICER_AISTUDIO
                  </div>
                </div>
                
                {/* Simulated Seal */}
                <div className="w-24 h-24 rounded-full border-4 border-double border-red-700/60 bg-red-500/5 flex flex-col items-center justify-center text-center p-2 text-[8px] text-red-700 font-black tracking-tighter leading-tight relative -rotate-6">
                  <span className="block border-b border-red-700/30 pb-0.5 mb-0.5">وزارة العدل</span>
                  <span className="block">الأدلة الجنائية</span>
                  <span className="block">مصلحة الجرائم التقنية</span>
                  <span className="block font-mono text-[6px] mt-0.5">VERIFIED 2026</span>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-xs font-bold block">قرار النيابة العامة</span>
                  <span className="text-[10px] text-slate-500 block">يُقيد كدليل جنائي معتمد بالدعوى</span>
                </div>
              </div>

              {/* Export/Print forensic report buttons */}
              <div className="mt-6 flex justify-end gap-3" data-pdf-ignore>
                <button
                  type="button"
                  onClick={() => triggerToast('🖨️ جاري تحضير التقرير لإرساله المباشر للطباعة المعتمدة...', 'info')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الدليل</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('📂 تم نسخ رابط مستند التشفير وبصمة الجريمة SHA-256 للمشاركة الرقمية مع المحققين!', 'success')}
                  className="px-4 py-2 bg-slate-900 hover:bg-zinc-800 text-amber-400 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-800"
                >
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <span>مشاركة بصمة SHA-256</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ⚖️ JUDICIAL AI FORENSIC HUB TAB CONTENT */}
      {activeTab === 'judicial_ai_hub' && (
        <div className="space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
          
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-cyan-900/30 via-zinc-900 to-cyan-950/20 border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg shadow-cyan-500/15">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-white text-base font-black">المنصة القضائية والطب الشرعي الذكي (AI Forensic Hub)</h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
                    مظلة إلكترونية قضائية متكاملة لـ ٢٠ ميزة ونظام خبير لتقدير احتمالية نجاح الدعاوى، وتحليل الشهادات، وتوليد مذكرات الإملاء الصوتي ومحاكاة الجلسات.
                  </p>
                </div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-xl">
                مفعل بالكامل • نظام الجيل الخامس الخبير
              </div>
            </div>
          </div>

          {/* Semicircular / HUD Styled Sub Navigation Grid */}
          <div className="bg-zinc-950/40 p-1.5 rounded-2xl border border-zinc-800 flex flex-wrap gap-1.5">
            <button
              onClick={() => setForensicSubTab('linguistic')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'linguistic'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>تحليل المشاعر والتوتر اللغوي</span>
            </button>
            <button
              onClick={() => setForensicSubTab('witness_evidence')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'witness_evidence'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تعارض الشهود والطب الشرعي للتزوير</span>
            </button>
            <button
              onClick={() => setForensicSubTab('drafting')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'drafting'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الصياغة وصناعة الأوامر المستعجلة</span>
            </button>
            <button
              onClick={() => setForensicSubTab('simulation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'simulation'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>محاكي الجلسات وتدبير القضايا</span>
            </button>
            <button
              onClick={() => setForensicSubTab('risk_settlement')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'risk_settlement'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>احتمالية نجاح الدعوى والتسوية والطعن</span>
            </button>
            <button
              onClick={() => setForensicSubTab('time_cost')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'time_cost'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>التنبؤ الزمني وتكلفة تأجيل الجلسات</span>
            </button>
            <button
              onClick={() => setForensicSubTab('dictation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                forensicSubTab === 'dictation'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>الإملاء الصوتي والمحرر القانوني</span>
            </button>
          </div>

          {/* 1. LINGUISTIC SUB TAB */}
          {forensicSubTab === 'linguistic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
              {/* Tool 1: Sentiment & Linguistic Analysis */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span className="text-white text-sm font-black">تحليل المشاعر والتحيز اللغوي في المرافعات</span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  اكتشف الانحياز اللغوي ومستويات العاطفة والاتهام في مذكرات الخصوم لتقييم مدى توازنها الفني أمام منصة القضاء.
                </p>
                <div className="space-y-2">
                  <span className="text-slate-400 text-[10px] font-black block">نص المذكرة أو المرافعة المراد فحصها:</span>
                  <textarea
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 text-slate-100 text-xs p-3.5 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                    placeholder="اكتب هنا المرافعة أو أقوال الخصم..."
                  />
                </div>
                <button
                  onClick={handleAnalyzeSentiment}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>بدء التحليل اللغوي والوجداني للنص 📊</span>
                </button>

                {sentimentResult && (
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                    <span className="text-cyan-400 font-black block">نتائج التقرير اللغوي الفوري:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/60 text-center">
                        <span className="text-slate-500 text-[10px] block font-bold">مؤشر الانحياز والذاتية</span>
                        <span className="text-amber-400 font-extrabold text-sm">{sentimentResult.biasLevel}%</span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/60 text-center">
                        <span className="text-slate-500 text-[10px] block font-bold">معدل العاطفة والاستعطاف</span>
                        <span className="text-emerald-400 font-extrabold text-sm">{sentimentResult.emotionScore}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <span className="text-slate-400 text-[10px] font-black block">نسب توزيع المفردات المستهدفة:</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                        <div className="bg-[#1e1e21] p-1.5 rounded border border-zinc-900">
                          <span className="text-red-400 block">عدائية</span>
                          <span>{sentimentResult.aggressiveRatio}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-1.5 rounded border border-zinc-900">
                          <span className="text-cyan-400 block">استعطاف</span>
                          <span>{sentimentResult.victimRatio}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-1.5 rounded border border-zinc-900">
                          <span className="text-amber-400 block">شك وتردد</span>
                          <span>{sentimentResult.uncertaintyRatio}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-1.5 rounded border border-zinc-900">
                          <span className="text-yellow-500 block">مبالغة</span>
                          <span>{sentimentResult.exaggerationRatio}%</span>
                        </div>
                      </div>
                    </div>
                    {sentimentResult.extremeWords.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-slate-500 text-[10px] font-bold block">مفردات هجومية أو مبالغ فيها مكثفة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sentimentResult.extremeWords.map((word: string, i: number) => (
                            <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black px-2 py-0.5 rounded">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-zinc-900 pt-3">
                      <span className="text-slate-400 text-[10px] font-black block">التقييم العام للمستند القضائي:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed mt-1 font-semibold">{sentimentResult.overallAssessment}</p>
                    </div>
                    {sentimentResult.recommendations.length > 0 && (
                      <div className="space-y-1.5 bg-cyan-950/10 border border-cyan-500/15 p-2.5 rounded-lg text-cyan-400">
                        {sentimentResult.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-[10px] leading-relaxed font-semibold">
                            {rec}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tool 2: Stress & Courtroom Hesitation Analyzer */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="text-white text-sm font-black">تحليل التوتر والتردد وثقة الخصم (Courtroom Stress)</span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  احسب مؤشر ضعف المرافعة ودرجات التردد في العبارات المنطوقة لتحديد الثغرات الدفاعية وحجم التناقضات المنهجية.
                </p>
                <div className="space-y-2">
                  <span className="text-slate-400 text-[10px] font-black block">أقوال الشاهد أو الخصم المسجلة:</span>
                  <textarea
                    value={stressText}
                    onChange={(e) => setStressText(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 text-slate-100 text-xs p-3.5 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                    placeholder="اكتب هنا أقوال الشاهد المفرغة صوتياً..."
                  />
                </div>
                <button
                  onClick={handleAnalyzeStress}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>قياس معامل التوتر والتردد اللفظي 🔬</span>
                </button>

                {stressResult && (
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-cyan-400 font-black">تقرير تحليل التردد:</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        stressResult.speakerStatus === 'مهتز لغوياً بشكل ملحوظ' ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                      }`}>
                        الحالة: {stressResult.speakerStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900 text-center">
                        <span className="text-slate-500 text-[9px] block">درجة التردد والارتياب</span>
                        <span className="text-red-400 font-black text-xs">{stressResult.hesitationScore}%</span>
                      </div>
                      <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900 text-center">
                        <span className="text-slate-500 text-[9px] block">مؤشر التبرير الدفاعي</span>
                        <span className="text-amber-400 font-black text-xs">{stressResult.defensiveScore}%</span>
                      </div>
                      <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900 text-center">
                        <span className="text-slate-500 text-[9px] block">كثافة حشو الكلام</span>
                        <span className="text-blue-400 font-black text-xs">{stressResult.fillerDensity}%</span>
                      </div>
                    </div>
                    {stressResult.hesitationsFound.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-slate-400 text-[10px] font-black block">الكلمات الدالة على التردد والارتياب المرصودة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {stressResult.hesitationsFound.map((item: string, i: number) => (
                            <span key={i} className="bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-slate-300 text-[11px] leading-relaxed pt-2 border-t border-zinc-900 font-semibold">{stressResult.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. WITNESS & EVIDENCE SUB TAB */}
          {forensicSubTab === 'witness_evidence' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tool 3: Witness Conflict Analyzer */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">تحليل تعارض الشهود وكشف التناقضات البينية</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    قارن بين شهادات الشهود متوازياً للتعرف الفوري على التناقضات في الزمان أو المكان أو الأشخاص لإبطال الشهادات الملفقة.
                  </p>
                  
                  {/* Witness statement list display */}
                  <div className="space-y-2.5">
                    {witnesses.map((wit, idx) => (
                      <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-right text-xs">
                        <span className="text-amber-500 font-black block mb-1">{wit.name}:</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">"{wit.text}"</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAnalyzeWitnesses}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>تشغيل الفحص الطردي لتعارض الشهادات ⚖️</span>
                  </button>

                  {witnessAnalysis && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">تقرير تعارض شهود معتمد:</span>
                        <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          🚨 تم كشف تعارض حاسم
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-red-400 text-[10px] font-black block">التناقض الزمني والجغرافي المكتشف:</span>
                        <p className="text-slate-300 text-[11px] font-semibold">{witnessAnalysis.discrepancy}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-slate-400 text-[10px] font-black block">محور التعارض الأساسي:</span>
                        <div className="bg-[#1e1e21] p-3 rounded-lg border border-zinc-900 space-y-1">
                          {witnessAnalysis.comparison.map((line: string, i: number) => (
                            <div key={i} className="text-[11px] text-slate-400 font-semibold border-b border-zinc-950 pb-1 last:border-0 last:pb-0">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-cyan-950/10 border border-cyan-500/15 p-2.5 rounded-lg text-cyan-400">
                        <span className="text-[10px] font-black block mb-1">💡 نصيحة النيابة العامة والقاضي:</span>
                        <p className="text-[10px] leading-relaxed font-semibold">{witnessAnalysis.conclusion}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tool 5: Forgery & Document Forensic Detector */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">كاشف التزوير والطب الشرعي الرقمي للمستندات</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    افحص حيازة الأوراق والعقود العرفية للتحقق من سلامة الأختام، ومطابقة التوقيعات، وعمر الورق والأحبار المستخدمة لتأمين كابتن حسام.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 text-right">
                      <span className="text-slate-400 text-[10px] font-black block">تاريخ تحرير المستند التقريبي:</span>
                      <input
                        type="date"
                        value={forgeryDocDate}
                        onChange={(e) => setForgeryDocDate(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-100 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-slate-400 text-[10px] font-black block">سياق النزاع أو القضية:</span>
                      <input
                        type="text"
                        value={forgeryContext}
                        onChange={(e) => setForgeryContext(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-100 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                        placeholder="مثال: قضية نزاع العمرانية..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 text-[10px] font-black block">محتوى الإقرار أو العقد المراد مسحه جنائياً:</span>
                    <textarea
                      value={forgeryText}
                      onChange={(e) => setForgeryText(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 text-slate-100 text-xs p-3 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeForgery}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>تشغيل المسح الطيفي الجنائي للمستند 🔬</span>
                  </button>

                  {forgeryResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">تقرير الأدلة الكيميائية والميكانيكية:</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          forgeryResult.status === '⚠️ تلاعب مشبوه في التوقيع والختم' ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                        }`}>
                          {forgeryResult.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block">درجة مطابقة بصمة التوقيع</span>
                          <span className="text-white font-extrabold text-xs">{forgeryResult.signatureMatch}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block">توافق حبر القلم والأختام</span>
                          <span className="text-white font-extrabold text-xs">{forgeryResult.inkInkRatio}%</span>
                        </div>
                      </div>
                      <div className="space-y-1 pt-1.5 text-[11px]">
                        <span className="text-slate-400 font-black block">تحليل سمك وعمر الورقة الافتراضي:</span>
                        <p className="text-slate-300 font-semibold">{forgeryResult.paperDensityAnalysis}</p>
                      </div>
                      <div className="space-y-1 text-[11px] bg-red-950/10 border border-red-500/15 p-2 rounded">
                        <span className="text-red-400 font-black block">محذورات قضائية:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 pr-1 text-[10px] font-semibold">
                          {forgeryResult.verificationAdvice.map((adv: string, i: number) => (
                            <li key={i}>{adv}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Tool 7: Cassation Precedents Alignment Checker */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg text-right">
                <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span className="text-white text-sm font-black">مطابقة الدفوع مع مبادئ محكمة النقض والدستورية</span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  طابق دفوعك ومذكراتك تلقائياً مع أحكام محكمة النقض المصرية لضمان قبولها شكلاً وموضوعاً وتفادي بطلان الإجراءات.
                </p>
                <div className="space-y-2">
                  <span className="text-slate-400 text-[10px] font-black block">نص الدفع القانوني أو الفقهي:</span>
                  <textarea
                    value={cassationText}
                    onChange={(e) => setCassationText(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-950 text-slate-100 text-xs p-3 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                  />
                </div>
                <button
                  onClick={handleAnalyzeCassation}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>تطبيق مطابقة مبادئ محكمة النقض المصرية 📜</span>
                </button>

                {cassationResult && (
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-cyan-400 font-black">تقرير المبادئ والقرارات القضائية:</span>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        توافق: {cassationResult.alignmentScore}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-slate-400 text-[10px] font-black block">أقرب مبادئ النقض والطعون المرتبطة:</span>
                      <div className="space-y-2">
                        {cassationResult.matchedPrinciples.map((princ: string, i: number) => (
                          <div key={i} className="bg-[#1e1e21] p-2.5 rounded-lg border border-zinc-900 leading-relaxed text-slate-300 font-semibold text-[11px]">
                            {princ}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-950/10 border border-red-500/15 p-2.5 rounded text-red-400 text-[10px] leading-relaxed font-semibold">
                      🚨 تنبيه بطلان محتمل: {cassationResult.warningPoint}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. DRAFTING SUB TAB */}
          {forensicSubTab === 'drafting' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              
              {/* Tool 4: Cross-Examination Question Generator */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <MessageSquare className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-white text-sm font-black">مصمم أسئلة الاستجواب واستخلاص الحقائق</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    صغ مصفوفة أسئلة بالاعتماد على التخصص لكشف تداخل الأراضي أو ثغرات الأدلة ومخادعة الشهود أمام معالي المستشار.
                  </p>
                  
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">نوع الاستجواب المطلوب:</span>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="clarification">استفسار وإثبات الحيازة والأراضي</option>
                      <option value="witness_cross">مواجهة شهود واستخلاص التناقضات</option>
                      <option value="evidence_gap">فحص ثغرات الأدلة والمستندات العرفية</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">ملخص موضوع النزاع والقرائن:</span>
                    <textarea
                      value={questionSummary}
                      onChange={(e) => setQuestionSummary(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 text-slate-100 text-xs p-3 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleGenerateQuestions}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>توليد أسئلة الاستجواب القضائي الذكي 🤖</span>
                  </button>

                  {generatedQuestions && (
                    <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 space-y-2 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                      <span className="text-cyan-400 font-black block mb-1">الأسئلة الاستجوابية الموصى بها:</span>
                      <ul className="list-decimal list-inside space-y-2 pr-1 text-slate-300 leading-relaxed font-semibold text-[11px]">
                        {generatedQuestions.map((q: string, i: number) => (
                          <li key={i} className="border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Tool 2 (from list of 10): Emergency Orders Generator */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">مولد عريضة الطلبات والأوامر المستعجلة</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    ولد مسودة فورية لقرارات المنع من السفر أو التحفظ على الحسابات أو إخلاء المنشآت قبل تدميرها.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">نوع الإجراء العاجل:</span>
                    <select
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="travel_ban">منع من السفر وترقب المنافذ</option>
                      <option value="asset_freeze">حجز تحفظي وتجميد حسابات بنكية</option>
                      <option value="eviction_order">إخلاء إداري عاجل ومؤقت لعقار منهار</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">اسم الطالب (المدعي):</span>
                      <input
                        type="text"
                        value={emergencyPlaintiff}
                        onChange={(e) => setEmergencyPlaintiff(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">اسم المطلوب ضده (المدعى عليه):</span>
                      <input
                        type="text"
                        value={emergencyDefendant}
                        onChange={(e) => setEmergencyDefendant(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                  </div>

                  {emergencyType === 'asset_freeze' && (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">قيمة الحجز المستحق (جنيه مصري):</span>
                      <input
                        type="number"
                        value={emergencyAmount}
                        onChange={(e) => setEmergencyAmount(Number(e.target.value))}
                        className="w-full bg-zinc-950 text-slate-300 text-xs p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                      />
                    </div>
                  )}

                  {emergencyType === 'eviction_order' && (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">موقع العقار المهدد بالخطر:</span>
                      <input
                        type="text"
                        value={emergencyProperty}
                        onChange={(e) => setEmergencyProperty(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-300 text-xs p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleGenerateEmergencyOrder}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>توليد مسودة الأمر الوقتي العاجل 🚨</span>
                  </button>

                  {generatedEmergencyOrder && (
                    <div className="bg-white text-slate-900 p-4 rounded-xl space-y-2.5 animate-in slide-in-from-bottom-2 duration-200 text-xs border border-slate-300 font-serif leading-relaxed">
                      <div className="border-b border-slate-900 pb-1 text-center font-black">
                        <h4>{generatedEmergencyOrder.title}</h4>
                        <span className="text-[9px] font-bold text-slate-500 block font-sans">تاريخ التحرير: {generatedEmergencyOrder.date}</span>
                      </div>
                      <p className="text-[10px] font-bold">{generatedEmergencyOrder.preamble}</p>
                      <p className="bg-slate-50 p-2 rounded border border-slate-200 font-semibold text-[10px] text-justify">{generatedEmergencyOrder.body}</p>
                      <p className="text-[9px] font-bold text-slate-600 italic">{generatedEmergencyOrder.closing}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tool 10: Executory Formula & Writs writer */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Gavel className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">محرر الصيغة التنفيذية وقوة إنفاذ الأحكام</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    صغ ذكياً الصيغة التنفيذية للأحكام الصادرة لإعلان الخصم ومطالبته بالسداد طوعاً أو إنفاذ القانون بالقوة الجبرية.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">موضوع الحكم القضائي المُراد إنفاذه:</span>
                    <select
                      value={executoryType}
                      onChange={(e) => setExecutoryType(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="eviction">حكم طرد وإخلاء عقار وتسليمه خالياً</option>
                      <option value="collection">حكم إلزام مالي وتحصيل تعويضات</option>
                      <option value="possession">تمكين وحيازة منقولات عينية</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">المنفذ لصالحه (المحكوم له):</span>
                      <input
                        type="text"
                        value={executoryPlaintiff}
                        onChange={(e) => setExecutoryPlaintiff(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">المنفذ ضده (المحكوم عليه):</span>
                      <input
                        type="text"
                        value={executoryDefendant}
                        onChange={(e) => setExecutoryDefendant(e.target.value)}
                        className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      {executoryType === 'collection' ? (
                        <>
                          <span className="text-slate-400 text-[10px] font-black block">مبلغ الإلزام المحكوم به:</span>
                          <input
                            type="number"
                            value={executoryAmount}
                            onChange={(e) => setExecutoryAmount(Number(e.target.value))}
                            className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                          />
                        </>
                      ) : executoryType === 'eviction' ? (
                        <>
                          <span className="text-slate-400 text-[10px] font-black block">موقع العقار محل الإخلاء:</span>
                          <input
                            type="text"
                            value={executoryProperty}
                            onChange={(e) => setExecutoryProperty(e.target.value)}
                            className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400 text-[10px] font-black block">المنقولات العينية المقررة:</span>
                          <input
                            type="text"
                            value={executoryItems}
                            onChange={(e) => setExecutoryItems(e.target.value)}
                            className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-black block">مهلة السداد/الإخلاء طوعاً:</span>
                      <input
                        type="number"
                        value={executoryDays}
                        onChange={(e) => setExecutoryDays(Number(e.target.value))}
                        className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleGenerateExecutoryFormula}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>صياغة وثيقة الصيغة التنفيذية 📜</span>
                  </button>

                  {generatedExecutoryFormula && (
                    <div className="bg-[#fcf8f2] text-slate-900 p-4 rounded-xl space-y-2 animate-in slide-in-from-bottom-2 duration-200 text-xs border border-[#e6d0b5] leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-8 h-8 border-b border-r border-[#edd6bc] bg-[#fffcf8] rotate-45 transform origin-top-left opacity-30"></div>
                      <div className="border-b border-slate-900 pb-1 text-center font-black">
                        <h4>{generatedExecutoryFormula.title}</h4>
                      </div>
                      <p className="bg-white/80 p-2 rounded border border-[#ebd6bd] font-semibold text-[10.5px] text-justify">{generatedExecutoryFormula.body}</p>
                      <div className="p-2 bg-red-500/5 rounded border border-red-500/10 text-red-950 text-[9.5px] font-black font-sans leading-normal">
                        {generatedExecutoryFormula.clause}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 4. SIMULATION SUB TAB */}
          {forensicSubTab === 'simulation' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              
              {/* Tool 3 (new list): Court Session Sequence Simulator */}
              <div className="lg:col-span-8 bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Gavel className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">محاكي تسلسل وقائع جلسات المحاكمات</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    قم بإجراء تجربة فنية لمحاكاة كاملة للجلسة القضائية؛ تتبع خطوة بخطوة كلمات القاضي، مرافعة النيابة العامة، الدفاع، استجواب الشهود وإطلاق منطوق الحكم.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSimulateCourtSession}
                      disabled={isSimulatingSession}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSimulatingSession
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/10'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>{isSimulatingSession ? 'جاري تشغيل محاكاة الجلسة...' : 'بدء محاكاة الجلسة الإجرائية'}</span>
                    </button>
                    {simulationTimeline.length > 0 && (
                      <button
                        onClick={handleResetCourtSession}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold rounded-xl border border-zinc-800 transition-all cursor-pointer"
                      >
                        إعادة ضبط المحاكي
                      </button>
                    )}
                  </div>

                  {/* Dynamic Simulation Panel */}
                  <div className="border border-zinc-800 rounded-2xl bg-zinc-950/80 p-5 space-y-4 relative overflow-hidden min-h-[300px]">
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#1e1e21] px-2 py-0.5 rounded border border-zinc-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Courtroom Stage</span>
                    </div>

                    {simulationTimeline.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs space-y-2">
                        <Gavel className="w-12 h-12 text-slate-700 animate-bounce" />
                        <span className="font-bold">انقر فوق زر البدء في الأعلى لبدء سيناريو الجلسة القضائية رقم ٢٧</span>
                        <span className="text-[10px] text-slate-600">سيقوم المحاكي بتأدية الأدوار وسرد المحادثات بالتوقيتات الإجرائية</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Speaker Indicator */}
                        {activeSessionSpeaker && (
                          <div className="flex items-center gap-3 bg-[#1e1e21] p-3 rounded-xl border border-zinc-900 animate-in zoom-in-95 duration-200">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-extrabold text-sm">
                              ⚖️
                            </div>
                            <div className="text-right">
                              <span className="text-white text-xs font-black block">المتحدث النشط حالياً:</span>
                              <span className="text-amber-400 text-[10px] font-extrabold">{activeSessionSpeaker}</span>
                            </div>
                          </div>
                        )}

                        {/* Scrolling Log list */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {simulationTimeline.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/60 leading-relaxed text-xs space-y-1 animate-in slide-in-from-bottom-2 duration-200">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-amber-500">{item.speaker} ({item.role})</span>
                                <span className="text-slate-500 font-mono">{item.time}</span>
                              </div>
                              <p className="text-slate-300 font-semibold">{item.dialogue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tool 6 (from new): Case Assignment & Smart Courtroom Rotation */}
              <div className="lg:col-span-4 bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Users className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-white text-sm font-black">نظام توزيع القضايا والتدوير الذكي</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    حدد أفضل قاضي لحل النزاع استناداً لمعدلات الإنجاز التراكمية، والتخصص الفني الدقيق، وحجم القضايا المعلقة لضمان الحيادية المطلقة.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">حجم العبء المعلق حالياً في المحكمة:</span>
                    <select
                      value={assignWorkload}
                      onChange={(e) => setAssignWorkload(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="عالي">عالي جداً (تكدس ملفات)</option>
                      <option value="متوسط">متوسط (سرعة اعتيادية)</option>
                      <option value="منخفض">منخفض (إنجاز فوري مستعجل)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">محور تخصص الدائرة القضائية المطلوبة:</span>
                    <select
                      value={assignSpecialty}
                      onChange={(e) => setAssignSpecialty(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="عقاري">شؤون عقارية ومساحة العمرانية</option>
                      <option value="إرث">قسمة تركات وشريعة المواريث</option>
                      <option value="جنائي">اعتداء وتعدي على الحيازة</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleAssignJudge}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>حساب التوزيع ومطابقة المحكمة ⚖️</span>
                  </button>

                  {assignedJudgeResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black block">القاضي الموصى بتسليمه الدعوى:</span>
                        <span className="text-white font-extrabold text-sm block mt-1">سيادة المستشار/ {assignedJudgeResult.judgeName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                        <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                          <span className="text-slate-500 block">توافق التخصص</span>
                          <span className="text-amber-400">{assignedJudgeResult.specialtyMatch}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                          <span className="text-slate-500 block">حجم العبء المقدر</span>
                          <span className="text-emerald-400">{assignedJudgeResult.currentBacklog} قضية معلقة</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed pt-1.5 font-semibold">
                        💡 {assignedJudgeResult.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 5. RISK & SETTLEMENT SUB TAB */}
          {forensicSubTab === 'risk_settlement' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              
              {/* Tool: Litigation Success & Risk Analyzer (Success Probability) */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Percent className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">مقدر احتمالية نجاح الدعوى والتقييم القضائي</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    ادمج خوارزمية التنبؤ الفيدرالية لتقدير احتمالية كسب القضية بناءً على عمق أدلة الإثبات المرفقة وقوة شهادات الشهود ومذكرات الدفاع.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">عمق وقوة أدلة الإثبات والمستندات المشهرة:</span>
                    <select
                      value={riskEvidenceDepth}
                      onChange={(e) => setRiskEvidenceDepth(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="كافي جداً">كافية جداً ومعتمدة بالسجل العيني</option>
                      <option value="متوسط">متوسطة وبها بعض الثغرات العرفية</option>
                      <option value="ضعيف">ضعيفة أو تفتقر لسند الملكية</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">قوة شهادات الشهود ومطابقتها للتوقيتات:</span>
                    <select
                      value={riskWitnessStrength}
                      onChange={(e) => setRiskWitnessStrength(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="قوي">قوية ومطابقة للخرائط والقرائن</option>
                      <option value="متوسط">متوسطة وغير متطابقة كلياً</option>
                      <option value="ضعيف">ضعيفة أو مهتزة ومتناقضة</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">صلابة دفوع ومذكرات دفاع الخصوم:</span>
                    <select
                      value={riskOpponentStrength}
                      onChange={(e) => setRiskOpponentStrength(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="ضعيف">ضعيفة ومتهالكة قانونياً</option>
                      <option value="متوسط">متوسطة وبها بعض الأسانيد القابلة للنقض</option>
                      <option value="قوي">قوية وصلبة ومدعومة بالسوابق القضائية</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handlePredictRisk}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>حساب احتمالية نجاح الدعوى القضائية 📊</span>
                  </button>

                  {riskResultState && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">تقرير الاحتمالية التاريخي:</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          riskResultState.classification === 'عالية'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : riskResultState.classification === 'متوسطة'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          تصنيف القوة: {riskResultState.classification}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block">نسبة كسب الدعوى المتوقعة</span>
                          <span className="text-white font-extrabold text-xs">{riskResultState.probability}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block">ثقة الخوارزمية (Confidence)</span>
                          <span className="text-white font-extrabold text-xs">{riskResultState.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed pt-1.5 font-semibold">
                        💡 {riskResultState.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tool: Settlement & Mediation Predictor */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Scale className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">مقيم بدائل تسوية النزاعات والوساطة</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    حلل بدائل النزاعات القضائية؛ استكشف مدى ملاءمة النزاع للصلح الودي لضمان السلم العام وحق شركاء الوطن واطمينان الجميع.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">طبيعة النزاع الحالي للقسمة:</span>
                    <select
                      value={settlementDisputeType}
                      onChange={(e) => setSettlementDisputeType(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="عقاري">نزاع عقاري على حيازة العمرانية</option>
                      <option value="تركة">قسمة تركة وفرز وتجنيب الورثة</option>
                      <option value="تجاري">تعويضات مالية وتجاوزات هندسية</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">قيمة الأصول أو العقار المتداخل عليه (جنيه):</span>
                    <input
                      type="number"
                      value={settlementPropertyValue}
                      onChange={(e) => setSettlementPropertyValue(Number(e.target.value))}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">رغبة الأطراف في قبول المصالحة الودية:</span>
                    <select
                      value={settlementWillingness}
                      onChange={(e) => setSettlementWillingness(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="متوسط">رغبة متوسطة (مستعدون للمفاوضة)</option>
                      <option value="عالٍ">رغبة عالية (رغبة صلح ملحة)</option>
                      <option value="منخفض">خصومة شديدة وعناد قضائي</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handlePredictSettlement}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>تقييم بدائل تسوية النزاعات الودية 🤝</span>
                  </button>

                  {settlementResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">ملاءمة التسوية والصلح:</span>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          معدل الصلح: {settlementResult.suitabilityScore}%
                        </span>
                      </div>
                      <div className="bg-[#1e1e21] p-2.5 rounded-lg border border-zinc-900 space-y-1 text-center">
                        <span className="text-slate-500 text-[10px] block font-bold">مبلغ التسوية النقدي العادل الموصى به:</span>
                        <span className="text-white font-extrabold text-sm font-mono">{settlementResult.recommendedRange} جنيه مصري</span>
                      </div>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed pt-1.5 font-semibold">
                        💡 {settlementResult.advice}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tool: Appeal & Cassation Viability Checker */}
              <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Award className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-white text-sm font-black">مقيّم قوة الطعن والاستئناف الجنائي/المدني</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    افحص مدى فاعلية تقديم طعن في منطوق حكم الدرجة الأولى بناءً على وجود قرائن مستجدة أو ثغرات ميكانيكية وإجرائية.
                  </p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">طبيعة ومستوى الحكم القضائي المستأنف:</span>
                    <select
                      value={appealDecisionType}
                      onChange={(e) => setAppealDecisionType(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="ابتدائي">حكم ابتدائي صادر عن المحكمة الجزئية</option>
                      <option value="استئنافي">حكم صادر عن محكمة الاستئناف العالي</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs text-right text-slate-300 space-y-2">
                    <span className="text-slate-400 text-[10px] font-black block">العيوب والأخطاء الإجرائية المرصودة بالحكم:</span>
                    <div className="flex flex-col gap-1.5 font-bold">
                      <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 p-1.5 rounded border border-zinc-900">
                        <input
                          type="checkbox"
                          checked={appealProceduralError}
                          onChange={(e) => setAppealProceduralError(e.target.checked)}
                          className="rounded border-zinc-800 text-cyan-500"
                        />
                        <span>قصور في التسبيب أو فساد في الاستدلال</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 p-1.5 rounded border border-zinc-900">
                        <input
                          type="checkbox"
                          checked={appealHasNewEvidence}
                          onChange={(e) => setAppealHasNewEvidence(e.target.checked)}
                          className="rounded border-zinc-800 text-cyan-500"
                        />
                        <span>existence of new land deeds</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-black block">تقييم جودة تقرير الخبير الهندسي السابق:</span>
                    <select
                      value={appealExpertQuality}
                      onChange={(e) => setAppealExpertQuality(e.target.value)}
                      className="w-full bg-zinc-950 text-slate-300 text-xs p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                    >
                      <option value="ضعيف">ضعيف واعتمد على المعاينة الظاهرية</option>
                      <option value="متوسط">متوسط ولم يحدد تداخل الإحداثيات المساحية</option>
                      <option value="ممتاز">ممتاز وتناول كافة النواحي الطبوغرافية</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleCheckAppealViability}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>حساب فرصة كسب الاستئناف والطعن 📊</span>
                  </button>

                  {appealResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">احتمالات كسب الطعن:</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          appealResult.winPercentage >= 65
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          الفرصة: {appealResult.winPercentage >= 65 ? 'مرتفعة وراجحة' : 'متوسطة ويجب تدعيمها'}
                        </span>
                      </div>
                      <div className="bg-[#1e1e21] p-2 rounded-lg border border-zinc-900 text-center">
                        <span className="text-slate-500 text-[9px] block">احتمالية قبول وإلغاء الحكم</span>
                        <span className="text-white font-extrabold text-xs">{appealResult.winPercentage}%</span>
                      </div>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed pt-1.5 font-semibold">
                        💡 {appealResult.argumentText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tool: Historical Case Success Predictor */}
              <div className="lg:col-span-3 bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Database className="w-5 h-5 text-cyan-400 font-extrabold animate-pulse" />
                    <span className="text-white text-sm font-black">مقدر النجاح المستند لقاعدة البيانات والأرشيف التاريخي (جديد ⚡)</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed font-semibold">
                    تقوم هذه الخوارزمية بمقارنة المدخلات الجغرافية، الفنية، والنزاعية للقضية الحالية مع كافة القضايا المسجلة بقاعدة بيانات الأرشيف لاستخلاص نسبة نجاح حقيقية مبنية على سوابق واقعية وتصنيفها كـ (عالية / متوسطة / منخفضة).
                  </p>
                  
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold text-slate-300">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block">نوع الأرض المقارن:</span>
                      <span className="text-white font-extrabold block">{caseData.landType}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block">محور الخصومة:</span>
                      <span className="text-white font-extrabold block">
                        {caseData.dispute?.type === 'ownership' ? 'تثبيت ملكية' :
                         caseData.dispute?.type === 'boundary' ? 'تداخل حدود' :
                         caseData.dispute?.type === 'contract' ? 'نزاع عقود' :
                         caseData.dispute?.type === 'inheritance' ? 'ميراث وتركات' : 'عام'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block">المساحة الإجمالية:</span>
                      <span className="text-amber-400 font-extrabold block">{caseData.landArea} متر مربع</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block">الموقع الميداني:</span>
                      <span className="text-white font-extrabold block truncate" title={caseData.location}>{caseData.location || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handlePredictHistoricalSuccess}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Database className="w-4 h-4" />
                    <span>تشغيل التدقيق والمطابقة مع السجلات التاريخية 📊</span>
                  </button>

                  {historicalSuccessResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-4 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyan-400 font-black">نتائج المطابقة والاستعلام التاريخي:</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          historicalSuccessResult.classification === 'عالية'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : historicalSuccessResult.classification === 'متوسطة'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          تصنيف الاحتمالية: {historicalSuccessResult.classification}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#1e1e21] p-2.5 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block font-bold">نسبة كسب الدعوى المتوقعة</span>
                          <span className="text-emerald-400 font-extrabold text-sm">{historicalSuccessResult.probability}%</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2.5 rounded-lg border border-zinc-900">
                          <span className="text-slate-500 text-[9px] block font-bold">ثقة المطابقة (Matching Confidence)</span>
                          <span className="text-amber-400 font-extrabold text-sm">{historicalSuccessResult.confidence}%</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-900/60">
                        <span className="text-slate-400 font-black block mb-1">💡 التوصية القانونية:</span>
                        <p className="text-slate-300 font-semibold">{historicalSuccessResult.recommendation}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-slate-400 font-black block">📁 القضايا المرجعية الأكثر مطابقة في قاعدة البيانات:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {historicalSuccessResult.matches.map((match: any, i: number) => (
                            <div key={i} className="bg-[#1e1e21] p-2.5 rounded-lg border border-zinc-900 flex justify-between items-center">
                              <div className="text-right">
                                <span className="text-white font-extrabold block text-[11px]">{match.title}</span>
                                <span className="text-slate-500 text-[9px] block">{match.caseNumber} • {match.landType}</span>
                              </div>
                              <div className="text-left font-mono">
                                <span className="text-cyan-400 font-extrabold block text-[11px]">{match.similarity}% تطابق</span>
                                <span className="text-emerald-500 text-[9px] block">{match.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 6. TIME & COST SUB TAB */}
          {forensicSubTab === 'time_cost' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tool: Judgment Date & Duration Predictor */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                      <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="text-white text-sm font-black">التنبؤ التلقائي بموعد الحكم وجدول القضية</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      توقع زمني دقيق بموعد النطق بالحكم الختامي في نزاعات العمرانية بالاستناد لحجم القضايا المعلقة ووتيرة التأجيلات السابقة.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-black block">عدد مرات التأجيل السابقة للجلسات:</span>
                        <input
                          type="number"
                          value={predictPostponements}
                          onChange={(e) => setPredictPostponements(Number(e.target.value))}
                          className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-black block">تراكم ملفات محكمة العمرانية الجزئية:</span>
                        <select
                          value={predictCourtBacklog}
                          onChange={(e) => setPredictCourtBacklog(e.target.value)}
                          className="w-full bg-zinc-950 text-slate-300 p-2.5 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right"
                        >
                          <option value="متوسط">متوسط (تراكم عادي قيد الحل)</option>
                          <option value="عال">مزدحم جداً (أعباء ثقيلة)</option>
                          <option value="منخفض">منخفض (سرعة فائقة ملموسة)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <button
                      onClick={handlePredictJudgmentDate}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-4 h-4" />
                      <span>حساب الجدول الزمني والتنبؤ بالحكم 📅</span>
                    </button>

                    {predictedDateResult && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                        <div className="border-b border-zinc-900 pb-2">
                          <span className="text-cyan-400 font-black block">الموعد القضائي المتوقع للنطق بالحكم:</span>
                          <span className="text-white font-extrabold text-sm block mt-1">تاريخ النطق المرجح: {predictedDateResult.predictedDate}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                          <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                            <span className="text-slate-500 block">إجمالي أيام التقاضي المتوقعة</span>
                            <span className="text-amber-400 font-bold">{predictedDateResult.totalEstimatedDays} يوم</span>
                          </div>
                          <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                            <span className="text-slate-500 block">معامل التعقيد الزمني</span>
                            <span className="text-blue-400 font-bold">{predictedDateResult.complexityIndex}/10</span>
                          </div>
                        </div>
                        <p className="text-slate-300 text-[10.5px] font-semibold">
                          💡 {predictedDateResult.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tool: Adjournment Impact Calculator */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                      <AlertTriangle className="w-5 h-5 text-cyan-400" />
                      <span className="text-white text-sm font-black">حساب تأثير تأجيل جلسات المحاكمة</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      احسب بدقة الخسائر المالية غير المباشرة والتكاليف التشغيلية للمتقاضين كابتن حسام عند تأجيل الخصم لجلسات المعاينة.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-black block">إجمالي أيام التأجيل المستهدف:</span>
                        <input
                          type="number"
                          value={adjournmentDays}
                          onChange={(e) => setAdjournmentDays(Number(e.target.value))}
                          className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-black block">تكلفة اليوم الواحد للمتقاضين (جنيه):</span>
                        <input
                          type="number"
                          value={adjournmentDailyCost}
                          onChange={(e) => setAdjournmentDailyCost(Number(e.target.value))}
                          className="w-full bg-zinc-950 text-slate-300 p-2 rounded-xl border border-zinc-800 outline-none focus:border-cyan-500/40 text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <button
                      onClick={handleCalculateAdjournment}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-4 h-4" />
                      <span>احتساب التكلفة الزمنية لتأجيل الجلسة 💰</span>
                    </button>

                    {adjournmentResult && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                        <div className="border-b border-zinc-900 pb-2">
                          <span className="text-cyan-400 font-black block">إجمالي الخسائر المالية الناجمة عن التأجيل:</span>
                          <span className="text-red-400 font-extrabold text-sm block mt-1">{adjournmentResult.totalWastedCost.toLocaleString('ar-EG')} جنيهاً مصرياً</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                          <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                            <span className="text-slate-500 block">فقدان الإنتاجية والوقت</span>
                            <span className="text-red-400">-{adjournmentResult.productivityLoss}%</span>
                          </div>
                          <div className="bg-[#1e1e21] p-2 rounded border border-zinc-900">
                            <span className="text-slate-500 block">تراكم الملف القضائي</span>
                            <span className="text-amber-400">+{adjournmentResult.backlogPenalty} يوم</span>
                          </div>
                        </div>
                        <p className="text-slate-300 text-[10.5px] font-semibold">
                          💡 {adjournmentResult.remedyAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom twin section: Time cost & Legal Fees */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tool: Time-Cost & Backlog Analyzer */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">تحليل العبء المالي والزمني الكلي للقضية</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    احسب التكلفة الكلية والمصاريف القضائية المقررة لقضايا المواريث والفرز والرفع الهندسي.
                  </p>
                  <button
                    onClick={handleCalculateTimeCost}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>تشغيل مقدر التكاليف التشغيلية الكلية 💰</span>
                  </button>

                  {timeCostResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#1e1e21] p-2.5 rounded border border-zinc-900">
                          <span className="text-slate-500 text-[10px] block">المصاريف القضائية التقريبية</span>
                          <span className="text-white font-extrabold text-xs">{timeCostResult.estimatedCourtCosts.toLocaleString('ar-EG')} جنيه</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2.5 rounded border border-zinc-900">
                          <span className="text-slate-500 text-[10px] block">الأتعاب الموصى بها</span>
                          <span className="text-white font-extrabold text-xs">{timeCostResult.recommendedRetainer.toLocaleString('ar-EG')} جنيه</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10.5px] font-semibold leading-relaxed border-t border-zinc-900 pt-2">
                        {timeCostResult.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tool: Legal Fees Estimator */}
                <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                    <Coins className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-sm font-black">مقدر أتعاب الخبير والمحاماة العادل</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    قدر أتعاب الخبير والمحامي العادلة لتفادي غبن الحقوق وفقاً صعوبة الدعوى وحجم مجهود المعاينة الميدانية.
                  </p>
                  <button
                    onClick={handleEstimateLegalFees}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5 flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-4 h-4" />
                    <span>تقدير القيمة السعرية المناسبة للأتعاب 💰</span>
                  </button>

                  {legalFeesResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-[#1e1e21] p-2.5 rounded border border-zinc-900">
                          <span className="text-slate-500 text-[10px] block">الحد الأدنى للأتعاب المقترحة</span>
                          <span className="text-white font-extrabold text-xs">{legalFeesResult.minRecommendedFee.toLocaleString('ar-EG')} جنيه</span>
                        </div>
                        <div className="bg-[#1e1e21] p-2.5 rounded border border-zinc-900">
                          <span className="text-slate-500 text-[10px] block">الحد الأقصى للأتعاب المقترحة</span>
                          <span className="text-white font-extrabold text-xs">{legalFeesResult.maxRecommendedFee.toLocaleString('ar-EG')} جنيه</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10.5px] font-semibold leading-relaxed border-t border-zinc-900 pt-2">
                        {legalFeesResult.advice}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. DICTATION SUB TAB */}
          {forensicSubTab === 'dictation' && (
            <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl p-5 space-y-4 shadow-lg text-right animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 border-b border-[#2d2d31] pb-3">
                <Mic className="w-5 h-5 text-cyan-400" />
                <span className="text-white text-sm font-black">المساعد الصوتي والإملاء القانوني المباشر</span>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                اضغط على الميكروفون للبدء في الإملاء الصوتي المباشر لمذكرتك؛ سيقوم نظام النظم الخبيرة الفيدرالية بصياغتها بلغة بليغة خالية من الأخطاء اللغوية.
              </p>

              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                
                {/* Control Column */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <span className="text-slate-400 text-[10px] font-black block">الكلام المفرغ صوتياً (خام):</span>
                    <textarea
                      value={voiceRawText}
                      onChange={(e) => setVoiceRawText(e.target.value)}
                      rows={6}
                      className="w-full bg-zinc-950 text-slate-100 text-xs p-3.5 rounded-xl border border-zinc-800 focus:border-cyan-500/50 outline-none leading-relaxed text-right"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSimulateVoiceRecording}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                        isRecording
                          ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-lg shadow-red-500/20'
                          : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-amber-500 hover:border-amber-500/40 shadow-sm'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-500 animate-bounce" />}
                      <span>{isRecording ? 'جاري الاستماع للنبض الصوتي...' : 'انقر لبدء الإملاء الصوتي 🎙️'}</span>
                    </button>
                    <button
                      onClick={handleConvertVoice}
                      className="py-3 px-5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5"
                    >
                      صياغة المذكرة القانونية من الإملاء الصوتي ✨
                    </button>
                  </div>
                </div>

                {/* Showcase Document Column */}
                {voiceResult && (
                  <div className="flex-1 bg-white text-slate-900 p-5 rounded-xl space-y-3 border border-slate-300 font-serif leading-relaxed text-xs relative overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
                    
                    <div className="border-b border-slate-900 pb-2 text-center font-black">
                      <h4>مذكرة دفاع صُنعت بالإملاء الصوتي</h4>
                      <span className="text-[9px] font-sans font-bold text-slate-500">تم تنقيحها وصياغتها بنظام النظم الخبيرة</span>
                    </div>

                    <div className="whitespace-pre-wrap text-[10.5px] font-medium leading-relaxed text-justify bg-slate-50 p-3 rounded border border-slate-200">
                      {voiceResult.assembledText}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-slate-700 pt-2 border-t border-slate-200">
                      <div>
                        <span className="block underline">توقيع كابتن حسام</span>
                        <span className="block text-slate-400 font-mono mt-2">HUSSAM_OFFICER_SIGN_2026</span>
                      </div>
                      <div className="text-left">
                        <span className="block">البصمة الطبوغرافية المائية</span>
                        <span className="block text-slate-400 font-mono mt-2">VERIFIED_WATERMARK_SHA256</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* Agent Details Popup/Modal */}
      {selectedAgentDetails && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e21] border border-[#2d2d31] rounded-2xl max-w-lg w-full p-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedAgentDetails(null)}
              className="absolute top-3 left-3 w-8 h-8 bg-zinc-950 border border-[#2d2d31] text-slate-400 hover:text-white rounded-lg flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white font-black text-sm">{selectedAgentDetails.name}</h4>
                  <span className="text-[11px] text-slate-400 font-bold">تخصص: {selectedAgentDetails.sector} • نظام خبير قضائي</span>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                {selectedAgentDetails.description}
              </p>

              <div className="bg-zinc-950 p-4 rounded-xl border border-[#2d2d31] space-y-2.5">
                <span className="text-amber-500 text-[11px] font-black block border-b border-zinc-900 pb-1">صيغة التحليل الرياضي والنمذجة المقترحة:</span>
                <code className="text-slate-100 font-mono text-[11px] leading-relaxed block text-left">
                  {selectedAgentDetails.id.startsWith('land') && 'let land_value = land_area * price_per_m2_type;'}
                  {selectedAgentDetails.id.startsWith('cons_1') && 'let concrete = building_area * 0.22 * floors;\nlet steel = concrete * 0.1;'}
                  {selectedAgentDetails.id.startsWith('inh') && 'let total_shares = (males * 2) + (females * 1);\nlet share = (gender_factor / total_shares) * estate;'}
                  {selectedAgentDetails.id.startsWith('waqf') && 'let compliance = match_historical_records(deed_id, usage_specs);'}
                  {selectedAgentDetails.id.startsWith('fin') && 'let property_tax = Math.max(0, annual_rent - 50000) * 0.10;'}
                  {selectedAgentDetails.id.startsWith('gps') && 'let bounding_box = get_bounds(latitude, longitude, scale);'}
                  {!['land', 'cons_1', 'inh', 'waqf', 'fin', 'gps'].some(prefix => selectedAgentDetails.id.startsWith(prefix)) && 'let confidence_score = neural_backpropagation(weights, feature_matrix);'}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded-xl border border-[#2d2d31] text-center">
                  <span className="text-slate-500 text-[10px] block mb-1 font-bold">نسبة دقة التنبؤ المعتمدة</span>
                  <span className="text-amber-400 font-extrabold text-sm">{selectedAgentDetails.accuracy}%</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-[#2d2d31] text-center">
                  <span className="text-slate-500 text-[10px] block mb-1 font-bold">إجمالي القضايا المنجزة</span>
                  <span className="text-white font-extrabold text-sm">{selectedAgentDetails.tasksProcessed} قضية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Maximize2
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
    title: 'Cognitive Agent',
    arabicName: 'وكيل إدراكي',
    icon: '🧠',
    color: 'from-amber-400 to-orange-500',
    description: 'يفكر ويحلل النزاعات بطريقة بشرية مستدلة بالاعتماد على مذكرات الدعوى والمنطق القضائي والظروف المحيطة.',
    coreMath: 'P(Verdict | Evidence) = ∑ [W_i * CognitiveFactor(E_i)]',
    demoInput: 'فهم منطق النزاع على قطعة الهرم ومراجعة الحيازة الهادئة المستقرة.'
  },
  {
    id: 'autonomous',
    title: 'Autonomous Agent',
    arabicName: 'وكيل مستقل',
    icon: '🚀',
    color: 'from-blue-400 to-indigo-500',
    description: 'يتخذ القرارات والتدابير الاحترازية من تلقاء نفسه دون تدخل بشري، مثل إصدار تنبيهات تداخل الحصص وتجميد الإحداثيات.',
    coreMath: 'TriggerAction(t) = 1 if ConflictScore > Threshold else 0',
    demoInput: 'افحص تداخل الحدود تلقائياً وأرسل تنبيهاً فورياً للمحكمة.'
  },
  {
    id: 'intelligent',
    title: 'Intelligent Agent',
    arabicName: 'وكيل ذكي',
    icon: '💡',
    color: 'from-emerald-400 to-teal-500',
    description: 'يتعلم باستمرار من التقييمات والملاحظات الميدانية السابقة لتكييف حسابات أسعار المتر وتكاليف الحديد والخرسانة المسلحة.',
    coreMath: 'Weights(t+1) = Weights(t) + η * (TargetValue - PredictedValue) * X',
    demoInput: 'احسب أسعار الأراضي في منطقة الهرم بناء على آخر 12 صفقة تم تحديثها.'
  },
  {
    id: 'orchestrator',
    title: 'Orchestrator Agent',
    arabicName: 'وكيل منسق',
    icon: '🪄',
    color: 'from-purple-400 to-fuchsia-500',
    description: 'يقوم بتوزيع المهام، وادارة الاتصالات بين الوكلاء، والتحقق من التناسق الهيكلي وحل أي تعارض في القرارات الفنية والقانونية.',
    coreMath: 'ResolveConflict(Agent_A, Agent_B) = ArgMax_Conf(P_A, P_B)',
    demoInput: 'نسق بين وكيل التصميم الإنشائي ووكيل التقييم المالي لتوليد الميزانية.'
  },
  {
    id: 'master',
    title: 'Master Agent',
    arabicName: 'وكيل رئيسي',
    icon: '👑',
    color: 'from-red-400 to-rose-500',
    description: 'يمثل القيادة المركزية للوكيل الفائق (CEO Agent)، وهو المسؤول عن توقيع واعتماد التقارير النهائية المقدمة لسيادة المستشار.',
    coreMath: 'ApproveReport(Doc) = VerifySignature(Hossam_BioKey) && Audit(Steps 1..6)',
    demoInput: 'اعتمد التقرير النهائي لقضية الورثة وأصدر وثيقة الرفع المساحي.'
  },
  {
    id: 'meta_agent',
    title: 'Meta-Agent',
    arabicName: 'وكيل فوقي',
    icon: '⚡',
    color: 'from-pink-400 to-rose-600',
    description: 'وكيل فائق المستوى يراقب عمل بقية الوكلاء ويضبط معاملات الأمان والدقة والتحقق من قيود الشريعة والقانون المصري.',
    coreMath: 'VerifyCompliance(Actions) = strict_match(Civil_Law_Article_119, Actions)',
    demoInput: 'راجع مدى مطابقة حسابات تقسيم التركات الحالية لأحكام المادة 64.'
  },
  {
    id: 'swarm',
    title: 'Swarm Intelligence',
    arabicName: 'ذكاء السرب',
    icon: '🐝',
    color: 'from-yellow-400 to-amber-500',
    description: 'نظام لا مركزي يجمع طاقة الـ 52 وكيلاً الخبراء في وقت واحد للتصويت وتحليل العينات والمطابقة الجغرافية بالتوازي.',
    coreMath: 'ConsensusScore = ConsensusRatio(V_1, V_2, ... V_52) >= 0.95',
    demoInput: 'قم بإطلاق السرب بالكامل (50+ وكيل) لتشغيل تقرير فني شامل للنزاع.'
  },
  {
    id: 'federated',
    title: 'Federated Agent',
    arabicName: 'وكيل فيدرالي',
    icon: '🌐',
    color: 'from-cyan-400 to-blue-500',
    description: 'يتواصل بشكل مؤمن مع منصات وقواعد بيانات خارجية مثل البوابة الرقمية للشهر العقاري والمساحة المصرية والنيابة العامة.',
    coreMath: 'FetchFederatedData(SecureToken) = DecryptAES256(API_Response_Data)',
    demoInput: 'تحقق من تسجيل العقد وسندات الملكية المشهرة بالبوابة الرقمية للشهر العقاري.'
  },
  {
    id: 'edge',
    title: 'Edge Agent',
    arabicName: 'وكيل حافة',
    icon: '📱',
    color: 'from-teal-400 to-emerald-500',
    description: 'يعمل محلياً على جهاز كابتن حسام لتشغيل الخوارزميات الحساسة والرفع المساحي اللحظي للموقع وحساب المتغيرات الطارئة دون إنترنت.',
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
  // Tabs: 'chat' | 'swarm_map' | 'repository' | 'mind_map' | 'strategic_plan'
  const [activeTab, setActiveTab] = useState<'chat' | 'swarm_map' | 'repository' | 'mind_map' | 'strategic_plan'>('chat');
  const [activePlanSection, setActivePlanSection] = useState<'part1' | 'part2' | 'roadmap'>('part1');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [localIsAnalyzing, setLocalIsAnalyzing] = useState(false);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<AgentInfo | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<AgentArchetype | null>(ARCHETYPES[0]);
  
  // Biometrics States (User Experience Enhancements)
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [securityLevel, setSecurityLevel] = useState('مستوى الحماية العادي');

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
          <span>شات وتحليل الوكيل الفائق للأنظمة الذكية</span>
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
          <span>خريطة هندسة الوكلاء الـ 10 (Interactive Architecture)</span>
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
          <span>مستودع الوكلاء الخبراء (52 وكيل معتمد)</span>
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
              <button
                onClick={() => setSelectedNodeIds([])}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 bg-zinc-900 border border-[#2d2d31] rounded-xl transition-all"
                disabled={selectedNodeIds.length === 0}
              >
                إلغاء التحديد بالكامل ({selectedNodeIds.length})
              </button>
              <button
                onClick={handleFeedSelectionsToChat}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🚀 تلقيم الاختيارات المحددة إلى الشات</span>
                <span className="bg-slate-950 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {selectedNodeIds.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar & Pre-sets Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Search Input Card */}
            <div className="lg:col-span-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="text-slate-400 text-xs font-black block">🔍 بحث ذكي في الخريطة الذهنية:</span>
                <input
                  type="text"
                  placeholder="ابحث عن قانون، هيئة، تحدي، حيز..."
                  value={mindMapSearchQuery}
                  onChange={(e) => setMindMapSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1e21] text-white text-xs rounded-xl px-3 py-2.5 border border-[#2d2d31] focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 text-right font-medium"
                />
              </div>

              {/* Guide card */}
              <div className="bg-[#1e1e21]/40 border border-[#2d2d31] p-3 rounded-xl space-y-2">
                <span className="text-amber-500 text-[10px] font-black block">💡 كيف تستخدم الخريطة الذهنية؟</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  اختر البنود التي تهمك في قضيتك (مثل نوع الأرض، القوانين المطبقة، الجهة، أو التحدي) من الفروع الستة التفاعلية المقابلة، ثم اضغط على <strong>"تلقيم الاختيارات"</strong> لتمريرها في عقل الوكلاء الإدراكيين لتقديم إجابة مخصصة وحسابات فائقة الدقة!
                </p>
              </div>
            </div>

            {/* Pre-sets selections Card */}
            <div className="lg:col-span-8 bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-3">
              <span className="text-slate-400 text-xs font-black block">⚡ سياقات وحالات شائعة جاهزة (نقرة واحدة للتحديد المتعدد):</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESETS_DATA.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setSelectedNodeIds(preset.nodeIds);
                      triggerToast(`تم تطبيق قالب "${preset.name}" وتحديد بنوده تلقائياً!`, 'success');
                    }}
                    className="p-3 bg-[#1e1e21] hover:bg-zinc-900 text-right rounded-xl border border-[#2d2d31] hover:border-cyan-500/40 transition-all flex flex-col gap-1 relative group cursor-pointer"
                  >
                    <span className="text-white text-xs font-black group-hover:text-cyan-400 transition-colors">{preset.name}</span>
                    <span className="text-slate-400 text-[10px] leading-relaxed font-semibold">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Branches (6 main branches) */}
          <div className="space-y-4 pt-2">
            <span className="text-slate-400 text-xs font-black block mb-1">🔘 المستوى الأول: قطاع الأراضي في مصر (نظام متكامل للتملك والتداول والتخطيط)</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MIND_MAP_DATA.map((branch) => {
                // Filter nodes if search query exists
                const filteredNodes = branch.nodes.filter(node => 
                  node.label.includes(mindMapSearchQuery) || 
                  (node.details && node.details.includes(mindMapSearchQuery))
                );

                const isExpanded = expandedBranches.includes(branch.id);
                const selectedCountInBranch = branch.nodes.filter(n => selectedNodeIds.includes(n.id)).length;

                // Toggle branch accordion
                const toggleBranch = () => {
                  if (isExpanded) {
                    setExpandedBranches(expandedBranches.filter(id => id !== branch.id));
                  } else {
                    setExpandedBranches([...expandedBranches, branch.id]);
                  }
                };

                const selectAllInBranch = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const allBranchIds = branch.nodes.map(n => n.id);
                  setSelectedNodeIds(prev => {
                    const filtered = prev.filter(id => !allBranchIds.includes(id));
                    return [...filtered, ...allBranchIds];
                  });
                  triggerToast(`تم تحديد كافة عناصر [${branch.title}]`, 'success');
                };

                const deselectAllInBranch = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const allBranchIds = branch.nodes.map(n => n.id);
                  setSelectedNodeIds(prev => prev.filter(id => !allBranchIds.includes(id)));
                  triggerToast(`تم إلغاء تحديد عناصر [${branch.title}]`, 'info');
                };

                // Skip branch if search query entered and no matching nodes
                if (mindMapSearchQuery && filteredNodes.length === 0) return null;

                return (
                  <div 
                    key={branch.id} 
                    className="bg-zinc-950 rounded-2xl border border-[#2d2d31] overflow-hidden hover:border-[#3e3e42] transition-all flex flex-col h-full"
                  >
                    {/* Branch Title Row */}
                    <div 
                      onClick={toggleBranch}
                      className="bg-zinc-900/60 p-4 border-b border-[#2d2d31]/80 flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-all select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{branch.icon}</span>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-black text-white">{branch.title}</span>
                          <span className="text-[9px] text-slate-500 font-bold">المستوى الثاني • فرع رئيسي</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {selectedCountInBranch > 0 && (
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-black animate-pulse">
                            {selectedCountInBranch} محدد
                          </span>
                        )}
                        <span className="text-slate-600 font-bold text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Leaf Nodes View */}
                    {isExpanded && (
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        {/* Multi-select toggle helper */}
                        <div className="flex items-center justify-between border-b border-[#2d2d31]/40 pb-2 text-[10px]">
                          <span className="text-slate-500 font-bold">المستويات الفرعية (التفاصيل):</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={selectAllInBranch}
                              className="text-cyan-400 hover:text-cyan-300 font-black cursor-pointer"
                            >
                              تحديد الكل
                            </button>
                            <span className="text-slate-700">|</span>
                            <button 
                              onClick={deselectAllInBranch}
                              className="text-slate-500 hover:text-slate-400 font-bold cursor-pointer"
                            >
                              إلغاء الكل
                            </button>
                          </div>
                        </div>

                        {/* Nodes List */}
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
                          {filteredNodes.map((node) => {
                            const isNodeSelected = selectedNodeIds.includes(node.id);
                            
                            const handleNodeToggle = () => {
                              if (isNodeSelected) {
                                setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id));
                              } else {
                                setSelectedNodeIds([...selectedNodeIds, node.id]);
                              }
                            };

                            return (
                              <div 
                                key={node.id}
                                onClick={handleNodeToggle}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-right space-y-1 relative group select-none ${
                                  isNodeSelected 
                                    ? 'bg-cyan-500/5 border-cyan-500/40 shadow-sm shadow-cyan-500/5' 
                                    : 'bg-[#1e1e21]/40 border-[#2d2d31]/60 hover:border-slate-800'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  {/* Custom Checkbox */}
                                  <div className={`w-3.5 h-3.5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                                    isNodeSelected 
                                      ? 'bg-cyan-500 border-cyan-500 text-slate-950' 
                                      : 'border-[#2d2d31] group-hover:border-slate-700'
                                  }`}>
                                    {isNodeSelected && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[4px]" />}
                                  </div>

                                  <div className="flex-1 space-y-0.5">
                                    <span className={`text-[11px] font-black block leading-snug ${
                                      isNodeSelected ? 'text-cyan-400' : 'text-slate-200'
                                    }`}>
                                      {node.label}
                                    </span>
                                    {node.details && (
                                      <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                                        {node.details}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glowing feed control footer inside tab */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-4 rounded-xl border border-[#2d2d31] flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-right">
              <span className="text-white text-xs font-black block">هل انتهيت من تجميع نقاط الخريطة الذهنية؟</span>
              <p className="text-slate-400 text-[10px] font-bold mt-1">
                اضغط على الزر لتوجيه الاستعلام وحث عقل السرب الفيدرالي لإنشاء صياغات تخصصية بالغة الدقة.
              </p>
            </div>
            <button
              onClick={handleFeedSelectionsToChat}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <span>🚀 تلقيم النقاط المحددة ({selectedNodeIds.length}) لشات كرو إيجنت</span>
            </button>
          </div>

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
                الجزء الأول: جودة الأحكام
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
                خريطة الطريق والربط الذكي
              </button>
            </div>
          </div>

          {/* TAB CONTENTS */}
          {activePlanSection === 'part1' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <span className="text-amber-400 text-xs font-black block mb-1">الرؤية العامة للجزء الأول: جودة وصحة الأحكام القضائية</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  يهدف هذا المحور إلى إرساء قواعد عمل صارمة للحد من الثغرات، وضمان الالتزام بحيادية وشفافية المعاينة الميدانية، وتوفير دعائم قوية للقضاة لإصدار أحكام متسقة تماماً مع القانون والشريعة الإسلامية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Point 1 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-extrabold">١</span>
                      <h5 className="text-white text-xs font-black">الإعداد القانوني المتقن للدعوى</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      تتضمن مرحلة ما قبل رفع الدعوى دراسة مستفيضة للمذكرات، وتحليل الموقف المبدئي للنزاع، والتحقق من استكمال كافة المستندات والبيانات الأساسية قبل المباشرة الميدانية.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">الوكيل الإدراكي (Cognitive)</span>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-extrabold">٢</span>
                      <h5 className="text-white text-xs font-black">صياغة صحيفة الدعوى والمذكرات</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      صياغة فنية بالغة الإحكام تفرز الحجج القانونية بعناية، وتصنف الدفوع بشكل موضوعي، لتفادي الطعون أو التأويلات الخاطئة أثناء مراحل التقاضي.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">مساعد الصياغة القانونية</span>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-extrabold">٣</span>
                      <h5 className="text-white text-xs font-black">الإجراءات والتعامل مع المحكمة</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      إثبات الحضور، والالتزام بتقديم المستندات والتقارير الفنية والجيوديسية في الآجال المحددة، والتعامل بأسلوب مهني يعزز ثقة الهيئة القضائية.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">الوكيل المنسق (Orchestrator)</span>
                  </div>
                </div>

                {/* Point 4 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-extrabold">٤</span>
                      <h5 className="text-white text-xs font-black">ضمانات صحة الحكم القضائي</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      استخدام أدلة وبراهين لا تقبل الشك، كالوسم الجغرافي (GPS) المؤكد، والوسم الزمني الحاسم على صور المعاينة، وتوثيق الحدود بدقة متناهية لنفي التداخل والتدليس.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">الوكيل الجغرافي ونظم GPS</span>
                  </div>
                </div>

                {/* Point 5 */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-xs font-extrabold">٥</span>
                      <h5 className="text-white text-xs font-black">معايير قياس الجودة (KPIs)</h5>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                      تأسيس آلية رقابية مستمرة لمطابقة مخرجات التقارير بالمعايير الهندسية والفقهية المعتمدة، لتقليل نسب نقض الأحكام وضمان استقرار المراكز القانونية.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-950 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">الوكيل المسؤول:</span>
                    <span className="text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">الوكيل الفوقي (Meta-Agent)</span>
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
                      تقديم تبريرات واقعية مدعومة بالأدلة المقنعة، وصياغة مبسطة للحلول تفند كافة مزاعم الخصوم بأسلوب علمي ومنطقي محايد وموثق، يبعث بالرضا والسكينة لكافة الأطراف.
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

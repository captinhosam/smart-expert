import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Scale, 
  Building2, 
  FileText, 
  AlertTriangle, 
  ArrowLeftRight, 
  ChevronRight, 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface MindMapNode {
  id: string;
  label: string;
  type: 'land' | 'law' | 'entity' | 'procedure' | 'transaction' | 'risk';
  details: string;
  // Associated laws
  laws: Array<{ title: string; desc: string; link?: string }>;
  // Associated government agencies
  entities: Array<{ name: string; role: string }>;
  // Associated procedures or steps
  procedures: string[];
  // Potential risks & mitigation advice
  risks: { warning: string; solution: string };
}

interface MindMapBranch {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  nodes: MindMapNode[];
}

export default function MindMapTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'visual' | 'cards'>('visual');

  const landLocations = [
    {
      id: 'giza_agricultural',
      name: '🌾 أطيان العمرانية الزراعية (الجيزة)',
      coordinates: 'Lat: 30.0130, Lng: 31.2088',
      authority: 'الإدارة الزراعية المحلية بالجيزة، الهيئة العامة للإصلاح الزراعي',
      laws: 'قانون الإصلاح الزراعي رقم ١٧٨ لسنة ١٩٥٢ وقواعد حظر البناء على الرقعة الزراعية المباشرة.',
      documents: [
        { name: 'بطاقة الحيازة الزراعية المعتمدة وسارية الصلاحية لبيان المحصول والواضع لليد', required: true },
        { name: 'كشف رسمي من مأمورية الضرائب العقارية لبيان مكلفة الأطيان وتاريخ ربطها المالي', required: true },
        { name: 'إفادة رسمية من مجلس مدينة الجيزة تفيد بوقوع القطعة داخل أو خارج الحيز الزراعي المباشر', required: true },
        { name: 'عقد التنازل أو البيع المسلسل للتاريخ والتكليف الموثق', required: false }
      ],
      conditions: 'يُحظر تماماً إقامة أي منشآت خرسانية سكنية دون موافقة كتابية صريحة من وزير الزراعة وهيئة التعمير لضمان عدم تبوير الأراضي الطينية.'
    },
    {
      id: 'fayoum_desert',
      name: '🏜️ أراضي الصحراء الغربية والفيوم (خارج الزمام)',
      coordinates: 'Lat: 29.3084, Lng: 30.8428',
      authority: 'الهيئة العامة لمشروعات التعمير والتنمية الزراعية ولجنة استرداد الأراضي',
      laws: 'قانون الأراضي الصحراوية رقم ١٤٣ لسنة ١٩٨١ وإجراءات تقنين واضعي اليد رقم ١٤٤ لسنة ٢٠١٧.',
      documents: [
        { name: 'طلب تقنين وضع اليد الفعلي وموافقة اللجنة العليا لاسترداد أراضي الدولة', required: true },
        { name: 'رسم كروكي جيو-مساحي معتمد من مهندس عسكري مرخص ومسجل بالـ GPS لبيان عدم التداخل', required: true },
        { name: 'موافقة مكتوبة من عمليات القوات المسلحة وهيئة الآثار للتصريح بالنشاط والاستصلاح', required: true },
        { name: 'شهادة من وزارة الري تفيد توافر مقننات المياه الجوفية والآبار المرخصة', required: false }
      ],
      conditions: 'يُشترط جدية الاستصلاح بنسبة تزيد عن ٧٥٪ خلال ٣ سنوات من تاريخ استلام الأرض، ويُمنع تملك الأجانب أو مزدوجي الجنسية بشكل مطلق.'
    },
    {
      id: 'cairo_new_town',
      name: '🏢 أراضي التجمع الخامس والقاهرة الجديدة (مدن جديدة)',
      coordinates: 'Lat: 30.0102, Lng: 31.6112',
      authority: 'هيئة المجتمعات العمرانية الجديدة وجهاز مدينة القاهرة الجديدة',
      laws: 'قانون البناء الموحد رقم ١١٩ لسنة ٢٠٠٨ وتعديلاته الخاصة بالمدن والمجتمعات الحديثة.',
      documents: [
        { name: 'خطاب تخصيص قطعة الأرض المعتمد الصادر من هيئة المجتمعات العمرانية الجديدة', required: true },
        { name: 'محضر استلام قطعة الأرض الرسمي والحدود الموقعة من الإدارة الهندسية بالجهاز', required: true },
        { name: 'رخصة البناء الموحدة الصادرة والرسومات الهندسية المعتمدة من المهندس الاستشاري النقابي', required: true },
        { name: 'إيصالات سداد الأقساط والمصاريف الإدارية والخدمات المودعة ببنك التعمير والإسكان', required: false }
      ],
      conditions: 'الالتزام الكامل بالارتفاعات المقررة من جهاز المدينة (بدروم + أرضي + ٣ أدوار مكررة) والالتزام بنسبة البناء والواجهات الخارجية الموحدة.'
    },
    {
      id: 'sinai_border',
      name: '🛡️ أراضي المناطق الحدودية وشمال سيناء',
      coordinates: 'Lat: 31.1245, Lng: 33.8012',
      authority: 'وزارة الدفاع (هيئة العمليات)، جهاز تنمية شبه جزيرة سيناء والمحافظة المختصة',
      laws: 'المرسوم بقانون رقم ١٤ لسنة ٢٠١٢ بشأن التنمية المتكاملة في شبه جزيرة سيناء والحدود.',
      documents: [
        { name: 'موافقة كتابية معتمدة من هيئة عمليات القوات المسلحة الصادرة بالاسم وتاريخ الميلاد الفعلي للخصوم', required: true },
        { name: 'شهادة رسمية موثقة تثبت الجنسية المصرية المنفردة للمالك وأسلافه وللأبوين دون أي تداخل أجنبي', required: true },
        { name: 'عقد تداول حق الانتفاع المشهر بدفاتر السجل المطور بفرع الشهر العقاري بسيناء', required: true },
        { name: 'محضر المعاينة العسكرية والمساحة التفصيلية لحدود الطور والشيخ زويد', required: false }
      ],
      conditions: 'يُحظر تملك الأجانب مطلقاً في سيناء، ويقتصر التصرف على حق الانتفاع لمدد محددة قابلة للتجديد بموافقة القوات المسلحة وجهاز التنمية.'
    },
    {
      id: 'coast_resort',
      name: '🏖️ أراضي الساحل الشمالي والعلمين (سياحية ساحلية)',
      coordinates: 'Lat: 30.8256, Lng: 28.9512',
      authority: 'الهيئة العامة للتنمية السياحية، وزارة الإسكان، الإدارة الهندسية بمطروح الساحلية',
      laws: 'قوانين تملك الأراضي السياحية وحماية الشواطئ وحرم البحار والمجاري المائية.',
      documents: [
        { name: 'قرار التخصيص السياحي والترخيص الفني للتطوير الصادر من مجلس الوزراء أو التنمية السياحية', required: true },
        { name: 'شهادة مطابقة حرم البحر (موافقة هيئة حماية الشواطئ المصرية ووزارة البيئة)', required: true },
        { name: 'رفع مساحي طيفي معتمد من الهيئة العامة للمساحة المصرية لبيان محيط خط الماص', required: true },
        { name: 'ترخيص تصريف ومعالجة المياه الجوفية ذاتياً داخل الموقع لخدمة المجمع', required: false }
      ],
      conditions: 'الالتزام بحرم خط البحر الصافي (عادة ١٥٠ متراً) وعدم القيام بأعمال ردم للمياه أو إقامة لسان بحري دون موافقة مسبقة من مجلس الوزراء.'
    }
  ];

  const [selectedLocation, setSelectedLocation] = useState(landLocations[0]);

  const branches: MindMapBranch[] = [
    {
      id: 'b1',
      title: '📌 التصنيف المكاني والقانوني للأرض',
      icon: '📌',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      nodes: [
        {
          id: 'n1_1',
          label: 'الأراضي الزراعية (الأطيان) - داخل الزمام',
          type: 'land',
          details: 'الأراضي الواقعة ضمن خطوط الزمام الزراعي للقرى والمحافظات القديمة بجمهورية مصر العربية، والتي تم مسحها وتصنيفها كأراض طينية خصبة.',
          laws: [
            { title: 'قانون الإصلاح الزراعي (178 لسنة 1952)', desc: 'يحدد الحد الأقصى للملكية الزراعية للأفراد والعائلات وينظم العلاقة الإيجارية.' },
            { title: 'قانون الأطيان والضرائب العقارية', desc: 'يفرض ضريبة سنوية على الأطيان الزراعية تورد للمجالس المحلية.' }
          ],
          entities: [
            { name: 'هيئة التعمير والتنمية الزراعية', role: 'ولاية وإدارة الأراضي المستصلحة وتغيير النشاط.' },
            { name: 'الجمعية الزراعية المحلية', role: 'تسجيل الحيازة الزراعية وصرف الأسمدة وتوثيق الدورة الزراعية.' }
          ],
          procedures: [
            'الاستعلام عن البطاقة الحيازية بالجمعية الزراعية.',
            'الحصول على شهادة قيودات من مصلحة الضرائب العقارية (الأطيان).',
            'إعداد كروكي مساحي معتمد لمطابقة خط الزمام وفصل الحدود.'
          ],
          risks: {
            warning: 'تداخل الملكيات الشائعة بالوراثة، ووجود حظر تغيير النشاط من زراعي إلى سكني.',
            solution: 'الحصول على إفادة رسمية من الإدارة الزراعية بعدم وجود مخالفات تبوير أو بناء عشوائي.'
          }
        },
        {
          id: 'n1_2',
          label: 'الأراضي الصحراوية - خارج الزمام',
          type: 'land',
          details: 'الأراضي التي تقع خارج حدود الزمام على مسافة تبعد كيلومترين فأكثر، وتعتبر أراضي استصلاح وتنمية صحراوية خاضعة لضوابط جهات سيادية وأمنية.',
          laws: [
            { title: 'قانون الأراضي الصحراوية (143 لسنة 1981)', desc: 'يشترط أن تكون ملكية الأراضي الصحراوية للمصريين فقط ويحدد نسب الملكية للشركات والأفراد.' },
            { title: 'قانون 144 لسنة 2017 وقانون 182 لسنة 2018', desc: 'إجراءات تقنين واضعي اليد وإبرام عقود الطرح بالمزادات والتعاقدات الحكومية.' }
          ],
          entities: [
            { name: 'الهيئة العامة لمشروعات التعمير والتنمية الزراعية', role: 'تخصيص وإصدار عقود استصلاح الأراضي الصحراوية.' },
            { name: 'جهاز حماية أراضي الدولة والمحليات', role: 'تتبع حالات وضع اليد غير القانوني وإزالتها.' },
            { name: 'القوات المسلحة (العمليات)', role: 'استخراج الموافقات الأمنية وتصاريح البناء والاستصلاح خارج الزمام.' }
          ],
          procedures: [
            'تقديم طلب معاينة وتقنين للمحافظة المعنية أو لجنة استرداد الأراضي.',
            'دفع رسوم الفحص والمعاينة وتشكيل لجنة جغرافية لتحديد الإحداثيات (GPS).',
            'الحصول على موافقة القوات المسلحة ووزارة الآثار والري.'
          ],
          risks: {
            warning: 'وقوع الأرض تحت ولاية جهة أمنية، أو كونها مخصصة كمنطقة تعدين أو آثار أو محمية طبيعية.',
            solution: 'الفحص المسبق في المركز الوطني لتخطيط استخدامات أراضي الدولة للتأكد من جهة الولاية الحقيقية.'
          }
        },
        {
          id: 'n1_3',
          label: 'الأراضي المبنية (داخل الحيز العمراني)',
          type: 'land',
          details: 'العقارات والقطع الواقعة داخل المخططات التفصيلية المعتمدة (الحيز العمراني) للقرى والنجوع والمدن بجمهورية مصر العربية.',
          laws: [
            { title: 'قانون البناء الموحد (119 لسنة 2008)', desc: 'ينظم شروط إصدار تراخيص البناء والالتزام بالارتفاعات وخطوط التنظيم.' },
            { title: 'قانون التصالح في مخالفات البناء الجديد', desc: 'يسمح بتقنين المباني المخالفة وتوفيق أوضاعها لتفادي قرارات الإزالة.' }
          ],
          entities: [
            { name: 'مجلس المدينة أو الحي (المركز التكنولوجي)', role: 'إصدار بيان صلاحية الموقع وتراخيص الهدم والبناء والتشطيب والتصالح.' },
            { name: 'هيئة المجتمعات العمرانية الجديدة', role: 'في حالة وقوع الأرض في المدن الجديدة (كأكتوبر أو الشيخ زايد).' }
          ],
          procedures: [
            'استخراج شهادة صلاحية موقع من الناحية التخطيطية والاشتراطات البنائية.',
            'تقديم رسومات هندسية معتمدة من مهندس نقابي مرخص لمجلس الحي.',
            'دفع رسوم ترخيص البناء والتأمين الإنشائي.'
          ],
          risks: {
            warning: 'بناء بدون ترخيص، تخطي قيود الارتفاع، أو التعدي على خطوط التنظيم والشوارع المعتمدة.',
            solution: 'مراجعة المخطط الاستراتيجي المعتمد لقرية أو مدينة في الإدارة الهندسية بالحي قبل الشراء.'
          }
        },
        {
          id: 'n1_4',
          label: 'أراضي الدولة (الأملاك العامة والخاصة)',
          type: 'land',
          details: 'الأراضي المملوكة للدولة ملكية عامة (مخصصة للمنفعة العامة كالطرق والمقابر والسكك الحديدية) أو ملكية خاصة (يمكن التصرف فيها بالبيع أو الإيجار أو التقنين).',
          laws: [
            { title: 'القانون المدني المصري (مادة 87 و88)', desc: 'أقر عدم جواز تملك الأملاك العامة للدولة بالتقادم أو الحجز عليها.' },
            { title: 'قانون التعاقدات الحكومية (182 لسنة 2018)', desc: 'ينظم بيع وإيجار وتخصيص أملاك الدولة الخاصة بالمزادات العلنية.' }
          ],
          entities: [
            { name: 'لجنة استرداد أراضي الدولة والمستحقات', role: 'إدارة وإجراءات استرداد الأراضي المتعدى عليها وتقنينها.' },
            { name: 'الهيئة العامة للخدمات الحكومية', role: 'تقييم وتثمين أراضي الدولة وإجراء المزادات العلنية.' }
          ],
          procedures: [
            'تقديم طلب شراء أو تقنين للأملاك الخاصة عبر منظومة المحافظة.',
            'موافقة مجلس الوزراء في حالات التخصيص بالأمر المباشر للمشروعات التنموية.',
            'سداد الدفعة المقدمة (عادة 25%) وجدولة الأقساط لحين إصدار العقد النهائي.'
          ],
          risks: {
            warning: 'شراء أرض دولة خاصة عن طريق عقود عرفية وهمية من واضعي يد دون تقنين رسمي.',
            solution: 'التأكد من خلو الأرض من قرارات إزالة أو تعديات، والتحقق من رقم طلب التقنين وصحة سداد الأقساط.'
          }
        }
      ]
    },
    {
      id: 'b2',
      title: '⚖️ الإطار التشريعي والقوانين الحاكمة',
      icon: '⚖️',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      nodes: [
        {
          id: 'n2_1',
          label: 'قوانين تملك الأجانب في مصر',
          type: 'law',
          details: 'القوانين الاستثنائية التي تنظم حق تملك غير المصريين للعقارات المبنية والأراضي الفضاء تلافياً للاحتكار.',
          laws: [
            { title: 'القانون رقم 230 لسنة 1996', desc: 'يجيز للأجنبي تملك عقارين على الأكثر في جميع أنحاء الجمهورية بقصد السكن الخاص وبحد أقصى 3000 متر مربع لكل عقار.' },
            { title: 'مرسوم حظر التملك في شبه جزيرة سيناء', desc: 'يحظر تملك الأراضي والعقارات نهائياً لغير المصريين في سيناء والمناطق الحدودية.' }
          ],
          entities: [
            { name: 'مكتب تملك الأجانب بوزارة العدل', role: 'مراجعة طلبات تملك غير المصريين وإصدار قرارات الموافقة.' },
            { name: 'مصلحة الجوازات والهجرة', role: 'التحقق من الإقامة الرسمية للمشتري الأجنبي.' }
          ],
          procedures: [
            'تقديم طلب لوزير العدل باسم المشتري الأجنبي مرفقاً بصورة جواز السفر والإقامة السارية.',
            'الحصول على موافقات الجهات الأمنية والسيادية المختصة.',
            'تسجيل العقد بالشهر العقاري عقب صدور قرار الموافقة الرئاسي أو الوزاري.'
          ],
          risks: {
            warning: 'شراء الأجنبي لعقارات في المناطق الحدودية أو سيناء بموجب عقود عرفية دون تسجيل رسمي مما يعرضه للبطلان المطلق.',
            solution: 'الاعتماد على حق الانتفاع طويل الأجل (حتى 50 سنة) كبديل قانوني آمن ومصرح به في تلك المناطق.'
          }
        },
        {
          id: 'n2_2',
          label: 'قانون الشهر العقاري الجديد',
          type: 'law',
          details: 'القانون المعدل لتسهيل إجراءات تسجيل العقارات بالشهر العقاري وفصل ضريبة التصرفات عن التسجيل لتسهيل الثروة العقارية.',
          laws: [
            { title: 'قانون رقم 9 لسنة 2022 المعدل للشهر العقاري', desc: 'تبسيط مستندات التسجيل، وتحديد سقف زمني للطلب (37 يوماً)، وإتاحة التسجيل الإلكتروني.' }
          ],
          entities: [
            { name: 'مصلحة الشهر العقاري والتوثيق', role: 'تسجيل العقارات وإثبات تاريخ المحررات وإشهار الملكيات.' },
            { name: 'الهيئة العامة للمساحة المصرية', role: 'إجراء الرفع المساحي وإصدار شهادات المطابقة والخرائط المعتمدة.' }
          ],
          procedures: [
            'تقديم طلب تسجيل إلكتروني أو ورقي للمأمورية المختصة.',
            'إرفاق كروكي مساحي رقمي صادر من الجهات المساحية المعتمدة (الرفع الجيوديسي).',
            'دفع رسوم التسجيل (بحد أقصى 3900 جنيه طبقاً للتعديل الأخير).'
          ],
          risks: {
            warning: 'رفض طلب التسجيل لعدم وجود تسلسل ملكية مسجل للعقود الابتدائية السابقة.',
            solution: 'استغلال مسار "حيازة خمس سنوات هادئة مستقرة بنية التملك" المتاح في القانون الجديد لتسجيل العقار.'
          }
        }
      ]
    },
    {
      id: 'b3',
      title: '🏛️ الجهات والهيئات المعنية بالتنفيذ',
      icon: '🏛️',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      nodes: [
        {
          id: 'n3_1',
          label: 'هيئة المجتمعات العمرانية الجديدة',
          type: 'entity',
          details: 'الجهة التابعة لوزارة الإسكان، والمسؤولة عن تخطيط وتطوير وطرح الأراضي السكنية والخدمية والصناعية في المدن الجديدة بجمهورية مصر العربية.',
          laws: [
            { title: 'القانون رقم 59 لسنة 1979', desc: 'إنشاء هيئة المجتمعات العمرانية الجديدة وإخضاع كافة المدن الجديدة لولايتها الكاملة.' }
          ],
          entities: [
            { name: 'جهاز المدينة المختص (مثل جهاز الشيخ زايد/أكتوبر)', role: 'متابعة التراخيص، سداد الأقساط، التنازلات، والخدمات الميدانية.' }
          ],
          procedures: [
            'سداد جدية الحجز وتقديم المستندات لحجز الأراضي والوحدات عبر الموقع الإلكتروني للهيئة.',
            'استلام محضر تخصيص الأرض والالتزام بالجدول الزمني للبناء.',
            'استخراج ترخيص البناء ومطابقة البناء للرخصة لاستخراج شهادة صلاحية المبنى للتصرف.'
          ],
          risks: {
            warning: 'سحب تخصيص الأرض أو إلغاؤه في حال التأخر عن سداد الأقساط السنوية أو عدم البناء في المدة المحددة.',
            solution: 'الالتزام التام بجدول التنفيذ الإنشائي وتقديم طلبات تمديد رسمية للجهاز قبل انتهاء المهل.'
          }
        },
        {
          id: 'n3_2',
          label: 'مصلحة الشهر العقاري والتوثيق',
          type: 'entity',
          details: 'إحدى المصالح الحكومية التابعة لوزارة العدل المصرية، وتختص بحفظ أصول الملكية العقارية والتصرفات العينية لضمان الحماية المطلقة للثروة العقارية.',
          laws: [
            { title: 'قانون التوثيق رقم 68 لسنة 1947', desc: 'ينظم تصرفات التوثيق والتوكيلات وتصديق التوقيعات على العقود.' }
          ],
          entities: [
            { name: 'مأمورية الشهر العقاري ببلد العقار', role: 'تسجيل الملكية العقارية وإصدار أرقام مشهرة ودفاتر قيد طلبات التسجيل.' }
          ],
          procedures: [
            'طلب استخراج توثيق وتصديق على عقد بيع ابتدائي.',
            'تقديم طلب بحث ملكية وتحديد المكلفات والضرائب.',
            'قيد العقد في السجل العيني أو الشخصي وإشهاره بصفة نهائية.'
          ],
          risks: {
            warning: 'تزوير العقود والتوكيلات الرسمية عند شراء عقار من أشخاص يدعون النيابة عن الملاك الأصليين.',
            solution: 'التوجه الفوري لمأمورية التوثيق الصادر منها التوكيل للاستعلام الفوري في السجلات والباركود قبل التوقيع.'
          }
        }
      ]
    },
    {
      id: 'b4',
      title: '📝 دورة حياة الأرض وإجراءات التداول',
      icon: '📝',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      nodes: [
        {
          id: 'n4_1',
          label: 'مرحلة الفحص والاستعلام والخرائط',
          type: 'procedure',
          details: 'الخطوة الأولى والأهم قبل الإقدام على أي معاملة عقارية للتحقق من سلامة الأبعاد الجغرافية والسند القانوني للبائع.',
          laws: [
            { title: 'قانون التخطيط العمراني وقواعد المساحة', desc: 'يلزم مطابقة العقار لخطوط التنظيم والأبعاد المساحية المعتمدة.' }
          ],
          entities: [
            { name: 'مكتب المساحة العسكري والمدني', role: 'إجراء الرفع المساحي بالأقمار الصناعية (GPS) وإصدار الكروكي المعتمد.' },
            { name: 'مأمورية الضرائب العقارية', role: 'الاستعلام عن المكلفة الضريبية وسداد العوائد السنوية المستحقة.' }
          ],
          procedures: [
            'الاستعلام الجغرافي والميداني ومطابقة معالم الأرض بخرائط مصلحة المساحة.',
            'طلب شهادة سلبية للرهون والقيودات العقارية من الشهر العقاري.',
            'معاينة الطبيعة للتحقق من عدم وجود حيازة غاصبة أو واضعي يد عشوائيين.'
          ],
          risks: {
            warning: 'تداخل حدود الأرض مع أراضي الجيران أو أراضي دولة مجاورة بسبب اعتماد القياسات العشوائية القديمة.',
            solution: 'إصدار "كروكي رفع مساحي جيوديسي" معتمد ذي إحداثيات عالمية لضمان الأبعاد والمساحة الحقيقية.'
          }
        },
        {
          id: 'n4_2',
          label: 'التعاقد والبيع وسداد ضريبة التصرفات',
          type: 'procedure',
          details: 'مرحلة تحرير عقود المعاملة العقارية وسداد الضرائب المستحقة قانوناً للدولة لإثبات تاريخ ونقل التكليف العقاري.',
          laws: [
            { title: 'المادة 426 من القانون المدني (عقد البيع)', desc: 'تحدد شروط انعقاد عقد البيع بركني التراضي والثمن ومواصفات المبيع.' },
            { title: 'المادة 42 من قانون الضريبة على الدخل', desc: 'تفرض ضريبة تصرفات عقارية بنسبة 2.5% من إجمالي قيمة التصرف العقاري يسددها البائع.' }
          ],
          entities: [
            { name: 'مصلحة الضرائب المصرية (شعبة الدخل)', role: 'تحصيل ضريبة التصرفات العقارية وإصدار مخالصات السداد للعقار.' }
          ],
          procedures: [
            'تحرير عقد البيع الابتدائي بواسطة مستشار عقاري متخصص لضمان البنود.',
            'سداد ضريبة التصرفات العقارية البالغة 2.5% خلال ثلاثين يوماً من تاريخ البيع.',
            'إجراء دعوى "صحة توقيع" أو "صحة ونفاذ" أمام المحكمة المدنية لتوثيق توقيع البائع.'
          ],
          risks: {
            warning: 'إغفال سداد ضريبة التصرفات العقارية مما يحول دون إدخال المرافق (الكهرباء والمياه) أو تسجيل العقد نهائياً.',
            solution: 'وضع بند صريح في عقد البيع يحدد الملتزم بسداد ضريبة التصرفات (البائع قانوناً) وتجنب تهرب البائع منها.'
          }
        }
      ]
    },
    {
      id: 'b5',
      title: '💼 أنواع التصرفات والمعاملات العقارية',
      icon: '💼',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      nodes: [
        {
          id: 'n5_1',
          label: 'قسمة المهايأة والفرز والتجنيب',
          type: 'transaction',
          details: 'التصرفات الخاصة بتقسيم الأراضي الشائعة والعقارات بين الورثة والشركاء لإنهاء حالة الشيوع وتخصيص نصيب مفرز لكل شريك.',
          laws: [
            { title: 'القانون المدني المصري (مادة 846 وما بعدها)', desc: 'تنظم قسمة المهايأة المكانية أو الزمانية للمنفعة وقواعد الفرز والتجنيب العيني.' }
          ],
          entities: [
            { name: 'المحكمة المدنية المختصة (دائرة الفرز)', role: 'الفصل في دعاوى الفرز والتجنيب وتكليف خبراء وزارة العدل بالتقسيم.' },
            { name: 'مصلحة الخبراء بوزارة العدل', role: 'انتداب خبير لمعاينة الأرض الشائعة وتصميم كروكي القسمة العادل هندسياً.' }
          ],
          procedures: [
            'تحرير عقد قسمة اتفاقي (رضائي) بين جميع الشركاء على الشيوع وتوقيعهم.',
            'في حال النزاع، رفع دعوى فرز وتجنيب أمام المحكمة المدنية الجزئية.',
            'انتداب خبير لتقسيم الأرض هندسياً إلى حصص مفرزة تناسب الأنصبة الشرعية.'
          ],
          risks: {
            warning: 'عدم قابلية الأرض للقسمة العينية بسبب صغر المساحة المفرزة الناتجة (تفتيت الحيازة الزراعية).',
            solution: 'اللجوء لقسمة المهايأة الزمنية أو بيع الأرض كاملة في المزاد العلني وتوزيع الثمن على الشركاء.'
          }
        }
      ]
    },
    {
      id: 'b6',
      title: '⚠️ التحديات والمخاطر والنزاعات الشائعة',
      icon: '⚠️',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      nodes: [
        {
          id: 'n6_1',
          label: 'نزاعات وضع اليد وغصب الحيازة',
          type: 'risk',
          details: 'أكثر المخاطر والنزاعات شيوعاً في الأراضي الفضاء والصحراوية، حيث يقوم غاصب بالسيطرة الفعلية على الأرض دون سند قانوني.',
          laws: [
            { title: 'المادة 369 من قانون العقوبات المصري', desc: 'تجريم التعدي على عقار حيازة الغير بقصد غصبه أو منعه من حيازة ملكه العقاري.' },
            { title: 'المادة 970 من القانون المدني', desc: 'تنظم حماية الحيازة ودعاوى استرداد الحيازة ووقف الأعمال الجديدة.' }
          ],
          entities: [
            { name: 'النيابة العامة (المحامي العام لنيابات المرور والتموين والعقارات)', role: 'إصدار قرارات تمكين الحيازة ووقف التعديات لحين حسم النزاع قضائياً.' },
            { name: 'قسم الشرطة التابع له العقار', role: 'معاينة واقعة غصب الحيازة وتثبيت الشكوى وإجراء التحريات الميدانية.' }
          ],
          procedures: [
            'تحرير محضر إثبات حالة تعدي وغصب حيازة في قسم الشرطة المختص.',
            'متابعة المحضر لإرساله لنيابة المحامي العام لإجراء تحريات المباحث وسؤال الجيران.',
            'صدور قرار تمكين عاجل من النيابة العامة لصالح الحائز الفعلي المسلوب حيازته.'
          ],
          risks: {
            warning: 'انتظار الحائز المتضرر لشهور طويلة قبل تقديم شكوى الحيازة مما يضعف موقفه القانوني أمام النيابة العامة.',
            solution: 'تقديم طلب التمكين خلال فترة لا تتجاوز سنة واحدة من تاريخ علم المالك بواقعة سلب الحيازة.'
          }
        }
      ]
    }
  ];

  // Map types to background and text colors
  const getTypeBadge = (type: MindMapNode['type']) => {
    switch (type) {
      case 'land':
        return { label: 'تصنيف مكاني', color: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' };
      case 'law':
        return { label: 'تشريع وقانون', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' };
      case 'entity':
        return { label: 'جهة وهيئة', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' };
      case 'procedure':
        return { label: 'خطوة وإجراء', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20' };
      case 'transaction':
        return { label: 'صفقة وتصرف', color: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' };
      case 'risk':
        return { label: 'نزاع وتحدي', color: 'bg-red-500/15 text-red-400 border border-red-500/20' };
    }
  };

  // Pre-filter nodes based on search and active branch
  const allNodes = branches.flatMap(b => b.nodes.map(n => ({ ...n, branchTitle: b.title, branchId: b.id })));
  
  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = 
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.laws.some(l => l.title.includes(searchQuery) || l.desc.includes(searchQuery)) ||
      node.entities.some(e => e.name.includes(searchQuery));
    
    const matchesBranch = activeBranchId === 'all' || node.branchId === activeBranchId;
    
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-right" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-white text-lg font-black flex items-center gap-2">
            <Compass className="w-5.5 h-5.5 text-amber-500 animate-spin-slow" />
            <span>نظم الخرائط والمسح الجغرافي والخريطة الذهنية للأراضي 🗺️</span>
          </h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            منظومة الاستقصاء الميداني وتحديد الإحداثيات الجغرافية (GPS)، وربطها بالمستندات الإلزامية والتشريعات العينية للأراضي.
          </p>
        </div>

        {/* View mode toggle & search */}
        <div className="flex items-center gap-2 w-full md:w-auto self-end">
          <button 
            onClick={() => setViewMode(viewMode === 'visual' ? 'cards' : 'visual')}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>عرض {viewMode === 'visual' ? 'بطاقات السندات' : 'المخطط التفاعلي'}</span>
          </button>
        </div>
      </div>

      {/* 📍 دليل مستندات الأراضي والرفع المساحي والـ GPS حسب الموقع الجغرافي */}
      <div className="bg-slate-950/75 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/25">
              <MapPin className="w-5 h-5 animate-bounce text-amber-400" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-white text-xs font-black">المستندات المطلوبة والشروط التفصيلية لكل قطعة أرض (GPS)</span>
              <span className="text-[10px] text-slate-500 font-extrabold mt-0.5">اختر النطاق الجغرافي لعرض المستندات والجهات والضوابط المنفردة بكل موقع</span>
            </div>
          </div>
          
          {/* Dropdown / Location Tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto gap-1">
            {landLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc);
                  triggerToast(`تم تحميل مستندات وشروط: ${loc.name}`, 'success');
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all shrink-0 cursor-pointer ${
                  selectedLocation.id === loc.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {loc.name.split(' ')[0]} {loc.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* Info Side */}
          <div className="lg:col-span-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-850 space-y-3">
            <div>
              <span className="text-slate-500 text-[9px] font-black block">📍 الاسم الجغرافي المحدد:</span>
              <span className="text-amber-400 font-black text-xs block mt-0.5">{selectedLocation.name}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
              <div>
                <span className="text-slate-500 text-[9px] font-black block">🌐 إحداثيات GPS المعتمدة:</span>
                <span className="text-slate-300 font-mono text-[10px] block mt-0.5">{selectedLocation.coordinates}</span>
              </div>
              <div className="bg-slate-900 px-2 py-1 rounded text-[9px] text-emerald-400 font-bold border border-emerald-500/10">
                LOCKED ✓
              </div>
            </div>
            <div className="border-t border-slate-900 pt-2.5">
              <span className="text-slate-500 text-[9px] font-black block">🏛️ جهة الولاية والاعتماد الفني:</span>
              <span className="text-slate-300 font-bold text-[10px] block mt-0.5 leading-relaxed">{selectedLocation.authority}</span>
            </div>
            <div className="border-t border-slate-900 pt-2.5">
              <span className="text-slate-500 text-[9px] font-black block">⚖️ القانون الحاكم المباشر:</span>
              <span className="text-amber-300/90 font-bold text-[10px] block mt-0.5 leading-relaxed">{selectedLocation.laws}</span>
            </div>
          </div>

          {/* Documents Checklist */}
          <div className="lg:col-span-2 bg-[#1b1b1f]/40 p-4 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-white text-xs font-black">📋 قائمة المستندات المطلوبة (مستند بمستند):</span>
              <span className="text-[9px] text-amber-500 font-bold">تتغير تلقائياً حسب طبيعة وموقع الأرض</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedLocation.documents.map((doc, index) => (
                <div key={index} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-amber-400 mt-0.5">📄</span>
                    <div className="space-y-0.5 text-right">
                      <span className="text-slate-200 text-[10px] font-black block leading-snug">{doc.name}</span>
                      <span className="text-[8px] text-slate-500 font-extrabold block">تنسيق ممسوح رقمياً مسبقاً (PDF)</span>
                    </div>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                    doc.required 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {doc.required ? 'إلزامي قطعي' : 'اختياري مكمل'}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-900 pt-2.5 mt-2.5 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
              <span className="text-amber-400 text-[10px] font-black block flex items-center gap-1.5">
                <span className="animate-ping w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                <span>⚠️ الشروط الخاصة وضوابط البناء العقارية بالموقع:</span>
              </span>
              <p className="text-slate-300 text-[10px] leading-relaxed font-bold mt-1">{selectedLocation.conditions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Central Root Display in Visual Mode */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/25">
            <Scale className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold block">🔘 المستوى الأول: المركز (الجذر الرئيسي)</span>
            <span className="text-white text-xs font-black">قطاع الأراضي في مصر (نظام متكامل للتملك، التداول، والتخطيط)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1e1e21]/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-400">
          <span>💡 انقر على أي عقدة لاستكشاف القوانين والمصالح والحلول الإرشادية فورا!</span>
        </div>
      </div>

      {/* Control Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
          <input 
            type="text" 
            placeholder="ابحث عن تشريع، جهة حكومية، تحدي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 text-right placeholder:text-slate-600 font-semibold"
          />
        </div>

        {/* Branch Filter Tabs */}
        <div className="md:col-span-8 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button 
            onClick={() => setActiveBranchId('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0 transition-all cursor-pointer ${
              activeBranchId === 'all' 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-850/60'
            }`}
          >
            الكل ({allNodes.length})
          </button>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBranchId(b.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                activeBranchId === b.id 
                  ? 'bg-slate-800 border-amber-500 text-amber-400 border' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-850/60'
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.title.split(' ')[1] || b.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Diagram & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT/CENTER: Interactive Map or Cards View (المخطط التفاعلي) */}
        <div className="lg:col-span-7 space-y-4">
          
          {viewMode === 'visual' ? (
            <div className="space-y-4">
              {branches.map((branch) => {
                const isBranchActive = activeBranchId === 'all' || activeBranchId === branch.id;
                if (!isBranchActive) return null;

                // Nodes that match search query
                const matchingNodes = branch.nodes.filter(n => 
                  n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  n.details.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (searchQuery && matchingNodes.length === 0) return null;

                return (
                  <div 
                    key={branch.id}
                    className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3 hover:border-slate-800 transition-all"
                  >
                    {/* Branch Label - Level 2 */}
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <span className="text-base">{branch.icon}</span>
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-black text-white">{branch.title}</span>
                        <span className="text-[9px] text-slate-500 font-extrabold">المستوى الثاني • فرع رئيسي</span>
                      </div>
                    </div>

                    {/* Nodes Grid - Level 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {matchingNodes.map((node) => {
                        const isSelected = selectedNode?.id === node.id;
                        const badgeInfo = getTypeBadge(node.type);

                        return (
                          <div
                            key={node.id}
                            onClick={() => {
                              setSelectedNode(node);
                              triggerToast(`تم فتح تفاصيل ومستندات: "${node.label}"`, 'info');
                            }}
                            className={`p-3 rounded-xl border cursor-pointer select-none text-right transition-all group flex flex-col justify-between h-28 ${
                              isSelected 
                                ? 'bg-amber-500/5 border-amber-500/60 shadow-md shadow-amber-500/5' 
                                : 'bg-slate-950 hover:bg-slate-900/60 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black inline-block ${badgeInfo.color}`}>
                                {badgeInfo.label}
                              </span>
                              <h4 className={`text-[11px] font-black line-clamp-2 leading-snug ${
                                isSelected ? 'text-amber-400' : 'text-slate-200 group-hover:text-amber-300'
                              }`}>
                                {node.label}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-[9px] text-slate-500 font-bold">
                              <span>شاهد السندات والجهات المباشرة</span>
                              <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Cards Detailed List View */
            <div className="space-y-3">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const badgeInfo = getTypeBadge(node.type);
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      triggerToast(`تم فتح مراجع: "${node.label}"`, 'info');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer text-right transition-all hover:border-slate-700 ${
                      isSelected 
                        ? 'bg-amber-500/5 border-amber-500/50 shadow-md shadow-amber-500/5' 
                        : 'bg-slate-950 border-slate-850 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${badgeInfo.color}`}>
                            {badgeInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-extrabold">{node.branchTitle}</span>
                        </div>
                        <h4 className="text-white text-xs font-black leading-snug">{node.label}</h4>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-semibold max-w-xl">{node.details}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-[#1e1e21] border border-slate-850 px-2.5 py-1 rounded-lg text-[9px] text-slate-400 font-black">
                        <span>{node.laws.length} قوانين</span>
                        <span>•</span>
                        <span>{node.entities.length} جهات</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredNodes.length === 0 && (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-850 text-center text-slate-500 text-xs font-bold">
                  ⚠️ عذراً، لم نجد بنود مطابقة لكلمات البحث في هذه الفروع.
                </div>
              )}
            </div>
          )}

        </div>

        {/* LEFT: Inspector panel - Displays laws and entities associated with the selected node (مفتش السندات والجهات) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-4 sticky top-6 shadow-2xl">
            
            {/* Header of Inspector */}
            <div className="border-b border-slate-900 pb-3">
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black inline-block">
                مفتش السندات والجهات والحلول المباشرة 🔍
              </span>
              <h3 className="text-white text-xs font-black mt-2 leading-relaxed">
                {selectedNode ? selectedNode.label : 'اختر عقدة (Node) لاستكشاف المستندات'}
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs font-semibold">
                
                {/* Node Description */}
                <div className="bg-[#1e1e21] p-3 rounded-lg border border-slate-850 space-y-1">
                  <span className="text-slate-500 text-[9px] font-black block">📝 تفاصيل البند والتعريف الجغرافي:</span>
                  <p className="text-slate-300 text-[10px] leading-relaxed font-medium">{selectedNode.details}</p>
                </div>

                {/* Associated Laws Section (القوانين والتشريعات العينية) */}
                <div className="space-y-2">
                  <span className="text-slate-400 text-[9px] font-black block flex items-center gap-1">
                    <Scale className="w-3 h-3 text-amber-500" />
                    <span>⚖️ القوانين والتشريعات الحاكمة للملف (مباشرة):</span>
                  </span>
                  
                  <div className="space-y-2">
                    {selectedNode.laws.map((law, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-850/60 p-2.5 rounded-lg space-y-1">
                        <span className="text-white text-[10px] font-black block">← {law.title}</span>
                        <p className="text-slate-400 text-[9px] leading-relaxed font-semibold">{law.desc}</p>
                      </div>
                    ))}
                    {selectedNode.laws.length === 0 && (
                      <span className="text-slate-600 text-[9px] block">لا توجد قوانين خاصة مسجلة لهذا البند.</span>
                    )}
                  </div>
                </div>

                {/* Government & Legal Entities (الجهات والهيئات المعنية) */}
                <div className="space-y-2">
                  <span className="text-slate-400 text-[9px] font-black block flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    <span>🏛️ الجهات والمصالح والهيئات المعنية بالتنفيذ:</span>
                  </span>

                  <div className="space-y-1.5">
                    {selectedNode.entities.map((ent, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-[#1e1e21] p-2 rounded-lg border border-slate-900">
                        <span className="text-xs">🏢</span>
                        <div className="space-y-0.5 text-right">
                          <span className="text-slate-200 text-[10px] font-black block">{ent.name}</span>
                          <span className="text-slate-400 text-[9px] font-semibold block">{ent.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Procedural life cycle steps (الخطوات الإجرائية) */}
                <div className="space-y-2">
                  <span className="text-slate-400 text-[9px] font-black block flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-400" />
                    <span>📝 خطوات وإجراءات التداول / التقنين المطلوبة:</span>
                  </span>

                  <ol className="space-y-1.5 list-decimal list-inside text-[9.5px] text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/40">
                    {selectedNode.procedures.map((proc, idx) => (
                      <li key={idx} className="pb-1 last:pb-0 border-b last:border-0 border-slate-900/50">
                        <span className="font-semibold">{proc}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Risks & Personal Guidance */}
                <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black">⚠️ المخاطر المحتملة وتوجيه كابتن حسام العقاري:</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[9.5px] leading-relaxed">
                    <p className="text-red-300 font-semibold">
                      <strong className="text-slate-400 text-[9px] block">المخاطر والعيوب:</strong>
                      {selectedNode.risks.warning}
                    </p>
                    <p className="text-emerald-400 font-extrabold">
                      <strong className="text-slate-400 text-[9px] block">الحلول والتحصين المباشر:</strong>
                      {selectedNode.risks.solution}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              /* No selection state placeholder */
              <div className="py-12 text-center text-slate-500 text-[11px] space-y-2 flex flex-col items-center justify-center font-bold">
                <span>📚 يرجى تحديد أي عقدة تفاعلية من القائمة على اليمين.</span>
                <span className="text-slate-600 text-[9px] max-w-[250px] leading-normal font-semibold">
                  سيقوم المحلل ومفتش السندات بربطها بالجهات والضرائب والحلول الميدانية والتعليمات القانونية فورا!
                </span>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

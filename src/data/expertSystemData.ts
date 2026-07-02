import { AgentInfo, CaseData } from '../types';

/**
 * Lists of sub-menus and menus requested in design guidelines.
 */
export const MENU_STRUCTURE = {
  FILE: [
    { label: 'ملف جديد', shortcut: 'Ctrl+N', icon: 'FilePlus' },
    { label: 'فتح ملف', shortcut: 'Ctrl+O', icon: 'FolderOpen' },
    { label: 'حفظ', shortcut: 'Ctrl+S', icon: 'Save' },
    { label: 'حفظ باسم', shortcut: 'Ctrl+Shift+S', icon: 'SaveAll' },
    { label: 'تصدير إلى PDF', shortcut: 'Ctrl+P', icon: 'FileText' },
    { label: 'تصدير إلى Excel', shortcut: 'Ctrl+E', icon: 'Table' },
    { label: 'طباعة التقرير', shortcut: 'Ctrl+Shift+P', icon: 'Printer' },
    { label: 'خروج', shortcut: 'Ctrl+Q', icon: 'LogOut' }
  ],
  EXPERT: [
    { label: 'خبراء عقاريون', desc: 'تقييم عقاري، فرز، إدارة أملاك، نزاعات ملكية' },
    { label: 'خبراء هندسيون', desc: 'مهندسو إنشاءات، مساحة، عمارة، طرق وكباري' },
    { label: 'خبراء قانونيون', desc: 'محامون عقاريون، مستشارو ملكية، خبراء عقود، وسيط' },
    { label: 'خبراء ماليون', desc: 'محاسب قانوني، مدقق، مستشار تمويل، مقيم مالي' },
    { label: 'خبراء مساحيون', desc: 'مساح أراضي، مساح جيوديسي (GPS)، مساح طبوغرافي' },
    { label: 'خبراء بيئيون', desc: 'مهندس بيئة، خبير تلوث، زراعي، مياه جوفية' },
    { label: 'خبراء تقنيون', desc: 'خبير نظم معلومات جغرافية (GIS)، ذكاء اصطناعي، BIM' },
    { label: 'خبراء إداريون', desc: 'مدير مشاريع، إدارة عقارية، تسويق، إدارة مخاطر' },
    { label: 'خبراء اقتصاديون', desc: 'اقتصاد عقاري، دراسة جدوى، تحليل أسواق وأسعار' },
    { label: 'خبراء أمنيون', desc: 'أمن مباني، سلامة وحماية مدنية، مكافحة حرائق' }
  ],
  ENGINEERING: [
    { label: 'هندسة مدنية', desc: 'إنشاءات، خرسانة، تربة، طرق' },
    { label: 'هندسة معمارية', desc: 'تصميم، تخطيط، تراث، ديكور' },
    { label: 'هندسة إنشائية', desc: 'تحميلات، زلازل، كمرات، أعمدة' },
    { label: 'هندسة كهربائية', desc: 'توزيع، طاقة، إضاءة، أنظمة' },
    { label: 'هندسة ميكانيكية', desc: 'تدفئة، تكييف، مصاعد، أنابيب' },
    { label: 'هندسة مساحية', desc: 'GPS، خرائط، حدود، معاينة' },
    { label: 'هندسة بيئية', desc: 'تلوث، مياه، صرف، بيئة' },
    { label: 'تخطيط عمراني', desc: 'مدن، مناطق، تقسيمات، مستقبل' },
    { label: 'موارد مائية', desc: 'ري، سدود، آبار، فيضانات' },
    { label: 'طرق ونقل', desc: 'طرق، كباري، أنفاق، مواصلات' }
  ],
  TECHNOLOGY: [
    { label: 'نظم معلومات جغرافية GIS', desc: 'خرائط رقمية، تحليل مكاني، بيانات' },
    { label: 'ذكاء اصطناعي عقاري', desc: 'تقييم آلي، تحليل سوق، تنبؤ' },
    { label: 'تحليل بيانات ضخمة', desc: 'Big Data، إحصاء، نمذجة' },
    { label: 'نمذجة معلومات البناء BIM', desc: 'نماذج ثلاثية الأبعاد، توثيق' },
    { label: 'طائرات بدون طيار (Drones)', desc: 'تصوير جوي، مسح، مراقبة' },
    { label: 'الواقع الافتراضي والمعزز', desc: 'جولات افتراضية، محاكاة' },
    { label: 'أنظمة إدارة العقارات (PMS)', desc: 'عقود، إيجار، صيانة' },
    { label: 'الأمن السيبراني العقاري', desc: 'حماية بيانات، تشفير' },
    { label: 'البلوك تشين والعقارات', desc: 'عقود ذكية، توثيق، شفافية' },
    { label: 'الحوسبة السحابية', desc: 'تخزين، مشاركة، تعاون' }
  ],
  TECHNICAL: [
    { label: 'الرسومات الهندسية', desc: 'AutoCAD، أوتوكاد، تخطيط' },
    { label: 'المعاينة الفنية', desc: 'جودة، اختبارات، مواد' },
    { label: 'الصيانة الفنية', desc: 'مباني، معدات، أنظمة' },
    { label: 'السلامة المهنية', desc: 'أمن، إطفاء، طوارئ' },
    { label: 'الإشراف على المشاريع', desc: 'متابعة، تنفيذ، جودة' },
    { label: 'التحكم في الجودة', desc: 'فحوصات، معايير، اختبارات' },
    { label: 'التشغيل والصيانة', desc: 'مرافق، تشغيل، إدارة' },
    { label: 'الترميم والصيانة', desc: 'آثار، تراث، إعادة تأهيل' },
    { label: 'التفتيش الفني', desc: 'مباني، منشآت، سلامة' },
    { label: 'المواصفات والمقاييس', desc: 'كود، معايير، لوائح' }
  ],
  ADMIN: [
    { label: 'إدارة مشاريع', desc: 'تخطيط، تنفيذ، متابعة' },
    { label: 'إدارة مكاتب عقارية', desc: 'سكرتارية، تنظيم، أرشفة' },
    { label: 'إدارة عقود', desc: 'عقود بيع، إيجار، مقاولات' },
    { label: 'موارد بشرية', desc: 'توظيف، تدريب، تقييم' },
    { label: 'تسويق عقاري', desc: 'إعلانات، عروض، مبيعات' },
    { label: 'علاقات عامة', desc: 'تواصل، عملاء، شراكات' },
    { label: 'خدمات قانونية إدارية', desc: 'تراخيص، موافقات، إجراءات' },
    { label: 'إدارة مرافق', desc: 'صيانة، نظافة، خدمات' },
    { label: 'أرشفة إلكترونية', desc: 'وثائق، فهارس، حفظ' },
    { label: 'إدارة جودة', desc: 'معايير، تطوير، تحسين' }
  ],
  FINANCE: [
    { label: 'محاسبة عقارية', desc: 'قيود، ميزانيات، تقارير' },
    { label: 'ضرائب عقارية', desc: 'ضريبة أرباح، مبيعات، عقارية' },
    { label: 'تقييم مالي', desc: 'قيمة سوقية، استثمارية' },
    { label: 'تمويل عقاري', desc: 'قروض، رهون، تمويل' },
    { label: 'تدقيق مالي', desc: 'مراجعة، فحص، تقارير' },
    { label: 'ميزانيات عمومية', desc: 'أصول، خصوم، حقوق ملكية' },
    { label: 'تدفقات نقدية', desc: 'إيرادات، مصروفات، سيولة' },
    { label: 'استثمار عقاري', desc: 'عوائد، مخاطر، تنويع' },
    { label: 'إفلاس وتصفية', desc: 'تسوية، ديون، حقوق' },
    { label: 'زكاة وأوقاف', desc: 'أحكام، توزيع، حساب' }
  ],
  FUNDING: [
    { label: 'تمويل عقاري', desc: 'قروض سكنية، رهون، عقود' },
    { label: 'تأمين عقاري', desc: 'تأمين مباني، ضد الحريق، زلازل' },
    { label: 'بنوك عقارية', desc: 'حسابات، تمويل، شهادات' },
    { label: 'صناديق استثمار عقاري', desc: 'REITs، صناديق، عوائد' },
    { label: 'تأمين على الحياة', desc: 'سياسات، استثمار، ادخار' },
    { label: 'تحويلات مالية', desc: 'حوالات، عملات، صرف' },
    { label: 'تمويل إسلامي', desc: 'مرابحة، إجارة، مشاركة' },
    { label: 'تأمين صحي', desc: 'عقاري، موظفين، تغطية' },
    { label: 'إدارة ثروات', desc: 'محافظ، استثمار، أصول' },
    { label: 'خدمات مصرفية رقمية', desc: 'تطبيقات، دفع إلكتروني' }
  ]
};

/**
 * Detailed comprehensive list of 50+ Specialized Multi-Agent Systems (النظم الخبيرة)
 */
export const EXPERT_SYSTEM_AGENTS: AgentInfo[] = [
  // 1. الأراضي (4)
  { id: 'land_1', name: 'وكيل السجل العقاري (LandRegistry)', sector: 'أراضي', status: 'active', accuracy: 96, tasksProcessed: 284, description: 'التحقق التلقائي من تسجيل وسندات الملكية ومطابقتها للشهر العقاري' },
  { id: 'land_2', name: 'وكيل تقييم الأراضي (LandValuation)', sector: 'أراضي', status: 'active', accuracy: 91, tasksProcessed: 431, description: 'حساب القيمة السوقية العادلة للأراضي بناءً على النوع والموقع' },
  { id: 'land_3', name: 'وكيل التخطيط العمراني (LandUsePlanner)', sector: 'أراضي', status: 'idle', accuracy: 88, tasksProcessed: 112, description: 'تحليل اشتراطات البناء ونسب التغطية المسموحة والارتفاعات' },
  { id: 'land_4', name: 'وكيل النزاعات العقارية (LandDispute)', sector: 'أراضي', status: 'busy', accuracy: 94, tasksProcessed: 195, description: 'تحليل التداخل في الحدود ونزاعات وضع اليد وملكيات الأطراف' },

  // 2. الإنشاءات والبناء (5)
  { id: 'cons_1', name: 'وكيل التصميم الإنشائي (StructuralDesign)', sector: 'إنشاءات', status: 'idle', accuracy: 95, tasksProcessed: 340, description: 'حساب كميات الخرسانة، الحديد، والأسمنت ومطابقة كود البناء' },
  { id: 'cons_2', name: 'وكيل التصميم المعماري (ArchitecturalDesign)', sector: 'إنشاءات', status: 'idle', accuracy: 92, tasksProcessed: 210, description: 'تحليل التقسيم الداخلي للمنشآت والمناور والتهوية والتوجيه' },
  { id: 'cons_3', name: 'وكيل إدارة المشاريع (ProjectManager)', sector: 'إنشاءات', status: 'active', accuracy: 89, tasksProcessed: 185, description: 'حساب الجداول الزمنية لتنفيذ الأعمال الإنشائية ونسب الانحراف' },
  { id: 'cons_4', name: 'وكيل الإشراف الهندسي (Supervision)', sector: 'إنشاءات', status: 'idle', accuracy: 93, tasksProcessed: 260, description: 'مراقبة جودة البناء ومطابقة رخص الهدم أو البناء الصادرة' },
  { id: 'cons_5', name: 'وكيل صيانة المباني (Maintenance)', sector: 'إنشاءات', status: 'active', accuracy: 87, tasksProcessed: 144, description: 'حساب نسب استهلاك العمر الافتراضي وتقدير تكاليف الترميم' },

  // 3. المواريث (3)
  { id: 'inh_1', name: 'وكيل المواريث الشرعي (Inheritance)', sector: 'ميراث', status: 'active', accuracy: 99, tasksProcessed: 512, description: 'حساب الأنصبة الشرعية للورثة بدقة متناهية وفقاً للفقه الإسلامي والقانون المصري' },
  { id: 'inh_2', name: 'وكيل حصر الورثة (HeirIdentification)', sector: 'ميراث', status: 'idle', accuracy: 97, tasksProcessed: 320, description: 'مطابقة شجرة العائلة والتحقق من صلة القرابة والوفاة وحجب المواريث' },
  { id: 'inh_3', name: 'وكيل تقسيم التركات (EstateDistribution)', sector: 'ميراث', status: 'busy', accuracy: 94, tasksProcessed: 275, description: 'فرز وتقسيم الأملاك العينية المشتركة كالمنشآت على الشيوع' },

  // 4. الأوقاف (4)
  { id: 'waqf_1', name: 'وكيل تسجيل الأوقاف (WaqfRegistration)', sector: 'أوقاف', status: 'idle', accuracy: 95, tasksProcessed: 103, description: 'فحص الحجج الأثرية وسندات الوقف وتصنيفها كأهلي أو خيري' },
  { id: 'waqf_2', name: 'وكيل إدارة الأوقاف (WaqfManagement)', sector: 'أوقاف', status: 'idle', accuracy: 91, tasksProcessed: 90, description: 'متابعة ريع الوقف وعقود تأجير الأراضي التابعة لوزارة الأوقاف' },
  { id: 'waqf_3', name: 'وكيل الامتثال الشرعي (WaqfCompliance)', sector: 'أوقاف', status: 'active', accuracy: 98, tasksProcessed: 124, description: 'التحقق من إنفاق ريع الوقف في مصارفه الشرعية المحددة في الحجة' },
  { id: 'waqf_4', name: 'وكيل نزاعات أراضي الوقف (WaqfDispute)', sector: 'أوقاف', status: 'busy', accuracy: 93, tasksProcessed: 135, description: 'فض تداخل ملكية أراضي الدولة والأوقاف مع الأفراد والورثة' },

  // 5. القانون والتشريع (4)
  { id: 'leg_1', name: 'وكيل الأبحاث القانونية (LegalResearch)', sector: 'قانون', status: 'idle', accuracy: 96, tasksProcessed: 402, description: 'البحث في القوانين العقارية المصرية كقانون البناء 119 والشهر العقاري' },
  { id: 'leg_2', name: 'وكيل تحليل العقود (ContractAnalyzer)', sector: 'قانون', status: 'active', accuracy: 94, tasksProcessed: 310, description: 'فحص عقود البيع، الإيجار، والمقاولات واستخلاص بنود المسؤولية والمخاطر' },
  { id: 'leg_3', name: 'وكيل صياغة العقود (LegalDrafter)', sector: 'قانون', status: 'idle', accuracy: 97, tasksProcessed: 180, description: 'إنشاء مسودات قانونية محكمة لعقود التمليك والتقسيم الرضائي' },
  { id: 'leg_4', name: 'وكيل الاستشارات (LegalConsultant)', sector: 'قانون', status: 'idle', accuracy: 92, tasksProcessed: 220, description: 'تقديم آراء استشارية استباقية للقاضي في مدى قانونية التصرفات' },

  // 6. القضاء والعدالة (6)
  { id: 'jud_1', name: 'وكيل إدارة الجلسات (CaseManagement)', sector: 'قضاء', status: 'active', accuracy: 98, tasksProcessed: 680, description: 'تنظيم مواعيد الخبراء والاطلاع وإيداع تقارير الخبرة للمحكمة' },
  { id: 'jud_2', name: 'وكيل استخلاص الأحكام (Judgment)', sector: 'قضاء', status: 'busy', accuracy: 95, tasksProcessed: 195, description: 'مساعدة القاضي في التوصية بالحكم النهائي استناداً لتقرير الخبير الفني' },
  { id: 'jud_3', name: 'وكيل متابعة التنفيذ (Execution)', sector: 'قضاء', status: 'idle', accuracy: 93, tasksProcessed: 150, description: 'مراقبة تنفيذ قرارات الهدم، تسليم الحدود، أو البيع بالمزاد العلني' },
  { id: 'jud_4', name: 'وكيل محاضر الشرطة (PoliceReport)', sector: 'قضاء', status: 'idle', accuracy: 90, tasksProcessed: 310, description: 'سحب ومراجعة محاضر المعاينة وجرائم انتهاك حرمة ملك غير أو النزاع' },
  { id: 'jud_5', name: 'وكيل النيابة العامة (Prosecution)', sector: 'قضاء', status: 'idle', accuracy: 94, tasksProcessed: 240, description: 'التنسيق في النزاعات الجنائية المترتبة على الملكية (تزوير عقود، اعتداء)' },
  { id: 'jud_6', name: 'وكيل الأوامر القضائية (Warrant)', sector: 'قضاء', status: 'idle', accuracy: 97, tasksProcessed: 115, description: 'توليد مسودات أوامر تمكين الخبراء من المعاينة بالقوة الجبرية' },

  // 7. الهندسة والتخطيط (5)
  { id: 'eng_1', name: 'وكيل تصميم الطرق (RoadDesign)', sector: 'هندسة', status: 'idle', accuracy: 91, tasksProcessed: 94, description: 'تخطيط الطرق المحيطة وحساب عروض الشوارع ومناسيب السطح' },
  { id: 'eng_2', name: 'وكيل التنمية المستدامة (EnvironmentalImpact)', sector: 'هندسة', status: 'idle', accuracy: 89, tasksProcessed: 78, description: 'دراسة الأثر البيئي للمنشآت والمناطق الملوثة المحيطة بالملكيات' },
  { id: 'eng_3', name: 'وكيل الطاقة المتجددة (RenewableEnergy)', sector: 'هندسة', status: 'idle', accuracy: 92, tasksProcessed: 64, description: 'تقييم صلاحية الأسطح لتركيب الألواح الشمسية وموفرات الطاقة' },
  { id: 'eng_4', name: 'وكيل تحسين الصناعة (IndustrialOptimization)', sector: 'هندسة', status: 'idle', accuracy: 88, tasksProcessed: 52, description: 'تصميم وبحث ملائمة المنشآت الصناعية لاشتراطات سلامة الآلات والبيئة' },
  { id: 'eng_5', name: 'وكيل التخطيط الإقليمي (UrbanPlanning)', sector: 'هندسة', status: 'idle', accuracy: 93, tasksProcessed: 130, description: 'تحديد الكتل السكنية ونوعية الامتداد الأفقي والعمودي للمدن الجديدة' },

  // 8. الخرائط والـ GIS (3)
  { id: 'map_1', name: 'وكيل التحليل المكاني (GISAnalyzer)', sector: 'خرائط', status: 'active', accuracy: 97, tasksProcessed: 490, description: 'تحليل صور الأقمار الصناعية ومطابقة حدود الرفع المساحي مع خرائط الدولة الرقمية' },
  { id: 'map_2', name: 'وكيل رسم الخرائط (MapRenderer)', sector: 'خرائط', status: 'idle', accuracy: 94, tasksProcessed: 320, description: 'توليد الرسومات الهندسية ثنائية الأبعاد للقطع وتحديد المظلات والحدود' },
  { id: 'map_3', name: 'وكيل الرفع الطبوغرافي (Surveying)', sector: 'خرائط', status: 'active', accuracy: 95, tasksProcessed: 410, description: 'سحب ومعالجة بيانات أجهزة التوتال ستيشن والرفع المساحي للمباني' },

  // 9. البيانات والذكاء (3)
  { id: 'data_1', name: 'وكيل تجميع البيانات (DataCollector)', sector: 'خرائط', status: 'idle', accuracy: 96, tasksProcessed: 890, description: 'الزحف الآلي للأسعار والضرائب السارية من بوابات المحليات والشهر العقاري' },
  { id: 'data_2', name: 'وكيل تنظيف البيانات (DataCleaner)', sector: 'خرائط', status: 'idle', accuracy: 98, tasksProcessed: 720, description: 'كشف البيانات الشاذة وتطبيع مساحات الأراضي والمدخلات الرقمية للقضية' },
  { id: 'data_3', name: 'وكيل تحليل الارتباطات (DataAnalyzer)', sector: 'خرائط', status: 'active', accuracy: 93, tasksProcessed: 550, description: 'تحليل اتجاهات أسعار المتر المربع وتصنيفها ونمذجتها رياضياً' },

  // 10. التراخيص والامتثال (3)
  { id: 'comp_1', name: 'وكيل تراخيص البناء (BuildingPermit)', sector: 'عام', status: 'idle', accuracy: 96, tasksProcessed: 190, description: 'التحقق من صحة ترخيص البناء الصادر ومطابقته لعدد الأدوار القائم' },
  { id: 'comp_2', name: 'وكيل التراخيص التجارية (OperationLicense)', sector: 'عام', status: 'idle', accuracy: 91, tasksProcessed: 110, description: 'مراجعة شروط تشغيل المحلات والمنشآت التجارية والصناعية والتأمينات' },
  { id: 'comp_3', name: 'وكيل شهادات المطابقة (ComplianceCertificate)', sector: 'عام', status: 'idle', accuracy: 95, tasksProcessed: 145, description: 'التحقق من كود الإخلاء والحريق وتركيب طفايات الحريق وخزانات المياه' },

  // 11. الصيانة والتشغيل الفني (3)
  { id: 'tech_1', name: 'وكيل صيانة المرافق (TechnicalMaintenance)', sector: 'عام', status: 'idle', accuracy: 90, tasksProcessed: 180, description: 'فحص سلامة التمديدات الكهربائية والميكانيكية والصرف الصحي للمنشأ' },
  { id: 'tech_2', name: 'وكيل جرد الأصول الفني (AssetTracker)', sector: 'عام', status: 'idle', accuracy: 94, tasksProcessed: 220, description: 'جرد وتوثيق الأصول والمعدات الفنية ومحولات الطاقة الملحقة بالعقار' },
  { id: 'tech_3', name: 'وكيل تشخيص الأعطال (FaultDiagnosis)', sector: 'عام', status: 'idle', accuracy: 89, tasksProcessed: 130, description: 'استشعار الشروخ الخرسانية وتسربات المياه المؤثرة على البنية الإنشائية للمبنى' },

  // 12. الإدارة والموارد البشرية (3)
  { id: 'adm_1', name: 'وكيل إدارة الكوادر (StaffManager)', sector: 'عام', status: 'idle', accuracy: 92, tasksProcessed: 155, description: 'توزيع المهندسين والمساعدين وجداول نزولهم الميداني للمعاينة' },
  { id: 'adm_2', name: 'وكيل إدارة المساحات الإدارية (OfficeSpace)', sector: 'عام', status: 'idle', accuracy: 88, tasksProcessed: 92, description: 'تنظيم وأرشفة الأوراق بمقر مصلحة الخبراء وحساب كفاءة المساحة' },
  { id: 'adm_3', name: 'وكيل سلاسل الإمداد (SupplyManager)', sector: 'عام', status: 'idle', accuracy: 91, tasksProcessed: 115, description: 'توفير أجهزة الرفع المساحي والـ GPS المحمولة وصيانتها' },

  // 13. التمويل والمالية والزراعة (11)
  { id: 'fin_1', name: 'وكيل الميزانيات العقارية (Budget)', sector: 'عام', status: 'idle', accuracy: 94, tasksProcessed: 204, description: 'إعداد قوائم الإيرادات والمصروفات وصافي الأرباح السنوية للعقار' },
  { id: 'fin_2', name: 'وكيل التدفقات النقدية (CashFlow)', sector: 'عام', status: 'idle', accuracy: 95, tasksProcessed: 180, description: 'تحليل جداول تحصيل الإيجارات ومعدلات السيولة وتوقعات الأداء' },
  { id: 'fin_3', name: 'وكيل التقارير المالية (FinancialReport)', sector: 'عام', status: 'idle', accuracy: 93, tasksProcessed: 215, description: 'صياغة الفصل المالي في تقرير الخبرة وحساب الفوائد والرهن' },
  { id: 'fin_4', name: 'وكيل الضرائب العقارية (TaxCalculator)', sector: 'عام', status: 'idle', accuracy: 98, tasksProcessed: 450, description: 'تطبيق الإعفاءات وحساب الضريبة العقارية السنوية والضمانات' },
  { id: 'fin_5', name: 'وكيل التمويل العقاري (MortgageLoan)', sector: 'عام', status: 'idle', accuracy: 91, tasksProcessed: 160, description: 'دراسة جدوى القروض العقارية ومعدلات الفائدة الفعيلة وقسط السداد' },
  
  // قطاع الزراعة (6)
  { id: 'agr_1', name: 'وكيل توصية المحاصيل (CropRecommendation)', sector: 'زراعة', status: 'idle', accuracy: 94, tasksProcessed: 185, description: 'تحليل خواص التربة والتوصية بأفضل المحاصيل لزيادة العائد المالي للمزارع' },
  { id: 'agr_2', name: 'وكيل ري الأراضي (IrrigationOptimizer)', sector: 'زراعة', status: 'idle', accuracy: 92, tasksProcessed: 140, description: 'تصميم شبكات الري بالتنقيط وحساب التوفير في استهلاك المياه الجوفية' },
  { id: 'agr_3', name: 'وكيل سلامة الأغذية (FoodSafety)', sector: 'زراعة', status: 'idle', accuracy: 95, tasksProcessed: 98, description: 'التحقق من خلو المحاصيل من متبقيات المبيدات ومطابقة المعايير الصحية' },
  { id: 'agr_4', name: 'وكيل التنبؤ بالمحصول (YieldPrediction)', sector: 'زراعة', status: 'idle', accuracy: 89, tasksProcessed: 155, description: 'تقدير إنتاج الفدان السنوي بالطن وحساب الأرباح المتوقعة حسب أسعار السوق' },
  { id: 'agr_5', name: 'وكيل سلاسل الإمداد الزراعية (AgriFinance)', sector: 'زراعة', status: 'idle', accuracy: 93, tasksProcessed: 120, description: 'حساب القيمة الحالية الصافية لاستثمارات تحديث الزراعة والمعدات' },
  { id: 'agr_6', name: 'وكيل مكافحة الآفات (PestDetection)', sector: 'زراعة', status: 'idle', accuracy: 90, tasksProcessed: 110, description: 'التحليل الطيفي لصور المحاصيل وكشف الأوبئة الحشرية قبل تفشيها' },

  // 14. التعليم والاقتصاد والـ GPS (7)
  { id: 'edu_1', name: 'وكيل تتبع تقدم التعليم (ProgressTracker)', sector: 'تعليم', status: 'idle', accuracy: 93, tasksProcessed: 175, description: 'تتبع تقدم المهندسين حديثي التعيين بمصلحة الخبراء في الدورات التدريبية' },
  { id: 'edu_2', name: 'وكيل ترقية الكفاءات (PromotionRecommender)', sector: 'تعليم', status: 'idle', accuracy: 96, tasksProcessed: 130, description: 'تحليل ساعات العمل والخبرات ونقاط الإنجاز للتوصية بالترقيات والدرجات القضائية' },
  { id: 'edu_3', name: 'وكيل كفاءة التدريب (TrainerAnalytics)', sector: 'تعليم', status: 'idle', accuracy: 91, tasksProcessed: 95, description: 'تحليل معدلات نجاح دورات الرفع المساحي الحديث وكفاءة المدربين' },
  { id: 'eco_1', name: 'وكيل محاكاة الاقتصاد (EconomicSimulation)', sector: 'اقتصاد', status: 'idle', accuracy: 94, tasksProcessed: 280, description: 'محاكاة تأثير قرارات رفع الدعم أو تضخم العملة على القيمة الشرائية للعقارات' },
  { id: 'eco_2', name: 'وكيل محفظة النقاط (PointsWallet)', sector: 'اقتصاد', status: 'idle', accuracy: 99, tasksProcessed: 610, description: 'إدارة أتعاب الخبراء، والرسوم المستحقة، والغرامات المفروضة بنظام النقاط والعملة الموحد' },
  { id: 'gps_1', name: 'وكيل تحديد المواقع GPS الجغرافي', sector: 'GPS', status: 'active', accuracy: 99, tasksProcessed: 950, description: 'تحديد الإحداثيات الجغرافية بدقة مليمترية وسحب خرائط الأقمار الصناعية لقطعة الأرض' }
];

/**
 * Prime real estate locations in Cairo and Giza for GPS selection
 */
export const SAMPLE_LOCATIONS = [
  { name: 'منطقة الأهرامات - شارع الملك فيصل، الهرم، الجيزة', lat: 29.9868, lng: 31.1302, desc: 'منطقة سكنية تجارية حيوية بالقرب من أهرامات الجيزة' },
  { name: 'الدقي - شارع التحرير، الجيزة', lat: 30.0384, lng: 31.2119, desc: 'منطقة إدارية وتجارية راقية وعالية القيمة الاستثمارية' },
  { name: 'الزمالك - شارع أبو الفدا، القاهرة', lat: 30.0631, lng: 31.2201, desc: 'منطقة أثرية وتراثية فخمة تطل على نهر النيل مباشرة' },
  { name: 'التجمع الخامس - شارع التسعين، القاهرة الجديدة', lat: 30.0263, lng: 31.4913, desc: 'منطقة عمرانية حديثة تحتوي على عقارات وتجمعات تجارية فاخرة' },
  { name: 'منطقة الهرم - شارع الهرم الرئيسي، الجيزة', lat: 29.9912, lng: 31.1425, desc: 'شارع رئيسي عريض يحتوي على معالم وأنشطة سكنية وتجارية' }
];

/**
 * Pre-configured cases to demonstrate the extreme capabilities of the system
 */
export const SAMPLE_CASES: CaseData[] = [
  {
    caseNumber: 'CASE-2026-101',
    title: 'نزاع بيت العمرانية ودعوى طرد محمد الجندي وماجدة الجيار',
    court: 'محكمة العجوزة الابتدائية - الدائرة الثالثة إيجارات',
    judge: 'المستشار الدكتور عبد الرحمن الشريف',
    expertName: 'كابتن حسام',
    date: '2026-06-30',
    status: 'قيد النظر',
    landArea: 180,
    landType: 'بناء',
    location: 'العقار رقم 27 شارع شبين الكوم، العمرانية الغربية، الجيزة',
    hasBuilding: true,
    buildingArea: 180,
    floors: 5,
    finishType: 'سوبر لوكس',
    buildingType: 'سكني',
    buildingAge: 15,
    annualRent: 24000,
    transactionValue: 5000000,
    estateValue: 5000000,
    heirs: [],
    dispute: {
      hasDispute: true,
      type: 'contract',
      details: 'دعوى طرد وإخلاء للمستأجر محمد الجندي وكذا إخلاء السيدة ماجدة الجيار زوجة المرحوم الحاج محمد شلبي لانتهاء صفة المنفعة للعين السكنية بالعقار رقم 27 شارع شبين الكوم بالعمرانية الغربية، مع تبرئتهما من سداد نصيب شقتهما في تكاليف إزالة السطح البالغة 150,000 ج.م، وتعديل الأجرة شهرياً إلى 2,000 ج.م من أول يناير 2027.'
    },
    latitude: 30.0125,
    longitude: 31.2054,
    sessions: [
      { id: 'sess_1', date: '2026-07-08', time: '10:00', type: 'معاينة ميدانية وإعادة تقدير تكاليف السطح', notes: 'حضور الخبير كابتن حسام والمهندس المعاون لمعاينة السطح الخرساني المزال وإثبات الأضرار بحضور المدعى عليه الأول.' },
      { id: 'sess_2', date: '2026-07-22', time: '11:30', type: 'جلسة تقديم المستندات ومذكرة المرافعة', notes: 'تجهيز وإيداع التقرير الفني المتكامل النهائي ومطالبة الأطراف بتقديم الإيصالات وسندات سداد الأجرة القانونية.' }
    ]
  },
  {
    caseNumber: 'CASE-2026-001',
    title: 'نزاع ورثة قطعة أرض الهرم وفيصل',
    court: 'محكمة الجيزة الابتدائية - الدائرة السادسة عقاري',
    judge: 'المستشار الدكتور أحمد محمد علي',
    expertName: 'كابتن حسام',
    date: '2026-06-30',
    status: 'قيد النظر',
    landArea: 500,
    landType: 'بناء',
    location: 'منطقة الأهرامات - شارع الملك فيصل، الهرم، الجيزة',
    hasBuilding: true,
    buildingArea: 350,
    floors: 4,
    finishType: 'سوبر لوكس',
    buildingType: 'سكني',
    buildingAge: 5,
    annualRent: 2150000,
    transactionValue: 18700000,
    estateValue: 18700000,
    heirs: [
      { id: 'h1', name: 'أحمد محمد عبدالله', gender: 'male', relationship: 'son' },
      { id: 'h2', name: 'خالد محمد عبدالله', gender: 'male', relationship: 'son' },
      { id: 'h3', name: 'فاطمة محمد عبدالله', gender: 'female', relationship: 'daughter' },
      { id: 'h4', name: 'خديجة محمد عبدالله', gender: 'female', relationship: 'daughter' },
      { id: 'h5', name: 'السيدة سارة أحمد علي', gender: 'female', relationship: 'wife' }
    ],
    dispute: {
      hasDispute: true,
      type: 'inheritance',
      details: 'نزاع بين الورثة على تقسيم الأرض السكنية والفيلا القائمة عليها، حيث تطلب الزوجة ربع التركة لعدم وجود أولاد وتطلب البنات الفرز بالتساوي مع الذكور مما يخالف الشريعة الإسلامية.'
    },
    latitude: 29.9868,
    longitude: 31.1302,
    sessions: [
      { id: 'sess_3', date: '2026-07-15', time: '09:00', type: 'جلسة فرز وتجنيب الأنصبة الشرعية', notes: 'مثول الورثة أمام الدائرة وعرض المخطط الهندسي المقترح للتقسيم العيني وإثبات رغبة الزوجة السيدة سارة في التعويض المالي وتجنيب نصيبها عيناً.' }
    ]
  },
  {
    caseNumber: 'CASE-2026-002',
    title: 'تحديد حدود أرض زراعية بالبدرشين',
    court: 'محكمة البدرشين الجزئية',
    judge: 'المستشار محمود توفيق',
    expertName: 'كابتن حسام',
    date: '2026-06-25',
    status: 'جديدة',
    landArea: 12600, // 3 Faddans
    landType: 'زراعية',
    location: 'البدرشين، الجيزة - حوض الجنينة',
    hasBuilding: false,
    buildingArea: 0,
    floors: 0,
    finishType: 'نصف تشطيب',
    buildingType: 'سكني',
    buildingAge: 0,
    annualRent: 120000,
    transactionValue: 1500000,
    estateValue: 1500000,
    heirs: [],
    dispute: {
      hasDispute: true,
      type: 'boundary',
      details: 'نزاع على حدود الجدار الشمالي لقطعة الأرض البالغ مساحتها 3 أفدنة مع قطعة الجار رقم 1235، وهناك تداخل مساحي قدره 120 متراً مربعاً.'
    },
    latitude: 29.8512,
    longitude: 31.2678
  },
  {
    caseNumber: 'CASE-2026-003',
    title: 'تقييم وصلاحية منشأ إداري بالدقي',
    court: 'محكمة شمال الجيزة الابتدائية',
    judge: 'المستشار شريف الأنصاري',
    expertName: 'كابتن حسام',
    date: '2026-06-15',
    status: 'منجزة',
    landArea: 600,
    landType: 'تجارية',
    location: 'الدقي - شارع التحرير، الجيزة',
    hasBuilding: true,
    buildingArea: 500,
    floors: 8,
    finishType: 'الترا سوبر لوكس',
    buildingType: 'إداري',
    buildingAge: 12,
    annualRent: 4800000,
    transactionValue: 65000000,
    estateValue: 65000000,
    heirs: [],
    dispute: {
      hasDispute: false,
      type: 'none',
      details: 'تقييم مالي متكامل وشهادة سلامة إنشائية لتقدير القيمة السوقية الحالية وتجديد عقد التأجير السنوي لصالح بنك التنمية العقاري.'
    },
    latitude: 30.0384,
    longitude: 31.2119
  },
  {
    caseNumber: 'CASE-2026-004',
    title: 'دعوى طرد وإخلاء لمحمد الجندي (نوال والعجوزة)',
    court: 'محكمة العجوزة الابتدائية - الدائرة الثالثة إيجارات',
    judge: 'المستشار الدكتور عبد الرحمن الشريف',
    expertName: 'كابتن حسام',
    date: '2026-06-30',
    status: 'قيد النظر',
    landArea: 180,
    landType: 'تجارية',
    location: 'العجوزة - شارع نوال الرئيسي، الجيزة',
    hasBuilding: true,
    buildingArea: 180,
    floors: 1,
    finishType: 'سوبر لوكس',
    buildingType: 'تجاري',
    buildingAge: 8,
    annualRent: 360000,
    transactionValue: 4500000,
    estateValue: 4500000,
    heirs: [],
    dispute: {
      hasDispute: true,
      type: 'contract',
      details: 'دعوى طرد وإخلاء للمستأجر محمد الجندي من العين المؤجرة (محل تجاري) لعدم سداد الأجرة القانونية المتأخرة لمدة 6 أشهر متتالية بقيمة 180,000 جنيه، وتخريب معالم المنشأ.'
    },
    latitude: 30.0468,
    longitude: 31.2102
  }
];

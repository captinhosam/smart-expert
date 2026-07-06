import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Ruler, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Info, 
  FileText, 
  ShieldAlert, 
  Home, 
  TrendingUp, 
  Coins, 
  Activity, 
  Gavel, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  UserCheck,
  BookOpen,
  HelpCircle,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { CaseData } from '../types';
import { triggerToast } from '../lib/toast';

interface AreaRecord {
  id: string;
  name: string;
  area: number;
  isVerified: boolean; // true = (حقيقي), false = تقريبي
  source: string;
}

interface ApartmentRecord {
  id: string;
  unitNumber: string; // e.g., "شقة 1 الطابق الأول"
  area: number;
  isVerified: boolean; // (حقيقي) vs تقريبي
  occupancyType: 'old_rent' | 'new_law' | 'ownership' | 'inheritance';
  occupantName: string;
  monthlyRent: number;
  violationStatus: 'none' | 'unpaid_rent' | 'unauthorized_change' | 'structural_damage';
  notes: string;
}

interface AreaRegistryProps {
  caseData: CaseData;
  theme: 'dark' | 'paper';
  onMaximize?: (panelId: 'area_registry') => void;
  isMaximized?: boolean;
}

export default function AreaRegistry({ caseData, theme, onMaximize, isMaximized = false }: AreaRegistryProps) {
  // ----------------------------------------------------
  // Part 1: Area Records State (Original functionality)
  // ----------------------------------------------------
  const [records, setRecords] = useState<AreaRecord[]>([]);
  const [newName, setNewName] = useState('');
  const [newArea, setNewArea] = useState<number | ''>('');
  const [newIsVerified, setNewIsVerified] = useState(true);
  const [newSource, setNewSource] = useState('مستندات رسمية وخريطة المساحة');

  // Load records from localStorage, scoped by caseNumber
  useEffect(() => {
    const key = `area_records_case_${caseData.caseNumber}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords(getDefaultRecords());
      }
    } else {
      const defaults = getDefaultRecords();
      setRecords(defaults);
      localStorage.setItem(key, JSON.stringify(defaults));
    }
  }, [caseData.caseNumber, caseData.landArea, caseData.buildingArea]);

  const getDefaultRecords = (): AreaRecord[] => {
    return [
      {
        id: 'rec_1',
        name: 'مساحة الأرض الكلية',
        area: caseData.landArea || 450,
        isVerified: true,
        source: 'مستندات الشهر العقاري الرسمية والخرائط الإحداثية المساحية وع الطبيعة'
      },
      {
        id: 'rec_2',
        name: 'مسطح البناء القائم (الطابق الأرضي)',
        area: caseData.buildingArea || 220,
        isVerified: true,
        source: 'المعاينة الميدانية ومطابقة الكروكي الهندسي للخرسانة المسلحة'
      },
      {
        id: 'rec_3',
        name: 'حرم الطريق والردود الجانبية',
        area: 45,
        isVerified: false,
        source: 'تخميني - لم يتم رفعه بجهات الـ Total Station بعد'
      },
      {
        id: 'rec_4',
        name: 'المساحة الصافية للشقق السكنية (مكرر)',
        area: 185,
        isVerified: false,
        source: 'أقوال الخصوم الشفهية وقيد التدقيق الهندسي'
      }
    ];
  };

  const saveRecords = (newRecs: AreaRecord[]) => {
    setRecords(newRecs);
    const key = `area_records_case_${caseData.caseNumber}`;
    localStorage.setItem(key, JSON.stringify(newRecs));
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newArea) {
      triggerToast('الرجاء إدخال اسم العنصر والمساحة بصورة صحيحة', 'warning');
      return;
    }

    const newRecord: AreaRecord = {
      id: `rec_${Date.now()}`,
      name: nameFixer(newName.trim()),
      area: Number(newArea),
      isVerified: newIsVerified,
      source: newIsVerified ? newSource : 'تقدير أولي لم يتم تأكيده من الأوراق والخرائط بعد'
    };

    const updated = [...records, newRecord];
    saveRecords(updated);
    
    // Reset form
    setNewName('');
    setNewArea('');
    setNewIsVerified(true);
    setNewSource('مستندات رسمية وخريطة المساحة');
    triggerToast('تمت إضافة سجل المساحة الجديد بنجاح', 'success');
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
    triggerToast('تم حذف سجل المساحة المحدد', 'info');
  };

  const toggleVerification = (id: string) => {
    const updated = records.map(r => {
      if (r.id === id) {
        const nextVerified = !r.isVerified;
        return {
          ...r,
          isVerified: nextVerified,
          source: nextVerified 
            ? 'مستندات الشهر العقاري المعتمدة والمعاينة على الطبيعة' 
            : 'تخميني وتقريبي بناء على شهادات الخصوم دون مراجعة خرائط'
        };
      }
      return r;
    });
    saveRecords(updated);
    triggerToast('تم تحديث موثوقية السجل المساحي', 'success');
  };

  const nameFixer = (name: string) => {
    return name.replace(/\(حقيقي\)/g, '').replace(/تقريبي/g, '').trim();
  };

  // ----------------------------------------------------
  // Part 2: Apartment List State & Transition Engine
  // ----------------------------------------------------
  const [apartments, setApartments] = useState<ApartmentRecord[]>([]);
  const [selectedLawTab, setSelectedLawTab] = useState<'old_rent' | 'ownership' | 'new_law' | 'inheritance'>('old_rent');
  const [activeNeonGlow, setActiveNeonGlow] = useState<'old_rent' | 'ownership' | 'new_law' | 'inheritance'>('old_rent');

  // Input fields for adding apartment
  const [aptUnit, setAptUnit] = useState('');
  const [aptArea, setAptArea] = useState<number | ''>('');
  const [aptVerified, setAptVerified] = useState(true);
  const [aptOccupancy, setAptOccupancy] = useState<'old_rent' | 'new_law' | 'ownership' | 'inheritance'>('old_rent');
  const [aptOccupant, setAptOccupant] = useState('');
  const [aptRent, setAptRent] = useState<number | ''>('');
  const [aptNotes, setAptNotes] = useState('');

  // Loaded apartments based on caseNumber
  useEffect(() => {
    const key = `apt_records_case_${caseData.caseNumber}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setApartments(JSON.parse(saved));
      } catch (e) {
        setApartments(getDefaultApartments());
      }
    } else {
      const defaults = getDefaultApartments();
      setApartments(defaults);
      localStorage.setItem(key, JSON.stringify(defaults));
    }
  }, [caseData.caseNumber]);

  const getDefaultApartments = (): ApartmentRecord[] => {
    return [
      {
        id: 'apt_1',
        unitNumber: 'شقة الطابق الأول (شرق)',
        area: 120,
        isVerified: true,
        occupancyType: 'old_rent',
        occupantName: 'حسين محمود الشرقاوي',
        monthlyRent: 15, // Low Old Rent value in EGP
        violationStatus: 'none',
        notes: 'مستأجر منذ عام ١٩٧٤، عقد غير محدد المدة وممتد للورثة.'
      },
      {
        id: 'apt_2',
        unitNumber: 'شقة الطابق الأول (غرب)',
        area: 125,
        isVerified: true,
        occupancyType: 'ownership',
        occupantName: 'الحاج رأفت عبد الخالق (المالك)',
        monthlyRent: 0,
        violationStatus: 'none',
        notes: 'حيازة مستقرة ملك للورثة بموجب إعلام شرعي.'
      },
      {
        id: 'apt_3',
        unitNumber: 'شقة الطابق الثاني (شرق)',
        area: 118,
        isVerified: false,
        occupancyType: 'new_law',
        occupantName: 'كريم أحمد صبحي',
        monthlyRent: 3500, // Modern rent
        violationStatus: 'none',
        notes: 'عقد إيجار محدد بـ ٣ سنوات، ينتهي في عام ٢٠٢٧.'
      },
      {
        id: 'apt_4',
        unitNumber: 'شقة الطابق الثاني (غرب)',
        area: 122,
        isVerified: false,
        occupancyType: 'old_rent',
        occupantName: 'سامي عبد الحميد غانم',
        monthlyRent: 20,
        violationStatus: 'unpaid_rent',
        notes: 'ممتنع عن سداد الأجرة والزيادات القانونية لمدة ٤ أشهر متتالية.'
      }
    ];
  };

  const saveApartments = (newApts: ApartmentRecord[]) => {
    setApartments(newApts);
    const key = `apt_records_case_${caseData.caseNumber}`;
    localStorage.setItem(key, JSON.stringify(newApts));
  };

  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptUnit.trim() || !aptArea) {
      triggerToast('يرجى ملء تفاصيل الشقة والمساحة', 'warning');
      return;
    }

    const newApt: ApartmentRecord = {
      id: `apt_${Date.now()}`,
      unitNumber: aptUnit.trim(),
      area: Number(aptArea),
      isVerified: aptVerified,
      occupancyType: aptOccupancy,
      occupantName: aptOccupant.trim() || 'شاغل مجهول الهوية / شاغر',
      monthlyRent: Number(aptRent) || 0,
      violationStatus: 'none',
      notes: aptNotes.trim() || 'لا توجد ملاحظات قانونية مضافة.'
    };

    const updated = [...apartments, newApt];
    saveApartments(updated);

    // Reset fields
    setAptUnit('');
    setAptArea('');
    setAptVerified(true);
    setAptOccupancy('old_rent');
    setAptOccupant('');
    setAptRent('');
    setAptNotes('');
    triggerToast('تم تسجيل وحدة الشقة في قاعدة البيانات بنجاح', 'success');
  };

  const handleDeleteApartment = (id: string) => {
    const updated = apartments.filter(a => a.id !== id);
    saveApartments(updated);
    triggerToast('تم حذف الوحدة العقارية المحددة', 'info');
  };

  // Modernize an Old Rent apartment (تفعيل القانون الجديد / إنهاء العقد القديم)
  const handleTransitionToNewLaw = (id: string) => {
    const updated = apartments.map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          occupancyType: 'new_law' as const,
          monthlyRent: apt.monthlyRent < 200 ? 3000 : apt.monthlyRent, // adjust to standard rent
          notes: `تم إنهاء صيغة الإيجار القديم وتفعيل العقد محدد المدة طبقاً للمستجدات القانونية: القانون الجديد رقم ١٠ لسنة ٢٠٢٢.`
        };
      }
      return apt;
    });
    saveApartments(updated);
    triggerToast('⚡ رائع! تم فض العلاقة الإيجارية القديمة والانتقال لأحكام القانون الجديد للوحدة المحددة.', 'success');
  };

  const handleViolationChange = (id: string, status: ApartmentRecord['violationStatus']) => {
    const updated = apartments.map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          violationStatus: status
        };
      }
      return apt;
    });
    saveApartments(updated);
    triggerToast('تم تحديث سجل المخالفات وتطبيق التدابير الرادعة للوحدة', 'info');
  };

  // ----------------------------------------------------
  // Part 3: Violations Decisions & Enforcement Maker
  // ----------------------------------------------------
  const [selectedViolationType, setSelectedViolationType] = useState<'unpaid_rent' | 'unauthorized_change' | 'structural_damage'>('unpaid_rent');

  const getImmediateDecision = () => {
    switch(selectedViolationType) {
      case 'unpaid_rent':
        return {
          title: 'قرار فسخ فوري للتخلف عن سداد الأجرة والزيادات السنوية',
          lawReference: 'طبقاً لأحكام المادة ١٨ فقرة (ب) من القانون رقم ١٣٦ لسنة ١٩٨١ والتعديلات اللاحقة بالقانون ١٠ لسنة ٢٠٢٢.',
          actions: [
            'توجيه إنذار رسمي على يد محضر خلال ١٥ يوماً من تاريخ استحقاق الأجرة الموثقة.',
            'رفع دعوى مستعجلة بالطرد للغصب والامتناع عن السداد أمام قضاء الأمور المستعجلة.',
            'تجميد الحيازة وعدم الاعتداد بأي ميزات خدمية لحين سداد كامل المتأخرات بفائدة تأخيرية قانونية ٤٪.'
          ],
          severity: 'حرجة وعاجلة'
        };
      case 'unauthorized_change':
        return {
          title: 'قرار استرداد العين لتغيير النشاط دون إذن كتابي من المالك',
          lawReference: 'بموجب المادة ١٨ من القانون ١٣٦ لسنة ١٩٨١ والمادة ٥٨٠ من القانون المدني.',
          actions: [
            'الندب الفوري لخبير وزارة العدل لمعاينة إثبات الحالة وتغيير الهيكل التشغيلي للعين.',
            'إصدار قرار فوري بغلق المحل أو العين المخالفة بالطريق الإداري وقوة قسم الشرطة المختص.',
            'فسخ العقد تلقائياً بقوة القانون مع إلزام الشاغل بالتعويض المادي لجبر الأضرار الاستثمارية.'
          ],
          severity: 'فورية وغير قابلة للطعن'
        };
      case 'structural_damage':
        return {
          title: 'أمر إخلاء كلي للمحافظة على سلامة المبنى الإنشائية والأرواح',
          lawReference: 'بناء على المادة ٤٩ من القانون رقم ١١٩ لسنة ٢٠٠٨ (قانون البناء الموحد).',
          actions: [
            'إصدار قرار إخلاء فوري مؤقت دون حاجة لحكم قضائي بقوة الضبطية القضائية لحي العمرانية.',
            'تحميل المتسبب كافة تكاليف الصيانة والتدعيم الخرساني للهيكل الحامل.',
            'تحرير محضر جنائي بتعريض حياة القاطنين للخطر والترميم المباشر تحت إشراف هندسي معتمد.'
          ],
          severity: 'قصوى - تدخل أمني فوري'
        };
    }
  };

  const currentDecision = getImmediateDecision();

  // ----------------------------------------------------
  // Comparative Law data helper
  // ----------------------------------------------------
  const lawComparativeData = {
    old_rent: {
      title: 'الإيجار القديم (عقد غير محدد المدة)',
      description: 'نظام إيجاري تاريخي يستند للقوانين الاستثنائية المتعاقبة (٤٩ لسنة ١٩٧٧ و١٣٦ لسنة ١٩٨١)، يضمن بقاء المستأجر طوال حياته وامتداد العقد لجيل واحد من ورثته بشرط الإقامة.',
      pros: 'أمان اجتماعي مطلق للمستأجر التاريخي للعين.',
      cons: 'تجميد العائد الاستثماري للملاك بقيم زهيدة جداً، وصعوبة استرداد العين وصيانة العقارات المتآكلة.',
      transitionPath: 'إنهاء تدريجي عبر القانون الجديد رقم ١٠ لسنة ٢٠٢٢ للأشخاص الاعتبارية، أو الإخلاء في حالات الإغلاق أو تغيير النشاط أو الوفاة دون وارث مستحق.',
      glowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.7)] border-red-500'
    },
    ownership: {
      title: 'التمليك وحيازة الملكية الخالصة',
      description: 'أقوى سند عيني يعطى لصاحب الرقبة بموجب عقود تمليك مسجلة أو إعلام شرعي معترف به، يتيح التصرف والمنفعة والاستغلال الكامل دون وصاية أو تدخل خارجي.',
      pros: 'ثبات القيمة السوقية للعقار، وإمكانية الرهن والتمويل والاستغلال الحر.',
      cons: 'تكلفة رأسمالية عالية في الشراء، وتحمل المالك كافة تكاليف الترميم والصيانة والأعباء والضرائب العقارية.',
      transitionPath: 'التسجيل في الشهر العقاري بالبصمة البيومترية ومطابقة كروكي الرفع المساحي لضمان الحماية المطلقة.',
      glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.7)] border-emerald-500'
    },
    new_law: {
      title: 'القانون الجديد (عقود محددة المدة والقانون المدني)',
      description: 'خاضع للقانون رقم ٤ لسنة ١٩٩٦ (القانون المدني) وتعديلاته، حيث يسود مبدأ "العقد شريعة المتعاقدين"، فيتم تحديد المدة والقيمة الإيجارية والزيادة السنوية بالتراضي.',
      pros: 'عائد دوري متوازن يواكب التضخم، سهولة طرد المستأجر عند انتهاء العقد بالتنفيذ المباشر.',
      cons: 'عدم الاستقرار الطويل للمستأجر، واحتمالية الإخلاء عند انتهاء المدة.',
      transitionPath: 'تفعيل الصيغة التنفيذية لجميع العقود المبرمة وتسجيلها رسمياً لتسريع إخلاء المخالفين دون اللجوء للمحاكم.',
      glowColor: 'shadow-[0_0_20px_rgba(34,211,238,0.7)] border-cyan-500'
    },
    inheritance: {
      title: 'الوراثة الشرعية والشيوع',
      description: 'انتقال أنصبة العقار للورثة الشرعيين بموجب الفريضة الشرعية لوزارة العدل، حيث يملك كل وارث حصة شائعة في كل ذرة تراب لحين إجراء الفرز والجنب.',
      pros: 'حفظ الحقوق والتركات الموروثة وعدم تشتت شمل الأسرة ومستحقاتهم.',
      cons: 'كثرة النزاعات الأسرية على الشقق وتحديد الإيجارات والبيع، وتجمد استثمار العين بسبب الخلافات الفنية.',
      transitionPath: 'إعداد كروكي حصر التركات، وتوثيق الأنصبة المحددة رقمياً، والفرز والتجنيب باتفاق الأطراف أو بدعوى قضائية.',
      glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.7)] border-purple-500'
    }
  };

  // ----------------------------------------------------
  // Part 5: State for the Interactive Legislative Calculators & Checkers
  // ----------------------------------------------------
  const [activeSubSection, setActiveSubSection] = useState<'registry' | 'law_calculator' | 'purchase_checker' | 'legal_library'>('registry');

  // Interactive Legislative Calculator states (Law 164 of 2025)
  const [calcUnitType, setCalcUnitType] = useState<'residential' | 'commercial'>('residential');
  const [calcZone, setCalcZone] = useState<'premium' | 'medium' | 'economic'>('medium');
  const [calcRole, setCalcRole] = useState<'owner' | 'tenant'>('tenant');
  const [calcCurrentRent, setCalcCurrentRent] = useState<number | ''>('');
  const [calcShowResult, setCalcShowResult] = useState(false);

  // Apartment buying safety checklist states
  const [buyLicense, setBuyLicense] = useState<boolean>(true);
  const [buyLandRegistered, setBuyLandRegistered] = useState<boolean>(true);
  const [buyOwnerChain, setBuyOwnerChain] = useState<boolean>(true);
  const [buyReconciliation, setBuyReconciliation] = useState<boolean>(true);
  const [buyCounters, setBuyCounters] = useState<boolean>(true);
  const [buyStructural, setBuyStructural] = useState<boolean>(true);
  const [buyShowResult, setBuyShowResult] = useState(false);

  const isPaper = theme === 'paper';

  return (
    <div 
      onDoubleClick={() => onMaximize?.('area_registry')}
      className={`space-y-6 ${!isMaximized ? 'cursor-pointer' : ''}`}
      title={!isMaximized ? "انقر نقراً مزدوجاً (Double Click) لتوسيع بوابة الفرز العقاري بعرض الشاشة" : undefined}
    >
      
      {/* SECTION SELECTOR TABS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <span className="text-white text-xs font-black flex items-center gap-1.5 px-2">
          <BookOpen className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>منصة الإدارة والفرز العقاري الذكي</span>
          {!isMaximized && (
            <span className="text-[9px] text-slate-500 font-bold animate-pulse mr-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              (دبل كليك للتوسيع ⛶)
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubSection('registry')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'registry'
                ? 'bg-amber-500 text-slate-950 border border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>رصد الشقق وحصر المساحات</span>
          </button>

          <button
            onClick={() => setActiveSubSection('law_calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'law_calculator'
                ? 'bg-cyan-500 text-slate-950 border border-cyan-400 font-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>حاسبة الإيجار القديم والزيادات</span>
          </button>

          <button
            onClick={() => setActiveSubSection('purchase_checker')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'purchase_checker'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>فاحص سلامة شراء الشقق</span>
          </button>

          <button
            onClick={() => setActiveSubSection('legal_library')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubSection === 'legal_library'
                ? 'bg-purple-500 text-slate-950 border border-purple-400 font-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>المكتبة ومستجدات أحكام النقض</span>
          </button>
        </div>
      </div>

      {activeSubSection === 'registry' && (
        <>
          {/* 1. INTERACTIVE COMPARATIVE LAW & NEON GLOW BADGES */}
      <div id="comparative-law-neon-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="flex flex-col text-right">
              <h3 className="text-white text-sm font-black">الدليل المقارن وقاعدة إنهاء الإيجار القديم وتفعيل الجديد</h3>
              <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                تصفية تشريعية لعقود الإيجارات وتدعيم سيادة القانون رقم ١٠ لسنة ٢٠٢٢ وعقود التمليك
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-full font-bold">
            مستجدات تشريعية طارئة ⚖️
          </span>
        </div>

        {/* Interactive neon buttons that trigger custom glows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Button 1: Old Rent */}
          <button
            onClick={() => {
              setSelectedLawTab('old_rent');
              setActiveNeonGlow('old_rent');
              triggerToast('تم عرض بنود الإيجار القديم وطرق تصفيتها قانونياً', 'info');
            }}
            className={`p-3.5 rounded-xl border text-right flex flex-col gap-2 transition-all cursor-pointer ${
              activeNeonGlow === 'old_rent' 
                ? 'bg-red-950/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${activeNeonGlow === 'old_rent' ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-slate-500'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-red-400">تصفية تدريجية</span>
            </div>
            <span className="text-white text-xs font-black">إيجار قديم (تجميد العائد)</span>
          </button>

          {/* Button 2: Ownership */}
          <button
            onClick={() => {
              setSelectedLawTab('ownership');
              setActiveNeonGlow('ownership');
              triggerToast('تم عرض محددات التمليك وعقود الحيازة الخالصة', 'success');
            }}
            className={`p-3.5 rounded-xl border text-right flex flex-col gap-2 transition-all cursor-pointer ${
              activeNeonGlow === 'ownership' 
                ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${activeNeonGlow === 'ownership' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-emerald-400">حيازة مطلقة</span>
            </div>
            <span className="text-white text-xs font-black">تمليك حر (مسجل)</span>
          </button>

          {/* Button 3: New Law */}
          <button
            onClick={() => {
              setSelectedLawTab('new_law');
              setActiveNeonGlow('new_law');
              triggerToast('تم عرض أحكام القانون الجديد رقم ٤ لعام ١٩٩٦ وتحديثات ٢٠٢٢', 'success');
            }}
            className={`p-3.5 rounded-xl border text-right flex flex-col gap-2 transition-all cursor-pointer ${
              activeNeonGlow === 'new_law' 
                ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${activeNeonGlow === 'new_law' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-900 text-slate-500'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-cyan-400">العقد شريعة المتعاقدين</span>
            </div>
            <span className="text-white text-xs font-black">إيجار جديد (حر ومقنن)</span>
          </button>

          {/* Button 4: Inheritance */}
          <button
            onClick={() => {
              setSelectedLawTab('inheritance');
              setActiveNeonGlow('inheritance');
              triggerToast('تم عرض نظام الفريضة والوراثة وحصر التركات', 'info');
            }}
            className={`p-3.5 rounded-xl border text-right flex flex-col gap-2 transition-all cursor-pointer ${
              activeNeonGlow === 'inheritance' 
                ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 rounded-lg ${activeNeonGlow === 'inheritance' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-900 text-slate-500'}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-purple-400">حصة شائعة</span>
            </div>
            <span className="text-white text-xs font-black">وراثة وتركات (شيوع)</span>
          </button>
        </div>

        {/* Comparison Details Panel with dynamic description */}
        <div className="bg-slate-950/60 p-4.5 rounded-xl border border-slate-850 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-amber-400 text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{lawComparativeData[selectedLawTab].title}</span>
            </h4>
            <span className="text-[9px] bg-slate-900 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-mono">
              الوضع القانوني التفصيلي
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed font-medium">
            {lawComparativeData[selectedLawTab].description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
            <div className="bg-emerald-950/5 border border-emerald-950 p-3 rounded-lg space-y-1">
              <span className="text-emerald-400 font-black block">🟢 المزايا والامتيازات:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">{lawComparativeData[selectedLawTab].pros}</p>
            </div>
            <div className="bg-red-950/5 border border-red-950 p-3 rounded-lg space-y-1">
              <span className="text-red-400 font-black block">🔴 العيوب والمآخذ الإثباتية:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">{lawComparativeData[selectedLawTab].cons}</p>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg text-xs flex gap-2">
            <span className="text-amber-400 font-black shrink-0">🎯 مسار التحديث والانتقال:</span>
            <p className="text-slate-200 text-[11px] leading-relaxed font-semibold">
              {lawComparativeData[selectedLawTab].transitionPath}
            </p>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC APARTMENT DATABASE VIEW (إيجار - تمليك - وراثة) */}
      <div id="apartments-registry-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <div className="flex flex-col text-right">
              <h3 className="text-white text-sm font-black">قاعدة رصد وتصنيف الشقق السكنية وتصفية الإيجار القديم</h3>
              <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                تصفية الحيازات الاستعمارية غير القانونية وتفعيل عقود القانون الجديد مع إثبات مصداقية الحقيقي والتقريبي
              </span>
            </div>
          </div>
          <span className="bg-cyan-950 text-cyan-400 border border-cyan-900/40 px-3 py-1 rounded-full text-[10px] font-bold">
            عدد الوحدات المرصودة: {apartments.length}
          </span>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* List of Units */}
          <div className="lg:col-span-8 space-y-3">
            {apartments.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                لا توجد شقق مسجلة حالياً لهذه المعاينة.
              </div>
            ) : (
              apartments.map((apt) => (
                <div 
                  key={apt.id}
                  className={`p-4 rounded-xl border transition-all duration-300 space-y-3 ${
                    apt.occupancyType === 'old_rent'
                      ? 'bg-red-950/5 border-red-900/20 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : apt.occupancyType === 'new_law'
                      ? 'bg-cyan-950/5 border-cyan-900/20 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : apt.occupancyType === 'ownership'
                      ? 'bg-emerald-950/5 border-emerald-900/20 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-purple-950/5 border-purple-900/20 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-xs font-black">{apt.unitNumber}</span>
                      
                      {/* Area */}
                      <span className="text-[10px] font-bold bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-850">
                        📐 {apt.area} م²
                      </span>

                      {/* Verification Badge */}
                      {apt.isVerified ? (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          (حقيقي) - معاين بالكامل
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          تقريبي - تحت المراجعة
                        </span>
                      )}

                      {/* Occupancy Type Badges */}
                      {apt.occupancyType === 'old_rent' && (
                        <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          ⚠️ إيجار قديم مهدد بالإخلاء
                        </span>
                      )}
                      {apt.occupancyType === 'new_law' && (
                        <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                          ✓ إيجار جديد مستقر
                        </span>
                      )}
                      {apt.occupancyType === 'ownership' && (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          ✓ ملكية خالصة (تمليك)
                        </span>
                      )}
                      {apt.occupancyType === 'inheritance' && (
                        <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          ⚖️ إرث موروث على الشيوع
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteApartment(apt.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-all self-end sm:self-auto"
                      title="حذف الشقة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed text-slate-300">
                    <div>
                      <span className="text-slate-500 font-bold block">اسم الشاغل / الحائز:</span>
                      <span className="text-white font-bold">{apt.occupantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">الأجرة الشهرية الحالية:</span>
                      <span className="text-white font-black font-mono">
                        {apt.monthlyRent > 0 ? `${apt.monthlyRent.toLocaleString('ar-EG')} جنيهاً` : 'لا ينطبق (ملكية)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">الملاحظات القانونية للعين:</span>
                      <span className="text-slate-400 font-semibold truncate block max-w-[200px]" title={apt.notes}>
                        {apt.notes}
                      </span>
                    </div>
                  </div>

                  {/* Operational controls for transitioning from Old to New Law */}
                  <div className="bg-slate-950/40 p-2.5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">حالة المخالفات المرصودة:</span>
                      <select
                        value={apt.violationStatus}
                        onChange={(e) => handleViolationChange(apt.id, e.target.value as ApartmentRecord['violationStatus'])}
                        className="bg-slate-900 border border-slate-800 text-[11px] text-white p-1 rounded font-bold"
                      >
                        <option value="none">سليم - لا توجد مخالفات</option>
                        <option value="unpaid_rent">تأخير الأجرة لأكثر من ١٥ يوماً</option>
                        <option value="unauthorized_change">تغيير نشاط العين دون موافقة</option>
                        <option value="structural_damage">إحداث تلفيات إنشائية بالخرسانة</option>
                      </select>
                    </div>

                    {apt.occupancyType === 'old_rent' && (
                      <button
                        onClick={() => handleTransitionToNewLaw(apt.id)}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إنهاء الإيجار القديم وتحديث العقد فورا</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to add unit */}
          <div className="lg:col-span-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
            <h4 className="text-white text-xs font-black flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>إدراج شقة جديدة بالقائمة</span>
            </h4>

            <form onSubmit={handleAddApartment} className="space-y-3 text-xs text-right">
              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-bold block">مسمى الشقة أو الوحدة</label>
                <input
                  type="text"
                  placeholder="مثال: شقة الطابق الثالث (غرب)..."
                  value={aptUnit}
                  onChange={(e) => setAptUnit(e.target.value)}
                  className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold block">المساحة م²</label>
                  <input
                    type="number"
                    placeholder="م²"
                    value={aptArea}
                    onChange={(e) => setAptArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold block">التدقيق المساحي</label>
                  <select
                    value={aptVerified ? 'true' : 'false'}
                    onChange={(e) => setAptVerified(e.target.value === 'true')}
                    className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-bold"
                  >
                    <option value="true">(حقيقي) - مؤكد</option>
                    <option value="false">تقريبي - تخميني</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold block">نظام الحيازة</label>
                  <select
                    value={aptOccupancy}
                    onChange={(e) => setAptOccupancy(e.target.value as any)}
                    className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-bold"
                  >
                    <option value="old_rent">إيجار قديم</option>
                    <option value="new_law">إيجار جديد</option>
                    <option value="ownership">تمليك حر</option>
                    <option value="inheritance">وراثة شرعية</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold block">الأجرة الشهرية (ج)</label>
                  <input
                    type="number"
                    placeholder="جنيهاً"
                    value={aptRent}
                    onChange={(e) => setAptRent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-mono font-bold"
                    disabled={aptOccupancy === 'ownership'}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-bold block">اسم الشاغل للعين</label>
                <input
                  type="text"
                  placeholder="أدخل اسم الساكن حالياً..."
                  value={aptOccupant}
                  onChange={(e) => setAptOccupant(e.target.value)}
                  className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] font-bold block">ملاحظات قضائية هندسية</label>
                <textarea
                  placeholder="اضف أي تفاصيل أخرى عن العقود أو المالك..."
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  className="w-full text-right p-2 h-14 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs py-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إدراج في سجل الشقق</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* 3. IMMEDIATE DECISION-MAKER FOR VIOLATORS (القرارات الفورية للردع والمخالفين) */}
      <div id="violation-decision-dashboard" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Gavel className="w-5 h-5 text-amber-500 animate-pulse" />
          <div className="flex flex-col text-right">
            <h3 className="text-white text-sm font-black">مجلس حسم المخالفات الفورية وقرارات طرد الممتنعين</h3>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              تفعيل بنود الرادع القضائي والشرطي المباشر ضد شاغلي العين المخالفين لقانون الحفاظ على الثروة العقارية
            </span>
          </div>
        </div>

        {/* Control row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedViolationType('unpaid_rent');
              triggerToast('تم فحص تدابير الامتناع عن سداد الأجرة', 'warning');
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              selectedViolationType === 'unpaid_rent'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'
            }`}
          >
            ❌ التخلف عن الأجرة
          </button>

          <button
            onClick={() => {
              setSelectedViolationType('unauthorized_change');
              triggerToast('تم فحص قرارات تغيير نشاط العين الإيجارية', 'warning');
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              selectedViolationType === 'unauthorized_change'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'
            }`}
          >
            🏭 تغيير نشاط العين
          </button>

          <button
            onClick={() => {
              setSelectedViolationType('structural_damage');
              triggerToast('تم فحص إجراءات الإضرار بسلامة المبنى الإنشائية', 'warning');
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              selectedViolationType === 'structural_damage'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'
            }`}
          >
            🏗️ إتلاف الهيكل الإنشائي
          </button>
        </div>

        {/* Detailed Order Output Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-red-950/40 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
            <span className="text-red-400 font-black text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 animate-bounce" />
              <span>{currentDecision.title}</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-500 font-bold">مستوى الخطورة:</span>
              <span className="bg-red-950 text-red-300 font-black px-2 py-0.5 rounded border border-red-900/40">
                {currentDecision.severity}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed font-semibold">
            <span className="text-slate-500">المرجعية الدستورية والقانونية:</span> {currentDecision.lawReference}
          </div>

          <div className="space-y-2">
            <span className="text-slate-300 text-xs font-black block">⚙️ الإجراءات الرادعة الفورية المتخذة:</span>
            <ul className="space-y-1.5">
              {currentDecision.actions.map((act, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-amber-500 font-mono mt-0.5">{index + 1}.</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prompt Executor */}
          <div className="flex justify-end pt-2 border-t border-slate-800/40">
            <button
              onClick={() => {
                triggerToast('⚖️ تم إرسال الأمر القضائي المباشر للجهات الإدارية لتنفيذ الإجراءات الرادعة فوراً.', 'success');
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] px-4 py-2 rounded-lg transition-all shadow-md shadow-red-500/10 cursor-pointer"
            >
              ⚖️ تفعيل الأمر التنفيذي الفوري وقوة الجبر الإدارية
            </button>
          </div>
        </div>
      </div>

      {/* 4. AREA REGISTRY (ORIGINAL PORTION SAVED COMPLIANTLY) */}
      <div id="original-area-registry-subsection" className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2">
          <Ruler className="w-4 h-4 text-amber-500" />
          <span>سجل المساحات الهندسية المنفردة (الأرض / الطوابق)</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">لا توجد سجلات مساحية.</div>
            ) : (
              records.map((rec) => (
                <div 
                  key={rec.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                    rec.isVerified 
                      ? 'bg-emerald-950/5 border-emerald-900/30 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-amber-950/5 border-amber-900/30 hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  }`}
                >
                  <div className="space-y-1 text-right min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-xs font-black truncate">{rec.name}</span>
                      <span className="text-[11px] font-mono font-black text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {rec.area.toLocaleString('ar-EG')} م²
                      </span>
                      {rec.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          (حقيقي)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          تقريبي
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">
                      <span className="text-slate-500">المرجع:</span> {rec.source}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={() => toggleVerification(rec.id)}
                      className={`px-2 py-1 rounded-lg border text-[9px] font-bold transition-all ${
                        rec.isVerified
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {rec.isVerified ? "تقريبي" : "(حقيقي)"}
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-5 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
            <h4 className="text-white text-[11px] font-black flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              <span>تسجيل بند مساحة إضافي</span>
            </h4>
            <form onSubmit={handleAddRecord} className="space-y-2.5 text-xs text-right">
              <input
                type="text"
                placeholder="اسم البند (مثال: الشقة الشمالية)..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="المساحة م²"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-mono"
                  required
                />
                <select
                  value={newIsVerified ? 'true' : 'false'}
                  onChange={(e) => setNewIsVerified(e.target.value === 'true')}
                  className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none font-bold"
                >
                  <option value="true">(حقيقي)</option>
                  <option value="false">تقريبي</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="مرجع الإثبات المستندي..."
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full text-right p-2 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black py-2 rounded-lg text-xs"
              >
                إدراج في مساحة العقار الكلية
              </button>
            </form>
          </div>
        </div>
      </div>
      </>
      )}

      {/* 2. LEGISLATIVE RENT & EVICTION CALCULATOR (حاسبة قانون الإيجار القديم والزيادات) */}
      {activeSubSection === 'law_calculator' && (
        <div id="law-calculator-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="flex flex-col text-right">
                <h3 className="text-white text-sm font-black">حاسبة زيادة الأجور ومصير الإخلاء بموجب القانون ١٦٤ لسنة ٢٠٢٥</h3>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                  تطابق كامل مع مستجدات أحكام المحكمة الدستورية العليا وقرار حصر محافظة القاهرة
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900/40 px-3 py-1 rounded-full font-black">
              أداة حسابية معتمدة 📊
            </span>
          </div>

          {/* Quick Informational Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right">
              <span className="text-[10px] text-slate-500 font-bold block">القانون الجديد رقم ١٦٤ لسنة ٢٠٢٥</span>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">
                ينهي عقود الأماكن المؤجرة لغرض السكنى بانتهاء فترة انتقالية قدرها ٧ سنوات، وتتراوح زيادة الأجرة بين ١٠ إلى ٢٠ ضعفاً.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right">
              <span className="text-[10px] text-slate-500 font-bold block">تعديلات القانون ١٣٦ لسنة ١٩٨١</span>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">
                إبطال الامتداد التلقائي المؤبد وتعديل الأجرة السنوية للتنظيم قبل الإخلاء والتحرير الشامل.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right">
              <span className="text-[10px] text-slate-500 font-bold block">قرار لجان الحصر (رقم ٩٧٨ لسنة ٢٠٢٥)</span>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">
                تحديد القيمة الإيجارية التقديرية حسب تقسيم المناطق لمتميزة (أعلى زيادة)، ومتوسطة، واقتصادية.
              </p>
            </div>
          </div>

          {/* Calculator Inputs Form */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 text-right space-y-4">
            <h4 className="text-white text-xs font-black border-b border-slate-800 pb-2">✏️ أدخل بيانات العين لتحديد وضعك ومقدار الزيادة:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Unit Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold block">نوع الوحدة الإيجارية:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCalcUnitType('residential')}
                    className={`py-2 rounded-lg border text-xs font-black transition-all ${
                      calcUnitType === 'residential'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🏠 سكنية
                  </button>
                  <button
                    onClick={() => setCalcUnitType('commercial')}
                    className={`py-2 rounded-lg border text-xs font-black transition-all ${
                      calcUnitType === 'commercial'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🏢 تجارية / إدارية
                  </button>
                </div>
              </div>

              {/* Geographic Zone */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold block">تصنيف المنطقة الإقليمية (قرار الحصر):</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setCalcZone('premium')}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-black transition-all ${
                      calcZone === 'premium'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✨ متميزة
                  </button>
                  <button
                    onClick={() => setCalcZone('medium')}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-black transition-all ${
                      calcZone === 'medium'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🏙️ متوسطة
                  </button>
                  <button
                    onClick={() => setCalcZone('economic')}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-black transition-all ${
                      calcZone === 'economic'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🏡 اقتصادية
                  </button>
                </div>
              </div>

              {/* User Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold block">صفتك في التعاقد:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCalcRole('owner')}
                    className={`py-2 rounded-lg border text-xs font-black transition-all ${
                      calcRole === 'owner'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🔑 مالك العقار
                  </button>
                  <button
                    onClick={() => setCalcRole('tenant')}
                    className={`py-2 rounded-lg border text-xs font-black transition-all ${
                      calcRole === 'tenant'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    👥 مستأجر العين
                  </button>
                </div>
              </div>
            </div>

            {/* Current Rent Input */}
            <div className="space-y-1.5 max-w-xs ml-auto">
              <label className="text-[11px] text-slate-400 font-bold block">القيمة الإيجارية الشهرية القديمة الحالية:</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="مثال: ٢٥..."
                  value={calcCurrentRent}
                  onChange={(e) => setCalcCurrentRent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-right p-2.5 text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 font-mono text-xs pr-12"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold">جنيه مصري</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!calcCurrentRent || calcCurrentRent <= 0) {
                  triggerToast('الرجاء إدخال القيمة الإيجارية الحالية بشكل صحيح', 'warning');
                  return;
                }
                setCalcShowResult(true);
                triggerToast('تم احتساب الزيادات والتبعات القانونية لمستجدات ٢٠٢٥', 'success');
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black py-2.5 rounded-lg text-xs shadow-md shadow-cyan-500/10 cursor-pointer transition-all"
            >
              📊 احسب الزيادة وتاريخ الإخلاء ومصير العين العقارية
            </button>
          </div>

          {/* Calculator Output */}
          {calcShowResult && calcCurrentRent !== '' && (
            <div className="bg-slate-950 p-5 rounded-xl border border-cyan-900/30 text-right space-y-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <h5 className="text-white text-xs font-black">التقرير والمطابقة التشريعية المباشرة لحالتك:</h5>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block">القيمة الحالية قبل التعديل</span>
                  <p className="text-sm font-black font-mono text-slate-400 mt-1">
                    {(Number(calcCurrentRent)).toLocaleString('ar-EG')} ج.م
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block">معامل الضرب والزيادة الفورية</span>
                  <p className="text-sm font-black text-cyan-400 mt-1">
                    {calcUnitType === 'residential' 
                      ? (calcZone === 'premium' ? '٢٠ ضعفاً فوري' : calcZone === 'medium' ? '١٥ ضعفاً فوري' : '١٠ أضعاف فوري')
                      : 'زيادة ١٥٪ سنوية تدرجية'}
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-cyan-950">
                  <span className="text-[10px] text-cyan-400 font-bold block">القيمة الإيجارية الجديدة المقدرة</span>
                  <p className="text-sm font-black font-mono text-cyan-400 mt-1">
                    {calcUnitType === 'residential'
                      ? (calcCurrentRent * (calcZone === 'premium' ? 20 : calcZone === 'medium' ? 15 : 10)).toLocaleString('ar-EG')
                      : (calcCurrentRent * 1.15).toLocaleString('ar-EG')} ج.م
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block">موعد الإخلاء وتحرير العين النهائي</span>
                  <p className="text-sm font-black text-amber-400 mt-1">
                    {calcUnitType === 'residential' ? 'خلال ٧ سنوات (٢٠٣٢)' : 'خلال ٥ سنوات (٢٠٣٠)'}
                  </p>
                </div>
              </div>

              {/* Legal Advice Callout */}
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="text-amber-400 text-xs font-black flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>توجيه قانوني مخصص لـ {calcRole === 'owner' ? 'مالك العقار' : 'مستأجر العين'}:</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {calcRole === 'owner' ? (
                    `بصفتك مالكاً للعقار، يمنحك القانون ١٦٤ لسنة ٢٠٢٥ سلطة إلزام المستأجر بالقيمة الإيجارية المعدلة البالغة للوحدة السكنية ${(calcCurrentRent * (calcZone === 'premium' ? 20 : calcZone === 'medium' ? 15 : 10)).toLocaleString('ar-EG')} ج.م فور إقرارها. وفي حالة امتناعه لأي شهر، يحق لك إقامة دعوى طرد سريعة وغصب استناداً لأحكام محكمة النقض دون الحاجة لانتظار انتهاء الـ ٧ سنوات، لكونه غاصباً وممتنعاً عن السداد الشرعي.`
                  ) : (
                    `بصفتك مستأجراً، يتعين عليك الالتزام التام بسداد الأجرة القانونية الجديدة البالغة ${(calcCurrentRent * (calcZone === 'premium' ? 20 : calcZone === 'medium' ? 15 : 10)).toLocaleString('ar-EG')} ج.م لمنع مالك العين من رفع دعوى طرد فورية للغصب وسلب الحيازة. اعلم أن القانون يمنحك فترة انتقالية قدرها ٧ سنوات لتوفيق أوضاعك والبحث عن بديل تمليك أو قانون جديد.`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. APARTMENT PURCHASE SOUNDNESS CHECKER (فاحص أمان الشراء والتسجيل العقاري لشقة جديدة) */}
      {activeSubSection === 'purchase_checker' && (
        <div id="purchase-checker-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div className="flex flex-col text-right">
                <h3 className="text-white text-sm font-black">فاحص سلامة شراء الشقق الجديدة وصلاحيتها للتسجيل</h3>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                  تحليل وثائق التمليك، رخصة المباني، وتطابق كروكي الرفع الهندسي لتجنب نزاعات غصب الملكية
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-3 py-1 rounded-full font-black">
              أمان واستثمار 🛡️
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-right space-y-3">
            <span className="text-amber-400 text-xs font-black block">💡 توجيه قانوني قبل فحص الأوراق:</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا كنت تنوي شراء شقة جديدة، لا تعتمد على عقود البيع الابتدائية (عقد عرفي) أو دعاوى صحة التوقيع فقط، حيث أقر قضاء محكمة النقض أن "صحة التوقيع" لا تبحث الملكية ولا تضمن سلامة العقار من الإزالة أو غصب الغير للعين. استخدم المعالج التفاعلي التالي لتقييم وثائق الشقة المقترحة:
            </p>
          </div>

          {/* Checklist Form */}
          <div className="space-y-3 text-right">
            <h4 className="text-white text-xs font-black">📋 اختر حالة الوثائق المتوفرة مع البائع للشقة:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Question 1: License */}
              <button
                onClick={() => setBuyLicense(!buyLicense)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyLicense ? 'bg-emerald-950/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">🏢 رخصة البناء الرسمية للعقار</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">هل العقار مرخص بالكامل وخالٍ من مخالفات الارتفاع؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyLicense ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyLicense && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              {/* Question 2: Land registered */}
              <button
                onClick={() => setBuyLandRegistered(!buyLandRegistered)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyLandRegistered ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">📑 الأرض مسجلة شهر عقاري (عقد أزرق)</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">هل أرض البرج مسجلة باسم المالك الأصلي أو البائع؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyLandRegistered ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyLandRegistered && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              {/* Question 3: Ownership Chain */}
              <button
                onClick={() => setBuyOwnerChain(!buyOwnerChain)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyOwnerChain ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">⛓️ تسلسل ملكية عقاري متصل ومحكم</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">هل العقود متصلة دون حلقات مفقودة حتى واضع اليد الأصلي؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyOwnerChain ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyOwnerChain && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              {/* Question 4: Reconciliation 10 */}
              <button
                onClick={() => setBuyReconciliation(!buyReconciliation)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyReconciliation ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">📄 نموذج ١٠ نهائي للتصالح على المخالفات</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">إذا كان مخالفاً، هل تم قبول التصالح نهائياً وسداد الرسوم؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyReconciliation ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyReconciliation && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              {/* Question 5: Counters */}
              <button
                onClick={() => setBuyCounters(!buyCounters)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyCounters ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">🔌 عدادات مرافق رسمية ومستقلة للعين</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">هل الشقة مزودة بعداد كهرباء وغاز كودي مسجل باسم المالك؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyCounters ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyCounters && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              {/* Question 6: Structural & Drawings matching */}
              <button
                onClick={() => setBuyStructural(!buyStructural)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  buyStructural ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">📏 مطابقة الكروكي الهندسي والرفع المساحي</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">هل تطابق مساحة الشقة على الطبيعة الرسومات المعتمدة تماماً؟</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${buyStructural ? 'bg-emerald-500 border-emerald-400' : 'border-slate-800'}`}>
                  {buyStructural && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setBuyShowResult(true);
                triggerToast('تم احتساب نقاط الأمان العقاري للشقة', 'success');
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-lg text-xs shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
            >
              🛡️ افحص نسبة أمان الشراء والقدرة على التسجيل في الشهر العقاري
            </button>
          </div>

          {/* Result Score Widget */}
          {buyShowResult && (
            (() => {
              let score = 0;
              if (buyLicense) score += 25;
              if (buyLandRegistered) score += 20;
              if (buyOwnerChain) score += 20;
              if (buyReconciliation) score += 15;
              if (buyCounters) score += 10;
              if (buyStructural) score += 10;

              let statusColor = 'text-red-400';
              let bgColor = 'bg-red-950/20 border-red-900/40';
              let textAdvice = '';
              let titleStatus = '';

              if (score === 100) {
                statusColor = 'text-emerald-400';
                bgColor = 'bg-emerald-950/20 border-emerald-900/40';
                titleStatus = '✓ عقار آمن ومثالي للتسجيل العقاري المباشر 🌟';
                textAdvice = 'تهانينا! الأوراق مستوفية لكافة المتطلبات الهندسية والقانونية. الشقة صالحة للتسجيل الفوري بالشهر العقاري بموجب القانون الجديد ولن تواجه أي نزاعات في المستقبل.';
              } else if (score >= 70) {
                statusColor = 'text-amber-400';
                bgColor = 'bg-amber-950/20 border-amber-900/40';
                titleStatus = '⚠️ عقار مقبول مع مخاطر وإجراءات معلقة';
                textAdvice = 'العقار مستقر نسبياً ولكن ينقصه بعض الوثائق (مثل نقل العدادات أو مراجعة مساحة الكروكي بدقة). نوصي بعدم دفع كامل المبلغ للبائع إلا بعد نقل عداد المرافق باسمك والتوقيع على عقد البيع النهائي المعتمد.';
              } else {
                statusColor = 'text-red-400';
                bgColor = 'bg-red-950/20 border-red-900/40';
                titleStatus = '🚨 خطر جداً ومرفوض للتسجيل العقاري المباشر!';
                textAdvice = 'احذر من الشراء! غياب رخصة البناء أو تسلسل الملكية أو عقد الأرض المسجل يعني عدم إمكانية تسجيل الشقة نهائياً. العقود العرفية (مثل صحة التوقيع) لا تنقل الملكية وتحميك بشكل ضعيف جداً من نزاعات الطرد والغصب من الغير.';
              }

              return (
                <div className={`p-5 rounded-xl border text-right space-y-3 ${bgColor}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                    <span className={`text-xs font-black ${statusColor}`}>
                      {titleStatus}
                    </span>
                    <span className="text-xs text-white font-mono font-black">
                      مؤشر الأمان: <span className={statusColor}>{score}%</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        score === 100 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {textAdvice}
                  </p>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* 4. THE COURT OF CASSATION & HISTORIC RULINGS VAULT (مكتبة الأحكام ومستجدات محكمة النقض) */}
      {activeSubSection === 'legal_library' && (
        <div id="legal-library-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400 animate-pulse" />
              <div className="flex flex-col text-right">
                <h3 className="text-white text-sm font-black">سجل أحكام محكمة النقض والدستورية العليا لتصفية عقود الإيجار</h3>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                  قواعد قضائية باتة ترسم ملامح سلب الحيازة ومكافحة غصب الوحدات السكنية في القانون المصري
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-900/40 px-3 py-1 rounded-full font-black">
              أرشيف النقض الرسمي ⚖️
            </span>
          </div>

          {/* 1. COURT OF CASSATION BOX - STAMPED AND GORGEOUS */}
          <div className="bg-slate-950 p-5 rounded-xl border border-amber-900/30 text-right space-y-3 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="absolute -left-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none border-4 border-amber-500 rounded-full flex items-center justify-center font-black text-lg select-none">
              مختوم
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 text-xs font-black flex items-center gap-1.5">
                <Gavel className="w-4 h-4" />
                <span>المبدأ القانوني لمحكمة النقض المصرية (دعوى طرد الغصب)</span>
              </span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                مبدأ بات وملزم
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-black bg-slate-900/50 p-4 rounded-lg border border-slate-850/60 shadow-inner">
              🔴 لا يشترط في رافع دعوى الطرد للغصب أن يكون مالكاً للعين المغصوبة إنما يكفي أن يكون له حق إدارتها أو مكلفاً بالمحافظة عليها كالشريك على الشيوع والمشتري بعقد عرفي والحارس والمستعير والمودع لديه وكل من ألزمه القانون بالمحافظة على الشيء المسلم إليه حتى يرده إلى صاحبه.
            </p>
            <div className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              <span className="text-slate-400 font-black">شرح المبدأ:</span> يتيح هذا الحكم التاريخي لمشتري العقار بعقد بيع عرفي (غير مسجل بالشهر العقاري بعد) أو الشريك على الشيوع أن يطرد واضعي اليد والغاصبين والشركات الممتنعة عن الدفع فوراً، دون انتظار إجراءات التسجيل الطويلة، كونه مكلفاً بالمحافظة على سلامة وثبات العين.
            </div>
          </div>

          {/* 2. CONSTITUTIONAL COURT BOX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-right space-y-2">
              <span className="text-purple-400 text-xs font-black flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                <span>حكم المحكمة الدستورية لعام ٢٠٢٤</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                قضت المحكمة الدستورية العليا في جلستها المنعقدة في ٩ نوفمبر ٢٠٢٤ (القضية رقم ٢٤ لسنة ٢٠ قضائية دستورية) بعدم دستورية ثبات القيمة الإيجارية في عقود الإيجار القديم. استلزم هذا الحكم تحركاً تشريعياً فورياً تجسد في القانون رقم ١٦٤ لسنة ٢٠٢٥ لإلغاء تأبيد العقود وفتح باب الإخلاء المتدرج.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-right space-y-2">
              <span className="text-cyan-400 text-xs font-black flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>صلاحيات لجان الحصر والتقدير</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                بموجب المادة الخامسة من القانون الجديد، تشكل لجان حصر في كل محافظة تابعة لوزارة الإسكان بالتنسيق مع التنمية المحلية، لتحديد القيمة السوقية العادلة وإخطار الملاك والمستأجرين إدارياً لتعديل القيمة، تمهيداً لبلوغ تاريخ التحرير الكامل بعد الفترة الانتقالية.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

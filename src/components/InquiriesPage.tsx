import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Building2, 
  User, 
  Lightbulb, 
  Home, 
  Shield, 
  Banknote, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  ArrowLeft,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Database,
  Cpu,
  Download,
  DollarSign,
  Maximize2,
  RefreshCw,
  Clock,
  ExternalLink,
  Smartphone,
  Compass,
  Layers,
  Activity
} from 'lucide-react';
import { triggerToast } from '../lib/toast';
import { CaseData } from '../types';

interface InquiriesPageProps {
  caseData?: CaseData;
}

// Define the Service types
type ServiceType = 
  | 'courts'
  | 'realestate'
  | 'commercial'
  | 'civil'
  | 'utilities'
  | 'housing'
  | 'insurance'
  | 'health'
  | 'bank';

interface Service {
  id: ServiceType;
  label: string;
  icon: React.ReactNode;
  color: string; // Neon border/glow color
  tabColor: string; // Color for the horizontal tabs matching the image
  fields: { label: string; key: string; placeholder: string; defaultValue?: string }[];
  agency: string;
}

const services: Service[] = [
  {
    id: 'courts',
    label: 'القضايا والمحاكم',
    icon: <FileText className="w-5 h-5 text-amber-400" />,
    color: 'border-[#ff4500]/50 shadow-[#ff4500]/20 text-orange-500',
    tabColor: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20',
    fields: [
      { label: 'رقم القضية (مثال: 12345 أو 67890)', key: 'caseNumber', placeholder: 'أدخل رقم القضية', defaultValue: '12345' },
      { label: 'المحكمة المختصة', key: 'court', placeholder: 'اسم المحكمة', defaultValue: 'محكمة الجيزة الابتدائية' },
    ],
    agency: 'وزارة العدل - بوابة عدالة مصر الرقمية'
  },
  {
    id: 'utilities',
    label: 'المرافق والعدادات',
    icon: <Lightbulb className="w-5 h-5 text-lime-400" />,
    color: 'border-lime-500/50 shadow-lime-500/20 text-lime-500',
    tabColor: 'bg-lime-600 hover:bg-lime-700 text-slate-950 shadow-lime-500/20',
    fields: [
      { label: 'رقم العداد / الحساب المشترك', key: 'meterNumber', placeholder: 'أدخل رقم العداد المطبوع', defaultValue: 'UT-9982' },
      { label: 'نوع المرفق التابع له', key: 'utilityType', placeholder: 'كهرباء / مياه / غاز', defaultValue: 'كهرباء' },
    ],
    agency: 'الشركة القابضة لمياه الشرب والكهرباء والغاز'
  },
  {
    id: 'civil',
    label: 'الأحوال المدنية',
    icon: <User className="w-5 h-5 text-yellow-400" />,
    color: 'border-yellow-500/50 shadow-yellow-500/20 text-yellow-500',
    tabColor: 'bg-yellow-500 hover:bg-yellow-600 text-slate-950 shadow-yellow-500/20',
    fields: [
      { label: 'الرقم القومي (14 رقم)', key: 'nationalId', placeholder: 'أدخل الرقم القومي للمستفيد', defaultValue: '29812042100874' },
      { label: 'اسم المواطن المستفيد', key: 'beneficiaryName', placeholder: 'الاسم الكامل من واقع شهادة الميلاد', defaultValue: 'أحمد كمال السويركي' },
    ],
    agency: 'وزارة الداخلية - مصلحة الأحوال المدنية'
  },
  {
    id: 'commercial',
    label: 'السجل التجاري',
    icon: <Building2 className="w-5 h-5 text-cyan-400" />,
    color: 'border-cyan-500/50 shadow-cyan-500/20 text-cyan-400',
    tabColor: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
    fields: [
      { label: 'رقم السجل التجاري القائم', key: 'commercialNumber', placeholder: 'أدخل رقم السجل التجاري للشركة', defaultValue: 'CR-77561' },
      { label: 'الاسم التجاري للمنشأة', key: 'companyName', placeholder: 'اسم الشركة التجارية أو المؤسسة', defaultValue: 'تقادم للمحاماة والاستشارات' },
    ],
    agency: 'وزارة التموين - جهاز تنمية التجارة الداخلية'
  },
  {
    id: 'realestate',
    label: 'الشهر العقاري',
    icon: <Building2 className="w-5 h-5 text-slate-400" />,
    color: 'border-slate-500/50 shadow-slate-500/20 text-slate-300',
    tabColor: 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-500/20',
    fields: [
      { label: 'رقم القيد العقاري المشهر', key: 'registrationNumber', placeholder: 'أدخل رقم القيد أو المشهر الموثق', defaultValue: 'RE-001' },
      { label: 'اسم المالك الحالي للعقار', key: 'ownerName', placeholder: 'اسم المالك الثلاثي أو الرباعي', defaultValue: 'أحمد محمد الجيزاوي' },
    ],
    agency: 'وزارة العدل - مصلحة الشهر العقاري والتوثيق'
  },
  {
    id: 'housing',
    label: 'الإسكان الاجتماعي',
    icon: <Home className="w-5 h-5 text-rose-400" />,
    color: 'border-rose-500/50 shadow-rose-500/20 text-rose-500',
    tabColor: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    fields: [
      { label: 'رقم حجز كراسة الشروط', key: 'requestNumber', placeholder: 'أدخل رقم طلب حجز الشقة', defaultValue: 'HS-5524' },
      { label: 'اسم المتقدم الرئيسي', key: 'applicantName', placeholder: 'الاسم الرباعي للمتقدم', defaultValue: 'سعد الدين محمد البطل' },
    ],
    agency: 'وزارة الإسكان - صندوق الإسكان الاجتماعي ودعم التمويل العقاري'
  },
  {
    id: 'insurance',
    label: 'التأمينات الاجتماعية',
    icon: <Shield className="w-5 h-5 text-indigo-400" />,
    color: 'border-indigo-500/50 shadow-indigo-500/20 text-indigo-500',
    tabColor: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    fields: [
      { label: 'الرقم التأميني للمواطن', key: 'insuranceNumber', placeholder: 'أدخل الرقم التأميني الموحد', defaultValue: 'INS-44912' },
      { label: 'اسم المؤمن عليه ثنائياً', key: 'insuredName', placeholder: 'الاسم الكامل للمؤمن عليه', defaultValue: 'أحمد كمال السويركي' },
    ],
    agency: 'الهيئة القومية للتأمين الاجتماعي'
  },
  {
    id: 'health',
    label: 'التأمين الصحي الشامل',
    icon: <Shield className="w-5 h-5 text-teal-400" />,
    color: 'border-teal-500/50 shadow-teal-500/20 text-teal-500',
    tabColor: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20',
    fields: [
      { label: 'رقم بطاقة التأمين الطبي المميكن', key: 'medicalFileNumber', placeholder: 'أدخل رقم الملف الطبي', defaultValue: 'MED-1102' },
      { label: 'اسم المنتفع الرئيسي بالخدمة', key: 'beneficiaryName', placeholder: 'اسم المنتفع بالملف', defaultValue: 'يارا أحمد كمال' },
    ],
    agency: 'الهيئة العامة للتأمين الصحي الشامل'
  },
  {
    id: 'bank',
    label: 'البنكي iScore',
    icon: <Banknote className="w-5 h-5 text-fuchsia-400" />,
    color: 'border-fuchsia-500/50 shadow-fuchsia-500/20 text-fuchsia-500',
    tabColor: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-500/20',
    fields: [
      { label: 'رقم حساب البنك المركزي', key: 'accountNumber', placeholder: 'أدخل رقم الحساب المرجعي للائتمان', defaultValue: '112-998-332' },
      { label: 'الرقم القومي للعميل', key: 'nationalId', placeholder: 'أدخل الرقم القومي للاستعلام الائتماني', defaultValue: '29812042100874' },
    ],
    agency: 'البنك المركزي المصري - الشركة المصرية للاستعلام الائتماني iScore'
  },
];

// Prepopulated Government databases mock to show instant, precise responses instead of dummy placeholders
const GOV_MOCK_DATABASE: Record<string, Record<string, any>> = {
  "courts": {
    "12345": {
      "caseNumber": "12345 لسنة 2026",
      "court": "محكمة الجيزة الابتدائية - الدائرة الثالثة عقاري",
      "status": "منظورة وجارية المعاينة",
      "nextSession": "2026-07-25",
      "subject": "نزاع تداخل مساحات وإثبات ملكية عقار العمرانية والورثة",
      "claimant": "سليم أحمد كمال وأخرون",
      "respondent": "الهيئة العامة للتطوير العقاري",
      "expertAssigned": "الخبير القضائي كابتن حسام"
    },
    "67890": {
      "caseNumber": "67890 لسنة 2025",
      "court": "محكمة شمال القاهرة الابتدائية",
      "status": "محجوزة للنطق بالحكم النهائي",
      "nextSession": "2026-08-01",
      "subject": "دعوى فرز وتجنيب حصص شائعة لعقار سكني بالعباسية",
      "claimant": "ميادة محمود الشوربجي",
      "respondent": "أحمد الشوربجي وشركاه",
      "expertAssigned": "مكتب خبراء وزارة العدل"
    }
  },
  "realestate": {
    "RE-001": {
      "registryNumber": "RE-001/GIZA",
      "propertyAddress": "عقار رقم 27 شارع الهرم الرئيسي، الجيزة",
      "owner": "أحمد محمد الجيزاوي",
      "area": "480 متر مربع",
      "buildingStatus": "مرخص بالكامل (بناء صب خرساني)",
      "legalRegistration": "مشهر مسجل برقم 44321 لسنة 2012 الشهر العقاري بالجيزة",
      "taxStatus": "خالص الضرائب العقارية حتى 2026"
    },
    "RE-002": {
      "registryNumber": "RE-002/CAIRO",
      "propertyAddress": "عقار رقم 15 شارع قصر النيل، القاهرة",
      "owner": "سارة علي السويركي",
      "area": "250 متر مربع",
      "buildingStatus": "عقار أثري قديم خاضع لقوانين الإيجار القديم",
      "legalRegistration": "مسجل بعقد بيع رضائي غير مشهر ومرفوع عنه صحة ونفاذ",
      "taxStatus": "مستحق عليه ضريبة عقارية متأخرة قدرها 4200 ج"
    }
  },
  "commercial": {
    "CR-77561": {
      "crNumber": "77561/GIZA",
      "companyName": "شركة تقادم للمحاماة والاستشارات القانونية والتحكيم",
      "legalForm": "شركة تضامن مهنية",
      "capital": "1,000,000 ج.م",
      "managers": "كابتن حسام ونخبة من خبراء القانون",
      "activity": "تقديم الاستشارات القضائية، التحكيم، الهندسة العقارية، وتصفية التركات",
      "status": "ساري ونشط بالكامل",
      "expiryDate": "2035-12-30"
    }
  },
  "civil": {
    "29812042100874": {
      "nationalId": "29812042100874",
      "fullName": "أحمد كمال السويركي",
      "birthDate": "1998-12-04",
      "birthPlace": "الجيزة - جمهورية مصر العربية",
      "jobTitle": "مهندس تطوير برمجيات نظم خبيرة",
      "religion": "مسلم",
      "maritalStatus": "متزوج",
      "address": "الدقي، الجيزة"
    }
  },
  "utilities": {
    "UT-9982": {
      "accountNumber": "UT-9982-POWER",
      "utilityProvider": "شركة جنوب القاهرة لتوزيع الكهرباء",
      "meterType": "عداد مسبق الدفع كارت ذكي",
      "currentBalance": "342.50 ج.م",
      "lastChargeDate": "2026-07-01",
      "averageConsumption": "120 كيلووات/شهرياً",
      "complianceCode": "COMP-EG-99"
    }
  },
  "housing": {
    "HS-5524": {
      "requestNumber": "HS-5524-GIZA",
      "applicant": "سعد الدين محمد البطل",
      "project": "الإسكان الاجتماعي - مشروع الـ 800 فدان بـ 6 أكتوبر",
      "unitDetails": "شقة رقم 12، الدور الثالث، عمارة 44 ب",
      "allocationStatus": "تم التخصيص وجاري إنهاء إجراءات التعاقد البنكي",
      "paidFees": "25,000 ج.م جدية حجز",
      "subsidyAmount": "60,000 ج.م دعم حكومي مباشر"
    }
  },
  "insurance": {
    "INS-44912": {
      "insuranceNumber": "INS-44912",
      "insuredName": "أحمد كمال السويركي",
      "currentEmployer": "شركة تقادم للتقنيات والنظم القضائية",
      "subscriptionDate": "2020-01-15",
      "basicSalary": "12,500 ج.م",
      "variableSalary": "4,500 ج.م",
      "status": "مؤمن عليه نشط ومسدد الاشتراكات"
    }
  },
  "health": {
    "MED-1102": {
      "fileNumber": "MED-1102-H",
      "beneficiary": "يارا أحمد كمال",
      "coverageZone": "محافظة بورسعيد - منظومة التأمين الصحي الشامل الموحدة",
      "bloodGroup": "O+ إيجابي",
      "chronicDiseases": "لا يوجد - حالة صحية ممتازة",
      "lastCheckup": "2026-05-10 بمستشفى بورسعيد العام",
      "subscriptionStatus": "مسدد بالكامل ضمن مساهمات الأسرة"
    }
  },
  "bank": {
    "112-998-332": {
      "customerId": "CUST-9982",
      "creditRating": "780 (امتياز - مخاطر منخفضة جداً)",
      "activeLoansCount": "0 قروض نشطة",
      "creditCardsLimit": "150,000 ج.م",
      "returnedCheques": "صفر شيكات مرتجعة خلال 5 سنوات",
      "inquiryConsent": "موافق بموجب طلب العميل الموثق إلكترونياً",
      "status": "تصنيف ائتماني ممتاز جاهز لتمويلات عقارية كبرى"
    }
  }
};

interface InquiryResult {
  found: boolean;
  data?: Record<string, any>;
  fee?: number;
  message?: string;
  serviceId?: ServiceType;
}

export default function InquiriesPage({ caseData }: InquiriesPageProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

  // Creative custom adjustment parameters
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [neonIntensity, setNeonIntensity] = useState<number>(100);
  const [agentProcessingSpeed, setAgentProcessingSpeed] = useState<number>(1200); // ms per step
  const [showTechTelemetry, setShowTechTelemetry] = useState<boolean>(true);

  // Auto populate values when a service is clicked to make testing incredibly pleasant
  const handleServiceClick = (service: Service) => {
    setIsSkeletonLoading(true);
    setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 750);

    setSelectedService(service);
    const initialForm: Record<string, string> = {};
    service.fields.forEach(field => {
      initialForm[field.key] = field.defaultValue || '';
    });
    setFormData(initialForm);
    setResult(null);
    setShowPayment(false);
    setPaid(false);
    setCurrentStep(0);
    setAgentLogs([]);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Agent Swarm Simulation sequence
  const handleInquiry = async () => {
    if (!selectedService) return;
    
    // Validate inputs
    for (const field of selectedService.fields) {
      if (!formData[field.key]?.trim()) {
        triggerToast(`يرجى إدخال ${field.label} للاستعلام`, 'warning');
        return;
      }
    }

    setIsProcessing(true);
    setResult(null);
    setShowPayment(false);
    setPaid(false);
    setCurrentStep(1);
    
    const logs = [
      `🤖 [وكيل التنسيق - Orchestrator] تم استلام طلب استعلام للخدمة: ${selectedService.label}`,
      `⚙️ [وكيل التنسيق] جاري فحص هيكل المدخلات ومطابقتها للمعايير والسياسات القانونية...`,
    ];
    setAgentLogs(logs);

    // Step 1: Orchestration & Policy Check
    await new Promise(resolve => setTimeout(resolve, agentProcessingSpeed));
    setCurrentStep(2);
    setAgentLogs(prev => [
      ...prev,
      `🔑 [وكيل التنسيق] تم تفويض الوكيل المختص بقاعدة بيانات: (${selectedService.agency})`,
      `📡 [وكيل الاتصال الحكومي] جاري تأمين قناة مشفرة (End-to-End SSL) للاتصال بوزارة العدل والشركاء...`,
      `🛰️ [وكيل الاتصال الحكومي] تم الربط الآمن وحقن الهوية المعتمدة للخبير القضائي: كابتن حسام.`
    ]);

    // Step 2: DB Query & Validation
    await new Promise(resolve => setTimeout(resolve, agentProcessingSpeed));
    setCurrentStep(3);
    setAgentLogs(prev => [
      ...prev,
      `🔍 [وكيل الفحص والتحقق] جاري عمل استعلام ومطابقة مع قواعد البيانات الحكومية للبحث عن المعرف الممرر...`,
      `📄 [وكيل الفحص والتحقق] جاري جلب السجلات وفك تشفير المستندات الرسمية المؤمنة ومطابقة الأرواق...`
    ]);

    // Step 3: Fee Generation & Processing
    await new Promise(resolve => setTimeout(resolve, agentProcessingSpeed));
    setCurrentStep(4);
    
    // Calculate simulated fee
    // Check if the input key value exists in our mock database
    const mainKeyField = selectedService.fields[0].key;
    const searchVal = formData[mainKeyField];
    
    // Check our government database
    const serviceDb = GOV_MOCK_DATABASE[selectedService.id];
    const foundData = serviceDb ? serviceDb[searchVal] : null;

    if (foundData) {
      // Simulate Government fee of 200 + 1% operating fee
      const govFee = Math.floor(100 + Math.random() * 300);
      const operatingFee = Math.round(govFee * 0.01 * 100) / 100;
      const totalFee = govFee + operatingFee;

      setAgentLogs(prev => [
        ...prev,
        `💰 [وكيل التقارير والتسعير] تم العثور على السجل المطابق!`,
        `💰 [وكيل التقارير والتسعير] تم احتساب الرسوم بنجاح: الرسوم الحكومية (${govFee} ج.م) + رسوم التشغيل 1% (${operatingFee} ج.م)`,
        `✅ [وكيل التنسيق] اكتمل استعلام السرب بنجاح وجاهز لعرض النتيجة والدفع المالي السريع.`
      ]);

      setResult({
        found: true,
        data: foundData,
        fee: totalFee,
        message: "تم العثور على السجل المطابق وجلب المستندات المؤمنة.",
        serviceId: selectedService.id
      });
      setShowPayment(true);
      triggerToast(`✅ عثر سرب الوكلاء على السجل! الرسوم المقررة: ${totalFee} ج.م`, 'success');
    } else {
      // If not in database, we can either simulate a dynamic successful retrieval or "no data" based on what is typed.
      // Let's make it so if they type anything else, we generate a beautifully detailed result anyway so they don't get stuck, 
      // but if they leave it default/specific we can play along!
      const randomGovFee = Math.floor(150 + Math.random() * 150);
      const operatingFee = Math.round(randomGovFee * 0.01 * 100) / 100;
      const totalFee = randomGovFee + operatingFee;

      const dynamicMockData: Record<string, string> = {
        "حالة السجل": "مسجل وجاري التدقيق الفني",
        "المعرف المستعلم عنه": searchVal,
        "تاريخ آخر تحديث": "2026-07-01",
        "ملاحظات": "تم الاستعلام الفوري من خلال سحابة النظم القضائية الرقمية بنجاح."
      };

      setAgentLogs(prev => [
        ...prev,
        `💡 [وكيل الفحص والتحقق] لم يتم العثور على المعرف الافتراضي في الأرشيف القديم. تم التوجيه تلقائياً لقاعدة البيانات الموسعة...`,
        `💰 [وكيل التقارير والتسعير] تم جلب البيانات وتوليد الرسوم بنجاح!`,
        `✅ [وكيل التنسيق] تم جلب بيانات السجل بنجاح من قاعدة البيانات الاحتياطية الموحدة.`
      ]);

      setResult({
        found: true,
        data: dynamicMockData,
        fee: totalFee,
        message: "تم العثور على البيانات في السجل الموحد البديل.",
        serviceId: selectedService.id
      });
      setShowPayment(true);
      triggerToast(`✅ عثر سرب الوكلاء على البيانات! الرسوم المقررة: ${totalFee} ج.م`, 'success');
    }

    setIsProcessing(false);
  };

  const handlePayment = async () => {
    if (!result || !result.fee) return;
    
    setIsProcessing(true);
    setAgentLogs(prev => [
      ...prev,
      `💳 [بوابة الدفع الإلكتروني] جاري محاكاة عملية الدفع الآمن لمبلغ ${result.fee} ج.م...`,
      `🔒 [بوابة الدفع] تم تفويض العملية بنجاح وخصم الرسوم بنجاح.`
    ]);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPaid(true);
    setShowPayment(false);
    setIsProcessing(false);
    
    setAgentLogs(prev => [
      ...prev,
      `📥 [وكيل التنسيق] تم تأكيد استلام الدفع المالي وتصفية الرسوم.`,
      `📄 [وكيل التقارير والتسعير] جاري توليد وتحميل الشهادة الرسمية المشفرة والمزودة بختم النسر والـ QR الكودي...`,
      `✨ [سرب الوكلاء] تم توثيق المستند بنجاح وجاهز للطباعة والتحميل الآن كملف رسمي معتمد!`
    ]);
    
    triggerToast(`💳 تم سداد ${result.fee} ج.م بنجاح! الشهادة جاهزة للتحميل الآن.`, 'success');
  };

  const goBack = () => {
    setSelectedService(null);
    setFormData({});
    setResult(null);
    setShowPayment(false);
    setPaid(false);
    setCurrentStep(0);
    setAgentLogs([]);
  };

  // Generate a mock PDF/Text Certificate Download
  const handleDownloadDocument = () => {
    if (!selectedService || !result || !result.data) return;
    
    const title = `شهادة استعلام حكومية معتمدة - ${selectedService.label}`;
    const divider = "=========================================================";
    const stamp = "★ وزارة العدل المصرية - قطاع التحول الرقمي والتطوير التقني ★";
    const expert = "الخبير القضائي المعتمد: كابتن حسام";
    const certCode = `CERT-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    
    let content = `${title}\n${divider}\n`;
    content += `كود الشهادة المعتمد: ${certCode}\n`;
    content += `تاريخ الاستعلام الفوري: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}\n`;
    content += `الجهة المصدرة للخدمة: ${selectedService.agency}\n`;
    content += `${expert}\n${divider}\n\n`;
    content += `البيانات الرسمية المستخلصة من قاعدة البيانات الحكومية:\n`;
    
    Object.entries(result.data).forEach(([key, val]) => {
      content += `- ${key}: ${val}\n`;
    });
    
    content += `\n${divider}\n`;
    content += `حالة السداد والرسوم: تم دفع الرسوم المقررة بالكامل (${result.fee} ج.م)\n`;
    content += `الحالة القانونية: مستند رسمي معتمد ومحمي بتشفير سرب الوكلاء القضائي.\n`;
    content += `\n${stamp}\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedService.id}-authenticated-certificate.txt`;
    link.click();
    
    triggerToast('📥 تم تحميل الشهادة المعتمدة بنجاح كملف نصي موثق!', 'success');
  };

  return (
    <div 
      className="w-full text-right p-1 transition-all duration-300"
      dir="rtl"
    >
      {/* 🛠️ Cyber Control Panel (Interactive Sidebar Adjuster) - Absolute floating block on widescreen */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500"></div>
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <h4 className="text-white text-xs font-black">لوحة التحكم التفاعلية والمحاكاة (من كابتن حسام)</h4>
            <span className="text-[10px] text-slate-500 font-bold">تحكم بحجم عرض الواجهة وتأثيرات نيون لراحة عين المستشارين</span>
          </div>
        </div>

        {/* Adjusters grid */}
        <div className="flex items-center gap-6 flex-wrap text-xs">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850">
            <span className="text-slate-400 font-bold">🔍 تكبير الشاشة:</span>
            <input 
              type="range" 
              min="0.8" 
              max="1.2" 
              step="0.05"
              value={zoomFactor} 
              onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400 cursor-ew-resize bg-slate-800 h-1 rounded-lg"
            />
            <span className="text-cyan-400 font-mono font-black text-[11px] w-10 text-center">
              {Math.round(zoomFactor * 100)}%
            </span>
          </div>

          {/* Neon Glow Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850">
            <span className="text-slate-400 font-bold">✨ شدة النيون:</span>
            <input 
              type="range" 
              min="30" 
              max="150" 
              value={neonIntensity} 
              onChange={(e) => setNeonIntensity(parseInt(e.target.value))}
              className="w-24 accent-purple-500 cursor-ew-resize bg-slate-800 h-1 rounded-lg"
            />
            <span className="text-purple-400 font-mono font-black text-[11px] w-8 text-center">
              {neonIntensity}%
            </span>
          </div>

          {/* Processing Speed Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850">
            <span className="text-slate-400 font-bold">⚡ سرعة السرب:</span>
            <select
              value={agentProcessingSpeed}
              onChange={(e) => setAgentProcessingSpeed(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-cyan-400 text-[11px] rounded px-1.5 py-0.5 font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="600">فائق السرعة (0.6 ثانية)</option>
              <option value="1200">قياسي (1.2 ثانية)</option>
              <option value="2500">مفصل بالكامل (2.5 ثانية)</option>
            </select>
          </div>

          {/* Telemetry Toggle */}
          <button
            type="button"
            onClick={() => setShowTechTelemetry(!showTechTelemetry)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showTechTelemetry 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-slate-950 border-slate-850 text-slate-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showTechTelemetry ? 'إخفاء التيليميتري' : 'عرض البيانات الفنية'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Scaled dynamically via slider */}
      <div 
        style={{ 
          transform: `scale(${zoomFactor})`, 
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
          boxShadow: `0 0 ${neonIntensity * 0.2}px rgba(59, 130, 246, ${neonIntensity / 400})`
        }}
        className="bg-[#0b0f24] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative"
      >
        {/* Holographic grid and plexus dots inside header and canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        
        {/* Top Header Plate with Glowing Logo */}
        <div className="bg-[#070b1e] border-b border-slate-800/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500 to-purple-500 opacity-60"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] relative border border-cyan-400/40">
              <Search className="w-6 h-6 text-white" />
              <div className="absolute -inset-1 rounded-xl border border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>
            <div className="text-right">
              {/* Glowing header title matching the image plate exactly */}
              <div className="inline-block px-6 py-1 bg-gradient-to-l from-cyan-950/80 via-indigo-900/60 to-transparent border border-cyan-500/40 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.1)] mb-1">
                <h1 className="text-cyan-400 font-black text-lg md:text-xl tracking-wide font-sans">
                  منصة الاستعلامات الذكية والموحدة
                </h1>
              </div>
              <p className="text-slate-400 text-[11px] font-bold">الربط المباشر بسرب الوكلاء المعنيين بوزارة العدل والجهات الحكومية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-[#121a36] text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.1)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>سرب الوكلاء الذكي (Agent Swarm Live)</span>
            </span>
          </div>
        </div>

        {/* Horizontal Navigation Tabs matching the provided image */}
        <div className="bg-[#090e21] border-b border-slate-800/40 px-5 py-3.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-slate-500 text-[10px] font-bold shrink-0 ml-2">وصول سريع للتصنيفات:</span>
          
          {/* Green tab */}
          <button
            type="button"
            onClick={() => handleServiceClick(services.find(s => s.id === 'utilities')!)}
            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-400 cursor-pointer shadow-sm"
          >
            <span>🟢</span>
            <span>استعلام المرافق</span>
          </button>

          {/* Orange/Red tab */}
          <button
            type="button"
            onClick={() => handleServiceClick(services.find(s => s.id === 'courts')!)}
            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 cursor-pointer shadow-sm"
          >
            <span>⚖️</span>
            <span>استعلام القضايا والمحاكم</span>
          </button>

          {/* Yellow tab */}
          <button
            type="button"
            onClick={() => handleServiceClick(services.find(s => s.id === 'civil')!)}
            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 cursor-pointer shadow-sm"
          >
            <span>🆔</span>
            <span>استعلام الأحوال المدنية</span>
          </button>

          {/* Cyan/Teal tab */}
          <button
            type="button"
            onClick={() => handleServiceClick(services.find(s => s.id === 'commercial')!)}
            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 cursor-pointer shadow-sm"
          >
            <span>🏢</span>
            <span>استعلام السجل التجاري</span>
          </button>

          {/* Gray/Slate tab */}
          <button
            type="button"
            onClick={() => handleServiceClick(services.find(s => s.id === 'realestate')!)}
            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 bg-slate-700/20 hover:bg-slate-700/30 border border-slate-600/30 text-slate-300 cursor-pointer shadow-sm"
          >
            <span>📜</span>
            <span>استعلام الشهر العقاري</span>
          </button>
        </div>

        {/* Layout Grid: Right Sidebar + Center Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] select-none">
          
          {/* ==================== RIGHT SIDEBAR: Futuristic Metallic Buttons matching image ==================== */}
          <div className="lg:col-span-3 bg-[#080c1f] border-l border-slate-800/50 p-4 space-y-3 flex flex-col justify-start">
            <span className="text-slate-500 text-[10px] font-extrabold tracking-widest uppercase block border-b border-slate-850 pb-2 mb-2 text-right">
              الجهات الحكومية والائتمانية
            </span>

            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceClick(service)}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-center gap-3 relative group overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white' 
                      : 'bg-[#101633]/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-[#151c42] hover:border-slate-800'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 10px rgba(6, 182, 212, ${neonIntensity / 200})` : 'none'
                  }}
                >
                  {/* Neon Cyan left active indicator strip */}
                  {isSelected && (
                    <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-cyan-400 animate-pulse"></div>
                  )}

                  <div className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#060a1a] text-slate-500'
                  }`}>
                    {service.icon}
                  </div>

                  <div className="flex flex-col text-right">
                    <span className={`text-xs font-black ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {service.label}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-bold mt-1 group-hover:text-slate-400 truncate max-w-[160px]">
                      {service.agency}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ==================== CENTER WORKSPACE PANEL ==================== */}
          <div className="lg:col-span-9 p-6 flex flex-col justify-between bg-[#0e132e]/40 relative">
            
            {isSkeletonLoading ? (
              /* SKELETON LOADING STRUCTURE FOR INQUIRIES */
              <div className="flex-grow flex flex-col justify-between h-full space-y-6 animate-pulse text-right">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="w-32 h-8 bg-slate-800/40 rounded-xl"></div>
                  <div className="flex items-center gap-3">
                    <div className="text-right space-y-2">
                      <div className="w-36 h-4 bg-slate-800/40 rounded"></div>
                      <div className="w-52 h-3 bg-slate-850/45 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 bg-[#0b0f24]/80 border border-slate-800/60 p-5 rounded-2xl space-y-5">
                    <div className="w-44 h-3 bg-slate-800/40 rounded"></div>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="w-24 h-3 bg-slate-850/40 rounded"></div>
                        <div className="w-full h-10 bg-slate-950/80 rounded-xl border border-slate-900/60"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-28 h-3 bg-slate-850/40 rounded"></div>
                        <div className="w-full h-10 bg-slate-950/80 rounded-xl border border-slate-900/60"></div>
                      </div>
                    </div>
                    <div className="pt-4 flex items-center gap-3">
                      <div className="w-full h-11 bg-slate-800/30 rounded-xl"></div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#070a1a]/80 border border-slate-800/65 p-4 rounded-2xl h-full flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div className="w-36 h-4 bg-slate-800/40 rounded"></div>
                      <div className="w-24 h-4 bg-slate-850/40 rounded"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <div className="h-8 bg-slate-900/50 rounded-lg"></div>
                      <div className="h-8 bg-slate-900/50 rounded-lg"></div>
                      <div className="h-8 bg-slate-900/50 rounded-lg"></div>
                      <div className="h-8 bg-slate-900/50 rounded-lg"></div>
                    </div>
                    <div className="w-full h-40 bg-slate-950/80 rounded-xl border border-slate-900/60"></div>
                  </div>
                </div>

                <div className="w-full h-16 bg-slate-900/40 rounded-2xl border border-slate-850/50"></div>
              </div>
            ) : !selectedService ? (
              /* LANDING SCREEN: Authentically matches the uploaded image card layout */
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Descriptive Center Card with Plexus-like cyber art on left, text on right */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 border border-slate-200 select-text">
                  
                  {/* Blue digital circuit pattern on the left of the white card */}
                  <div className="w-full md:w-1/3 h-56 bg-gradient-to-br from-[#0b0f24] to-[#121a36] rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800 shrink-0 shadow-inner">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-25"></div>
                    <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-cyan-500/20 blur-xl"></div>
                    <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-purple-500/20 blur-xl"></div>
                    
                    {/* Glowing schematic constellation lines */}
                    <div className="relative text-center z-10 space-y-2">
                      <Cpu className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-mono block">SECURE DATABASE ACCESS</span>
                      <span className="text-xs text-white font-extrabold px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800">
                        كود المشغل: كابتن حسام
                      </span>
                    </div>
                  </div>

                  {/* Descriptions matching the uploaded image exactly */}
                  <div className="flex-1 text-right text-xs leading-relaxed text-slate-800 space-y-4 font-semibold">
                    
                    {/* Row 1 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">📜 خدمات استعلام التوثيق والشهر العقاري:</strong>
                        وتتضمن تحرير توكيلات (مثل التوكيل العام للقضايا)، والتوكيل الرسمي الشامل، وإقرارات، وعقود بيع وتوثيقها بشكل رسمي مميكن.
                      </p>
                    </div>

                    {/* Row 2 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">🏢 خدمات استعلام السجل التجاري:</strong>
                        تشمل طلب مستخرج سجل تجاري قائم، تجديد القيد بالسجل، طلب شهادة بيانات المنشأة، أو الاستعلام المباشر عن سجل شركتك وتراخيصها.
                      </p>
                    </div>

                    {/* Row 3 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">🆔 خدمات استعلام الأحوال المدنية:</strong>
                        تتيح للمواطنين والخبراء استعلام وتجديد بطاقة الرقم القومي (بدل فاقد أو تالف)، بالإضافة لاستخراج صور رسمية من شهادات الميلاد والوفاة والزواج والطلاق المميكنة.
                      </p>
                    </div>

                    {/* Row 4 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">⚖️ خدمات استعلام القضايا والمحاكم (عدالة مصر الرقمية):</strong>
                        مثل الاستعلام الفوري عن بيانات دعوى مسجلة، إقامة دعاوى مدنية على الشيوع، تسجيل الوكالات القضائية للمحامين، والاطلاع على منطوق الحكم.
                      </p>
                    </div>

                    {/* Row 5 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">🟢 خدمات استعلام المرافق والعدادات:</strong>
                        تتضمن خدمات الكهرباء القابضة (مثل الاستعلام الفوري عن الفواتير وتقديم قراءات العدادات المعطلة) ومياه الشرب والغاز الطبيعي.
                      </p>
                    </div>

                    {/* Row 6 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">🏠 خدمات استعلام الإسكان الاجتماعي:</strong>
                        الاستعلام عن شقق الإسكان الاجتماعي، والتقديم على طلبات الدعم، ومتابعة تخصيص وحدات السكن البديل والتمويل العقاري للمنتفعين.
                      </p>
                    </div>

                    {/* Row 7 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 shadow-sm transition-all hover:bg-slate-100/50">
                      <p className="leading-relaxed">
                        <strong className="text-[#101633] font-black text-xs block mb-1">✨ خدمات أخرى واستعلامات ائتمانية متقدمة:</strong>
                        تشمل الاستعلام عن التأمينات الاجتماعية والاشتراك الساري، خدمات التأمين الصحي الشامل، بالإضافة لخدمة الاستعلام البنكي الائتماني (iScore) الموحد.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Helpful Tip Footer */}
                <div className="mt-6 p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-2xl text-slate-300 text-xs flex items-center gap-3">
                  <span className="text-cyan-400 text-lg animate-bounce">💡</span>
                  <p className="font-semibold leading-relaxed">
                    <strong className="text-cyan-400">نصيحة الخبير:</strong> اختر أي جهة حكومية من القائمة الجانبية أو الأزرار العلوية، وقم بتعبئة البيانات. سيقوم <strong className="text-white">سرب الوكلاء الذكي</strong> بمخاطبة الخادم الخلفي وتنسيق الطلب لإعادة النتيجة مع تفاصيل رسوم التصفية الحكومية مشمولة بـ (1% رسوم تشغيل النظام المعتمد).
                  </p>
                </div>
              </div>
            ) : (
              /* ACTIVE SERVICE INTERACTIVE SEARCH FORM SCREEN */
              <div className="flex-grow flex flex-col justify-between h-full space-y-6">
                
                {/* Form header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <button 
                    onClick={goBack}
                    className="flex items-center gap-1.5 text-cyan-400 font-bold hover:text-cyan-300 transition-colors text-xs bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>الرجوع للخدمات</span>
                  </button>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                      <h2 className="text-white text-base font-black flex items-center gap-1.5">
                        <span className="text-cyan-400">◀</span>
                        <span>{selectedService.label}</span>
                      </h2>
                      <span className="text-slate-400 text-[10px] font-bold block">{selectedService.agency}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields & Live Telemetry Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Fields input form */}
                  <div className="lg:col-span-7 bg-[#0b0f24] border border-slate-800/80 p-5 rounded-2xl space-y-4">
                    <span className="text-cyan-400 text-[10px] font-extrabold block border-b border-slate-850 pb-1.5">تعبئة بيانات الاستعلام المطلوبة:</span>
                    
                    {selectedService.fields.map((field) => (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-slate-300 text-xs font-bold">{field.label}:</label>
                        <input
                          type="text"
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none transition-all shadow-inner"
                          disabled={isProcessing || paid}
                        />
                      </div>
                    ))}

                    {/* Action buttons */}
                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleInquiry}
                        disabled={isProcessing || paid}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black py-3 px-5 rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs cursor-pointer"
                        style={{
                          boxShadow: `0 4px 15px rgba(6, 182, 212, ${neonIntensity / 300})`
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            <span>جاري معالجة السرب...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4.5 h-4.5" />
                            <span>بدء الاستعلام الذكي والسداد</span>
                          </>
                        )}
                      </button>

                      {showPayment && result && result.found && (
                        <button
                          type="button"
                          onClick={handlePayment}
                          disabled={paid}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs cursor-pointer"
                        >
                          <CreditCard className="w-4.5 h-4.5" />
                          <span>دفع رسوم التصفية ({result.fee} ج.م)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right side: Live Swarm Processing Telemetry */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div className="bg-[#070a1a] border border-slate-850 p-4 rounded-2xl h-full flex flex-col justify-between space-y-3">
                      
                      {/* Telemetry Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                          <span>سجل معالجة السرب الذكي</span>
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded animate-pulse">
                          SWARM_LIVE_FEED
                        </span>
                      </div>

                      {/* Progression Steps */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-black">
                        <div className={`p-1.5 rounded-lg border ${
                          currentStep >= 1 ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-400' : 'bg-slate-900/50 border-slate-850 text-slate-600'
                        }`}>
                          <span>1. التنسيق</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${
                          currentStep >= 2 ? 'bg-purple-950/80 border-purple-500/60 text-purple-400' : 'bg-slate-900/50 border-slate-850 text-slate-600'
                        }`}>
                          <span>2. الربط</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${
                          currentStep >= 3 ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-400' : 'bg-slate-900/50 border-slate-850 text-slate-600'
                        }`}>
                          <span>3. البحث</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${
                          currentStep >= 4 ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400' : 'bg-slate-900/50 border-slate-850 text-slate-600'
                        }`}>
                          <span>4. التسعير</span>
                        </div>
                      </div>

                      {/* Live streaming terminal logs */}
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 h-44 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 leading-relaxed scrollbar-thin text-right relative overflow-hidden">
                        {isProcessing && (
                          <div className="absolute inset-x-0 top-0 h-full bg-cyan-500/5 pointer-events-none flex flex-col justify-between">
                            <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.9)]"></div>
                          </div>
                        )}
                        {agentLogs.length === 0 ? (
                          <div className="text-slate-600 text-center py-10">
                            <span>بانتظار بدء الاستعلام لتفعيل السرب القضائي...</span>
                          </div>
                        ) : (
                          agentLogs.map((log, idx) => (
                            <div key={idx} className="border-b border-slate-900/50 pb-1 text-right">
                              {log}
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>

                </div>

                {/* Display Results & Document Generator */}
                {result && (
                  <div className={`p-5 rounded-2xl border-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-right ${
                    result.found 
                      ? 'bg-emerald-950/30 border-emerald-500/40' 
                      : 'bg-red-950/30 border-red-500/40'
                  }`}>
                    
                    <div className="flex items-center gap-2 font-black text-sm text-white mb-3">
                      {result.found ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                          <span>✅ تم العثور على السجلات الحكومية بنجاح</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400" />
                          <span>❌ عذراً، لم يتم العثور على بيانات مطابقة</span>
                        </>
                      )}
                    </div>

                    {result.found && result.data && (
                      <div className="space-y-4">
                        <div className="bg-slate-950/90 border border-slate-850 rounded-xl p-4 overflow-x-auto text-xs text-slate-200">
                          <div className="mb-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-right flex justify-between items-center flex-wrap gap-2">
                            <div className="text-left">
                              <span className="text-[10px] text-slate-500 font-bold block">الرقم المرجعي للمعاملة:</span>
                              <span className="text-slate-300 font-mono text-xs font-bold">TXN-2026-94821</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 font-bold block">تاريخ ووقت المعاملة:</span>
                              <span className="text-amber-400 font-mono text-xs font-bold">2026/07/07 - 14:35:12</span>
                            </div>
                          </div>

                          <span className="text-cyan-400 font-extrabold block mb-2 text-right border-b border-slate-900 pb-1.5">
                            البيانات المسترجعة من الخادم (FastAPI - Agent Swarm):
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-right font-semibold">
                            {Object.entries(result.data).map(([key, val]) => (
                              <div key={key} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
                                <span className="text-slate-400 text-[11px]">{key}:</span>
                                <span className="text-white font-black text-xs font-mono">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fee break-down */}
                        <div className="text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span>الرسوم المطلوبة:</span>
                            <span className="text-emerald-400 font-mono font-black text-sm">{result.fee} ج.م</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            (تشتمل على الرسوم المعتمدة للجهة الحكومية + 1% مصاريف المعالجة التقنية لسمارت إكسبيرت)
                          </span>
                        </div>
                      </div>
                    )}

                    {!result.found && (
                      <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                        {result.message || 'يرجى مراجعة المدخلات والمحاولة مرة أخرى. يمكنك استخدام القيم الافتراضية للتجربة السريعة.'}
                      </p>
                    )}

                    {/* Post Payment download button */}
                    {paid && (
                      <div className="mt-4 p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-black text-xs block">✨ تم سداد الرسوم وحقن التوثيق الكودي بنجاح!</span>
                          <p className="text-slate-300 text-[11.5px] font-semibold leading-relaxed">
                            تم إصدار الوثيقة الرقمية المؤمنة بختم النسر والـ QR ومتاحة للتحميل الفوري كملف معتمد لاستخدامه في تقرير المعاينة القضائية.
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleDownloadDocument}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/10"
                        >
                          <Download className="w-4 h-4" />
                          <span>تحميل الشهادة المعتمدة</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* المحددات القانونية والمؤشرات الاستثمارية للعقار (انتقلت هنا بناء على طلب المستخدم) */}
        <div id="legal-and-financial-metrics" className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3.5 mx-6 mb-6 text-right">
          <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>المحددات القانونية والمؤشرات الاستثمارية للعقار</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Rent Box (الإيجار) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-slate-200 text-xs font-black">العائد ونظام الإيجار</span>
              </div>
              <div>
                <span className="text-white text-sm font-black block font-mono">
                  {caseData?.annualRent ? `${caseData.annualRent.toLocaleString('ar-EG')} ج / سنوياً` : '١٤٤,٠٠٠ ج / سنوياً'}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold mt-1 block">
                  {(!caseData || caseData.annualRent > 0) ? '✓ عائد معتمد قانون جديد' : '✓ شاغل بالكامل تمليك'}
                </span>
              </div>
            </div>

            {/* Ownership Box (التمليك) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-slate-200 text-xs font-black">وضع الملكية والحيازة</span>
              </div>
              <div>
                <span className="text-white text-xs font-black block truncate">
                  {caseData?.dispute?.type === 'inheritance' ? 'إرث شرعي وحصر تركات' : 'عقد ملكية نهائي مسجل'}
                </span>
                <span className="text-blue-400 text-[10px] font-bold mt-1 block">
                  ✓ مسجل مطهّر من الديون
                </span>
              </div>
            </div>

            {/* New Law Box (القانون الجديد) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-slate-200 text-xs font-black">توافق القانون الجديد</span>
              </div>
              <div>
                <span className="text-white text-[11px] font-black block leading-snug">
                  القانون رقم ١٠ لسنة ٢٠٢٢
                </span>
                <span className="text-amber-400 text-[9px] font-bold mt-1 block leading-relaxed">
                  ✓ متوافق مع تعديلات إخلاء العين وقواعد زيادة الأجر
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Telemetry logs at the bottom */}
        {showTechTelemetry && (
          <div className="bg-[#050817] border-t border-slate-800/60 px-5 py-3 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-cyan-500">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                API GATEWAY: ONLINE
              </span>
              <span>|</span>
              <span>FASTAPI BACKEND: SIMULATED SECURE HOST</span>
              <span>|</span>
              <span>DATABASE CONNECTIONS: 9/9 SECURE</span>
            </div>
            <div>
              <span>مطور النظام: كابتن حسام • تليفون: 01127913358</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

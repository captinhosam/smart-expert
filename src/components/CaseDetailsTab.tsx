import React, { useState, useRef, useEffect } from 'react';
import { CaseData, Heir } from '../types';
import { 
  Building2, 
  Trash2, 
  UserPlus, 
  Users, 
  Coins, 
  AlertTriangle, 
  FileCheck,
  Percent,
  TrendingUp,
  Landmark,
  Calendar,
  Clock,
  Plus,
  Bell,
  Gavel,
  Camera,
  FileText,
  Mic,
  MicOff,
  Upload,
  ArrowLeft,
  Smartphone,
  Eye,
  Settings,
  Shield,
  Layers,
  MapPin,
  Map,
  Scale,
  Sparkles,
  RefreshCw,
  Video,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateAll } from '../utils/calculations';
import FieldCameraTab from './FieldCameraTab';
import DocumentsGuidePanel from './DocumentsGuidePanel';
import { triggerToast } from '../lib/toast';
import { SAMPLE_LOCATIONS } from '../data/expertSystemData';
import ComplianceTrends from './ComplianceTrends';
import AreaRegistry from './AreaRegistry';

const DICTATION_PRESETS: Record<string, string> = {
  ownership: "أنا بصفتي وكيلاً عن المدعي، أثبت أن الأرض الكائنة بشارع الهرم هي ملك خالص لموكلي بموجب عقد البيع المشهر رقم ٢٤٠٥ لسنة ٢٠١٢، والخصم يضع يده عليها دون وجه حق أو سند قانوني صحيح، ونطالب بطرده وتسليم الأرض خالية.",
  boundary: "أقر أنا المهندس الخبير المعاين بوجود تداخل في الحدود الشمالية لقطعة الأرض بمساحة قدرها ٤٥ متراً مربعاً دخلت في حيازة الجار بطريق الخطأ أثناء البناء، ونوصي بإعادة ترسيم الحدود طبقاً للخرائط الرسمية الصادرة من الهيئة العامة للمساحة المصرية.",
  inheritance: "نحن ورثة المرحوم الحاج أحمد كمال، نطالب بفرز وتجنيب حصصنا الشرعية في العقار والتركة المورثة. حيث ترفض الزوجة تسليم البنات نصيبهن الشرعي وتستأثر بريع العقار بالكامل منذ سنتين، ونطالب بندب خبير حسابي لتصفية الريع وحساب الأنصبة.",
  contract: "بصفتي المستأجر للعين السكنية منذ عام ١٩٩٤، أقر بدفع القيمة الإيجارية بانتظام بموجب قانون الإيجار القديم، ويرفض المالك استلام الإيجار لكي يتمكن من رفع دعوى طرد، وقد قمنا بإيداع الأجرة بخزينة المحكمة بانتظام."
};

interface CaseDetailsTabProps {
  caseData: CaseData;
  onUpdateCaseData: (data: Partial<CaseData>) => void;
  theme?: 'dark' | 'paper';
}

export default function CaseDetailsTab({ caseData, onUpdateCaseData, theme }: CaseDetailsTabProps) {
  const [subTab, setSubTab] = useState<'profile' | 'camera' | 'documents'>('profile');
  const [isDisputeGuideOpen, setIsDisputeGuideOpen] = useState(false);
  const [isDisputeDropdownOpen, setIsDisputeDropdownOpen] = useState(false);
  const [expandedDisputeSections, setExpandedDisputeSections] = useState<Record<string, boolean>>({
    property: false,
    contracts: false,
    rents: false,
    construction: false,
    handling: false,
    importance: false,
    ending: false
  });

  const toggleDisputeSection = (section: string) => {
    setExpandedDisputeSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Expose local file list for previewing uploaded documents
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, size: string, type: string}[]>([
    { name: 'إعلام_وراثة_رسمي.pdf', size: '2.4 MB', type: 'عقد شرعي' },
    { name: 'عقد_البيع_المشهر.pdf', size: '4.1 MB', type: 'سند ملكية' }
  ]);

  // Handle Voice Dictation
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording and insert preset text
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
      
      const presetType = caseData.dispute.type || 'ownership';
      const speechText = DICTATION_PRESETS[presetType] || "تم تسجيل الإفادة الصوتية للمعاينة بنجاح.";
      
      onUpdateCaseData({
        dispute: {
          ...caseData.dispute,
          details: (caseData.dispute.details ? caseData.dispute.details + "\n" : "") + "🎙️ [إفادة صوتية مسجلة]: " + speechText
        }
      });
      triggerToast('🎙️ تم تحويل التسجيل الصوتي إلى نص عربي فصيح بنجاح!', 'success');
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingSeconds(0);
      triggerToast('🔴 جاري تسجيل الصوت الآن... تحدث بوضوح', 'info');
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Handle Drag & Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const newDocs = fileList.map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: f.type || 'مستند مضاف'
      }));
      setUploadedDocs(prev => [...prev, ...newDocs]);
      triggerToast(`📁 تم رفع ${files.length} مستندات بنجاح للملف القضائي`, 'success');
    }
  };

  // Pre-fill client default values if they don't exist
  const clientName = caseData.clientName || 'أحمد كمال عبد العال';
  const clientNationalId = caseData.clientNationalId || '29605120102345';
  const clientBirthDate = caseData.clientBirthDate || '1996-05-12';
  const clientJob = caseData.clientJob || 'مهندس برمجيات حر';
  const clientPhone = caseData.clientPhone || '01012345678';
  const clientEmail = caseData.clientEmail || 'ahmed.kamal@giza-justice.gov';
  const clientAddress = caseData.clientAddress || 'شقة ٤، عقار ٢٥ شارع النزهة، الدقي، الجيزة';

  const propertyType = caseData.propertyType || 'apartment';
  const landUnit = caseData.landUnit || 'متر';
  const landZamam = caseData.landZamam || 'زمام';
  const landPieceNum = caseData.landPieceNum || '٤١٢';
  const landBasinNum = caseData.landBasinNum || 'حوض الجبل ٢';
  const landSectionNum = caseData.landSectionNum || 'القسم الثالث';
  const landOwnershipType = caseData.landOwnershipType || 'ملكية خاصة';
  
  const apartmentAddress = caseData.apartmentAddress || 'عقار رقم ٢٧ شارع شبين الكوم، العمرانية الغربية، الجيزة';
  const apartmentFloorAndNumber = caseData.apartmentFloorAndNumber || 'الدور الثالث - شقة رقم ٦';
  const apartmentAreaSqm = caseData.apartmentAreaSqm || 135;
  const apartmentRelationType = caseData.apartmentRelationType || 'inheritance';

  const results = calculateAll(caseData);
  const sessions = caseData.sessions || [];
  const todayStr = "2026-07-01";
  const upcomingSessions = sessions
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextSession = upcomingSessions[0];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Sub-Tab navigation header */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 gap-1" id="case-details-subtabs">
        <button
          type="button"
          onClick={() => setSubTab('profile')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${subTab === 'profile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>📋 النموذج الديناميكي لبيانات النزاع (صفحة ٢)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('documents')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${subTab === 'documents' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <FileText className={`w-4 h-4 ${subTab === 'documents' ? 'text-slate-950' : 'text-slate-400'}`} />
          <span>📄 دليل المستندات والتحقق</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('camera')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${subTab === 'camera' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <Camera className={`w-4 h-4 ${subTab === 'camera' ? 'text-slate-950' : 'text-slate-400'}`} />
          <span>📸 الكاميرا الميدانية والوسم التلقائي</span>
        </button>
      </div>

      {subTab === 'camera' ? (
        <div className="animate-in fade-in duration-200">
          <FieldCameraTab 
            caseData={caseData} 
            onUpdateCaseData={onUpdateCaseData} 
          />
        </div>
      ) : subTab === 'documents' ? (
        <div className="animate-in fade-in duration-200">
          <DocumentsGuidePanel />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* RIGHT SIDE: Dynamic Form (span 7 or 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION 1: Client Basic Details (ثابتة) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                <span>القسم الأول: بيانات المستخدم الأساسية وصاحب الدعوى (ثابتة)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">الاسم الثلاثي أو بالكامل</label>
                  <input 
                    type="text"
                    value={clientName}
                    onChange={e => onUpdateCaseData({ clientName: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">الرقم القومي (١٤ رقم)</label>
                  <input 
                    type="text"
                    maxLength={14}
                    value={clientNationalId}
                    onChange={e => onUpdateCaseData({ clientNationalId: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">تاريخ الميلاد</label>
                  <input 
                    type="date"
                    value={clientBirthDate}
                    onChange={e => onUpdateCaseData({ clientBirthDate: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">المهنة الحالية</label>
                  <input 
                    type="text"
                    value={clientJob}
                    onChange={e => onUpdateCaseData({ clientJob: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">رقم الهاتف المحمول</label>
                  <input 
                    type="text"
                    value={clientPhone}
                    onChange={e => onUpdateCaseData({ clientPhone: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">البريد الإلكتروني الموثق</label>
                  <input 
                    type="email"
                    value={clientEmail}
                    onChange={e => onUpdateCaseData({ clientEmail: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col md:col-span-3 gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">العنوان السكني بالكامل</label>
                  <textarea 
                    rows={1}
                    value={clientAddress}
                    onChange={e => onUpdateCaseData({ clientAddress: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Dynamic Property & Dispute Trigger Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Layers className="w-5 h-5 text-amber-500 shrink-0" />
                <span>القسم الثاني: محرك العقار الذكي ونوع النزاع (المُحرك الديناميكي)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">تحديد تصنيف ونوع العقار المتنازع عليه</label>
                  <select 
                    value={propertyType}
                    onChange={e => onUpdateCaseData({ propertyType: e.target.value as any })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white text-xs font-black focus:outline-none transition-all"
                  >
                    <option value="land">🏜️ أرض (فضاء - زراعية - صحراوية - مبنية)</option>
                    <option value="apartment">🏠 وحدة سكنية (شقة - فيلا - دور سكني)</option>
                    <option value="commercial">🏢 عقار تجاري (محل - مخزن - مكتب إداري)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-slate-400 text-[11px] font-bold">توجيه المحكمة للموضوع والخصومة (نوع النزاع)</label>
                  
                  {/* Custom Dropdown Trigger Card */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDisputeDropdownOpen(!isDisputeDropdownOpen)}
                      className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-amber-500/50 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white text-xs font-black transition-all cursor-pointer text-right"
                    >
                      <span className="flex items-center gap-2">
                        {caseData.dispute.type === 'inheritance' && '⚖️ إرث / ميراث (تركة شرعية وتصفية أنصبة)'}
                        {caseData.dispute.type === 'ownership' && '📜 نزاعات الملكية والتعديات'}
                        {caseData.dispute.type === 'boundary' && '📐 نزاع تداخل حدود ومساحات الأراضي'}
                        {caseData.dispute.type === 'contract' && '✍️ نزاعات العقود والإخلال بالالتزامات'}
                        {caseData.dispute.type === 'rent' && '🏠 نزاعات الإيجار والتمكين'}
                        {caseData.dispute.type === 'construction' && '🏗️ نزاعات البناء والتطوير العقاري'}
                        {caseData.dispute.type === 'none' && '🔍 غير محدد / لم يختر بعد'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-350 ${isDisputeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Custom Dropdown Options */}
                    {isDisputeDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsDisputeDropdownOpen(false)}
                        />
                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                          {[
                            { value: 'inheritance', label: '⚖️ إرث / ميراث (تركة شرعية وتصفية أنصبة)' },
                            { value: 'ownership', label: '📜 نزاعات الملكية والتعديات' },
                            { value: 'boundary', label: '📐 نزاع تداخل حدود ومساحات الأراضي' },
                            { value: 'contract', label: '✍️ نزاعات العقود والإخلال بالالتزامات' },
                            { value: 'rent', label: '🏠 نزاعات الإيجار والتمكين' },
                            { value: 'construction', label: '🏗️ نزاعات البناء والتطوير العقاري' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                onUpdateCaseData({ dispute: { ...caseData.dispute, type: opt.value as any } });
                                setIsDisputeDropdownOpen(false);
                              }}
                              className={`w-full text-right px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between ${
                                caseData.dispute.type === opt.value 
                                  ? 'bg-amber-500/10 text-amber-400 font-black border border-amber-500/25' 
                                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {caseData.dispute.type === opt.value && <span className="text-amber-500 text-[10px]">✓ نشط</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible & Interactive Types of Disputes Guide Panel */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 transition-all">
                <button
                  type="button"
                  onClick={() => setIsDisputeGuideOpen(!isDisputeGuideOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 text-right hover:bg-slate-900 transition-all border-b border-slate-800/65"
                >
                  <div className="flex items-center gap-2 text-amber-500 font-black text-xs">
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>📖 دليل تصنيف وتفصيل أنواع النزاعات والمنازعات العقارية الشائعة</span>
                  </div>
                  {isDisputeGuideOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isDisputeGuideOpen && (
                  <div className="p-4 space-y-4 text-right text-xs leading-relaxed text-slate-300 animate-in slide-in-from-top-1 duration-200">
                    
                    {/* Intro */}
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-slate-300">
                      <p className="font-semibold text-justify">
                        <strong>القضايا العقارية</strong> هي النزاعات القانونية التي تنشأ بسبب التعاملات في مجال العقارات، وتشمل النطاقات والتفاصيل الرئيسية الموضحة أدناه. انقر على أي سهم لاستعراض التفاصيل الكاملة:
                      </p>
                    </div>

                    {/* Interactive Collapsible Boxes for Dispute Categories */}
                    <div className="space-y-3">
                      
                      {/* 1. نزاعات الملكية */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('property')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>📜 نزاعات الملكية والتعديات</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.property ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.property && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-3 animate-in slide-in-from-top-1 duration-150">
                            <p className="text-justify text-[11px] leading-relaxed">
                              القضايا العقارية هي النزاعات القانونية التي تنشأ بسبب التعاملات في مجال العقارات، وتشمل:
                            </p>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                              <span className="font-bold text-amber-500 block mb-1 text-[11px]">📍 نزاعات الملكية:</span>
                              <p className="text-slate-400 text-[11px]">مثل التعدي على الملكية، النزاعات حول الحدود، وعدم وضوح الملكية.</p>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-white block text-[11px]">⚖️ أنواع المنازعات العقارية الشائعة:</span>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">التعدي على الملكية:</strong> عندما يقوم شخص بالتعدي على أرض أو عقار مملوك لشخص آخر.</p>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">النزاعات حول الحدود:</strong> عندما تكون هناك خلافات حول الحدود الدقيقة بين الممتلكات.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. نزاعات العقود */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('contracts')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>✍️ نزاعات العقود والإخلال بالالعقود</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.contracts ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.contracts && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-3 animate-in slide-in-from-top-1 duration-150">
                            <p className="text-justify text-[11px] leading-relaxed">
                              القضايا العقارية هي النزاعات القانونية التي تنشأ بسبب التعاملات في مجال العقارات، وتشمل:
                            </p>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                              <span className="font-bold text-amber-500 block mb-1 text-[11px]">📍 نزاعات العقود:</span>
                              <p className="text-slate-400 text-[11px]">مثل الإخلال بشروط العقود، التأخير في تسليم العقارات، وعدم الوفاء بالالتزامات التعاقدية.</p>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-white block text-[11px]">⚖️ أنواع المنازعات العقارية الشائعة:</span>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">إخلال بشروط العقد:</strong> عندما لا يلتزم أحد الأطراف بشروط العقد المبرم، مثل عدم الدفع أو عدم تسليم العقار في الموعد المتفق عليه.</p>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">تأخير التسليم:</strong> تأخير في تسليم العقار من قبل البائع أو المطور العقاري.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. نزاعات الإيجار */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('rents')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>🏠 نزاعات الإيجار والتمكين</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.rents ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.rents && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-3 animate-in slide-in-from-top-1 duration-150">
                            <p className="text-justify text-[11px] leading-relaxed">
                              القضايا العقارية هي النزاعات القانونية التي تنشأ بسبب التعاملات في مجال العقارات، وتشمل:
                            </p>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                              <span className="font-bold text-amber-500 block mb-1 text-[11px]">📍 نزاعات الإيجار:</span>
                              <p className="text-slate-400 text-[11px]">مثل عدم دفع الإيجار، الإخلاء غير القانوني، وانتهاكات شروط عقد الإيجار.</p>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-white block text-[11px]">⚖️ أنواع المنازعات العقارية الشائعة:</span>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">عدم دفع الإيجار:</strong> عندما يفشل المستأجر في دفع الإيجار في الموعد المحدد.</p>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">الإخلاء غير القانوني:</strong> عندما يحاول المالك إخلاء المستأجر دون اتباع الإجراءات القانونية.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. نزاعات البناء */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('construction')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>🏗️ نزاعات البناء والتطوير العقاري</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.construction ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.construction && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-3 animate-in slide-in-from-top-1 duration-150">
                            <p className="text-justify text-[11px] leading-relaxed">
                              القضايا العقارية هي النزاعات القانونية التي تنشأ بسبب التعاملات في مجال العقارات، وتشمل:
                            </p>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                              <span className="font-bold text-amber-500 block mb-1 text-[11px]">📍 نزاعات البناء والتطوير:</span>
                              <p className="text-slate-400 text-[11px]">مثل تأخير المشاريع، العيوب في البناء، والمشاكل مع المقاولين.</p>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                              <span className="font-bold text-white block text-[11px]">⚖️ أنواع المنازعات العقارية الشائعة:</span>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">العيوب في البناء:</strong> عندما تكون هناك عيوب في البناء تؤثر على استخدام العقار.</p>
                              <p className="text-slate-400 text-[11px]"><strong className="text-slate-200">تأخير المشاريع:</strong> تأخير في إتمام المشاريع العقارية مما يسبب خسائر للمستثمرين أو المشترين.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 5. كيفية التعامل */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('handling')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>⚖️ كيفية التعامل مع القضايا العقارية وتصفيتها</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.handling ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.handling && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-2.5 text-[11px] animate-in slide-in-from-top-1 duration-150">
                            <p className="text-slate-400"><strong className="text-slate-200">التفاوض والتسوية:</strong> في كثير من الحالات، يمكن حل النزاعات العقارية عن طريق التفاوض والتسوية الودية بين الأطراف. قد يشمل ذلك تقديم تعويضات مالية أو إجراء تعديلات على الاتفاقات.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">التحكيم والوساطة:</strong> تعد الوساطة والتحكيم من الوسائل الفعالة لحل النزاعات العقارية دون اللجوء إلى المحاكم. يمكن للطرفين الاتفاق على تعيين وسيط أو محكم لحل النزاع.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">الإجراءات القضائية:</strong> إذا فشلت محاولات التفاوض والتسوية، يمكن للطرف المتضرر اللجوء إلى المحاكم لحل النزاع. تشمل الإجراءات القضائية تقديم دعاوى قضائية واتباع الإجراءات القانونية اللازمة.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">الاستشارات القانونية:</strong> من الضروري الحصول على استشارات قانونية متخصصة للتعامل مع النزاعات العقارية. يمكن للمحامي المختص تقديم النصائح والإرشادات القانونية لضمان حقوق الأطراف وحماية مصالحهم.</p>
                          </div>
                        )}
                      </div>

                      {/* 6. أهمية الاستشارات */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('importance')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>🛡️ أهمية الاستشارات القانونية في حل المنازعات</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.importance ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.importance && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-2.5 text-[11px] animate-in slide-in-from-top-1 duration-150">
                            <p className="text-slate-400"><strong className="text-slate-200">حماية الحقوق:</strong> تضمن الاستشارات القانونية حماية حقوق جميع الأطراف المعنية في النزاعات العقارية.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">الامتثال للقوانين:</strong> تساعد الاستشارات القانونية في ضمان الامتثال للقوانين واللوائح المحلية المتعلقة بالعقارات.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">تفادي النزاعات المستقبلية:</strong> يمكن للمحامي تقديم النصائح اللازمة لتفادي النزاعات المستقبلية من خلال إعداد عقود واضحة وشروط تفصيلية.</p>
                            <p className="text-slate-400"><strong className="text-slate-200">تسريع الإجراءات:</strong> يساعد الحصول على استشارات قانونية متخصصة في تسريع حل النزاعات وتوفير الوقت والجهد.</p>
                          </div>
                        )}
                      </div>

                      {/* 7. الخاتمة واستشارات شركة تقادم */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60">
                        <button
                          type="button"
                          onClick={() => toggleDisputeSection('ending')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-900 text-right transition-all"
                        >
                          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                            <span>✨ الخاتمة واستشارة شركة تقادم للمحاماة والاستشارات</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDisputeSections.ending ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedDisputeSections.ending && (
                          <div className="p-4 bg-slate-950/20 border-t border-slate-800/60 text-slate-300 space-y-3 text-[11px] animate-in slide-in-from-top-1 duration-150 text-justify leading-relaxed">
                            <p className="text-slate-300">
                              تعد القضايا والمنازعات القضائية في مجال العقارات من التحديات التي قد تواجه الأفراد والشركات. من خلال التفاوض، التحكيم، والإجراءات القضائية، يمكن حل هذه النزاعات بفعالية. تعد الاستشارات القانونية المتخصصة ضرورية لضمان حماية الحقوق والامتثال للقوانين، مما يعزز من فرص حل النزاعات بشكل ودي وسريع.
                            </p>
                            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg text-slate-200 space-y-2 mt-2 shadow-sm">
                              <p className="font-bold text-amber-400 text-xs">🛡️ استشارة متخصصة ودعم قانوني متكامل من الخبراء:</p>
                              <p className="text-slate-300 text-[10px] text-justify leading-relaxed">
                                إذا كنت تواجه نزاعات عقارية أو تحتاج إلى استشارة قانونية، فإن <strong>شركة تقادم للمحاماة والاستشارات القانونية</strong> مستعدة لتقديم الدعم والمساعدة اللازمة لضمان حماية حقوقك وحل النزاعات بكفاءة. تواصل معنا اليوم للحصول على استشارة قانونية متخصصة ومناقشة تفاصيل قضيتك مع فريقنا من الخبراء.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3(A): Land Specific Fields (تظهر فقط عند اختيار "أرض") */}
            {propertyType === 'land' && (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-300">
                <h3 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>القسم الثالث (أ): مواصفات الأرض والرفع المساحي والزمام</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">مساحة الأرض</label>
                    <div className="flex gap-1">
                      <input 
                        type="number" 
                        value={caseData.landArea}
                        onChange={e => onUpdateCaseData({ landArea: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold w-2/3 focus:outline-none"
                      />
                      <select 
                        value={landUnit}
                        onChange={e => onUpdateCaseData({ landUnit: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs w-1/3 focus:outline-none"
                      >
                        <option value="متر">متر ²</option>
                        <option value="قيراط">قيراط</option>
                        <option value="فدان">فدان</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">الزمام الإداري والجغرافي</label>
                    <select 
                      value={landZamam}
                      onChange={e => onUpdateCaseData({ landZamam: e.target.value as any })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="زمام">زمام زراعي خصب</option>
                      <option value="صحراوي">زمام صحراوي / استصلاح</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">نوع الملكية الحالية</label>
                    <select 
                      value={landOwnershipType}
                      onChange={e => onUpdateCaseData({ landOwnershipType: e.target.value as any })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="ملكية خاصة">ملكية خاصة مسجلة</option>
                      <option value="ملكية دولة">أملاك دولة (حق انتفاع)</option>
                      <option value="وقف">أرض وقف خيرى أو أهلي</option>
                      <option value="مشاع">ملكية شائعة بين شركاء</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 space-y-3">
                  <span className="text-slate-300 text-[11px] font-black block">📍 الأرقام المساحية والسجل العيني للمديرية:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900">
                      <span className="text-slate-500 text-[10px] font-bold shrink-0">رقم القطعة:</span>
                      <input 
                        type="text" 
                        value={landPieceNum} 
                        onChange={e => onUpdateCaseData({ landPieceNum: e.target.value })}
                        className="bg-transparent text-white text-xs focus:outline-none w-full text-left font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900">
                      <span className="text-slate-500 text-[10px] font-bold shrink-0">اسم الحوض:</span>
                      <input 
                        type="text" 
                        value={landBasinNum} 
                        onChange={e => onUpdateCaseData({ landBasinNum: e.target.value })}
                        className="bg-transparent text-white text-xs focus:outline-none w-full text-left font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900">
                      <span className="text-slate-500 text-[10px] font-bold shrink-0">رقم القسم:</span>
                      <input 
                        type="text" 
                        value={landSectionNum} 
                        onChange={e => onUpdateCaseData({ landSectionNum: e.target.value })}
                        className="bg-transparent text-white text-xs focus:outline-none w-full text-left font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Boundaries */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 space-y-3">
                  <span className="text-slate-300 text-[11px] font-black block">📐 الحدود الأربعة لقطعة الأرض وعقارات المجاورة:</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px]">الحد الشرقي:</span>
                      <input 
                        type="text" 
                        defaultValue="جار ملك ورثة أبو المعاطي"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px]">الحد الغربي:</span>
                      <input 
                        type="text" 
                        defaultValue="شارع رئيسي عرض ١٢ متر"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px]">الحد الشمالي:</span>
                      <input 
                        type="text" 
                        defaultValue="أرض زراعية فضاء"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px]">الحد الجنوبي:</span>
                      <input 
                        type="text" 
                        defaultValue="مسقى خاص ري الأراضي"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3(B): Apartment Specific Fields (تظهر فقط عند اختيار "وحدة سكنية") */}
            {propertyType === 'apartment' && (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-300">
                <h3 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>القسم الثالث (ب): بيانات الوحدة السكنية والعلاقة القانونية التفصيلية</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">العنوان التفصيلي للوحدة السكنية</label>
                    <input 
                      type="text"
                      value={apartmentAddress}
                      onChange={e => onUpdateCaseData({ apartmentAddress: e.target.value })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">الدور والرقم</label>
                    <input 
                      type="text"
                      value={apartmentFloorAndNumber}
                      onChange={e => onUpdateCaseData({ apartmentFloorAndNumber: e.target.value })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">المساحة الإجمالية بالمتر المربع</label>
                    <input 
                      type="number"
                      value={apartmentAreaSqm}
                      onChange={e => onUpdateCaseData({ apartmentAreaSqm: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all font-mono font-bold"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-slate-400 text-[11px] font-bold">تحديد العلاقة القانونية واستغلال الوحدة</label>
                    <select 
                      value={apartmentRelationType}
                      onChange={e => onUpdateCaseData({ apartmentRelationType: e.target.value as any })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all font-bold"
                    >
                      <option value="old_rent">📜 إيجار قديم (قانون ٤ لسنة ١٩٩٦ الاستثنائي)</option>
                      <option value="new_rent">✍️ إيجار جديد (قانون ٦ لسنة ١٩٩٧ المدني)</option>
                      <option value="inheritance">👪 إرث / ميراث (تركة شرعية وتصفية شائعة)</option>
                      <option value="waqf">🕌 وقف (أهلي عائلي أو خيري بوزارة الأوقاف)</option>
                      <option value="other">⚙️ أخرى (حيازة مادية هادئة بدون سند مسموع)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-inputs dependent on relation type selection */}
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-3 animate-in slide-in-from-top-1 duration-200">
                  {apartmentRelationType === 'old_rent' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <h4 className="text-amber-400 text-[11px] font-black">البيانات الإلزامية للإيجار القديم:</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">القيمة الإيجارية الشهرية القديمة</span>
                          <input type="text" defaultValue="١٥ جنيهاً مصرياً" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">تاريخ تحرير عقد الإيجار ومستنده</span>
                          <input type="text" defaultValue="١٢ أكتوبر ١٩٧٢" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {apartmentRelationType === 'new_rent' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <h4 className="text-blue-400 text-[11px] font-black">البيانات الإلزامية للإيجار الجديد:</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">القيمة الإيجارية الشهرية الموثقة</span>
                          <input type="text" defaultValue="٣,٥٠٠ جنيه مصري" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">مدة الإيجار وتاريخ انتهاء العلاقة</span>
                          <input type="text" defaultValue="٥ سنوات ينتهي في ٢٠٢٨" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {apartmentRelationType === 'inheritance' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <h4 className="text-emerald-400 text-[11px] font-black">حالة التركة وقائمة الورثة الشرعيين:</h4>
                        </div>
                        {/* Notice & prompt link to the specific consolidated tab */}
                        <span className="text-[10px] text-slate-500 font-bold">
                          لديك <strong className="text-amber-500">{caseData.heirs.length}</strong> ورثة مسجلين بالتركة حالياً.
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        إن أي تعديل على الورثة أو حاسبة أنصبتهم وشجرتهم التفاعلية يتم عبر <span className="text-amber-500 font-bold underline">بوابة المواريث والورثة الموحدة</span> في القائمة الجانبية لتجميع كافة التفاصيل الحسابية والشرعية بدقة متكاملة.
                      </p>
                    </div>
                  )}

                  {apartmentRelationType === 'waqf' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <h4 className="text-purple-400 text-[11px] font-black">بيانات حصر الوقف الخيري أو الأهلي:</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">ناظر الوقف والجهة المشرفة</span>
                          <input type="text" defaultValue="وزارة الأوقاف المصرية - منطقة الجيزة" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-[10px]">شروط الواقف أو ريع مصارف التوزيع</span>
                          <input type="text" defaultValue="يصرف الريع بنسبة الثلث لأعمال البر وعمارة المساجد" className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {apartmentRelationType === 'other' && (
                    <div className="space-y-2">
                      <span className="text-slate-300 text-[11px] font-black block">تفاصيل الحيازة والوضع المادي للعين:</span>
                      <textarea rows={2} placeholder="اكتب مبررات ومستندات حيازتك للوحدة السكنية والمطالب..." className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs w-full focus:outline-none focus:border-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3(C): Heirs & Sharia Division (تظهر عندما يكون نوع النزاع "ميراث") */}
            {caseData.dispute.type === 'inheritance' && (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <h3 className="text-emerald-400 text-xs font-black flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>القسم الثالث (ج): حصر الورثة التفاعلي وقسمة التركة الشرعية الفورية</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                    تحديث لحظي نشط
                  </span>
                </div>

                {/* Info about estate */}
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-white text-xs font-black block">القيمة السوقية الإجمالية للتركة (Estate Value):</span>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      يتم حساب توزيع المواريث والأنصبة استناداً إلى هذه القيمة. يمكنك تغييرها لتحديث القيم النقدية فوراً.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input 
                      type="number"
                      value={caseData.estateValue || 240000}
                      onChange={e => onUpdateCaseData({ estateValue: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold w-36 focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs font-bold">ج.م</span>
                  </div>
                </div>

                {/* Interactive Add Heir Form */}
                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 space-y-3">
                  <span className="text-slate-300 text-[11px] font-black block">➕ إضافة وريث جديد لجدول النزاع:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <input 
                        type="text"
                        placeholder="اسم الوريث بالكامل..."
                        id="form-heir-name"
                        className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs w-full focus:outline-none"
                      />
                    </div>
                    <div>
                      <select 
                        id="form-heir-gender"
                        className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs w-full focus:outline-none"
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div>
                      <select 
                        id="form-heir-relation"
                        className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs w-full focus:outline-none"
                      >
                        <option value="son">ابن</option>
                        <option value="daughter">ابنة</option>
                        <option value="wife">زوجة</option>
                        <option value="husband">زوج</option>
                        <option value="father">أب</option>
                        <option value="mother">أم</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nameEl = document.getElementById('form-heir-name') as HTMLInputElement;
                      const genderEl = document.getElementById('form-heir-gender') as HTMLSelectElement;
                      const relationEl = document.getElementById('form-heir-relation') as HTMLSelectElement;
                      if (!nameEl || !nameEl.value.trim()) {
                        triggerToast('⚠️ يرجى إدخال اسم الوارث كاملاً', 'warning');
                        return;
                      }
                      const newHeir: Heir = {
                        id: `heir_${Date.now()}`,
                        name: nameEl.value.trim(),
                        gender: genderEl.value as 'male' | 'female',
                        relationship: relationEl.value as any
                      };
                      onUpdateCaseData({
                        heirs: [...caseData.heirs, newHeir]
                      });
                      nameEl.value = '';
                      triggerToast('👥 تم إدراج الوارث وإعادة احتساب الأنصبة الشرعية لحظياً!', 'success');
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-750 font-black text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>إدراج الوارث وتطبيق قواعد الشريعة</span>
                  </button>
                </div>

                {/* List of Heirs with calculated shares */}
                {caseData.heirs.length === 0 ? (
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/20 text-center text-slate-500 text-xs font-bold">
                    لم يتم تسجيل أي ورثة لهذه القضية حتى الآن. استخدم حقول الإضافة أعلاه لبناء شجرة التركة.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-slate-400 text-[10px] font-black block">الورثة المسجلون وتوزيع حصصهم من التركة:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {caseData.heirs.map((heir) => {
                        const hs = results.heirsShares.find(item => item.id === heir.id);
                        const isSelected = heir.selected !== false;
                        return (
                          <div 
                            key={heir.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isSelected 
                                ? 'bg-slate-950 border-slate-850 hover:border-emerald-500/20' 
                                : 'bg-slate-950/40 border-slate-900/40 opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  onUpdateCaseData({
                                    heirs: caseData.heirs.map(h => h.id === heir.id ? { ...h, selected: !isSelected } : h)
                                  });
                                  triggerToast(!isSelected ? `✓ تم إدراج الوارث ${heir.name} في حساب الأنصبة` : `⏳ تم استبعاد الوارث ${heir.name} مؤقتاً`, !isSelected ? 'success' : 'warning');
                                }}
                                className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950 shrink-0 cursor-pointer mt-0.5"
                              />
                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-black ${isSelected ? 'text-white' : 'text-slate-500 line-through'}`}>{heir.name}</span>
                                  <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                                    {heir.relationship === 'son' && 'ابن'}
                                    {heir.relationship === 'daughter' && 'ابنة'}
                                    {heir.relationship === 'wife' && 'زوجة'}
                                    {heir.relationship === 'husband' && 'زوج'}
                                    {heir.relationship === 'father' && 'أب'}
                                    {heir.relationship === 'mother' && 'أم'}
                                  </span>
                                </div>
                                {isSelected && hs ? (
                                  <>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                                      <span className="text-emerald-400 font-black">{hs.sharePercent.toFixed(2)}%</span>
                                      <span>•</span>
                                      <span className="text-slate-500">{hs.shareFraction}</span>
                                    </div>
                                    <div className="text-[11px] font-mono font-bold text-amber-400">
                                      {hs.shareValue.toLocaleString('ar-EG')} ج.م
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-[10px] text-slate-500 font-bold">
                                    (مستبعد من الحساب الشرعي)
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateCaseData({
                                  heirs: caseData.heirs.filter(h => h.id !== heir.id)
                                });
                                triggerToast('🗑️ تم استبعاد الوارث وإعادة تصفية الحسابات', 'info');
                              }}
                              className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900 rounded-lg transition-all self-start"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: Court Dispute Information (ثابتة في كل الحالات) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>القسم الرابع: تفاصيل النزاع القانوني القائم ومذكرات الخصوم والطلبات</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">عنوان أو موجز الخصومة القضائية</label>
                  <input 
                    type="text" 
                    value={caseData.title}
                    onChange={e => onUpdateCaseData({ title: e.target.value })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">تاريخ بدء النزاع الموثق بالدعوى</label>
                  <input 
                    type="date" 
                    defaultValue="2026-06-30"
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">الطرف الآخر المشتكى عليه (الخصم)</label>
                  <input 
                    type="text" 
                    defaultValue="خالد محمد عبدالله وشريكه"
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">بيانات اتصال الخصم ومحل إقامته المختار</label>
                  <input 
                    type="text" 
                    defaultValue="01124567890 - شارع فيصل، الجيزة"
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">وصف النزاع الفني بالتفصيل (يتكيف تلقائياً مع حجم الكتابة)</label>
                  <textarea 
                    rows={4}
                    value={caseData.dispute.details}
                    onChange={e => onUpdateCaseData({ dispute: { ...caseData.dispute, details: e.target.value } })}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none transition-all focus:ring-1 focus:ring-amber-500"
                    placeholder="اكتب تفصيل الادعاءات أو مذكرات المعاينة الميدانية بدقة هنا..."
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[11px] font-bold">المطالب القضائية المقدمة للمجلس الأعلى للعدالة والخبراء</label>
                  <textarea 
                    rows={2}
                    defaultValue="تصفية الريع بالكامل، وإجراء الفرز والتجنيب العيني لقطعة الأرض السكنية محل التناحر، ومنع التعرض وحيازة الحصص المفرزة."
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-white text-xs focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Dictation Voice Input, Video & Multi-Media Attachments (ذكي وتفاعلي) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Mic className="w-5 h-5 text-amber-500 shrink-0" />
                <span>القسم الخامس: أدوات الإدخال الصوتي التفاعلي والوثائق الرقمية الحية</span>
              </h3>

              {/* Dictation Tool */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right flex-1">
                  <span className="text-amber-400 text-[11px] font-black block">🎙️ حاسوب الإملاء الصوتي القضائي والتحويل التلقائي لنص:</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    اضغط على زر التسجيل وتحدث بلسانك لتوثيق الشهادة أو تقرير المعاينة. سيقوم النموذج بتحويل موجات صوتك إلى نصوص قضائية مكتوبة في وصف النزاع فورياً.
                  </p>
                  {isRecording && (
                    <div className="flex items-center gap-2 mt-2 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg w-max animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-red-400 font-mono text-[10px] font-black">جاري الاستماع... {recordingSeconds} ثانية</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`px-5 py-3 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'إيقاف وحفظ الإملاء' : 'بدء إملاء المعاينة ميدانياً'}</span>
                </button>
              </div>

              {/* Document and Video dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl p-6 bg-slate-950/20 text-center space-y-3 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto border border-slate-800">
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-white text-xs font-black block">اسحب وأفلت الملفات والخرائط أو الفيديوهات هنا</span>
                  <span className="text-[10px] text-slate-500 block">أو انقر لتصفح ملفات جهازك المحلي (بصيغ PDF, JPG, WAV, MP4)</span>
                  <span className="text-[9px] text-amber-500/60 font-black block">الحد الأقصى للفيديوهات: ١٠٠ ميجابايت</span>
                </div>
              </div>

              {/* Video Specific warning */}
              <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex items-start gap-3">
                <Video className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-right">
                  <span className="text-slate-300 text-[10px] font-black block">قيد جودة الفيديو الميداني (رصد التلفيات بالهاتف):</span>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    يدعم النظام دقة 1080p بمعدل ٣٠ إطاراً في الثانية كحد أقصى لضمان سرعة التحميل لفرق الخبراء المعاونة أثناء جلسات المداولة الفنية.
                  </p>
                </div>
              </div>

              {/* Uploaded Files Registry List */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 text-[10px] font-black block">قائمة المرفقات المستلمة والمسجلة بالملف القضائي:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="min-w-0 text-right">
                            <span className="text-white font-bold block truncate max-w-[180px]">{doc.name}</span>
                            <span className="text-[9px] text-slate-500 font-bold block">{doc.type} • {doc.size}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setUploadedDocs(prev => prev.filter((_, i) => i !== idx));
                            triggerToast('🗑️ تم استبعاد المرفق القضائي', 'info');
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* LEFT SIDE: Instant Live Preview Panel (span 4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
            
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              <h3 className="text-amber-400 text-xs font-black flex items-center gap-2 border-b border-slate-850 pb-2.5">
                <Eye className="w-4 h-4" />
                <span>شاشة المعاينة الفورية للتحديثات (Instant Preview)</span>
              </h3>

              {/* Interactive Report Card */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
                
                {/* Simulated Stamp */}
                <div className="flex items-center justify-between">
                  <div className="border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-black">
                    ملف قضائي نشط
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    {caseData.caseNumber}
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold block">موضوع الدعوى:</span>
                    <p className="text-white text-xs font-black leading-snug">{caseData.title}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold block">المدعي وصاحب الحق:</span>
                    <p className="text-white text-xs font-bold">{clientName}</p>
                    <span className="text-[8px] text-slate-500 font-mono block">الرقم القومي: {clientNationalId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900/60 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block">نوع المعاينة:</span>
                      <span className="text-amber-400 font-black">
                        {propertyType === 'land' ? '🏜️ أطيان وأراضي' : propertyType === 'apartment' ? '🏠 شقة سكنية' : '🏢 تجاري وإداري'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block">المساحة المقدرة:</span>
                      <span className="text-white font-mono font-black">
                        {propertyType === 'land' ? `${caseData.landArea} ${landUnit}` : `${apartmentAreaSqm} متر ²`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900/60 text-xs">
                    <span className="text-[9px] text-slate-500 font-bold block">التفاصيل الفنية الجارية للادعاء:</span>
                    <p className="text-slate-300 text-[10px] leading-relaxed font-semibold line-clamp-3 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                      {caseData.dispute.details || 'لا توجد تفاصيل حتى الآن...'}
                    </p>
                  </div>

                  {/* Dynamic Sharia Division Summary (تحديث فوري للورثة) */}
                  {caseData.dispute.type === 'inheritance' && caseData.heirs.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-900/60 text-xs text-right animate-in fade-in duration-200">
                      <span className="text-[9px] text-emerald-400 font-black block">القسمة الشرعية الفورية للورثة ({caseData.heirs.length}):</span>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                        {results.heirsShares.map(hs => (
                          <div key={hs.id} className="flex justify-between items-center text-[10px] border-b border-slate-900/45 pb-1 last:border-0 last:pb-0">
                            <span className="text-white font-bold">{hs.name}</span>
                            <div className="flex items-center gap-2 font-semibold">
                              <span className="text-emerald-400">{hs.sharePercent.toFixed(1)}%</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-amber-400 font-mono font-bold text-[9px]">{hs.shareValue.toLocaleString('ar-EG')} ج</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance Indicator Badge */}
                  <div className="bg-slate-900/80 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">درجة التطابق المستندي مع الجهات الجغرافية:</span>
                    <span className="text-emerald-400 font-mono font-black bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {caseData.complianceScore || 92}%
                    </span>
                  </div>
                </div>

              </div>

              {/* Live Status Indicators */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">محل الإنعقاد:</span>
                  <span className="text-slate-300 font-bold">{caseData.court}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رئيس الجلسة:</span>
                  <span className="text-slate-300 font-bold">{caseData.judge}</span>
                </div>
              </div>

              {/* Simulated Save Button */}
              <button
                type="button"
                onClick={() => triggerToast('💾 تم حفظ ومزامنة كافة التحديثات والنموذج الديناميكي لملف القضية والأرشيف بنجاح!', 'success')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>حفظ التعديلات وتجميد البيانات (Save)</span>
              </button>

            </div>

          </div>

        </div>

        {/* تغيير موقع العقار القضائي (انتقلت هنا بناء على طلب المستخدم) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>تغيير موقع العقار القضائي (قاعدة البيانات)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_LOCATIONS.map((loc, idx) => {
              const isSelected = caseData.location === loc.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const lat = loc.lat;
                    const lng = loc.lng;
                    const finalScannedArea = Math.round(350 + (Math.abs(Math.sin(lat * 800) * Math.cos(lng * 800)) * 280));
                    const finalComplianceScore = Math.max(70, Math.min(100, Math.round(100 - (Math.abs(lat - 29.9912) + Math.abs(lng - 31.1425)) * 1200)));

                    onUpdateCaseData({
                      latitude: lat,
                      longitude: lng,
                      location: loc.name,
                      scannedArea: finalScannedArea,
                      complianceScore: finalComplianceScore
                    });
                    triggerToast('📍 تم تحديث موقع العقار القضائي بنجاح!', 'success');
                  }}
                  className={`text-right p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5' 
                      : 'bg-slate-950/40 border-slate-800/85 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                      {loc.name.split(' - ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed line-clamp-2">
                    {loc.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* تحليل مطابقة الكود المصري واشتراطات البناء (انتقلت هنا بناء على طلب المستخدم) */}
        <ComplianceTrends caseData={caseData} theme={theme || 'dark'} />

        {/* منصة الإدارة والفرز الذكي (انتقلت هنا بناء على طلب المستخدم) */}
        <AreaRegistry 
          caseData={caseData} 
          theme={theme || 'dark'} 
          onMaximize={() => {}} 
        />
        </>
      )}

    </div>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { CaseData, CalculationResults } from '../types';
import { triggerToast } from '../lib/toast';
import { 
  getReportData, 
  initialLinkedDocuments, 
  initialTimelineMilestones, 
  initialSmartAlerts,
  ReportType,
  DocumentLink,
  VersionLog,
  TimelineMilestone,
  SmartAlert
} from './ReportData';
import { 
  Printer, 
  Download, 
  FileText, 
  Award, 
  CheckCircle2, 
  Scale, 
  Shield, 
  Eye, 
  X, 
  Lock, 
  Sliders, 
  QrCode,
  Clock,
  GitBranch,
  Signature,
  FileCheck,
  Building2,
  Copy,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Users,
  Briefcase,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Check,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ReportViewProps {
  caseData: CaseData;
  results: CalculationResults;
  onPrint: () => void;
}

export default function ReportView({ caseData, results, onPrint }: ReportViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const fullDossierRef = useRef<HTMLDivElement>(null);

  // States
  const [activeReport, setActiveReport] = useState<ReportType>('experts');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingFullDossier, setIsGeneratingFullDossier] = useState(false);

  // Watermark States
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(true);
  const [watermarkType, setWatermarkType] = useState<'justice' | 'eagle' | 'both'>('justice');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.08);
  const [watermarkColor, setWatermarkColor] = useState<'amber' | 'blue' | 'gray'>('amber');
  const [includeQRCode, setIncludeQRCode] = useState(true);
  const [isCertifiedStampVisible, setIsCertifiedStampVisible] = useState(true);

  // Innovative Features States
  const [version, setVersion] = useState(3);
  const [versionHistory, setVersionHistory] = useState<VersionLog[]>([
    { version: 1, date: '2026-07-01', author: 'أمين السر (قلم الكتاب)', action: 'إنشاء المسودة الأولى وتجميع المرفقات', notes: 'تم استيراد بيانات المساحة والملاك الأولية.' },
    { version: 2, date: '2026-07-03', author: 'الخبير المنتدب (كابتن حسام)', action: 'اعتماد التقرير الهندسي والمساحي وتوزيع الأنصبة', notes: 'تمت إضافة الرفع الطبوغرافي الرقمي وتثبيت حدود الـ GPS.' },
    { version: 3, date: '2026-07-06', author: 'الخبير المنتدب (كابتن حسام)', action: 'تعديل الصياغة ودمج تقرير الأمن والتنفيذ الموحد', notes: 'دمج تقرير الشرطة مع توجيهات وزارة الداخلية وتحديث خريطة المخاطر.' }
  ]);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [newVersionAuthor, setNewVersionAuthor] = useState('الخبير المنتدب (كابتن حسام)');
  const [newVersionAction, setNewVersionAction] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');

  const [linkedDocs, setLinkedDocs] = useState<DocumentLink[]>(initialLinkedDocuments);
  const [activeDocPreview, setActiveDocPreview] = useState<DocumentLink | null>(null);

  const [timeline, setTimeline] = useState<TimelineMilestone[]>(initialTimelineMilestones);
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);

  const [alerts, setAlerts] = useState<SmartAlert[]>(initialSmartAlerts);

  const [signatures, setSignatures] = useState({
    judge: { signed: false, name: caseData.judge || 'المستشار رئيس الدائرة', date: '', hash: '' },
    expert: { signed: true, name: 'الخبير/ كابتن حسام', date: '2026-07-06 14:30', hash: 'SHA256-8A9C3F' },
    prosecution: { signed: false, name: 'رئيس النيابة العامة', date: '', hash: '' },
    clerk: { signed: true, name: 'أمين سر الجلسة', date: '2026-07-06 10:15', hash: 'SHA256-4D2E1B' }
  });
  const [activeSignatory, setActiveSignatory] = useState<'judge' | 'expert' | 'prosecution' | 'clerk' | null>(null);
  const [isSigningBiometric, setIsSigningBiometric] = useState(false);
  const [biometricProgress, setBiometricProgress] = useState(0);

  // AI Summary States
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [copiedOpinion, setCopiedOpinion] = useState(false);

  // Fetch compiled report text data
  const data = getReportData(caseData, results);

  const handleCopyOpinion = () => {
    if (data.technicalOpinion) {
      navigator.clipboard.writeText(data.technicalOpinion);
      setCopiedOpinion(true);
      triggerToast('📋 تم نسخ خلاصة الرأي الفني للقاضي بنجاح لحافظة المذكرات', 'success');
      setTimeout(() => setCopiedOpinion(false), 2000);
    }
  };

  // Initialize dynamic AI Summary text
  const triggerAISummarize = () => {
    setIsGeneratingAISummary(true);
    setAiSummary('');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setIsGeneratingAISummary(false);
        const totalValText = results.totalPropertyValue.toLocaleString('ar-EG');
        const heirsCount = caseData.heirs.length;
        const disputeStatus = caseData.dispute.hasDispute ? `النزاع القائم حول (${caseData.dispute.details})` : 'لا توجد نزاعات معقدة';
        setAiSummary(
          `التحليل الذكي لملف القضية رقم ${caseData.caseNumber}: يوضح التقييم الفني أن القيمة السوقية الإجمالية للعقار تبلغ ${totalValText} ج.م، موزعة على ${heirsCount} من الورثة الشرعيين. تم كشف تداخل حدودي حرج قدره 2.4 متر في الجانب الشمالي. يوصي النظام الخبير باعتماد الإخلاء الجبري للمستأجرين المخالفين لتجاوزهم القوانين المنظمة للإيجار مع تحويل متأخرات الدفع (225,000 ج.م) لصالح خزينة المحكمة.`
        );
        triggerToast('🧠 تم توليد الملخص الفني الذكي بواسطة Gemini بنجاح', 'success');
      }
    }, 150);
  };

  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const element = printAreaRef.current;
      const actions = element.querySelectorAll('[data-pdf-ignore]');
      actions.forEach(el => (el as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      actions.forEach(el => (el as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      pdf.save(`Judicial_Report_Case_${caseData.caseNumber || 'No'}_v${version}.pdf`);
      triggerToast(`📥 تم تصدير وتحميل التقرير بنجاح (الإصدار ${version})`, 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      triggerToast('❌ فشل تصدير التقرير، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadFullDossier = async () => {
    if (!fullDossierRef.current) return;
    setIsGeneratingFullDossier(true);
    try {
      const element = fullDossierRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      pdf.save(`Comprehensive_Judicial_Dossier_Case_${caseData.caseNumber || 'No'}.pdf`);
      triggerToast('📜 تم توليد وتحميل الملف القضائي الشامل بالكامل', 'success');
    } catch (error) {
      console.error('Error generating comprehensive PDF:', error);
      triggerToast('❌ فشل توليد الملف القضائي الشامل', 'error');
    } finally {
      setIsGeneratingFullDossier(false);
    }
  };

  // Sign Action Simulation
  const handleSignBiometric = (signatory: 'judge' | 'expert' | 'prosecution' | 'clerk') => {
    setActiveSignatory(signatory);
    setIsSigningBiometric(true);
    setBiometricProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSigningBiometric && activeSignatory) {
      interval = setInterval(() => {
        setBiometricProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const formattedDate = new Date().toLocaleString('ar-EG');
              const randomHash = 'SHA256-' + Math.random().toString(36).substring(2, 8).toUpperCase();
              setSignatures(prev => ({
                ...prev,
                [activeSignatory]: {
                  signed: true,
                  name: prev[activeSignatory].name,
                  date: formattedDate,
                  hash: randomHash
                }
              }));
              setIsSigningBiometric(false);
              setActiveSignatory(null);
              triggerToast('✍️ تم التحقق من البصمة البيومترية وإتمام التوقيع الرقمي بنجاح', 'success');
            }, 300);
            return 100;
          }
          return p + 20;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isSigningBiometric, activeSignatory]);

  // Add Modification Version
  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionAction) return;

    const newVerNum = version + 1;
    const newLog: VersionLog = {
      version: newVerNum,
      date: new Date().toISOString().split('T')[0],
      author: newVersionAuthor,
      action: newVersionAction,
      notes: newVersionNotes
    };

    setVersion(newVerNum);
    setVersionHistory(prev => [newLog, ...prev]);
    setShowAddVersionModal(false);
    setNewVersionAction('');
    setNewVersionNotes('');
    triggerToast(`📝 تم إصدار نسخة جديدة للتقرير v${newVerNum} بنجاح`, 'info');
  };

  // Toggle Timeline Status
  const handleToggleTimelineStatus = (id: string) => {
    setTimeline(prev => prev.map(milestone => {
      if (milestone.id === id) {
        const statuses: ('done' | 'progress' | 'pending' | 'delayed')[] = ['done', 'progress', 'pending', 'delayed'];
        const labels = { done: 'مكتمل', progress: 'جاري العمل', pending: 'قيد الانتظار', delayed: 'متأخر' };
        const nextIndex = (statuses.indexOf(milestone.status) + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];
        return {
          ...milestone,
          status: nextStatus,
          statusLabel: labels[nextStatus]
        };
      }
      return milestone;
    }));
    triggerToast('📅 تم تحديث حالة الموعد القضائي بالتوافق الفوري', 'success');
  };

  // Report buttons array
  const reportButtons: { id: ReportType; label: string; icon: React.ReactNode; colorClass: string; desc: string }[] = [
    { id: 'experts', label: 'توصية الخبراء', icon: <Award className="w-4 h-4" />, colorClass: 'border-amber-500/50 hover:bg-amber-500/10 data-[active=true]:bg-amber-500/15 data-[active=true]:border-amber-500', desc: 'ملخص توصيات سرب الوكلاء والخبراء المستقلين وعقود الخصومة.', },
    { id: 'technical', label: 'القطاع الفني', icon: <FileCheck className="w-4 h-4" />, colorClass: 'border-cyan-500/50 hover:bg-cyan-500/10 data-[active=true]:bg-cyan-500/15 data-[active=true]:border-cyan-500', desc: 'الأدلة الرقمية والتحريات التقنية الموثقة بنظم الـ Blockchain.', },
    { id: 'engineering', label: 'الهندسي والإداري', icon: <Building2 className="w-4 h-4" />, colorClass: 'border-emerald-500/50 hover:bg-emerald-500/10 data-[active=true]:bg-emerald-500/15 data-[active=true]:border-emerald-500', desc: 'المقايسة الإنشائية للمنشآت والواجهة وسلامة تراخيص البناء والترميم.', },
    { id: 'financial', label: 'المالي والبنكي', icon: <BarChart3 className="w-4 h-4" />, colorClass: 'border-blue-500/50 hover:bg-blue-500/10 data-[active=true]:bg-blue-500/15 data-[active=true]:border-blue-500', desc: 'الضرائب العقارية، القيمة السوقية، وحسابات الأمانات المصرفية المفتوحة.', },
    { id: 'insurance', label: 'التأمين والمشروعات', icon: <ShieldCheck className="w-4 h-4" />, colorClass: 'border-purple-500/50 hover:bg-purple-500/10 data-[active=true]:bg-purple-500/15 data-[active=true]:border-purple-500', desc: 'بوليصة تأمين ضد الأضرار وجدوى التطوير والاستثمار العقاري.', },
    { id: 'security', label: 'الأمن والتنفيذ', icon: <Shield className="w-4 h-4" />, colorClass: 'border-red-500/50 hover:bg-red-500/10 data-[active=true]:bg-red-500/15 data-[active=true]:border-red-500', desc: 'دمج تقارير الشرطة المحلية مع مأموريات الأمن وتوجيهات وزارة الداخلية.', },
    { id: 'judgment', label: 'مقترح منطوق الحكم', icon: <Scale className="w-4 h-4" />, colorClass: 'border-amber-600/50 hover:bg-amber-600/10 data-[active=true]:bg-amber-600/15 data-[active=true]:border-amber-600', desc: 'مسودة ومنطوق الصيغة التنفيذية النهائية لعرضها على السيد رئيس المحكمة.', },
    { id: 'opinion', label: 'خلاصة الرأي الفني للقاضي', icon: <FileText className="w-4 h-4" />, colorClass: 'border-yellow-500/50 hover:bg-yellow-500/10 data-[active=true]:bg-yellow-500/15 data-[active=true]:border-yellow-500', desc: 'خلاصة الرأي الفني للقاضي بصيغة قابلة للنسخ المباشر للمذكرات القضائية، تشمل ملخص المعاينة والقسمة.', }
  ];

  return (
    <div className="space-y-6" style={{ direction: 'rtl' }}>
      
      {/* ===== EXECUTIVE HEADER WITH EMBEDDED SUMMARY & AI SUMMARIZER ===== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white text-lg font-black tracking-tight">منظومة التقرير القضائي المعتمد</h3>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                الإصدار v{version} • القضية: {caseData.caseNumber} • المحكمة: {caseData.court}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap" data-pdf-ignore>
            <button 
              onClick={() => setIsWatermarkModalOpen(true)}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" /> ضبط الختم المائي ⚖️
            </button>
            <button 
              onClick={onPrint} 
              className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" /> طباعة سريعة
            </button>
            <button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF} 
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-500 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>تصدير كـ PDF</span>
            </button>
            <button 
              onClick={handleDownloadFullDossier} 
              disabled={isGeneratingFullDossier} 
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              {isGeneratingFullDossier ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Award className="w-3.5 h-3.5" />
              )}
              <span>تحميل الملف القضائي الشامل</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Block with Embedded Gemini AI */}
        <div className="mt-5 bg-gradient-to-br from-slate-950/80 to-slate-900/80 border border-slate-800 rounded-2xl p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 text-xs font-black flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              <span>📋 الملخص التنفيذي الإجمالي المعتمد (Executive Summary)</span>
            </span>
            <button
              onClick={triggerAISummarize}
              disabled={isGeneratingAISummary}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              {isGeneratingAISummary ? 'جاري التلخيص...' : 'تحديث التلخيص بـ Gemini 🧠'}
            </button>
          </div>

          {isGeneratingAISummary ? (
            <div className="py-3 flex flex-col items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
              <p className="text-[10px] text-slate-500 font-bold font-mono">GEMINI ANALYZING DOSSIER METRIC DATA...</p>
            </div>
          ) : aiSummary ? (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-300 text-xs leading-relaxed font-semibold bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl"
            >
              {aiSummary}
            </motion.p>
          ) : (
            <p className="text-slate-300 text-xs leading-relaxed font-semibold">
              بناءً على التقارير السبعة المجمعة، يُوصى باعتماد إخلاء العقار لصالح السيدة المالكة لتخلف المستأجرين عن الدفع وتعديهم على المنشآت، وتوزيع الحصص الشرعية للورثة بنسبة توافق مطابقة تامة 100%. نسبة الثقة الفيدرالية الإجمالية للتقرير: <span className="text-amber-400 font-bold">96.8%</span>.
            </p>
          )}
        </div>
      </div>

      {/* ===== 7 SECTORS SELECTOR TABS BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2" data-pdf-ignore>
        {reportButtons.map((btn) => {
          const isActive = activeReport === btn.id;
          return (
            <button
              key={btn.id}
              data-active={isActive}
              onClick={() => setActiveReport(btn.id)}
              title={btn.desc}
              className={`px-3 py-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-white ${btn.colorClass} ${
                isActive ? 'shadow-lg text-white' : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              {btn.icon}
              <span className="text-[10px] font-black tracking-tight text-center leading-none">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== CONTENT AREA: PRINTABLE JUDICIAL SHEET ===== */}
      <div 
        className="bg-white text-slate-950 rounded-3xl p-6 md:p-10 shadow-2xl max-w-4xl mx-auto space-y-8 font-sans border border-slate-200 relative overflow-hidden leading-relaxed" 
        id="print-area" 
        ref={printAreaRef}
      >
        {/* 🏛️ Dynamic Watermark Seal background */}
        {isWatermarkEnabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" style={{ opacity: watermarkOpacity }}>
            {watermarkType === 'justice' || watermarkType === 'both' ? (
              <div className={`transform rotate-12 scale-125 md:scale-150 flex flex-col items-center justify-center border-[8px] rounded-full p-12 w-[460px] h-[460px] text-center ${
                watermarkColor === 'amber' ? 'border-amber-700/60 text-amber-800' :
                watermarkColor === 'blue' ? 'border-blue-700/60 text-blue-800' :
                'border-slate-500/60 text-slate-700'
              }`}>
                <Scale className="w-52 h-52 stroke-[1.5]" />
                <span className="text-xl font-black mt-3 tracking-widest whitespace-nowrap">مصلحة الخبراء - وزارة العدل</span>
                <span className="text-sm font-extrabold mt-1">جمهورية مصر العربية</span>
                <span className="text-[9px] font-mono font-bold mt-1 tracking-wider">EGYPTIAN COURT OFFICIAL SEAL</span>
              </div>
            ) : null}
            {watermarkType === 'eagle' ? (
              <div className={`transform -rotate-12 scale-125 md:scale-150 flex flex-col items-center justify-center border-double border-[10px] rounded-full p-10 w-[450px] h-[450px] text-center ${
                watermarkColor === 'amber' ? 'border-amber-600/50 text-amber-700' :
                watermarkColor === 'blue' ? 'border-blue-600/50 text-blue-700' :
                'border-slate-400/50 text-slate-600'
              }`}>
                <div className="border border-dashed p-4 rounded-full mb-2">
                  <Shield className="w-36 h-36 stroke-[1.2]" />
                </div>
                <span className="text-xl font-extrabold tracking-widest">وزارة العدل • قطاع الخبراء</span>
                <span className="text-xs font-bold mt-1">الختم البيومتري الإلكتروني الموحد</span>
                <span className="text-[9px] font-mono mt-1 tracking-wider">OFFICIAL COURT BIOMETRIC SEAL</span>
              </div>
            ) : null}
          </div>
        )}

        {/* State / Official Document Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 relative z-10 text-right">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-xs">جمهورية مصر العربية</h4>
            <h4 className="font-extrabold text-xs">وزارة العدل - مصلحة الخبراء</h4>
            <h4 className="text-slate-600 text-[10px] font-semibold">المكتب الرقمي الموحد بمحافظات القاهرة الكبرى</h4>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-slate-950 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-1">
              ⚖️
            </div>
            <span className="text-[10px] font-extrabold block">العدل أساس الملك</span>
          </div>

          <div className="text-left text-xs font-mono font-bold text-slate-700">
            <div>رقم الملف: {caseData.caseNumber}</div>
            <div>الإصدار الحركي: v{version}</div>
            <div className="text-[10px] text-red-600 font-bold mt-0.5">سري ورسمي للغاية</div>
          </div>
        </div>

        {/* ----- RENDER ACTIVE TAB CONTENT ----- */}
        <div className="relative z-10 space-y-6">
          
          {/* 1. EXPERTS consensus tab */}
          {activeReport === 'experts' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-800 font-black text-sm border-b border-slate-200 pb-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>أولاً: توصيات السرب التوافقي للخبراء المستقلين</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">معتمد فدرالياً</span>
              </div>
              
              <div className="space-y-3">
                {data.expertsRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-black text-xs">{rec.agent}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.priority === 'عالي' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'متوسط' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>الأولوية: {rec.priority}</span>
                    </div>
                    <p className="text-slate-700 text-xs mt-2 leading-relaxed font-semibold">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. TECHNICAL digital forensic tab */}
          {activeReport === 'technical' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-cyan-800 font-black text-sm border-b border-slate-200 pb-2">
                <FileCheck className="w-5 h-5 text-cyan-600" />
                <span>ثانياً: الأدلة الرقمية والتحريات الفنية الموثقة</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold block mb-1">حالة البنية الفنية</span>
                  <p className="text-slate-900 font-bold text-xs">{data.technicalData.systemStatus}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold block mb-1.5">الأدلة والمستندات الرقمية في الـ Vault</span>
                  <ul className="text-slate-700 text-xs list-disc list-inside space-y-1 pr-1 font-semibold">
                    {data.technicalData.digitalEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold block mb-1">تتبع التحريات على الخوادم</span>
                <p className="text-slate-900 font-semibold text-xs leading-relaxed">{data.technicalData.logs}</p>
              </div>
              <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-xl text-xs text-cyan-800 font-semibold">
                💡 {data.technicalData.recommendations}
              </div>
            </div>
          )}

          {/* 3. ENGINEERING tab */}
          {activeReport === 'engineering' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm border-b border-slate-200 pb-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>ثالثاً: التقييم والمقايسة الهندسية الإدارية</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-bold block mb-0.5">مساحة الأرض</span>
                  <p className="text-slate-900 font-black text-sm">{data.engineeringData.totalArea}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-bold block mb-0.5">مسطح البناء الكلي</span>
                  <p className="text-slate-900 font-black text-sm">{data.engineeringData.buildingArea}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-bold block mb-0.5">أدوار المنشأ</span>
                  <p className="text-slate-900 font-black text-sm">{data.engineeringData.floors} أدوار</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-bold block mb-0.5">طراز التشطيب</span>
                  <p className="text-slate-900 font-black text-sm">{data.engineeringData.finish}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 text-xs font-bold block">حالة ومتانة الهيكل الإنشائي الميداني:</span>
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">{data.engineeringData.structuralStatus}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 text-xs font-bold block">التراخيص والرخص الرسمية المعتمدة بالحي:</span>
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">{data.engineeringData.administrativeStatus}</p>
              </div>
            </div>
          )}

          {/* 4. FINANCIAL tab */}
          {activeReport === 'financial' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-blue-800 font-black text-sm border-b border-slate-200 pb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>رابعاً: التقييم المالي والحسابات المصرفية للأمانات</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block">القيمة السوقية الكلية</span>
                  <p className="text-emerald-800 font-black text-sm font-mono">{data.financialData.totalValue.toLocaleString('ar-EG')} ج.م</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block">قيمة الأرض المقدرة</span>
                  <p className="text-slate-900 font-black text-sm font-mono">{data.financialData.landValue.toLocaleString('ar-EG')} ج.م</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] font-bold block">تكاليف البناء والخرسانة</span>
                  <p className="text-slate-900 font-black text-sm font-mono">{data.financialData.constructionCost.toLocaleString('ar-EG')} ج.م</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold block mb-1">الإيراد السنوي للأجر</span>
                  <p className="text-slate-900 font-extrabold text-xs font-mono">{data.financialData.annualRent.toLocaleString('ar-EG')} ج.م / سنوياً</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold block mb-1">الضريبة العقارية السنوية المقدرة</span>
                  <p className="text-red-700 font-extrabold text-xs font-mono">{data.financialData.propertyTax.toLocaleString('ar-EG')} ج.م / سنوياً</p>
                </div>
              </div>

              {/* Bank Escrow details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold block mb-1.5">حسابات الإيداع المالي وأمانات المحكمة المفتوحة:</span>
                <ul className="text-slate-800 text-xs list-disc list-inside space-y-1 pr-1 font-semibold">
                  {data.financialData.bankAccounts.map((acc, idx) => (
                    <li key={idx}>{acc}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 font-semibold">
                💰 {data.financialData.recommendations}
              </div>
            </div>
          )}

          {/* 5. INSURANCE tab */}
          {activeReport === 'insurance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-purple-800 font-black text-sm border-b border-slate-200 pb-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>خامساً: بوليصة التأمين وجدوى التطوير والاستثمار</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold block">رقم بوليصة التأمين الرسمية</span>
                  <p className="text-slate-900 font-black text-xs font-mono mt-1">{data.insuranceData.policyNumber}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-bold">قيمة حماية التغطية القصوى</span>
                  <p className="text-emerald-800 font-black text-xs font-mono mt-1">{data.insuranceData.coverageAmount.toLocaleString('ar-EG')} ج.م</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold block">التغطية التأمينية وضمان الأضرار:</span>
                <p className="text-slate-800 text-xs font-semibold mt-1">{data.insuranceData.coverageType} • {data.insuranceData.validity}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold block">دراسة الجدوى ومعدلات العائد العقاري:</span>
                <p className="text-slate-800 text-xs font-semibold mt-1">{data.insuranceData.projectFeasibility}</p>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-xs text-purple-800 font-semibold">
                🛡️ {data.insuranceData.recommendations}
              </div>
            </div>
          )}

          {/* 6. SECURITY & ENFORCEMENT merged tab (police + interior) */}
          {activeReport === 'security' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-red-800 font-black text-sm border-b border-slate-200 pb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>سادساً: تقرير الأمن والتنفيذ المشترك (الشرطة ووزارة الداخلية)</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold">ملف موحد سيادي</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50/20 border border-red-200/50 p-4 rounded-xl">
                  <span className="text-red-800 text-xs font-black flex items-center gap-1">
                    👮 <span>محضر الضبط والشرطة المحلية:</span>
                  </span>
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed mt-2">{data.securityData.policeReport}</p>
                </div>
                <div className="bg-emerald-50/20 border border-emerald-200/50 p-4 rounded-xl">
                  <span className="text-emerald-800 text-xs font-black flex items-center gap-1">
                    🛡️ <span>توجيهات قطاع الأمن بوزارة الداخلية:</span>
                  </span>
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed mt-2">{data.securityData.interiorDirectives}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold block">قوة مأمورية التنفيذ الجبري المكلفة بالدعم الميداني:</span>
                <p className="text-slate-900 font-semibold text-xs mt-1">
                  {data.securityData.executionForce}
                </p>
              </div>

              <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-850 font-semibold">
                🚨 {data.securityData.recommendations}
              </div>
            </div>
          )}

          {/* 7. JUDGMENT draft tab */}
          {activeReport === 'judgment' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm border-b border-slate-200 pb-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>سابعاً: مسودة منطوق وأحكام المحكمة المقترحة</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold animate-pulse">مسودة رسمية معجلة</span>
              </div>

              <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-inner font-mono text-xs leading-relaxed whitespace-pre-line text-right">
                {data.proposedJudgment}
              </div>

              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-xs text-amber-800 font-semibold">
                ⚖️ هذه الصيغة والبنود مصاغة بالكامل لتتوافق مع القوانين الإيجارية والميراث المعتمد بمصر.
              </div>
            </div>
          )}

          {/* 8. TECHNICAL OPINION SUMMARY FOR JUDGE tab */}
          {activeReport === 'opinion' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-yellow-900 font-black text-sm">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <span>ثامناً: خلاصة الرأي الفني للقاضي (جاهزة للنسخ والمذكرات)</span>
                  <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">بنية معتمدة قابلة للنسخ</span>
                </div>
                <button
                  onClick={handleCopyOpinion}
                  className="bg-yellow-600 hover:bg-yellow-700 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {copiedOpinion ? (
                    <span className="text-slate-950 font-black flex items-center gap-1">✓ تم النسخ!</span>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص كاملاً</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm font-sans text-xs leading-relaxed whitespace-pre-line text-right relative group">
                <button
                  onClick={handleCopyOpinion}
                  className="absolute top-4 left-4 p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-950 rounded-lg border border-slate-200 transition-all shadow-sm opacity-60 group-hover:opacity-100"
                  title="نسخ المذكرة"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {data.technicalOpinion}
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl text-xs text-yellow-800 font-semibold leading-relaxed">
                ℹ️ تم توليد هذا الرأي الفني الاستشاري خصيصاً ليناسب الإدراج الفوري والمباشر في المذكرات وحيثيات الأحكام دون الحاجة لتعديل الصياغة اللغوية أو الأرقام المساحية والشرعية.
              </div>
            </div>
          )}

        </div>

        {/* ============================================================
            INNOVATIVE FEATURE 2: HYPERLINKED REFERENCE DOCUMENTS 
            ============================================================ */}
        <div className="border-t border-slate-200 pt-6 space-y-3" data-pdf-ignore>
          <span className="text-slate-900 font-black text-xs flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-amber-500" />
            <span>نظام الوثائق المتشعبة والمرتبطة بالتقرير (Hyperlinked Documents)</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {linkedDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDocPreview(doc)}
                className="p-3 bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 rounded-2xl text-right transition-all flex flex-col justify-between h-24 cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block leading-none">{doc.type}</span>
                  <span className="text-[11px] font-black text-slate-900 block leading-tight truncate w-full">{doc.title}</span>
                </div>
                <div className="flex items-center justify-between w-full text-[9px] text-slate-400 font-bold font-mono">
                  <span>{doc.size}</span>
                  <span className="text-emerald-600">✓ عرض المرفق</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================
            INNOVATIVE FEATURE 5: DIAGNOSTIC SMART ALERTS & CONFLICTS CHECKER 
            ============================================================ */}
        <div className="border-t border-slate-200 pt-6 space-y-3" data-pdf-ignore>
          <span className="text-slate-900 font-black text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>لوحة الفحص الذكي للنزاع ومكافحة التعارضات الفنية</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((al, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-right ${
                  al.type === 'danger' ? 'bg-red-50/50 border-red-200 text-red-950' :
                  al.type === 'warning' ? 'bg-amber-50/50 border-amber-200 text-amber-950' :
                  'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="text-base leading-none">
                      {al.type === 'danger' ? '🔴' : al.type === 'warning' ? '🟡' : '🟢'}
                    </span>
                    <span className="font-black">{al.title}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-semibold opacity-90">{al.description}</p>
                </div>
                <div className="border-t border-slate-200/40 pt-2 text-[9px] font-black italic">
                  * نصيحة القضاء: {al.tip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            INNOVATIVE FEATURE 4: INTERACTIVE CASE TIMELINE 
            ============================================================ */}
        <div className="border-t border-slate-200 pt-6 space-y-3" data-pdf-ignore>
          <span className="text-slate-900 font-black text-xs flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>الجدول الزمني التفاعلي ومحطات الملف القضائي (Interactive Timeline)</span>
          </span>
          <div className="relative border-r border-slate-200 mr-2 pr-4 space-y-4">
            {timeline.map((milestone) => (
              <div key={milestone.id} className="relative text-right group">
                {/* Node marker */}
                <button
                  onClick={() => handleToggleTimelineStatus(milestone.id)}
                  title="اضغط لتغيير الحالة بالتناوب"
                  className={`absolute -right-[21px] top-1.5 w-3 h-3 rounded-full border-2 bg-white transition-all cursor-pointer ${
                    milestone.status === 'done' ? 'border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/20' :
                    milestone.status === 'progress' ? 'border-amber-500 animate-pulse bg-amber-500 shadow-md shadow-amber-500/20' :
                    milestone.status === 'delayed' ? 'border-red-500 bg-red-500 shadow-md shadow-red-500/20' :
                    'border-slate-300'
                  }`}
                />
                
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900">{milestone.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                        milestone.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                        milestone.status === 'progress' ? 'bg-amber-100 text-amber-800' :
                        milestone.status === 'delayed' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {milestone.statusLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-tight">{milestone.notes}</p>
                  </div>
                  <span className="text-[10px] font-black font-mono text-slate-400">{milestone.date}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 font-bold mr-2">* اضغط على الدوائر الملونة لتغيير حالة الإجراء القضائي بالتناوب.</p>
        </div>

        {/* ============================================================
            INNOVATIVE FEATURE 3: MULTI-PARTY DIGITAL SIGN-OFF PANEL 
            ============================================================ */}
        <div className="border-t border-slate-200 pt-8 text-right space-y-4">
          <span className="text-slate-900 font-black text-xs flex items-center gap-1.5">
            <Signature className="w-4 h-4 text-emerald-600" />
            <span>منصة التوقيع الجماعي والبيومتري الموحد (Multi-Party Sign-off)</span>
          </span>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Judge Sign */}
            <div className="border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-40 text-center bg-slate-50 relative overflow-hidden">
              <span className="font-bold text-[10px] text-slate-500 block">رئيس الدائرة (رئيس المحكمة)</span>
              <div className="my-auto">
                {signatures.judge.signed ? (
                  <div className="space-y-1">
                    <span className="text-red-600 font-extrabold text-[11px] block">✓ المستشار رئيس الدائرة</span>
                    <span className="text-[7px] text-slate-400 block font-mono">{signatures.judge.hash}</span>
                    <span className="text-[8px] text-emerald-600 font-bold block">{signatures.judge.date}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSignBiometric('judge')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                  >
                    <Signature className="w-3.5 h-3.5" /> وقع بالبصمة
                  </button>
                )}
              </div>
              <div className="text-[7px] font-bold text-slate-400 border-t border-dashed pt-1 mt-1">
                {signatures.judge.signed ? '✓ مصدق ومختوم' : '⚠️ بانتظار البصمة'}
              </div>
            </div>

            {/* Expert Sign */}
            <div className="border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-40 text-center bg-slate-50 relative overflow-hidden">
              <span className="font-bold text-[10px] text-slate-500 block">الخبير العقاري والإنشائي</span>
              <div className="my-auto space-y-1">
                <span className="text-slate-900 font-black text-[11px] block">كابتن حسام</span>
                <span className="text-[7px] text-slate-400 block font-mono">{signatures.expert.hash}</span>
                <span className="text-[8px] text-emerald-600 font-bold block">{signatures.expert.date}</span>
              </div>
              <div className="text-[7px] font-bold text-emerald-600 border-t border-dashed pt-1 mt-1">
                ✓ تم التحقق بالبصمة
              </div>
            </div>

            {/* Prosecution Sign */}
            <div className="border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-40 text-center bg-slate-50 relative overflow-hidden">
              <span className="font-bold text-[10px] text-slate-500 block">النيابة العامة (نيابة الأسرة)</span>
              <div className="my-auto">
                {signatures.prosecution.signed ? (
                  <div className="space-y-1">
                    <span className="text-blue-800 font-extrabold text-[11px] block">✓ رئيس النيابة العامة</span>
                    <span className="text-[7px] text-slate-400 block font-mono">{signatures.prosecution.hash}</span>
                    <span className="text-[8px] text-emerald-600 font-bold block">{signatures.prosecution.date}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSignBiometric('prosecution')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                  >
                    <Signature className="w-3.5 h-3.5" /> وقع بالبصمة
                  </button>
                )}
              </div>
              <div className="text-[7px] font-bold text-slate-400 border-t border-dashed pt-1 mt-1">
                {signatures.prosecution.signed ? '✓ مصدق ومختوم' : '⚠️ بانتظار البصمة'}
              </div>
            </div>

            {/* Clerk Sign */}
            <div className="border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-40 text-center bg-slate-50 relative overflow-hidden">
              <span className="font-bold text-[10px] text-slate-500 block">أمين سر الجلسة (قلم الكتاب)</span>
              <div className="my-auto space-y-1">
                <span className="text-slate-800 font-bold text-[11px] block">أمين سر الجلسة</span>
                <span className="text-[7px] text-slate-400 block font-mono">{signatures.clerk.hash}</span>
                <span className="text-[8px] text-emerald-600 font-bold block">{signatures.clerk.date}</span>
              </div>
              <div className="text-[7px] font-bold text-emerald-600 border-t border-dashed pt-1 mt-1">
                ✓ تم التحقق بالبصمة
              </div>
            </div>
          </div>
        </div>

        {/* Closing official sign-off footer of document */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs relative z-10 font-bold text-slate-500">
          <div className="space-y-1">
            <span className="text-slate-900 block font-black">مصلحة خبراء وزارة العدل المصرية</span>
            <span className="text-[10px] block">تم التحقق من الوثيقة ومطابقتها للأرقام القومية ومسح الـ GPS سحابياً</span>
          </div>

          <div className="flex items-center gap-4">
            {includeQRCode && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 px-1.5 rounded-xl text-right">
                <div className="w-10 h-10 bg-slate-950 flex items-center justify-center text-white rounded-lg">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div className="text-[8px] text-slate-600 font-black leading-tight">
                  <div className="text-slate-900 font-black">باركود التحقق القضائي</div>
                  <div>ID: {caseData.caseNumber}</div>
                  <div className="text-emerald-600 font-mono">MOJ-SECURE-QR</div>
                </div>
              </div>
            )}

            {isCertifiedStampVisible && (
              <div className={`border-2 border-double rounded-full w-14 h-14 flex flex-col items-center justify-center p-1 text-center transform -rotate-12 ${
                watermarkColor === 'amber' ? 'border-amber-600 text-amber-700 bg-amber-500/5' :
                watermarkColor === 'blue' ? 'border-blue-600 text-blue-700 bg-blue-500/5' :
                'border-slate-500 text-slate-600 bg-slate-500/5'
              }`}>
                <span className="text-[6px] font-black leading-none">خاتم النسر</span>
                <span className="text-[5px] font-bold leading-none mt-0.5">وزارة العدل</span>
                <Scale className="w-4 h-4 my-0.5" />
                <span className="text-[4px] font-mono leading-none">VERIFIED</span>
              </div>
            )}
          </div>

          <div className="text-center font-bold">
            <span className="block text-[10px]">الخبير القضائي المنتدب بالدعوى</span>
            <span className="text-slate-900 font-black block mt-0.5">كابتن حسام</span>
            <div className="text-[8px] text-emerald-600 font-mono mt-1">✓ BIOMETRIC SEAL APPROVED</div>
          </div>
        </div>

      </div>

      {/* ============================================================
          INNOVATIVE FEATURE 1: SYSTEM VERSION CONTROL & LOG LOGISTICS
          ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4" data-pdf-ignore>
        <div className="flex items-center justify-between">
          <span className="text-white font-black text-sm flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-emerald-500" />
            <span>نظام تعقب التعديلات والإصدارات القضائية (Version History Log)</span>
          </span>
          <button 
            onClick={() => setShowAddVersionModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
          >
            <GitBranch className="w-3.5 h-3.5" /> إصدار نسخة معدلة جديدة +
          </button>
        </div>

        <div className="space-y-2.5">
          {versionHistory.map((log) => (
            <div key={log.version} className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850 flex items-start gap-3 justify-between">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xs">إصدار v{log.version} • {log.action}</span>
                  <span className="text-[9px] text-slate-500 font-bold">{log.date}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">{log.notes}</p>
                <div className="text-[9px] text-slate-500 font-black">بواسطة: {log.author}</div>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-lg">v{log.version}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== WATERMARK SETTINGS MODAL (HIGH FIDELITY PREVIEW CONTROL) ===== */}
      {isWatermarkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4" style={{ direction: 'rtl' }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>منظومة التحكم بالأختام والدمغات الرسمية</span>
              </h3>
              <button onClick={() => setIsWatermarkModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300 cursor-pointer">
                <span>تفعيل الختم المائي للشعار بالخلفية:</span>
                <input 
                  type="checkbox" 
                  checked={isWatermarkEnabled} 
                  onChange={(e) => setIsWatermarkEnabled(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" 
                />
              </label>

              {isWatermarkEnabled && (
                <>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400">نموذج الختم والدمغة:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['justice', 'eagle', 'both'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setWatermarkType(type)}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            watermarkType === type ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {type === 'justice' ? 'شعار الخبراء' : type === 'eagle' ? 'ختم النسر' : 'الشعارين معاً'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400">حبر الختم المعتمد:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['amber', 'blue', 'gray'] as const).map((color) => (
                        <button
                          key={color}
                          onClick={() => setWatermarkColor(color)}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            watermarkColor === color ? 'bg-amber-500/10 border border-amber-500 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {color === 'amber' ? 'برونزي ذهبي' : color === 'blue' ? 'أزرق سيادي' : 'رمادي كربوني'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>درجة شفافية الختم:</span>
                      <span>{(watermarkOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.03" 
                      max="0.25" 
                      step="0.01" 
                      value={watermarkOpacity} 
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800" 
                    />
                  </div>
                </>
              )}

              <label className="flex items-center justify-between text-xs font-bold text-slate-300 cursor-pointer">
                <span>إدراج باركود التحقق الرقمي (QR Code):</span>
                <input 
                  type="checkbox" 
                  checked={includeQRCode} 
                  onChange={(e) => setIncludeQRCode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" 
                />
              </label>

              <label className="flex items-center justify-between text-xs font-bold text-slate-300 cursor-pointer">
                <span>إدراج ختم النسر الدائري المصغر:</span>
                <input 
                  type="checkbox" 
                  checked={isCertifiedStampVisible} 
                  onChange={(e) => setIsCertifiedStampVisible(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" 
                />
              </label>
            </div>

            <button 
              onClick={() => setIsWatermarkModalOpen(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              موافق وتطبيق الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* ===== INTERACTIVE MODAL 2: HYPERLINKED DOCUMENT PREVIEW ===== */}
      <AnimatePresence>
        {activeDocPreview && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right" style={{ direction: 'rtl' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">{activeDocPreview.type}</span>
                  <h3 className="text-md font-black text-white mt-1.5">{activeDocPreview.title}</h3>
                </div>
                <button onClick={() => setActiveDocPreview(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {activeDocPreview.content}
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-bold bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <div>
                    <span className="block text-slate-500">رقم الإيداع المرجعي:</span>
                    <span className="text-white">{activeDocPreview.ref}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">تاريخ الإثبات:</span>
                    <span className="text-white">{activeDocPreview.date}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-500">تشفير التحقق الرقمي SHA-256 Hash:</span>
                    <span className="text-emerald-500 font-mono text-[9px] truncate block">{activeDocPreview.hash}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <span className="text-[11px] text-emerald-400 font-bold ml-auto">✓ مستند قضائي مطابق رقمياً بنسبة 100%</span>
                <button 
                  onClick={() => { triggerToast('📥 جاري تنزيل نسخة الوثيقة المرفقة...', 'info'); }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer"
                >
                  تنزيل الوثيقة المشفرة
                </button>
                <button onClick={() => setActiveDocPreview(null)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl cursor-pointer">
                  إغلاق المعاينة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== INTERACTIVE MODAL 3: BIOMETRIC SCANNER SIMULATOR ===== */}
      <AnimatePresence>
        {isSigningBiometric && activeSignatory && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-sm text-center p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Scanner Line Effect */}
              <div className="absolute top-1/3 left-0 w-full h-1 bg-amber-500/50 animate-bounce blur-[2px]"></div>

              <div className="space-y-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  BIOMETRIC AUTHENTICATION
                </span>
                <h3 className="text-lg font-black text-white">نظام التوقيع بالبصمة البيومترية</h3>
                <p className="text-xs text-slate-400 leading-tight">
                  الرجاء الانتظار لحين قراءة البصمة والتحقق الفيدرالي للرقم القومي لـ {signatures[activeSignatory].name}
                </p>
              </div>

              {/* Fingeprint Visual */}
              <div className="w-24 h-24 border-2 border-dashed border-amber-500/30 rounded-full flex items-center justify-center mx-auto bg-slate-950/50 relative shadow-inner">
                <Shield className="w-12 h-12 text-amber-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200" style={{ width: `${biometricProgress}%` }}></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {biometricProgress < 40 && 'جاري تشغيل قارئ البصمات الإلكتروني...'}
                  {biometricProgress >= 40 && biometricProgress < 80 && 'جاري مطابقة بصمات اليد وتدقيق التواقيع...'}
                  {biometricProgress >= 80 && biometricProgress < 100 && 'جاري توليد شهادة التوقيع المؤمنة...'}
                  {biometricProgress === 100 && 'مكتمل! تم التوقيع والاعتماد.'}
                </span>
              </div>

              <button 
                onClick={() => { setIsSigningBiometric(false); setActiveSignatory(null); }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                إلغاء المأمورية الأمنية
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== INTERACTIVE MODAL 4: VERSION ADDITION LOG FORM ===== */}
      <AnimatePresence>
        {showAddVersionModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right" style={{ direction: 'rtl' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-1.5">
                  <GitBranch className="w-5 h-5 text-emerald-500" />
                  <span>إصدار نسخة جديدة معدلة للتقرير</span>
                </h3>
                <button onClick={() => setShowAddVersionModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVersion} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">مُعدّ التعديل ومصدر القرار:</label>
                  <input 
                    type="text" 
                    value={newVersionAuthor} 
                    onChange={(e) => setNewVersionAuthor(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">موضوع الإجراء والتعديل الأساسي:</label>
                  <input 
                    type="text" 
                    value={newVersionAction} 
                    onChange={(e) => setNewVersionAction(e.target.value)}
                    required
                    placeholder="مثال: دمج مذكرات دفاع المدعى عليه وتحديث الأجور"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">ملاحظات توثيقية إضافية:</label>
                  <textarea 
                    value={newVersionNotes} 
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    rows={3}
                    placeholder="تفاصيل التغييرات ومبررات صياغة هذا الإصدار الفيدرالي الجديد..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setShowAddVersionModal(false)} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black px-4 py-2 rounded-xl cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl cursor-pointer"
                  >
                    اعتماد وإصدار v{version + 1}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🏛️ HIDDEN FULL INTEGRATED DOSSIER FOR HIGH RESOLUTION COMPREHENSIVE PDF 🏛️ */}
      {/* ========================================================================= */}
      <div style={{ position: 'absolute', top: '-15000px', left: '-15000px', width: '794px', overflow: 'hidden' }}>
        <div ref={fullDossierRef} className="bg-white text-slate-950 p-12 space-y-16 font-sans select-none" style={{ direction: 'rtl' }}>
          
          {/* ==================== COVER PAGE ==================== */}
          <div className="border-8 border-double border-slate-900 p-8 flex flex-col justify-between h-[1050px] text-center bg-white relative">
            
            <div className="flex items-start justify-between border-b border-slate-300 pb-4">
              <div className="text-right space-y-1 text-[10px] font-bold text-slate-800">
                <div>جمهورية مصر العربية</div>
                <div>وزارة العدل - مصلحة الخبراء</div>
                <div>المكتب المركزي المطور للتصديق</div>
              </div>
              <div className="w-10 h-10 border border-slate-900 rounded-full flex items-center justify-center font-bold text-lg">
                ⚖️
              </div>
              <div className="text-left space-y-1 text-[10px] font-mono font-bold text-slate-600">
                <div>رقم الملف: {caseData.caseNumber}</div>
                <div>التاريخ: {caseData.date}</div>
                <div className="text-red-600 font-black text-[9px]">حرز قضائي مشفر معتمد</div>
              </div>
            </div>

            <div className="my-auto space-y-6">
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-4 py-1 rounded-full font-black uppercase tracking-widest inline-block">
                مستند رسمي فدرالي معتمد
              </span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                الملف القضائي الفني الإجمالي المتكامل
              </h1>
              <p className="text-lg font-bold text-slate-700 underline underline-offset-4">
                تقرير الخبراء والرفع الطبوغرافي الرقمي والمنطوق النهائي
              </p>
              
              <div className="max-w-md mx-auto border border-slate-200 rounded-xl p-4 bg-slate-50 text-right text-xs space-y-2 mt-6 leading-relaxed">
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-500 font-bold">المحكمة والهيئة القضائية المختصة:</span>
                  <span className="font-extrabold">{caseData.court}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-500 font-bold">السيد رئيس الدائرة والمستشار:</span>
                  <span className="font-extrabold">{caseData.judge}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-500 font-bold">الخبير المنتدب بالملف:</span>
                  <span className="font-extrabold">كابتن حسام</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200 col-span-2">
                  <span className="text-slate-500 font-bold">خصومة الدعوى العقارية:</span>
                  <span className="font-extrabold text-red-700 leading-tight">{caseData.dispute.hasDispute ? caseData.dispute.details : 'فرز الأنصبة والرفع المساحي والتمكين.'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 pt-6 flex items-center justify-between">
              <div className="text-right text-[10px] space-y-1">
                <div className="font-black text-slate-900">نظام سمارت إكسبيرت القضائي المستقل</div>
                <div className="text-slate-500">منصة الاستعلام الطيفي والربط المساحي ثنائي وثلاثي الأبعاد</div>
              </div>
              
              <div className="border-4 border-double border-emerald-600 p-2 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center text-emerald-600 font-extrabold text-[8px] leading-tight rotate-12 bg-white/80">
                <span>مصلحة الخبراء</span>
                <span>بصمة معتمدة</span>
                <span>✓ APPROVED</span>
              </div>
              
              <div className="text-left text-[10px] space-y-1">
                <div className="font-bold text-slate-500">مصلحة الخبراء - وزارة العدل</div>
                <div className="font-mono text-slate-400">© 2026 MINISTRY OF JUSTICE</div>
              </div>
            </div>

          </div>

          {/* ==================== PAGE 1: EXPERT INSIGHTS & ENGINEERING REPORT ==================== */}
          <div className="space-y-8 pt-8">
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h2 className="text-xl font-black text-slate-900">الباب الأول: تقرير الخبرة الفنية والرفع الطبوغرافي الرقمي</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">توصيات الخبراء المستقلين والمقايسة الإنشائية والمواصفات الإحصائية</p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-right">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black border-r-4 border-slate-900">
                أولاً: توصيات وخلاصة آراء الخبراء المستقلين بالتطابق الفدرالي
              </h3>
              <ul className="list-decimal list-inside space-y-1.5 font-semibold pr-2">
                {data.expertsRecommendations.map((rec, i) => (
                  <li key={i}><strong className="text-slate-950">{rec.agent}:</strong> {rec.recommendation} (الأولوية: {rec.priority})</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-right">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black border-r-4 border-slate-900">
                ثانياً: التقييم والمقايسة الهندسية الميدانية للعقار والحدود
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">المساحة الإجمالية:</strong> <span className="font-black">{data.engineeringData.totalArea}</span></div>
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">مسطح البناء الإنشائي:</strong> <span className="font-black">{data.engineeringData.buildingArea}</span></div>
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">عدد الأدوار:</strong> <span className="font-black">{data.engineeringData.floors} أدوار</span></div>
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">طراز التشطيب الفعلي:</strong> <span className="font-black">{data.engineeringData.finish}</span></div>
              </div>
              <p className="font-semibold text-slate-700 leading-normal mt-2">* {data.engineeringData.structuralStatus}</p>
            </div>
          </div>

          {/* ==================== PAGE 2: FINANCIAL, BANKING & SECURITY REPORTS ==================== */}
          <div className="space-y-8 pt-8 border-t border-dashed border-slate-300">
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h2 className="text-xl font-black text-slate-900">الباب الثاني: التقييم المالي وتنسيقات الأجهزة التنفيذية والسيادية</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">التقرير المالي وحساب الأمانات وضوابط مأموريات الأمن المشتركة</p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-right">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black border-r-4 border-slate-900">
                أولاً: التقييم المالي وعوائد الاستثمار وحصر الضرائب والرسوم
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">القيمة السوقية الكلية:</strong> <span className="font-black font-mono">{data.financialData.totalValue.toLocaleString('ar-EG')} ج.م</span></div>
                <div className="border-b pb-1.5 flex justify-between"><strong className="text-slate-500">الضريبة العقارية السنوية:</strong> <span className="font-black font-mono text-red-700">{data.financialData.propertyTax.toLocaleString('ar-EG')} ج.م</span></div>
                <div className="border-b pb-1.5 flex justify-between col-span-2 bg-emerald-50 p-2 rounded"><strong className="text-emerald-950 font-black">حساب أمانات المحكمة المودع به:</strong> <span className="font-black font-mono text-emerald-800">حساب رقم 1004523901 بنك مصر</span></div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-right">
              <h3 className="bg-red-50 text-red-950 px-3 py-1.5 rounded font-black border-r-4 border-red-700">
                ثانياً: تقرير الأمن والتنفيذ المشترك الموحد (الشرطة ووزارة الداخلية)
              </h3>
              <div className="space-y-2 pr-2 font-semibold text-slate-700">
                <p><strong>تقرير الشرطة المحلية للموقع:</strong> {data.securityData.policeReport}</p>
                <p><strong>توجيهات قطاع الأمن بوزارة الداخلية:</strong> {data.securityData.interiorDirectives}</p>
                <p><strong>قوات مأمورية الإخلاء والدعم الميداني:</strong> {data.securityData.executionForce}</p>
              </div>
            </div>
          </div>

          {/* ==================== PAGE 3: INTEGRATED JUDGMENT DECREE & CONFLICT ANALYTICS ==================== */}
          <div className="space-y-8 pt-8 border-t border-dashed border-slate-300">
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h2 className="text-xl font-black text-slate-900">الباب الثالث: منطوق وأحكام المحكمة والتمثيل التوقيعي الجماعي</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">البنود النهائية المعجلة، ومكافحة التعارضات، والتوقيعات البيومترية الموثقة</p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-right">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black border-r-4 border-slate-900">
                أولاً: منطوق وأحكام المحكمة والتمكين الجبري النهائي
              </h3>
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-line text-right">
                {data.proposedJudgment}
              </div>
            </div>

            {/* Official Biometric Sign-off on complete integrated dossier */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[10px] border-t border-slate-300">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 block">أمين سر الجلسة</span>
                <span className="font-mono text-emerald-600 block font-bold">✓ VERIFIED BY DIGITAL KEY</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-500 block">الخبير المنتدب بالدعوى</span>
                <span className="font-black text-slate-900 block">كابتن حسام</span>
                <span className="font-mono text-emerald-600 block font-bold">✓ BIOMETRIC SEAL APPROVED</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-500 block">المستشار رئيس الدائرة</span>
                <span className="font-mono text-red-600 block font-bold">✓ JUDICIAL DECISION SEALED</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

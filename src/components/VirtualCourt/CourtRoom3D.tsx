import React, { useEffect, useRef, useState } from 'react';
import { 
  Scale, 
  Shield, 
  Building2, 
  User, 
  Briefcase, 
  Users, 
  Landmark, 
  Info, 
  CheckCircle, 
  Cpu, 
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  ClipboardList,
  ChevronLeft,
  X,
  Zap,
  TrendingUp,
  FileText,
  Gavel,
  Check,
  CheckSquare
} from 'lucide-react';
import { CaseData, CalculationResults } from '../../types';
import { triggerToast } from '../../lib/toast';

interface CourtRoom3DProps {
  caseData: CaseData;
  verdict: string;
  activeAgent: string;
  results: CalculationResults;
  onExecuteVerdict?: (verdictDetails: { title: string; recipient: string; force: string }) => void;
  executionChecklist?: Array<{ id: string; label: string; done: boolean; date: string; notes: string }>;
  bailiffTasks?: Array<{ id: string; title: string; recipient: string; status: 'completed' | 'in-progress' | 'pending'; date: string; officer: string; force: string }>;
  onToggleChecklist?: (id: string) => void;
}

type HologramTab = 'verdict' | 'calculations' | 'recommendations' | 'actions';
type HotspotType = 'none' | 'judge' | 'plaintiff' | 'defendant' | 'authorities';

export default function CourtRoom3D({ 
  caseData, 
  verdict, 
  activeAgent, 
  results,
  onExecuteVerdict,
  executionChecklist = [],
  bailiffTasks = [],
  onToggleChecklist
}: CourtRoom3DProps) {
  const [activeHologramTab, setActiveHologramTab] = useState<HologramTab>('verdict');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotType>('none');
  const [appealSimulated, setAppealSimulated] = useState(false);
  const [appealLog, setAppealLog] = useState<string>('');
  const [appealProgress, setAppealProgress] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState<HotspotType>('none');

  // Update active hologram tab automatically when verdict changes
  useEffect(() => {
    if (verdict) {
      setActiveHologramTab('verdict');
      setAppealSimulated(false);
      setAppealLog('');
      setAppealProgress(0);
    }
  }, [verdict]);

  // Default fallback execution steps if not provided via props
  const defaultChecklist = [
    { id: 'exec1', label: 'قيد صحيفة الدعوى بجدول المحكمة والترسيم الفيدرالي', done: true, date: '2026-06-10', notes: 'تم السداد والقيد بالرقم الفيدرالي الموحد' },
    { id: 'exec2', label: 'إعلان الخصم بصحيفة الدعوى رسمياً عبر قلم المحضرين', done: true, date: '2026-06-15', notes: 'تم التسليم لشخص المراد إعلانه مع الإثبات الجغرافي' },
    { id: 'exec3', label: 'ندب مكتب خبراء وزارة العدل المعاين وندب اللجنة الثلاثية', done: true, date: '2026-06-25', notes: 'قرار المحكمة التمهيدي الصادر رقم ٣٠٥' },
    { id: 'exec4', label: 'سداد أمانة الخبير المعين بخزينة المحكمة المختصة', done: true, date: '2026-06-28', notes: 'تم سداد مبلغ الأمانة بالكامل واستلام الإيصال' },
    { id: 'exec5', label: 'المعاينة الميدانية الفنية والرفع المساحي الفعلي للعين', done: false, date: '2026-07-10', notes: 'موعد انتقال لجنة المعاينة برئاسة كابتن حسام' },
    { id: 'exec6', label: 'إيداع تقرير الخبراء الثلاثي قلم كتاب المحكمة المختصة', done: false, date: '2026-07-22', notes: 'تحت إشراف المستشار رئيس الدائرة العقارية' },
    { id: 'exec7', label: 'حضور جلسة الحكم القطعي النهائي وتلاوة منطوق التمكين', done: false, date: '2026-08-05', notes: 'إصدار صيغة الحكم القابلة للتنفيذ الجبري المباشر' },
    { id: 'exec8', label: 'مأمورية التنفيذ الجبري وتمكين القوة من تسليم العين خالية', done: false, date: '2026-08-20', notes: 'بالتنسيق مع وزارة الداخلية وقوات أمن الجيزة' }
  ];

  const activeChecklist = executionChecklist.length > 0 ? executionChecklist : defaultChecklist;
  const completedCount = activeChecklist.filter(item => item.done).length;
  const executionPercent = Math.round((completedCount / activeChecklist.length) * 100);

  // Sovereignty authorities present virtually
  const authorities = [
    { name: 'النيابة العامة', icon: Shield, role: 'تحقيق المصلحة العامة وحماية الحقوق' },
    { name: 'وزارة الداخلية', icon: Building2, role: 'تأمين مأموريات المعاينة والتنفيذ الجبري' },
    { name: 'وزارة العدل', icon: Scale, role: 'الإشراف القضائي وتعيين مكاتب الخبراء' },
    { name: 'مجلس النواب', icon: Users, role: 'مراقبة تطبيق القوانين وحيازة الأفراد' },
    { name: 'الطب الشرعي', icon: Briefcase, role: 'فحص التزييف والخطوط وسندات التمليك' },
  ];

  // Handler for hot-spot clicks
  const handleHotspotClick = (hotspot: HotspotType, label: string) => {
    setSelectedHotspot(prev => prev === hotspot ? 'none' : hotspot);
    triggerToast(`🔍 تم تركيز الاستعلام الجيوديسي على: ${label}`, 'info');
  };

  // Simulate opposing counsel appealing the verdict with sleek progress logs
  const handleSimulateAppeal = () => {
    if (appealSimulated) return;
    setAppealSimulated(true);
    setAppealProgress(10);
    setAppealLog('⏳ جاري تسجيل الطعن بالصورية المطلقة وإعداد مذكرة الاعتراض القانونية لمراجعة العقود...');
    
    setTimeout(() => {
      setAppealProgress(45);
      setAppealLog('📑 جاري توثيق الطعن بالتزوير على تواقيع التنازل في المستودع الفيدرالي...');
    }, 600);

    setTimeout(() => {
      setAppealProgress(80);
      setAppealLog('⚖️ جاري قيد عريضة الاستئناف رسمياً بالدائرة المدنية الرابعة بمحكمة الاستئناف العليا...');
    }, 1200);

    setTimeout(() => {
      setAppealProgress(100);
      setAppealLog(`⚖️ تم تسجيل عريضة الاستئناف وإصدار قرار المراجعة القطعي:
• الطاعن: "${caseData.defendant || 'المدعى عليه والشركاء'}"
• السبب: الطعن بالتزوير على سند التملك والوصايا الملحقة.
• الإجراء: إحالة أصل المستند لخبراء مصلحة الطب الشرعي (قسم أبحاث التزييف).
• الجلسة: تم تحديد جلسة مراجعة عليا طارئة للدائرة العقارية الرابعة.`);
      triggerToast('⚖️ تم رفع عريضة الطعن وتعيين جلسة استئناف طارئة!', 'warning');
    }, 1800);
  };

  // Execute direct bailiff order
  const handleEnforceVerdict = () => {
    if (onExecuteVerdict) {
      onExecuteVerdict({
        title: `قرار تمكين جبري وحراسة قضائية لـ ${caseData.caseNumber}`,
        recipient: caseData.defendant || 'المدعى عليه والشركاء',
        force: 'مصحوب بقوة أمنية من أمن الجيزة وهيئة المساحة لترسيم الحدود عيناً'
      });
      triggerToast('⚔️ تم نقل أمر التمكين القضائي فورياً لقلم المحضرين والمنفذين!', 'success');
    } else {
      triggerToast('⚔️ تم إصدار مسودة أمر تمكين قضائي لتقديمه للمحضرين!', 'success');
    }
  };

  const getAgentRecommendations = () => {
    switch (activeAgent) {
      case 'penal':
        return [
          'إحالة محضر إزالة المخالفات الميدانية للنيابة العامة كدليل جنائي معتمد.',
          'التحفظ على الصور ومقاطع المعاينة المسجلة في السجل كأدلة تلف متعمد.',
          'توقيع الغرامة الجنائية الفورية طبقاً للمادة ٣٤١ من قانون العقوبات المصري.'
        ];
      case 'personal':
        return [
          `تطبيق قسمة المواريث المعتمدة شرعاً لعدد ${caseData.heirs?.length || 2} ورثة طبقاً لجدول الأنصبة الشرعية.`,
          `عزل حصة التركة النقدية البالغة ${(results.totalPropertyValue || 500000).toLocaleString('ar-EG')} ج في حساب المحكمة لحين الإشهار.`,
          'صياغة مشروع عقد قسمة وتجنيب رضائي لتجنب فرض الحراسة القضائية.'
        ];
      case 'commercial':
        return [
          'تسييل خطابات الضمان المودعة من الشركاء المتضامنين فوراً لتغطية الخسارة.',
          'فسخ العقد الابتدائي لخلل بند الالتزام الاستثماري دون الحاجة لإعذار مسبق.',
          'إثبات التضامن الكامل لجميع الورثة والشركاء في مديونية السجل العقاري.'
        ];
      case 'administrative':
        return [
          'تقديم طلب وقف تنفيذ إداري مستعجل أمام قضاء مجلس الدولة لوقف قرار الإزالة.',
          'مراجعة خطوط التنظيم الصادرة من الوحدة المحلية لمطابقة الكود الموحد ١١٩.',
          'إبطال القرار السلبي للجهة الإدارية لتعارضه مع صيانة الملكية الخاصة بالدستور.'
        ];
      case 'forensic_doc_expert':
        return [
          'إحالة سند الملكية المطعون فيه لقسم أبحاث التزييف والتزوير بمصلحة الطب الشرعي.',
          'إلزام الخصم بتقديم أصول العقود والوصايا للمضاهاة الخطية والميكروسكوبية.',
          'وقف السير في الدعوى المدنية مؤقتاً لحين الفصل النهائي في ادعاء التزوير جنائياً.'
        ];
      default:
        return [
          `تطابق الرفع المساحي والحدود الحالية البالغ ${caseData.complianceScore || 94}% يؤكد صحة الإحداثيات المقيدة.`,
          'استدعاء الخبير الهندسي المعين لتلاوة مذكرات المعاينة الميدانية.',
          'دعوة الخصوم لعقد تسوية ودية تلافياً لنفقات الفرز القضائي الجبري.'
        ];
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-right font-sans select-none" style={{ direction: 'rtl' }}>
      
      {/* 🏛️ TOP SECTION: VIRTUAL 3D COURTROOM STAGE (Visually redesigned to be more cinematic and professional) */}
      <div className="h-[250px] shrink-0 bg-slate-950 border-b border-slate-800/80 relative overflow-hidden flex flex-col justify-between p-3.5">
        
        {/* Holographic glowing grids, scanner lasers & dynamic background */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          {/* Laser scanners */}
          <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-1/4 animate-pulse"></div>
          <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent top-2/3 animate-pulse delay-500"></div>
          <div className="absolute inset-y-0 w-[1.5px] bg-gradient-to-b from-transparent via-emerald-500 to-transparent left-1/3 animate-pulse delay-200"></div>
          <div className="absolute inset-y-0 w-[1.5px] bg-gradient-to-b from-transparent via-blue-500 to-transparent left-2/3 animate-pulse delay-700"></div>
        </div>

        {/* Dynamic ambient background glow that shifts based on verdict status */}
        <div className={`absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none z-0 opacity-[0.06] ${
          verdict 
            ? 'bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent' 
            : 'bg-gradient-to-b from-blue-500/10 via-slate-900/40 to-transparent'
        }`} />

        {/* 3D Perspective Grid Projection Floor (True 3D Stage) */}
        <div 
          className="absolute inset-x-0 bottom-[-20px] h-[55%] bg-gradient-to-t from-slate-900 via-slate-950/20 to-transparent pointer-events-none z-0 border-t border-slate-850"
          style={{ 
            transform: 'perspective(400px) rotateX(45deg) translateY(10%)', 
            transformOrigin: 'bottom center',
            backgroundImage: verdict 
              ? 'radial-gradient(ellipse at bottom, rgba(245,158,11,0.22) 0%, transparent 80%)'
              : 'radial-gradient(ellipse at bottom, rgba(14,165,233,0.15) 0%, transparent 80%)'
          }} 
        />

        {/* Elegant SVG Hologram vector connectors */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Curved neural/holographic connections between platforms */}
            <path d="M 100 190 Q 250 140 400 95" fill="none" stroke={verdict ? "#f59e0b" : "#3b82f6"} strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
            <path d="M 680 190 Q 530 140 400 95" fill="none" stroke={verdict ? "#10b981" : "#ef4444"} strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
            <path d="M 400 20 Q 400 50 400 80" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* A. PLATFORM HEADER & REPRESENTATIVES ARCH */}
        <div className="relative z-20 w-full flex items-center justify-between px-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-400" />
              <span>VIRTUAL SIMULATION PLATFORM</span>
            </span>
            <span className="text-[11px] font-black text-white">منصة التقاضي الافتراضي والمطابقة الجيوديسية</span>
          </div>
          
          {/* Virtual Sovereignty Authorities (Sleeker holographic pill buttons) */}
          <div className="flex gap-1 max-w-[70%] overflow-x-auto py-1 px-1.5 bg-slate-900/80 border border-slate-800 rounded-xl scrollbar-none">
            {authorities.map((auth, idx) => {
              const isSelected = selectedHotspot === 'authorities';
              return (
                <button 
                  key={idx}
                  onClick={() => handleHotspotClick('authorities', 'الهيئات السيادية المعنية')}
                  title={`${auth.name}: ${auth.role}`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 scale-102 font-black shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-750 hover:bg-slate-900/40'
                  }`}
                >
                  <auth.icon className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="text-[8px] font-bold whitespace-nowrap">{auth.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* B. PERSPECTIVE COURT LAYOUT DESKS (RE-DESIGNED FOR PERFECT 3D LAYOUT, SMOOTH DEPTH-OF-FIELD FOCUSING, AND VERDICT REACTIONS) */}
        <div className="relative z-20 w-full flex-1 min-h-[175px] h-[175px] mt-2 select-none" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
          
          {/* 1. ELEVATED JUDGE PLATFORM (Back Center - Positioned further back in 3D perspective) */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-[245px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ 
              transform: hoveredPlatform === 'none' 
                ? 'translateZ(-50px) scale(0.95)' 
                : hoveredPlatform === 'judge' 
                ? 'translateZ(0px) scale(1.04) translateY(-2px)' 
                : 'translateZ(-80px) scale(0.88) translateY(-4px)',
              opacity: hoveredPlatform === 'none' || hoveredPlatform === 'judge' ? 1 : 0.45,
              filter: hoveredPlatform !== 'none' && hoveredPlatform !== 'judge' ? 'blur(1px) saturate(50%)' : 'none',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setHoveredPlatform('judge')}
            onMouseLeave={() => setHoveredPlatform('none')}
          >
            <button 
              onClick={() => handleHotspotClick('judge', `منصة القضاء - ${caseData.judge || 'رئيس الدائرة'}`)}
              className={`w-full bg-slate-950/95 border rounded-2xl px-3 py-2 flex flex-col items-center relative transition-all duration-500 shadow-2xl group ${
                selectedHotspot === 'judge' || activeAgent === 'master' || activeAgent === 'procedure'
                  ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] z-30'
                  : 'border-slate-800/80 hover:border-amber-500/40'
              } ${verdict ? 'border-amber-500/80 bg-gradient-to-b from-slate-950 via-slate-950 to-amber-950/15 shadow-[0_4px_25px_rgba(245,158,11,0.22)]' : ''}`}
            >
              {/* Dynamic Golden glow behind Judge when verdict is present */}
              {verdict && (
                <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
              )}

              {/* Gold authority seal with hover tilt gavel */}
              <div className="absolute -top-3.5 w-7.5 h-7.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center text-xs animate-bounce" style={{ animationDuration: '3s' }}>
                <Gavel className="w-3.5 h-3.5 text-slate-950 stroke-[2.5] transition-transform duration-300 group-hover:rotate-[-28deg]" />
              </div>
              
              {/* Stylized SVG Judge Portrait */}
              <div className="mt-2.5 relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-amber-500/30 overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.15)] group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-500">
                <svg className="w-8 h-8 text-amber-500/80 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.1" />
                  <path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" strokeLinecap="round" />
                  <path d="M12 14L10 17H14L12 14Z" fill="currentColor" />
                </svg>
                {/* Scanline animation */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none animate-pulse" />
              </div>

              <span className="text-[6.5px] text-amber-500/90 font-mono font-black block mt-1 uppercase tracking-widest flex items-center gap-1">
                <span>PRESIDING JUDICIAL PANEL</span>
                <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping"></span>
              </span>
              
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-white text-[10px] font-black">{caseData.judge || 'المستشار رئيس الدائرة'}</span>
                <span className="text-[7.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded-full font-bold">
                  رئيس الجلسة
                </span>
              </div>

              {/* Bouncing Audio Spectrum if verdict is active (Reaction) */}
              {verdict ? (
                <div className="flex gap-0.5 h-3 items-end mt-1.5 justify-center">
                  <span className="w-0.5 bg-amber-500 rounded-full animate-[pulse_0.8s_infinite_alternate]" style={{ height: '70%' }} />
                  <span className="w-0.5 bg-amber-500 rounded-full animate-[pulse_0.6s_infinite_alternate_0.2s]" style={{ height: '100%' }} />
                  <span className="w-0.5 bg-amber-500 rounded-full animate-[pulse_0.9s_infinite_alternate_0.1s]" style={{ height: '50%' }} />
                  <span className="w-0.5 bg-amber-500 rounded-full animate-[pulse_0.7s_infinite_alternate_0.3s]" style={{ height: '90%' }} />
                  <span className="w-0.5 bg-amber-500 rounded-full animate-[pulse_1s_infinite_alternate_0.15s]" style={{ height: '60%' }} />
                </div>
              ) : (
                /* Interactive Dynamic Verdict Indicator Banner */
                <div className={`mt-1 w-full text-center py-0.5 rounded-lg border text-[7.5px] font-black transition-all duration-700 ${
                  verdict 
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-inner' 
                    : 'bg-slate-900/60 border-slate-850 text-slate-500'
                }`}>
                  ⏳ بانتظار تلاوة منطوق الحكم الجيوديسي
                </div>
              )}
            </button>
          </div>

          {/* 2. PLAINTIFF STATED PODIUM (Foreground Right Side - angled inward) */}
          <div 
            className="absolute bottom-1 right-2 sm:right-6 md:right-10 lg:right-14 z-20 w-[190px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ 
              transform: hoveredPlatform === 'none' 
                ? 'translateZ(20px) rotateY(-8deg)' 
                : hoveredPlatform === 'plaintiff' 
                ? 'translateZ(50px) rotateY(0deg) scale(1.05) translateY(-3px)' 
                : 'translateZ(-20px) rotateY(-15deg) scale(0.92)',
              opacity: hoveredPlatform === 'none' || hoveredPlatform === 'plaintiff' ? 1 : 0.45,
              filter: hoveredPlatform !== 'none' && hoveredPlatform !== 'plaintiff' ? 'blur(1px) saturate(50%)' : 'none',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setHoveredPlatform('plaintiff')}
            onMouseLeave={() => setHoveredPlatform('none')}
          >
            <button 
              onClick={() => handleHotspotClick('plaintiff', `الجهة المدعية - ${caseData.plaintiff}`)}
              className={`w-full bg-slate-950/95 border rounded-xl p-2.5 text-right transition-all duration-500 shadow-xl group relative ${
                selectedHotspot === 'plaintiff' || activeAgent === 'personal'
                  ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-20'
                  : 'border-slate-800/80 hover:border-blue-500/40'
              } ${verdict ? 'border-emerald-500/80 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/10 shadow-[0_4px_22px_rgba(16,185,129,0.18)]' : ''}`}
            >
              {/* Dynamic emerald victory glow */}
              {verdict && (
                <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/25 to-teal-500/10 blur-sm opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* Glowing vertical hologram pillar */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[75%] bg-gradient-to-t pointer-events-none opacity-20 blur-sm ${
                verdict ? 'from-emerald-500 to-transparent' : 'from-blue-500 to-transparent'
              }`} />

              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1 mb-1 justify-between">
                {verdict ? (
                  <span className="text-[7px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse">
                    <Check className="w-2 h-2 stroke-[3]" />
                    <span>حكم بالتمكين عيناً</span>
                  </span>
                ) : (
                  <span className="text-[7.5px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded-full">الجهة المدعية</span>
                )}
                
                {/* Stylized Avatar Icon */}
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs transition-transform duration-500 group-hover:scale-110 ${
                  verdict ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  👨‍💼
                </div>
              </div>

              <div className="space-y-0.5 relative z-10">
                <span className="text-[9.5px] font-black text-white truncate block group-hover:text-amber-400 transition-colors">{caseData.plaintiff || 'صاحب النزاع'}</span>
                
                {/* Custom holographic portrait outline inside card */}
                <div className="flex items-center gap-2 mt-1 bg-slate-900/40 p-1 rounded-lg border border-slate-900/50">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-md bg-slate-950 border ${verdict ? 'border-emerald-500/30' : 'border-blue-500/20'}`}>
                    <svg className={`w-4 h-4 ${verdict ? 'text-emerald-400' : 'text-blue-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.1" />
                      <path d="M6 21C6 17.5 8.5 15 12 15C15.5 15 18 17.5 18 21" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-[7px] text-right">
                    <span className="text-slate-400 font-bold">نسبة مطابقة الحيازة:</span>
                    <span className="text-emerald-400 font-mono font-black">{caseData.complianceScore || 94}% مستحق</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 3. DEFENDANT STATED PODIUM (Foreground Left Side - angled inward) */}
          <div 
            className="absolute bottom-1 left-2 sm:left-6 md:left-10 lg:left-14 z-20 w-[190px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ 
              transform: hoveredPlatform === 'none' 
                ? 'translateZ(20px) rotateY(8deg)' 
                : hoveredPlatform === 'defendant' 
                ? 'translateZ(50px) rotateY(0deg) scale(1.05) translateY(-3px)' 
                : 'translateZ(-20px) rotateY(15deg) scale(0.92)',
              opacity: hoveredPlatform === 'none' || hoveredPlatform === 'defendant' ? 1 : 0.45,
              filter: hoveredPlatform !== 'none' && hoveredPlatform !== 'defendant' ? 'blur(1px) saturate(50%)' : 'none',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setHoveredPlatform('defendant')}
            onMouseLeave={() => setHoveredPlatform('none')}
          >
            <button 
              onClick={() => handleHotspotClick('defendant', `الجهة المدعى عليها - ${caseData.defendant}`)}
              className={`w-full bg-slate-950/95 border rounded-xl p-2.5 text-right transition-all duration-500 shadow-xl group relative ${
                selectedHotspot === 'defendant' || activeAgent === 'commercial'
                  ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-20'
                  : 'border-slate-800/80 hover:border-red-500/40'
              } ${verdict ? 'border-red-500/70 bg-gradient-to-b from-slate-950 via-slate-950 to-red-950/15 shadow-[0_4px_22px_rgba(239,68,68,0.18)]' : ''}`}
            >
              {/* Dynamic red alert glow */}
              {verdict && (
                <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/25 to-amber-500/10 blur-sm opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse" />
              )}

              {/* Glowing vertical hologram pillar */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[75%] bg-gradient-to-t pointer-events-none opacity-20 blur-sm ${
                verdict ? 'from-red-500 to-transparent' : 'from-red-400/50 to-transparent'
              }`} />

              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1 mb-1 justify-between">
                {verdict ? (
                  <span className="text-[7px] font-black text-red-400 bg-red-500/15 border border-red-500/20 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                    <span>مُلزم بالإخلاء الفوري</span>
                  </span>
                ) : (
                  <span className="text-[7.5px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 rounded-full">الجهة المدعى عليها</span>
                )}
                
                {/* Stylized Avatar Icon */}
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs transition-transform duration-500 group-hover:scale-110 ${
                  verdict ? 'bg-red-500/15 border border-red-500/30 text-red-400 animate-pulse' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  🕵️‍♂️
                </div>
              </div>

              <div className="space-y-0.5 relative z-10">
                <span className="text-[9.5px] font-black text-white truncate block group-hover:text-red-400 transition-colors">{caseData.defendant || 'الخصم والمعترض'}</span>
                
                {/* Custom holographic portrait outline inside card */}
                <div className="flex items-center gap-2 mt-1 bg-slate-900/40 p-1 rounded-lg border border-slate-900/50">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-md bg-slate-950 border ${verdict ? 'border-red-500/30 animate-pulse' : 'border-red-500/20'}`}>
                    <svg className={`w-4 h-4 ${verdict ? 'text-red-400' : 'text-rose-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.1" />
                      <path d="M6 21C6 17.5 8.5 15 12 15C15.5 15 18 17.5 18 21" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-[7px] text-right">
                    <span className="text-slate-400 font-bold">الحالة القانونية:</span>
                    <span className={`font-mono font-black ${verdict ? 'text-red-400 animate-pulse' : 'text-amber-500'}`}>
                      {verdict ? 'صيغة تنفيذية جبرية' : 'طلب اعتراض معلق'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

        </div>

        {/* C. FLOATING HOTSPOT DETAILS DIALOG (Rendered inline inside court stage with superior glassmorphism styling) */}
        {selectedHotspot !== 'none' && (
          <div className="absolute top-[48px] left-3.5 z-40 bg-slate-950/95 border border-amber-500/40 p-3 rounded-2xl w-64 text-right shadow-2xl animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
              <button 
                onClick={() => setSelectedHotspot('none')}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <h5 className="text-amber-400 text-[10.5px] font-black flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" />
                <span>تفاصيل السجل والمستندات</span>
              </h5>
            </div>

            {selectedHotspot === 'judge' && (
              <div className="text-[9.5px] text-slate-300 space-y-1.5 font-bold leading-normal">
                <p>• <span className="text-white">المبادئ القضائية:</span> صيانة حق الملكية الخاصة م (٨٠٢ مدني) وحظر غصب الحيازات العقارية.</p>
                <p>• <span className="text-white">قوة الإثبات الجيوديسي:</span> الحكم القطعي الصادر يلتزم بتوصيات الرفع المساحي والفرز الفعلي للعين.</p>
                <p className="text-amber-500/90 text-[8.5px] font-mono">COURT DICTATION REFERENCE: VIRT-LAW-802</p>
              </div>
            )}

            {selectedHotspot === 'plaintiff' && (
              <div className="text-[9.5px] text-slate-300 space-y-1.5 font-bold leading-normal">
                <p>• <span className="text-white">طلب التمكين:</span> فرز وتجنيب حصته الميراثية في العقار البالغ مساحته <span className="text-amber-400 font-mono font-black">{caseData.landArea} م²</span>.</p>
                <p>• <span className="text-white">المستندات المحققة:</span> عقد بيع ابتدائي مشهر ونسب ورثة ومحاضر مراجعة الحدود الجغرافية.</p>
                <p className="text-emerald-400 text-[8.5px]">PLAINTIFF STATUS: APPROVED FOR ENFORCEMENT</p>
              </div>
            )}

            {selectedHotspot === 'defendant' && (
              <div className="text-[9.5px] text-slate-300 space-y-1.5 font-bold leading-normal">
                <p>• <span className="text-white">مذكرة الاعتراض:</span> الادعاء الصوري المطلق والتزوير على عقود المورث وصعوبة إخلاء الشاغلين.</p>
                <p>• <span className="text-white">حالة الالتزام الميداني:</span> يواجه صيغة تنفيذ جبري مباشر وملاحقة قضائية في حال الامتناع.</p>
                <p className="text-red-400 text-[8.5px]">LIABILITY STATUS: MANDATORY HANDOVER DECREE</p>
              </div>
            )}

            {selectedHotspot === 'authorities' && (
              <div className="text-[9.5px] text-slate-300 space-y-1.5 font-bold leading-normal">
                <p>• <span className="text-white">وزارة الداخلية:</span> تنسيق مسبق لحشد قوات الأمن وتأمين مأموريات قلم محضرين الجيزة والتمكين.</p>
                <p>• <span className="text-white">مصلحة الطب الشرعي:</span> استلام سندات الملكية والمضاهاة الخطية للبت في الطعن بالتزوير.</p>
                <p className="text-blue-400 text-[8.5px]">EXTERNAL STATUS: STAKEHOLDERS NOTIFIED</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 💻 BOTTOM SECTION: COMMAND DECK & DYNAMIC TAB CONSOLE (Polished bento box grid for flawless resolution fit) */}
      <div className="flex-1 min-h-0 bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 overflow-hidden">
        
        {/* PANEL 1: PROCEDURAL PROGRESS TIMELINE (Redesigned with holographic checkpoint nodes) */}
        <div className="flex flex-col gap-2.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5 overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-white text-[11px] font-black">مراحل المحضرين والتمكين الجغرافي</span>
                <span className="text-[7.5px] text-slate-500 font-mono uppercase font-bold">EXECUTION STATE ENGINE</span>
              </div>
            </div>

            {/* Sleek Progress percentage */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[9px] font-black">
              <span className="text-slate-400">التنفيذ الميداني:</span>
              <span className="text-amber-400 font-black font-mono">{executionPercent}%</span>
            </div>
          </div>

          {/* Core Case Metadata Fields Banner (Polished grid) */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-lg border border-slate-900 text-[8.5px] shrink-0 text-center font-bold">
            <div className="border-l border-slate-900 last:border-0 py-0.5">
              <span className="text-slate-500 block">رقم القضية</span>
              <span className="text-amber-400 font-mono block mt-0.5 truncate">{caseData.caseNumber}</span>
            </div>
            <div className="border-l border-slate-900 last:border-0 py-0.5">
              <span className="text-slate-500 block">المساحة الإجمالية</span>
              <span className="text-white block mt-0.5 truncate">{caseData.landArea} م²</span>
            </div>
            <div className="py-0.5">
              <span className="text-slate-500 block">محكمة الموضوع</span>
              <span className="text-white block mt-0.5 truncate">{caseData.court || 'شمال الجيزة'}</span>
            </div>
          </div>

          {/* Steps Timeline (Glowing connection line with micro-animations) */}
          <div className="flex-1 overflow-y-auto pr-0.5 scrollbar-thin space-y-1.5 relative">
            
            {activeChecklist.map((item, index) => {
              const isActive = item.id === 'exec5' || item.id === 'exec6';
              return (
                <button 
                  key={item.id}
                  onClick={() => onToggleChecklist && onToggleChecklist(item.id)}
                  className={`w-full p-2 rounded-lg border text-right transition-all duration-300 flex items-center justify-between gap-2 text-[9.5px] group cursor-pointer ${
                    item.done 
                      ? 'bg-slate-950/30 border-slate-900/50 text-slate-400 hover:border-slate-800' 
                      : isActive 
                      ? 'bg-amber-500/5 border-amber-500/40 text-slate-200 shadow-sm hover:bg-amber-500/10'
                      : 'bg-slate-950/50 border-slate-900/40 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate max-w-[80%] font-bold">
                    {/* Status Indicator checkmark / pulsing node */}
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      item.done 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                        : isActive 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 animate-pulse' 
                        : 'border-slate-800 text-transparent group-hover:border-slate-700'
                    }`}>
                      {item.done ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      ) : null}
                    </span>
                    <span className={`truncate ${item.done ? 'line-through text-slate-500 font-medium' : 'text-slate-300 font-extrabold'}`}>
                      {index + 1}. {item.label}
                    </span>
                  </div>

                  {/* Right Status Badge */}
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                    item.done 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isActive 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' 
                      : 'bg-slate-950 text-slate-600 border border-slate-900'
                  }`}>
                    {item.done ? 'مكتمل' : isActive ? 'جاري الآن' : 'معلق'}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* PANEL 2: INTEGRATED HOLO-DECISION CONSOLE (Redesigned with state tabs and progress logs) */}
        <div className="flex flex-col gap-2.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5 overflow-hidden">
          
          {/* Hologram Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-5.5 h-5.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                ⚖️
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[11px] font-black">المنصة الافتراضية للتوصيات والنتائج</span>
                <span className="text-[7px] text-slate-500 font-mono uppercase font-bold">DECISION HOLO-CONSOLE v3.0</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/15 px-2.5 py-0.5 rounded-full">
              <span className={`w-1 h-1 rounded-full ${verdict ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className="text-[7.5px] text-amber-400 font-mono font-black uppercase">
                {verdict ? 'CONSENSUS' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Dynamic hologram glass tab buttons (Redesigned with smooth feedback) */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-850 shrink-0 text-[8.5px]">
            <button
              onClick={() => setActiveHologramTab('verdict')}
              className={`flex-1 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                activeHologramTab === 'verdict'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              منطوق الحكم
            </button>
            <button
              onClick={() => setActiveHologramTab('calculations')}
              className={`flex-1 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                activeHologramTab === 'calculations'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              التحليل المالي
            </button>
            <button
              onClick={() => setActiveHologramTab('recommendations')}
              className={`flex-1 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                activeHologramTab === 'recommendations'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              التوصيات
            </button>
            <button
              onClick={() => setActiveHologramTab('actions')}
              className={`flex-1 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                activeHologramTab === 'actions'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إجراءات فورية
            </button>
          </div>

          {/* Tab Content Box (Glassmorphism & Smooth Scrolling) */}
          <div className="flex-1 bg-slate-950/75 p-3 rounded-xl border border-slate-900/60 text-right text-[10px] leading-relaxed overflow-y-auto scrollbar-thin">
            
            {/* TAB 1: VERDICT CONTENT */}
            {activeHologramTab === 'verdict' && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                {verdict ? (
                  <div className="border-r-2 border-amber-500/80 pr-2.5 bg-amber-500/[0.02] p-2.5 rounded-l-lg">
                    <p className="text-slate-200 font-extrabold whitespace-pre-wrap leading-relaxed text-[10px]">
                      {verdict}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-7 space-y-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto animate-pulse">
                      <Scale className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-amber-500 font-black animate-pulse">⏳ بانتظار توجيهات الخبير والوكلاء القانونيين...</p>
                    <p className="text-[9px] text-slate-500 leading-normal max-w-[280px] mx-auto font-semibold">
                      انقر على أي من الوكلاء القانونيين في القائمة الجانبية لتنشيط استنباط وصياغة منطوق الحكم فورياً بناء على اللوائح العقارية.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FINANCIAL / SPACE ANALYSIS */}
            {activeHologramTab === 'calculations' && (
              <div className="space-y-3.5 animate-in fade-in duration-300 pt-0.5">
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850 flex justify-between items-center font-black shadow-inner">
                    <span className="text-slate-400">مساحة الرفع المساحي:</span>
                    <span className="text-white font-mono">{caseData.landArea} م²</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850 flex justify-between items-center font-black shadow-inner">
                    <span className="text-slate-400">القيمة التقديرية:</span>
                    <span className="text-amber-400 font-mono">{(results.totalPropertyValue || 5400000).toLocaleString('ar-EG')} ج</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center col-span-2 font-black shadow-inner">
                    <span className="text-slate-400">تكلفة التشييد والفرز المقدرة:</span>
                    <span className="text-cyan-400 font-mono">{(results.constructionCost || 1200000).toLocaleString('ar-EG')} ج</span>
                  </div>
                </div>
                
                {/* Heirs shares breakdown */}
                {results.heirsShares && results.heirsShares.length > 0 ? (
                  <div className="border-t border-slate-900 pt-2.5 space-y-2">
                    <span className="text-amber-500 font-black text-[9.5px] block">الأنصبة الشرعية المقدرة للورثة:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {results.heirsShares.map((heir) => (
                        <div key={heir.id} className="bg-slate-900/40 p-2 rounded border border-slate-900/60 flex justify-between items-center text-[9px] font-black shadow-sm">
                          <span className="text-slate-400">{heir.name} ({heir.shareFraction}):</span>
                          <span className="text-white font-mono">{heir.shareValue.toLocaleString('ar-EG')} ج</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-500 text-center pt-3 font-semibold">
                    لم يتم رصد أي ورثة شرعيين لهذا النزاع العقاري بعد.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RECOMMENDATIONS */}
            {activeHologramTab === 'recommendations' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <span className="text-amber-500 text-[10px] font-black block border-b border-slate-900 pb-1.5 mb-1.5">توجيهات الوكيل الفقهي والقانوني المعين:</span>
                <div className="space-y-2">
                  {getAgentRecommendations().map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-[9.5px] font-black text-slate-300">
                      <span className="text-amber-400 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <p className="leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ACTIONS */}
            {activeHologramTab === 'actions' && (
              <div className="space-y-3 animate-in fade-in duration-300 pt-0.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleEnforceVerdict}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-xl text-[9.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-98"
                  >
                    <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>توجيه أمر تنفيذ للمحضرين</span>
                  </button>

                  <button
                    onClick={handleSimulateAppeal}
                    disabled={appealSimulated}
                    className={`flex-1 font-black py-2 rounded-xl text-[9.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      appealSimulated 
                        ? 'bg-slate-900 border-slate-850 text-slate-500 cursor-default' 
                        : 'bg-slate-950 hover:bg-slate-900 border-red-500/30 hover:border-red-500/50 text-red-400 active:scale-98 shadow-md'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>محاكاة استئناف الخصم</span>
                  </button>
                </div>

                {/* Appeal Simulation Progress bar */}
                {appealSimulated && appealProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                      <span>جاري المعالجة الفيدرالية للاستئناف...</span>
                      <span className="font-mono">{appealProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${appealProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Appeal Log Display (Elegant terminal look) */}
                {appealLog && (
                  <div className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-[9px] text-red-400 font-semibold whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-1">
                    {appealLog}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Console Footer */}
          <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[8px] font-mono text-slate-500 shrink-0 font-bold">
            <span className="flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-amber-500" />
              <span>الوكيل النشط: {activeAgent === 'master' ? 'وكيل السرب الخبير' : activeAgent}</span>
            </span>
            <span>رقم الملف القضائي: {caseData.caseNumber}</span>
          </div>

        </div>

      </div>

    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { CaseData } from './types';
import { SAMPLE_CASES, EXPERT_SYSTEM_AGENTS } from './data/expertSystemData';
import { calculateAll } from './utils/calculations';
import MenuBar from './components/MenuBar';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import MapTab from './components/MapTab';
import CaseDetailsTab from './components/CaseDetailsTab';
import HeirsHubTab from './components/HeirsHubTab';
import ChatVoiceUploadTab from './components/ChatVoiceUploadTab';
import AgentSmithRunner from './components/AgentSmithRunner';
import ReportView from './components/ReportView';
import StartPage from './components/StartPage';
import FieldReferencesPanel from './components/FieldReferencesPanel';
import ValuationTrends from './components/ValuationTrends';
import ComplianceTrends from './components/ComplianceTrends';
import AreaRegistry from './components/AreaRegistry';
import MindMapTab from './components/MindMapTab';
import CourtTab from './components/CourtTab';
import InquiriesPage from './components/InquiriesPage';
import { triggerToast } from './lib/toast';

import { 
  Scale, 
  HelpCircle, 
  Settings, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  FileText, 
  Layers, 
  Sparkles,
  Award,
  BookOpen,
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  Copy,
  PlusCircle,
  FileCheck,
  Clock
} from 'lucide-react';

export default function App() {
  const [casesArchive, setCasesArchive] = useState<CaseData[]>(() => {
    const saved = localStorage.getItem('smart_expert_cases_archive');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing saved cases", e);
      }
    }
    
    // Fallback: Populate with SAMPLE_CASES and add default photos & references!
    const initialCases = SAMPLE_CASES.map(c => ({
      ...c,
      photos: c.photos || [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80', caption: 'صورة الواجهة الخارجية لبيت العمرانية - رصد التشققات والمخالفات الميدانية الخرسانية للسطح', date: '2026-06-30' },
        { id: 'p2', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', caption: 'معاينة السطح الخرساني المهدوم والمزال - رصد الأسياخ والخرسانة المسلحة المتصدعة', date: '2026-06-30' },
        { id: 'p3', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', caption: 'رصد تآكل وصدأ الحديد في الأعمدة الحاملة للسطح ومطابقة الأضرار والمساحات الإنشائية', date: '2026-07-01' }
      ],
      references: c.references || [
        { id: 'r1', title: 'المادة 29 من القانون رقم 49 لسنة 1977 بشأن إيجار الأماكن', type: 'legal', text: 'تنص المادة على حالات امتداد عقد الإيجار للزوجة أو الأولاد أو الوالدين الذين كانوا يقيمون مع المستأجر حتى الوفاة، مع تحديد انتفاء صفة المنفعة في حال ترك العين أو الوفاة دون وارث مستحق قانوناً.' },
        { id: 'r2', title: 'الكود المصري لتصميم وتنفيذ المنشآت الخرسانية - البند 4.2', type: 'engineering', text: 'يحدد معايير واشتراطات تصدع المنشآت وتقدير نسب الهلاك الخرساني والحديد الحامل للمنشأة عند التعديل الإنشائي العشوائي أو الإزالات غير المعتمدة.' },
        { id: 'r3', title: 'الحكم الصادر في الطعن رقم 4312 لسنة 72 قضائية (محكمة النقض المصرية)', type: 'precedent', text: 'أكدت محكمة النقض أن التزام المستأجرين بنفقات الصيانة أو الإزالات للترميم مشروط بموافقتهم الصريحة أو صدور قرار رسمي بالترميم الإجباري الملزم هندسياً من المجلس المحلي المعين.' }
      ]
    }));
    localStorage.setItem('smart_expert_cases_archive', JSON.stringify(initialCases));
    return initialCases;
  });

  const [caseData, setCaseData] = useState<CaseData>(() => {
    const saved = localStorage.getItem('smart_expert_cases_archive');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {}
    }
    return SAMPLE_CASES[0];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'mindmap' | 'heirs_hub' | 'court' | 'inquiries'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showStartPage, setShowStartPage] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'paper'>('dark');
  const [startWithVirtualCourt, setStartWithVirtualCourt] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState<'references' | 'gallery' | 'heirs_list' | 'area_registry' | 'cases_archive' | null>(null);
  const [maximizedSection, setMaximizedSection] = useState<'references' | 'gallery' | null>(null);

  // Global Toast State & Custom Event Listener
  interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>;
      if (customEvent.detail) {
        const id = `${Date.now()}-${Math.random()}`;
        const newToast: ToastItem = {
          id,
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success'
        };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
      }
    };
    window.addEventListener('show-toast', handleShowToast as EventListener);
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, []);

  const handleToggleTheme = () => {
    // Locked to dark theme as requested
    setTheme('dark');
  };

  const handleLoadSampleAndEnter = (index: number) => {
    const archiveCase = casesArchive[index] || SAMPLE_CASES[index];
    if (archiveCase) {
      setCaseData(archiveCase);
    }
    setShowStartPage(false);
  };
  
  // Custom system settings for calculations (with defaults)
  const [baseLandValueResidential, setBaseLandValueResidential] = useState(15000);
  const [baseSteelPricePerTon, setBaseSteelPricePerTon] = useState(42000);
  const [taxExemptionLimit, setTaxExemptionLimit] = useState(50000);

  // Auto recalculate everything based on current inputs
  const results = calculateAll(caseData);

  const handleUpdateCaseData = (updatedFields: Partial<CaseData>) => {
    setCaseData(prev => {
      const updated = {
        ...prev,
        ...updatedFields
      };
      setCasesArchive(prevArchive => {
        const updatedArchive = prevArchive.map(c => c.caseNumber === updated.caseNumber ? updated : c);
        localStorage.setItem('smart_expert_cases_archive', JSON.stringify(updatedArchive));
        return updatedArchive;
      });
      return updated;
    });
    triggerToast('⚖️ تم تحديث البيانات وتعديل نتائج التقييم فورياً!', 'success');
  };

  const handleUpdateCoordinates = (
    lat: number, 
    lng: number, 
    locationName: string, 
    scannedArea?: number, 
    complianceScore?: number
  ) => {
    // Determine scanned area and compliance score
    const finalScannedArea = scannedArea !== undefined 
      ? scannedArea 
      : Math.round(350 + (Math.abs(Math.sin(lat * 800) * Math.cos(lng * 800)) * 280));
    const finalComplianceScore = complianceScore !== undefined 
      ? complianceScore 
      : Math.max(65, Math.min(100, Math.round(100 - Math.abs(lat - 29.9912) * 1200)));

    handleUpdateCaseData({
      latitude: lat,
      longitude: lng,
      location: locationName,
      landArea: finalScannedArea,
      scannedArea: finalScannedArea,
      complianceScore: finalComplianceScore
    });
  };

  const handleNewCase = (customTitle?: string) => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const freshCase: CaseData = {
      caseNumber: `CASE-2026-${nextNum}`,
      title: customTitle || 'قضية نزاع وتثبيت ملكية عقارية جديدة',
      court: 'محكمة الجيزة الابتدائية - الدائرة الثالثة عقاري',
      judge: 'المستشار رئيس الدائرة الثالثة عقاري',
      expertName: 'كابتن حسام',
      date: new Date().toISOString().split('T')[0],
      status: 'جديدة',
      landArea: 480,
      landType: 'بناء',
      location: 'شارع الهرم الرئيسي، الجيزة',
      hasBuilding: true,
      buildingArea: 320,
      floors: 3,
      finishType: 'لوكس',
      buildingType: 'سكني',
      buildingAge: 8,
      annualRent: 28000,
      transactionValue: 6500000,
      estateValue: 6500000,
      heirs: [
        { id: `h-${Date.now()}-1`, name: 'سليم أحمد كمال', gender: 'male', relationship: 'son' },
        { id: `h-${Date.now()}-2`, name: 'يارا أحمد كمال', gender: 'female', relationship: 'daughter' }
      ],
      dispute: {
        hasDispute: true,
        type: 'ownership',
        details: 'خصومة عقارية جديدة نشطة لتحديد ملكية الأنصبة وفرز حصص الشركاء على الشيوع.'
      },
      latitude: 29.9912,
      longitude: 31.1425,
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', caption: 'المبنى محل المعاينة والنزاع الجديد', date: '2026-07-01' }
      ],
      references: [
        { id: 'r1', title: 'المادة 802 من القانون المدني المصري', type: 'legal', text: 'لمالك الشيء وحده، في حدود القانون، حق استعماله واستغلاله والتصرف فيه.' }
      ]
    };

    setCasesArchive(prev => {
      const updated = [freshCase, ...prev];
      localStorage.setItem('smart_expert_cases_archive', JSON.stringify(updated));
      return updated;
    });
    setCaseData(freshCase);
    setActiveTab('details'); // Switch straight to details so they can edit
    triggerToast(`🎉 تم إنشاء قضية جديدة بنجاح برقم: ${freshCase.caseNumber}`, 'success');
  };

  const handleOpenSample = (index: number) => {
    const archiveCase = casesArchive[index] || SAMPLE_CASES[index];
    if (archiveCase) {
      setCaseData(archiveCase);
    }
  };

  const handleLoadArchivedCase = (caseNumber: string) => {
    const target = casesArchive.find(c => c.caseNumber === caseNumber);
    if (target) {
      setCaseData(target);
      triggerToast(`📁 تم استدعاء القضية رقم ${caseNumber} من الأرشيف بنجاح!`, 'success');
    }
  };

  const handleDeleteArchivedCase = (caseNumber: string) => {
    if (casesArchive.length <= 1) {
      alert('⚠️ عذراً، يجب أن تحتوي الأرشيفات على قضية واحدة على الأقل. لا يمكن حذف كافة القضايا.');
      return;
    }
    const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف القضية "${caseNumber}" نهائياً من الأرشيف؟ لا يمكن استرجاع البيانات بعد الحذف.`);
    if (!confirmDelete) return;

    const remaining = casesArchive.filter(c => c.caseNumber !== caseNumber);
    setCasesArchive(remaining);
    localStorage.setItem('smart_expert_cases_archive', JSON.stringify(remaining));
    
    // If the active case was deleted, switch to the first remaining one
    if (caseData.caseNumber === caseNumber) {
      setCaseData(remaining[0]);
    }
    triggerToast(`🗑️ تم حذف القضية ${caseNumber} نهائياً من الأرشيف.`, 'warning');
  };

  const handleCloneCase = (caseToClone: CaseData) => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const cloned: CaseData = {
      ...caseToClone,
      caseNumber: `CASE-2026-${nextNum}`,
      title: `${caseToClone.title} (نسخة مكررة)`,
      date: new Date().toISOString().split('T')[0],
      status: 'جديدة',
    };
    const updated = [cloned, ...casesArchive];
    setCasesArchive(updated);
    localStorage.setItem('smart_expert_cases_archive', JSON.stringify(updated));
    setCaseData(cloned);
    triggerToast(`💡 تم استنساخ القضية برقم جديد: ${cloned.caseNumber}`, 'success');
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    triggerToast('⚙️ جاري تشغيل محاكاة عملاء الذكاء الفقهي والتقني...', 'info');
    setTimeout(() => {
      setIsAnalyzing(false);
      triggerToast('🔥 اكتمل تصويت وتقييم الخبراء الخمسين بنجاح!', 'success');
    }, 7000); // 7s matching simulation timeline
  };

  const handlePrint = () => {
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (showStartPage) {
    return (
      <StartPage 
        onEnterWorkspace={(tab, launchCourt) => {
          if (tab) setActiveTab(tab);
          if (launchCourt) setStartWithVirtualCourt(true);
          setShowStartPage(false);
        }} 
        onLoadSampleAndEnter={(index, tab) => {
          handleLoadSampleAndEnter(index);
          if (tab) setActiveTab(tab);
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen px-1 sm:px-2 md:px-3 lg:px-4 py-3 sm:py-5 md:py-6 lg:py-8 font-sans select-none antialiased relative overflow-x-hidden transition-all duration-300 ${
      theme === 'paper' ? 'theme-paper' : 'bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#dbeafe] text-[#1e293b]'
    }`}>
      {/* 3D-like Glowing Interactive Ambience Grid Background */}
      {theme === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#151525_1px,transparent_1px),linear-gradient(to_bottom,#151525_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/12 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/12 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute top-[30%] right-[20%] w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/12 blur-[110px] pointer-events-none -z-10"></div>
        </>
      )}

      {/* Main Beautiful Container containing the Header, Menu, Workspace, and Footer */}
      <div className="w-full max-w-full mx-auto space-y-6">
        
        {/* Bilingual Header with 3D Interactive Logo & Glowing Neon Touches */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(245,158,11,0.05)] text-right relative overflow-hidden backdrop-blur-md">
          {/* Subtle horizontal animated neon line */}
          <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-500 to-cyan-500 animate-pulse"></div>
          
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-center md:justify-start w-full">
            {/* Interactive 3D smart logo */}
            <div className="perspective-1000 relative w-16 h-16 flex items-center justify-center shrink-0 group">
              {/* Spinning and floating geometric 3D body */}
              <div 
                className="relative w-12 h-12 transform-style-3d group-hover:rotate-y-180 transition-all duration-1000 ease-out animate-bounce flex items-center justify-center"
                style={{ animationDuration: '4s' }}
              >
                {/* Face A: Gold Scales of Justice */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.45)] border border-amber-200/50 backface-hidden">
                  <Scale className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                {/* Face B: Cyber Tech Sparkles */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 via-teal-400 to-cyan-300 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.45)] border border-cyan-200/50 rotate-y-180 backface-hidden">
                  <Sparkles className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
              </div>
              
              {/* Dual Glowing Outer Orbitals */}
              <div className="absolute -inset-1.5 rounded-full border border-dashed border-amber-500/35 animate-spin" style={{ animationDuration: '10s' }}></div>
              <div className="absolute -inset-3.5 rounded-full border border-dotted border-cyan-500/25 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>
            </div>
            
            {/* Text Title block in Arabic and English */}
            <div className="flex flex-col text-center md:text-right flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center md:justify-start">
                <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                  سمارت <span className="text-amber-500 animate-pulse">إكسبيرت</span>
                </h1>
                <span className="text-slate-700 hidden sm:inline text-xl font-light">|</span>
                <h2 className="text-cyan-400 font-black text-lg md:text-xl tracking-widest uppercase font-mono leading-none">
                  Smart <span className="text-white">Expert</span>
                </h2>
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 max-w-xl leading-relaxed">
                الخبير العقاري القضائي الذكي والمنصة الموحدة لإدارة وتقييم الثروة العقارية وحصر المنازعات وقسمة التركات
              </p>
            </div>
          </div>

          {/* Quick interactive stats/info metrics */}
          <div className="hidden md:flex items-center gap-3 mt-4 md:mt-0 bg-slate-950/40 p-3 rounded-xl border border-slate-800 shadow-inner shrink-0">
            <div className="flex flex-col text-left font-mono">
              <span className="text-[9px] text-slate-500 font-bold block">SYSTEM STATUS</span>
              <span className="text-[11px] text-amber-500 font-black flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE (V1.0.0)
              </span>
            </div>
          </div>
        </div>

        {/* Top Navigation Dynamic Menu bar */}
        <MenuBar 
          onNewCase={handleNewCase}
          onOpenSample={handleOpenSample}
          onPrint={handlePrint}
          onToggleSettings={() => setShowSettingsDrawer(!showSettingsDrawer)}
          onSelectExpertSector={(sector) => {
            console.log(`[SmartExpert] Active sector initialized: ${sector}`);
          }}
          onShowAbout={() => setShowAboutModal(true)}
          onGoToStartPage={() => setShowStartPage(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Multi-Column Layout (3 Viewports: Right (Sidebar & Status), Center (Workspace), Left (Maps & Diagnostics)) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT Column: Navigation Sidebar & Agent Status stacked (يمين الشاشة) */}
        <div className="lg:col-span-3 space-y-6 order-1 lg:order-none">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            caseTitle={caseData.title}
            caseNumber={caseData.caseNumber}
          />
          <RightPanel 
            results={results} 
            isAnalyzing={isAnalyzing}
            onRunAnalysis={() => {
              setActiveTab('agents');
              handleRunAnalysis();
            }}
            onPrint={handlePrint}
            onShowHelp={() => setShowHelpModal(true)}
          />
        </div>

        {/* MIDDLE Column: Main Dynamic Content Area (الشاشة الوسطى) */}
        <main className={`${(activeTab === 'files' || activeTab === 'mindmap' || activeTab === 'court' || activeTab === 'inquiries') ? 'lg:col-span-9' : 'lg:col-span-6'} space-y-6 order-2 lg:order-none`}>
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Active Case Stats Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* Stat 1 */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className="text-slate-500 text-[10px] font-bold block">القيمة الكلية للعقار</span>
                    <h3 className="text-white text-lg font-black mt-1 font-mono leading-none">
                      {results.totalPropertyValue.toLocaleString('ar-EG')} <span className="text-xs text-amber-400">ج</span>
                    </h3>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between group hover:border-blue-500/40 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className="text-slate-500 text-[10px] font-bold block">مساحة الرفع المساحي</span>
                    <h3 className="text-white text-lg font-black mt-1 font-mono leading-none">
                      {caseData.landArea} <span className="text-xs text-blue-400">م²</span>
                    </h3>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className="text-slate-500 text-[10px] font-bold block">العائد الإيجاري السنوي</span>
                    <h3 className="text-white text-lg font-black mt-1 font-mono leading-none">
                      {caseData.annualRent.toLocaleString('ar-EG')} <span className="text-xs text-emerald-400">ج</span>
                    </h3>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between group hover:border-purple-500/40 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className="text-slate-500 text-[10px] font-bold block">متوسط دقة التنبؤ المالي</span>
                    <h3 className="text-white text-lg font-black mt-1 font-mono leading-none">
                      95.2%
                    </h3>
                  </div>
                </div>

              </div>

              {/* Case Archives & Persistence Console (أرشيف القضايا الموثق ونظام الحفظ) */}
              <div 
                onDoubleClick={() => setMaximizedPanel('cases_archive')}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:ring-1 hover:ring-amber-500/20 transition-all cursor-pointer group/cases"
                title="انقر نقراً مزدوجاً (Double Click) لتوسيع مركز الحفظ والأرشفة بعرض الشاشة"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-500" />
                    <div className="flex flex-col text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-black">مركز الحفظ والتأريخ والأرشفة القضائية</span>
                        <span className="text-[9px] text-slate-500 font-bold animate-pulse hidden group-hover/cases:inline-block bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          (دبل كليك للتوسيع ⛶)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-0.5">سجل القضايا النشطة والمحفوظة محلياً بتحديث تلقائي لجميع التعديلات</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNewCase()}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة قضية جديدة تماماً</span>
                  </button>
                </div>

                {/* 📊 لوحة بيانات المحفظة الاستثمارية العقارية المصغرة (Dashboard Widget) */}
                {(() => {
                  const totalAssetsCount = casesArchive.length;
                  const totalPortfolioValue = casesArchive.reduce((acc, sc) => {
                    // Estimate value: estateValue (for inheritance), transactionValue (for contracts), or landArea * 15000 as fallback
                    const val = sc.estateValue || sc.transactionValue || (sc.landArea * 15000) || 500000;
                    return acc + val;
                  }, 0);

                  // Group by dispute type
                  const disputeCounts = casesArchive.reduce((acc, sc) => {
                    const type = sc.dispute?.type || 'none';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const disputeTypesData = [
                    { id: 'inheritance', name: 'مواريث وتركات', count: disputeCounts['inheritance'] || 0, color: 'bg-amber-500', barColor: '#f59e0b' },
                    { id: 'contract', name: 'نزاع عقدي وإخلاء', count: disputeCounts['contract'] || 0, color: 'bg-emerald-500', barColor: '#10b981' },
                    { id: 'boundary', name: 'تداخل حدود عقارية', count: disputeCounts['boundary'] || 0, color: 'bg-cyan-500', barColor: '#06b6d4' },
                    { id: 'ownership', name: 'تقييم عقاري وتثبيت ملكية', count: (disputeCounts['ownership'] || 0) + (disputeCounts['none'] || 0), color: 'bg-purple-500', barColor: '#a855f7' }
                  ];

                  const totalDisputesWithCount = disputeTypesData.reduce((acc, d) => acc + d.count, 0) || 1;

                  return (
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 select-none hover:border-amber-500/25 transition-all">
                      <div className="lg:col-span-5 flex flex-col justify-between text-right space-y-3">
                        <div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-slate-400 text-xs font-black">المحفظة الاستثمارية العقارية المأرشفة</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-white mt-1.5 font-mono tracking-tight">
                            {totalPortfolioValue.toLocaleString('ar-EG')} <span className="text-xs font-black text-slate-400">ج.م</span>
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-900/50 p-2 text-right rounded-xl border border-slate-850/60">
                            <span className="text-slate-500 text-[10px] font-bold block mb-0.5">الأصول المدرجة</span>
                            <span className="text-white font-black text-xs font-mono">{totalAssetsCount} قضايا</span>
                          </div>
                          <div className="bg-slate-900/50 p-2 text-right rounded-xl border border-slate-850/60">
                            <span className="text-slate-500 text-[10px] font-bold block mb-0.5">متوسط قيمة الأصول</span>
                            <span className="text-emerald-400 font-black text-xs font-mono">
                              {Math.round(totalPortfolioValue / (totalAssetsCount || 1)).toLocaleString('ar-EG')} ج
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-r border-slate-800/80 pt-3 lg:pt-0 lg:pr-5 flex flex-col justify-center space-y-2">
                        <span className="text-slate-400 text-xs font-black text-right block">📊 توزيع أنواع النزاعات وحصصها في المحفظة</span>
                        <div className="space-y-1.5">
                          {disputeTypesData.map((d) => {
                            const pct = Math.round((d.count / totalDisputesWithCount) * 100);
                            return (
                              <div key={d.id} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-slate-500 font-mono">{pct}% ({d.count})</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-300">{d.name}</span>
                                    <span className={`w-2 h-2 rounded-full ${d.color}`} />
                                  </div>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${pct}%`,
                                      backgroundColor: d.barColor,
                                      boxShadow: `0 0 4px ${d.barColor}80`
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {casesArchive.map((sc) => {
                    const isActive = caseData.caseNumber === sc.caseNumber;
                    
                    // Calculate next session details for this archived case
                    const scSessions = sc.sessions || [];
                    const todayStr = new Date().toISOString().split('T')[0];
                    const upcomingSessions = scSessions.filter(s => s.date >= todayStr);
                    const nextSession = upcomingSessions.length > 0 
                      ? upcomingSessions.sort((a, b) => a.date.localeCompare(b.date))[0]
                      : null;
                      
                    let daysUntilNext = 9999;
                    if (nextSession) {
                      const today = new Date(todayStr);
                      const sessDateObj = new Date(nextSession.date);
                      const diffTime = sessDateObj.getTime() - today.getTime();
                      daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    return (
                      <div
                        key={sc.caseNumber}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3.5 ${
                          isActive 
                            ? 'bg-amber-500/5 border-amber-500/35 shadow-md shadow-amber-500/5' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/20 hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-1.5 text-right">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono font-black">{sc.caseNumber}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                              sc.status === 'جديدة' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              sc.status === 'قيد النظر' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {sc.status}
                            </span>
                          </div>
                          
                          <h4 className="text-white text-xs font-black leading-snug truncate mt-1">
                            {sc.title}
                          </h4>
                          
                          <p className="text-[10px] text-slate-400 leading-snug font-semibold line-clamp-1">
                            🏢 {sc.court}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-bold">
                            <span>📐 المساحة: {sc.landArea} م²</span>
                            <span>•</span>
                            <span>⚖️ التخصص: {
                              sc.dispute.type === 'inheritance' ? 'مواريث وتركات' : 
                              sc.dispute.type === 'contract' ? 'نزاع عقدي وإخلاء' : 
                              sc.dispute.type === 'boundary' ? 'تداخل حدود عقارية' : 'تقييم عقاري وتثبيت ملكية'
                            }</span>
                          </div>

                          {/* 🕰️ Next session countdown alert display */}
                          {nextSession ? (
                            <div className={`mt-2 p-1.5 px-2 rounded-lg border flex items-center justify-between text-[9px] font-black ${
                              daysUntilNext <= 3 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                                : daysUntilNext <= 7 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                            }`}>
                              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="truncate">جلسة ({nextSession.type}): {nextSession.date}</span>
                              </span>
                              <span className="bg-slate-950 px-1 py-0.5 rounded font-mono shrink-0">
                                {daysUntilNext === 0 ? 'اليوم!' : daysUntilNext === 1 ? 'غداً!' : `خلال ${daysUntilNext} يوم`}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2 p-1 px-2 rounded bg-slate-950/20 border border-slate-850/30 text-[9px] text-slate-500 font-bold flex items-center gap-1 justify-center">
                              <span>لم تحدد جلسات قادمة</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons inside each case item */}
                        <div className="flex items-center gap-2 border-t border-slate-850 pt-3">
                          <button
                            onClick={() => handleLoadArchivedCase(sc.caseNumber)}
                            disabled={isActive}
                            className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isActive
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default'
                                : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isActive ? 'القضية النشطة حالياً' : 'تحميل للعمل والمحاكاة'}</span>
                          </button>

                          <button
                            onClick={() => handleCloneCase(sc)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 p-1.5 rounded-lg transition-all"
                            title="نسخ القضية وتكرارها"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteArchivedCase(sc.caseNumber)}
                            className="bg-slate-900 hover:bg-slate-800 hover:border-red-900 text-slate-500 hover:text-red-400 border border-slate-800 p-1.5 rounded-lg transition-all"
                            title="حذف القضية نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'details' && (
            <div className="animate-in fade-in duration-200">
              <CaseDetailsTab 
                caseData={caseData} 
                onUpdateCaseData={handleUpdateCaseData} 
                theme={theme}
              />
            </div>
          )}

          {activeTab === 'heirs_hub' && (
            <div className="animate-in fade-in duration-200">
              <HeirsHubTab 
                caseData={caseData} 
                onUpdateCaseData={handleUpdateCaseData} 
                onMaximize={(panelId) => setMaximizedPanel(panelId)}
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div className="animate-in fade-in duration-200">
              <ChatVoiceUploadTab 
                caseData={caseData} 
                onUpdateCaseData={handleUpdateCaseData} 
                results={results}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-white text-sm font-black border-b border-slate-800 pb-2">سجل الحدود الجغرافية الرقمية والتطابق</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  خريطة المسح العقاري الجغرافي نشطة ومستمرة على الجانب الأيسر للشاشة دائماً. فيما يلي بيانات الحدود ومطابقتها الاستقصائية من لجنة خبراء وزارة العدل:
                </p>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">العرض الجغرافي (Latitude):</span>
                    <span className="text-white font-mono">{caseData.latitude}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">الطول الجغرافي (Longitude):</span>
                    <span className="text-white font-mono">{caseData.longitude}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">نطاق البلوك المساحي (Sector Zone):</span>
                    <span className="text-white font-mono">EG-GIZA-0{Math.floor(caseData.latitude)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">حالة الربط بالأقمار الصناعية:</span>
                    <span className="text-emerald-400 font-bold">متصل نشط (GPS Lock)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="animate-in fade-in duration-200">
              <AgentSmithRunner 
                caseData={caseData} 
                results={results} 
                isAnalyzing={isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
              />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="animate-in fade-in duration-200">
              <ReportView 
                caseData={caseData} 
                results={results} 
                onPrint={handlePrint}
              />
            </div>
          )}

          {activeTab === 'mindmap' && (
            <div className="animate-in fade-in duration-200">
              <MindMapTab />
            </div>
          )}

          {activeTab === 'court' && (
            <div className="animate-in fade-in duration-200">
              <CourtTab 
                caseData={caseData}
                results={results}
                onUpdateCaseData={handleUpdateCaseData}
              />
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="animate-in fade-in duration-200">
              <InquiriesPage />
            </div>
          )}

        </main>

        {/* LEFT Column: Maps and Images (شمال الشاشة) - Hidden on files, mindmap, and court tabs as they are fully integrated or need full width there */}
        {activeTab !== 'files' && activeTab !== 'mindmap' && activeTab !== 'court' && activeTab !== 'inquiries' && (
          <div className="lg:col-span-3 space-y-6 order-3 lg:order-none">
            <MapTab 
              caseData={caseData} 
              results={results} 
              onUpdateCoordinates={handleUpdateCoordinates} 
              startWithVirtualCourt={startWithVirtualCourt}
              onClearStartWithVirtualCourt={() => setStartWithVirtualCourt(false)}
              theme={theme}
            />
          </div>
        )}

      </div>

      {/* Futuristic Bottom Status Bar */}
      <footer className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-[11px] text-slate-400 font-mono shadow-inner flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>نظام سمارت إكسبيرت جاهز للاستخدام</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>إصدار التطبيق: v1.0.0</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-slate-400">
          <span>الخبير المعين: كابتن حسام (مصلحة الخبراء بوزارة العدل)</span>
          <span className="text-slate-600">|</span>
          <span>رقم القضية النشط: {caseData.caseNumber}</span>
        </div>
      </footer>

      </div>

      {/* About Modal Dialog */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 left-4 w-8 h-8 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="text-2xl">🏗️</span>
                <div>
                  <h3 className="text-white text-base font-black">سمارت إكسبيرت (Smart Expert)</h3>
                  <span className="text-[11px] text-slate-400 font-bold">النظام الخبير المتكامل للتقييم العقاري والمواريث القضائية</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-semibold">
                <p>
                  نظام استشاري قضائي متكامل تم تطويره ونمذجته برمجياً لتسهيل مهام الخبراء المعينين من قبل وزارة العدل المصرية والمحاكم في فض النزاعات العقارية وحصر وتقسيم التركات.
                </p>
                <p>
                  يحتوي البرنامج على معادلات دقيقة مشتقة من أكواد الهندسة الإنشائية، وقوانين الشهر العقاري والضرائب السارية، بالإضافة لقسمة المواريث الشرعية المستمدة من الفقه الإسلامي الحنيف وصيغة (للذكر مثل حظ الأنثيين).
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs space-y-2.5">
                <span className="text-amber-500 font-black block border-b border-slate-900 pb-1">مطور النظام والخبراء الفنيين:</span>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                    ح
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold">كابتن حسام</span>
                    <span className="text-[10px] text-slate-500 font-bold">خبير عقاري وأنظمة النظم الخبيرة المتقدمة</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-500" /> 01127913358</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> captinhosam3@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal Dialog */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 left-4 w-8 h-8 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <div className="space-y-4">
              <h3 className="text-white text-base font-black border-b border-slate-800 pb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>دليل الاستخدام والتعليمات الميدانية</span>
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-semibold">
                <div className="space-y-1">
                  <span className="text-amber-400 font-extrabold">1. إدخال أو تعديل بيانات القضية:</span>
                  <p className="text-slate-400 font-medium">اذهب لتبويب "بيانات العقار والخصوم" لتعديل مساحات الأرض والمنشآت ونوع التشطيب وأعمار المباني.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-400 font-extrabold">2. محاكاة شجرة الورثة والقسمة:</span>
                  <p className="text-slate-400 font-medium">أضف الورثة وسجل القرابة، وسيقوم النظام آلياً بحساب التركات والأنصبة الشرعية والقسمة بكسور مئوية متناهية الدقة.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-400 font-extrabold">3. تفعيل مسح الـ GPS والخرائط:</span>
                  <p className="text-slate-400 font-medium">اختر أحد المواقع المرجعية بمحافظة الجيزة والقاهرة، واضغط "بدء المسح الطيفي" لرصد التربة والحدود الجغرافية.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-400 font-extrabold">4. تشغيل سيمفونية الوكلاء (Agent Smith):</span>
                  <p className="text-slate-400 font-medium">من خلال تبويب الوكلاء الخمسين، اضغط "تشغيل" لتشاهد كيف تتفاعل وتصوت النماذج الذكائية وترد بالنتائج واللوغاريتمات.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings / Preferences Drawer Overlay */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-r border-slate-800 w-full max-w-sm p-6 shadow-2xl relative text-right animate-in slide-in-from-left duration-250 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-white text-base font-black flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <span>تفضيلات وإعدادات النظام الخبير</span>
                </h3>
                <button 
                  onClick={() => setShowSettingsDrawer(false)}
                  className="w-8 h-8 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                اضبط ثوابت الحسابات والضرائب والأسعار العالمية المعتمدة في النمذجة الإنشائية والمالية:
              </p>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-bold">سعر المتر المربع الافتراضي للأرض السكنية (جنيه)</label>
                  <input 
                    type="number" 
                    value={baseLandValueResidential}
                    onChange={e => setBaseLandValueResidential(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-bold">سعر طن حديد التسليح الافتراضي (جنيه)</label>
                  <input 
                    type="number" 
                    value={baseSteelPricePerTon}
                    onChange={e => setBaseSteelPricePerTon(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs font-bold">حد الإعفاء الضريبي السنوي للإيجارات (جنيه)</label>
                  <input 
                    type="number" 
                    value={taxExemptionLimit}
                    onChange={e => setTaxExemptionLimit(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowSettingsDrawer(false);
                alert('تم تحديث التفضيلات والمعايير بنجاح! تم إعادة حساب المخرجات العقارية فورياً.');
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              حفظ التفضيلات وتطبيق التغييرات
            </button>
          </div>
        </div>
      )}

      {/* Global Floating Toast Notifications Container */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 pointer-events-auto animate-in slide-in-from-left-6 duration-300 text-right ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-emerald-950/10' :
              toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300 shadow-amber-950/10' :
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300 shadow-red-950/10' :
              'bg-slate-900/90 border-slate-750 text-cyan-300 shadow-slate-950/10'
            }`}
          >
            {/* Status indicators */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <span className="text-emerald-400">✓</span>}
              {toast.type === 'warning' && <span className="text-amber-400">⚠</span>}
              {toast.type === 'error' && <span className="text-red-400">🛑</span>}
              {toast.type === 'info' && <span className="text-cyan-400">ℹ</span>}
            </div>
            
            <div className="flex-1 space-y-0.5 text-right">
              <span className="text-white text-xs font-black block leading-tight">إشعار النظام الذكي</span>
              <p className="text-[10.5px] font-semibold leading-relaxed text-slate-200">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-white text-xs font-bold leading-none cursor-pointer self-start pl-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ⛶ FULL-SCREEN MAXIMIZED PANEL OVERLAY */}
      {maximizedPanel && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto animate-in fade-in duration-300" dir="rtl">
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">⛶</span>
                <h3 className="text-white text-base font-black">
                  {maximizedPanel === 'gallery' && 'معرض الصور الميدانية الهندسي'}
                  {maximizedPanel === 'references' && 'المراجع والمطابقات القانونية والهندسية'}
                  {maximizedPanel === 'heirs_list' && 'بوابة تقسيم المواريث والتركات الشائعة'}
                  {maximizedPanel === 'area_registry' && 'منصة الإدارة والفرز العقاري الذكي'}
                  {maximizedPanel === 'cases_archive' && 'مركز الحفظ والتأريخ والأرشفة القضائية'}
                </h3>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded font-bold">
                  عرض كامل الشاشة
                </span>
              </div>
              <button 
                onClick={() => setMaximizedPanel(null)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>تصغير النافذة</span>
                <span>✕</span>
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 overflow-y-auto">
              {maximizedPanel === 'references' && (
                <FieldReferencesPanel 
                  caseData={caseData}
                  onUpdateCaseData={handleUpdateCaseData}
                  isMaximized={true}
                  maximizedSection="references"
                />
              )}
              {maximizedPanel === 'gallery' && (
                <FieldReferencesPanel 
                  caseData={caseData}
                  onUpdateCaseData={handleUpdateCaseData}
                  isMaximized={true}
                  maximizedSection="gallery"
                />
              )}
              {maximizedPanel === 'heirs_list' && (
                <HeirsHubTab 
                  caseData={caseData}
                  onUpdateCaseData={handleUpdateCaseData}
                  isMaximized={true}
                  onMaximize={() => setMaximizedPanel(null)}
                />
              )}
              {maximizedPanel === 'area_registry' && (
                <AreaRegistry 
                  caseData={caseData}
                  theme={theme}
                  isMaximized={true}
                  onMaximize={() => setMaximizedPanel(null)}
                />
              )}
              {maximizedPanel === 'cases_archive' && (
                <div className="space-y-6 text-right">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      تصفح وإدارة كافة القضايا والنزاعات العقارية المؤرشفة في النظام مع إمكانية التكرار أو الحذف الفوري وتلقائية العمل والمحاكاة:
                    </p>
                    <button
                      onClick={() => {
                        handleNewCase();
                        setMaximizedPanel(null);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>إضافة قضية جديدة</span>
                    </button>
                  </div>

                  {/* 📊 لوحة بيانات المحفظة الاستثمارية العقارية المصغرة (Dashboard Widget) */}
                  {(() => {
                    const totalAssetsCount = casesArchive.length;
                    const totalPortfolioValue = casesArchive.reduce((acc, sc) => {
                      const val = sc.estateValue || sc.transactionValue || (sc.landArea * 15000) || 500000;
                      return acc + val;
                    }, 0);

                    // Group by dispute type
                    const disputeCounts = casesArchive.reduce((acc, sc) => {
                      const type = sc.dispute?.type || 'none';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    const disputeTypesData = [
                      { id: 'inheritance', name: 'مواريث وتركات', count: disputeCounts['inheritance'] || 0, color: 'bg-amber-500', barColor: '#f59e0b' },
                      { id: 'contract', name: 'نزاع عقدي وإخلاء', count: disputeCounts['contract'] || 0, color: 'bg-emerald-500', barColor: '#10b981' },
                      { id: 'boundary', name: 'تداخل حدود عقارية', count: disputeCounts['boundary'] || 0, color: 'bg-cyan-500', barColor: '#06b6d4' },
                      { id: 'ownership', name: 'تقييم عقاري وتثبيت ملكية', count: (disputeCounts['ownership'] || 0) + (disputeCounts['none'] || 0), color: 'bg-purple-500', barColor: '#a855f7' }
                    ];

                    const totalDisputesWithCount = disputeTypesData.reduce((acc, d) => acc + d.count, 0) || 1;

                    return (
                      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 select-none hover:border-amber-500/25 transition-all">
                        <div className="lg:col-span-4 flex flex-col justify-between text-right space-y-4">
                          <div>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-slate-400 text-xs font-black">المحفظة الاستثمارية العقارية المأرشفة</span>
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white mt-1.5 font-mono tracking-tight">
                              {totalPortfolioValue.toLocaleString('ar-EG')} <span className="text-xs font-black text-slate-400">ج.م</span>
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-950 p-3 text-right rounded-xl border border-slate-850">
                              <span className="text-slate-500 text-[10px] font-bold block mb-1">الأصول المدرجة</span>
                              <span className="text-white font-black text-sm font-mono">{totalAssetsCount} قضايا</span>
                            </div>
                            <div className="bg-slate-950 p-3 text-right rounded-xl border border-slate-850">
                              <span className="text-slate-500 text-[10px] font-bold block mb-1">متوسط قيمة الأصول</span>
                              <span className="text-emerald-400 font-black text-sm font-mono">
                                {Math.round(totalPortfolioValue / (totalAssetsCount || 1)).toLocaleString('ar-EG')} ج
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-8 border-t lg:border-t-0 lg:border-r border-slate-800/80 pt-4 lg:pt-0 lg:pr-6 flex flex-col justify-center space-y-3">
                          <span className="text-slate-400 text-xs font-black text-right block">📊 توزيع أنواع النزاعات وحصصها في المحفظة الاستثمارية</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {disputeTypesData.map((d) => {
                              const pct = Math.round((d.count / totalDisputesWithCount) * 100);
                              return (
                                <div key={d.id} className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 font-mono">{pct}% ({d.count})</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-300">{d.name}</span>
                                      <span className={`w-2 h-2 rounded-full ${d.color}`} />
                                    </div>
                                  </div>
                                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${pct}%`,
                                        backgroundColor: d.barColor,
                                        boxShadow: `0 0 4px ${d.barColor}80`
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {casesArchive.map((sc) => {
                      const isActive = sc.caseNumber === caseData.caseNumber;
                      const scSessions = sc.sessions || [];
                      const todayStr = new Date().toISOString().split('T')[0];
                      const upcomingSessions = scSessions.filter(s => s.date >= todayStr);
                      const nextSession = upcomingSessions.length > 0 
                        ? upcomingSessions.sort((a, b) => a.date.localeCompare(b.date))[0]
                        : null;
                      
                      let daysUntilNext = 9999;
                      if (nextSession) {
                        const today = new Date(todayStr);
                        const sessDateObj = new Date(nextSession.date);
                        const diffTime = sessDateObj.getTime() - today.getTime();
                        daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      }

                      return (
                        <div
                          key={sc.caseNumber}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isActive 
                              ? 'bg-amber-500/5 border-amber-500/40 shadow-xl' 
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-2 text-right">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 font-mono font-bold">{sc.caseNumber}</span>
                              <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold ${
                                sc.status === 'جديدة' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                sc.status === 'قيد النظر' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {sc.status}
                              </span>
                            </div>
                            
                            <h4 className="text-white text-sm font-black leading-snug">
                              {sc.title}
                            </h4>
                            
                            <p className="text-xs text-slate-400 leading-snug font-semibold">
                              🏢 {sc.court}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                              <span>📐 المساحة: {sc.landArea} م²</span>
                              <span>•</span>
                              <span>⚖️ التخصص: {
                                sc.dispute.type === 'inheritance' ? 'مواريث وتركات' : 
                                sc.dispute.type === 'contract' ? 'نزاع عقدي وإخلاء' : 
                                sc.dispute.type === 'boundary' ? 'تداخل حدود عقارية' : 'تقييم عقاري وتثبيت ملكية'
                              }</span>
                            </div>

                            {nextSession ? (
                              <div className={`mt-2 p-2 rounded-xl border flex items-center justify-between text-xs font-black ${
                                daysUntilNext <= 3 
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                                  : daysUntilNext <= 7 
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                              }`}>
                                <span className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>جلسة ({nextSession.type}): {nextSession.date}</span>
                                </span>
                                <span className="bg-slate-950 px-2 py-0.5 rounded font-mono shrink-0 text-[10px]">
                                  {daysUntilNext === 0 ? 'اليوم!' : daysUntilNext === 1 ? 'غداً!' : `خلال ${daysUntilNext} يوم`}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2 p-1.5 rounded-lg bg-slate-950/20 border border-slate-850/30 text-[10px] text-slate-500 font-bold flex items-center gap-1 justify-center">
                                <span>لم تحدد جلسات قادمة</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
                            <button
                              onClick={() => {
                                handleLoadArchivedCase(sc.caseNumber);
                                setMaximizedPanel(null);
                              }}
                              disabled={isActive}
                              className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default'
                                  : 'bg-slate-850 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              <FileCheck className="w-4 h-4 text-amber-500" />
                              <span>{isActive ? 'القضية النشطة حالياً' : 'تحميل للعمل والمحاكاة'}</span>
                            </button>

                            <button
                              onClick={() => handleCloneCase(sc)}
                              className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 p-2 rounded-xl transition-all"
                              title="نسخ القضية وتكرارها"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteArchivedCase(sc.caseNumber);
                                if (isActive) {
                                  setMaximizedPanel(null);
                                }
                              }}
                              className="bg-slate-850 hover:bg-slate-800 hover:border-red-900 text-slate-500 hover:text-red-400 border border-slate-800 p-2 rounded-xl transition-all"
                              title="حذف القضية نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

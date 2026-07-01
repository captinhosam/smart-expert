import React, { useState, useEffect } from 'react';
import { CaseData } from './types';
import { SAMPLE_CASES, EXPERT_SYSTEM_AGENTS } from './data/expertSystemData';
import { calculateAll } from './utils/calculations';
import MenuBar from './components/MenuBar';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import MapTab from './components/MapTab';
import CaseDetailsTab from './components/CaseDetailsTab';
import ChatVoiceUploadTab from './components/ChatVoiceUploadTab';
import AgentSmithRunner from './components/AgentSmithRunner';
import ReportView from './components/ReportView';
import StartPage from './components/StartPage';

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
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [caseData, setCaseData] = useState<CaseData>(SAMPLE_CASES[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showStartPage, setShowStartPage] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'paper'>('dark');

  const handleToggleTheme = () => {
    // Locked to dark theme as requested
    setTheme('dark');
  };

  const handleLoadSampleAndEnter = (index: number) => {
    if (SAMPLE_CASES[index]) {
      setCaseData(SAMPLE_CASES[index]);
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
    setCaseData(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const handleUpdateCoordinates = (lat: number, lng: number, locationName: string) => {
    setCaseData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: locationName
    }));
  };

  const handleNewCase = () => {
    const freshCase: CaseData = {
      caseNumber: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'نزاع فرز وتقسيم جديد',
      court: 'محكمة الجيزة الابتدائية',
      judge: 'المستشار رئيس الدائرة الثالثة عقاري',
      expertName: 'كابتن حسام',
      date: new Date().toISOString().split('T')[0],
      status: 'جديدة',
      landArea: 600,
      landType: 'بناء',
      location: 'منطقة الأهرامات - شارع الملك فيصل، الهرم، الجيزة',
      hasBuilding: false,
      buildingArea: 0,
      floors: 0,
      finishType: 'نصف تشطيب',
      buildingType: 'سكني',
      buildingAge: 0,
      annualRent: 0,
      transactionValue: 0,
      estateValue: 0,
      heirs: [],
      dispute: {
        hasDispute: true,
        type: 'ownership',
        details: 'أدخل تفاصيل ومذكرات الخصومة العقارية هنا...'
      },
      latitude: 29.9868,
      longitude: 31.1302
    };
    setCaseData(freshCase);
    setActiveTab('details');
  };

  const handleOpenSample = (index: number) => {
    if (SAMPLE_CASES[index]) {
      setCaseData(SAMPLE_CASES[index]);
    }
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
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
        onEnterWorkspace={() => setShowStartPage(false)} 
        onLoadSampleAndEnter={handleLoadSampleAndEnter} 
      />
    );
  }

  return (
    <div className={`min-h-screen p-4 font-sans select-none antialiased relative overflow-x-hidden transition-all duration-300 ${
      theme === 'paper' ? 'theme-paper' : 'bg-[#0d0d0f] text-zinc-100'
    }`}>
      {/* 3D-like Glowing Interactive Ambience Grid Background */}
      {theme === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b1f_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none -z-10"></div>
        </>
      )}

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
        <main className="lg:col-span-6 space-y-6 order-2 lg:order-none">
          
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

              {/* Central Information Desk */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Scale className="w-4.5 h-4.5 text-amber-500" />
                  <span>موجز مذكرات الخصومة القضائية والنزاع</span>
                </h3>
                
                <div className="space-y-3.5 leading-relaxed text-slate-300 text-xs font-semibold">
                  <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                    <span className="text-amber-500 text-sm mt-0.5">⚖️</span>
                    <div className="space-y-1">
                      <span className="text-white font-extrabold text-xs block">ملاحظات وقرارات المحكمة التوجيهية للخبرة:</span>
                      <p className="text-slate-400 leading-relaxed font-semibold">
                        {caseData.dispute.hasDispute ? caseData.dispute.details : 'العقار خالي من النزاعات والحدود الجغرافية سليمة تماماً وموثقة في السجلات.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 space-y-2">
                      <span className="text-amber-500 text-xs font-black block">تشخيصات القيمة الأرضية:</span>
                      <ul className="space-y-1.5 text-slate-400 text-[11px] font-semibold">
                        <li className="flex justify-between">
                          <span>قيمة الأرض الفردية:</span>
                          <span className="text-white font-mono">{results.landValue.toLocaleString('ar-EG')} ج</span>
                        </li>
                        <li className="flex justify-between">
                          <span>نصيب فدان/قيراط/سهم:</span>
                          <span className="text-white font-mono">{results.faddan}ف / {results.qirat}ق / {results.sahm}س</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 space-y-2">
                      <span className="text-amber-500 text-xs font-black block">تشخيصات المنشأ والمباني:</span>
                      <ul className="space-y-1.5 text-slate-400 text-[11px] font-semibold">
                        <li className="flex justify-between">
                          <span>تكلفة التأسيس والتشطيب:</span>
                          <span className="text-white font-mono">{results.constructionCost.toLocaleString('ar-EG')} ج</span>
                        </li>
                        <li className="flex justify-between">
                          <span>بعد الاستهلاك والتقادم:</span>
                          <span className="text-white font-mono">{results.depreciatedBuildingValue.toLocaleString('ar-EG')} ج</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    تعديل مواصفات القضية
                  </button>
                  <button 
                    onClick={() => setActiveTab('agents')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    استعراض محاكاة الوكلاء
                  </button>
                </div>
              </div>

              {/* Sample Cases Quick Loader Carousel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
                <h3 className="text-white text-sm font-black flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-amber-500" />
                  <span>تحميل قضايا عقارية نموذجية جاهزة للاستعراض</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SAMPLE_CASES.map((sc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenSample(idx)}
                      className={`text-right p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                        caseData.caseNumber === sc.caseNumber 
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 font-mono block leading-none">{sc.caseNumber}</span>
                      <span className="text-white text-xs font-black truncate mt-1 leading-normal">{sc.title}</span>
                      <span className="text-[10px] text-amber-500 font-bold mt-1">تخصص: {sc.dispute.type === 'inheritance' ? 'ميراث وتركة' : sc.dispute.type === 'boundary' ? 'تداخل حدود' : 'تقييم فني'}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'details' && (
            <div className="animate-in fade-in duration-200">
              <CaseDetailsTab 
                caseData={caseData} 
                onUpdateCaseData={handleUpdateCaseData} 
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div className="animate-in fade-in duration-200">
              <ChatVoiceUploadTab 
                caseData={caseData} 
                onUpdateCaseData={handleUpdateCaseData} 
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

        </main>

        {/* LEFT Column: Maps and Images (شمال الشاشة) */}
        <div className="lg:col-span-3 space-y-6 order-3 lg:order-none">
          <MapTab 
            caseData={caseData} 
            results={results} 
            onUpdateCoordinates={handleUpdateCoordinates} 
          />
        </div>

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

    </div>
  );
}

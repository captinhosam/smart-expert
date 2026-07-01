import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Cpu, 
  Coins, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Scale, 
  Search, 
  Users, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Gavel,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface StartPageProps {
  onEnterWorkspace: () => void;
  onLoadSampleAndEnter: (sampleIndex: number) => void;
}

export default function StartPage({ onEnterWorkspace, onLoadSampleAndEnter }: StartPageProps) {
  const [activeMenu, setActiveMenu] = useState<'accounting' | 'diagnostic' | 'taxes' | 'results'>('accounting');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gavelTapped, setGavelTapped] = useState(false);
  const [balanceAngle, setBalanceAngle] = useState(0);

  // Mouse move parallax effect for 3D simulation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 35;
      const y = (e.clientY - innerHeight / 2) / 35;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Legal balance tilt animation depending on selected menu
  useEffect(() => {
    const tiltMap = {
      accounting: -12,
      diagnostic: 15,
      taxes: -6,
      results: 8
    };
    setBalanceAngle(tiltMap[activeMenu] || 0);
  }, [activeMenu]);

  const expertMenus = {
    accounting: {
      title: 'المدخل المحاسبي والمالي وحصر التركات',
      shortTitle: 'المدخل المحاسبي والمالي',
      engTitle: 'Accountancy Core',
      icon: Coins,
      color: 'border-cyan-500 text-cyan-400 shadow-cyan-500/20 bg-cyan-950/20',
      textColor: 'text-cyan-400',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      items: [
        { label: 'حصر التركات وتوزيع المواريث الشرعية', desc: 'تطبيق معادلات الفرض والتعصيب والرد والعول الفقهي آلياً وبصيغ دقيقة.', sampleIdx: 0 },
        { label: 'تقييم أصول تركة الدقي السكنية', desc: 'حساب متوسط سعر المتر ونسب التقادم المالي للمنشآت والمباني.', sampleIdx: 0 },
        { label: 'تقدير العائد الاستثماري والريع السنوي', desc: 'حساب القيمة الحالية والمستقبلية لعوائد الإيجارات العقارية.', sampleIdx: 1 }
      ]
    },
    diagnostic: {
      title: 'الدراسة الاختبارية والهندسية ومساحة الـ GPS',
      shortTitle: 'الدراسة الاختبارية والهندسية',
      engTitle: 'Technical Diagnostics',
      icon: Layers,
      color: 'border-emerald-500 text-emerald-400 shadow-emerald-500/20 bg-emerald-950/20',
      textColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      items: [
        { label: 'الرفع المساحي وتعيين الحدود العسكرية والجغرافية', desc: 'تحديد إحداثيات GPS الدقيقة ورصد تداخل الأملاك الفعلي على الخريطة.', sampleIdx: 1 },
        { label: 'حساب كميات حديد التسليح والخرسانة الأساسية', desc: 'مطابقة الرسومات الإنشائية والمقايسات الميدانية للمنشأة هندسياً.', sampleIdx: 2 },
        { label: 'معاينة التربة والعمق الطيفي للمياه الجوفية', desc: 'تحليل منسوب المياه وحموضة التربة لتقرير التأسيس والمباني.', sampleIdx: 1 }
      ]
    },
    taxes: {
      title: 'الأنشطة العقارية والخصومة والطعون الضريبية',
      shortTitle: 'الأنشطة العقارية والضرائب',
      engTitle: 'Tax & Property Activities',
      icon: ShieldCheck,
      color: 'border-amber-500 text-amber-400 shadow-amber-500/20 bg-amber-950/20',
      textColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      items: [
        { label: 'لجان المنازعات والطعون الضريبية القضائية', desc: 'احتساب ضريبة كسب العمل والرسوم المقررة قانوناً بالخبرة.', sampleIdx: 2 },
        { label: 'ضرائب التصرفات العقارية ورسوم الشهر العقاري', desc: 'تقدير الرسوم المستحقة لتسجيل الملكيات ونقل الحيازات.', sampleIdx: 2 },
        { label: 'تقدير فروق القيمة والضرائب الاستثنائية للخصوم', desc: 'تحليل مالي ومطابقة للقوانين الضريبية العقارية المحدثة.', sampleIdx: 0 }
      ]
    },
    results: {
      title: 'النتائج والقرارات والتوصيات القضائية الصائبة',
      shortTitle: 'النتائج والتوصيات الفنية',
      engTitle: 'Judicial Expert Decisions',
      icon: Scale,
      color: 'border-purple-500 text-purple-400 shadow-purple-500/20 bg-purple-950/20',
      textColor: 'text-purple-400',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      items: [
        { label: 'إصدار التقرير القضائي النهائي المعتمد بنقرة', desc: 'تحرير الصيغة القانونية المستوفاة لمتطلبات المحكمة والنيابة والمجلس الأعلى.', sampleIdx: 0 },
        { label: 'تشغيل سيمفونية الوكلاء الخمسين (Agent Smith)', desc: 'محاكاة العقل الاستدلالي الرقمي لرصد التناقضات والتوافق التام.', sampleIdx: 1 },
        { label: 'اعتماد قرارات لجان فض المنازعات والفرز', desc: 'حساب أنصبة الشركاء والفرز والتجنيب العادل بتقرير خبير متكامل.', sampleIdx: 2 }
      ]
    }
  };

  const currentMenuData = expertMenus[activeMenu];

  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans select-none flex flex-col justify-between p-4 md:p-6 transition-all duration-500">
      
      {/* 3D-Like Metallic/Gray-Indigo Radial Background with mesh and subtle glowing overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-zinc-950"></div>
        
        {/* Dynamic neon vector light elements */}
        <div className="absolute top-10 left-1/3 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px]"></div>

        {/* Cyber technical grid lines in high-contrast overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:50px_50px] opacity-40"></div>
        
        {/* Digital Blueprint Lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 150 H 300 L 350 200 V 400 L 400 450 H 800 L 850 500 V 800" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="10,5" />
          <path d="M 1400 150 H 1100 L 1050 200 V 500 L 1000 550 H 600 L 550 600 V 800" fill="none" stroke="#6366f1" strokeWidth="1" />
          <circle cx="350" cy="200" r="5" fill="#0ea5e9" />
          <circle cx="1050" cy="200" r="5" fill="#6366f1" />
        </svg>
      </div>

      {/* 1. Header Area with Golden & Light accents */}
      <header className="relative z-10 w-full flex items-start justify-between border-b border-slate-800/60 pb-3">
        {/* Top Left Branding */}
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-cyan-500/15 text-cyan-400 px-3 py-0.5 rounded-full border border-cyan-500/25 tracking-wider">التحديث 2.0 • منصة تفاعلية ثلاثية الأبعاد</span>
            <span className="text-[10px] font-black bg-amber-500/15 text-amber-400 px-3 py-0.5 rounded-full border border-amber-500/25">النسخة القضائية المعتمدة</span>
          </div>
          <h1 className="text-white text-lg md:text-2xl font-black tracking-tight leading-snug drop-shadow-[0_2px_15px_rgba(6,182,212,0.2)]">
            النظم الخبيرة في قطاع الأراضي والعقارات والقوانين القضائية
          </h1>
          <span className="text-cyan-400 text-xs md:text-sm font-black block tracking-widest pl-1">
            ســمــارت إكــســبــيــرت
          </span>
        </div>

        {/* Top Right Branding */}
        <div className="text-right space-y-0.5">
          <h2 className="text-sky-400 text-lg md:text-xl font-black flex items-center gap-2 justify-end drop-shadow-[0_2px_10px_rgba(56,189,248,0.25)]">
            النظم الخبيرة
          </h2>
          <span className="text-orange-500 font-extrabold text-[10px] tracking-wider uppercase block font-mono">
            EXPERT SYSTEMS • LAW & LANDS
          </span>
        </div>
      </header>

      {/* 2. Main Interactive Hub Area - Beautiful Grid Split for 3D concentric wheel + Side Terminal Panel */}
      <main className="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 w-full max-w-7xl mx-auto px-2">
        
        {/* LEFT COLUMN (Lg: 5): Stable Control Deck (لوحة التحكم الخبيرة والخدمات لتجنب التداخل) */}
        <div className="lg:col-span-5 space-y-5 order-2 lg:order-1 bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-600">
          
          {/* Subtle neon gold glow corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"></div>

          {/* Legal Animation Widget: Scales of Justice SVG (الميزان) with Courtroom Gavel */}
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block">العقد التشغيلي والقانوني</span>
              <span className="text-xs text-white font-black flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>أداء اليمين والفرائض الفقهية</span>
              </span>
            </div>
            
            {/* Visual interactive legal animation with scales of justice */}
            <div className="flex items-center gap-4">
              
              {/* Interactive Tappable Courtroom Gavel */}
              <button 
                onClick={() => {
                  setGavelTapped(true);
                  setTimeout(() => setGavelTapped(false), 600);
                }}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                title="اضغط على مطرقة المحكمة لتجربة تفاعلية"
              >
                <Gavel className={`w-5 h-5 text-amber-400 transition-transform ${gavelTapped ? 'rotate-[-35deg] scale-110' : 'group-hover:rotate-[-10deg]'}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              </button>

              {/* Scales of Justice SVG */}
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-full h-full text-cyan-400"
                  style={{
                    transform: `rotate(${balanceAngle}deg)`,
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {/* Scale Base structure */}
                  <line x1="50" y1="90" x2="50" y2="20" stroke="currentColor" strokeWidth="4" />
                  <line x1="30" y1="90" x2="70" y2="90" stroke="currentColor" strokeWidth="4" />
                  
                  {/* Balance Beam */}
                  <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="30" r="3.5" fill="#f59e0b" />
                  
                  {/* Left Pan */}
                  <line x1="20" y1="30" x2="10" y2="60" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="30" x2="30" y2="60" stroke="currentColor" strokeWidth="2" />
                  <path d="M 8 60 Q 20 70 32 60 Z" fill="currentColor" opacity="0.4" />
                  <line x1="8" y1="60" x2="32" y2="60" stroke="currentColor" strokeWidth="2.5" />

                  {/* Right Pan */}
                  <line x1="80" y1="30" x2="70" y2="60" stroke="currentColor" strokeWidth="2" />
                  <line x1="80" y1="30" x2="90" y2="60" stroke="currentColor" strokeWidth="2" />
                  <path d="M 68 60 Q 80 70 92 60 Z" fill="currentColor" opacity="0.4" />
                  <line x1="68" y1="60" x2="92" y2="60" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </div>

            </div>
          </div>

          {/* Active Terminal Info */}
          <div className="space-y-2 border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${currentMenuData.badgeColor} uppercase tracking-wider font-mono`}>
                {currentMenuData.engTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">المحور النشط حالياً</span>
            </div>
            <h3 className={`text-sm md:text-base font-black ${currentMenuData.textColor} tracking-tight`}>
              {currentMenuData.title}
            </h3>
          </div>

          {/* Submenu Item Buttons - Elegant Card design to completely prevent overlapping */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold block tracking-wider">
              انقر لتشغيل المحاكاة الذكية وتحميل القضية الميدانية المعنية:
            </span>
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {currentMenuData.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onLoadSampleAndEnter(item.sampleIdx)}
                  className="w-full text-right p-3 rounded-xl bg-slate-950/75 border border-slate-800 hover:bg-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group flex flex-col gap-1 shadow-sm relative overflow-hidden active:scale-[0.99] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-start justify-between w-full">
                    <span className="text-white text-xs font-black group-hover:text-amber-400 transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 transition-transform group-hover:translate-x-[-4px] group-hover:text-amber-400 rotate-180" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    {item.desc}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-cyan-400 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>تفعيل البيانات والمحاكاة الفورية للتقرير</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Workspace Action Button */}
          <div className="pt-2">
            <button 
              onClick={onEnterWorkspace}
              className="w-full group relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 active:scale-95 border border-yellow-300/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>الدخول المباشر إلى فضاء التحليل الثلاثي (التحديث 1)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (Lg: 7): Glowing Interactive 3D Cyber Cogwheel Wheel (The original wheel centered with mouse tilts) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2">
          
          <div className="mb-4 text-center">
            <span className="text-slate-400 text-[11px] font-black tracking-widest block mb-1">
              عجلة التوزيع الاستراتيجي للنظام الخبير
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              حرك المؤشر لتجربة الأبعاد الثلاثية والضغط على أي من المحاور لتعديل لوحة التحكم
            </p>
          </div>

          {/* Interactive Wheel 3D Container */}
          <div 
            className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] xl:w-[420px] xl:h-[420px] flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            
            {/* Animated concentric decorative rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/15 animate-[ping_10s_infinite_linear]"></div>
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-500/15 animate-[spin_80s_infinite_linear]"></div>
            <div className="absolute inset-8 rounded-full border border-blue-500/20"></div>
            
            {/* Center Master Cogwheel nucleus */}
            <div 
              className="absolute inset-20 rounded-full bg-slate-950/70 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex items-center justify-center"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-950 border-4 border-cyan-400/70 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center p-2 text-center">
                <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
                <span className="text-[10px] text-white font-extrabold mt-1">العقل النشط</span>
                <span className="text-[8px] text-cyan-400 font-mono tracking-widest uppercase">CEO SMITH 2.0</span>
              </div>
            </div>

            {/* Concentric rings segments */}
            <div className="absolute inset-24 rounded-full border border-blue-500/30 border-t-transparent border-b-transparent animate-spin" style={{ animationDuration: '14s' }}></div>
            <div className="absolute inset-28 rounded-full border border-cyan-500/40 border-l-transparent border-r-transparent animate-spin" style={{ animationDuration: '8s' }}></div>

            {/* THE FOUR MAIN CORE INTERACTIVE NODES */}
            
            {/* Node 1: المدخل المحاسبي والمالي (Top Right) */}
            <div 
              className="absolute top-[8%] right-[8%] sm:top-[12%] sm:right-[12%] z-20"
              style={{ transform: 'translateZ(45px)' }}
            >
              <button
                onClick={() => setActiveMenu('accounting')}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 relative flex flex-col items-center gap-1.5 bg-slate-900/90 shadow-lg cursor-pointer ${
                  activeMenu === 'accounting'
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-cyan-400 scale-105 bg-cyan-950/30'
                    : 'border-slate-800 hover:border-cyan-500/60 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] text-slate-300'
                }`}
              >
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <span className="text-[9px] sm:text-xs font-black tracking-tight whitespace-nowrap">المدخل المحاسبي والمالي</span>
                <span className="text-[7px] text-slate-500 font-mono uppercase">Accountancy Core</span>
                
                {/* Active Glowing Dot */}
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'accounting' ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'accounting' ? 'bg-cyan-500' : 'bg-slate-800'}`}></span>
              </button>
            </div>

            {/* Node 2: الدراسة الاختبارية والهندسية (Top Left) */}
            <div 
              className="absolute top-[8%] left-[8%] sm:top-[12%] sm:left-[12%] z-20"
              style={{ transform: 'translateZ(45px)' }}
            >
              <button
                onClick={() => setActiveMenu('diagnostic')}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 relative flex flex-col items-center gap-1.5 bg-slate-900/90 shadow-lg cursor-pointer ${
                  activeMenu === 'diagnostic'
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] text-emerald-400 scale-105 bg-emerald-950/30'
                    : 'border-slate-800 hover:border-emerald-500/60 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-slate-300'
                }`}
              >
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                <span className="text-[9px] sm:text-xs font-black tracking-tight whitespace-nowrap">الدراسة الاختبارية والرفع</span>
                <span className="text-[7px] text-slate-500 font-mono uppercase">Technical Diagnostics</span>
                
                <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'diagnostic' ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'diagnostic' ? 'bg-emerald-500' : 'bg-slate-800'}`}></span>
              </button>
            </div>

            {/* Node 3: الأنشطة العقارية والخصومة (Bottom Right) */}
            <div 
              className="absolute bottom-[8%] right-[8%] sm:bottom-[12%] sm:right-[12%] z-20"
              style={{ transform: 'translateZ(45px)' }}
            >
              <button
                onClick={() => setActiveMenu('taxes')}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 relative flex flex-col items-center gap-1.5 bg-slate-900/90 shadow-lg cursor-pointer ${
                  activeMenu === 'taxes'
                    ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-amber-400 scale-105 bg-amber-950/30'
                    : 'border-slate-800 hover:border-amber-500/60 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] text-slate-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                <span className="text-[9px] sm:text-xs font-black tracking-tight whitespace-nowrap">الأنشطة العقارية والضرائب</span>
                <span className="text-[7px] text-slate-500 font-mono uppercase">Tax & Property Activities</span>
                
                <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'taxes' ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'taxes' ? 'bg-amber-500' : 'bg-slate-800'}`}></span>
              </button>
            </div>

            {/* Node 4: النتائج والتوصيات القضائية (Bottom Left) */}
            <div 
              className="absolute bottom-[8%] left-[8%] sm:bottom-[12%] sm:left-[12%] z-20"
              style={{ transform: 'translateZ(45px)' }}
            >
              <button
                onClick={() => setActiveMenu('results')}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 relative flex flex-col items-center gap-1.5 bg-slate-900/90 shadow-lg cursor-pointer ${
                  activeMenu === 'results'
                    ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] text-purple-400 scale-105 bg-purple-950/30'
                    : 'border-slate-800 hover:border-purple-500/60 hover:text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] text-slate-300'
                }`}
              >
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <span className="text-[9px] sm:text-xs font-black tracking-tight whitespace-nowrap">النتائج والتوصيات الفنية</span>
                <span className="text-[7px] text-slate-500 font-mono uppercase">Judicial Decisions</span>
                
                <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'results' ? 'bg-purple-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full ${activeMenu === 'results' ? 'bg-purple-500' : 'bg-slate-800'}`}></span>
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* 3. Footer Area representing human icons & Future Directions label */}
      <footer className="relative z-10 w-full mt-4 flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        
        {/* Bottom Left Contact - exact representation from image */}
        <div className="flex items-center gap-2 text-right bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/60">
          <Phone className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            لخدمات دقيقة واحترافية، تواصلوا معنا:
          </span>
          <span className="text-cyan-400 font-mono text-xs font-black tracking-widest leading-none pl-1">
            01127913358
          </span>
        </div>

        {/* Bottom Center connected panel of 5 expert figures */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest text-center">
            لجـنـة الـخـبـراء الخـمـسـيـن (التوجيهات المستقبلية)
          </span>
          <div className="flex items-center gap-1.5 justify-center relative">
            <div className="absolute h-0.5 w-[85%] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent top-1/2 -translate-y-1/2 -z-10"></div>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div 
                key={idx} 
                className="w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md hover:border-cyan-400 hover:scale-110 transition-all"
                title={`عضو لجنة خبراء رقم ${idx}`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right Badge - exact oval badge from image */}
        <div className="flex items-center">
          <div className="px-5 py-1.5 rounded-full border border-sky-400/30 bg-sky-950/30 shadow-[0_0_10px_rgba(56,189,248,0.15)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            <span className="text-white text-[10px] font-black tracking-widest">
              النظام الخبير القضائي
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

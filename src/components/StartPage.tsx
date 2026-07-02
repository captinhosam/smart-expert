import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  MapPin, 
  FolderOpen, 
  Users, 
  Cpu, 
  FileText, 
  Mic, 
  MicOff, 
  Compass, 
  Layers, 
  Terminal, 
  ShieldAlert,
  Search,
  ChevronLeft
} from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface StartPageProps {
  onEnterWorkspace: (tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files') => void;
  onLoadSampleAndEnter: (index: number, tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files') => void;
}

export default function StartPage({ onEnterWorkspace, onLoadSampleAndEnter }: StartPageProps) {
  // Voice command state
  const [isListening, setIsListening] = useState(false);
  const [voiceLog, setVoiceLog] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);

  // Parallax rotation state for the central 3D logo
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Entrance animation trigger
  const [isEntering, setIsEntering] = useState(false);

  // Mouse move parallax handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Limit range to -15deg to 15deg
    setRotateX(-y / (rect.height / 30));
    setRotateY(x / (rect.width / 30));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Initialize Speech Recognition for "افتح يا سمسم" voice trigger
  useEffect(() => {
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'ar-EG'; // Egyptian Arabic localization

      rec.onstart = () => {
        setIsListening(true);
        setVoiceLog('الميكروفون نشط.. بانتظار جملة (افتح يا سمسم)');
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        setVoiceLog('حدث خطأ في الاستماع، يمكنك الدخول بالنقر على الشعار.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const resultText = event.results[lastIndex][0].transcript.trim();
        console.log('Spoken phrase detected:', resultText);
        setVoiceLog(`سمعت: "${resultText}"`);

        // Check for triggers "افتح يا سمسم" or "سمسم" or "افتح" or "open sesame"
        const triggers = ['افتح يا سمسم', 'يا سمسم', 'افتح البرنامج', 'افتح', 'سمسم', 'افتتاح', 'open sesame'];
        const matched = triggers.some(trigger => resultText.includes(trigger));

        if (matched) {
          triggerToast('🎙️ تم تفعيل الأمر الصوتي: (افتح يا سمسم) بنجاح!', 'success');
          handleTriggerEnter();
        } else {
          triggerToast(`🎙️ تم سماع "${resultText}".. حاول قول "افتح يا سمسم" بصوت واضح.`, 'info');
        }
      };

      setRecognition(rec);
    } else {
      setVoiceLog('التعرف على الصوت غير مدعوم في هذا المتصفح.');
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      triggerToast('التعرف على الصوت غير مدعوم في متصفحك الحالي.', 'warning');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        triggerToast('🎤 جاري الاستماع للأمر الصوتي (افتح يا سمسم)...', 'info');
      } catch (e) {
        console.error('Could not start recognition', e);
      }
    }
  };

  const handleTriggerEnter = (tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files') => {
    setIsEntering(true);
    triggerToast('⚖️ جاري فك تشفير وتوجيه بوابة النظام القضائي الخبير...', 'success');
    
    // Play sound effects or delay for zoom-out immersion
    setTimeout(() => {
      onEnterWorkspace(tab);
    }, 1200);
  };

  const satelliteButtons = [
    {
      id: 'map',
      title: 'المعاينة الفنية والجغرافية',
      desc: 'بحث و مسح الإحداثيات والتربة بالـ GPS',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
      shadow: 'rgba(6,182,212,0.4)',
      tab: 'map' as const,
      searchLabel: 'موقع المعاينة ونطاقات الجي بي إس'
    },
    {
      id: 'files',
      title: 'سجل المرفقات الرقمية',
      desc: 'بحث وفهرسة المستندات والخرائط والصور المرفقة',
      icon: FolderOpen,
      color: 'from-cyan-400 to-emerald-400',
      shadow: 'rgba(56,189,248,0.4)',
      tab: 'files' as const,
      searchLabel: 'مخزن الملفات والصور المعالجة رقمياً'
    },
    {
      id: 'dashboard',
      title: 'مستشار الورثة والشركاء',
      desc: 'بحث وتوزيع الأنصبة وقسمة التركات الشرعية',
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      shadow: 'rgba(245,158,11,0.4)',
      tab: 'dashboard' as const,
      searchLabel: 'برنامج حصر المواريث والصب الزمني'
    },
    {
      id: 'agents',
      title: 'سيمفونية الوكلاء الذكية',
      desc: 'تشغيل وبحث نماذج تقييم ومحاكاة الخبراء',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-500',
      shadow: 'rgba(139,92,246,0.4)',
      tab: 'agents' as const,
      searchLabel: 'نظام تشغيل عملاء الذكاء الخمسين'
    },
    {
      id: 'report',
      title: 'التقرير الفني والمحرر الفقهي',
      desc: 'تصدير وبحث التقرير القضائي المعتمد والمطبوع',
      icon: FileText,
      color: 'from-emerald-500 to-teal-500',
      shadow: 'rgba(16,185,129,0.4)',
      tab: 'report' as const,
      searchLabel: 'تحميل وطباعة محضر مصلحة الخبراء'
    }
  ];

  return (
    <div className={`min-h-screen bg-[#070709] text-slate-100 flex flex-col justify-between items-center p-6 relative overflow-hidden select-none transition-all duration-1000 ${
      isEntering ? 'scale-110 opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
    }`}>
      
      {/* 3D Grid Holographic Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111116_1px,transparent_1px),linear-gradient(to_bottom,#111116_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Cybernetic Ambient Light Dots */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse"></div>

      {/* Dynamic Cyber Scanning Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent shadow-[0_0_12px_#00f0ff] animate-[scan_6s_ease-in-out_infinite] pointer-events-none"></div>

      {/* 1. Header Area - Extremely Clean, Elegant, No sentences clutter */}
      <header className="w-full max-w-7xl flex flex-col items-center justify-center text-center mt-4 relative z-10">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[10px] text-cyan-400 font-mono font-black tracking-widest uppercase">
            Smart Expert Judicial Portal • الإصدار القضائي الرقمي
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
          نظـام المحـاكاة والـخـبـير الـقـضـائي
        </h1>
        <p className="text-slate-400 text-xs mt-3 font-semibold tracking-wide">
          تفاعل مع شعار القضاء أو الأزرار التخصيصية المحيطة لتجربة البوابة فوراً
        </p>
      </header>

      {/* 2. Central Interactive Area */}
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center py-8 relative z-10">
        
        {/* Orbit / Rings Decorator Behind Elements */}
        <div className="absolute w-[360px] h-[360px] md:w-[500px] md:h-[500px] rounded-full border border-slate-900/40 pointer-events-none flex items-center justify-center">
          <div className="absolute w-[240px] h-[240px] md:w-[350px] md:h-[350px] rounded-full border border-cyan-500/5 pointer-events-none border-dashed animate-[spin_40s_linear_infinite]"></div>
          <div className="absolute w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full border border-blue-500/10 pointer-events-none animate-[spin_20s_linear_infinite]"></div>
        </div>

        {/* Outer Circular Positioning Grid for Satellite Buttons */}
        <div className="w-full max-w-4xl relative min-h-[480px] flex items-center justify-center">
          
          {/* Central Touch-Sensitive 3D Scaled Logo of Justice */}
          <div 
            className="absolute z-20 cursor-pointer flex flex-col items-center group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleTriggerEnter()}
          >
            {/* Real 3D-Card Tilt wrapper */}
            <div 
              style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-slate-950/80 border-2 border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)] group-hover:border-cyan-400 group-hover:shadow-[0_0_60px_rgba(6,182,212,0.35)] transition-all duration-300"
            >
              {/* Internal Holographic Wave Ripples */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/10 pointer-events-none group-hover:scale-110 group-hover:opacity-0 transition-all duration-1000"></div>
              <div className="absolute inset-4 rounded-full bg-cyan-950/10 pointer-events-none group-hover:bg-cyan-500/5 transition-all"></div>
              
              {/* Radial Glowing Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-cyan-500/5 animate-ping opacity-60 pointer-events-none"></span>

              {/* Real Highly Elaborate Hologram Scale Icon */}
              <div className="relative flex flex-col items-center select-none text-cyan-400 group-hover:text-white transition-colors duration-300">
                <Scale className="w-20 h-20 filter drop-shadow-[0_0_12px_#00f0ff] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                <span className="text-[11px] font-black tracking-widest mt-3.5 bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-cyan-200">
                  انقر للبدء والدخول الفوري ⚖️
                </span>
              </div>
            </div>

            {/* Glowing Pointer Finger Tap Prompt */}
            <div className="absolute -bottom-6 flex items-center gap-1.5 px-3.5 py-1 bg-cyan-950/70 border border-cyan-500/35 rounded-full shadow-lg pointer-events-none group-hover:translate-y-1 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[9px] font-black text-cyan-400 font-mono tracking-widest">TAP TO OPEN / ادوس بصباعك</span>
            </div>
          </div>

          {/* Symmetrically Placed Satellite Buttons with specific targets, big icons, and search web labels */}
          {/* Positioned on circle at angles: 180 (left), 240 (top left), 300 (top right), 360/0 (right), 60 (bottom right) etc. */}
          {satelliteButtons.map((btn, index) => {
            // Symmetrical placements in desktop (using absolute positioning coordinates on circle)
            const positions = [
              // 1. Map: Top-Right
              'lg:top-[2%] lg:right-[15%] top-[10px] right-[5%]',
              // 2. Files: Top-Left
              'lg:top-[2%] lg:left-[15%] top-[10px] left-[5%]',
              // 3. Inheritance: Bottom-Right
              'lg:bottom-[4%] lg:right-[15%] bottom-[10px] right-[5%]',
              // 4. Agents: Bottom-Left
              'lg:bottom-[4%] lg:left-[15%] bottom-[10px] left-[5%]',
              // 5. Report: Center-Bottom
              'lg:bottom-[2%] lg:left-1/2 lg:-translate-x-1/2 bottom-[120px] left-1/2 -translate-x-1/2'
            ];

            return (
              <div 
                key={btn.id}
                onClick={() => handleTriggerEnter(btn.tab)}
                className={`absolute ${positions[index]} z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group text-center`}
              >
                {/* Bigger Circle Icon container with hover glowing shadow */}
                <div 
                  className={`w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-400`}
                  style={{
                    boxShadow: `0 0 10px rgba(15,23,42,0.8), inset 0 0 12px rgba(6,182,212,0.05)`
                  }}
                >
                  <btn.icon className="w-6.5 h-6.5 text-slate-400 group-hover:text-cyan-400 filter group-hover:drop-shadow-[0_0_6px_#00f0ff] transition-all" />
                </div>

                {/* Sub-labels explaining purpose and deeper web navigation search */}
                <div className="mt-2 flex flex-col items-center">
                  <span className="text-white text-[10px] font-black tracking-wide bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800/40 group-hover:text-cyan-300 transition-colors">
                    {btn.title}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold mt-0.5 select-none leading-relaxed line-clamp-1 max-w-[140px]">
                    🔍 {btn.searchLabel}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* 3. Voice Command Panel (افتح يا سمسم) & Sample Loader */}
      <footer className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-5 mt-4 pt-4 border-t border-slate-900/80 relative z-10">
        
        {/* Voice control section */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-900 px-4 py-2.5 rounded-2xl w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isListening 
                ? 'bg-emerald-500 text-slate-950 font-black animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30'
            }`}
            title="انقر لتفعيل الاستماع للتحكم الصوتي"
          >
            {isListening ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
          </button>
          
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-cyan-400 flex items-center gap-1 justify-end">
              <span>افتح يا سمسم</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </span>
            <span className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              {voiceLog || 'اضغط على الميكروفون وقل "افتح يا سمسم" بالصوت'}
            </span>
          </div>
        </div>

        {/* Quick Sample Database Load list */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-900 px-4 py-2.5 rounded-2xl w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onLoadSampleAndEnter(0, 'details')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-white font-black text-[9px] px-2.5 py-1.5 rounded-lg transition-all"
            >
              نزاع بيت العمرانية
            </button>
            <button
              onClick={() => onLoadSampleAndEnter(1, 'details')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-white font-black text-[9px] px-2.5 py-1.5 rounded-lg transition-all"
            >
              تركة المرحوم سليم
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-bold ml-1 text-right">تحميل سريع لقضايا الأرشيف المعتمدة:</span>
        </div>

        {/* Brand Oval Badge */}
        <div className="hidden lg:flex px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/10 shadow-inner items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-white text-[9px] font-black tracking-widest font-mono">COURT EXPERT v1.0</span>
        </div>

      </footer>

    </div>
  );
}

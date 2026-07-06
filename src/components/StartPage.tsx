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
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Megaphone,
  X,
  HelpCircle,
  PlayCircle,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Briefcase,
  TrendingUp,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Send,
  Award,
  Mail,
  ChevronDown,
  ChevronUp,
  Check,
  FileCheck,
  UserCheck,
  FileDown,
  Eye,
  Timer,
  Fingerprint
} from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface StartPageProps {
  onEnterWorkspace: (tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'court', launchCourt?: boolean) => void;
  onLoadSampleAndEnter: (index: number, tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'court') => void;
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

  // Responsive layout radius for the semicircle buttons
  const [radius, setRadius] = useState(150);
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth >= 1024) {
        setRadius(230); // Desktop size: 230px
      } else if (window.innerWidth >= 768) {
        setRadius(190); // Tablet size: 190px
      } else {
        setRadius(135); // Mobile size: 135px
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const SEMICIRCLE_LAYOUT = [
    { cos: -1, sin: 0, angle: 180 },         // Left, 180 deg
    { cos: -0.707, sin: 0.707, angle: 225 },   // Top-Left, 135 deg
    { cos: 0, sin: 1, angle: 270 },          // Top, 90 deg
    { cos: 0.707, sin: 0.707, angle: 315 },    // Top-Right, 45 deg
    { cos: 1, sin: 0, angle: 0 }             // Right, 0 deg
  ];

  // Training Academy States
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [academyStep, setAcademyStep] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);

  // Expanded Training Academy & Marketing States
  const [academyTab, setAcademyTab] = useState<'overview' | 'day1' | 'day2' | 'day3' | 'marketing' | 'judges_kit'>('overview');
  const [studentName, setStudentName] = useState('');
  const [studentEntity, setStudentEntity] = useState('محكمة');
  const [studentJob, setStudentJob] = useState('خبير');
  const [studentExperience, setStudentExperience] = useState('٣');
  const [studentTechLevel, setStudentTechLevel] = useState('متوسط');
  const [studentGoal, setStudentGoal] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [checklistState, setChecklistState] = useState<boolean[]>(new Array(9).fill(false));
  const [homeworkSize, setHomeworkSize] = useState('٨٠');
  const [homeworkPrice, setHomeworkPrice] = useState('٥٠٠٠٠');
  const [homeworkHeirs, setHomeworkHeirs] = useState('٤');
  const [homeworkFeedback, setHomeworkFeedback] = useState('');
  
  // Timer States
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 mins (900 seconds)
  const [timerActive, setTimerActive] = useState(false);
  
  // Dialog scripts states
  const [activeScriptBlock, setActiveScriptBlock] = useState<string>('opening');
  
  // Day 2 Quiz states
  const [day2QuizAnswered, setDay2QuizAnswered] = useState<string | null>(null);
  const [day2QuizScore, setDay2QuizScore] = useState(0);

  // Countdown Timer for Training Sessions
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      triggerToast('⏰ انتهى وقت الجلسة التدريبية المحددة! يرجى الانتقال للتطبيق التالي.', 'info');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

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

  const handleTriggerEnter = (tab?: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'court', launchCourt?: boolean) => {
    setIsEntering(true);
    triggerToast(launchCourt ? '🏛️ جاري تجهيز وإشعال قاعة المحكمة الافتراضية الذكية...' : '⚖️ جاري فك تشفير وتوجيه بوابة النظام القضائي الخبير...', 'success');
    
    // Play sound effects or delay for zoom-out immersion
    setTimeout(() => {
      onEnterWorkspace(tab, launchCourt);
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
    <div 
      className={`min-h-screen text-slate-100 flex flex-col justify-between items-center p-6 relative overflow-y-auto overflow-x-hidden select-none transition-all duration-1000 ${
        isEntering ? 'scale-110 opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1b1411 0%, #0d121c 30%, #161b22 70%, #221d10 100%)',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(139, 92, 26, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 90% 15%, rgba(234, 179, 8, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.18) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 35%),
          radial-gradient(circle at 30% 70%, rgba(100, 110, 120, 0.12) 0%, transparent 40%),
          linear-gradient(135deg, #1a1512 0%, #0d121c 35%, #181d24 70%, #221c11 100%)
        `
      }}
    >
      
      {/* 3D Grid Holographic Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111116_1px,transparent_1px),linear-gradient(to_bottom,#111116_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Cybernetic Ambient Light Dots */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[150px] animate-pulse"></div>

      {/* Dynamic Cyber Scanning Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent shadow-[0_0_12px_#00f0ff] animate-[scan_6s_ease-in-out_infinite] pointer-events-none"></div>

      {/* 🚀 Floating Training & Academy Button */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={() => {
            setIsTrainingOpen(true);
            setAcademyStep(0);
            setQuizScore(0);
            setQuizAnswered(null);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/20"
        >
          <GraduationCap className="w-4.5 h-4.5 animate-bounce" />
          <span>🎓 أكاديمية التدريب القضائي والمحاكاة</span>
        </button>
      </div>

      {/* ⚖️ Floating Virtual Courtroom Button */}
      <div className="absolute top-6 right-6 z-40">
        <button 
          onClick={() => {
            handleTriggerEnter('court', true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs px-4.5 py-2.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/20"
        >
          <Scale className="w-4.5 h-4.5" />
          <span>⚖️ قاعة المحكمة الافتراضية والوكلاء الأذكياء</span>
        </button>
      </div>

      {/* 1. Header Area - Extremely Clean, Elegant, No sentences clutter */}
      <header className="w-full max-w-7xl flex flex-col items-center justify-center text-center mt-4 relative z-10">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[10px] text-cyan-400 font-mono font-black tracking-widest uppercase">
            Smart Expert Judicial Portal • الإصدار القضائي الرقمي
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
          سمارت اكسبيرت الخبير الالي
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
        <div className="w-full max-w-4xl relative min-h-[500px] md:min-h-[580px] flex items-center justify-center">
          
          {/* HUD Glowing Blue Highlight Circle Overlay */}
          <div className="absolute w-[360px] h-[360px] md:w-[500px] md:h-[500px] rounded-full border-4 border-cyan-500/10 pointer-events-none flex items-center justify-center">
            <div className="absolute w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full border-2 border-cyan-500/20 pointer-events-none border-dashed animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-blue-400/30 pointer-events-none animate-[spin_40s_linear_infinite]"></div>
          </div>

          {/* Glowing Connections to Satellite Buttons (HUD Yellow Gradient Lines) */}
          {SEMICIRCLE_LAYOUT.map((pos, idx) => {
            return (
              <div
                key={`connection-line-${idx}`}
                className="absolute h-[3px] bg-gradient-to-r from-cyan-400 via-yellow-400/90 to-yellow-300 pointer-events-none z-10 shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${radius}px`,
                  transformOrigin: 'left center',
                  transform: `translateY(-50%) rotate(${pos.angle}deg)`,
                }}
              />
            );
          })}

          {/* Central Touch-Sensitive 3D Scaled Logo of Justice (Enlarged by 30%) */}
          <div 
            className="absolute z-20 cursor-pointer flex flex-col items-center group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleTriggerEnter()}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Real 3D-Card Tilt wrapper */}
            <div 
              style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="relative w-64 h-64 md:w-72 md:h-72 rounded-full bg-slate-950/85 border-3 border-cyan-400/40 flex items-center justify-center shadow-[0_0_65px_rgba(6,182,212,0.25)] group-hover:border-cyan-300 group-hover:shadow-[0_0_80px_rgba(6,182,212,0.5)] transition-all duration-300"
            >
              {/* Internal Holographic Wave Ripples */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/15 pointer-events-none group-hover:scale-110 group-hover:opacity-0 transition-all duration-1000"></div>
              <div className="absolute inset-4 rounded-full bg-cyan-950/15 pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
              
              {/* Radial Glowing Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-cyan-500/5 animate-ping opacity-60 pointer-events-none"></span>

              {/* Real Highly Elaborate Hologram Scale Icon */}
              <div className="relative flex flex-col items-center select-none text-cyan-400 group-hover:text-white transition-colors duration-300">
                <Scale className="w-[104px] h-[104px] md:w-[120px] md:h-[120px] filter drop-shadow-[0_0_15px_#00f0ff] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                <span className="text-xs md:text-sm font-black tracking-widest mt-4 bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-cyan-200">
                  انقر للبدء والدخول الفوري ⚖️
                </span>
              </div>
            </div>

            {/* Glowing Pointer Finger Tap Prompt */}
            <div className="absolute -bottom-8 flex items-center gap-1.5 px-3.5 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full shadow-lg pointer-events-none group-hover:translate-y-1 transition-transform z-30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[10px] font-black text-cyan-400 font-mono tracking-widest">TAP TO OPEN / ادوس بصباعك</span>
            </div>
          </div>

          {/* Symmetrically Placed Satellite Buttons arranged in a Semicircle (Enlarged by 30%) */}
          {satelliteButtons.map((btn, index) => {
            const layout = SEMICIRCLE_LAYOUT[index];
            const leftPos = `calc(50% + ${layout.cos * radius}px)`;
            const topPos = `calc(50% - ${layout.sin * radius}px)`;

            return (
              <div 
                key={btn.id}
                onClick={() => handleTriggerEnter(btn.tab)}
                className="absolute z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group text-center"
                style={{
                  left: leftPos,
                  top: topPos,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Bigger Circle Icon container with hover glowing shadow (Enlarged by 30%) */}
                <div 
                  className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center transition-all duration-300 group-hover:border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at center, #0b0f19 0%, #03050a 100%)'
                  }}
                >
                  <btn.icon className="w-8 h-8 md:w-9 h-9 text-slate-400 group-hover:text-yellow-400 filter group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all" />
                </div>

                {/* Sub-labels explaining purpose and deeper web navigation search */}
                <div className="mt-2.5 flex flex-col items-center">
                  <span className="text-white text-[10px] font-black tracking-wide bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/60 group-hover:text-yellow-300 transition-colors">
                    {btn.title}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold mt-1 select-none leading-relaxed line-clamp-1 max-w-[140px]">
                    🔍 {btn.searchLabel}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* 📣 2.5 Revolutionary Promotional & Marketing Banner (قسم الدعاية والترويج الرسمي للمنظومة) */}
      <div className="w-full max-w-5xl mt-2 mb-6 bg-[#0a0a0f]/90 border border-cyan-500/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl relative z-10" style={{ direction: 'rtl' }}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-right space-y-2 md:max-w-2xl">
            <span className="text-[9px] text-amber-400 font-black flex items-center gap-1 justify-end bg-amber-500/5 border border-amber-500/15 px-2.5 py-0.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>قوة السرب الفيدرالي المستقل • نظام الجيل الخامس الخبير</span>
            </span>
            <h3 className="text-white text-base font-extrabold leading-tight">
              أول بوابة رقمية ذكية تجمع بين المسح الطيفي الجغرافي وقسمة التركات والتحليل الجنائي للشبكات
            </h3>
            <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
              يتميز نظام <span className="text-cyan-400 font-extrabold">سمارت إكسبيرت (Smart Expert)</span> بقدرة هائلة على دمج كافة العلوم القضائية والفنية في حزمة واحدة. من خلال 52 وكيلاً مستقلاً، يقدم البرنامج حلاً فورياً لحساب المواريث الشرعية وتجنب الأنصبة، والرفع المساحي والجيولوجي الميداني، بالإضافة إلى تتبع الهجمات السيبرانية واختراقات الخوادم طبقاً للقوانين والاتفاقيات الدولية.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-950/85 p-3 rounded-2xl border border-slate-900 text-center w-36">
              <span className="text-cyan-400 font-black text-lg block font-mono">٥٢+ وكيل</span>
              <span className="text-slate-500 text-[9px] font-black block mt-0.5">ذكاء السرب المتوازي</span>
            </div>
            <div className="bg-slate-950/85 p-3 rounded-2xl border border-slate-900 text-center w-36">
              <span className="text-emerald-400 font-black text-lg block font-mono">١٠٠٪ إسلامي</span>
              <span className="text-slate-500 text-[9px] font-black block mt-0.5">مطابقة المواريث الشرعية</span>
            </div>
          </div>
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
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-white font-black text-[9px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              نزاع بيت العمرانية
            </button>
            <button
              onClick={() => onLoadSampleAndEnter(1, 'details')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-white font-black text-[9px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
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

      {/* ========================================================================= */}
      {/* 🎓 INTERACTIVE TRAINING ACADEMY MODAL (المحاكي التعليمي والمحاضرة التوجيهية) 🎓 */}
      {/* ========================================================================= */}
      {isTrainingOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300" style={{ direction: 'rtl' }}>
          <div className="bg-[#0b0b10] border border-emerald-500/30 rounded-3xl w-full max-w-5xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col md:flex-row h-auto md:h-[82vh] max-h-[85vh]">
            
            {/* Right Side - Interactive Guide Steps Index & Navigation */}
            <div className="md:w-[28%] p-5 bg-slate-950/95 border-l border-slate-900 flex flex-col justify-between shrink-0">
              <div className="space-y-5">
                <div>
                  <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                    الأكاديمية القضائية الموحدة
                  </span>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-2.5">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <span>سمارت إكسبيرت • الأكاديمية</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                    منهج معتمد لتأهيل الخبراء والمستشارين وأعضاء النيابة العامة على المنظومة الرقمية.
                  </p>
                </div>

                <div className="h-px bg-slate-900"></div>

                {/* Vertical Tabs Selection Sidebar */}
                <div className="space-y-1.5">
                  {[
                    { id: 'overview', label: '🎯 نظرة عامة والتمهيد', icon: BookOpen },
                    { id: 'day1', label: '📅 اليوم الأول: التحليل الفني', icon: Clock, badge: 'STP' },
                    { id: 'day2', label: '🧠 اليوم الثاني: المواريث والذكاء', icon: Cpu },
                    { id: 'day3', label: '📜 اليوم الثالث: التقارير والختام', icon: FileText },
                    { id: 'marketing', label: '📢 التسويق والترويج', icon: Megaphone },
                    { id: 'judges_kit', label: '⚖️ حزمة التوعية القضائية', icon: Scale, highlight: true }
                  ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = academyTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setAcademyTab(tab.id as any);
                          setQuizAnswered(null);
                          setDay2QuizAnswered(null);
                        }}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-[11px] font-black flex items-center justify-between transition-all duration-300 border cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                            : tab.highlight
                              ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Footer */}
              <div className="pt-3 border-t border-slate-900 text-[9px] text-slate-500 font-bold space-y-1">
                <div className="flex items-center justify-between">
                  <span>كود البرنامج:</span>
                  <span className="text-white font-mono">SEP-101 (ICAO)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المدرب المعتمد:</span>
                  <span className="text-emerald-400 font-semibold">كابتن حسام</span>
                </div>
                <div className="text-slate-600 font-mono text-[8px] mt-1 text-center border-t border-slate-900/40 pt-1">
                  ACADEMY-VERIFIED-2026-STP
                </div>
              </div>
            </div>

            {/* Left Side - Interactive Content Screen */}
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto bg-[#070709]">
              
              {/* Header Close */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {academyTab === 'overview' && 'برنامج الكفاءة الرقمية • الدورة التدريبية الاحترافية'}
                  {academyTab === 'day1' && 'اليوم الأول: التمهيد والتحليل العقاري والميداني'}
                  {academyTab === 'day2' && 'اليوم الثاني: حسابات المواريث الشرعية وعلم الذكاء الاصطناعي'}
                  {academyTab === 'day3' && 'اليوم الثالث: صياغة التقارير الفنية والاعتماد البيومتري'}
                  {academyTab === 'marketing' && 'الأدوات الترويجية ومحاكي التسويق الرقمي والمطبوع'}
                  {academyTab === 'judges_kit' && 'حزمة التوعية ونشر الثقافة للقضاة والمستشارين (Judges Kit)'}
                </span>
                <button 
                  onClick={() => setIsTrainingOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step Contents */}
              <div className="flex-1 py-4">

                {/* Tab 1: OVERVIEW */}
                {academyTab === 'overview' && (
                  <div className="space-y-4 text-right animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-400 font-extrabold tracking-widest uppercase block mb-0.5">✓ دورة تدريبية معتمدة</span>
                        <h4 className="text-white text-base font-black">الدورة الاحترافية: سمارت إكسبيرت القضائي</h4>
                        <p className="text-slate-400 text-[10px] leading-relaxed mt-1 font-semibold">
                          برنامج تدريبي متكامل لمدة 3 أيام لتأهيل الخبراء والمستشاريين والقضاة على نظام الخبرة العقارية الرقمي، بدءاً من التحليل العقاري وصولاً إلى إعداد التقارير القضائية المعتمدة.
                        </p>
                      </div>
                    </div>

                    {/* Stats Cards Grid (4 columns) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-2xl text-center">
                        <span className="text-cyan-400 font-black text-base block font-mono">٣ أيام</span>
                        <span className="text-slate-500 text-[8px] font-black block mt-0.5">أيام تدريبية مكثفة</span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-2xl text-center">
                        <span className="text-emerald-400 font-black text-base block font-mono">١٢ وحدة</span>
                        <span className="text-slate-500 text-[8px] font-black block mt-0.5">وحدة تدريبية شاملة</span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-2xl text-center">
                        <span className="text-amber-400 font-black text-base block font-mono">٥٢ وكيلاً</span>
                        <span className="text-slate-500 text-[8px] font-black block mt-0.5">من ذكاء السرب المتوازي</span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-2xl text-center">
                        <span className="text-purple-400 font-black text-base block font-mono">١٠٠٪</span>
                        <span className="text-slate-500 text-[8px] font-black block mt-0.5">تطبيق وورش عملية</span>
                      </div>
                    </div>

                    {/* Methodology & Package Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-950/80 border border-slate-900/60 p-3.5 rounded-2xl space-y-1">
                        <span className="text-[10px] text-cyan-400 font-black flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>منهجية التدريب المطبقة</span>
                        </span>
                        <p className="text-[9px] text-slate-300 leading-relaxed font-semibold">
                          تنقسم الدورة إلى **٤٠٪ دراسة نظرية وفقهية وقانونية** و **٦٠٪ تطبيقات وورش عمل تفاعلية مباشرة** حية باستخدام أجهزة القياس المساحية الميدانية والمحاكيات الرقمية.
                        </p>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-900/60 p-3.5 rounded-2xl space-y-1">
                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>ما تشمله الحقيبة التدريبية</span>
                        </span>
                        <p className="text-[9px] text-slate-300 leading-relaxed font-semibold">
                          يستلم كل متدرب: **الدليل التدريبي الشامل**، **نسخة تجريبية مفتوحة** للعمل على مذكرات القضايا، **استمارات الأداء الميداني**، و**شهادة إتمام معتمدة ومسجلة بيومترياً** من كابتن حسام.
                        </p>
                      </div>
                    </div>

                    {/* Core Outcomes (مخرجات الدورة) */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] text-emerald-400 font-black block">✓ أهم المخرجات والكفاءات التي ستمتلكها بعد الدورة:</span>
                      <ul className="text-[9.5px] text-slate-400 space-y-2 font-semibold">
                        <li className="flex items-start gap-1.5 justify-end">
                          <span>إتقان واجهة البوابة الرقمية وإدخال البيانات الهندسية والقانونية للأراضي والمنشآت.</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        </li>
                        <li className="flex items-start gap-1.5 justify-end">
                          <span>حساب القيم المالية، الضرائب العقارية، ورسوم التوثيق آلياً بدقة متناهية.</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        </li>
                        <li className="flex items-start gap-1.5 justify-end">
                          <span>تطبيق المواريث الشرعية للتركات وحساب الأنصبة والكسور الفقهية آلياً وفق الفقه الإسلامي الحنيف وصيغة (للذكر مثل حظ الأنثيين).</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        </li>
                        <li className="flex items-start gap-1.5 justify-end">
                          <span>تشغيل وتحليل وكلاء الذكاء الاصطناعي (Agent Smith) لتحديد شبهات التزوير والتداخل المساحي وهندسة التربة.</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        </li>
                        <li className="flex items-start gap-1.5 justify-end">
                          <span>توليد وإنشاء تقارير فنية معتمدة قابلة للتسليم للمحاكم وللجهات القضائية والسيادية الكبرى.</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        </li>
                      </ul>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-900 text-right space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block">💼 الفئة المستهدفة بالبرنامج:</span>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                        مصلحة الخبراء بوزارة العدل المصرية، المستشارون العقاريون، المحامون المتخصصون، مهندسو المساحة والتخطيط، وأعضاء النيابة العامة والقضاة المعنيون بالفصل في التركات والنزاعات.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: DAY 1 - STP/ICAO */}
                {academyTab === 'day1' && (
                  <div className="space-y-5 text-right animate-in fade-in duration-300">
                    <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-black">
                          الحزمة التدريبية المعتمدة (نظام STP / ICAO)
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>مدة البرنامج: ٦ ساعات (من ٩:٠٠ ص إلى ٤:٠٠ م)</span>
                        </div>
                      </div>
                      <h4 className="text-white text-xs font-black">اسم البرنامج: التشغيل المتقدم لنظام سمارت إكسبيرت القضائي (SEP-101)</h4>
                      <p className="text-[9.5px] text-slate-300 leading-relaxed font-semibold">
                        يهدف هذا اليوم الأول إلى تمكين الخبير القضائي من ضبط إعدادات القضايا ومعالجة مساحات الأراضي وحساب التقييم الأولي بمحاكي مساحي كامل، مع التركيز التام على التطبيقات العملية.
                      </p>
                    </div>

                    {/* TIMELINE OF DAY 1 WITH EXPANDABLE SCRIPT BLOCKS */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-cyan-400 font-black block">⏱️ الجدول الزمني وجلسات اليوم الأول (اضغط لمشاهدة شرح وشخصية كابتن حسام):</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          { key: 'opening', time: '09:00 - 09:15', title: 'الافتتاح وتوزيع استمارات الانضمام للطلاب', details: 'التعريف بأهداف الدورة التدريبية وتنسيق العمل وفق حزمة STP.' },
                          { key: 'problem', time: '09:15 - 09:45', title: 'عرض المشكلة وحاجة القضاء الرقمي للأنظمة', details: 'حصر النزاعات العقارية وبطء الفصل فيها، ودور سمارت إكسبيرت.' },
                          { key: 'ui_walk', time: '09:45 - 10:30', title: 'جولة الواجهة (UI Walkthrough)', details: 'شرح قوائم النظام ومركز وكلاء الذكاء الاصطناعي الـ 52.' },
                          { key: 'break', time: '10:30 - 11:00', title: 'استراحة قصيرة وأسئلة تمهيدية', details: 'فترة ترفيهية للمشاركين مع توجيه أسئلة من كابتن حسام.' },
                          { key: 'app1', time: '11:00 - 12:00', title: 'عملي ١: إدخال بيانات عقار واقعي', details: 'تطبيق عملي على إدخال مساحات الأراضي، الرفع المساحي بالـ GPS والتربة.' },
                          { key: 'app2', time: '12:00 - 12:30', title: 'عملي ٢: الحسابات المالية والضرائب آلياً', details: 'مراجعة حساب القيمة السوقية ورسوم التوثيق والضريبة القانونية.' },
                          { key: 'app3', time: '12:30 - 01:15', title: 'عملي ٣: قسمة المواريث وتوزيع الأنصبة', details: 'إضافة الورثة وحساب الكسور بدقة بالغة وفق الشرع والقانون.' },
                          { key: 'app4', time: '01:15 - 02:00', title: 'عملي ٤: تصدير التقرير الفني ومناقشة التكليف', details: 'صياغة المستند وتسليمه وتوزيع التكليف المنزلي الفردي.' }
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => {
                              setActiveScriptBlock(item.key);
                              triggerToast(`تم عرض سيناريو شرح كابتن حسام لـ ${item.time}`, 'info');
                            }}
                            className={`p-2.5 rounded-xl text-right border transition-all text-[10px] cursor-pointer flex flex-col justify-between ${
                              activeScriptBlock === item.key
                                ? 'border-amber-500 bg-amber-500/5 text-white shadow'
                                : 'border-slate-900 bg-slate-950/80 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full mb-1">
                              <span className="font-mono text-cyan-400 font-extrabold">{item.time}</span>
                              <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[8px] font-black text-amber-500">حسام 👨‍🏫</span>
                            </div>
                            <span className="font-extrabold text-white block">{item.title}</span>
                            <span className="text-[8px] text-slate-500 font-medium leading-normal mt-0.5">{item.details}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SELECTED SCRIPT BLOCK DISPLAY */}
                    {activeScriptBlock && (
                      <div className="bg-[#0b0b14] border border-amber-500/20 p-3.5 rounded-2xl relative space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                          <span className="text-[9px] text-amber-400 font-black flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>حوار وشرح كابتن حسام (سيناريو الجلسة التدريبية الفعلي)</span>
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">SEP-HOSSAM-SCRIPT</span>
                        </div>
                        <p className="text-[9px] text-slate-300 italic leading-relaxed font-semibold">
                          {activeScriptBlock === 'opening' && '"أهلاً ومرحباً بكم زملائي وأساتذتي الأفاضل من مستشاري الهيئات القضائية وخبراء وزارة العدل المعتمدين. أنا كابتن حسام، وسأرافقكم في هذه الرحلة التدريبية STP-101. هدفنا اليوم ليس فقط الشرح النظري، بل أن يغادر كل منكم القاعة وهو قادر على صب البيانات واستخراج أدق التقارير المعتمدة خلال دقائق. يرجى البدء بملء استمارة الانضمام (الوثيقة 1) بالأسفل لتسجيل ملفكم الأكاديمي الرقمي."' }
                          {activeScriptBlock === 'problem' && '"يا سادة، نحن نواجه معضلة حقيقية في المحاكم؛ قضايا التركات والنزاعات المدنية تظل معلقة لسنوات بسبب بطء وتناقض تقارير المعاينات الميدانية وحصر شجرة المواريث والحدود الجغرافية. نظام سمارت إكسبيرت يعيد تعريف هذا المفهوم، حيث يربط الخرائط الطيفية وأجهزة الاستشعار وصيغ القسمة الشرعية في مكان واحد ليصدر دليلاً فورياً لا يرقى إليه الشك."' }
                          {activeScriptBlock === 'ui_walk' && '"بصوا معايا هنا على الشاشة الرئيسية... البساطة هي سر القوة. صممنا الواجهة لتكون باللغة العربية الواضحة وبخطوط مريحة. القوائم هنا تربطكم مباشرة بالوكلاء الخبراء الـ 52. بلمسة واحدة، يفعل النظام ذكاء السرب الفيدرالي للتحقق من سلامة البيانات ومطابقتها هندسياً وقانونياً مع البصمات البيومترية المعمدة."' }
                          {activeScriptBlock === 'break' && '"استراحة قهوة يا جماعة لمدة ٣٠ دقيقة. يرجى استغلال الوقت في تبادل الخبرات ومناقشة الدفوع التمهيدية. لكن من فضلكم، ارجعوا في الميعاد بالدقيقة، التوقيت والالتزام هما عماد التدريب الاحترافي!"' }
                          {activeScriptBlock === 'app1' && '"دلوقتي كل زميل قدامه الشاشة ونظام المحاكاة. سنبدأ بالتطبيق الأول: إدخال بيانات نزاع (بيت العمرانية). هندخل المساحات بالفدان والقيراط والسهم، مع تفعيل أجهزة GPS والرفع الجيولوجي الميداني. عاوزكم تشوفوا التوافق التام ومقاطعة البيانات مع الصور الطيفية الرسمية للأقمار الصناعية."' }
                          {activeScriptBlock === 'app2' && '"انتهينا من الرفع المساحي والحمد لله. ننتقل الآن للحسابات المالية. بمجرد الضغط على زر التقييم، المنظومة تحسب القيمة السوقية للأرض والمباني، وتستخرج الضرائب العقارية المستحقة طبقاً لآخر التعديلات التشريعية لعام ٢٠٢٦، وتوفر عليكم ساعات من الحسابات اليدوية المعقدة."' }
                          {activeScriptBlock === 'app3' && '"الآن نأتي لجوهر المعالجة: قسمة المواريث الشرعية. هندخل شجرة الورثة بكل تفاصيلها (الزوج، الزوجة، الأبناء، البنات). السيستم يقوم تلقائياً بحساب الحصص الشرعية والكسور الفقهية الصعبة بدقة لا تقبل القسمة على اثنين، مع تطبيق قاعدة "للذكر مثل حظ الأنثيين" مع تفسير فقهي ودستوري لكل حصة."' }
                          {activeScriptBlock === 'app4' && '"الخطوة الأخيرة: توليد التقرير الختامي وتصديره. التقرير يحتوي على الهاش الكودي وبصمتكم البيومترية الرقمية المعتمدة ليكون صالحاً كدليل قضائي فوري أمام النيابة والشرطة. وهناك تكليف فردي منزلي (الوثيقة 3) بالأسفل لتثبيت المهارات، وأنتظر مراجعته معكم صباح غد!"' }
                        </p>
                        
                        {/* Participants Suggestions inside Dialog */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/60 mt-2">
                          <span className="text-[8.5px] text-cyan-400 font-extrabold block mb-1">💡 من مقترحات التطوير المدونة في ورشة اليوم:</span>
                          <div className="space-y-1.5 text-[8px] text-slate-400 font-medium leading-relaxed">
                            <div className="flex justify-end gap-1.5">
                              <span className="text-slate-300">"زيادة حجم خطوط الجداول لتسهيل القراءة لكبار القضاة والمستشارين." - القاضي ممدوح</span>
                              <span className="text-cyan-400 font-bold shrink-0">١-</span>
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <span className="text-slate-300">"أهمية تفعيل ميزة الحفظ التلقائي الفوري لتلافي مشاكل انقطاع الإنترنت أو التيار." - الخبير يوسف</span>
                              <span className="text-cyan-400 font-bold shrink-0">٢-</span>
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <span className="text-slate-300">"دمج ميزة الختم البيومتري الرقمي والتوقيع الثلاثي داخل ملفات الـ PDF." - المستشار شريف</span>
                              <span className="text-cyan-400 font-bold shrink-0">٣-</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE FORM: STUDENT ENROLLMENT (الوثيقة 1) */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>📄 الوثيقة ١: استمارة انضمام طالب جديد (Student Enrollment Form)</span>
                      </span>
                      <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                        يرجى إدخال بياناتك كطالب جديد في الأكاديمية للحصول على رخصة التدريب الفردية وبدء الفصل:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">الاسم الرباعي كاملاً</label>
                          <input 
                            type="text" 
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="أدخل اسمك الكريم رباعياً..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">الجهة التابع لها</label>
                          <select 
                            value={studentEntity}
                            onChange={(e) => setStudentEntity(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-emerald-500 outline-none"
                          >
                            <option value="محكمة">محكمة</option>
                            <option value="نيابة">نيابة</option>
                            <option value="شرطة">شرطة</option>
                            <option value="مصلحة خبراء">مصلحة الخبراء بوزارة العدل</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">الوظيفة الحالية</label>
                          <select 
                            value={studentJob}
                            onChange={(e) => setStudentJob(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-emerald-500 outline-none"
                          >
                            <option value="قاضي">قاضي الموضوع</option>
                            <option value="وكيل نيابة">وكيل نيابة عامة</option>
                            <option value="ضابط">ضابط وباحث جنائي</option>
                            <option value="خبير">خبير مساحي وهندسي</option>
                            <option value="مستشار">مستشار تركات عقاري</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">سنوات الخبرة في العقارات</label>
                          <input 
                            type="number" 
                            value={studentExperience}
                            onChange={(e) => setStudentExperience(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">المستوى التقني والكمبيوتري</label>
                          <div className="flex gap-2 pt-1.5 justify-end">
                            {['مبتدئ', 'متوسط', 'محترف'].map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setStudentTechLevel(lvl)}
                                className={`px-2.5 py-1 rounded text-[8px] font-extrabold border cursor-pointer transition-all ${
                                  studentTechLevel === lvl
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold block">الهدف من حضور البرنامج</label>
                          <input 
                            type="text" 
                            value={studentGoal}
                            onChange={(e) => setStudentGoal(e.target.value)}
                            placeholder="مثال: تسريع الفصل وحساب التركات..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!studentName.trim()) {
                            triggerToast('يرجى كتابة الاسم الرباعي أولاً لإكمال استمارة الانضمام المعتمدة!', 'warning');
                            return;
                          }
                          const randId = 'SEP-2026-' + Math.floor(1000 + Math.random() * 9000);
                          setEnrollmentId(randId);
                          setIsEnrolled(true);
                          triggerToast(`✓ تم توثيق وقيد استمارة الطالب بنجاح! رقم التسجيل: ${randId}`, 'success');
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>إرسال وتوثيق تسجيل استمارة الطالب بالأكاديمية 📝</span>
                      </button>

                      {isEnrolled && (
                        <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-[9px] font-semibold text-right animate-in zoom-in duration-200">
                          <span className="text-emerald-400 font-mono font-black">{enrollmentId}</span>
                          <span className="text-slate-300">اسم المتدرب: **{studentName}** ({studentJob} لدى {studentEntity}) • تم تفعيل الملف الأكاديمي الرقمي ✓</span>
                        </div>
                      )}
                    </div>

                    {/* TIMER COMPONENT */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-1 justify-end">
                          <Timer className="w-4 h-4 text-amber-400" />
                          <span>⏱️ تايمر المحاضرة التفاعلي لـ كابتن حسام</span>
                        </span>
                        <p className="text-[8px] text-slate-500 leading-normal font-semibold">
                          يستخدم هذا التايمر من قبل المدرب لإدارة وقت الجلسات والتطبيقات العملية لليوم الأول بدقة وحيوية.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl font-mono text-lg font-black text-white shadow-inner">
                          {formatTimer(timerSeconds)}
                        </div>
                        <button
                          onClick={() => setTimerActive(!timerActive)}
                          className={`p-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                            timerActive ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                        >
                          {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setTimerActive(false);
                            setTimerSeconds(900);
                            triggerToast('تم إعادة تعيين تايمر المحاضرة التدريبية.', 'info');
                          }}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE CHECKLIST (الوثيقة 2) */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3 text-right">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          <span>📋 الوثيقة ٢: استمارة تقييم الكفاءة والأداء (Performance Checklist - Day 1)</span>
                        </span>
                        <div className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[9px] font-black text-cyan-400">
                          معدل الكفاءة: {Math.round((checklistState.filter(Boolean).length / 9) * 100)}%
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                        قم بتعليم المهارات التي تكتسبها وتطبقها بيديك في البرنامج لتحديث مؤشر الكفاءة المعتمد بالأكاديمية:
                      </p>

                      {/* COMPETENCY METER PROGRESS BAR */}
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-emerald-500 shadow-[0_0_10px_#10b981] h-full transition-all duration-500" 
                          style={{ width: `${(checklistState.filter(Boolean).length / 9) * 100}%` }}
                        ></div>
                      </div>

                      {Math.round((checklistState.filter(Boolean).length / 9) * 100) === 100 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-[9px] text-emerald-400 font-black text-center animate-pulse">
                          🏆 ممتاز! لقد حققت ١٠٠٪ كفاءة استدلالية لليوم الأول وأنت مهيأ بالكامل لاستلام رخصة الخبير الرقمية.
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-right text-[9.5px]">
                        {[
                          'فتح البرنامج وتسجيل الدخول بنجاح.',
                          'التنقل بسلاسة بين قوائم النظام والتبويبات المختلفة.',
                          'إدخال بيانات عقارية كاملة وسليمة (الأراضي والمباني).',
                          'تشغيل محاكي الأجهزة الحقلية (GPS والتربة والليزر) وقراءة مؤشراتها المباشرة.',
                          'حساب التقييم المبدئي والضرائب العقارية بنجاح ودون أخطاء.',
                          'إضافة شجرة الورثة وحساب أنصبتهم الشرعية بدقة ١٠٠٪.',
                          'إنشاء وتوليد تقرير معاينة متكامل وخالٍ من الأخطاء التنسيقية.',
                          'المشاركة الفعالة في ورش العمل والمناقشات الميدانية.',
                          'الالتزام التام بالجدول الزمني للبرنامج التدريبي وجلساته.'
                        ].map((skill, idx) => (
                          <label 
                            key={idx} 
                            className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all duration-200 justify-end ${
                              checklistState[idx]
                                ? 'border-emerald-500/40 bg-emerald-500/5 text-white'
                                : 'border-slate-900 bg-slate-950 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <span className="text-right leading-normal">{skill}</span>
                            <input 
                              type="checkbox" 
                              checked={checklistState[idx]} 
                              onChange={() => {
                                const newChecked = [...checklistState];
                                newChecked[idx] = !newChecked[idx];
                                setChecklistState(newChecked);
                                triggerToast(`تم مراجعة كفاءة المهارة رقم ${idx + 1}`, 'success');
                              }}
                              className="w-4 h-4 rounded border-slate-800 text-emerald-500 bg-slate-900 focus:ring-emerald-500 accent-emerald-500 shrink-0 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* INTERACTIVE HOMEWORK (الوثيقة 3) */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3 text-right">
                      <span className="text-[10px] text-amber-400 font-black flex items-center gap-1.5 justify-end">
                        <Send className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>📝 الوثيقة ٣: التكليف العملي لليوم الأول (Homework Assignment)</span>
                      </span>
                      <p className="text-[9px] text-slate-300 leading-relaxed font-semibold">
                        **المطلوب:** مطلوب من كل متدرب إدخال بيانات نزاع تجاري (محل تجاري بمساحة 80 متر مربع، مشطب بالكامل، قيمة المتر 50,000 جنيه)، مع إضافة 4 ورثة شرعيين وتصدير التقرير بصيغة PDF ومشاركته مع المدرب للمراجعة غداً صباحاً.
                      </p>

                      <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-400 block font-bold">مساحة المحل (م٢)</label>
                          <input 
                            type="number" 
                            value={homeworkSize}
                            onChange={(e) => setHomeworkSize(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[9px] text-white focus:border-amber-500 outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-400 block font-bold">سعر المتر (جنيه)</label>
                          <input 
                            type="number" 
                            value={homeworkPrice}
                            onChange={(e) => setHomeworkPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[9px] text-white focus:border-amber-500 outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-400 block font-bold">عدد الورثة</label>
                          <input 
                            type="number" 
                            value={homeworkHeirs}
                            onChange={(e) => setHomeworkHeirs(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[9px] text-white focus:border-amber-500 outline-none text-center"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const size = parseFloat(homeworkSize) || 0;
                          const price = parseFloat(homeworkPrice) || 0;
                          const heirs = parseInt(homeworkHeirs) || 0;
                          const total = size * price;

                          if (size === 80 && price === 50000 && heirs === 4) {
                            setHomeworkFeedback(`✓ رائع! إجابة دقيقة تماماً يا باشمهندس. لقد تم تقدير الثروة الإجمالية بـ ${total.toLocaleString('ar-EG')} جنيه مصري بنجاح، وتوزيع الأنصبة بالتساوي والعدل الشرعي بين الورثة الـ ٤. تقييم كابتن حسام: ١٠/١٠ أحسنت!`);
                            triggerToast('✓ تم تسليم التكليف وتقييمه بـ ١٠/١٠ من كابتن حسام!', 'success');
                          } else {
                            setHomeworkFeedback(`✓ تم استلام ومراجعة التكليف بنجاح. القيمة الإجمالية المقدرة هي ${total.toLocaleString('ar-EG')} جنيه لورثة عدد ${heirs}. تقييم كابتن حسام: ٩/١٠ ممتازة لتعديل البيانات وتجربتها بنجاح!`);
                            triggerToast('✓ تم تقييم التكليف المعدل بـ ٩/١٠ من كابتن حسام!', 'info');
                          }
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-2 rounded-xl transition-all cursor-pointer"
                      >
                        إرسال ومراجعة التكليف للمدرب كابتن حسام 📤
                      </button>

                      {homeworkFeedback && (
                        <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl text-[9px] leading-relaxed text-amber-400 font-bold text-right animate-in zoom-in duration-200">
                          {homeworkFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: DAY 2 */}
                {academyTab === 'day2' && (
                  <div className="space-y-4 text-right animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-1.5">
                      <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black">
                        المستوى المتقدم • التركات وعلم الذكاء الاصطناعي
                      </span>
                      <h4 className="text-white text-xs font-black">اليوم الثاني: المواريث والذكاء الاصطناعي (SEP-102) • ٦ ساعات</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                        يختص اليوم الثاني بآليات دمج الفقه والشرع بالمعالجات الرقمية وتفعيل ذكاء السرب الفيدرالي لـ ٥٢ وكيلاً خبيراً.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-cyan-400 font-black block">⏱️ تفصيل جدول اليوم الثاني:</span>
                      <div className="space-y-2">
                        {[
                          { time: '09:00 - 10:30', title: 'حصر الورثة وتوزيع التركات وقسمة الفريضة آلياً', detail: 'تطبيق أحكام الشريعة الإسلامية وصيغة (للذكر مثل حظ الأنثيين) وحساب الكسور بدقة بالغة.' },
                          { time: '11:00 - 13:00', title: 'التعامل مع النزاعات القانونية والمدنية', detail: 'تبيين شبهات التزوير والتعدي وربط النزاعات بمواد القانون المدني المصري وقانون الإيجارات.' },
                          { time: '14:00 - 15:30', title: 'تشغيل وكلاء الذكاء الاصطناعي (Agent Smith)', detail: 'اختيار وتنسيق المنظور الإدراكي وتحليل السلوك الشبكي لـ 52 وكيلاً معتمداً في المحاكاة.' },
                          { time: '16:00 - 17:30', title: 'ورشة عمل تطبيقية: حصر تركة المرحوم سليم', detail: 'تطبيق متكامل لدمج حساب المواريث والتقييم والوكلاء الفيدراليين معاً في نزاع التركات.' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl flex items-start gap-3 justify-between">
                            <span className="font-mono text-cyan-400 text-[9px] font-black shrink-0">{item.time}</span>
                            <div className="space-y-0.5">
                              <span className="text-white text-[10px] font-extrabold block">{item.title}</span>
                              <p className="text-slate-500 text-[8px] font-medium leading-relaxed">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* INTERACTIVE DAY 2 QUIZ */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1 justify-end">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        <span>🧠 اختبار اليوم الثاني التفاعلي (معدل الكفاءة والامتثال)</span>
                      </span>

                      <div className="space-y-3 text-[9.5px]">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-amber-400 font-bold block">سؤال المواريث: ما هو النصيب الشرعي للزوجة في حال وجود فرع وارث (أبناء) للمتوفى؟</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setDay2QuizAnswered('q1_wrong');
                                triggerToast('❌ إجابة خاطئة! الربع للزوجة فرضاً عند عدم وجود فرع وارث.', 'warning');
                              }}
                              className={`flex-1 p-2 rounded-lg text-center border text-[9px] font-black cursor-pointer ${
                                day2QuizAnswered === 'q1_wrong' ? 'border-red-500 bg-red-500/5 text-red-400' : 'border-slate-800 bg-slate-950 text-slate-300'
                              }`}
                            >
                              الربع فرضاً
                            </button>
                            <button 
                              onClick={() => {
                                setDay2QuizAnswered('q1_correct');
                                triggerToast('✓ إجابة صحيحة! الثمن فرضاً لوجود فرع وارث.', 'success');
                              }}
                              className={`flex-1 p-2 rounded-lg text-center border text-[9px] font-black cursor-pointer ${
                                day2QuizAnswered === 'q1_correct' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-300'
                              }`}
                            >
                              الثمن فرضاً لوجود فرع وارث
                            </button>
                          </div>
                          {day2QuizAnswered === 'q1_correct' && (
                            <p className="text-[8px] text-emerald-400 font-medium">
                              ✓ إجابة صحيحة طبقاً لقواعد المواريث الشرعية بالشرع والقانون المصري.
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-amber-400 font-bold block">سؤال القانون: أي مادة بالقانون ١٧٥ لسنة ٢٠١٨ تجرّم تعديل أو إتلاف أو اصطناع المستندات الحكومية الرقمية؟</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setQuizAnswered('q2_correct');
                                triggerToast('✓ إجابة صحيحة! المادة ٢٢ تجرّم تزوير المستندات الرقمية الرسمية.', 'success');
                              }}
                              className={`flex-1 p-2 rounded-lg text-center border text-[9px] font-black cursor-pointer ${
                                quizAnswered === 'q2_correct' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-300'
                              }`}
                            >
                              المادة (٢٢) من القانون
                            </button>
                            <button 
                              onClick={() => {
                                setQuizAnswered('q2_wrong');
                                triggerToast('❌ إجابة خاطئة! المادة ١٤ تخص الدخول غير المشروع.', 'warning');
                              }}
                              className={`flex-1 p-2 rounded-lg text-center border text-[9px] font-black cursor-pointer ${
                                quizAnswered === 'q2_wrong' ? 'border-red-500 bg-red-500/5 text-red-400' : 'border-slate-800 bg-slate-950 text-slate-300'
                              }`}
                            >
                              المادة (١٤) من القانون
                            </button>
                          </div>
                          {quizAnswered === 'q2_correct' && (
                            <p className="text-[8px] text-emerald-400 font-medium">
                              ✓ صحيح! تنص المادة (٢٢) على تجريم إتلاف البيانات والمستندات وعقوبتها السجن المشدد إذا ارتكبت بحق الهيئات والوزارات.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: DAY 3 & CERTIFICATE AWARD */}
                {academyTab === 'day3' && (
                  <div className="space-y-4 text-right animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-black">
                        مستوى الاحتراف والاعتماد النهائي
                      </span>
                      <h4 className="text-white text-xs font-black">اليوم الثالث: التقارير الفنية والاعتماد القضائي البيومتري (SEP-103)</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                        يركز هذا اليوم الختامي على صياغة التقارير الفنية بمطابقة المعاينة الميدانية وإرسالها للنيابة أو القاضي بالختم الرقمي والتوقيع البيومتري.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-cyan-400 font-black block">⏱️ تفصيل جدول اليوم الثالث والأخير:</span>
                      <div className="space-y-2 text-[9.5px]">
                        {[
                          { time: '09:00 - 10:30', title: 'إعداد وصياغة التقارير الفنية المتكاملة', detail: 'تنظيم المستند وهيكلة الجداول المساحية والفقهية طبقاً لقواعد مكتب الخبراء بوزارة العدل.' },
                          { time: '11:00 - 13:00', title: 'توجيه التقارير للجهات السيادية وتوقيعها بيومترياً', detail: 'إعداد نماذج خاصة بالقاضي، النيابة العامة، أقسام الشرطة، والتحليل الجنائي للشبكات.' },
                          { time: '14:00 - 15:30', title: 'تطبيقات متقدمة: دمج الـ GPS والمعاينة والخرائط', detail: 'إضافة وإسناد صور المعاينة والخرائط وصور الأقمار الصناعية لتقرير الخصوم.' },
                          { time: '16:00 - 17:30', title: 'الاختبار العملي الشامل وتكريم المشاركين بالشهادات', detail: 'تقديم حالة دراسية نهائية وتوزيع رخص ممارسة العمل الفني القضائي الرقمي.' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl flex items-start gap-3 justify-between">
                            <span className="font-mono text-cyan-400 text-[9px] font-black shrink-0">{item.time}</span>
                            <div className="space-y-0.5">
                              <span className="text-white font-extrabold block">{item.title}</span>
                              <p className="text-slate-500 text-[8px] font-medium leading-relaxed">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* VIRTUAL CERTIFICATE GENERATOR CARD */}
                    <div className="border-4 border-double border-amber-600/60 p-5 rounded-3xl bg-slate-950 text-center relative overflow-hidden max-w-md mx-auto space-y-4 shadow-2xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-[8px] text-slate-500 font-bold">
                        <span>رقم الاعتماد الأكاديمي: {isEnrolled ? enrollmentId : 'SEP-2026-8874'}</span>
                        <Scale className="w-5 h-5 text-amber-500" />
                        <span>أكاديمية سمارت إكسبيرت القضائية</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-black tracking-widest uppercase inline-block">
                          شهادة اعتماد خبير قضائي رقمي
                        </span>
                        <h5 className="text-white font-black text-sm mt-1.5">{studentName || 'الخبير القضائي المتدرب المعتمد'}</h5>
                        <p className="text-[9.5px] text-slate-300 leading-relaxed font-semibold">
                          نشهد بأن الحائز على هذه الرخصة قد اجتاز بنجاح الدورة التدريبية المكثفة والتمثيل الهندسي والقسمة الشرعية لـ **"نظام سمارت إكسبيرت القضائي"** وبأنه مرخص له بالعمل الاستدلالي الرقمي.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[8px] text-slate-500 font-bold">
                        <div className="flex items-center gap-1">
                          <Fingerprint className="w-4.5 h-4.5 text-emerald-400 animate-pulse cursor-pointer" onClick={() => triggerToast('✓ تم تأكيد البصمة البيومترية المشفرة للشهادة.', 'success')} />
                          <span>الختم البيومتري: مؤمن رقمياً ✓</span>
                        </div>
                        <div>الخبير والمطور الأول: كابتن حسام</div>
                      </div>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>طباعة وتصدير رخصة الخبير المعتمد والشهادة 🖨️</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 5: MARKETING & PROMOTION */}
                {academyTab === 'marketing' && (
                  <div className="space-y-4 text-right animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-1.5">
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-0.5 rounded-full font-black inline-block">
                        حزمة الدعاية والترويج التجاري للمنظومة
                      </span>
                      <h4 className="text-white text-xs font-black">أدوات واستراتيجيات نشر وترويج منصة سمارت إكسبيرت</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                        تم تصميم هذه الاستراتيجيات التسويقية الممنهجة لتعريف المجتمع القضائي والعقاري بقوة نظام الجيل الخامس والـ 52 وكيلاً مستقلاً.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-1.5 text-right">
                        <div className="p-1.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 w-fit rounded-lg">
                          <Globe className="w-5 h-5" />
                        </div>
                        <span className="text-white text-[10px] font-black block">🌐 الدعايا الرقمية الممنهجة</span>
                        <ul className="text-[8.5px] text-slate-400 space-y-1 font-medium list-disc list-inside">
                          <li>حملات LinkedIn احترافية تستهدف المستشارين والقضاة والمحامين لزيادة الوعي بالفصل الرقمي.</li>
                          <li>حملات إعلانية في جوجل (Google Ads) للكلمات القضائية المفتاحية الأكثر بحثاً.</li>
                          <li>فيديوهات Reels وShorts سريعة توضح المواريث والرفع المساحي في دقيقة واحدة.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-1.5 text-right">
                        <div className="p-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 w-fit rounded-lg">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <span className="text-white text-[10px] font-black block">📰 التسويق المطبوع بالقطاعات</span>
                        <ul className="text-[8.5px] text-slate-400 space-y-1 font-medium list-disc list-inside">
                          <li>نشر إعلانات في مجلة "المحاماة" وصحيفة "القضاة" لتعريفهم بقوة الوكلاء.</li>
                          <li>توزيع بروشورات احترافية مطبوعة في المؤتمرات القضائية والعقارية الكبرى.</li>
                          <li>إرسال خطابات ورقية فاخرة وموجهة مباشرة إلى رؤساء المحاكم الابتدائية والاستئنافية.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-1.5 text-right">
                        <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 w-fit rounded-lg">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="text-white text-[10px] font-black block">🤝 الشراكات والاعتمادات</span>
                        <ul className="text-[8.5px] text-slate-400 space-y-1 font-medium list-disc list-inside">
                          <li>بروتوكولات تعاون مع نقابة المهندسين (لأقسام المساحة) ونقابة المحامين.</li>
                          <li>نيل التوصيات الرسمية من كبار رجال القضاء والخبراء بوزارة العدل.</li>
                          <li>تقديم الدورة كبرنامج معتمد رسمياً في التأهيل المهني للخبراء القضائيين الجدد.</li>
                        </ul>
                      </div>
                    </div>

                    {/* INTERACTIVE MARKETING ESTIMATOR */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] text-cyan-400 font-black flex items-center gap-1.5 justify-end">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>📊 محاكي أثر الميزانية الترويجية والدعاية النشطة للمنظومة</span>
                      </span>
                      <p className="text-[8.5px] text-slate-500 leading-normal font-semibold">
                        اختر ميزانية الترويج وقناة التسويق لرصد التقديرات المتوقعة لمدى الانتشار والتفاعل الفعلي:
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-right text-[9px] font-bold">
                        <div className="space-y-1">
                          <label className="text-slate-400 block">ميزانية الدعاية الشهرية</label>
                          <select 
                            id="mkt-budget"
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white outline-none focus:border-cyan-500"
                            onChange={() => {
                              const b = document.getElementById('mkt-budget') as HTMLSelectElement;
                              const c = document.getElementById('mkt-channel') as HTMLSelectElement;
                              const reach = document.getElementById('mkt-reach');
                              const lead = document.getElementById('mkt-lead');
                              if (reach && lead && b && c) {
                                const mult = b.value === '10000' ? 1 : b.value === '50000' ? 5 : 12;
                                reach.innerText = `${(5000 * mult).toLocaleString('ar-EG')} مستهدف`;
                                lead.innerText = `${Math.round(20 * mult * (c.value === 'linkedin' ? 1.4 : c.value === 'google' ? 1.2 : 0.8))} جهة / قاضٍ`;
                              }
                            }}
                          >
                            <option value="10000">١٠,٠٠٠ جنيه مصري</option>
                            <option value="50000">٥٠,٠٠٠ جنيه مصري</option>
                            <option value="100000">١٠٠,٠٠٠ جنيه مصري</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block">قناة التسويق المحددة</label>
                          <select 
                            id="mkt-channel"
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white outline-none focus:border-cyan-500"
                            onChange={() => {
                              const b = document.getElementById('mkt-budget') as HTMLSelectElement;
                              const c = document.getElementById('mkt-channel') as HTMLSelectElement;
                              const reach = document.getElementById('mkt-reach');
                              const lead = document.getElementById('mkt-lead');
                              if (reach && lead && b && c) {
                                const mult = b.value === '10000' ? 1 : b.value === '50000' ? 5 : 12;
                                reach.innerText = `${(5000 * mult).toLocaleString('ar-EG')} مستهدف`;
                                lead.innerText = `${Math.round(20 * mult * (c.value === 'linkedin' ? 1.4 : c.value === 'google' ? 1.2 : 0.8))} جهة / قاضٍ`;
                              }
                            }}
                          >
                            <option value="linkedin">LinkedIn Ads (إعلانات لمهنيين ومستشارين)</option>
                            <option value="google">Google Search Ads (كلمات حصر تركات وقسمة فريضة)</option>
                            <option value="magazines">مجلات القضاء ونقابة المحامين (إعلانات مطبوعة)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-center font-mono text-[10px] font-black">
                        <div>
                          <span className="text-cyan-400 block text-xs" id="mkt-reach">٥,٠٠٠ مستهدف</span>
                          <span className="text-slate-500 text-[8px] mt-0.5 block">الوصول الإجمالي المقدر</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 block text-xs" id="mkt-lead">٢٨ جهة / قاضٍ</span>
                          <span className="text-slate-500 text-[8px] mt-0.5 block">التفاعل والطلبات المتوقعة</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          triggerToast('✓ تم تفعيل محاكاة الدورة التسويقية وتقدير الميزانية بنجاح!', 'success');
                        }}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[9px] py-2 rounded-xl transition-all cursor-pointer"
                      >
                        تحديث وتأكيد الميزانية الترويجية المقترحة 📈
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 6: JUDGES KIT (التوعية القضائية) */}
                {academyTab === 'judges_kit' && (
                  <div className="space-y-4 text-right animate-in fade-in duration-300">
                    <div className="bg-amber-950/10 border border-amber-500/20 p-4 rounded-2xl space-y-1 relative">
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black inline-block">
                        حقيبة نشر الوعي القضائي المتكاملة
                      </span>
                      <h4 className="text-white text-xs font-black">حزمة التوعية القضائية (Judges Kit)</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                        تتضمن هذه الحزمة كتيبات رسمية تمهيدية وملخصات تنفيذية وعروضاً تقديمية مجهزة مباشرة لإرسالها لأصحاب المعالي رؤساء المحاكم ودوائر التركات والنزاعات لتعريفهم بقوة وسرعة النظام.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Document 1: Official Letter */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-3 text-right">
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-400 font-black block">📬 الخطاب الرسمي التمهيدي للقضاة</span>
                          <p className="text-[8.5px] text-slate-400 leading-normal font-semibold">
                            خطاب رسمي فاخر وموجه مباشرة إلى المستشارين ورؤساء المحاكم والنيابات للتعريف بالمنظومة وكفاءتها.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              triggerToast('✓ جاري معاينة الخطاب الرسمي التمهيدي الموجه لرئيس المحكمة الكلية...', 'info');
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-[9px] py-1.5 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 inline ml-1" />
                            معاينة
                          </button>
                          <button 
                            onClick={() => {
                              triggerToast('✓ تم بدء تحميل الخطاب الرسمي (DOCX)...', 'success');
                            }}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-1.5 rounded-lg cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5 inline ml-1" />
                            تحميل
                          </button>
                        </div>
                      </div>

                      {/* Document 2: Executive Summary */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-3 text-right">
                        <div className="space-y-1">
                          <span className="text-[10px] text-cyan-400 font-black block">📄 الملخص التنفيذي Executive Summary</span>
                          <p className="text-[8.5px] text-slate-400 leading-normal font-semibold">
                            ملف فني مفصل يشرح توفير وقت وجهد الفصل في قضايا التركات والنزاعات العقارية بنسبة ٨٥٪.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              triggerToast('✓ جاري فتح الملف الفني والملخص التنفيذي للنظام القضائي الخبير...', 'info');
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-[9px] py-1.5 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 inline ml-1" />
                            معاينة
                          </button>
                          <button 
                            onClick={() => {
                              triggerToast('✓ تم بدء تحميل الملخص التنفيذي (PDF)...', 'success');
                            }}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-1.5 rounded-lg cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5 inline ml-1" />
                            تحميل
                          </button>
                        </div>
                      </div>

                      {/* Document 3: PPTX Presentation */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-3 text-right">
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-400 font-black block">📊 العرض التقديمي للتوعية (PowerPoint)</span>
                          <p className="text-[8.5px] text-slate-400 leading-normal font-semibold">
                            عرض تقديمي فخم من ١٢ شريحة يوضح دمج الـ GPS وقسمة المواريث والتحليل الجنائي للنيابة.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            triggerToast('✓ تم بدء تحميل ملف العرض التقديمي للقضاة (PPTX)...', 'success');
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-1.5 rounded-lg cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 inline ml-1" />
                          تحميل العرض التقديمي (PowerPoint)
                        </button>
                      </div>

                      {/* Document 4: Quick Guide */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-3 text-right">
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-400 font-black block">📖 دليل الاستخدام السريع للقضاة</span>
                          <p className="text-[8.5px] text-slate-400 leading-normal font-semibold">
                            كتيب توضيحي من صفحتين لشرح قراءة وتفنيد كود الهاش والبصمة البيومترية داخل التقرير المعتمد.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            triggerToast('✓ تم بدء تحميل دليل الاستخدام السريع للمستشارين (PDF)...', 'success');
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-1.5 rounded-lg cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 inline ml-1" />
                          تحميل دليل الاستخدام السريع (PDF)
                        </button>
                      </div>

                    </div>

                    {/* INTERACTIVE ACTIONS */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3 text-center">
                      <span className="text-[10px] text-amber-400 font-black block text-right">⚡ إجراءات ووسائل التوعية الفورية لدوائر المحاكم:</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <button
                          onClick={() => {
                            triggerToast('✉️ جاري تشفير وإرسال حزمة التوعية الرقمية عبر البريد الإلكتروني الآمن...', 'info');
                            setTimeout(() => {
                              triggerToast('✓ تم إرسال حزمة التوعية بنجاح إلى ٢٤ محكمة كلية و١٢ دائرة تركات بمحافظات القاهرة والجيزة!', 'success');
                            }, 1500);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-white font-black text-[9px] p-3 rounded-2xl transition-all cursor-pointer space-y-1 text-center"
                        >
                          <Mail className="w-5 h-5 text-amber-400 mx-auto block" />
                          <span className="block">إرسال التوعية للقضاة ✉️</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerToast('✓ جاري قيد طلب الدورة التدريبية التجريبية بمحكمة الاستئناف العالية...', 'info');
                            setTimeout(() => {
                              triggerToast('✓ تم تسجيل طلب الدورة بنجاح! سيقوم منسق الأكاديمية بالاتصال بجهة القضاء للتأكيد.', 'success');
                            }, 1200);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-white font-black text-[9px] p-3 rounded-2xl transition-all cursor-pointer space-y-1 text-center"
                        >
                          <GraduationCap className="w-5 h-5 text-emerald-400 mx-auto block" />
                          <span className="block">طلب دورة تجريبية للقضاة 🏫</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerToast('🖨️ جاري توليد وتجهيز حزمة التوعية وتنزيلها بصيغة PDF موحدة...', 'info');
                            setTimeout(() => {
                              triggerToast('✓ تم توليد ملف التوعية الشامل (PDF) وحفظه بنجاح!', 'success');
                            }, 1600);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 text-white font-black text-[9px] p-3 rounded-2xl transition-all cursor-pointer space-y-1 text-center"
                        >
                          <FileText className="w-5 h-5 text-cyan-400 mx-auto block" />
                          <span className="block">تجهيز ملف التوعية (PDF) 📄</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-900 mt-2">
                <button
                  disabled={academyTab === 'overview'}
                  onClick={() => {
                    const order = ['overview', 'day1', 'day2', 'day3', 'marketing', 'judges_kit'];
                    const idx = order.indexOf(academyTab);
                    if (idx > 0) setAcademyTab(order[idx - 1] as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    academyTab === 'overview' 
                      ? 'border-transparent text-slate-600 cursor-not-allowed' 
                      : 'border-slate-900 bg-slate-900/40 text-slate-300 hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  السابق
                </button>

                <button
                  onClick={() => {
                    const order = ['overview', 'day1', 'day2', 'day3', 'marketing', 'judges_kit'];
                    const idx = order.indexOf(academyTab);
                    if (idx < order.length - 1) {
                      setAcademyTab(order[idx + 1] as any);
                    } else {
                      setIsTrainingOpen(false);
                      handleTriggerEnter();
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-emerald-500/10"
                >
                  <span>{academyTab === 'judges_kit' ? 'إغلاق وبدء العمل الفعلي 💼' : 'التالي ➡️'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

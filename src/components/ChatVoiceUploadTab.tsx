import React, { useState, useEffect, useRef } from 'react';
import { CaseData } from '../types';
import { 
  Send, 
  MessageSquare, 
  UploadCloud, 
  Mic, 
  MicOff, 
  Volume2, 
  Trash2, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Download, 
  PhoneCall, 
  Headphones, 
  Play, 
  Square,
  AlertCircle,
  Clock,
  Calendar,
  Activity,
  Bell,
  UserCheck,
  ChevronLeft
} from 'lucide-react';

interface ChatVoiceUploadTabProps {
  caseData: CaseData;
  onUpdateCaseData: (updatedFields: Partial<CaseData>) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'completed' | 'uploading' | 'error';
  progress: number;
}

export default function ChatVoiceUploadTab({ caseData, onUpdateCaseData }: ChatVoiceUploadTabProps) {
  // --- STATE FOR BAILIFFS & NOTIFICATIONS ---
  const [notifyTab, setNotifyTab] = useState<'notices' | 'timeline'>('notices');
  const [customReportTarget, setCustomReportTarget] = useState<'bn1' | 'bn2'>('bn1');
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [customNotesInput, setCustomNotesInput] = useState('');

  const [bailiffNotices, setBailiffNotices] = useState([
    {
      id: 'bn1',
      target: 'محمد الجندي',
      role: 'المستأجر الأول (العين التجارية)',
      caseNumber: caseData.caseNumber,
      type: 'إنذار رسمي بالطرد والإخلاء الفوري',
      status: 'delivering', // sent | delivering | reported | enforced
      statusText: 'جاري الانتقال للتبليغ الميداني بالعمرانية',
      lastUpdated: 'منذ ساعتين',
      notes: 'تم توجيه مأمور التبليغ لمقر المحل التجاري بالعقار 27 شبين الكوم.',
      lawViolations: 'القانون رقم 136 لسنة 1981 (المادة 18)'
    },
    {
      id: 'bn2',
      target: 'ماجدة الجيار',
      role: 'المستأجر الثاني (الشقة السكنية)',
      caseNumber: caseData.caseNumber,
      type: 'إنذار بإخلاء الشقة السكنية وتسليم المفاتيح',
      status: 'sent',
      statusText: 'قيد الإرسال والتسليم لقلم المحضرين',
      lastUpdated: 'منذ 5 ساعات',
      notes: 'تم قيد الإعلان بجدول محضرين محكمة الجيزة الابتدائية وجاري التخصيص.',
      lawViolations: 'القانون رقم 49 لسنة 1977 (المادة 29)'
    }
  ]);

  const timelineMilestones = [
    {
      id: 'tm1',
      date: '١٥ يونيو ٢٠٢٦',
      title: 'قيد طلب الإعلان والإنذار بالطرد رسميًا',
      desc: 'تم تسجيل الطلبات بقلم كتاب محضرين الجيزة العمرانية وإثبات صحة الصفة والملكية للسيدة عليه محمود الوكيل.',
      status: 'completed',
      statusText: 'تم بنجاح ومطابق للائحة',
      color: 'emerald'
    },
    {
      id: 'tm2',
      date: '٢٠ يونيو ٢٠٢٦',
      title: 'الانتقال الميداني والتسليم التمهيدي للمحضر المختص',
      desc: 'انتقال مأمور دائرة العمرانية وتكليف القوة المحلية برصد محتويات العين التجارية وصورة شقة النزاع.',
      status: 'completed',
      statusText: 'تم بنجاح ومؤرشف رقمياً',
      color: 'emerald'
    },
    {
      id: 'tm3',
      date: '٢٨ يونيو ٢٠٢٦ (ميعاد متأخر للغاية!)',
      title: 'انقضاء مهلة السداد الودي والوفاء والامتثال الطوعي',
      desc: 'المهلة المقررة قانوناً لرد مفاتيح الشقة وإزالة الشواغر للمحل التجاري، وهو ميعاد متأخر تجاوز السقف الزمني دون امتثال.',
      status: 'overdue',
      statusText: 'متأخر للغاية - جاري الطرد الجبري الفوري بقوة الأمن',
      color: 'neon-red'
    },
    {
      id: 'tm4',
      date: '٠٥ يوليو ٢٠٢٦',
      title: 'ميعاد التمكين الجبري والشرطي الشامل',
      desc: 'ساعة الصفر لتنفيذ الطرد وبدء تطبيق الصيغة التنفيذية بالقوة الجبرية بإشراف حكمدار الجيزة وقسم العمرانية ومتابعة قلم المحضرين وممثلي النيابة العامة.',
      status: 'pending',
      statusText: 'قيد التنفيذ الجبري والشرطي',
      color: 'neon-cyan'
    }
  ];

  const [activeAlert, setActiveAlert] = useState<{ message: string; type: 'success' | 'info' | 'alert' } | null>({
    message: 'تنبيه نشط من قلم المحضرين: تم قيد طلبات الإنذار القضائي لمحمد الجندي وماجدة الجيار برقم صادر 942/ب لبيت العمرانية.',
    type: 'info'
  });

  const handleCustomReportSubmit = () => {
    if (!customStatusInput.trim()) return;
    
    setBailiffNotices(prev => prev.map(notice => {
      if (notice.id === customReportTarget) {
        const nextNotes = customNotesInput.trim() || 'تم استلام وتفريغ تقرير المحضر القضائي المكتوب يدوياً وإدراجه في الملف الرقمي الموحد لبيت العمرانية.';
        
        setActiveAlert({
          message: `✓ تم إيداع تقرير محضر رسمي لـ ${notice.target} بنجاح: ${customStatusInput}`,
          type: 'success'
        });

        // Add a message in the chat as if the AI assistant was notified in real time!
        const systemMessageText = `📢 **استلام تقرير محضر ميداني عاجل (تحديث يدوي):** تم تفريغ مستند المحضر القضائي المرفق لـ **${notice.target}**:\n\n• **الوضعية الميدانية الفورية:** [${customStatusInput}]\n• **إفادة المحضر الموثقة:** ${nextNotes}\n\n*تم إلحاق هذا التقرير بالمخالفات القانونية وبنود الخرق وبدء الإجراء الفوري للطرد الجبري.*`;
        
        setMessages(prevMsgs => [
          ...prevMsgs,
          {
            id: `sys-custom-${Date.now()}`,
            sender: 'assistant',
            text: systemMessageText,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        return {
          ...notice,
          status: 'reported',
          statusText: customStatusInput,
          notes: nextNotes,
          lastUpdated: 'الآن'
        };
      }
      return notice;
    }));
    
    setCustomStatusInput('');
    setCustomNotesInput('');
  };

  const handleUpdateNoticeStatus = (id: string) => {
    setBailiffNotices(prev => prev.map(notice => {
      if (notice.id === id) {
        let nextStatus: 'sent' | 'delivering' | 'reported' | 'enforced' = 'sent';
        let nextStatusText = '';
        let nextNotes = '';
        
        if (notice.status === 'sent') {
          nextStatus = 'delivering';
          nextStatusText = 'جاري الانتقال للتبليغ الميداني بالعمرانية';
          nextNotes = 'تم توجيه مأمور التبليغ لمقر العقار بالعمرانية الغربية لتسليم إعلان الإخلاء.';
        } else if (notice.status === 'delivering') {
          nextStatus = 'reported';
          nextStatusText = 'تم الإعلان لشخص المعلن إليه قانوناً (مُستلم)';
          nextNotes = 'تم تسليم الإعلان للمستأجر شخصياً مع إثبات توقيعه ورفضه الإخلاء الطوعي.';
        } else if (notice.status === 'reported') {
          nextStatus = 'enforced';
          nextStatusText = 'تم إيداع التقرير والتمكين الجبري الفوري';
          nextNotes = 'تم تسليم تقرير الإعلان لقلم المحضرين، ومخاطبة مأمور الضبط وقوات الأمن لبدء الطرد الجبري وتأمين العين.';
        } else {
          nextStatus = 'sent';
          nextStatusText = 'قيد الإرسال والتسليم لقلم المحضرين';
          nextNotes = 'تمت إعادة تهيئة الإعلان للتبليغ التكراري الدوري لبيت العمرانية.';
        }

        // Trigger a gorgeous toast / banner alert
        setActiveAlert({
          message: `✓ تحديث من قلم المحضرين لبيت العمرانية: تم تغيير حالة إنذار ${notice.target} إلى: ${nextStatusText}`,
          type: nextStatus === 'enforced' ? 'success' : 'alert'
        });

        // Add a message in the chat as if the AI assistant was notified in real time!
        const systemMessageText = `📢 **تنبيه عاجل من المحضر القضائي:** تم استلام التحديث الميداني لإنذار **${notice.target}** (${notice.type}) بنجاح.\n\n• **الحالة الجديدة:** [${nextStatusText}]\n• **تفاصيل المحضر الميدانية:** ${nextNotes}\n\n*تمت أرشفة وتثبيت هذا التقرير الفيدرالي تلقائياً ومطابقته بأحكام الطرد المقترحة لتأمين السيدة عليه محمود الوكيل.*`;
        
        setMessages(prevMsgs => [
          ...prevMsgs,
          {
            id: `sys-${Date.now()}`,
            sender: 'assistant',
            text: systemMessageText,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        return {
          ...notice,
          status: nextStatus,
          statusText: nextStatusText,
          notes: nextNotes,
          lastUpdated: 'الآن'
        };
      }
      return notice;
    }));
  };

  // --- STATE FOR CHAT ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `مرحباً بك يا كابتن حسام في المركز الذكي الموحد لبيت العمرانية. لقد قمت بتحميل قضية **"${caseData.title}"** بنجاح.\n\nلقد قمت بإضافة **"نظام تتبع إنذارات المحضرين والتنبيهات القضائية"** في العمود الأيسر، لمتابعة الحالة الميدانية للإنذارات الرسمية المقامة ضد المستأجرين محمد الجندي وماجدة الجيار، والتحكم بها فور استلام التقارير.\n\nكيف يمكنني مساعدتك اليوم؟`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- STATE FOR FILE UPLOAD ---
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: 'f1', name: 'عقد_إيجار_بيت_العمرانية_الرسمي_موقع.pdf', size: '1.8 MB', type: 'application/pdf', status: 'completed', progress: 100 },
    { id: 'f2', name: 'تقرير_المعاينة_الهندسية_العمرانية.pdf', size: '3.4 MB', type: 'application/pdf', status: 'completed', progress: 100 },
    { id: 'f3', name: 'مستندات_السطح_وتكاليف_الإزالة.pdf', size: '850 KB', type: 'application/pdf', status: 'completed', progress: 100 }
  ]);

  // --- STATE FOR VOICE CHAT & RECORDER ---
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recording' | 'calling'>('idle');
  const [voiceWaves, setVoiceWaves] = useState<number[]>([10, 25, 40, 15, 30, 50, 60, 45, 20, 35, 12, 45, 60, 80, 55, 30, 70, 85, 40, 20]);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceLogs, setVoiceLogs] = useState<string[]>([]);
  const [recordedMemos, setRecordedMemos] = useState<{ id: string; duration: string; date: string; text: string }[]>([]);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Timer for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceMode === 'calling') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [voiceMode]);

  // Waveform animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceMode === 'recording' || voiceMode === 'calling') {
      interval = setInterval(() => {
        setVoiceWaves(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
      }, 120);
    }
    return () => clearInterval(interval);
  }, [voiceMode]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chat Submission
  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    // AI Response generation specific to Omraneya case, Gendy and Majda
    setTimeout(() => {
      let aiText = '';
      const prompt = messageText.toLowerCase();

      if (prompt.includes('محمد') || prompt.includes('الجندي') || prompt.includes('جندي')) {
        aiText = `بشأن المستأجر **محمد الجندي**، مسودة الحكم تشتمل على طرده وإخلائه نهائياً من العين المؤجرة الكائنة بـ **27 شارع شبين الكوم بالعمرانية الغربية** مع إعفائه بالكامل من متأخرات وتكاليف إزالة السطح (البالغة 150,000 ج.م) بصفة مطلقة وبراءة ذمته المالية منها.`;
      } else if (prompt.includes('ماجدة') || prompt.includes('الجيار') || prompt.includes('ماجده')) {
        aiText = `بشأن السيدة **ماجدة الجيار** (زوجة المرحوم الحاج محمد شلبي)، تقرر إخلاؤها جبرياً من الشقة المستغلة من قبلها بالعقار رقم 27 شارع شبين الكوم وتسليم مفاتيحها خالية تماماً للسيدة مالكة العقار **عليه محمود الوكيل**.`;
      } else if (prompt.includes('عمرانيه') || prompt.includes('العمرانية') || prompt.includes('شبين')) {
        aiText = `عقار العمرانية (العقار 27 شارع شبين الكوم) مساحته **180 متر مربع** ويتكون من 5 طوابق بسعة إيجارية سنوية تبلغ 24,000 ج.م، القيمة الإيجارية المقترحة للزيادة هي **2,000 ج.م شهرياً** تسري من **الأول من يناير 2027م**.`;
      } else if (prompt.includes('سطح') || prompt.includes('إزالة') || prompt.includes('تكاليف')) {
        aiText = `تم تبرئة المستأجرين (محمد الجندي وماجدة الجيار) من دفع حصتهم في تكاليف إزالة السطح البالغة **150,000 ج.م**. يتحمل اتحاد الملاك أو المالك الأساسي هذه التكلفة ولا تُلزم ذمتهم المالية بها.`;
      } else if (prompt.includes('حكم') || prompt.includes('أحكام') || prompt.includes('قرار')) {
        aiText = `الأحكام القضائية النهائية المقترحة مصاغة بالتفصيل في تبويب **"الأحكام القضائية المقترحة"**، يمكنك الذهاب لتبويب التقرير ثم اختيار "حكم المحكمة المقترح" للاطلاع والتوقيع على المسودة.`;
      } else if (prompt.includes('مرفق') || prompt.includes('ملف') || prompt.includes('تحميل')) {
        aiText = `لقد قمت بقراءة وتحليل الملفات المرفقة بنجاح. تم تأكيد مطابقة بيانات عقد إيجار بيت العمرانية المسجل وإرفاقها بمذكرة النيابة العامة.`;
      } else {
        aiText = `أهلاً بك كابتن حسام. تم مراجعة ملف دعوى نزاع بيت العمرانية. أود التأكيد أن نظام الاستدلال القضائي يدعم طرد محمد الجندي وإخلاء ماجدة الجيار مع تعديل القيمة الإيجارية الشهرية لتصبح 2,000 ج.م شهرياً مع إعفائهما التام من غرامات السطح. هل ترغب في صياغة بند آخر؟`;
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: aiText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileMock(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileMock(e.target.files[0]);
    }
  };

  const uploadFileMock = (file: File) => {
    const fileId = `f-${Date.now()}`;
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'unknown/binary',
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          const finished = currentProgress >= 100;
          if (finished) clearInterval(interval);
          return {
            ...f,
            progress: finished ? 100 : currentProgress,
            status: finished ? 'completed' : 'uploading'
          };
        }
        return f;
      }));

      if (currentProgress >= 100) {
        // Trigger automated chat analysis response upon file completion
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'assistant',
              text: `📎 **تحليل تلقائي للمستند:** لقد تم استلام وقراءة ملفك الجديد **"${file.name}"** بنجاح. تم استخراج المذكرات وربطها بالدعوى القضائية لبيت العمرانية ورصد توافقها مع مستندات الخبراء.`,
              time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 800);
      }
    }, 200);
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Voice Interaction Handlers
  const handleToggleRecord = () => {
    if (voiceMode === 'calling') return;
    if (voiceMode === 'recording') {
      // Stop recording
      setVoiceMode('idle');
      const memoId = `memo-${Date.now()}`;
      const newMemo = {
        id: memoId,
        duration: '0:12',
        date: new Date().toLocaleDateString('ar-EG'),
        text: 'طلب الخبير كابتن حسام التحقق من صحة عقود الإيجار القديمة لورثة الحاج محمد شلبي ومقارنتها بالقانون الجديد.'
      };
      setRecordedMemos(prev => [newMemo, ...prev]);
      setMessages(prev => [
        ...prev,
        {
          id: `voice-trans-${Date.now()}`,
          sender: 'user',
          text: `🎙️ **[مذكرة صوتية مفرغة]:** طلب التحقق من صحة عقود الإيجار القديمة لورثة الحاج محمد شلبي ومقارنتها بالقانون الجديد.`,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      // Trigger automated AI answer
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `voice-ans-${Date.now()}`,
            sender: 'assistant',
            text: `📝 **رد المساعد الصوتي:** تم جدولة مراجعة عقود الإيجار القديمة لورثة الحاج محمد شلبي. تشير البيانات المسجلة أن العلاقة الإيجارية انقضت بقوة القانون، وهو الأساس الذي تم الاستناد عليه لإخلاء السيدة ماجدة الجيار.`,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Start recording
      setVoiceMode('recording');
    }
  };

  const handleStartVoiceCall = () => {
    if (voiceMode === 'recording') return;
    if (voiceMode === 'calling') {
      // End Call
      setVoiceMode('idle');
      setVoiceLogs(prev => [...prev, `تم إنهاء المكالمة الصوتية الاستشارية بنجاح ومدتها ${formatDuration(callDuration)}`]);
    } else {
      // Start Call
      setVoiceMode('calling');
      setVoiceLogs(prev => [...prev, 'بدء اتصال مباشر بقوة بروتوكول الصوت القضائي الموحد...']);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-right">
            <h2 className="text-white text-base font-black flex items-center gap-2">
              <span>المركز الذكي الموحد: الشات والملفات والتحدث الصوتي</span>
              <span className="text-[10px] bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">نشط</span>
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              منصة تفاعلية موحدة لرفع مستندات قضية بيت العمرانية، التحدث المباشر مع الذكاء القضائي، وتسجيل الأوامر الصوتية
            </p>
          </div>
        </div>

        {/* Quick Help Status */}
        <div className="text-[10px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]"></span>
          <span className="text-slate-400 font-bold font-mono">CASE CONNECTION SECURED</span>
        </div>
      </div>

      {/* 1.5. Live Notification Bar */}
      {activeAlert && (
        <div className="bg-slate-950 border border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse transition-all">
          <div className="flex items-center gap-3 text-right">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 text-sm shadow-[0_0_8px_#00f0ff]">
              🔔
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-cyan-400 font-extrabold block">تنبيه قضائي فوري نشط:</span>
              <p className="text-white text-xs font-bold leading-relaxed">{activeAlert.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-850 transition-all cursor-pointer"
          >
            تصفية التنبيه ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: Chat Space (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Chat Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[600px] relative">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                <span className="text-xs font-black text-white">المستشار القضائي المساعد لبيت العمرانية</span>
              </div>
              <div className="flex items-center gap-2">
                {voiceMode === 'calling' && (
                  <span className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    🟢 {formatDuration(callDuration)}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-mono">AI ASSISTANT 3.0</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 text-right scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-cyan-400 border border-slate-850'
                  }`}>
                    {msg.sender === 'user' ? 'ح' : '⚖️'}
                  </div>
                  <div className="space-y-1">
                    <div className={`p-3 rounded-xl text-xs leading-relaxed font-semibold ${
                      msg.sender === 'user' 
                        ? 'bg-cyan-500 text-slate-950 font-black rounded-tl-none shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                        : 'bg-slate-950/80 text-slate-200 border border-slate-850 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 block text-left pr-1">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[80%] ml-auto">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 text-cyan-400 flex items-center justify-center text-xs">
                    ⚖️
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 rounded-tr-none flex items-center gap-2 text-cyan-400 text-xs font-bold animate-pulse">
                    {/* Neon blue progress loader inside typing indicator */}
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shadow-[0_0_8px_#00f0ff] filter drop-shadow-[0_0_6px_#00f0ff]" />
                    <span>جاري تحليل البيانات وإصدار الرد الفني...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Helper Questions */}
            <div className="flex gap-2 my-3 overflow-x-auto py-1 scrollbar-none shrink-0">
              <button 
                onClick={() => handleSendMessage('ما هي الأحكام القضائية المقترحة لمحمد الجندي؟')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all"
              >
                ⚖️ حكم محمد الجندي
              </button>
              <button 
                onClick={() => handleSendMessage('ما هو قرار إخلاء ماجدة الجيار؟')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all"
              >
                📜 حكم ماجدة الجيار
              </button>
              <button 
                onClick={() => handleSendMessage('تفاصيل تكاليف إزالة السطح والـ 150 ألف')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all"
              >
                🏚️ تكاليف إزالة السطح
              </button>
              <button 
                onClick={() => handleSendMessage('مواصفات عقار بيت العمرانية')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all"
              >
                🏠 مواصفات بيت العمرانية
              </button>
            </div>

            {/* Chat Input Area with Integrated Micro-Mic Voice Dictation button */}
            <div className="relative mt-auto pt-2 border-t border-slate-850">
              {voiceMode === 'recording' && (
                <div className="absolute right-3 top-[-32px] bg-red-950/95 border border-red-500/40 text-red-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>جاري تسجيل صوت كابتن حسام للتفريغ... انقر مجدداً للحفظ</span>
                </div>
              )}
              
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={voiceMode === 'recording' ? "تحدث الآن بوضوح، سيتم تفريغ صوتك فوراً..." : "اكتب استفسارك القضائي أو الفني عن بيت العمرانية هنا..."}
                disabled={voiceMode === 'recording'}
                className="w-full bg-slate-950 text-white text-xs pr-4 pl-32 py-3.5 rounded-xl border border-slate-850 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-right transition-all"
              />
              
              <div className="absolute left-2 top-3 bottom-2 flex items-center gap-1.5">
                {/* Micro Phone Connection Call */}
                <button
                  onClick={handleStartVoiceCall}
                  className={`p-2 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 border ${
                    voiceMode === 'calling'
                      ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-cyan-300'
                  }`}
                  title={voiceMode === 'calling' ? 'إنهاء الاتصال الصوتي' : 'بدء اتصال صوتي مباشر مع المستشار الفني'}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>

                {/* Integrated Micro Microphone Dictation button */}
                <button
                  onClick={handleToggleRecord}
                  className={`p-2 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 border ${
                    voiceMode === 'recording'
                      ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
                      : 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-cyan-300 hover:bg-slate-850'
                  }`}
                  title={voiceMode === 'recording' ? 'إيقاف التسجيل وتفريغه' : 'إملاء صوتي قضائي'}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() && voiceMode !== 'recording'}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-950 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-black text-[11px] gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>إرسال</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* LEFT COLUMN: File Upload Station & Bailiffs Notifications Desk (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* File Upload Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white">مستودع رفع مستندات بيت العمرانية</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">UPLOADS SECURED</span>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                dragActive 
                  ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-900/10'
              }`}
            >
              <input 
                type="file" 
                id="file-upload-input" 
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-800">
                  <UploadCloud className="w-5 h-5 text-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white text-xs font-bold">اسحب مستندات بيت العمرانية أو انقر للرفع محلياً</h4>
                  <p className="text-slate-500 text-[10px] font-semibold">
                    يدعم PDF, DOCX, صور المعاينة، مذكرات النيابة ومستندات السطح
                  </p>
                </div>
              </div>
            </div>

            {/* List of Uploaded files with neon progress bar */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-black block border-b border-slate-950 pb-1">مستندات القضية المرفوعة ({uploadedFiles.length}):</span>
              
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-right group hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500">{file.size}</span>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded text-slate-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress indicator styled in glowing neon blue as requested */}
                    {file.status === 'uploading' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-cyan-400">جاري الرفع والتحليل...</span>
                          <span className="text-cyan-400 font-mono">{file.progress}%</span>
                        </div>
                        {/* Glow and Neon Blue bar */}
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-cyan-400 shadow-[0_0_10px_#00f0ff] h-full rounded-full transition-all duration-150"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold justify-end">
                        <span>تم الرفع والمزامنة مع مصلحة الشهر العقاري بنجاح ✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Legal Context box */}
            <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 space-y-2 text-right">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-extrabold justify-end">
                <span>تنبيه أمان ومطابقة المستندات</span>
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                جميع المستندات والأوامر الصوتية المرفوعة هنا تخضع للتشفير العسكري لضمان سرية التحقيق القضائي والسرية المهنية لتقرير كابتن حسام.
              </p>
            </div>

          </div>

          {/* 📋 PROCESS SERVER WARNINGS & NOTIFICATIONS HUB (إنذارات المحضرين والجدول الزمني) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 text-right relative overflow-hidden">
            
            {/* Header with Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850 self-start">
                <button
                  onClick={() => setNotifyTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    notifyTab === 'timeline'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📈 الخريطة الزمنية (Timeline)
                </button>
                <button
                  onClick={() => setNotifyTab('notices')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    notifyTab === 'notices'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📋 الإخطارات والإنذارات ({bailiffNotices.length})
                </button>
              </div>

              <div className="flex items-center gap-2 self-end">
                <span className="text-white text-xs font-black">مركز المحضرين والتنبيهات القضائية</span>
                <span className="text-sm">📋</span>
              </div>
            </div>

            {/* Render notices tab */}
            {notifyTab === 'notices' && (
              <div className="space-y-5">
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  متابعة ميدانية حية لإنذارات قلم محضرين محكمة الجيزة الابتدائية الصادرة ضد الخصوم لبيت العمرانية. يمكنك النقر على الإجراء لتحديث الحالة تلقائيًا، أو إيداع تقرير مكتوب يدوياً بالأسفل.
                </p>

                <div className="space-y-4 pt-1">
                  {bailiffNotices.map((notice) => {
                    // Determine status badge color and border glow
                    let statusBadgeClass = '';
                    let borderClass = '';
                    
                    if (notice.status === 'sent') {
                      statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                      borderClass = 'border-slate-850 hover:border-amber-500/20';
                    } else if (notice.status === 'delivering') {
                      statusBadgeClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]';
                      borderClass = 'border-cyan-500/20 hover:border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.05)]';
                    } else if (notice.status === 'reported') {
                      statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                      borderClass = 'border-slate-850 hover:border-emerald-500/30';
                    } else {
                      statusBadgeClass = 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]';
                      borderClass = 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)]';
                    }

                    return (
                      <div 
                        key={notice.id}
                        className={`bg-slate-950 p-4.5 rounded-xl border transition-all space-y-4 ${borderClass}`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-900 pb-2.5">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border leading-normal ${statusBadgeClass}`}>
                            {notice.statusText}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="text-white text-xs font-black">{notice.target}</h4>
                            <span className="text-[10px] text-slate-500 font-bold">{notice.role}</span>
                          </div>
                        </div>

                        {/* Violation & Eviction Rule Section - Mandated requirements */}
                        <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-lg space-y-2 text-[10px] leading-relaxed">
                          <div className="text-cyan-400 font-black border-b border-slate-900 pb-1 flex items-center justify-between">
                            <span>الخرق القانوني وبنود المخالفة والأخطاء</span>
                            <span>⚖️ البند الفني</span>
                          </div>
                          <div className="space-y-1 text-slate-300 font-semibold">
                            <p>
                              📌 <strong className="text-slate-400">الأحكام المخالفة:</strong> {notice.id === 'bn1' 
                                ? 'مخالفة المادة 18 من القانون 136 لسنة 1981 (التنازل الصارخ عن العين وإيجارها من الباطن دون علم المالك).' 
                                : 'مخالفة المادة 29 من القانون 49 لسنة 1977 (رفض إخلاء العين السكنية بعد انقضاء المدة المؤقتة المقررة).'}
                            </p>
                            <p>
                              ❌ <strong className="text-slate-400">التجاوزات والأخطاء الموثقة:</strong> {notice.id === 'bn1'
                                ? 'استغلال ترخيص تجاري وهمي، ومحاولة تحوير الطبيعة الهندسية للعين دون رخصة فنية.'
                                : 'التخلف عن الوفاء بالامتثال الودي لإنذار 15 يونيو، وممانعة الاستلام الإيجابي للهوية الوطنية.'}
                            </p>
                          </div>
                          
                          <div className="border-t border-slate-900/60 pt-2 space-y-1">
                            <span className="text-red-400 font-black block">🚨 الصيغة النهائية وقرار الطرد الجبري الفوري:</span>
                            <p className="text-slate-300 font-bold italic bg-red-950/20 p-2 rounded border border-red-500/10 text-[9.5px]">
                              {notice.id === 'bn1'
                                ? '"حكمت المحكمة حضورياً بالطرد الفوري والإخلاء العاجل لمحمد الجندي وتسليم العين خالية من الشواغر، وعلى الجهات الإدارية والشرطية وقسم العمرانية متابعة القرار وتنفيذه الجبري الفوري بقوة القانون مالم يمتثل."'
                                : '"قرار النيابة العامة بتمكين السيدة عليه الوكيل من الشقة السكنية وإخلائها جبرياً من ماجدة الجيار وصالح ورثتها، وعلى قلم المحضرين والشرطة متابعة التنفيذ وتدشين الطرد الفوري."'}
                            </p>
                          </div>
                        </div>

                        {/* Notice details */}
                        <div className="space-y-1.5 text-[10.5px] font-semibold">
                          <div className="flex justify-between text-slate-400">
                            <span className="text-slate-200 font-bold">{notice.type}</span>
                            <span className="text-slate-500 font-bold">نوع الإجراء الميداني:</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span className="text-slate-500 font-mono">{notice.caseNumber}</span>
                            <span className="text-slate-500 font-bold">رقم القضية:</span>
                          </div>
                          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900 text-slate-300 leading-relaxed text-[10px]">
                            <strong className="text-slate-400">إفادة قلم المحضرين الحالية:</strong> {notice.notes}
                          </div>
                        </div>

                        {/* Action button to update notice state */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900/50">
                          <span className="text-[9px] text-slate-500 font-mono">آخر تحديث: {notice.lastUpdated}</span>
                          <button
                            onClick={() => handleUpdateNoticeStatus(notice.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                          >
                            <span>📥 ترقية الدورة التلقائية للحالة</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Manual handwritten report entry form - fulfill user request "مع إمكانية تحديث الحالة فور استلام التقرير من المحضر" */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[9px] text-slate-500 font-mono">MANUAL BAILIFF ENTRY</span>
                    <span className="text-cyan-400 text-[10.5px] font-black">إيداع وتفريغ تقرير المحضر اليدوي</span>
                  </div>

                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    بمجرد استلامك لتقرير المحضر القضائي المكتوب يدوياً، أدخل الحالة والإفادة الميدانية لتحديث النظام تلقائياً وبثها في الشات.
                  </p>

                  <div className="space-y-2 pt-1.5">
                    <div className="grid grid-cols-2 gap-2 text-right">
                      <div>
                        <label className="text-[9px] text-slate-400 font-bold block mb-1">الوضعية / الحالة الميدانية</label>
                        <input
                          type="text"
                          value={customStatusInput}
                          onChange={e => setCustomStatusInput(e.target.value)}
                          placeholder="مثال: تم إعلان الخصم بشخصه وامتنع"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-400 text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-bold block mb-1">المستهدف بالإنذار</label>
                        <select
                          value={customReportTarget}
                          onChange={e => setCustomReportTarget(e.target.value as 'bn1' | 'bn2')}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none text-right"
                        >
                          <option value="bn1">محمد الجندي (المستأجر الأول)</option>
                          <option value="bn2">ماجدة الجيار (المستأجر الثاني)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 font-bold block mb-1">إفادة وتقرير المحضر المكتوب يدوياً</label>
                      <textarea
                        value={customNotesInput}
                        onChange={e => setCustomNotesInput(e.target.value)}
                        placeholder="دون تفاصيل تقرير المحضر ورفضه إخلاء بيت العمرانية..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-400 text-right"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleCustomReportSubmit}
                      disabled={!customStatusInput.trim()}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-950 text-[10px] font-black py-1.5 rounded transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
                    >
                      إثبات وتأكيد التقرير الميداني وعرضه بالشات 📥
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Render Timeline tab */}
            {notifyTab === 'timeline' && (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  خريطة زمنية ذكية توضح مواعيد وجداول تسليم الإنذارات القانونية والتمكين الفعلي لبيت العمرانية. التواريخ المتأخرة محددة باللون الأحمر النيون المتوهج مع نبض الأمان للمهام المعلقة.
                </p>

                {/* Vertical Timeline Container */}
                <div className="relative border-r border-slate-800 pr-5 mr-2.5 space-y-6 pt-2 pb-2 text-right">
                  {timelineMilestones.map((milestone) => {
                    const isOverdue = milestone.status === 'overdue';
                    const isPending = milestone.status === 'pending';
                    const isCompleted = milestone.status === 'completed';

                    // Determine layout & style
                    let pointColorClass = 'bg-slate-800 border-slate-700';
                    let boxStyle = 'bg-slate-950 border-slate-850 text-slate-300';
                    
                    if (isCompleted) {
                      pointColorClass = 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                      boxStyle = 'bg-slate-950 border-emerald-950/40 text-slate-300';
                    } else if (isOverdue) {
                      pointColorClass = 'bg-red-500 border-red-400 shadow-[0_0_15px_#ff003c] animate-pulse';
                      boxStyle = 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-red-200';
                    } else if (isPending) {
                      pointColorClass = 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_#00f0ff]';
                      boxStyle = 'bg-slate-950 border-cyan-950/40 text-slate-300';
                    }

                    return (
                      <div key={milestone.id} className="relative">
                        
                        {/* Timeline Bullet Point */}
                        <span className={`absolute right-[-26px] top-1.5 w-3 h-3 rounded-full border-2 ${pointColorClass}`}>
                          {isPending && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping top-0 left-0"></span>
                          )}
                        </span>

                        {/* Milestone Card */}
                        <div className={`p-3.5 rounded-xl border transition-all ${boxStyle}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-900/50 pb-1.5 mb-2">
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded ${
                              isOverdue 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_8px_#ff003c]' 
                                : isPending
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {milestone.statusText}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">{milestone.date}</span>
                          </div>

                          <h5 className="text-white text-xs font-black mb-1 flex items-center gap-1.5 justify-end">
                            <span>{milestone.title}</span>
                            {isOverdue && <span className="text-red-500 animate-pulse text-xs">⚠️</span>}
                            {isPending && <span className="text-cyan-400 animate-ping text-[6px]">●</span>}
                          </h5>

                          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                            {milestone.desc}
                          </p>

                          {/* Pulsing indicator for pending milestone */}
                          {isPending && (
                            <div className="mt-2 flex items-center gap-1.5 justify-end text-[9px] text-cyan-400 font-black animate-pulse bg-cyan-950/30 p-1.5 rounded border border-cyan-500/10">
                              <span>مهمة قضائية نشطة: جاري التنسيق للتنفيذ الجبري مع اللواء مأمور قسم العمرانية</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simulated Info footer */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-semibold">
              💡 <strong className="text-slate-300">طريقة المتابعة الميدانية:</strong> تتكامل هذه الخريطة والإنذارات مع المستشار القضائي لضمان تطبيق قرار الطرد النهائي بقوة الأمن. يُرصد أي تأخير باللون <span className="text-red-500 font-bold shadow-[0_0_4px_#ff003c]">الأحمر النيون المتوهج</span> لمنع ضياع الحقوق.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

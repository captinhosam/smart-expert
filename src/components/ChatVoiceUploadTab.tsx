import React, { useState, useEffect, useRef } from 'react';
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
  Play, 
  Pause,
  Square, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Activity, 
  Bell, 
  UserCheck, 
  ChevronLeft, 
  Paperclip,
  Lock,
  Unlock,
  Eye,
  Settings,
  Plus,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  Compass,
  Satellite,
  MapPin,
  PlayCircle,
  PauseCircle,
  BarChart4
} from 'lucide-react';
import { CaseData, CalculationResults } from '../types';
import { triggerToast } from '../lib/toast';
import DigitalAttachmentsRegister from './DigitalAttachmentsRegister';

interface ChatVoiceUploadTabProps {
  caseData: CaseData;
  onUpdateCaseData: (data: CaseData) => void;
  results?: CalculationResults;
}

// Simulated Bailiff notice structure
interface BailiffNotice {
  id: string;
  title: string;
  date: string;
  type: 'eviction' | 'notice' | 'enforcement';
  bailiff: string;
  status: 'authorized' | 'incomplete' | 'pending';
  description: string;
  missingPapers?: string[];
}

// Initial Bailiff notices
const INITIAL_NOTICES: BailiffNotice[] = [
  {
    id: 'notice-1',
    title: 'طلب إخلاء السطح العلوي الخرساني رقم ٢٧',
    date: '2026-06-20',
    type: 'eviction',
    bailiff: 'المحضر: محمود عبد السميع',
    status: 'authorized',
    description: 'تم إصدار قرار الإزالة الفوري الجبري للسطح من قاضي التنفيذ بموجب التقرير الإنشائي المعتمد.',
  },
  {
    id: 'notice-2',
    title: 'مستندات تسوية ورثة محمد شلبي',
    date: '2026-06-28',
    type: 'enforcement',
    bailiff: 'المحضر: أحمد أبو المجد',
    status: 'incomplete',
    description: 'تعذر توثيق قرار الامتداد السكني لعدم تقديم ما يفيد الإقامة المستقرة للزوجة ماجدة الجيار.',
    missingPapers: [
      'شهادة وفاة المستأجر الأصلي (المرحوم محمد شلبي) المعتمدة قضائياً.',
      'عقد زواج السيدة ماجدة الجيار من المورث لبيان صلة القرابة والنسب.',
      'إفادة معتمدة من مباحث شرطة العمرانية تؤكد الإقامة المستقرة قبل الوفاة بسنة واحدة على الأقل.'
    ]
  },
  {
    id: 'notice-3',
    title: 'إثبات مخالفة اللافتة التجارية لمحل محمد الجندي',
    date: '2026-07-02',
    type: 'notice',
    bailiff: 'المحضر: محمود عبد السميع',
    status: 'authorized',
    description: 'إلزام المستأجر محمد الجندي بإزالة اللوحة العشوائية فوراً وتحت إشراف الأجهزة المحلية لمنع الغرامة.',
  }
];

// Initial timeline milestones
interface Milestone {
  id: string;
  date: string;
  title: string;
  bailiff: string;
  status: 'authorized' | 'incomplete' | 'pending';
  category: string;
}

const INITIAL_MILESTONES: Milestone[] = [
  { id: 'm-1', date: '2026-06-15', title: 'إيداع مذكرة النزاع من المؤجرة عليه الوكيل', bailiff: 'محضر إعلان أول', status: 'authorized', category: 'الأحكام والمواعيد الإجرائية' },
  { id: 'm-2', date: '2026-06-20', title: 'صدور قرار إخلاء السطح الإجباري وتكليف الهيئة الإنشائية', bailiff: 'المحضر محمود عبد السميع', status: 'authorized', category: 'الأحكام والمواعيد الإجرائية' },
  { id: 'm-3', date: '2026-06-25', title: 'تقديم مذكرة دفاع ورثة شلبي والمستندات الناقصة للزوجة', bailiff: 'المحضر أحمد أبو المجد', status: 'incomplete', category: 'المستندات والمعاينات' },
  { id: 'm-4', date: '2026-06-30', title: 'المعاينة الميدانية التخصصية للسطح والواجهة وتقدير الأضرار', bailiff: 'الخبير كابتن حسام', status: 'authorized', category: 'تحركات المحضرين الميدانية' },
  { id: 'm-5', date: '2026-07-03', title: 'إلزام محمد الجندي بإزالة اللوحة الإعلانية المخالفة', bailiff: 'المحضر محمود عبد السميع', status: 'authorized', category: 'الإعلام والمنازعات' },
  { id: 'm-6', date: '2026-07-10', title: 'جلسة الحسم الختامية وتوزيع حصص المواريث وصافي تقييم بيت العمرانية', bailiff: 'الدائرة الثالثة بمحكمة الجيزة', status: 'pending', category: 'الأحكام والمواعيد الإجرائية' }
];

export default function ChatVoiceUploadTab({ caseData, onUpdateCaseData, results }: ChatVoiceUploadTabProps) {
  // --- States ---
  const [messages, setMessages] = useState([
    { id: '1', sender: 'assistant', text: 'أهلاً بك كابتن حسام في منصة مصلحة الخبراء القضائية الموحدة لعقار "بيت العمرانية" رقم ٢٧. يمكنك الاستعلام عن التفاصيل الفنية وتدقيق الحدود والخرائط والقرارات الزمنية.', time: '10:00 ص' },
    { id: '2', sender: 'user', text: 'أريد مراجعة الحدود الجغرافية للجانب القبلي لبيت العمرانية والقرارات المعتمدة الخاصة بالمحضرين.', time: '10:02 ص' },
    { id: '3', sender: 'assistant', text: 'طبقاً للسندات، الحد القبلي يقع على شارع شبين الكوم الرئيسي بعرض ٢٠ متراً وهو مطابق لخط التنظيم المعتمد بجيزة العمرانية. وتم إصدار قرار إزالة السطح المتصدع واللوحة المخالفة للمحل (اللون الأخضر للمصرح بها، واللون الأحمر للأوراق الناقصة المطلوبة).', time: '10:03 ص' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recording' | 'calling'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [recordedMemos, setRecordedMemos] = useState<{ id: string; duration: string; date: string; title: string }[]>([
    { id: 'memo-1', duration: '0:45', date: '2026-07-01', title: 'ملاحظة صوتية: تفقد الأعمدة الخرسانية بالدور الرابع' },
    { id: 'memo-2', duration: '1:12', date: '2026-07-02', title: 'إفادة شهادة الجيران بخصوص مدة إقامة ماجدة الجيار' }
  ]);

  // Expert commentary system
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentRole, setNewCommentRole] = useState('خبير مساحة');
  const [newCommentText, setNewCommentText] = useState('');
  const [expertComments, setExpertComments] = useState([
    { id: 'exp-1', name: 'أ.د. مصطفى الشناوي', role: 'رئيس لجنة المنشآت الآيلة للسقوط بالجيزة', text: 'تصدع السطح ناتج عن تآكل حديد التسليح والرطوبة المزمنة. نوصي بالإزالة اليدوية الفورية بحذر تام تجنباً لأي تأثير اهتزازي على أعمدة الدور الرابع.', date: '2026-06-29' },
    { id: 'exp-2', name: 'م. يسرى المنياوي', role: 'خبير التثمين المعتمد بوزارة العدل', text: 'القيمة التقديرية للأرض تزداد بنسبة ١٢% سنوياً نظراً لموقع بيت العمرانية المميز بشارع شبين الكوم التجاري، مما يدعم تسوية الورثة نقدياً بشكل مجزٍ.', date: '2026-06-30' }
  ]);

  // Bailiff Notices & Timeline state
  const [bailiffNotices, setBailiffNotices] = useState<BailiffNotice[]>(INITIAL_NOTICES);
  const [selectedNotice, setSelectedNotice] = useState<BailiffNotice | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  // Manual Bailiff Input Form
  const [customReportTarget, setCustomReportTarget] = useState('notice-2');
  const [customStatusInput, setCustomStatusInput] = useState<'authorized' | 'incomplete'>('authorized');
  const [customNotesInput, setCustomNotesInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);

  // Future directions system (5 shapes)
  const [selectedDirection, setSelectedDirection] = useState<string>('investment');

  // Interactive Map State
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'terrain'>('satellite');
  const [isMapScanning, setIsMapScanning] = useState(false);
  const [mapScanProgress, setMapScanProgress] = useState(0);

  // Adobe Premiere style Timeline state
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(15); // Percentage across the tracks (15% corresponds to June 15)
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<Milestone | null>(null);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const dictationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (voiceMode === 'calling') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [voiceMode]);

  // Map scan progress timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMapScanning) {
      timer = setInterval(() => {
        setMapScanProgress(prev => {
          if (prev >= 100) {
            setIsMapScanning(false);
            triggerToast('اكتمل مسح الأقمار الصناعية المتطور لعقار العمرانية بنجاح!', 'success');
            return 0;
          }
          return prev + 4;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isMapScanning]);

  // Premiere style Playhead animation
  useEffect(() => {
    let playInterval: NodeJS.Timeout;
    if (isTimelinePlaying) {
      playInterval = setInterval(() => {
        setPlayheadPosition(prev => {
          const nextPos = prev + 1;
          if (nextPos >= 95) {
            setIsTimelinePlaying(false);
            triggerToast('انتهى استعراض الشريط الموحد لبيت العمرانية.', 'info');
            return 15; // reset to start
          }
          
          // Trigger toasts as the playhead passes specific milestones
          if (Math.abs(nextPos - 30) < 0.5) {
            triggerToast('مؤشر التفتيش: مررنا بقرار إخلاء السطح الجبري (أخضر - مصرح)', 'success');
          } else if (Math.abs(nextPos - 50) < 0.5) {
            triggerToast('مؤشر التفتيش: مررنا بطلب الأوراق الناقصة لماجدة الجيار (أحمر - مستند ناقص)', 'error');
          } else if (Math.abs(nextPos - 70) < 0.5) {
            triggerToast('مؤشر التفتيش: مررنا بالمعاينة الميدانية التخصصية لكابتن حسام', 'info');
          }
          
          return nextPos;
        });
      }, 120);
    }
    return () => clearInterval(playInterval);
  }, [isTimelinePlaying]);

  // Scroll chat on message append
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Chat actions
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Trigger toast feedback
    triggerToast('تم إرسال استفسارك للمستشار الذكي', 'success');

    // Simulate AI thinking and reply
    setIsTyping(true);
    setTimeout(() => {
      let aiText = 'تلقيت رسالتك الفنية. جاري مراجعة مستندات بيت العمرانية لمطابقتها مع القرار المطلوب وملاحظات المحضرين.';
      
      if (text.includes('الجندي') || text.includes('حكم')) {
        aiText = 'السند الفني المقترح لعقار محمد الجندي (المحل الأرضي): ثبوت عقد إيجار المحل القديم المحرر عام ١٩٩٨ م بقيمة ٢٠٠ ج، لكن بشرط الالتزام بالبند المانع من الإيجار من الباطن وإلغاء اللافتة التجارية المخالفة باللون الأخضر المعتمد فوراً.';
      } else if (text.includes('الجيار') || text.includes('ماجدة')) {
        aiText = 'حالة ملف السيدة ماجدة الجيار (ورثة محمد شلبي): معلقة بلون أحمر بارز لوجود أوراق ناقصة خطيرة (مثل إفادة شرطة العمرانية بالإقامة وعقد زواجها الموثق). لم يصدر أي تصريح امتداد قبل استلام هذه الأوراق من الجهة الحكومية.';
      } else if (text.includes('السطح') || text.includes('١٥٠') || text.includes('150')) {
        aiText = 'بالنسبة لتكلفة إزالة السطح (الـ ١٥٠ ألف جنيه): تقرر بشكل معتمد إلزام ورثة المستأجر محمد شلبي بتحمل نسبة من تكلفة التدهور الناشئ عن سوء الاستخدام مع إلزام المؤجرة عليه الوكيل بالجزء الآخر نتيجة عيوب التأسيس والخرسانة.';
      } else if (text.includes('مواصفات') || text.includes('العمرانية')) {
        aiText = `مواصفات العقار رقم ٢٧ العمرانية: المساحة الإجمالية ${caseData.landArea} م²، العرض الجغرافي ${caseData.latitude}، ويتكون من ٥ طوابق. القيمة الإنشائية الكلية التقديرية تعادل ${results ? results.constructionCost.toLocaleString('ar-EG') : '٣,٤٠٠,٠٠٠'} ج.`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: aiText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
      triggerToast('رد المستشار الفني جاهز للقراءة', 'info');
    }, 1500);
  };

  const handleToggleRecord = () => {
    if (voiceMode === 'recording') {
      setVoiceMode('idle');
      // Add fake audio record
      const newMemo = {
        id: `memo-${Date.now()}`,
        duration: '0:38',
        date: new Date().toISOString().split('T')[0],
        title: `تسجيل صوتي ميداني كابتن حسام #${recordedMemos.length + 1}`
      };
      setRecordedMemos(prev => [newMemo, ...prev]);
      triggerToast('تم تسجيل المذكرة الصوتية وحفظها بنجاح', 'success');
    } else {
      setVoiceMode('recording');
      triggerToast('جاري تسجيل صوت كابتن حسام... انقر مجدداً للإيقاف والحفظ', 'info');
    }
  };

  const handleStartVoiceCall = () => {
    if (voiceMode === 'calling') {
      setVoiceMode('idle');
      triggerToast('انتهى الاتصال المباشر مع المستشار الفني والمحضرين.', 'info');
    } else {
      setVoiceMode('calling');
      triggerToast('جاري إنشاء اتصال صوتي قضائي مشفر ومباشر...', 'success');
    }
  };

  const handleDeleteMemo = (id: string) => {
    setRecordedMemos(prev => prev.filter(m => m.id !== id));
    triggerToast('تم حذف المذكرة الصوتية بنجاح.', 'warning');
  };

  // Add expert opinion
  const handleAddExpertComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) {
      triggerToast('فضلاً املأ اسم الخبير ورأيه الفني بالكامل.', 'warning');
      return;
    }
    const newComment = {
      id: `exp-${Date.now()}`,
      name: newCommentName,
      role: newCommentRole,
      text: newCommentText,
      date: new Date().toISOString().split('T')[0]
    };
    setExpertComments(prev => [newComment, ...prev]);
    setNewCommentName('');
    setNewCommentText('');
    triggerToast(`تم إيداع تقرير الخبير ${newCommentName} في السجل المشفر للمحكمة`, 'success');
  };

  // Pre-fill comment inputs
  const selectExpertRoleTemplate = (name: string, role: string, comment: string) => {
    setNewCommentName(name);
    setNewCommentRole(role);
    setNewCommentText(comment);
    triggerToast(`تم ملء بيانات الخبير ${name} تلقائياً.`, 'info');
  };

  // Bailiff Form Manual Submit / Voice dictation simulation
  const handleBailiffReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotesInput.trim()) {
      triggerToast('يرجى كتابة التوجيه الفني أو إملاء التقرير تلقائياً.', 'warning');
      return;
    }

    // Update notice status & description
    setBailiffNotices(prev => prev.map(n => {
      if (n.id === customReportTarget) {
        return {
          ...n,
          status: customStatusInput,
          description: customNotesInput,
          missingPapers: customStatusInput === 'incomplete' ? [
            'صورة رسمية من الحكم الابتدائي موثقة بختم النسر.',
            'كروكي مصلحة المساحة للحد الشرقي لبيت العمرانية.'
          ] : undefined
        };
      }
      return n;
    }));

    // Add milestone activity reflecting this
    const targetNotice = bailiffNotices.find(n => n.id === customReportTarget);
    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: `تحديث يدوي: ${targetNotice ? targetNotice.title : 'محضر قضائي جديد'}`,
      bailiff: 'كابتن حسام (الخبير المعين)',
      status: customStatusInput === 'authorized' ? 'authorized' : 'incomplete',
      category: 'تحركات المحضرين الميدانية'
    };
    setMilestones(prev => [newMilestone, ...prev]);

    // Push into Chat
    const noticeName = targetNotice ? targetNotice.title : 'الملف الفني';
    const statusText = customStatusInput === 'authorized' ? 'تم اعتماده وتصريحه باللون الأخضر' : 'تم تعليقه باللون الأحمر لعدم اكتمال السندات';
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      sender: 'assistant',
      text: `📢 تحديث فني معتمد من كابتن حسام: لقد تم تعديل حالة الإجراء الميداني لـ "${noticeName}" إلى [${statusText}].\n\nالتقرير الفني المودع: "${customNotesInput}"`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);

    setCustomNotesInput('');
    triggerToast('تم توجيه المحضرين وتحديث الخريطة الزمنية وحفظ التغييرات محلياً!', 'success');
  };

  // Simulated continuous voice dictation (إملاء ذكي)
  const handleToggleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
      triggerToast('تم إيقاف الإملاء والنسخ بنجاح.', 'success');
    } else {
      setIsDictating(true);
      triggerToast('توجيه الميكروفون نشط: تحدث الآن ليتم الإملاء الأوتوماتيكي للتقرير الفني الموجه للمحضرين...', 'info');
      
      const textChunks = [
        "أقر أنا كابتن حسام، الخبير المعين من وزارة العدل، ",
        "بأنه قد تم الانتقال ومعاينة بيت العمرانية رقم ٢٧ ميدانياً، ",
        "وثبت لدينا تصدع جزئي بالسقف الخرساني للطابق الخامس ",
        "مما يهدد سلامة الجيران، وبناءً عليه نقرر تفعيل قرار الإخلاء الفوري الجبري باللون الأخضر المعتمد للمصلحة الإنشائية.",
        " وتم لفت نظر ورثة محمد شلبي لسرعة استيفاء المستندات المطلوبة للزوجة ماجدة الجيار."
      ];
      
      let chunkIdx = 0;
      setCustomNotesInput('');
      
      dictationTimerRef.current = setInterval(() => {
        if (chunkIdx < textChunks.length) {
          setCustomNotesInput(prev => prev + textChunks[chunkIdx]);
          chunkIdx++;
        } else {
          setIsDictating(false);
          if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
          triggerToast('تم نسخ وإملاء تقرير المحضر الكامل بنجاح من صوت الخبير!', 'success');
        }
      }, 1500);
    }
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    };
  }, []);

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      triggerToast(`جاري معالجة ورفع الملف "${file.name}" للشات...`, 'info');
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `file-${Date.now()}`,
          sender: 'user',
          text: `📁 قمت بإرفاق المرفق المكتبي: ${file.name} (تمت فهرسته وفحصه قضائياً بنجاح وتوجيهه لوزارة العدل)`,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }]);
        triggerToast(`تم تحميل وتدقيق "${file.name}" بنجاح ضمن ملف القضية الرئيسي!`, 'success');
      }, 1000);
    }
  };

  // Future directions data based on selected tab
  const getFutureDirectionDetails = () => {
    switch (selectedDirection) {
      case 'investment':
        return {
          title: 'الاستثمار العقاري والتطوير التجاري المستدام',
          roi: '١٨.٥٪ عائد سنوي متوقع',
          cost: '٤,٢٠٠,٠٠٠ جنيه مصري للإنشاء والتشطيب',
          feasibility: '٩٤٪ جدوى فنية ومالية (مصرح ومطابق)',
          partners: 'مجموعة أوراسكوم للتنمية ومقاولون محليون معتمدون',
          timeline: '١٢ شهراً من تاريخ إخلاء السطح والتمكين الكلي',
          status: 'authorized',
          desc: 'تحويل الطابق الأرضي لثلاثة محال تجارية فاخرة وتطوير الروف الخرساني بعد ترميمه كمنتجع صحي أو مساحة عمل رقمية مدرة للعوائد الدورية لصالح المؤجر والورثة بالتساوي.',
          metrics: [
            { label: 'العائد المتوقع شهرياً', value: '٤٥,٠٠٠ ج' },
            { label: 'فترة استرداد رأس المال', value: '٥.٤ سنوات' },
            { label: 'نسبة الإشغال المقدرة بالمنطقة', value: '٩٧٪' }
          ]
        };
      case 'financing':
        return {
          title: 'التمويل العقاري والقروض البنكية لتطوير الهيكل',
          roi: '١٢.٥٪ نسبة الفائدة البنكية التنافسية',
          cost: 'تمويل مستهدف بقيمة ٤.٥ مليون جنيه مصري',
          feasibility: '٦٨٪ (معلق لعدم استيفاء الأوراق الرسمية لماجدة الجيار)',
          partners: 'البنك الأهلي المصري وبنك مصر (برامج دعم التمويل العقاري والترميم الإنشائي)',
          timeline: 'تسهيلات سداد ممتدة على ١٥ سنة بأقساط متناقصة شهرياً',
          status: 'incomplete',
          desc: 'تمويل ترميم أعمدة الطابق الرابع وصيانة الخرسانة المتهالكة لبيت العمرانية. التمويل معلق حالياً بلون أحمر لعدم استيفاء عقد الإيجار الأصلي وصورة رسمية معتمدة من إعلام الوراثة وإفادة قسم شرطة العمرانية.',
          metrics: [
            { label: 'القسط الشهري المقدر', value: '٣٢,٠٠٠ ج' },
            { label: 'الضمانات الفنية المطلوبة', value: 'أصل سند الملكية' },
            { label: 'موقف المعالجة المالية', value: 'مستند ناقص (أحمر)' }
          ]
        };
      case 'engineering':
        return {
          title: 'الشركات الهندسية وصيانة الهيكل والسطح',
          roi: 'تحسين جودة الأمان الإنشائي للعقار بنسبة ١٠٠٪',
          cost: '٤٥٠,٠٠٠ ج كلفة الإزالة الكلية والترميم',
          feasibility: '٨٩٪ (مصرح به هندسياً مع رخصة إزالة سارية)',
          partners: 'المكتب الاستشاري لجامعة القاهرة وشركة المقاولون العرب للترميم الإنشائي',
          timeline: '٤٥ يوماً من تصفية الممتلكات وتفريغ السطح من الشواغر',
          status: 'authorized',
          desc: 'الخطة الهندسية المقترحة تقر بإزالة السقف العلوي المتصدع يدوياً بالكامل مع تدعيم الأعمدة الحاملة المتهالكة بالخرسانة المسلحة القوية وأسياخ الحديد لتفادي سقوط المبنى ورفع قيمته السوقية بنسبة ٤٠٪.',
          metrics: [
            { label: 'كلفة المواد الخام والحديد', value: '٢٨٠,٠٠٠ ج' },
            { label: 'فريق العمل الميداني', value: '١٢ فني ومهندس' },
            { label: 'موقف تصريح الحي', value: 'مصرح به (أخضر)' }
          ]
        };
      case 'management':
        return {
          title: 'إدارة وتسيير وتشغيل بيت العمرانية الرقمي',
          roi: 'صفر٪ جهد إداري للمالك (إسناد كامل)',
          cost: 'عمولة إدارية تبلغ ١٠٪ من صافي الإيراد الشهري للعين',
          feasibility: '٩٥٪ (خيار تشغيلي جاهز للتطبيق الفوري)',
          partners: 'شركة مصر لإدارة الأصول العقارية وصندوق التنمية العقارية لحي الجيزة',
          timeline: 'عقد إدارة سنوي متجدد تلقائياً بالتزامن مع تسليم الغرف السكنية والمحال',
          status: 'authorized',
          desc: 'إسناد إدارة عقار العمرانية لشركة متخصصة تضمن تحصيل الإيجارات الشهرية، ومتابعة الصيانة الدورية للأعمدة والمصاعد، وفض النزاعات القائمة بطرق قانونية مستدامة دون حاجة لتدخل الورثة شخصياً.',
          metrics: [
            { label: 'معدل الحفاظ على العين الفني', value: '٩٨٪' },
            { label: 'معدل التحصيل التلقائي', value: '١٠٠٪ شهرياً' },
            { label: 'تكلفة المتابعة والمحاماة', value: 'مغطاة بالعمولة' }
          ]
        };
      case 'environmental':
        return {
          title: 'التأثير البيئي، الحفاظ الحضري والاستدامة',
          roi: 'تحول العقار لمنشأة مستدامة خضراء بالكامل',
          cost: '١٥٠,٠٠٠ ج لشراء مصفوفات الطاقة الشمسية وتدوير المخلفات الخشبية للسطح',
          feasibility: '٥٠٪ (معلق ومطلوب ترخيص الطاقة الخضراء من حي العمرانية الغربية)',
          partners: 'هيئة الطاقة الجديدة والمتجددة والمجلس الأعلى للتنسيق الحضري لجمهورية مصر العربية',
          timeline: '٦ أشهر لإنهاء التركيب والربط بشبكة الكهرباء العامة بالجيزة',
          status: 'incomplete',
          desc: 'تجهيز السطح المزال بنظام متقدم لتوليد الطاقة الكهربائية النظيفة من الخلايا الشمسية لإنارة الواجهة، السلالم، ومضخة المياه المشتركة لبيت العمرانية. الترخيص معلق بلون أحمر لعدم توفر المخطط الكهربائي المعتمد والموقع من استشاري نقابي.',
          metrics: [
            { label: 'التوفير في فواتير الكهرباء', value: '٨٥٪ سنوياً' },
            { label: 'الحد من الانبعاثات الكربونية', value: '١٤ طن سنوياً' },
            { label: 'موقف رخصة الاستدامة', value: 'غير مكتمل (أحمر)' }
          ]
        };
      default:
        return {};
    }
  };

  const directionData = getFutureDirectionDetails();

  // Coordinates hotspots to click and update the case
  const updateToHotspot = (lat: number, lng: number, desc: string) => {
    onUpdateCaseData({
      ...caseData,
      latitude: lat,
      longitude: lng
    });
    triggerToast(`تم تحديث إحداثيات بيت العمرانية جغرافياً بنجاح: ${desc}`, 'success');
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* ==========================================
          HEADER TITLE & METRICS BAR (Neon Glowing UI)
          ========================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-1 z-10 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#00f0ff]"></span>
            <span className="text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full font-black tracking-wider">منصة التحقق الزمني والميداني الموحد</span>
          </div>
          <h1 className="text-white text-xl font-black tracking-tight mt-1.5">المركز الفني والزمني لبيت العمرانية العقاري</h1>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            مراجعة الخرائط والحدود، نظام المحضرين والتعليمات، وتدقيق شريط الأحداث الزمني والملفات الموثقة بقضية النزاع العقدي والمواريث.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 z-10 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <div className="flex flex-col text-center">
            <span className="text-slate-500 text-[10px] font-black">رقم القضية النشط</span>
            <span className="text-white font-mono text-xs font-black mt-0.5">{caseData.caseNumber}</span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex flex-col text-center">
            <span className="text-slate-500 text-[10px] font-black">حالة الحدود والخرائط</span>
            <span className="text-emerald-400 text-xs font-black mt-0.5 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>مؤمنة ونشطة</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex flex-col text-center">
            <span className="text-slate-500 text-[10px] font-black">مصلحة الخبراء</span>
            <span className="text-cyan-400 text-xs font-black mt-0.5">وزارة العدل</span>
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 1: UNIFIED MAP, COORDINATES & FUTURE DIRECTIONS (Bento Grid Row 1)
          ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Right side (7 Columns): Interactive Map Canvas & GPS Status */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Satellite className={`w-5 h-5 text-cyan-400 ${isMapScanning ? 'animate-spin shadow-[0_0_8px_#00f0ff]' : ''}`} />
              <div>
                <h3 className="text-white text-sm font-black">خارطة التحليل الجغرافي ونظم التمكين والموقع الرقمي</h3>
                <p className="text-[10px] text-slate-500 font-bold">رصد طوبوغرافي مباشر ومطابقة مع السجلات المساحية لجمهورية مصر العربية</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button 
                onClick={() => setMapLayer('satellite')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${mapLayer === 'satellite' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                قمر صناعي
              </button>
              <button 
                onClick={() => setMapLayer('streets')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${mapLayer === 'streets' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                شوارع
              </button>
              <button 
                onClick={() => setMapLayer('terrain')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${mapLayer === 'terrain' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                تضاريس
              </button>
            </div>
          </div>

          {/* Map canvas frame */}
          <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 relative overflow-hidden h-[330px] flex flex-col justify-between shadow-inner">
            
            {/* Map Canvas Background Vector representation */}
            <div className="absolute inset-0 z-0">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:25px_25px] opacity-20"></div>
              
              <svg className="w-full h-full" viewBox="0 0 500 350">
                {/* Simulated Nile River on satellite */}
                <path 
                  d="M 180 0 Q 220 100 200 180 T 230 350" 
                  fill="none" 
                  stroke={mapLayer === 'satellite' ? '#172554' : '#1d4ed8'} 
                  strokeWidth="32" 
                  opacity="0.5"
                  className="transition-colors duration-500"
                />
                <path 
                  d="M 180 0 Q 220 100 200 180 T 230 350" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="8" 
                  opacity="0.4"
                />

                {/* Major streets & urban grids in Dokki / Giza */}
                <g stroke={mapLayer === 'satellite' ? '#334155' : '#64748b'} strokeWidth="1.5" opacity="0.35">
                  <line x1="0" y1="90" x2="500" y2="120" />
                  <line x1="0" y1="230" x2="500" y2="210" />
                  <line x1="90" y1="0" x2="130" y2="350" />
                  <line x1="390" y1="0" x2="360" y2="350" />
                  <circle cx="105" cy="100" r="45" fill="none" strokeWidth="1" strokeDasharray="4,4" />
                </g>

                {/* Built-up blocks (Dokki housing layout) */}
                {mapLayer === 'satellite' ? (
                  <g fill="#065f46" opacity="0.15">
                    <rect x="20" y="30" width="60" height="40" rx="4" />
                    <rect x="250" y="40" width="100" height="90" rx="4" />
                    <rect x="30" y="250" width="80" height="70" rx="4" />
                    <rect x="240" y="240" width="110" height="80" rx="4" />
                  </g>
                ) : mapLayer === 'terrain' ? (
                  <g stroke="#854d0e" fill="none" opacity="0.18" strokeWidth="1.2">
                    <path d="M 30 50 C 70 60 80 40 100 60 S 120 90 140 80" />
                    <path d="M 20 60 C 60 70 70 50 90 70 S 110 100 130 90" />
                    <path d="M 340 220 C 370 210 390 230 410 220 S 430 190 450 200" />
                  </g>
                ) : null}

                {/* Simulated Target Property Polygon with glowing neon border */}
                <g transform="translate(210, 160)">
                  <polygon 
                    points="-25,-25 35,-15 25,35 -35,15" 
                    fill={isMapScanning ? 'rgba(6, 182, 212, 0.3)' : 'rgba(16, 185, 129, 0.18)'} 
                    stroke={isMapScanning ? '#00f0ff' : '#10b981'} 
                    strokeWidth="3"
                    className="animate-pulse cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    onClick={() => triggerToast('عقار بيت العمرانية رقم ٢٧ - المساحة الإجمالية معينة هندسياً', 'info')}
                  />
                  
                  {/* Glowing vertical target scanner laser line */}
                  {isMapScanning && (
                    <line 
                      x1="-120" 
                      y1={(mapScanProgress * 2.4) - 120} 
                      x2="120" 
                      y2={(mapScanProgress * 2.4) - 120} 
                      stroke="#00f0ff" 
                      strokeWidth="2.5" 
                      className="shadow-[0_0_10px_#00f0ff] filter drop-shadow-[0_0_5px_#00f0ff]"
                      opacity="0.9" 
                    />
                  )}

                  {/* Red bouncing GPS pin */}
                  <g transform="translate(0,-5)" className="animate-bounce">
                    <path d="M0 -12 C-6 -12 -10 -8 -10 -2 C-10 6 0 16 0 16 C0 16 10 6 10 -2 C10 -8 6 -12 0 -12 Z" fill="#ef4444" />
                    <circle cx="0" cy="-2" r="3.5" fill="#ffffff" />
                    <circle cx="0" cy="12" r="10" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                  </g>
                </g>

                {/* Coordinate Markers on Map corners */}
                <text x="15" y="335" fill="#475569" fontSize="8" fontFamily="monospace">GRID REG: EG-GIZA-C27</text>
                <text x="320" y="335" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace" className="shadow-sm">
                  {caseData.latitude.toFixed(5)}° N, {caseData.longitude.toFixed(5)}° E
                </text>
              </svg>
            </div>

            {/* Floating Top Telemetry Box */}
            <div className="z-10 bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 text-[10px] font-mono shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-white font-bold">GPS LOCK_ON</span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400">سماحية الدقة: ±٣.٢ سم</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">الأقمار المتصلة: ٨ إشارات عسكرية</span>
            </div>

            {/* Scanning progress display */}
            {isMapScanning && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 mx-auto max-w-[240px] bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3.5 text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur">
                <span className="text-cyan-400 text-xs font-black block mb-1.5 animate-pulse">جاري التحليل الطبوغرافي الرقمي...</span>
                <span className="text-white text-xs font-mono font-bold block mb-1">{mapScanProgress}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-75" style={{ width: `${mapScanProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Bottom Controls / Scan Trigger Button & Clickable coordinate hotspots */}
            <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur p-2 rounded-xl border border-slate-850">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <span className="text-[9px] text-slate-500 font-bold ml-1 shrink-0">معاينات سريعة:</span>
                <button 
                  onClick={() => updateToHotspot(29.9912, 31.1425, 'عقار بيت العمرانية الكلي')}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-cyan-400 text-[9px] px-2 py-1 rounded border border-slate-800 shrink-0 cursor-pointer"
                >
                  📍 موقع العقار الرئيسي
                </button>
                <button 
                  onClick={() => updateToHotspot(29.9925, 31.1412, 'مدخل شارع شبين الكوم')}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-cyan-400 text-[9px] px-2 py-1 rounded border border-slate-800 shrink-0 cursor-pointer"
                >
                  🛣️ مدخل شارع شبين الكوم
                </button>
                <button 
                  onClick={() => updateToHotspot(29.9902, 31.1438, 'قسم شرطة العمرانية (جهة الاستدعاء)')}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-cyan-400 text-[9px] px-2 py-1 rounded border border-slate-800 shrink-0 cursor-pointer"
                >
                  👮 شرطة العمرانية
                </button>
              </div>

              <button
                onClick={() => {
                  setIsMapScanning(true);
                  setMapScanProgress(0);
                  triggerToast('بدء فحص ومطابقة الأقمار الصناعية لبيت العمرانية والقطاع العقاري بالجيزة.', 'info');
                }}
                disabled={isMapScanning}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-[10px] px-3.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <RefreshCw className={`w-3 h-3 ${isMapScanning ? 'animate-spin' : ''}`} />
                <span>مسح الـ GPS الفني</span>
              </button>
            </div>

          </div>

          {/* Quick coordinates readout form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] text-slate-500 font-bold">العرض الجغرافي (Latitude)</span>
              <span className="text-white text-xs font-mono font-black">{caseData.latitude.toFixed(6)}°</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] text-slate-500 font-bold">الطول الجغرافي (Longitude)</span>
              <span className="text-white text-xs font-mono font-black">{caseData.longitude.toFixed(6)}°</span>
            </div>
            <div className="flex flex-col gap-1 text-right sm:border-r sm:border-slate-850 sm:pr-3">
              <span className="text-[10px] text-slate-500 font-bold">نطاق البلوك المساحي</span>
              <span className="text-cyan-400 text-xs font-mono font-black">EG-GIZA-BLOCK{Math.floor(caseData.latitude)}</span>
            </div>
          </div>
        </div>

        {/* Left side (5 Columns): Futuristic 5-Step Strategic Future Directions System */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart4 className="w-5 h-5 text-amber-500 shadow-[0_0_6px_#f59e0b]" />
              <div>
                <h3 className="text-white text-sm font-black">نظام الاتجاه المستقبلي والنمو الخماسي للعقار</h3>
                <p className="text-[10px] text-slate-500 font-bold">استشراف العوائد الاستثمارية، الصيانة، والإدارة الرقمية للأصول</p>
              </div>
            </div>
          </div>

          {/* Connected 5 Shapes Map Layout (A visual diagram of 5 bento-nodes connected with lines) */}
          <div className="relative py-2.5 flex items-center justify-center">
            {/* SVG Connecting lines between nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 150">
              <path 
                d="M 35 75 Q 75 25 150 75 T 265 75" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="3.5" 
              />
              <path 
                d="M 35 75 Q 75 25 150 75 T 265 75" 
                fill="none" 
                stroke={directionData.status === 'authorized' ? '#10b981' : '#ef4444'} 
                strokeWidth="1.5" 
                strokeDasharray="6,4"
                className="animate-[dash_10s_linear_infinite]"
              />
            </svg>

            {/* Circular Connected Bento Nodes */}
            <div className="flex items-center justify-between w-full max-w-sm z-10">
              {[
                { id: 'investment', icon: '🏢', label: 'الاستثمار', desc: 'تطوير عقاري' },
                { id: 'financing', icon: '💰', label: 'التمويل', desc: 'قروض وبنوك' },
                { id: 'engineering', icon: '🛠️', label: 'الهندسة', desc: 'ترميم وصيانة' },
                { id: 'management', icon: '📋', label: 'الإدارة', desc: 'تسيير وتشغيل' },
                { id: 'environmental', icon: '🌱', label: 'الاستدامة', desc: 'طاقة ومجلس' },
              ].map((node) => {
                const isSelected = selectedDirection === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedDirection(node.id);
                      triggerToast(`عرض مصفوفة: ${node.label} المستقبلي لعقار العمرانية`, 'info');
                    }}
                    className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-amber-500 border-2 border-slate-950 text-slate-950 shadow-[0_0_15px_#f59e0b] scale-110 font-black' 
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-400 hover:scale-105'
                    }`}
                  >
                    <span className="text-base">{node.icon}</span>
                    <span className="text-[8px] font-black mt-0.5 leading-none">{node.label}</span>
                    
                    {/* Tiny pulsing status dot inside each node */}
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                      node.id === 'financing' || node.id === 'environmental' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Direction Detail Panel with Neon glow based on state */}
          <div className={`p-4 rounded-2xl border transition-all ${
            directionData.status === 'authorized'
              ? 'bg-emerald-950/40 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-red-950/40 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                directionData.status === 'authorized' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {directionData.status === 'authorized' ? '● مصرح ومطابق إنشائياً' : '● معلق / مستند مطلوب وناقص'}
              </span>
              <span className="text-slate-500 font-mono text-[9px] font-black">DIRECTION METRIC v1</span>
            </div>

            <h4 className="text-white text-xs font-black mb-1 flex items-center gap-1">
              <span>{directionData.title}</span>
            </h4>
            <p className="text-[10.5px] text-slate-300 leading-relaxed mb-3.5 font-medium">
              {directionData.desc}
            </p>

            {/* Sub-grids metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500 text-[9px] font-bold block">العوائد والمميزات</span>
                <span className="text-amber-400 text-xs font-black mt-0.5 block">{directionData.roi}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-900">
                <span className="text-slate-500 text-[9px] font-bold block">الكلفة التقديرية</span>
                <span className="text-white text-xs font-mono font-black mt-0.5 block">{directionData.cost}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-2.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">الشركاء المقترحون:</span>
                <span className="text-white font-black">{directionData.partners}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">الجدول الزمني للتنفيذ:</span>
                <span className="text-white font-black">{directionData.timeline}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">مؤشر الجدوى والاعتماد:</span>
                <span className={directionData.status === 'authorized' ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>
                  {directionData.feasibility}
                </span>
              </div>
            </div>

            {/* Embedded 3 mini-meters for infographics */}
            <div className="grid grid-cols-3 gap-1.5 mt-3.5 pt-3 border-t border-slate-800/50">
              {directionData.metrics.map((met, i) => (
                <div key={i} className="bg-slate-950/40 p-2 rounded-lg text-center border border-slate-900/60">
                  <span className="text-slate-500 text-[8.5px] font-bold block leading-tight">{met.label}</span>
                  <span className="text-white text-[10.5px] font-black mt-0.5 block">{met.value}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          SECTION 2: COURT BAILIFFS INSTRUCTIONS & MANUAL REPORT DESK (Bento Grid Row 2)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right side (6 Columns): Instruction manuals for bailiffs with green (approved) and red (missing) coding */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400 animate-pulse shadow-[0_0_6px_#ef4444]" />
              <div>
                <h3 className="text-white text-sm font-black">لوحة الإخطارات والمطالب القضائية للمحضرين</h3>
                <p className="text-[10px] text-slate-500 font-bold">القرارات المصرح بها (أخضر)، والمستندات الحكومية الناقصة المطلوبة (أحمر)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
            {bailiffNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => {
                  setSelectedNotice(notice);
                  triggerToast(`فتح تفاصيل إخطار: ${notice.title}`, 'info');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  notice.status === 'authorized'
                    ? 'bg-emerald-950/30 border-emerald-500/25 hover:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                    : 'bg-red-950/30 border-red-500/25 hover:border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.05)]'
                }`}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${
                  notice.status === 'authorized' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                }`}></div>

                <div className="flex justify-between items-start gap-4 pr-3.5 mb-1.5">
                  <h4 className="text-white text-xs font-black leading-snug">{notice.title}</h4>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-black tracking-wide shrink-0 ${
                    notice.status === 'authorized' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}>
                    {notice.status === 'authorized' ? 'مصرح ونشط' : 'أوراق ناقصة'}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-relaxed pr-3.5 line-clamp-2">
                  {notice.description}
                </p>

                {notice.missingPapers && (
                  <div className="mt-2.5 mr-3.5 bg-red-950/50 p-2.5 rounded-xl border border-red-950/80 text-[10px] text-red-300 space-y-1">
                    <span className="font-black flex items-center gap-1 text-[10px] text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>المستندات الحكومية الناقصة والمطلوبة فوراً:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 pr-2">
                      {notice.missingPapers.slice(0, 2).map((paper, idx) => (
                        <li key={idx} className="truncate">• {paper}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold mt-2.5 pr-3.5">
                  <span>📅 تاريخ الإخطار: {notice.date}</span>
                  <span className="text-slate-400">{notice.bailiff}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left side (6 Columns): Bailiff Manual Form & Dictation Console */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-white text-sm font-black">منصة التوجيه والإدخال التلقائي للمحضرين</h3>
                <p className="text-[10px] text-slate-500 font-bold">صياغة محاضر المعاينة يدوياً أو بواسطة الإملاء الصوتي الذكي (AI Auto Dictation)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleBailiffReportSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-right">
                <label className="text-slate-400 text-[10.5px] font-bold">الإجراء المستهدف لتغيير حالته</label>
                <select
                  value={customReportTarget}
                  onChange={e => setCustomReportTarget(e.target.value)}
                  className="bg-slate-950 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-2.5 focus:outline-none transition-all text-right font-semibold cursor-pointer"
                >
                  {bailiffNotices.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <label className="text-slate-400 text-[10.5px] font-bold">حالة التوجيه القضائي الفني</label>
                <select
                  value={customStatusInput}
                  onChange={e => setCustomStatusInput(e.target.value as 'authorized' | 'incomplete')}
                  className="bg-slate-950 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-2.5 focus:outline-none transition-all text-right font-semibold cursor-pointer"
                >
                  <option value="authorized">مصرح ومعتمد (أخضر)</option>
                  <option value="incomplete">مستندات وأوراق ناقصة (أحمر)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-right relative">
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-slate-400 text-[10.5px] font-bold">التقرير الفني وتوجيه الخبير (أو تحدث ليتم النسخ)</label>
                
                {/* Continuous Voice Dictation trigger */}
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  className={`text-[9.5px] font-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                    isDictating 
                      ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_10px_#ef4444]' 
                      : 'bg-slate-950 border-slate-800 text-cyan-400 hover:text-cyan-300'
                  }`}
                  title={isDictating ? "إيقاف الإملاء الصوتي" : "بدء إملاء صوتي فني"}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isDictating ? "جاري النسخ والكتابة..." : "إملاء ذكي وصوت مسموع"}</span>
                </button>
              </div>

              {/* Dictating continuous waves graphics if active */}
              {isDictating && (
                <div className="absolute left-3 top-9 z-10 flex items-center gap-1 bg-slate-950/90 border border-cyan-500/20 px-2 py-1 rounded-lg">
                  <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full"></span>
                  <span className="w-1 h-5 bg-cyan-400 animate-pulse delay-75 rounded-full"></span>
                  <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-150 rounded-full"></span>
                  <span className="text-[9px] text-cyan-400 font-mono font-bold">DICTATION ACTIVE</span>
                </div>
              )}

              <textarea
                value={customNotesInput}
                onChange={e => setCustomNotesInput(e.target.value)}
                rows={4}
                placeholder="اكتب توجيهاتك الفنية للمحضرين، أو انقر على 'إملاء ذكي' للتحدث عبر الميكروفون ليقوم النظام المساعد بنسخها تلقائياً بكلمات تخصصية بالكامل..."
                className="bg-slate-950 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-3 focus:outline-none transition-all text-right leading-relaxed font-semibold"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[10px] text-slate-500 font-bold">سيتم دمج التقرير وإخطار المحضرين فور الحفظ.</span>
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>حفظ التوجيه واعتماد التحديث</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ==========================================
          SECTION 3: ADOBE PREMIERE PRO STYLE TIMELINE & UNPACKED MILLSTONE TABLE (Section 3)
          ========================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-6">
        
        {/* Header containing the "Premiere style" timeline title & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-white text-sm font-black">شريط الزمن الاستوديو لبيت العمرانية (Adobe Premiere Style Timeline)</h3>
              <p className="text-[10px] text-slate-500 font-bold">تتبع تقدم الخصوم والمحضرين في مسارات زمنية أفقية متزامنة مع قاضي التنفيذ</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-850 self-start sm:self-center">
            {/* Timeline Play/Pause button */}
            <button
              onClick={() => {
                setIsTimelinePlaying(!isTimelinePlaying);
                triggerToast(isTimelinePlaying ? 'تم إيقاف استعراض شريط الزمن الموحد' : 'بدء تشغيل شريط الزمن الموحد... انظر لحركة المؤشر الحمراء', 'info');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isTimelinePlaying 
                  ? 'bg-red-500 text-white shadow-[0_0_10px_#ef4444]' 
                  : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              }`}
            >
              {isTimelinePlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>شغّل شريط الزمن</span>
                </>
              )}
            </button>

            {/* Reset Playhead */}
            <button
              onClick={() => {
                setPlayheadPosition(15);
                setIsTimelinePlaying(false);
                setSelectedTimelineEvent(null);
                triggerToast('تم إعادة تعيين مؤشر الزمن لنقطة البداية (١٥ يونيو).', 'info');
              }}
              className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
              title="إعادة تعيين المؤشر"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* -------------------------------------------
            THE ADOBE PREMIERE PRO MULTI-TRACK HORIZONTAL TIMELINE PANEL
            ------------------------------------------- */}
        <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 overflow-hidden relative shadow-inner">
          
          {/* Timecode Header Ruler */}
          <div className="flex border-b border-slate-800 pb-2 mb-3 select-none">
            {/* Track controls margin */}
            <div className="w-36 text-slate-600 text-[10px] font-mono font-bold text-center pl-4 border-l border-slate-850/60 shrink-0">TRACK PREFERENCES</div>
            {/* Horizontal dates/time ruler */}
            <div className="flex-1 flex justify-between px-6 text-[10px] font-mono text-slate-400 relative">
              <span>١٥ يونيو<br/>00:00:15:00</span>
              <span>٢٠ يونيو<br/>00:00:20:00</span>
              <span>٢٥ يونيو<br/>00:00:25:00</span>
              <span>٣٠ يونيو<br/>00:00:30:00</span>
              <span>٠٥ يوليو<br/>00:00:35:00</span>
              <span>١٠ يوليو<br/>00:00:40:00</span>
            </div>
          </div>

          {/* Premiere Style Tracks */}
          <div className="space-y-2 relative">
            
            {/* MOVING RED PLAYHEAD (قلم القراءة الزمني المتنقل) */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 transition-all duration-100 pointer-events-none shadow-[0_0_8px_#ef4444]"
              style={{ right: `calc(${playheadPosition}% + 144px - 10px)` }}
            >
              {/* Playhead Indicator Handlebar at top */}
              <div className="absolute top-[-8px] right-[-5px] w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-[0_0_5px_#ef4444]">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>

            {/* TRACK 1: الأحكام والمواعيد الإجرائية */}
            <div className="flex items-center">
              {/* Track Info Side Control */}
              <div className="w-36 bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-400 font-black flex items-center justify-between shrink-0 pl-3">
                <span className="truncate">الأحكام والمواعيد</span>
                <div className="flex gap-1">
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-cyan-400">M</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-amber-400">S</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center border border-slate-800 cursor-pointer text-slate-500"><Lock className="w-2.5 h-2.5" /></span>
                </div>
              </div>
              {/* Track Content Area */}
              <div className="flex-1 bg-slate-950/40 h-11 mx-2.5 rounded-xl border border-slate-900 relative">
                {/* Milestone Node 1 (June 15) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[0])}
                  className="absolute right-[15%] w-[18%] bg-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105"
                >
                  <span className="truncate">إيداع مذكرة النزاع</span>
                  <span className="text-[8px] opacity-65 font-mono">١٥ يونيو</span>
                </button>

                {/* Milestone Node 2 (June 20) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[1])}
                  className="absolute right-[40%] w-[18%] bg-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105"
                >
                  <span className="truncate">قرار إخلاء السطح</span>
                  <span className="text-[8px] opacity-65 font-mono">٢٠ يونيو</span>
                </button>

                {/* Milestone Node 6 (July 10) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[5])}
                  className="absolute right-[82%] w-[15%] bg-blue-950/70 border border-blue-500/40 hover:border-blue-400 text-blue-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105"
                >
                  <span className="truncate">جلسة الحسم الختامية</span>
                  <span className="text-[8px] opacity-65 font-mono">١٠ يوليو</span>
                </button>
              </div>
            </div>

            {/* TRACK 2: تحركات المحضرين الميدانية */}
            <div className="flex items-center">
              {/* Track Info Side Control */}
              <div className="w-36 bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-400 font-black flex items-center justify-between shrink-0 pl-3">
                <span className="truncate">تحركات المحضرين</span>
                <div className="flex gap-1">
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-cyan-400">M</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-amber-400">S</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center border border-slate-800 cursor-pointer text-slate-500"><Lock className="w-2.5 h-2.5" /></span>
                </div>
              </div>
              {/* Track Content Area */}
              <div className="flex-1 bg-slate-950/40 h-11 mx-2.5 rounded-xl border border-slate-900 relative">
                {/* Milestone Node 4 (June 30) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[3])}
                  className="absolute right-[65%] w-[20%] bg-cyan-950/70 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105"
                >
                  <span className="truncate">المعاينة الفنية الميدانية</span>
                  <span className="text-[8px] opacity-65 font-mono">٣٠ يونيو</span>
                </button>
              </div>
            </div>

            {/* TRACK 3: المستندات والمعاينات */}
            <div className="flex items-center">
              {/* Track Info Side Control */}
              <div className="w-36 bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-400 font-black flex items-center justify-between shrink-0 pl-3">
                <span className="truncate">المستندات والمعاينات</span>
                <div className="flex gap-1">
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-cyan-400">M</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-amber-400">S</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center border border-slate-800 cursor-pointer text-slate-500"><Lock className="w-2.5 h-2.5" /></span>
                </div>
              </div>
              {/* Track Content Area */}
              <div className="flex-1 bg-slate-950/40 h-11 mx-2.5 rounded-xl border border-slate-900 relative">
                {/* Milestone Node 3 (June 25 - RED Missing papers) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[2])}
                  className="absolute right-[50%] w-[18%] bg-red-950/70 border border-red-500/40 hover:border-red-400 text-red-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                >
                  <span className="truncate">دفاع ورثة شلبي (ناقص)</span>
                  <span className="text-[8px] opacity-65 font-mono">٢٥ يونيو</span>
                </button>
              </div>
            </div>

            {/* TRACK 4: الإعلام والمنازعات */}
            <div className="flex items-center">
              {/* Track Info Side Control */}
              <div className="w-36 bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-400 font-black flex items-center justify-between shrink-0 pl-3">
                <span className="truncate">الإعلام والمنازعات</span>
                <div className="flex gap-1">
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-cyan-400">M</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center font-bold border border-slate-800 cursor-pointer text-amber-400">S</span>
                  <span className="w-4 h-4 bg-slate-950 hover:bg-slate-800 rounded text-[9px] flex items-center justify-center border border-slate-800 cursor-pointer text-slate-500"><Lock className="w-2.5 h-2.5" /></span>
                </div>
              </div>
              {/* Track Content Area */}
              <div className="flex-1 bg-slate-950/40 h-11 mx-2.5 rounded-xl border border-slate-900 relative">
                {/* Milestone Node 5 (July 3) */}
                <button 
                  onClick={() => setSelectedTimelineEvent(milestones[4])}
                  className="absolute right-[74%] w-[18%] bg-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 h-8 top-1.5 rounded-lg text-[9px] font-black px-1.5 flex flex-col justify-center leading-tight transition-all cursor-pointer text-right hover:scale-105"
                >
                  <span className="truncate">إزالة لوحة الجندي</span>
                  <span className="text-[8px] opacity-65 font-mono">٠٣ يوليو</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick interactive note */}
          <div className="mt-3.5 text-center text-[10px] text-slate-500 font-bold select-none">
            💡 انقر فوق أي كتلة أو مفتاح كادر (Keyframe Block) في المسارات الأفقية لتفقد التفاصيل الفنية وتدقيق المحضر المناظر.
          </div>

        </div>

        {/* Selected timeline event modal inline readout */}
        {selectedTimelineEvent && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 text-[10.5px] font-black flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>تفاصيل حدث كادر شريط الزمن</span>
              </span>
              <button 
                onClick={() => setSelectedTimelineEvent(null)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-right">
              <div>
                <span className="text-slate-500 text-[9px] font-bold block">تاريخ الإجراء</span>
                <span className="text-white text-xs font-mono font-black">{selectedTimelineEvent.date}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] font-bold block">اسم الإجراء</span>
                <span className="text-white text-xs font-black leading-snug">{selectedTimelineEvent.title}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] font-bold block">المسؤول المكلف</span>
                <span className="text-slate-300 text-xs font-semibold">{selectedTimelineEvent.bailiff}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] font-bold block">حالة السند القانوني</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                  selectedTimelineEvent.status === 'authorized' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  selectedTimelineEvent.status === 'incomplete' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {selectedTimelineEvent.status === 'authorized' ? 'مصرح ونشط (أخضر)' : selectedTimelineEvent.status === 'incomplete' ? 'مستند ناقص (أحمر)' : 'مجدول ومعلق'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------
            THE UNPACKED CHRONOLOGICAL MILESTONE TABLE (فك الخريطة الزمنية وحطها في مكان منفصل)
            ------------------------------------------- */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-white text-xs font-black">الخريطة الزمنية المفككة وجدول إجراءات التمكين القضائي</h4>
            <span className="text-slate-500 text-[10px] font-bold">تحديث فوري لجميع الخطوات الإجرائية</span>
          </div>

          <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/40 shadow-inner">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-black">
                  <th className="p-3.5">تاريخ الإجراء</th>
                  <th className="p-3.5">الخطوة الإجرائية / المهمة</th>
                  <th className="p-3.5">المسؤول الميداني</th>
                  <th className="p-3.5">حالة التمكين القانوني</th>
                  <th className="p-3.5 text-center">التصنيف الفني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-semibold">
                {milestones.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="p-3.5 text-slate-300 font-mono font-bold whitespace-nowrap">📅 {m.date}</td>
                    <td className="p-3.5 text-white font-black leading-snug">{m.title}</td>
                    <td className="p-3.5 text-slate-400">{m.bailiff}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                        m.status === 'authorized' 
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                          : m.status === 'incomplete'
                          ? 'bg-red-950/50 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                          : 'bg-blue-950/50 text-blue-400 border border-blue-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          m.status === 'authorized' ? 'bg-emerald-400' : m.status === 'incomplete' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></span>
                        <span>{m.status === 'authorized' ? 'قرار معتمد ومصرح (أخضر)' : m.status === 'incomplete' ? 'مستند حكومي ناقص (أحمر)' : 'مرحلة معلقة مجدولة'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-850">
                        {m.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ==========================================
          SECTION 4: CHAT SPACE & DIGITAL ATTACHMENTS (Side-by-Side Height-Aligned Bento Grid)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Column: Chat Space (Perfect Height 620px to align with attachments register) */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col h-[620px] relative">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
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
                <span className="text-[10px] text-slate-500 font-mono">AI ASSISTANT v3.0</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pl-1 text-right scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-cyan-400 border border-slate-850 shadow-inner'
                  }`}>
                    {msg.sender === 'user' ? 'ح' : '⚖️'}
                  </div>
                  <div className="space-y-1">
                    <div className={`p-3 rounded-xl text-xs leading-relaxed font-semibold whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-cyan-500 text-slate-950 font-black rounded-tl-none shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
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
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shadow-[0_0_8px_#00f0ff] filter drop-shadow-[0_0_6px_#00f0ff]" />
                    <span>جاري تحليل البيانات وصياغة الجواب القضائي الفني...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Audio Voice Notes List Container (Embedded cleanly with no messy gaps) */}
            <div className="my-3.5 border-t border-b border-slate-850/80 py-2.5 space-y-2 shrink-0 max-h-[140px] overflow-y-auto scrollbar-thin">
              <span className="text-[10px] text-slate-500 font-bold block">سجل مذكرات كابتن حسام الصوتية النشطة:</span>
              {recordedMemos.length === 0 ? (
                <span className="text-[9.5px] text-slate-600 block">لا توجد ملاحظات صوتية حالياً.</span>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {recordedMemos.map(memo => (
                    <div key={memo.id} className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex items-center justify-between text-[10px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-cyan-950 rounded text-cyan-400">🎙️</span>
                        <div className="text-right">
                          <span className="font-bold block text-white truncate max-w-[180px]">{memo.title}</span>
                          <span className="text-[8px] text-slate-500">{memo.date} • مدة التسجيل: {memo.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => triggerToast(`جاري تشغيل التسجيل الصوتي الميداني: ${memo.title}`, 'info')}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white rounded border border-slate-800 cursor-pointer"
                          title="تشغيل المذكرة"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded border border-slate-800 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Helper Questions */}
            <div className="flex gap-2 mb-2.5 overflow-x-auto py-1 scrollbar-none shrink-0 border-t border-slate-850/50 pt-2.5">
              <button 
                onClick={() => handleSendMessage('ما هي الأحكام القضائية المقترحة لمحمد الجندي؟')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                ⚖️ حكم محمد الجندي
              </button>
              <button 
                onClick={() => handleSendMessage('ما هو قرار إخلاء ماجدة الجيار؟')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                📜 حكم ماجدة الجيار
              </button>
              <button 
                onClick={() => handleSendMessage('تفاصيل تكاليف إزالة السطح والـ 150 ألف')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                🏚️ تكاليف إزالة السطح
              </button>
              <button 
                onClick={() => handleSendMessage('مواصفات عقار بيت العمرانية')}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-850 whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                🏠 مواصفات بيت العمرانية
              </button>
            </div>

            {/* Chat Input Area with Integrated Buttons */}
            <div className="relative mt-auto pt-2 border-t border-slate-850 shrink-0">
              {voiceMode === 'recording' && (
                <div className="absolute right-3 top-[-34px] bg-red-950/95 border border-red-500/40 text-red-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>جاري تسجيل صوت كابتن حسام للتفريغ... انقر مجدداً للحفظ</span>
                </div>
              )}
              
              <input 
                type="file"
                ref={chatFileInputRef}
                onChange={handleChatFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={voiceMode === 'recording' ? "تحدث الآن بوضوح، سيتم تفريغ صوتك فوراً..." : "اكتب استفسارك القضائي أو الفني عن بيت العمرانية هنا..."}
                disabled={voiceMode === 'recording'}
                className="w-full bg-slate-950 text-white text-xs pr-4 pl-40 py-3.5 rounded-xl border border-slate-850 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-right transition-all"
              />
              
              <div className="absolute left-2 top-3 bottom-2 flex items-center gap-1.5">
                {/* Chat Attachment Button for Word & PDF files */}
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="إرفاق ملف وورد أو PDF للشات"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>

                {/* Direct Audio/Phone Call connection */}
                <button
                  type="button"
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

                {/* Dictation dict record toggle */}
                <button
                  type="button"
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

                {/* Send Input Message */}
                <button
                  type="button"
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

        {/* Left Column: Digital Attachments Register (Matches height with Chat 620px inside) */}
        <div className="lg:col-span-6 h-[620px] bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col">
            <DigitalAttachmentsRegister caseNumber={caseData.caseNumber} />
          </div>
        </div>

      </div>

      {/* ==========================================
          SECTION 5: OPEN PANEL FOR STAKEHOLDERS & EXPERT REVIEWS
          ========================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-white text-sm font-black">منصة تقارير الخبراء وآراء المستشارين الميدانية المفتوحة</h3>
              <p className="text-[10px] text-slate-500 font-bold">بوابة مصلحة الخبراء بوزارة العدل واللجان الهندسية المستقلة لمواءمة التسوية القضائية</p>
            </div>
          </div>
        </div>

        {/* Expert shelf suggestions click-to-fill */}
        <div className="bg-slate-950/45 p-3.5 rounded-2xl border border-slate-850/80 space-y-2">
          <span className="text-slate-500 text-[10px] font-black block">💡 اضغط لتسجيل رأي خبير رسمي معتمد تلقائياً:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => selectExpertRoleTemplate(
                'م. هشام عادل', 
                'خبير رفع مساحي وخرائط', 
                'تمت مضاهاة الحدود الشمالية والشرقية وتبين تطابقها الكلي مع ممر التنظيم والملاك المتداخلين بنسبة تطابق هندسي ١٠٠٪.'
              )}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-[10px] px-3 py-1.5 rounded-xl border border-slate-850 cursor-pointer transition-all font-semibold"
            >
              📐 خبير مساحي: هشام عادل
            </button>
            <button
              onClick={() => selectExpertRoleTemplate(
                'المستشار عبد العزيز الشافعي', 
                'ممثل نقابة المحامين للجيزة', 
                'نقر بامتداد عقد إيجار شقة الدور الرابع قانوناً لصالح ماجدة الجيار لثبوت استقرار حياتها الأسرية، مع التحفظ لحين سداد الرسوم المطلوبة.'
              )}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-[10px] px-3 py-1.5 rounded-xl border border-slate-850 cursor-pointer transition-all font-semibold"
            >
              ⚖️ ممثل نقابة: المستشار الشافعي
            </button>
            <button
              onClick={() => selectExpertRoleTemplate(
                'كابتن حسام', 
                'الخبير القضائي المعتمد والمثمن', 
                'تبلغ القيمة التسويقية لبيت العمرانية بعد تصفية وإزالة السطح وترميمه ما يعادل ٣,٤٠٠,٠٠٠ جنيه مصري لصالح توزيع التركات الشرعي.'
              )}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-[10px] px-3 py-1.5 rounded-xl border border-slate-850 cursor-pointer transition-all font-semibold"
            >
              📋 الخبير المعين: كابتن حسام
            </button>
          </div>
        </div>

        {/* Current comments list & Submit new */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          
          {/* Submit form (5 Columns) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
            <span className="text-white text-xs font-black block border-b border-slate-900 pb-2">إيداع تقرير خبير جديد بالسجل</span>
            
            <form onSubmit={handleAddExpertComment} className="space-y-3">
              <div className="flex flex-col gap-1 text-right">
                <label className="text-slate-400 text-[10px] font-bold">اسم الخبير / المستشار المعتمد</label>
                <input
                  type="text"
                  value={newCommentName}
                  onChange={e => setNewCommentName(e.target.value)}
                  placeholder="مثال: أ. د. أحمد كمال الدين"
                  className="bg-slate-900 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-2 focus:outline-none transition-all text-right font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1 text-right">
                <label className="text-slate-400 text-[10px] font-bold">الصفة القضائية / التخصص الفني</label>
                <select
                  value={newCommentRole}
                  onChange={e => setNewCommentRole(e.target.value)}
                  className="bg-slate-900 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-2 focus:outline-none transition-all text-right font-semibold cursor-pointer"
                >
                  <option value="خبير مساحي وخرائط">خبير مساحي وخرائط</option>
                  <option value="استشاري إنشائي وترميم">استشاري إنشائي وترميم</option>
                  <option value="خبير تثمين عقاري وتوريث">خبير تثمين عقاري وتوريث</option>
                  <option value="ممثل النيابة العامة للحسابات">ممثل النيابة العامة للحسابات</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <label className="text-slate-400 text-[10px] font-bold">نص الرأي والمشورة والتقرير الفني</label>
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  rows={3}
                  placeholder="اكتب التوصية القضائية أو الملاحظة الفنية بالعين المعينة تفصيلياً..."
                  className="bg-slate-900 text-white text-xs border border-slate-800 focus:border-cyan-400 rounded-xl p-2 focus:outline-none transition-all text-right leading-relaxed font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إيداع الرأي رسمياً بسجل القضية</span>
              </button>
            </form>
          </div>

          {/* List of comments (7 Columns) */}
          <div className="lg:col-span-7 space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {expertComments.map((comment) => (
              <div key={comment.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all text-right relative">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="space-y-0.5">
                    <span className="text-white text-xs font-black block">{comment.name}</span>
                    <span className="text-[10px] text-cyan-400 font-bold block">{comment.role}</span>
                  </div>
                  <span className="text-slate-500 text-[9px] font-mono font-bold">{comment.date}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  💬 {comment.text}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ==========================================
          MODAL DETAIL VIEW FOR PROCESS VERBAL / NOTICES
          ========================================== */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-right animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-5 border-b border-slate-800 flex items-center justify-between text-white ${
              selectedNotice.status === 'authorized' 
                ? 'bg-emerald-950/30 border-b border-emerald-500/20' 
                : 'bg-red-950/30 border-b border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  selectedNotice.status === 'authorized' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'
                }`}></span>
                <h3 className="text-white text-base font-black">تفاصيل السند القضائي: {selectedNotice.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-white text-xs font-black cursor-pointer bg-slate-950 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                <span className="text-slate-500 text-[10px] font-black block">نص المحضر والتقرير القضائي:</span>
                <p className="text-white text-xs leading-relaxed font-semibold">
                  {selectedNotice.description}
                </p>
              </div>

              {selectedNotice.missingPapers && (
                <div className="space-y-2.5">
                  <span className="text-red-400 text-xs font-black flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>المستندات المطلوبة لتصحيح حالة الملف من اللون الأحمر إلى الأخضر:</span>
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedNotice.missingPapers.map((paper, index) => (
                      <div key={index} className="bg-red-950/20 border border-red-500/15 p-3 rounded-xl flex items-start gap-2.5 text-red-200 text-xs font-medium">
                        <span className="bg-red-500/20 text-red-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-black shrink-0">{index + 1}</span>
                        <p className="leading-normal">{paper}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 text-[9px] font-bold block">تاريخ الإنذار والإخطار</span>
                  <span className="text-white font-mono font-black">{selectedNotice.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] font-bold block">المحضر الميداني المكلّف</span>
                  <span className="text-white font-black">{selectedNotice.bailiff}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-slate-500 font-bold text-center sm:text-right">
                تم تفريغ هذا المحضر لمصلحة القضية بإشراف ممثل النيابة العامة لبيت العمرانية.
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2 rounded-xl text-xs cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] text-center active:scale-95"
              >
                فهمت، مواءمة التقرير في الملف الرقمي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

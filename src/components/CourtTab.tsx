import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Shield, 
  Users, 
  CheckSquare, 
  Gavel, 
  GitBranch, 
  FileText, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play,
  FileCheck,
  Building2,
  Cpu,
  ChevronRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Upload,
  Sliders,
  Award,
  RotateCcw
} from 'lucide-react';
import { CaseData, CalculationResults } from '../types';
import CourtRoom3D from './VirtualCourt/CourtRoom3D';
import AgentChatInterface from './VirtualCourt/AgentChatInterface';
import { triggerToast } from '../lib/toast';

interface CourtTabProps {
  caseData: CaseData;
  results: CalculationResults;
  onUpdateCaseData: (data: Partial<CaseData>) => void;
}

export default function CourtTab({ caseData, results, onUpdateCaseData }: CourtTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'courtroom' | 'execution'>('courtroom');
  const [currentAgent, setCurrentAgent] = useState<string>('master');
  const [verdict, setVerdict] = useState<string>('');

  // Forensic Lab State
  const [labFile1, setLabFile1] = useState<string>('');
  const [labFile2, setLabFile2] = useState<string>('');
  const [tremorRatio, setTremorRatio] = useState<number>(85);
  const [penPressure, setPenPressure] = useState<number>(20);
  const [strokeMatch, setStrokeMatch] = useState<number>(15);
  const [labScanning, setLabScanning] = useState<boolean>(false);
  const [labProgress, setLabProgress] = useState<number>(0);
  const [labLogs, setLabLogs] = useState<string[]>([]);
  const [labResult, setLabResult] = useState<boolean>(false);

  // Execution steps checklist state
  const [executionChecklist, setExecutionChecklist] = useState([
    { id: 'exec1', label: 'قيد صحيفة الدعوى بجدول المحكمة', done: true, date: '2026-06-10', notes: 'تم السداد والقيد بالرقم الفيدرالي' },
    { id: 'exec2', label: 'إعلان الخصم بصحيفة الدعوى (قلم المحضرين)', done: true, date: '2026-06-15', notes: 'تم التسليم لشخص المراد إعلانه' },
    { id: 'exec3', label: 'ندب مكتب خبراء وزارة العدل المعاين', done: true, date: '2026-06-25', notes: 'قرار المحكمة التمهيدي رقم ٣٠٥' },
    { id: 'exec4', label: 'سداد أمانة الخبير المعين بخزينة المحكمة', done: true, date: '2026-06-28', notes: 'تم سداد مبلغ الأمانة بالكامل' },
    { id: 'exec5', label: 'المعاينة الميدانية والرفع المساحي الفعلي', done: false, date: '2026-07-10', notes: 'موعد انتقال لجنة المعاينة الفنية' },
    { id: 'exec6', label: 'إيداع تقرير الخبراء الثلاثي قلم كتاب المحكمة', done: false, date: '2026-07-22', notes: 'تحت إشراف المستشار رئيس الدائرة' },
    { id: 'exec7', label: 'حضور جلسة الحكم القطعي النهائي وتلاوة المنطوق', done: false, date: '2026-08-05', notes: 'إصدار صيغة الحكم القابلة للتنفيذ الجبري' },
    { id: 'exec8', label: 'مأمورية التنفيذ الجبري وتمكين القوة من تسليم العين خالية', done: false, date: '2026-08-20', notes: 'بالتنسيق مع وزارة الداخلية وأمن الجيزة' }
  ]);

  // Bailiff Notification system state
  const [bailiffTasks, setBailiffTasks] = useState([
    { id: 'b1', title: 'إعلان بقرار ندب الخبير الهندسي', recipient: caseData.defendant || 'المدعى عليه', status: 'completed', date: '2026-06-26', officer: 'المحضر / أحمد الشافعي', force: 'لا يتطلب قوة' },
    { id: 'b2', title: 'مأمورية وضع الصيغة التنفيذية للقرار الإداري', recipient: 'وزارة الإسكان وهيئة المساحة', status: 'in-progress', date: '2026-07-06', officer: 'المحضر / محمود السعدني', force: 'مصحوب بقوة أمنية من أمن الجيزة' },
    { id: 'b3', title: 'إعلان صحيفة الجنحة الفرعية لتبديد الضمانات', recipient: 'الخصم والشركاء المتضامنين', status: 'pending', date: '2026-07-12', officer: 'المحضر / كمال واصف', force: 'لا يتطلب قوة' }
  ]);

  // Handle toggle checklist items
  const handleToggleChecklist = (id: string) => {
    setExecutionChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.done;
        triggerToast(nextState ? `✓ تم إنجاز خطوة التنفيذ: ${item.label}` : `⏳ تم إعادة تعليق خطوة التنفيذ: ${item.label}`, nextState ? 'success' : 'warning');
        return { ...item, done: nextState };
      }
      return item;
    }));
  };

  const handleRunExecutionTask = (id: string) => {
    setBailiffTasks(prev => prev.map(task => {
      if (task.id === id) {
        triggerToast(`⚡ جاري تشغيل وتحريك مأمورية التنفيذ الجبري لـ: ${task.title}`, 'info');
        return { ...task, status: 'completed' };
      }
      return task;
    }));
  };

  // Switch to execution tab and add the task live from the courtroom 3D HUD
  const handleDirectEnforcement = (verdictDetails: { title: string; recipient: string; force: string }) => {
    const newTask = {
      id: `b_auto_${Date.now()}`,
      title: verdictDetails.title,
      recipient: verdictDetails.recipient,
      status: 'in-progress' as const,
      date: new Date().toISOString().split('T')[0],
      officer: 'المحضر / أحمد الشافعي (مأمور الضبط القضائي)',
      force: verdictDetails.force
    };
    setBailiffTasks(prev => [newTask, ...prev]);
    
    // Auto toggle the last checklist items to visually show sync
    setExecutionChecklist(prev => prev.map(item => {
      if (item.id === 'exec7' || item.id === 'exec8') {
        return { ...item, done: true, notes: 'تم تحفيزها تلقائياً بقرار التمكين الجبري' };
      }
      return item;
    }));

    setActiveSubTab('execution');
  };

  // Calculate percentage progress of execution checklist
  const completedCount = executionChecklist.filter(item => item.done).length;
  const executionPercent = Math.round((completedCount / executionChecklist.length) * 100);

  // Legal Agents mapping for court chatbot
  const legalAgents = {
    'قانون العقوبات': { id: 'penal', icon: '⚔️', desc: 'وكيل الجرائم والعقوبات الفيدرالي' },
    'قانون المرافعات': { id: 'procedure', icon: '📜', desc: 'وكيل أصول واختصاص المحاكمات' },
    'قانون الأحوال الشخصية': { id: 'personal', icon: '👨‍👩‍👧‍👦', desc: 'وكيل الأسرة والشرائع والمواريث' },
    'القانون التجاري': { id: 'commercial', icon: '🏢', desc: 'وكيل الشركات والعقود التجارية المعين' },
    'القانون الدستوري': { id: 'constitutional', icon: '📋', desc: 'وكيل الدستور والحقوق المدنية' },
    'القانون الإداري': { id: 'administrative', icon: '🏛️', desc: 'وكيل قضاء مجلس الدولة والإدارة' },
    'القانون الدولي': { id: 'international', icon: '🌍', desc: 'وكيل المعاهدات والاتفاقيات الدولية' },
    'وكيل فحص التوقيعات والخطوط': { id: 'forensic_doc_expert', icon: '🖋️', desc: 'وكيل فحص التوقيعات والخطوط الجنائية' },
  };

  const handleAgentRequest = (query: string) => {
    // Determine the matched agent
    const matchedAgent = Object.keys(legalAgents).find(key => 
      query.includes(key) || query.includes(key.split(' ')[0])
    );
    
    if (matchedAgent) {
      setCurrentAgent(legalAgents[matchedAgent].id);
      simulateAgentResponse(matchedAgent, query);
    } else {
      // General Agent
      setCurrentAgent('master');
      simulateAgentResponse('general', query);
    }
  };

  const simulateAgentResponse = (agentType: string, query: string) => {
    const responses: Record<string, string> = {
      'قانون العقوبات': `⚖️ حكم المحكمة طبقاً لقانون العقوبات:
بناءً على تفنيد طلبكم بشأن "${query}"، نورد الآتي:
- طبقاً للمادة 234 من قانون العقوبات المصري (القتل العمد/الاعتداء): يعاقب بالسجن المؤقت أو المؤبد كل من قتل نفساً عمداً من غير سبق إصرار ولا ترصد.
- وفي حال تبديد الأمانة (المادة 341): يعاقب بالحبس كل من سلب أو بدد مبالغ أو أمتعة بنية الإضرار بمالكيها.
- التوصية القانونية: نوصي بإرسال محضر معاينة الخبراء فوراً مصحوباً بالصور الميدانية لإثبات حالة الهدم العمدي أو التلفيات للنيابة العامة لاتخاذ الإجراء الجنائي.`,

      'قانون المرافعات': `⚖️ حكم المحكمة طبقاً لقانون المرافعات المدنية والتجارية:
بشأن الدفوع في طلبكم "${query}":
- المادة 108 تنص على وجوب الدفع بعدم الاختصاص المحلي في بدء الجلسة وقبل أي دفع موضوعي وإلا سقط الحق فيه.
- المادة 115 تحدد شروط إحالة القضية إلى المحكمة المختصة تلقائياً في حال قضت المحكمة بعدم اختصاصها القيمي أو النوعي.
- التوصية القانونية: يوصي الوكيل بتقديم مذكرة بطلان الإعلان في الجلسة المقبلة لتجنب صدور حكم غيابي غير متكافئ.`,

      'قانون الأحوال الشخصية': `⚖️ حكم المحكمة طبقاً لقانون الأحوال الشخصية والمواريث:
بناءً على طلبكم بخصوص "${query}":
- طبقاً للمادة 7 من قانون المواريث رقم 77 لسنة 1943: يستحق الورثة أنصبتهم الشرعية فور ثبوت الوفاة وتصفية تركة المتوفى وسداد ديونه ونفاذ وصاياه.
- يتم توزيع التركات بدقة متناهية (للذكر مثل حظ الأنثيين) كعصبة أو فرض، مع استبعاد غير المستحقين قانوناً.
- التوصية القانونية: نوصي باعتماد شجرة الورثة الحالية المسجلة بالنظام (عدد الورثة: ${caseData.heirs?.length || 2} فرد) مع تفريغ الأنصبة النقدية البالغة ${(results?.totalPropertyValue || 500000).toLocaleString('ar-EG')} ج طبقاً للجدول الرقمي المعتمد لعدم تداخل الحصص.`,

      'القانون التجاري': `⚖️ حكم المحكمة طبقاً للقانون التجاري المصري:
بخصوص النزاع العقدي والشركات في طلبكم "${query}":
- المادة 90 من القانون التجاري تحدد التزامات الشركاء في شركات التضامن والمسؤولية التضامنية المطلقة لجميع الديون والالتزامات المترتبة على الشركة.
- المادة 120 تنص على فسخ العقد وشروطه الجزائية في حال إخلال أي طرف بالتعهد الاستثماري أو التأخر في توريد الأرباح.
- التوصية القانونية: نوصي بفسخ التعاقد ودياً أولاً عبر تسوية الخبراء، وإذا تعذر، يتم تسييل الضمانات العقارية لتعويض الطرف المتضرر.`,

      'القانون الدستوري': `⚖️ حكم المحكمة طبقاً للمبادئ الدستورية العليا:
بخصوص طلبكم الممتد للدستور وحقوق الأفراد "${query}":
- المادة 35 من الدستور المصري تنص على أن الملكية الخاصة مصونة، وحق الإرث فيها مكفول، ولا يجوز فرض الحراسة عليها إلا في الأحوال المبينة في القانون وبحكم قضائي، ولا تنزع الملكية إلا للمنفعة العامة ومقابل تعويض عادل يدفع مقدماً.
- التوصية القانونية: يؤكد وكيل الدستور بطلان أي قرار إداري يتعارض مع صيانة الملكية الخاصة ما لم يكن مستوفياً لشروط المنفعة العامة والتعويض المالي العادل فوراً.`,

      'القانون الإداري': `⚖️ حكم المحكمة طبقاً لقضاء مجلس الدولة والقانون الإداري:
بشأن الطعن على القرار الإداري وترخيص البناء "${query}":
- قانون البناء الموحد رقم 119 لسنة 2008 يحدد شروط التراخيص والمخالفات الإنشائية وإجراءات وقف الأعمال المخالفة بالطريق الإداري.
- يقبل الطعن بالإلغاء على القرارات الإدارية خلال 60 يوماً من تاريخ النشر أو العلم اليقيني بالقرار طبقاً لقانون مجلس الدولة رقم 47 لسنة 1972.
- التوصية القانونية: يجب تقديم طلب مستعجل لشريحة القضاء المستعجل بمجلس الدولة لوقف تنفيذ قرار الإزالة فوراً قبل فوات موعد المعاينة الهندسية.`,

      'القانون الدولي': `⚖️ حكم المحكمة طبقاً للقانون والاتفاقيات الدولية:
بشأن الالتزام الدولي وحقوق التجارة في طلبكم "${query}":
- تنص اتفاقية الأمم المتحدة لعقود البيع الدولي للبضائع (CISG) على التزامات البائع والمشتري في المعاملات التجارية العابرة للحدود.
- يوصي وكيل القانون الدولي بالرجوع لمركز التحكيم الدولي المذكور في بنود التعاقد لحفظ ولاية القضاء الفيدرالي.`,

      'وكيل فحص التوقيعات والخطوط': `⚖️ حكم المحكمة طبقاً لتقرير أبحاث التزييف والتزوير الجنائي الفني:
بناءً على طلبكم بخصوص الطعن بالتزوير على سند الملكية ("${query}"):
- تم استدعاء وكيل فحص الخطوط وتنشيط معمل الفحص المجهري المدمج.
- الفحص الأولي يشير لارتعاش مصطنع بنسبة ٨٥٪ ومعدل تطابق مع الخط الحي للمورث لا يتجاوز ١٥٪.
- التوصية الجنائية: إيقاف الدعوى المدنية تعليقياً وإحالة السند المطعون فيه للطب الشرعي، واستخدم المعمل المدمج في القائمة اليسرى لتوليد التقرير النهائي.`,

      'general': `⚖️ حكم المحكمة وتوصية وكيل السرب العام:
تم تحليل وقراءة نص استشارتكم بدقة: "${query}".
وبناءً على طبيعة الخصومة العقارية الحالية، نوصي بالآتي:
1. تفعيل المسح الجغرافي للعين لتأكيد الحدود المذكورة بصحيفة الدعوى.
2. مقارنة المساحة المستهدفة بصورة سند الملكية المسجل (معدل التطابق الحالي: ${caseData.complianceScore || 94}%).
3. استدعاء لجنة الخبراء الثلاثية لتصفية النزاع وصياغة محضر الصلح النهائي طبقاً للمادة 802 من القانون المدني.`
    };
    
    setVerdict(responses[agentType] || responses['general']);
    triggerToast(`⚖️ تم صياغة حكم وتوصية المحكمة بواسطة: ${agentType === 'general' ? 'الوكيل العام' : agentType}`, 'success');
  };

  // Run Forensic Micro-Scan simulation
  const handleRunForensicScan = () => {
    if (!labFile1 || !labFile2) {
      triggerToast('⚠️ يرجى تحميل المستند المطعون فيه وتوقيع المضاهاة أولاً!', 'error');
      return;
    }

    setLabScanning(true);
    setLabProgress(0);
    setLabLogs([]);
    setLabResult(false);

    const steps = [
      '⏳ تفعيل العدسات الطيفية والميكروسكوب الضوئي الرقمي...',
      '🔬 فحص حواف الحبر وعمق مسار الضغط الجزيئي على نسيج الورق الأساسي...',
      '✍️ تحليل ومطابقة الخصائص الحيوية للمسار (Tremor Speed / Pen Angle)...',
      '🛑 كشف انحراف زاوية القلم بنسبة ٨٥٪ وارتعاش اصطناعي واضح في الأحرف الصاعدة.',
      '📑 توليد شهادة الفحص المعتمدة قيد التوقيع الرقمي بمصادقة الوكيل الجنائي...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLabLogs(prev => [...prev, step]);
        setLabProgress(prev => {
          const next = Math.min(100, Math.round((idx + 1) * 20));
          if (next === 100) {
            setLabScanning(false);
            setLabResult(true);
            triggerToast('✓ اكتمل المسح الجنائي للتواقيع! تزوير قطعي بالسند!', 'success');
          }
          return next;
        });
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300" style={{ direction: 'rtl' }}>
      
      {/* 📑 Tab Selection Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-white text-xs font-black uppercase tracking-widest font-mono">الفرع القضائي والمحاكاة</span>
            <h2 className="text-white text-sm font-black mt-0.5">المحكمة الافتراضية ونظام المحضرين الموحد</h2>
          </div>
        </div>

        {/* Action switch buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-805 self-start sm:self-center">
          <button
            onClick={() => setActiveSubTab('courtroom')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'courtroom' 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>قاعة المحكمة 3D & الذكاء</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('execution')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'execution' 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام المحضرين والتنفيذ</span>
          </button>
        </div>
      </div>

      {/* 🚀 Render sub-tab content */}
      {activeSubTab === 'courtroom' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left/Main Column: 3D Scene View (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative h-[520px] flex flex-col">
            {/* Embedded 3D Scene */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#05050c] via-[#090918] to-[#04040a]">
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              {/* Core 3D layout */}
              <div className="w-full h-full relative z-10 flex items-center justify-center">
                <CourtRoom3D 
                  caseData={caseData}
                  verdict={verdict}
                  activeAgent={currentAgent}
                  results={results}
                  onExecuteVerdict={handleDirectEnforcement}
                  executionChecklist={executionChecklist}
                  bailiffTasks={bailiffTasks}
                  onToggleChecklist={handleToggleChecklist}
                />
              </div>
            </div>

            {/* Bottom active verdict guide banner */}
            {verdict && (
              <div className="p-4 border-t border-slate-800 bg-slate-950 text-right flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-black">آخر توصية وحكم مستخرج من الوكلاء</span>
                    <span className="text-[10px] text-slate-500 font-medium">مؤسس على الأنظمة واللوائح المعتمدة</span>
                  </div>
                </div>
                <button
                  onClick={() => setVerdict('')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-black transition-all border border-slate-800"
                >
                  تصفية المنصة
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Side-by-Side Panels (Bailiffs & Agent Chat) (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 h-[520px]">
            
            {/* 🛡️ Bailiffs & Enforcement System Panel (لوحة نظام المحضرين والتنفيذ المدمجة) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full flex flex-col overflow-hidden shadow-xl" id="integrated-bailiffs-panel">
              <div className="p-4 bg-slate-950/80 border-b border-slate-850 text-right space-y-1.5 shrink-0">
                <span className="text-[9px] text-amber-500 font-black flex items-center gap-1.5 justify-end uppercase font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                  <span>نظام المحضرين والتنفيذ الموحد</span>
                </span>
                <h3 className="text-white text-xs font-black">حالة التنفيذ والمأموريات الميدانية</h3>
                
                {/* Compact Progress bar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[9px] text-slate-400 font-semibold">مؤشر التقدم:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black font-mono text-amber-400">{executionPercent}%</span>
                    <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${executionPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin">
                
                {/* Active Field Missions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1">
                    <span className="text-[8px] text-slate-500 font-mono font-bold">Missions</span>
                    <span className="text-[10.5px] text-slate-200 font-black flex items-center gap-1">👮 مأموريات قلم المحضرين</span>
                  </div>
                  <div className="space-y-2">
                    {bailiffTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850/80 space-y-2 hover:border-slate-750 transition-all text-right"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                            'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}>
                            {task.status === 'completed' ? 'تم التنفيذ' : task.status === 'in-progress' ? 'جاري الانتقال' : 'قيد الانتظار'}
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-semibold truncate max-w-[120px]">
                            {task.officer}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <h5 className="text-white text-[9.5px] font-bold leading-tight">{task.title}</h5>
                          <p className="text-slate-400 text-[8.5px] font-semibold leading-normal">
                            👤 المنفذ ضده: <span className="text-slate-200">{task.recipient}</span>
                          </p>
                          {task.force && (
                            <p className="text-slate-400 text-[8.5px] font-semibold leading-normal">
                              👮 القوة المرافقـة: <span className="text-amber-400">{task.force}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-900 text-[8px] font-semibold">
                          <span className="text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            {task.date}
                          </span>
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleRunExecutionTask(task.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2 py-0.5 rounded text-[8px] flex items-center gap-1 transition-all cursor-pointer shadow"
                            >
                              <Play className="w-2 h-2 fill-slate-950 stroke-[3]" />
                              <span>تشغيل</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Checklist Steps */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1">
                    <span className="text-[8px] text-slate-500 font-mono font-bold">Steps</span>
                    <span className="text-[10.5px] text-slate-200 font-black flex items-center gap-1">📝 خطوات التنفيذ الميداني</span>
                  </div>
                  <div className="space-y-1.5">
                    {executionChecklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className={`w-full p-2.5 rounded-lg border text-right transition-all flex items-start gap-2 group cursor-pointer ${
                          item.done 
                            ? 'bg-slate-950/40 border-slate-800/85 hover:border-slate-700' 
                            : 'bg-slate-900 border-slate-850 hover:border-amber-500/10'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          item.done 
                            ? 'bg-amber-500 border-amber-500 text-slate-950' 
                            : 'border-slate-700 group-hover:border-amber-500/40 text-transparent'
                        }`}>
                          <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className={`text-[9.5px] font-bold leading-tight ${
                            item.done ? 'text-slate-500 line-through' : 'text-slate-200'
                          }`}>
                            {item.label}
                          </span>
                          <span className="text-[7.5px] text-slate-500 font-mono mt-0.5 leading-none">{item.date} • {item.notes}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: AI Smart Counselor Chat Panel (1 col in grid) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full flex flex-col overflow-hidden shadow-xl" id="integrated-chat-panel">
              <div className="p-4 bg-slate-950/80 border-b border-slate-850 text-right space-y-1 shrink-0">
                <span className="text-[9px] text-amber-500 font-black flex items-center gap-1.5 justify-end uppercase font-mono">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  <span>الاستدلال القانوني الذكي</span>
                </span>
                <h3 className="text-white text-xs font-black">مساعد فض المنازعات وسكرتير الجلسات</h3>
                <p className="text-slate-500 text-[10px] leading-normal font-bold">
                  تصفح أو اكتب تهمة، أو قضية لاستدعاء الوكيل القضائي الخبير وحساب العقوبة والمسؤولية الجبرية على الفور.
                </p>
              </div>

              {/* FORENSIC DOCUMENT ANALYSIS WIDGET */}
              {currentAgent === 'forensic_doc_expert' && (
                <div className="p-4 border-b border-slate-850 bg-slate-950 text-right space-y-3.5 shrink-0 overflow-y-auto max-h-[200px]" style={{ direction: 'rtl' }}>
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      معمل جنائي مدمج
                    </span>
                    <h5 className="text-white text-[11px] font-black flex items-center gap-1">
                      <span>🔬 معمل فحص الخطوط والتوثيق</span>
                    </h5>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      onClick={() => {
                        setLabFile1('challenged_deed_sig.png');
                        triggerToast('📥 تم تحميل صورة المستند المطعون فيه للتواقيع', 'info');
                      }}
                      className={`border border-dashed p-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                        labFile1 ? 'border-amber-500/50 bg-amber-500/5 text-amber-400' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 mb-1" />
                      <span className="text-[8px] font-black text-center truncate max-w-full">
                        {labFile1 ? '✓ المطعون فيه' : 'سند الملكية العرفي'}
                      </span>
                    </div>

                    <div 
                      onClick={() => {
                        setLabFile2('reference_sig.png');
                        triggerToast('📥 تم تحميل توقيع المضاهاة للمتوفى', 'info');
                      }}
                      className={`border border-dashed p-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                        labFile2 ? 'border-amber-500/50 bg-amber-500/5 text-amber-400' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 mb-1" />
                      <span className="text-[8px] font-black text-center truncate max-w-full">
                        {labFile2 ? '✓ سند المضاهاة' : 'توقيع حي للمورث'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-2 bg-slate-900/60 rounded-xl border border-slate-900 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-black text-slate-400">
                        <span>نسبة ارتعاش اليد:</span>
                        <span className="text-amber-500 font-mono">{tremorRatio}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={tremorRatio} 
                        onChange={(e) => setTremorRatio(parseInt(e.target.value))}
                        className="w-full accent-amber-500 bg-slate-950"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunForensicScan}
                    disabled={labScanning}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-900 text-slate-950 disabled:text-slate-500 font-black py-1.5 rounded-lg text-[10.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{labScanning ? 'جاري المسح المجهري...' : 'تشغيل التحليل الجنائي للخط'}</span>
                  </button>

                  {labScanning && (
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                        style={{ width: `${labProgress}%` }}
                      />
                    </div>
                  )}

                  {labResult && (
                    <div className="p-2 rounded-lg bg-red-950/20 border border-red-500/30 text-right space-y-1 animate-in zoom-in-95 duration-200 text-[10px]">
                      <div className="flex items-center gap-1 text-red-400 font-black">
                        <Award className="w-3.5 h-3.5 text-red-500" />
                        <span>تزوير قطعي بالسند!</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 leading-snug">
                        تطابق خطي ضئيل ({strokeMatch}%) وارتعاش اصطناعي واضح في التواقيع.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 flex flex-col min-h-0">
                <AgentChatInterface 
                  onSend={handleAgentRequest}
                  agentsList={legalAgents}
                />
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* 📜 Bailiffs & Execution System Tab (نظام المحضرين والتنفيذ) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Execution Checklist & Tree (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Summary Progress banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-amber-500/[0.01] pointer-events-none blur-3xl"></div>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 relative shrink-0">
                  <CheckSquare className="w-7 h-7" />
                  <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {completedCount}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <h3 className="text-white text-sm font-black">مؤشر التقدم الإجرائي والتنفيذ الجبري</h3>
                  <p className="text-slate-400 text-xs mt-1 font-semibold leading-relaxed">
                    نسبة إتمام الخطوات والمستندات القانونية المطلوبة لتمكين المستفيد من العين وحسم الخصومة الميدانية بالكامل.
                  </p>
                </div>
              </div>

              {/* Progress Ring or Bar */}
              <div className="flex flex-col items-center shrink-0">
                <div className="text-2xl font-black font-mono text-amber-400">{executionPercent}%</div>
                <span className="text-[10px] text-slate-500 font-extrabold mt-1">نسبة الإنجاز الفعلي</span>
                <div className="w-24 bg-slate-950 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${executionPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Tree Grid view of the lawsuit execution stages (هيكل الإجراءات والتنفيذ) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-white text-xs font-black">الهيكل الشجري لمراحل القضية والتنفيذ الميداني</h3>
                </div>
                <span className="text-[9px] bg-slate-950 border border-slate-800 px-3 py-1 rounded-full font-mono text-slate-500">
                  DIRECTORY TREE
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Layer 1: Root */}
                <div className="border-r-2 border-amber-500/30 pr-4 relative">
                  <div className="absolute right-[-5px] top-3.5 w-2 h-2 rounded-full bg-amber-500 shadow shadow-amber-500/50"></div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-black">
                        ١
                      </div>
                      <span className="text-white text-xs font-black">الملف القضائي الرقمي الموحد: {caseData.caseNumber}</span>
                    </div>
                    <span className="text-[9px] text-amber-400 font-black bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">الدائرة الرابعة</span>
                  </div>

                  {/* Layer 2: Sub children */}
                  <div className="mt-3 space-y-3 mr-3">
                    
                    {/* Sub branch 1: Initial submission */}
                    <div className="border-r-2 border-slate-800 pr-4 relative">
                      <div className="absolute right-[-5px] top-3 w-2 h-2 rounded-full bg-slate-800"></div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-bold">📂 مرحلة القيد والتحضير (المستندات الأولية)</span>
                        <span className="text-[9px] text-emerald-400 font-black bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">جاهز ومكتمل</span>
                      </div>
                    </div>

                    {/* Sub branch 2: Expert survey and field work */}
                    <div className="border-r-2 border-slate-800 pr-4 relative">
                      <div className="absolute right-[-5px] top-3 w-2 h-2 rounded-full bg-slate-800"></div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-bold">📐 مرحلة ندب الخبراء والمعاينة المساحية الميدانية</span>
                        <span className="text-[9px] text-amber-400 font-black bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">قيد الإجراء والمسح</span>
                      </div>
                    </div>

                    {/* Sub branch 3: Sentence execution */}
                    <div className="border-r-2 border-slate-800 pr-4 relative">
                      <div className="absolute right-[-5px] top-3 w-2 h-2 rounded-full bg-slate-800"></div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-bold">⚔️ مرحلة التنفيذ الجبري والتسليم الجغرافي للحدود</span>
                        <span className="text-[9px] text-red-400 font-black bg-red-950/30 px-2 py-0.5 rounded border border-red-500/20">معلق لحين الحكم القطعي</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step checklist interactives (قائمة التدقيق القضائية والتنفيذية) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-white text-xs font-black">قائمة المتابعة والتحقق الميداني لقلم المحضرين</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">STEP CHECKLIST</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {executionChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3.5 group cursor-pointer ${
                      item.done 
                        ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-900 border-slate-850 hover:border-amber-500/25 shadow-sm shadow-amber-500/[0.01]'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.done 
                        ? 'bg-amber-500 border-amber-500 text-slate-950' 
                        : 'border-slate-700 group-hover:border-amber-500/50 text-transparent'
                    }`}>
                      <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between h-full space-y-1">
                      <span className={`text-xs font-bold leading-tight ${
                        item.done ? 'text-slate-400 line-through' : 'text-slate-200'
                      }`}>
                        {item.label}
                      </span>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900 mt-1">
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-500" />
                          {item.date}
                        </span>
                        <span className="truncate max-w-[150px] text-slate-400">{item.notes}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Bailiff Active tasks list (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Bailiff Active Missions HUD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  <div className="flex flex-col text-right">
                    <span className="text-white text-xs font-black">مأموريات قلم المحضرين الميدانية</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">سجل الإعلانات والتنفيذ الجبري</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {bailiffTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-black text-left block truncate max-w-[150px]">
                        {task.officer}
                      </span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${
                        task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                        'bg-slate-905 text-slate-500 border border-slate-800'
                      }`}>
                        {task.status === 'completed' ? 'تم الإعلان والتنفيذ' : task.status === 'in-progress' ? 'جاري الانتقال حالياً' : 'قيد الانتظار'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-white text-xs font-bold leading-snug">{task.title}</h4>
                      <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
                        👤 المستهدف بالإعلان: <span className="text-slate-200">{task.recipient}</span>
                      </p>
                      <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
                        👮 القوة المرافقة: <span className="text-amber-400/80">{task.force}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 text-[9px] font-semibold">
                      <span className="text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-500" />
                        {task.date}
                      </span>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleRunExecutionTask(task.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded-md text-[9px] flex items-center gap-1 transition-all cursor-pointer shadow shadow-amber-500/5"
                        >
                          <Play className="w-2.5 h-2.5 fill-slate-950 stroke-[3]" />
                          <span>تشغيل المأمورية</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Judicial execution guidance panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/[0.02] rounded-full blur-xl pointer-events-none"></div>
              <h4 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>إرشادات التنفيذ وقلم كتاب المحضرين</span>
              </h4>
              <p className="text-slate-400 text-[10px] leading-relaxed font-semibold mt-3">
                طبقاً للمادة ٢٨٠ من قانون المرافعات المصري: لا يجوز التنفيذ الجبري إلا بموجب صورة من الحكم تحمل الصيغة التنفيذية (ممهورة بختم الجمهورية)، ويتم إعلان الخصم بها قبل التنفيذ بثمانية أيام على الأقل.
              </p>
              <div className="mt-3.5 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-amber-500 text-[10px] font-black block">نصيحة الوكيل المساعد:</span>
                <p className="text-slate-400 text-[9.5px] mt-1 font-semibold leading-relaxed">
                  تأكد من سداد رسوم مأمورية النقل والمسح الجغرافي بقوة الأمن لسرعة ترسيم الحدود وتجنب اعتراض الجار المعاين.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

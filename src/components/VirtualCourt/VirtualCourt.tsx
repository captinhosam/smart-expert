import React, { useState, useEffect } from 'react';
import { X, Scale, Landmark, ShieldCheck, Cpu, CheckCircle, FileText, Upload, Sliders, Play, Award, RotateCcw } from 'lucide-react';
import CourtRoom3D from './CourtRoom3D';
import AgentChatInterface from './AgentChatInterface';
import { CaseData, CalculationResults } from '../../types';
import { triggerToast } from '../../lib/toast';

interface VirtualCourtProps {
  onClose: () => void;
  caseData: CaseData;
  results: CalculationResults;
}

export default function VirtualCourt({ onClose, caseData, results }: VirtualCourtProps) {
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

  // Define the legal agents list
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
    // Generate simulated highly professional Arabic judicial response matching user inquiry
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

      'قانون الأحوال الشخصية': `⚖️ حكم المحكمة طبقاً قانون الأحوال الشخصية والمواريث:
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
- التوصية الجنائية: إيقاف الدعوى المدنية تعليقياً وإحالة السند المطعون فيه للطب الشرعي، واستخدام المعمل المدمج في القائمة اليمنى لتوليد التقرير النهائي.`,

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

  const handleDirectEnforcement = (verdictDetails: { title: string; recipient: string; force: string }) => {
    triggerToast(`⚖️ تم إرسال أمر التمكين والتنفيذ الجبري لغرفة المحضرين: ${verdictDetails.title}`, 'success');
    triggerToast(`📋 تم إسناد المهمة إلى المأمور القائم بالتنفيذ وحفظها بسجل الملف القضائي الموحد بنجاح!`, 'info');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* Absolute Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/80 z-50">
        
        {/* Right side: App title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            🏛️
          </div>
          <div className="flex flex-col text-right">
            <span className="text-white text-sm font-black flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500 animate-pulse" />
              قاعة المحكمة الافتراضية والوكلاء الأذكياء
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              نظام المحاكاة ثلاثي الأبعاد لفض النزاعات وتفنيد القوانين بوزارة العدل
            </span>
          </div>
        </div>

        {/* Center: Active Case Info */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-900/60 border border-slate-800 px-4 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-slate-300 text-[11px] font-black">
            ملف القضية النشط: {caseData.caseNumber} • {caseData.title.split(' ').slice(0, 3).join(' ')}...
          </span>
        </div>

        {/* Left side: Close Button */}
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl text-slate-400 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer shadow-lg"
          title="إغلاق المحكمة والعودة للخريطة"
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      {/* Main Layout containing Left (3D Courtroom) and Right (Smart Chat) */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* 3D Courtroom - 70% space on desktops */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#06060c] via-[#090918] to-[#04040a] flex flex-col justify-center">
          
          {/* Transparent Grid Map in the Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border-2 border-dashed border-slate-700/60 rounded-full flex items-center justify-center">
              <div className="w-[200px] h-[200px] border-2 border-slate-700/40 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-mono text-xl tracking-widest">N E W S</span>
              </div>
            </div>
          </div>

          {/* Core Courtroom Render */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <CourtRoom3D 
              caseData={caseData} 
              verdict={verdict} 
              activeAgent={currentAgent}
              results={results}
              onExecuteVerdict={handleDirectEnforcement}
            />
          </div>

        </div>

        {/* Right Side Control Sidebar - 30% space */}
        <div className="w-full lg:w-[320px] xl:w-[370px] bg-slate-950 border-t lg:border-t-0 lg:border-r border-slate-900 flex flex-col shrink-0 z-20 overflow-y-auto">
          
          {/* Workspace Guide Panel */}
          <div className="p-4 bg-slate-950/95 border-b border-slate-900 text-right space-y-1.5 shrink-0" style={{ direction: 'rtl' }}>
            <span className="text-[10px] text-amber-500 font-black flex items-center gap-1.5 justify-end">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              <span>الذكاء القضائي الاصطناعي</span>
            </span>
            <h4 className="text-white text-xs font-black leading-tight">سكرتير محاكاة القوانين والخطوط المعزز</h4>
            <p className="text-slate-500 text-[9.5px] leading-normal font-semibold">
              انقر على أي من الوكلاء القانونيين بالأسفل أو تحدث صوتياً لتوجيه التوصية واستخراج الحكم على المنصة فوراً.
            </p>
          </div>

          {/* DYNAMIC COMPONENT: FORENSIC HANDWRITING LAB */}
          {currentAgent === 'forensic_doc_expert' && (
            <div className="p-4 border-b border-slate-900 bg-slate-950 text-right space-y-3.5 animate-in slide-in-from-top-3 duration-350" style={{ direction: 'rtl' }}>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  معمل جنائي متكامل
                </span>
                <h5 className="text-white text-xs font-black flex items-center gap-1">
                  <span>🔬 معمل فحص الخطوط والوثائق الجنائية</span>
                </h5>
              </div>

              {/* Upload simulation slots */}
              <div className="grid grid-cols-2 gap-2">
                <div 
                  onClick={() => {
                    setLabFile1('challenged_deed_sig.png');
                    triggerToast('📥 تم تحميل صورة المستند المطعون فيه للتواقيع', 'info');
                  }}
                  className={`border border-dashed p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    labFile1 ? 'border-amber-500/50 bg-amber-500/5 text-amber-400' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-black text-center truncate max-w-full">
                    {labFile1 ? '✓ المطعون فيه' : 'سند الملكية العرفي'}
                  </span>
                </div>

                <div 
                  onClick={() => {
                    setLabFile2('reference_sig.png');
                    triggerToast('📥 تم تحميل توقيع المضاهاة للمتوفى', 'info');
                  }}
                  className={`border border-dashed p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    labFile2 ? 'border-amber-500/50 bg-amber-500/5 text-amber-400' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-black text-center truncate max-w-full">
                    {labFile2 ? '✓ سند المضاهاة' : 'توقيع حي للمورث'}
                  </span>
                </div>
              </div>

              {/* Microscopic Sliders */}
              <div className="space-y-3 p-3 bg-slate-900/60 rounded-xl border border-slate-900">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-extrabold mb-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>معايير الفحص المجهري الطيفي:</span>
                </div>

                {/* Tremor Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] font-black text-slate-400">
                    <span>نسبة ارتعاش اليد الاصطناعي:</span>
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

                {/* Pen Drag Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] font-black text-slate-400">
                    <span>قوة سحب ومستوى عمق ضغط القلم:</span>
                    <span className="text-amber-500 font-mono">{penPressure}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={penPressure} 
                    onChange={(e) => setPenPressure(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950"
                  />
                </div>
              </div>

              {/* Action and scan animation */}
              <div className="space-y-2">
                <button
                  onClick={handleRunForensicScan}
                  disabled={labScanning}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-900 text-slate-950 disabled:text-slate-500 font-black py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{labScanning ? 'جاري المسح المجهري الطيفي...' : 'تشغيل التحليل الجنائي للخط'}</span>
                </button>

                {/* Reset button */}
                {(labFile1 || labFile2) && (
                  <button
                    onClick={() => {
                      setLabFile1('');
                      setLabFile2('');
                      setLabLogs([]);
                      setLabResult(false);
                      triggerToast('✓ تم تصفير معطيات معمل فحص الخطوط', 'info');
                    }}
                    className="w-full py-1.5 border border-slate-900 hover:border-slate-800 text-[10px] text-slate-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>تصفير الفحص الجنائي</span>
                  </button>
                )}
              </div>

              {/* Progress Bar & Logs */}
              {labScanning && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                      style={{ width: `${labProgress}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono space-y-1 bg-slate-900/50 p-2 rounded-lg border border-slate-900 max-h-[80px] overflow-y-auto">
                    {labLogs.map((log, idx) => (
                      <p key={idx} className="leading-tight">{log}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Certified Document Forensic Certificate */}
              {labResult && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/40 text-right space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-1 text-red-400 font-black text-[10.5px]">
                    <Award className="w-4 h-4 text-red-500" />
                    <span>⚠️ نتيجة الفحص الجنائي: تزوير قطعي بالسند!</span>
                  </div>
                  <p className="text-[9.5px] text-slate-300 leading-normal font-semibold">
                    - نسبة التطابق الفنية: <span className="text-red-400 font-mono font-black">{strokeMatch}%</span> (تباعد خطي واضح).
                    <br />
                    - ارتعاش حواف الحبر يؤكد التوقيع البطيء المصطنع لتقليد الأحرف الصاعدة والهابطة لاسم المورث.
                  </p>
                  <div className="text-[8px] text-slate-500 font-mono border-t border-slate-900 pt-1.5 flex justify-between">
                    <span>رقم الشهادة: AI-FORENSIC-92384</span>
                    <span>صادر لسيادة القاضي: {caseData.judge}</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Interactive Chat interface */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <AgentChatInterface 
              onSend={handleAgentRequest}
              agentsList={legalAgents}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

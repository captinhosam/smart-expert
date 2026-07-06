import React, { useState } from 'react';
import { CaseData, Heir } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Percent, 
  Coins, 
  BookOpen, 
  Scale, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  Cpu, 
  Play, 
  Award, 
  Download, 
  Calculator,
  User,
  GitPullRequest
} from 'lucide-react';
import { calculateAll } from '../utils/calculations';
import { EXPERT_SYSTEM_AGENTS } from '../data/expertSystemData';
import { triggerToast } from '../lib/toast';

const CHART_COLORS = [
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
  '#eab308', // yellow-500
];

interface HeirsHubTabProps {
  caseData: CaseData;
  onUpdateCaseData: (data: Partial<CaseData>) => void;
  onMaximize?: (panelId: 'heirs_list') => void;
  isMaximized?: boolean;
}

export default function HeirsHubTab({ 
  caseData, 
  onUpdateCaseData,
  onMaximize,
  isMaximized = false
}: HeirsHubTabProps) {
  const [newHeirName, setNewHeirName] = useState('');
  const [newHeirGender, setNewHeirGender] = useState<'male' | 'female'>('male');
  const [newHeirRelation, setNewHeirRelation] = useState<Heir['relationship']>('son');
  const [hoveredHeirId, setHoveredHeirId] = useState<string | null>(null);

  // Agent simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [activeSimulationSection, setActiveSimulationSection] = useState<'intro' | 'solving' | 'done' | null>(null);

  const results = calculateAll(caseData);
  const heirsShares = results.heirsShares;

  const handleAddHeir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeirName.trim()) {
      triggerToast('⚠️ يرجى إدخال اسم الوارث كاملاً', 'warning');
      return;
    }

    const newHeir: Heir = {
      id: `heir_${Date.now()}`,
      name: newHeirName.trim(),
      gender: newHeirGender,
      relationship: newHeirRelation
    };

    onUpdateCaseData({
      heirs: [...caseData.heirs, newHeir]
    });

    setNewHeirName('');
    triggerToast('👥 تم إدراج الوارث الجديد وحساب الأنصبة فورياً!', 'success');
  };

  const handleRemoveHeir = (id: string) => {
    onUpdateCaseData({
      heirs: caseData.heirs.filter(h => h.id !== id)
    });
    triggerToast('🗑️ تم حذف الوارث وإعادة احتساب المواريث', 'info');
  };

  const handleQuickAddPredefinedFamily = () => {
    const predefined: Heir[] = [
      { id: 'p_h1', name: 'أحمد محمد عبدالله', gender: 'male', relationship: 'son' },
      { id: 'p_h2', name: 'خالد محمد عبدالله', gender: 'male', relationship: 'son' },
      { id: 'p_h3', name: 'فاطمة محمد عبدالله', gender: 'female', relationship: 'daughter' },
      { id: 'p_h4', name: 'السيدة سارة أحمد علي', gender: 'female', relationship: 'wife' },
      { id: 'p_h5', name: 'الحاج محمد عبدالله (الأب)', gender: 'male', relationship: 'father' }
    ];
    onUpdateCaseData({
      heirs: predefined,
      estateValue: caseData.estateValue || 4500000
    });
    triggerToast('👪 تم تحميل عائلة نموذجية متكاملة وحساب تركتهم', 'success');
  };

  // Run swarm simulation specifically for heirs
  const handleRunHeirsSimulation = () => {
    setIsSimulating(true);
    setSimulationLog([]);
    setActiveSimulationSection('intro');

    const steps = [
      '🔄 جاري استدعاء **سرب الوكلاء القضائيين** المتخصص في التركات والمواريث الشائعة...',
      '🕵️‍♂️ **وكيل حصر الورثة** يقوم بفحص المستندات والتحقق من صلة القرابة الشرعية وقيد الوفاة...',
      '⚖️ **وكيل التقييم العقاري** يستخرج القيمة السوقية للعقار ويقدر قيمة التركة بـ ' + (caseData.estateValue || 240000).toLocaleString('ar-EG') + ' جنيه مصري...',
      '🧮 **وكيل الحسابات الشرعية** يشرع في تطبيق آيات المواريث وحساب مخارج الفروض والتعصيب (للذكر مثل حظ الأنثيين)...',
      '📑 **وكيل صياغة المذكرات** يكتب مسودة التقرير النهائي تمهيداً لعرضها على المستشار القاضي رئيس الدائرة الدستورية...',
      '✨ **وكيل العلاقات والقبول الاجتماعي** ينشئ صيغة تسوية عادلة وودية تقنع أطراف النزاع وتمنع التناحر المجتمعي.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationLog(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsSimulating(false);
          setActiveSimulationSection('done');
          triggerToast('🤖 تم انتهاء محاكاة عقل السرب وإعداد وثيقة المواريث!', 'success');
        } else {
          setActiveSimulationSection('solving');
        }
      }, (idx + 1) * 1200);
    });
  };

  return (
    <div 
      onDoubleClick={() => onMaximize?.('heirs_list')}
      className={`space-y-6 text-right ${!isMaximized ? 'cursor-pointer' : ''}`}
      title={!isMaximized ? "انقر نقراً مزدوجاً (Double Click) لتوسيع بوابة المواريث والورثة بعرض الشاشة" : undefined}
      dir="rtl"
    >
      
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-white text-lg font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500 shrink-0" />
              <span>بوابة المواريث والورثة القضائية الموحدة</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                مدمج بالكامل
              </span>
              {!isMaximized && (
                <span className="text-[9px] text-slate-500 font-bold animate-pulse mr-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                  (دبل كليك للتوسيع ⛶)
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold leading-relaxed">
              هذه الصفحة تجمع كل البيانات القضائية والمالية والرسومية الخاصة بالتركات وشجرة الورثة في مكان واحد. أي تحديث هنا ينعكس على تقارير الخبراء والرفع المساحي فورياً.
            </p>
          </div>
          
          <button
            onClick={handleQuickAddPredefinedFamily}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-slate-950/40"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>شحن عائلة نموذجية متكاملة للنزاع</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Add & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT: Input & Table (span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Heir Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <UserPlus className="w-4 h-4 text-amber-500" />
              <span>إدراج فرد جديد في شجرة العائلة والتركة</span>
            </h3>

            <form onSubmit={handleAddHeir} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[11px] font-bold">اسم الوارث الكامل</label>
                <input 
                  type="text" 
                  placeholder="مثال: هند محمد عبدالله"
                  value={newHeirName}
                  onChange={e => setNewHeirName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[11px] font-bold">الجنس الشرعي</label>
                <select 
                  value={newHeirGender} 
                  onChange={e => setNewHeirGender(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[11px] font-bold">صلة القرابة للمتوفى</label>
                <select 
                  value={newHeirRelation} 
                  onChange={e => setNewHeirRelation(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all font-bold"
                >
                  <option value="son">ابن (عصبة بالنفس)</option>
                  <option value="daughter">بنت (عصبة بالغير)</option>
                  <option value="wife">زوجة (صاحبة فرض)</option>
                  <option value="husband">زوج (صاحب فرض)</option>
                  <option value="father">أب (صاحب فرض)</option>
                  <option value="mother">أم (صاحبة فرض)</option>
                </select>
              </div>

              <div className="md:col-span-3 pt-2">
                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تثبيت الوارث وإعادة حساب التركة فورياً</span>
                </button>
              </div>
            </form>
          </div>

          {/* Heirs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center justify-between border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>جدول حصر الورثة المسجلين بالدعوى</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">إجمالي: {caseData.heirs.length} أفراد</span>
            </h3>

            {caseData.heirs.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-bold">
                      <th className="p-3">الاسم الثلاثي</th>
                      <th className="p-3">الجنس</th>
                      <th className="p-3">صلة القرابة الشرعية</th>
                      <th className="p-3">المركز في المواريث</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 font-medium">
                    {caseData.heirs.map((heir, idx) => {
                      const color = CHART_COLORS[idx % CHART_COLORS.length];
                      const isHovered = hoveredHeirId === heir.id;
                      return (
                        <tr 
                          key={heir.id} 
                          className={`transition-all duration-200 ${
                            isHovered ? 'bg-slate-800/40 text-white' : 'hover:bg-slate-800/10'
                          }`}
                          onMouseEnter={() => setHoveredHeirId(heir.id)}
                          onMouseLeave={() => setHoveredHeirId(null)}
                        >
                          <td className="p-3 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-2 ring-slate-950" 
                                style={{ backgroundColor: color }}
                              />
                              <span>{heir.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${heir.gender === 'male' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                              {heir.gender === 'male' ? 'ذكر' : 'أنثى'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-300">
                            {heir.relationship === 'son' && 'ابن'}
                            {heir.relationship === 'daughter' && 'ابنة'}
                            {heir.relationship === 'wife' && 'زوجة'}
                            {heir.relationship === 'husband' && 'زوج'}
                            {heir.relationship === 'father' && 'أب'}
                            {heir.relationship === 'mother' && 'أم'}
                          </td>
                          <td className="p-3 text-amber-400 font-bold">
                            {heir.relationship === 'son' || heir.relationship === 'daughter' 
                              ? 'عصبة (ميراث متبقي)' 
                              : 'صاحب فرض (أنصبة شرعية)'
                            }
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => handleRemoveHeir(heir.id)}
                              className="text-red-400 hover:text-red-350 p-1.5 hover:bg-slate-850 rounded transition-all cursor-pointer"
                              title="حذف الوارث"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs font-bold bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                لا يوجد ورثة مسجلين حالياً. اضغط على زر شحن العائلة أو أضف ورثة من النموذج أعلاه.
              </div>
            )}
          </div>

          {/* Family Tree Simulation - Visually Gorgeous */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <GitPullRequest className="w-4 h-4 text-amber-500" />
              <span>شجرة العائلة الرسومية المتفاعلة (Family Tree Simulation)</span>
            </h3>

            <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-850 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none"></div>

              {/* Deceased Head Card */}
              <div className="relative z-10 flex flex-col items-center mb-6">
                <div className="bg-red-500/10 border border-red-500/30 px-6 py-2.5 rounded-xl text-center shadow-lg">
                  <span className="text-[10px] text-red-400 font-bold block mb-0.5">المورِّث المتوفى (صاحب التركة)</span>
                  <span className="text-white text-xs font-black">مورِّث القضية {caseData.caseNumber}</span>
                  <span className="text-[9px] text-slate-500 block mt-1">تاريخ الوفاة الموثق: {caseData.date}</span>
                </div>
                {/* Stem line down */}
                <div className="w-0.5 h-6 bg-slate-800 mt-0"></div>
              </div>

              {/* Parents level */}
              {caseData.heirs.some(h => h.relationship === 'father' || h.relationship === 'mother') && (
                <div className="relative z-10 flex flex-wrap justify-center gap-6 mb-6">
                  {caseData.heirs.filter(h => h.relationship === 'father' || h.relationship === 'mother').map(p => (
                    <div key={p.id} className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl text-center min-w-[120px]">
                      <span className="text-[9px] text-purple-400 font-extrabold block">الأصول (فرض السدس)</span>
                      <span className="text-white text-xs font-black block mt-0.5">{p.name}</span>
                      <span className="text-[9px] text-slate-400">{p.relationship === 'father' ? 'أب شرعي' : 'أم شرعية'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Spouses level */}
              {caseData.heirs.some(h => h.relationship === 'wife' || h.relationship === 'husband') && (
                <div className="relative z-10 flex flex-wrap justify-center gap-6 mb-6">
                  {caseData.heirs.filter(h => h.relationship === 'wife' || h.relationship === 'husband').map(s => (
                    <div key={s.id} className="bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-xl text-center min-w-[120px] shadow-sm">
                      <span className="text-[9px] text-pink-400 font-extrabold block">الأزواج (فرض الثمن/الربع)</span>
                      <span className="text-white text-xs font-black block mt-0.5">{s.name}</span>
                      <span className="text-[9px] text-slate-400">{s.relationship === 'wife' ? 'زوجة شرعية' : 'زوج شرعي'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Children level */}
              {caseData.heirs.some(h => h.relationship === 'son' || h.relationship === 'daughter') ? (
                <div className="relative z-10 w-full">
                  {/* Horizontal joining line */}
                  <div className="h-0.5 bg-slate-800 w-3/4 mx-auto mb-4"></div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    {caseData.heirs.filter(h => h.relationship === 'son' || h.relationship === 'daughter').map(c => (
                      <div key={c.id} className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-center min-w-[100px] hover:border-amber-500/30 transition-all">
                        <span className="text-[9px] text-blue-400 font-extrabold block">الفروع (ميراث عصبة)</span>
                        <span className="text-white text-xs font-black block mt-0.5 truncate max-w-[110px]">{c.name}</span>
                        <span className="text-[9px] text-slate-400">{c.relationship === 'son' ? 'ابن (عصبة)' : 'ابنة (عصبة بالغير)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">لا يوجد فروع (أولاد) في التركة حالياً</p>
              )}
            </div>
          </div>

        </div>

        {/* LEFT: Calculations and Donut (span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>حاسبة المواريث والتركة الفورية</span>
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[11px] font-bold">قيمة التركة الإجمالية (بالجنيه المصري)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={caseData.estateValue}
                    onChange={e => onUpdateCaseData({ estateValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 pl-12 text-white text-xs font-black focus:outline-none transition-all font-mono"
                    placeholder="مثال: 5,000,000"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold font-sans">EGP</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  يتم تقسيم هذه القيمة تلقائياً طبقاً للفرائض الشرعية للفقه المصري المعتمد.
                </p>
              </div>

              {/* Main Donut Graph */}
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col items-center space-y-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    <circle cx="60" cy="60" r="45" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                    {(() => {
                      let accumulatedPercent = 0;
                      return heirsShares.map((share, idx) => {
                        const color = CHART_COLORS[idx % CHART_COLORS.length];
                        const circumference = 282.743;
                        const strokeDash = `${(share.sharePercent / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                        accumulatedPercent += share.sharePercent;
                        const isHovered = hoveredHeirId === share.id;
                        return (
                          <circle
                            key={share.id}
                            cx="60"
                            cy="60"
                            r="45"
                            fill="transparent"
                            stroke={color}
                            strokeWidth={isHovered ? 12 : 8}
                            strokeDasharray={strokeDash}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredHeirId(share.id)}
                            onMouseLeave={() => setHoveredHeirId(null)}
                            style={{ transformOrigin: '60px 60px' }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    <span className="text-[9px] text-slate-500 font-bold">إجمالي التركة</span>
                    <span className="text-xs font-black text-amber-400 font-mono tracking-tight mt-0.5">
                      {(caseData.estateValue || 240000).toLocaleString('ar-EG')} ج
                    </span>
                    <span className="text-[8px] text-slate-400 mt-1 leading-none">
                      {caseData.heirs.length} ورثة مسجلين
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="w-full space-y-1.5 pt-2">
                  {heirsShares.map((share, idx) => {
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    const isHovered = hoveredHeirId === share.id;
                    const relation = caseData.heirs.find(h => h.id === share.id)?.relationship;
                    return (
                      <div 
                        key={share.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 ${
                          isHovered ? 'bg-slate-800/40 border-slate-700 shadow-md' : 'bg-slate-950/40 border-slate-850'
                        }`}
                        onMouseEnter={() => setHoveredHeirId(share.id)}
                        onMouseLeave={() => setHoveredHeirId(null)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                          <div className="text-right">
                            <span className="text-white text-[11px] font-black">{share.name}</span>
                            <span className="text-[9px] text-slate-500 font-bold block">
                              {relation === 'son' && 'ابن (عصبة)'}
                              {relation === 'daughter' && 'ابنة (عصبة بالغير)'}
                              {relation === 'wife' && 'زوجة (فرض)'}
                              {relation === 'husband' && 'زوج (فرض)'}
                              {relation === 'father' && 'أب (فرض)'}
                              {relation === 'mother' && 'أم (فرض)'}
                            </span>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-amber-400 text-xs font-black font-mono leading-tight">{share.sharePercent.toFixed(1)}%</p>
                          <p className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">
                            {share.shareValue > 0 ? `${share.shareValue.toLocaleString('ar-EG')} ج` : share.shareFraction}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Swarm Agents specializing in inheritance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <Cpu className="w-4 h-4 text-amber-500" />
              <span>الوكلاء القضائيون الخبراء في المواريث والتركات</span>
            </h3>

            <div className="space-y-3">
              {EXPERT_SYSTEM_AGENTS.filter(a => a.sector === 'ميراث' || a.sector === 'أوقاف').map(agent => (
                <div key={agent.id} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-black">{agent.name}</span>
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1.5 py-0.2 rounded">
                        دقة: {agent.accuracy}%
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">{agent.description}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={handleRunHeirsSimulation}
                disabled={isSimulating}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner cursor-pointer"
              >
                <Play className={`w-4 h-4 text-amber-500 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'جاري محاكاة سرب الوكلاء...' : 'إطلاق محاكاة سرب الوكلاء لحل التركة'}</span>
              </button>

              {/* Simulation logs with cute styling */}
              {simulationLog.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 max-h-[220px] overflow-y-auto text-xs animate-in slide-in-from-bottom-2 duration-300">
                  <span className="text-[10px] text-amber-500 font-extrabold block border-b border-slate-900 pb-1 mb-2">سجل المحاكاة الذكي:</span>
                  {simulationLog.map((log, idx) => (
                    <div key={idx} className="text-[10px] text-slate-300 leading-relaxed font-mono flex items-start gap-1">
                      <span className="text-amber-500">•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {activeSimulationSection === 'done' && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded mt-2 text-[10px] text-amber-400 font-black flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>اكتملت التسوية! يمكنك الآن استخراج التقرير من صفحة التقرير النهائي.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Legal Guide & Documents required */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>المستندات المطلوبة والدليل الفقهي للتركات</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              
              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2">
                <span className="text-white text-[11px] font-black block">📁 مستندات ثبوتية إلزامية للمواريث:</span>
                <ul className="space-y-1.5 text-[10px] text-slate-400 font-semibold list-disc list-inside">
                  <li><strong className="text-slate-300">إعلام الوراثة الشرعي:</strong> صادر عن محكمة الأسرة مبيناً تاريخ الوفاة والورثة الشرعيين دون سواهم.</li>
                  <li><strong className="text-slate-300">شهادة الوفاة الرسمية:</strong> شهادة وفاة المورث كمستند أساسي لفتح قيد التركة.</li>
                  <li><strong className="text-slate-300">سجل جرد التركة الرسمي:</strong> حصر مساحي وهندسي للأصول العقارية والأطيان المسجلة باسم المتوفى.</li>
                  <li><strong className="text-slate-300">قرار الوصاية:</strong> صادر من النيابة الحسبية في حال وجود قُصَّر دون سن الرشد القانوني.</li>
                </ul>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2">
                <span className="text-white text-[11px] font-black block">⚖️ المرجعية القانونية في القانون المصري:</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  تنص <strong className="text-slate-300">المادة 825 من القانون المدني المصري</strong> على أن كل شريك في الشيوع يملك حصته ملكاً تاماً، وله أن يتصرف فيها وأن يستولي على ثمارها وأن يستعملها بحيث لا يلحق الضرر بحقوق سائر الشركاء. وفي المواريث، يتم فرز وتجنيب حصص الشركاء عيناً إذا كانت العقارات قابلة للقسمة دون نقص كبير في قيمتها.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

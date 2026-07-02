import React, { useState } from 'react';
import { CaseData, Heir } from '../types';
import { 
  Building2, 
  Trash2, 
  UserPlus, 
  Users, 
  Coins, 
  AlertTriangle, 
  FileCheck,
  Percent,
  TrendingUp,
  Landmark,
  Calendar,
  Clock,
  Plus,
  Bell,
  Gavel
} from 'lucide-react';
import { calculateAll } from '../utils/calculations';

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

interface CaseDetailsTabProps {
  caseData: CaseData;
  onUpdateCaseData: (data: Partial<CaseData>) => void;
}

export default function CaseDetailsTab({ caseData, onUpdateCaseData }: CaseDetailsTabProps) {
  const [newHeirName, setNewHeirName] = useState('');
  const [newHeirGender, setNewHeirGender] = useState<'male' | 'female'>('male');
  const [newHeirRelation, setNewHeirRelation] = useState<Heir['relationship']>('son');
  const [hoveredHeirId, setHoveredHeirId] = useState<string | null>(null);

  // State variables for dynamic court session entry
  const [sessDate, setSessDate] = useState('2026-07-08');
  const [sessTime, setSessTime] = useState('10:00');
  const [sessType, setSessType] = useState('معاينة ميدانية');
  const [sessNotes, setSessNotes] = useState('');

  const results = calculateAll(caseData);
  const heirsShares = results.heirsShares;

  const sessions = caseData.sessions || [];

  // Find the next upcoming session (date >= today: 2026-07-01)
  const todayStr = "2026-07-01";
  const upcomingSessions = sessions
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
    
  const nextSession = upcomingSessions[0];
  let daysUntilNext = -1;
  if (nextSession) {
    const todaySec = new Date(todayStr).getTime();
    const sessSec = new Date(nextSession.date).getTime();
    const diffTime = sessSec - todaySec;
    daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessDate || !sessType.trim()) return;

    const newSession = {
      id: `sess_${Date.now()}`,
      date: sessDate,
      time: sessTime || '09:00',
      type: sessType.trim(),
      notes: sessNotes.trim() || 'لا توجد ملاحظات إضافية.'
    };

    onUpdateCaseData({
      sessions: [...sessions, newSession]
    });

    setSessNotes('');
  };

  const handleRemoveSession = (id: string) => {
    onUpdateCaseData({
      sessions: sessions.filter(s => s.id !== id)
    });
  };


  const handleAddHeir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeirName.trim()) return;

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
  };

  const handleRemoveHeir = (id: string) => {
    onUpdateCaseData({
      heirs: caseData.heirs.filter(h => h.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 🕰️ NEXT UPCOMING COURT SESSION ALERT BANNER 🕰️ */}
      {nextSession && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
          daysUntilNext <= 3 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.07)] animate-pulse' 
            : daysUntilNext <= 7 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.07)]' 
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.07)]'
        }`}>
          <div className="flex items-center gap-3 text-right">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              daysUntilNext <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">تنبيه بقرب موعد الجلسة القضائية القادمة</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                الجلسة المعينة بعنوان <span className="font-bold underline text-amber-400">({nextSession.type})</span> مقررة في تاريخ <span className="font-mono font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded">{nextSession.date}</span> في تمام الساعة <span className="font-mono font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded">{nextSession.time}</span>.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">الوقت المتبقي</span>
            <span className="text-sm sm:text-base font-black font-mono mt-0.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              {daysUntilNext === 0 ? 'اليوم!' : daysUntilNext === 1 ? 'غداً!' : `خلال ${daysUntilNext} أيام`}
            </span>
          </div>
        </div>
      )}
      
      {/* 1. Basic Case Profile Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-white text-base font-black mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCheck className="w-5 h-5 text-amber-500" />
          <span>البيانات الأساسية للقضية (المحكمة الابتدائية)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">رقم القضية</label>
            <input 
              type="text" 
              value={caseData.caseNumber}
              onChange={e => onUpdateCaseData({ caseNumber: e.target.value })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">عنوان القضية الفني</label>
            <input 
              type="text" 
              value={caseData.title}
              onChange={e => onUpdateCaseData({ title: e.target.value })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">اسم المحكمة المختصة</label>
            <input 
              type="text" 
              value={caseData.court}
              onChange={e => onUpdateCaseData({ court: e.target.value })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">المستشار القاضي رئيس الدائرة</label>
            <input 
              type="text" 
              value={caseData.judge}
              onChange={e => onUpdateCaseData({ judge: e.target.value })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Land & Property Specifications Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Land Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-white text-base font-black flex items-center gap-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>مواصفات الأرض والرفع المساحي</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-bold">مساحة الأرض الكلية (متر مربع)</label>
              <input 
                type="number" 
                value={caseData.landArea}
                onChange={e => onUpdateCaseData({ landArea: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-bold">تصنيف ونوع الأرض</label>
              <select 
                value={caseData.landType}
                onChange={e => onUpdateCaseData({ landType: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
              >
                <option value="زراعية">زراعية</option>
                <option value="بناء">أرض بناء (سكني/خدمي)</option>
                <option value="صحراوية">صحراوية</option>
                <option value="صناعية">صناعية</option>
                <option value="تجارية">تجارية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Building Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-white text-base font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>بيانات المنشأ الإنشائي (إن وجد)</span>
            </h3>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={caseData.hasBuilding}
                onChange={e => onUpdateCaseData({ hasBuilding: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="mr-2 text-xs font-bold text-slate-300">يوجد مبنى قائم</span>
            </label>
          </div>

          {caseData.hasBuilding ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-bold">مساحة مسطح البناء (م²)</label>
                <input 
                  type="number" 
                  value={caseData.buildingArea}
                  onChange={e => onUpdateCaseData({ buildingArea: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-bold">عدد الأدوار القائمة</label>
                <input 
                  type="number" 
                  value={caseData.floors}
                  onChange={e => onUpdateCaseData({ floors: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-bold">نوع ومستوى التشطيب</label>
                <select 
                  value={caseData.finishType}
                  onChange={e => onUpdateCaseData({ finishType: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                >
                  <option value="قديم">تشطيب قديم</option>
                  <option value="نصف تشطيب">نصف تشطيب</option>
                  <option value="لوكس">تشطيب لوكس</option>
                  <option value="سوبر لوكس">تشطيب سوبر لوكس</option>
                  <option value="الترا سوبر لوكس">ألترا سوبر لوكس</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-bold">نوع استخدام المبنى</label>
                <select 
                  value={caseData.buildingType}
                  onChange={e => onUpdateCaseData({ buildingType: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                >
                  <option value="سكني">سكني</option>
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                  <option value="صناعي">صناعي</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-bold">عمر المبنى (سنوات)</label>
                <input 
                  type="number" 
                  value={caseData.buildingAge}
                  onChange={e => onUpdateCaseData({ buildingAge: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs py-4 text-center">أرض فضاء خالية تماماً من الإنشاءات الخرسانية</p>
          )}
        </div>
      </div>

      {/* 3. Valuation & Income Parameters Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-white text-base font-black mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Coins className="w-5 h-5 text-amber-500" />
          <span>المعايير المالية والإيرادات السنوية (المثبتة)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">العائد الإيجاري السنوي الإجمالي (جنيه)</label>
            <input 
              type="number" 
              value={caseData.annualRent}
              onChange={e => onUpdateCaseData({ annualRent: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">قيمة التركة الإجمالية للمواريث (جنيه)</label>
            <input 
              type="number" 
              value={caseData.estateValue}
              onChange={e => onUpdateCaseData({ estateValue: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">القيمة السوقية المرجعية المبدئية للعقار (جنيه)</label>
            <input 
              type="number" 
              value={caseData.transactionValue}
              onChange={e => onUpdateCaseData({ transactionValue: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Disputes & Boundaries Litigation Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-white text-base font-black flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>النزاعات القانونية والتداخل في الملكية</span>
          </h3>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={caseData.dispute.hasDispute}
              onChange={e => onUpdateCaseData({ 
                dispute: { ...caseData.dispute, hasDispute: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="mr-2 text-xs font-bold text-slate-300">يوجد نزاع قضائي معلق</span>
          </label>
        </div>

        {caseData.dispute.hasDispute && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-bold">تصنيف النزاع الفني</label>
              <select 
                value={caseData.dispute.type}
                onChange={e => onUpdateCaseData({ 
                  dispute: { ...caseData.dispute, type: e.target.value as any }
                })}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
              >
                <option value="ownership">نزاع ملكية وحجية سندات</option>
                <option value="boundary">نزاع تداخل حدود ومساحات</option>
                <option value="inheritance">نزاع فرز وتوزيع تركة ورثة</option>
                <option value="contract">نزاع عقود، إيجار وشروط صياغة</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-bold">تفاصيل الادعاءات وتوصيات المحكمة للخبرة</label>
              <input 
                type="text" 
                value={caseData.dispute.details}
                onChange={e => onUpdateCaseData({ 
                  dispute: { ...caseData.dispute, details: e.target.value }
                })}
                placeholder="أدخل مذكرات الخصوم أو الادعاء المتنازع عليه..."
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Heirs & Inheritance Registry Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-white text-base font-black flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-amber-500" />
          <span>شجرة الورثة وقيد توزيع الأنصبة الشرعية</span>
        </h3>

        {/* Form to Add Heir */}
        <form onSubmit={handleAddHeir} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">اسم الوارث الكامل</label>
            <input 
              type="text" 
              placeholder="مثال: أحمد محمد عبدالله"
              value={newHeirName}
              onChange={e => setNewHeirName(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-bold">الجنس</label>
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
            <label className="text-slate-400 text-xs font-bold">صلة القرابة للمتوفى</label>
            <select 
              value={newHeirRelation} 
              onChange={e => setNewHeirRelation(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all"
            >
              <option value="son">ابن (عصبة)</option>
              <option value="daughter">بنت (عصبة)</option>
              <option value="wife">زوجة (صاحبة فرض)</option>
              <option value="husband">زوج (صاحب فرض)</option>
              <option value="father">أب (صاحب فرض)</option>
              <option value="mother">أم (صاحبة فرض)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إدراج الوارث بالشجرة</span>
            </button>
          </div>
        </form>

        {/* Heirs Table & Interactive Pie/Donut Chart Bento Grid */}
        {caseData.heirs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Right: Heirs Table (span 7) */}
            <div className="lg:col-span-7 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold">
                    <th className="p-3">الاسم</th>
                    <th className="p-3">الجنس</th>
                    <th className="p-3">صلة القرابة</th>
                    <th className="p-3">القسمة الشرعية المقدرة</th>
                    <th className="p-3 text-center w-16">حذف</th>
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
                          isHovered ? 'bg-slate-800/60 text-white' : 'hover:bg-slate-800/20'
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
                        <td className="p-3 text-amber-400 font-bold font-mono">
                          {heir.relationship === 'son' || heir.relationship === 'daughter' 
                            ? 'عصبة (للذكر مثل حظ الأنثيين)' 
                            : heir.relationship === 'wife' 
                            ? 'فرض (ثمن/ربع التركة)' 
                            : heir.relationship === 'husband'
                            ? 'فرض (ربع/نصف التركة)'
                            : 'فرض (سدس التركة)'
                          }
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleRemoveHeir(heir.id)}
                            className="text-red-400 hover:text-red-350 p-1 hover:bg-slate-850 rounded transition-all cursor-pointer"
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

            {/* Left: Custom SVG Donut Chart (span 5) */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-5 rounded-xl flex flex-col items-center space-y-4 shadow-inner">
              <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
                <h4 className="text-white text-xs font-black flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span>توزيع الأنصبة الشرعية بيانياً</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">بناءً على الشريعة الإسلامية</span>
              </div>

              {/* Dynamic SVG Donut */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="45" 
                    fill="transparent" 
                    stroke="#1e293b" 
                    strokeWidth="8" 
                  />
                  {/* Slices */}
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
                          style={{
                            transformOrigin: '60px 60px',
                          }}
                        />
                      );
                    });
                  })()}
                </svg>
                
                {/* Center text of the donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[9px] text-slate-400 font-bold">القسمة الشرعية</span>
                  <span className="text-sm font-black text-amber-400 font-mono tracking-tight mt-0.5 leading-none">
                    {caseData.estateValue > 0 
                      ? `${caseData.estateValue.toLocaleString('ar-EG')} ج` 
                      : 'توزيع نسبي'}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold mt-1 leading-none">
                    {caseData.heirs.length} ورثة مسجلين
                  </span>
                </div>
              </div>

              {/* Custom interactive legend */}
              <div className="w-full space-y-2 mt-2">
                {heirsShares.map((share, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  const isHovered = hoveredHeirId === share.id;
                  const relationship = caseData.heirs.find(h => h.id === share.id)?.relationship;
                  return (
                    <div 
                      key={share.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                        isHovered 
                          ? 'bg-slate-800/50 border-slate-700 shadow-md translate-x-1' 
                          : 'bg-slate-950/20 border-slate-850'
                      }`}
                      onMouseEnter={() => setHoveredHeirId(share.id)}
                      onMouseLeave={() => setHoveredHeirId(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-1 ring-slate-800" 
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-right">
                          <p className="text-white text-[11px] font-black leading-tight">{share.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                            {relationship === 'son' && 'ابن (عصبة)'}
                            {relationship === 'daughter' && 'ابنة (عصبة)'}
                            {relationship === 'wife' && 'زوجة (فرض)'}
                            {relationship === 'husband' && 'زوج (فرض)'}
                            {relationship === 'father' && 'أب (فرض)'}
                            {relationship === 'mother' && 'أم (فرض)'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left shrink-0">
                        <p className="text-amber-400 text-xs font-black font-mono leading-tight">{share.sharePercent.toFixed(1)}%</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 font-mono font-sans">
                          {share.shareFraction}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
            لا يوجد ورثة مسجلين في الشجرة بعد. استخدم النموذج أعلاه للإضافة.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🕰️ 3. COURT SESSIONS TIMELINE & SCHEDULER 🕰️ */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <h3 className="text-white text-base font-black flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-500" />
            <span>جدول الجلسات القضائية والخطط الزمنية للمحاكمة</span>
          </h3>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
            {sessions.length} جلسات مسجلة
          </span>
        </div>

        {/* Add Session Form */}
        <form onSubmit={handleAddSession} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-4 shadow-inner">
          <h4 className="text-white text-xs font-black flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>تسجيل جلسة قضائية أو إجراء خبير جديد</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-[11px] font-bold">تاريخ الجلسة</label>
              <input 
                type="date"
                required
                value={sessDate}
                onChange={e => setSessDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-[11px] font-bold">وقت الجلسة</label>
              <input 
                type="time"
                value={sessTime}
                onChange={e => setSessTime(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-[11px] font-bold">تصنيف الجلسة / نوع الإجراء</label>
              <select 
                value={sessType}
                onChange={e => setSessType(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none transition-all"
              >
                <option value="معاينة ميدانية">معاينة ميدانية للموقع</option>
                <option value="جلسة فرز وتجنيب">جلسة فرز وتجنيب الأنصبة</option>
                <option value="تقديم مذكرات ومستندات">تقديم مذكرات ومستندات</option>
                <option value="جلسة خبراء وتداول">جلسة خبراء وتداول الأقوال</option>
                <option value="جلسة حسم ونطق بالحكم">جلسة حسم ونطق بالحكم</option>
                <option value="جلسة مرافعة شفهية">جلسة مرافعة شفهية</option>
                <option value="أخرى">أخرى / إجراء مخصص</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[11px] font-bold">ملاحظات المحكمة والتعليمات القضائية الفنية الخاصة بالجلسة</label>
            <textarea 
              rows={2}
              placeholder="اكتب توجيهات المستشار رئيس الدائرة أو تعليمات الحضور أو مستهدفات المعاينة الميدانية..."
              value={sessNotes}
              onChange={e => setSessNotes(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button 
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج الجلسة في الجدول الزمني</span>
            </button>
          </div>
        </form>

        {/* Timeline representation */}
        {sessions.length > 0 ? (
          <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-3 before:w-0.5 before:bg-slate-800">
            {sessions
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((sess) => {
                const isUpcoming = sess.date >= todayStr;
                return (
                  <div key={sess.id} className="relative pr-8 group">
                    {/* Circle Indicator on the line */}
                    <span className={`absolute right-1.5 top-2.5 w-3.5 h-3.5 rounded-full border-2 transform translate-x-1/2 transition-all ${
                      isUpcoming 
                        ? 'bg-amber-500 border-slate-900 ring-4 ring-amber-500/20' 
                        : 'bg-slate-800 border-slate-900'
                    }`} />
                    
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 hover:border-slate-700 transition-all text-right">
                      <div className="space-y-1.5 text-right flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-xs font-black">{sess.type}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isUpcoming 
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isUpcoming ? 'جلسة قادمة' : 'جلسة سابقة'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{sess.notes}</p>
                      </div>
                      
                      <div className="flex items-center justify-between md:flex-col md:items-end shrink-0 gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-850">
                        <div className="text-slate-300 font-mono text-xs font-bold text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span>{sess.date}</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div className="flex items-center gap-1.5 justify-end mt-0.5 text-[11px] text-slate-400">
                            <span>{sess.time}</span>
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => handleRemoveSession(sess.id)}
                          className="text-red-400 hover:text-red-350 p-1 hover:bg-slate-900 rounded transition-all cursor-pointer"
                          title="حذف الجلسة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
            لم يتم تسجيل أي جلسات قضائية أو خطط زمنية للمحاكمة حتى الآن.
          </div>
        )}
      </div>
    </div>
  );
}

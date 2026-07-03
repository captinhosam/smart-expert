import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { CaseData } from '../types';
import { ShieldCheck, Compass, BarChart3, Activity } from 'lucide-react';

interface ComplianceTrendsProps {
  caseData: CaseData;
  theme: 'dark' | 'paper';
}

export default function ComplianceTrends({ caseData, theme }: ComplianceTrendsProps) {
  const [chartType, setChartType] = useState<'radar' | 'bar' | 'line'>('radar');

  const baseScore = caseData.complianceScore || 94;

  // Compute realistic categories based on the current case properties
  // Category 1: Building Heights & Floors Adherence (الارتفاعات والأدوار)
  let heightScore = 95;
  if (caseData.floors > 6) heightScore = 72;
  else if (caseData.floors > 4) heightScore = 85;
  else if (caseData.floors === 0) heightScore = 98; // Land with no building is fully compliant with height

  // Category 2: Boundary & Setbacks (الارتدادات والحدود)
  let setbackScore = Math.max(60, Math.min(100, Math.round(baseScore * 0.95)));
  if (caseData.dispute.hasDispute && caseData.dispute.type === 'boundary') {
    setbackScore = 64;
  }

  // Category 3: Land-use & Zoning Match (التوافق مع المخطط العمراني)
  let zoningScore = 98;
  if (caseData.landType === 'زراعية' && caseData.buildingType === 'تجاري') {
    zoningScore = 45;
  } else if (caseData.landType === 'زراعية' && caseData.buildingType === 'سكني') {
    zoningScore = 70;
  }

  // Category 4: Structural Integrity (السلامة الإنشائية وجودة البناء)
  let structuralScore = 96;
  if (caseData.hasBuilding) {
    const agePenalty = Math.min(40, caseData.buildingAge * 1.2);
    structuralScore = Math.round(Math.max(55, 98 - agePenalty));
  } else {
    structuralScore = 100;
  }

  // Category 5: Safety Regulations (متطلبات الأمان والحرائق)
  let safetyScore = 92;
  if (caseData.buildingType === 'صناعي' || caseData.buildingType === 'تجاري') {
    safetyScore = 80;
  } else if (caseData.buildingType === 'إداري') {
    safetyScore = 88;
  }

  // Category 6: Permits & Legal Documentation (التراخيص والمستندات القانونية)
  let docScore = Math.max(50, Math.min(100, Math.round(baseScore * 1.02)));
  if (caseData.dispute.hasDispute && caseData.dispute.type === 'ownership') {
    docScore = Math.max(50, docScore - 20);
  }

  // Combine into data format
  const complianceData = [
    {
      subject: 'الارتفاعات والأدوار',
      'العقار الحالي': heightScore,
      'المعيار الكودي المستهدف': 90,
      fullMark: 100,
    },
    {
      subject: 'الارتدادات والحدود',
      'العقار الحالي': setbackScore,
      'المعيار الكودي المستهدف': 95,
      fullMark: 100,
    },
    {
      subject: 'التوافق العمراني',
      'العقار الحالي': zoningScore,
      'المعيار الكودي المستهدف': 100,
      fullMark: 100,
    },
    {
      subject: 'السلامة الإنشائية',
      'العقار الحالي': structuralScore,
      'المعيار الكودي المستهدف': 95,
      fullMark: 100,
    },
    {
      subject: 'أمان الحريق والطوارئ',
      'العقار الحالي': safetyScore,
      'المعيار الكودي المستهدف': 95,
      fullMark: 100,
    },
    {
      subject: 'التراخيص والمستندات',
      'العقار الحالي': docScore,
      'المعيار الكودي المستهدف': 98,
      fullMark: 100,
    },
  ];

  const overallCaseAverage = Math.round(
    (heightScore + setbackScore + zoningScore + structuralScore + safetyScore + docScore) / 6
  );
  const targetAverage = 95;

  const isPaper = theme === 'paper';
  const colors = {
    case: isPaper ? '#1d4ed8' : '#06b6d4',      // Blue vs Cyan
    target: isPaper ? '#b45309' : '#f59e0b',    // Amber vs Gold
    grid: isPaper ? '#e2e8f0' : '#1e293b',
    tooltipBg: isPaper ? '#fefefe' : '#0f172a',
    tooltipBorder: isPaper ? '#cbd5e1' : '#1e293b',
    text: isPaper ? '#334155' : '#94a3b8',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-xl border font-sans text-right shadow-xl space-y-1.5 backdrop-blur-md text-white"
          style={{ 
            backgroundColor: colors.tooltipBg, 
            borderColor: colors.tooltipBorder,
          }}
        >
          <div className="text-[11px] font-black border-b pb-1 flex items-center justify-between gap-4 border-slate-700">
            <span>مؤشر: {payload[0].payload.subject}</span>
          </div>
          <div className="space-y-1">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                  <span>{p.name}:</span>
                </div>
                <span className="font-mono text-left">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="compliance-trends-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <h3 className="text-white text-sm font-black">تحليل مطابقة الكود المصري واشتراطات البناء</h3>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              مقارنة مؤشرات سلامة العقار الحالي وتراخيصه مع المعايير القياسية المعتمدة
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center bg-slate-950/85 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setChartType('radar')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${chartType === 'radar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="مخطط راداري (شبكي)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden md:inline">راداري</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${chartType === 'bar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="مخطط أعمدة مقارن"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden md:inline">أعمدة</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${chartType === 'line' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="مخطط خطي"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden md:inline">خطي</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
        <div className="text-center p-2 border-b sm:border-b-0 sm:border-l border-slate-850 last:border-0">
          <span className="text-[9px] text-slate-500 font-black block">معدل الامتثال الكلي للعقار</span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${overallCaseAverage >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {overallCaseAverage >= 90 ? 'مطابق للكود' : 'ملاحظات تصالح'}
            </span>
            <span className="text-white text-base font-mono font-black">{overallCaseAverage}%</span>
          </div>
        </div>
        <div className="text-center p-2 border-b sm:border-b-0 sm:border-l border-slate-850 last:border-0">
          <span className="text-[9px] text-slate-500 font-black block">المعيار الكودي المستهدف</span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="bg-amber-500/10 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-black">هدف معياري</span>
            <span className="text-slate-300 text-base font-mono font-black">{targetAverage}%</span>
          </div>
        </div>
        <div className="text-center p-2">
          <span className="text-[9px] text-slate-500 font-black block">مستوى خطورة النزاع الحالي</span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            {caseData.dispute.hasDispute ? (
              <span className="bg-red-500/15 text-red-400 text-[10px] px-2 py-0.5 rounded font-black animate-pulse">
                نزاع {caseData.dispute.type === 'boundary' ? 'حدود نشط' : caseData.dispute.type === 'ownership' ? 'ملكية عالق' : 'عقدي'}
              </span>
            ) : (
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black">
                مستقر ومطابق
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Stage */}
      <div className="h-[250px] w-full bg-slate-950/20 p-2 rounded-xl border border-slate-850 relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={complianceData}>
              <PolarGrid stroke={colors.grid} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: colors.text, fontSize: 8 }}
                axisLine={false}
              />
              <Radar 
                name="العقار الحالي" 
                dataKey="العقار الحالي" 
                stroke={colors.case} 
                fill={colors.case} 
                fillOpacity={0.25} 
                strokeWidth={2}
              />
              <Radar 
                name="المعيار الكودي المستهدف" 
                dataKey="المعيار الكودي المستهدف" 
                stroke={colors.target} 
                fill={colors.target} 
                fillOpacity={0.05} 
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={30} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '5px' }}
              />
            </RadarChart>
          ) : chartType === 'bar' ? (
            <BarChart data={complianceData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="subject" 
                tick={{ fill: colors.text, fontSize: 9, fontWeight: 'bold' }} 
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: colors.text, fontSize: 9, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={30} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '5px' }}
              />
              <Bar 
                dataKey="العقار الحالي" 
                fill={colors.case} 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                name="العقار الحالي"
              />
              <Bar 
                dataKey="المعيار الكودي المستهدف" 
                fill={colors.target} 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                name="المعيار الكودي المستهدف"
              />
            </BarChart>
          ) : (
            <LineChart data={complianceData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="subject" 
                tick={{ fill: colors.text, fontSize: 9, fontWeight: 'bold' }} 
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: colors.text, fontSize: 9, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={30} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '5px' }}
              />
              <Line 
                type="monotone" 
                dataKey="العقار الحالي" 
                stroke={colors.case} 
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                name="العقار الحالي"
              />
              <Line 
                type="monotone" 
                dataKey="المعيار الكودي المستهدف" 
                stroke={colors.target} 
                strokeWidth={2}
                strokeDasharray="4 4"
                name="المعيار الكودي المستهدف"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Informational Warning / Insight */}
      <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl text-[10px] text-slate-400 font-semibold leading-relaxed flex items-start gap-2">
        <span className="text-cyan-400 mt-0.5">💡</span>
        <div>
          {overallCaseAverage >= 90 ? (
            <p>
              يظهر التحليل التقاطعي أن العقار المختار يحقق معايير أمان ممتازة ونسبة مطابقة عامة تبلغ <span className="text-white font-mono font-black">{overallCaseAverage}%</span>. نوصي باستخراج رخصة تصالح نهائية لحسم الملف في المحكمة.
            </p>
          ) : (
            <p>
              تنبيه: العقار يسجل فجوة امتثال دون المستهدف في بعض الجوانب مثل <span className="text-red-400 font-bold">
                {heightScore < 80 ? 'الارتفاعات والأدوار' : setbackScore < 80 ? 'الارتدادات والحدود' : structuralScore < 80 ? 'السلامة الإنشائية' : 'أمان الحريق والطوارئ'}
              </span>. يجب على الخبير القضائي توثيق هذه الفروقات في التقرير ومطالبة الخصوم بتوفيق الأوضاع.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

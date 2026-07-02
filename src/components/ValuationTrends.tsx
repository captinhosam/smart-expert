import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { CalculationResults } from '../types';
import { TrendingUp, BarChart3, LineChart as LineIcon, Activity, HelpCircle } from 'lucide-react';

interface ValuationTrendsProps {
  results: CalculationResults;
  theme: 'dark' | 'paper';
}

export default function ValuationTrends({ results, theme }: ValuationTrendsProps) {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [viewMode, setViewMode] = useState<'both' | 'total' | 'components'>('both');

  const totalVal = results.totalPropertyValue || 3500000;
  const landVal = results.landValue || 2000000;
  const buildingVal = results.depreciatedBuildingValue || 1500000;

  // Generate dynamic 10-year historic and projected data based on current valuation
  // Egyptian real estate average appreciation is around 12% annually. Let's model historic and future values.
  const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];
  
  const data = years.map((year) => {
    // 2026 is the base year (current time)
    const diff = year - 2026;
    let multiplier = 1;
    
    if (diff < 0) {
      // Historic values (discounting back)
      multiplier = Math.pow(1 / 1.12, Math.abs(diff));
    } else if (diff > 0) {
      // Future projected values (compounding forward)
      multiplier = Math.pow(1.12, diff);
    }

    const currentTotal = Math.round(totalVal * multiplier);
    const currentLand = Math.round(landVal * Math.pow(diff < 0 ? 1/1.10 : 1.10, Math.abs(diff)) * (diff < 0 ? 1 : 1));
    const currentBuilding = Math.max(0, Math.round(currentTotal - currentLand));

    return {
      year: year.toString(),
      'القيمة الإجمالية': currentTotal,
      'قيمة الأرض': currentLand,
      'قيمة المباني': currentBuilding,
      label: year === 2026 ? '2026 (الحالي)' : year.toString(),
    };
  });

  const isPaper = theme === 'paper';
  
  // Custom colors matching the visual identities
  const colors = {
    total: isPaper ? '#1e40af' : '#06b6d4', // Navy vs Neon Cyan
    land: isPaper ? '#166534' : '#10b981',  // Green vs Emerald
    building: isPaper ? '#991b1b' : '#f59e0b', // Red vs Amber
    grid: isPaper ? '#e5e7eb' : '#1e293b',
    tooltipBg: isPaper ? '#fdfaf3' : '#0f172a',
    tooltipBorder: isPaper ? '#cbbe97' : '#1e293b',
    text: isPaper ? '#453b30' : '#94a3b8'
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)} مليون ج`;
    }
    return `${(val / 1000).toFixed(0)} ألف ج`;
  };

  // Custom tooltip with stylish Arabic typography and design
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3.5 rounded-xl border font-sans text-right shadow-xl space-y-2 backdrop-blur-md"
          style={{ 
            backgroundColor: colors.tooltipBg, 
            borderColor: colors.tooltipBorder,
            color: isPaper ? '#1a1510' : '#ffffff'
          }}
        >
          <div className="text-xs font-black border-b pb-1.5 flex items-center justify-between gap-4" style={{ borderColor: isPaper ? '#cbbe97' : '#334155' }}>
            <span>سنة {label}</span>
            {label === '2026' && <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">تقييم اليوم</span>}
          </div>
          <div className="space-y-1">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-5 text-[11px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                  <span>{p.name}:</span>
                </div>
                <span className="font-mono text-left">{p.value.toLocaleString('ar-EG')} ج</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="valuation-trends-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500 animate-pulse" />
          <div className="flex flex-col text-right">
            <h3 className="text-white text-sm font-black">التطور الزمني والتقدير الجيوديسي لقيمة العقار</h3>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              نمذجة ديناميكية مدعومة ببيانات D3 لتوقعات القيمة والجدوى الاستثمارية حتى 2031
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-950/85 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${chartType === 'area' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="مخطط مساحي"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${chartType === 'line' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="مخطط خطي"
            >
              <LineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${chartType === 'bar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="مخطط أعمدة"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Value View Mode Toggle */}
          <div className="flex items-center bg-slate-950/85 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${viewMode === 'both' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              شامل
            </button>
            <button
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${viewMode === 'total' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              الإجمالي
            </button>
            <button
              onClick={() => setViewMode('components')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${viewMode === 'components' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              المكونات
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-[280px] w-full bg-slate-950/20 p-2.5 rounded-xl border border-slate-850 relative">
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-amber-500/5 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-500/20 font-bold">
          <span>معدل نمو مركب سنوي: +12%</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="totalGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.total} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={colors.total} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="landGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.land} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={colors.land} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="buildingGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.building} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={colors.building} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }} 
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
              />
              {viewMode !== 'components' && (
                <Area 
                  type="monotone" 
                  dataKey="القيمة الإجمالية" 
                  stroke={colors.total} 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#totalGlow)" 
                  name="القيمة الكلية للعقار"
                />
              )}
              {viewMode !== 'total' && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="قيمة الأرض" 
                    stroke={colors.land} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#landGlow)" 
                    name="قيمة الأرض المنفردة"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="قيمة المباني" 
                    stroke={colors.building} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#buildingGlow)" 
                    name="قيمة المنشآت المستهلكة"
                  />
                </>
              )}
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
              />
              {viewMode !== 'components' && (
                <Line 
                  type="monotone" 
                  dataKey="القيمة الإجمالية" 
                  stroke={colors.total} 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="القيمة الكلية للعقار"
                />
              )}
              {viewMode !== 'total' && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="قيمة الأرض" 
                    stroke={colors.land} 
                    strokeWidth={2}
                    name="قيمة الأرض المنفردة"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="قيمة المباني" 
                    stroke={colors.building} 
                    strokeWidth={2}
                    name="قيمة المنشآت المستهلكة"
                  />
                </>
              )}
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: colors.text, fontSize: 10, fontWeight: 'bold' }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
              />
              {viewMode !== 'components' && (
                <Bar 
                  dataKey="القيمة الإجمالية" 
                  fill={colors.total} 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                  name="القيمة الكلية للعقار"
                />
              )}
              {viewMode !== 'total' && (
                <>
                  <Bar 
                    dataKey="قيمة الأرض" 
                    fill={colors.land} 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    name="قيمة الأرض المنفردة"
                  />
                  <Bar 
                    dataKey="قيمة المباني" 
                    fill={colors.building} 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    name="قيمة المنشآت المستهلكة"
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Info footer */}
      <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-[11px] text-slate-400 font-semibold leading-relaxed flex items-start gap-2.5">
        <span className="text-amber-500 mt-0.5">ℹ️</span>
        <p>
          تستند الحسابات الرياضية المخططة أعلاه إلى <strong>قيمة العقار القضائي الحالية</strong> البالغة <span className="text-white font-mono font-black">{(totalVal).toLocaleString('ar-EG')} جنيهاً مصرياً</span>، مع افتراض معدل تقدير مستقر بنسبة 12% سنوياً لارتفاع أسعار الأراضي ورفع كفاءة النطاق الجغرافي بالعمرانية الغربية، الجيزة.
        </p>
      </div>
    </div>
  );
}

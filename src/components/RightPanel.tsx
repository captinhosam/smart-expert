import React from 'react';
import { AgentInfo, CalculationResults } from '../types';
import { EXPERT_SYSTEM_AGENTS } from '../data/expertSystemData';
import { 
  Cpu, 
  Brain, 
  FileText, 
  Download, 
  ShieldCheck, 
  Award,
  Zap,
  TrendingUp,
  HelpCircle,
  Database
} from 'lucide-react';

interface RightPanelProps {
  results: CalculationResults;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onPrint: () => void;
  onShowHelp: () => void;
}

export default function RightPanel({
  results,
  isAnalyzing,
  onRunAnalysis,
  onPrint,
  onShowHelp
}: RightPanelProps) {
  
  // Stats on agents
  const activeCount = EXPERT_SYSTEM_AGENTS.filter(a => a.status === 'active').length;
  const busyCount = EXPERT_SYSTEM_AGENTS.filter(a => a.status === 'busy').length;
  const totalCount = EXPERT_SYSTEM_AGENTS.length;

  return (
    <div className="space-y-6">
      
      {/* 1. AI Agents Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Cpu className="w-4 h-4 text-amber-500" />
          <span>حالة وكلاء النظام الخبير ({totalCount} وكيل)</span>
        </h3>

        <div className="space-y-3">
          {/* Smith Orchestrator status */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <div className="flex flex-col text-right">
                <span className="text-white text-xs font-black">Agent Smith CEO</span>
                <span className="text-[10px] text-slate-400 font-semibold">المنسق والمدير الرئيسي للعمليات</span>
              </div>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
              <span className="text-slate-500 text-[10px] block mb-0.5">وكلاء نشطين</span>
              <span className="text-emerald-400 font-extrabold">{activeCount}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
              <span className="text-slate-500 text-[10px] block mb-0.5">قيد المعالجة</span>
              <span className="text-amber-400 font-extrabold">{busyCount}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white font-extrabold text-xs py-2.5 rounded-xl border border-slate-750 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>تشغيل سيمفونية الخبراء</span>
        </button>
      </div>

      {/* 2. Self-Learning Progress Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Brain className="w-4 h-4 text-amber-500" />
          <span>التعلم التكيفي المستمر (Self-Learning)</span>
        </h3>

        <div className="space-y-3.5">
          {/* Metric 1 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>دقة تقييم الأراضي</span>
              <span className="font-mono text-amber-400">91%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" style={{ width: '91%' }}></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>تحليل الخرائط الجغرافية</span>
              <span className="font-mono text-emerald-400">97%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '97%' }}></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>الامتثال للقانون العقاري</span>
              <span className="font-mono text-blue-400">94%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>توزيع قسمة المواريث</span>
              <span className="font-mono text-purple-400">99%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-full rounded-full" style={{ width: '99%' }}></div>
            </div>
          </div>

          {/* Overall Accuracy */}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-black text-amber-500">
            <span>متوسط دقة القرار النهائي:</span>
            <span className="font-mono text-sm">95.2%</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
        <h3 className="text-white text-xs font-black mb-2.5">إجراءات استشارية سريعة</h3>
        
        <button 
          onClick={onPrint}
          className="w-full bg-slate-950 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs py-2.5 rounded-xl border border-slate-800/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span>تصدير التقرير الفني الموثق</span>
        </button>

        <button 
          onClick={onShowHelp}
          className="w-full bg-slate-950 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs py-2.5 rounded-xl border border-slate-800/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>تعليمات دليل الاستخدام</span>
        </button>
      </div>
    </div>
  );
}

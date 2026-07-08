import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Cpu, 
  BookOpen,
  Settings,
  HelpCircle,
  FolderOpen,
  MessageSquare,
  Compass,
  Users,
  Scale,
  Search
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'mindmap' | 'heirs_hub' | 'court' | 'inquiries';
  setActiveTab: (tab: 'dashboard' | 'details' | 'map' | 'agents' | 'report' | 'files' | 'mindmap' | 'heirs_hub' | 'court' | 'inquiries') => void;
  caseTitle: string;
  caseNumber: string;
}

export default function Sidebar({ activeTab, setActiveTab, caseTitle, caseNumber }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'مركز التحكم لجميع العمليات', icon: LayoutDashboard, desc: 'القطاعات الهندسية والاستقصاء الاستشاري الموحد' },
    { id: 'files', label: 'ملف القضية المتكامل', icon: MessageSquare, desc: 'مركز الملفات، الشات التفاعلي والاتصال الصوتي' },
    { id: 'details', label: 'بيانات العقار والخصوم والورثة', icon: Users, desc: 'مواصفات العقار، الخصوم وشجرة المواريث الموحدة' },
    { id: 'map', label: 'نظم الخرائط والمسح الجغرافي', icon: Map, desc: 'الإحداثيات الجغرافية، الخريطة الذهنية ومستندات الأراضي' },
    { id: 'inquiries', label: 'الاستعلامات', icon: Search, desc: 'بوابة الاستعلامات الحكومية والربط الإلكتروني' },
    { id: 'court', label: 'المحكمة الرقمية التنفيذية', icon: Scale, desc: 'قاعة المحكمة الافتراضية ومحاضر التنفيذ والمحضرين' },
    { id: 'report', label: 'التقرير القضائي المعتمد', icon: FileText, desc: 'التقرير النهائي الجاهز للطباعة والتقديم بختم النسر' }
  ] as const;

  return (
    <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between h-full space-y-6">
      
      {/* Menu items */}
      <div className="space-y-4 text-right">
        <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase block border-b border-slate-850 pb-2 mb-3">قوائم النظام والتحليل</span>
        
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3.5 group ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                    : 'bg-transparent border-transparent hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-500 group-hover:bg-slate-800 group-hover:text-amber-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right">
                  <span className={`text-xs font-bold leading-none ${isSelected ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 group-hover:text-slate-400">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case brief info card */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-2 text-right">
        <span className="text-amber-500 text-[10px] font-extrabold block">قضية فاعلة نشطة:</span>
        <h4 className="text-white text-xs font-black truncate leading-snug">{caseTitle}</h4>
        <span className="text-slate-400 text-[10px] font-mono leading-none block mt-1">{caseNumber}</span>
      </div>

    </nav>
  );
}

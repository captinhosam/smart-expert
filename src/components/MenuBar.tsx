import React, { useState, useRef, useEffect } from 'react';
import { MENU_STRUCTURE } from '../data/expertSystemData';
import { 
  File, 
  ChevronDown, 
  Menu, 
  User, 
  Bell, 
  Scale, 
  ShieldCheck, 
  HelpCircle,
  Database,
  Cpu,
  Settings
} from 'lucide-react';

interface MenuBarProps {
  onNewCase: () => void;
  onOpenSample: (index: number) => void;
  onPrint: () => void;
  onToggleSettings: () => void;
  onSelectExpertSector: (sector: string) => void;
  onShowAbout: () => void;
  onGoToStartPage?: () => void;
  theme?: 'dark' | 'paper';
  onToggleTheme?: () => void;
}

export default function MenuBar({
  onNewCase,
  onOpenSample,
  onPrint,
  onToggleSettings,
  onSelectExpertSector,
  onShowAbout,
  onGoToStartPage,
  theme = 'dark',
  onToggleTheme
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuKey: string) => {
    if (activeMenu === menuKey) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuKey);
    }
  };

  const handleAction = (menuKey: string, actionLabel: string) => {
    setActiveMenu(null);
    if (menuKey === 'FILE') {
      if (actionLabel === 'ملف جديد') onNewCase();
      else if (actionLabel === 'فتح ملف') onOpenSample(0); // Load default sample
      else if (actionLabel === 'تصدير إلى PDF' || actionLabel === 'طباعة التقرير') onPrint();
      else if (actionLabel === 'خروج') {
        console.log('شكراً لاستخدامك نظام سمارت إكسبيرت!');
      } else {
        console.log(`تم تنفيذ الأمر: ${actionLabel}`);
      }
    } else if (menuKey === 'EXPERT') {
      onSelectExpertSector(actionLabel);
    } else {
      console.log(`تم تفعيل قطاع: ${actionLabel}\nالنظام الخبير يقوم الآن بدمج هذا التخصص في معالجة القضايا.`);
    }
  };

  const menuKeys = Object.keys(MENU_STRUCTURE) as Array<keyof typeof MENU_STRUCTURE>;

  const getMenuIcon = (key: string) => {
    switch (key) {
      case 'FILE': return '📁';
      case 'EDIT': return '✏️';
      case 'EXPERT': return '👨‍⚖️';
      case 'ENGINEERING': return '🏗️';
      case 'TECHNOLOGY': return '💻';
      case 'TECHNICAL': return '🔧';
      case 'ADMIN': return '📋';
      case 'FINANCE': return '💰';
      case 'FUNDING': return '🏦';
      default: return '⚙️';
    }
  };

  const getMenuLabelAr = (key: string) => {
    switch (key) {
      case 'FILE': return 'ملف';
      case 'EDIT': return 'تحرير';
      case 'EXPERT': return 'خبراء';
      case 'ENGINEERING': return 'الهندسة';
      case 'TECHNOLOGY': return 'التقنية';
      case 'TECHNICAL': return 'الفني';
      case 'ADMIN': return 'الإداري';
      case 'FINANCE': return 'المالي';
      case 'FUNDING': return 'التمويل';
      default: return key;
    }
  };

  return (
    <header className="relative z-50 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 shadow-xl rounded-2xl mb-6" ref={menuRef}>
      <div className="flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center font-bold text-slate-900 text-lg shadow-lg shadow-amber-500/10">
            ⚖️
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-extrabold text-xl leading-none flex items-center gap-1">
              سمارت <span className="text-amber-500 font-black">إكسبيرت</span>
            </h1>
            <span className="text-slate-400 text-xs font-semibold tracking-wide">نظام الخبرة العقارية القضائية الذكي</span>
          </div>
        </div>

        {/* Desktop Dynamic Menus */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800">
          {menuKeys.map((key) => {
            const items = MENU_STRUCTURE[key];
            const isOpen = activeMenu === key;
            return (
              <div key={key} className="relative">
                <button
                  onClick={() => handleMenuClick(key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isOpen 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  id={`menu-btn-${key}`}
                >
                  <span className="text-base">{getMenuIcon(key)}</span>
                  <span>{getMenuLabelAr(key)}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Floating Dropdown */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-1.5 text-xs text-amber-500 font-extrabold tracking-wider border-b border-slate-800 mb-1 flex items-center justify-between">
                      <span>قائمة {getMenuLabelAr(key)}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{key} MENU</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {items.map((item: any, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(key, item.label)}
                          className="w-full text-right px-4 py-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-all text-sm flex items-center justify-between group"
                          id={`submenu-item-${key}-${idx}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                              {item.label}
                            </span>
                            {item.desc && (
                              <span className="text-[11px] text-slate-400 font-normal mt-0.5 group-hover:text-slate-300">
                                {item.desc}
                              </span>
                            )}
                          </div>
                          {item.shortcut && (
                            <span className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-800">
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profiles, Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Database Status */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>قاعدة البيانات متصلة</span>
          </div>

          {/* Quick Info & Notifications */}


          <button 
            onClick={onToggleSettings}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-slate-800 transition-all shadow-sm"
            title="إعدادات النظام"
            id="settings-btn"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button 
            onClick={onShowAbout}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-slate-800 transition-all shadow-sm"
            title="عن البرنامج والمصادر"
            id="about-btn"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {onGoToStartPage && (
            <button 
              onClick={onGoToStartPage}
              className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="العودة لصفحة البداية الفنية (تحديث 2)"
              id="back-to-start-btn"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>البداية (تحديث 2)</span>
            </button>
          )}

          {/* Profile Card */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500/40 transition-all">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs">
              ح
            </div>
            <div className="hidden sm:flex flex-col text-right pl-2">
              <span className="text-white text-xs font-bold leading-none">كابتن حسام</span>
              <span className="text-slate-400 text-[10px] font-semibold mt-1">خبير عقاري معتمد</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center"
            id="mobile-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menus Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-[80vh] overflow-y-auto z-50">
          <p className="text-xs text-amber-500 font-bold mb-3">قوائم النظام العقاري القضائي:</p>
          <div className="flex flex-col gap-1.5">
            {menuKeys.map((key) => {
              const items = MENU_STRUCTURE[key];
              return (
                <div key={key} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-slate-100 text-sm mb-2 border-b border-slate-800/60 pb-1.5">
                    <span>{getMenuIcon(key)}</span>
                    <span>قائمة {getMenuLabelAr(key)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {items.slice(0, 5).map((item: any, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAction(key, item.label);
                          setMobileMenuOpen(false);
                        }}
                        className="text-right p-1.5 bg-slate-950/40 hover:bg-slate-800 rounded text-slate-300 hover:text-white text-xs transition-colors"
                        id={`mobile-submenu-${key}-${idx}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

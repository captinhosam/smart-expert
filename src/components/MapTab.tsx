import React, { useState, useEffect } from 'react';
import { CaseData, CalculationResults } from '../types';
import { SAMPLE_LOCATIONS } from '../data/expertSystemData';
import { triggerToast } from '../lib/toast';
import VirtualCourt from './VirtualCourt/VirtualCourt';
import { 
  MapPin, 
  Satellite, 
  Compass, 
  Maximize2, 
  Activity, 
  Globe, 
  Droplet, 
  Wind,
  Layers,
  Sparkles,
  Scale
} from 'lucide-react';

interface MapTabProps {
  caseData: CaseData;
  results: CalculationResults;
  onUpdateCoordinates: (
    lat: number, 
    lng: number, 
    locationName: string, 
    scannedArea?: number, 
    complianceScore?: number
  ) => void;
  startWithVirtualCourt?: boolean;
  onClearStartWithVirtualCourt?: () => void;
}

export default function MapTab({ 
  caseData, 
  results, 
  onUpdateCoordinates,
  startWithVirtualCourt,
  onClearStartWithVirtualCourt
}: MapTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'terrain'>('satellite');
  const [showVirtualCourt, setShowVirtualCourt] = useState(false);

  useEffect(() => {
    if (startWithVirtualCourt) {
      setShowVirtualCourt(true);
      if (onClearStartWithVirtualCourt) {
        onClearStartWithVirtualCourt();
      }
    }
  }, [startWithVirtualCourt, onClearStartWithVirtualCourt]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            return 0;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const triggerSatelliteScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    triggerToast('📡 تم إطلاق قمر صناعي عسكري لمسح طبوغرافية الأرض وحدود المساحة الحالية...', 'info');
  };

  // Coordinates Mapping System to map Giza GPS viewport into 500x400 SVG box
  const mapCenterLat = 29.9912;
  const mapCenterLng = 31.1425;
  const latSpan = 0.0200; // total vertical range
  const lngSpan = 0.0250; // total horizontal range

  const getPinCoords = (lat: number, lng: number) => {
    const dLat = lat - mapCenterLat;
    const dLng = lng - mapCenterLng;
    
    // Scale percentages from center (0.5) to viewBox coordinates
    const x = 250 + (dLng / lngSpan) * 500;
    const y = 200 - (dLat / latSpan) * 400;
    
    // Safety clamp to keep the pin visual nicely inside the card grid
    return {
      x: Math.max(35, Math.min(465, x)),
      y: Math.max(55, Math.min(345, y))
    };
  };

  const pinCoords = getPinCoords(caseData.latitude, caseData.longitude);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Normalize coordinates back to 500x400 SVG scale
    const svgX = (clickX / rect.width) * 500;
    const svgY = (clickY / rect.height) * 400;
    
    // Convert SVG coordinates back to GPS lat/lng
    const clickLng = mapCenterLng + ((svgX - 250) / 500) * lngSpan;
    const clickLat = mapCenterLat - ((svgY - 200) / 400) * latSpan;
    
    // Calculate simulated results based on coordinates
    const dist = Math.sqrt(Math.pow(clickLat - mapCenterLat, 2) + Math.pow(clickLng - mapCenterLng, 2));
    const scannedArea = Math.round(340 + Math.abs(Math.sin(clickLat * 1200) * Math.cos(clickLng * 1200)) * 240);
    const complianceScore = Math.max(65, Math.min(100, Math.round(100 - dist * 1300)));
    
    onUpdateCoordinates(clickLat, clickLng, caseData.location, scannedArea, complianceScore);
    triggerToast(`📍 تم إسقاط إحداثيات الدبوس بنجاح! المساحة الجديدة: ${scannedArea} م² | المطابقة: ${complianceScore}%`, 'success');
  };

  // Approximate bounds calculations
  const boundNorth = (caseData.latitude + 0.0012).toFixed(5);
  const boundSouth = (caseData.latitude - 0.0012).toFixed(5);
  const boundEast = (caseData.longitude + 0.0015).toFixed(5);
  const boundWest = (caseData.longitude - 0.0015).toFixed(5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        
        {/* Interactive Simulated Map Canvas */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between shadow-2xl h-[320px] transition-all duration-300 hover:border-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          
          {/* Map Header with Controls */}
          <div className="flex items-center justify-between z-10 bg-slate-900/80 backdrop-blur border border-slate-800 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Satellite className={`w-4 h-4 text-amber-500 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="text-white text-xs font-bold font-mono">GPS TELEMETRY SYSTEM v4.2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setActiveLayer('satellite')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${activeLayer === 'satellite' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                قمر صناعي
              </button>
              <button 
                onClick={() => setActiveLayer('streets')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${activeLayer === 'streets' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                شوارع
              </button>
              <button 
                onClick={() => setActiveLayer('terrain')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${activeLayer === 'terrain' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                تضاريس
              </button>
            </div>
          </div>

          {/* Map Background Canvas Graphic (Interactive SVG) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-25"></div>
            
            {/* Map Visuals depending on selected layer */}
            <svg 
              className="w-full h-full select-none cursor-crosshair" 
              viewBox="0 0 500 400"
              onClick={handleMapClick}
            >
              {/* Nile River representation */}
              <path 
                d="M 230 0 Q 260 100 240 200 T 260 400" 
                fill="none" 
                stroke={activeLayer === 'satellite' ? '#1e3a8a' : '#2563eb'} 
                strokeWidth="24" 
                opacity="0.4"
                className="transition-colors duration-500"
              />
              <path 
                d="M 230 0 Q 260 100 240 200 T 260 400" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="6" 
                opacity="0.6"
              />

              {/* Major Roads in Dokki / Giza */}
              <g stroke={activeLayer === 'satellite' ? '#475569' : '#94a3b8'} strokeWidth="2" opacity="0.3">
                <line x1="0" y1="120" x2="500" y2="150" />
                <line x1="0" y1="280" x2="500" y2="250" />
                <line x1="120" y1="0" x2="160" y2="400" />
                <line x1="380" y1="0" x2="350" y2="400" />
              </g>

              {/* Built-up blocks or agricultural fields background */}
              {activeLayer === 'satellite' ? (
                <g fill="#166534" opacity="0.15">
                  <rect x="20" y="40" width="80" height="90" rx="4" />
                  <rect x="40" y="280" width="120" height="80" rx="4" />
                  <rect x="360" y="50" width="110" height="120" rx="4" />
                </g>
              ) : activeLayer === 'terrain' ? (
                <g stroke="#b45309" fill="none" opacity="0.2" strokeWidth="1.5">
                  <path d="M 50 100 C 100 120 120 80 150 110 S 180 150 200 130" />
                  <path d="M 40 110 C 90 130 110 90 140 120 S 170 160 190 140" />
                  <path d="M 320 280 C 370 260 390 310 420 290 S 460 250 480 270" />
                </g>
              ) : null}

              {/* Highlight Target Property Bounds at exact click pin coords */}
              <g transform={`translate(${pinCoords.x}, ${pinCoords.y})`}>
                {/* Simulated Property Polygon */}
                <polygon 
                  points="-25,-25 35,-15 25,35 -35,15" 
                  fill={isScanning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.15)'} 
                  stroke={isScanning ? '#f59e0b' : '#10b981'} 
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
                
                {/* Ping Marker */}
                <g transform="translate(0,0)" className="animate-bounce">
                  <circle cx="0" cy="0" r="6" fill="#ef4444" />
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
                </g>

                {/* Laser scan horizontal line */}
                {isScanning && (
                  <line 
                    x1="-100" 
                    y1={(scanProgress * 2.4) - 120} 
                    x2="100" 
                    y2={(scanProgress * 2.4) - 120} 
                    stroke="#f59e0b" 
                    strokeWidth="2" 
                    opacity="0.8" 
                  />
                )}
              </g>

              {/* Plot Coordinates Labels */}
              <text x={Math.max(10, pinCoords.x - 70)} y={Math.max(25, pinCoords.y + 40)} fill="#10b981" fontSize="10" fontWeight="black" fontFamily="monospace">
                {caseData.latitude.toFixed(4)}° N, {caseData.longitude.toFixed(4)}° E
              </text>
            </svg>
          </div>

          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 mx-auto max-w-xs bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 backdrop-blur shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  جاري المسح الطبوغرافي والبيئي...
                </span>
                <span className="text-white text-xs font-mono font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* Map Footer Information */}
          <div className="z-10 bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>إحداثيات: {caseData.latitude.toFixed(6)}, {caseData.longitude.toFixed(6)}</span>
              </span>
              <span className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>انقر على الخريطة لإسقاط الدبوس وتحديث المساحة فوراً</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={triggerSatelliteScan}
                disabled={isScanning}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 text-slate-200 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>بدء مسح طيفي للتربة</span>
              </button>

              <button 
                onClick={() => setShowVirtualCourt(true)}
                className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-lg shadow-md shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>افتتاح المحكمة الافتراضية ⚖️</span>
              </button>
            </div>
          </div>
        </div>

        {showVirtualCourt && (
          <VirtualCourt 
            onClose={() => setShowVirtualCourt(false)} 
            caseData={caseData}
            results={results}
          />
        )}

        {/* Dynamic Area & Document Compliance Dashboard with Neon Glow Effects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
          
          <h3 className="text-white text-xs font-black flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3.5">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>لوحة التدقيق المساحي والتحقق من المطابقة القانونية للعين</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Scanned Area Card */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)] transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-bold">المساحة المقيسة بالأقمار (GPS Area)</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">حساب فوري</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5 justify-end">
                <span className="text-white text-2xl font-mono font-black">{(caseData.landArea || caseData.scannedArea || 450).toLocaleString('ar-EG')}</span>
                <span className="text-slate-500 text-xs font-bold">متر مربع</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1.5 text-left font-mono">
                Lat: {caseData.latitude.toFixed(5)} | Lng: {caseData.longitude.toFixed(5)}
              </p>
            </div>

            {/* Compliance Score Card */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.08)] transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-bold">درجة المطابقة مع الأوراق الرسمية والمستندات</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  (caseData.complianceScore || 94) >= 85 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {(caseData.complianceScore || 94) >= 85 ? 'مطابقة عالية' : 'مطابقة متوسطة (فروقات طفيفة)'}
                </span>
              </div>
              
              <div className="mt-2.5 flex items-center justify-between gap-3">
                {/* Simple glowing percentage bar */}
                <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-500" 
                    style={{ width: `${caseData.complianceScore || 94}%` }}
                  ></div>
                </div>
                <span className="text-cyan-400 text-2xl font-mono font-black shrink-0">{(caseData.complianceScore || 94)}%</span>
              </div>
              
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                ✓ مقارنة حية تلقائية مع السجلات العقارية وعقود الملكية المسجلة
              </p>
            </div>

          </div>
        </div>

        {/* GPS Telemetry & Landmark Data Panels */}
        <div className="space-y-6">
          
          {/* Preset Giza/Cairo Locations Selectors */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
            <h3 className="text-white text-sm font-black mb-3 flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>تغيير موقع العقار القضائي (قاعدة البيانات)</span>
            </h3>
            <div className="space-y-2">
              {SAMPLE_LOCATIONS.map((loc, idx) => {
                const isSelected = caseData.location === loc.name;
                return (
                  <button
                    key={idx}
                    onClick={() => onUpdateCoordinates(loc.lat, loc.lng, loc.name)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {loc.name.split(' - ')[0]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate leading-relaxed">
                      {loc.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spatial Coordinates Bounds Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
            <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2">
              <Maximize2 className="w-4 h-4 text-amber-500" />
              <span>الحدود الجغرافية الدقيقة (سجل المساحة)</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block mb-1">الشمال (North Bound)</span>
                <span className="text-slate-100 font-bold">{boundNorth}° N</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block mb-1">الجنوب (South Bound)</span>
                <span className="text-slate-100 font-bold">{boundSouth}° N</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block mb-1">الشرق (East Bound)</span>
                <span className="text-slate-100 font-bold">{boundEast}° E</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block mb-1">الغرب (West Bound)</span>
                <span className="text-slate-100 font-bold">{boundWest}° E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rent, Ownership, and New Law Diagnostics */}
      <div id="legal-and-financial-metrics" className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3.5">
        <h3 className="text-white text-sm font-black flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Activity className="w-4 h-4 text-amber-500" />
          <span>المحددات القانونية والمؤشرات الاستثمارية للعقار</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Rent Box (الإيجار) */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-xs font-black">العائد ونظام الإيجار</span>
            </div>
            <div>
              <span className="text-white text-sm font-black block font-mono">
                {caseData.annualRent ? `${caseData.annualRent.toLocaleString('ar-EG')} ج / سنوياً` : 'لا يوجد'}
              </span>
              <span className="text-emerald-400 text-[10px] font-bold mt-1 block">
                {caseData.annualRent > 0 ? '✓ عائد معتمد قانون جديد' : '✓ شاغل بالكامل تمليك'}
              </span>
            </div>
          </div>

          {/* Ownership Box (التمليك) */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-xs font-black">وضع الملكية والحيازة</span>
            </div>
            <div>
              <span className="text-white text-xs font-black block truncate">
                {caseData.dispute.type === 'inheritance' ? 'إرث شرعي وحصر تركات' : 'عقد ملكية نهائي مسجل'}
              </span>
              <span className="text-blue-400 text-[10px] font-bold mt-1 block">
                ✓ مسجل مطهّر من الديون
              </span>
            </div>
          </div>

          {/* New Law Box (القانون الجديد) */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-xs font-black">توافق القانون الجديد</span>
            </div>
            <div>
              <span className="text-white text-[11px] font-black block leading-snug">
                القانون رقم ١٠ لسنة ٢٠٢٢
              </span>
              <span className="text-amber-400 text-[9px] font-bold mt-1 block leading-relaxed">
                ✓ متوافق مع تعديلات إخلاء العين وقواعد زيادة الأجر
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

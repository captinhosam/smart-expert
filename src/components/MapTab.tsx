import React, { useState, useEffect } from 'react';
import { CaseData, CalculationResults } from '../types';
import { SAMPLE_LOCATIONS } from '../data/expertSystemData';
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
  Sparkles
} from 'lucide-react';

interface MapTabProps {
  caseData: CaseData;
  results: CalculationResults;
  onUpdateCoordinates: (lat: number, lng: number, locationName: string) => void;
}

export default function MapTab({ caseData, results, onUpdateCoordinates }: MapTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'terrain'>('satellite');

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
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between shadow-2xl h-[320px]">
          
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
            <svg className="w-full h-full" viewBox="0 0 500 400">
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

              {/* Highlight Target Property Bounds */}
              <g transform="translate(240, 180)">
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
              <text x="210" y="235" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
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
                <span>الحدود الجغرافية مضبوطة</span>
              </span>
            </div>
            
            <button 
              onClick={triggerSatelliteScan}
              disabled={isScanning}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>بدء مسح طيفي للتربة والمساحة</span>
            </button>
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

      {/* Environmental & Soil Diagnostics (For Agricultural and Land analysis) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-400 text-[10px] font-bold truncate">حموضة التربة (pH)</span>
            <span className="text-white text-sm font-black mt-0.5 font-mono">6.8 pH</span>
            <span className="text-emerald-400 text-[9px] font-bold mt-0.5 truncate">✓ خصبة مثالية</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-400 text-[10px] font-bold truncate">المياه الجوفية</span>
            <span className="text-white text-sm font-black mt-0.5 font-mono">1.42 م</span>
            <span className="text-amber-400 text-[9px] font-bold mt-0.5 truncate">⚠ قريب للسطح</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-400 text-[10px] font-bold truncate">مغذيات (NPK)</span>
            <span className="text-white text-sm font-black mt-0.5 font-mono">74% / 68%</span>
            <span className="text-emerald-400 text-[9px] font-bold mt-0.5 truncate">✓ غنية ومتزنة</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-400 text-[10px] font-bold truncate">التلوث البيئي</span>
            <span className="text-white text-sm font-black mt-0.5 font-mono">0.02%</span>
            <span className="text-emerald-400 text-[9px] font-bold mt-0.5 truncate">✓ هواء نقي</span>
          </div>
        </div>
      </div>
    </div>
  );
}

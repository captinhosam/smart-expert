import React, { useState, useRef, useEffect } from 'react';
import { CaseData, FieldPhoto } from '../types';
import { Camera, RefreshCw, AlertTriangle, Upload, Check, Trash2, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface FieldCameraTabProps {
  caseData: CaseData;
  onUpdateCaseData: (updatedFields: Partial<CaseData>) => void;
  theme?: 'dark' | 'paper';
}

const DAMAGE_PRESETS = [
  {
    id: 'p_crack',
    name: 'شروخ وتصدعات إنشائية بالواجهة',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
    description: 'شروخ مائلة نافذة بالواجهة الخارجية تهدد السلامة الإنشائية للعقار وتحتاج لترميم فوري.',
    severity: 'critical' as const
  },
  {
    id: 'p_steel',
    name: 'تآكل حديد التسليح وصدأ بالأعمدة',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'رصد تآكل وصدأ شديد في حديد التسليح بالأعمدة الحاملة للسطح مع تساقط الغطاء الخرساني.',
    severity: 'critical' as const
  },
  {
    id: 'p_moisture',
    name: 'تأثير الرطوبة وتسرب مياه الصرف',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'رشح مائي ورطوبة شديدة في جدران وأسقف الشقة السكنية مما أدى لتمليح وسقوط الدهانات.',
    severity: 'medium' as const
  },
  {
    id: 'p_building',
    name: 'مخالفة بناء بدون ترخيص لسطح إضافي',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
    description: 'زيادة عدد الأدوار السكنية القائمة بالبناء العشوائي عن الارتفاعات المسموح بها في ترخيص البناء.',
    severity: 'high' as const
  }
];

export default function FieldCameraTab({ caseData, onUpdateCaseData, theme }: FieldCameraTabProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  // Annotation States
  const [damageType, setDamageType] = useState<string>('شرخ إنشائي نافذ');
  const [severity, setSeverity] = useState<'light' | 'medium' | 'high' | 'critical'>('high');
  const [customAnnotation, setCustomAnnotation] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p_crack');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize and check camera permissions
  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      setHasCameraPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("webcam access error:", err);
      setHasCameraPermission(false);
      setCameraActive(false);
      
      // Detailed error messages based on standard browser exceptions
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('تم رفض إذن الوصول للكاميرا من قبل المتصفح. يرجى تفعيل الإذن من شريط العنوان.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('لم يتم العثور على كاميرا متصلة بالجهاز الحالي.');
      } else {
        setCameraError('فشل تشغيل الكاميرا بسبب قيود حماية المتصفح للمحتوى المدمج (IFrame). يمكنك استخدام محاكي الكاميرا الميدانية بالأسفل.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Start camera by default if tab is loaded, but handle iframe gracefully
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Capture current frame from webcam
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dims to match the actual video stream
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
        triggerToast('📸 تم التقاط الصورة الميدانية بنجاح! يرجى إدخال التعليق التوضيحي لحالة التلف الإنشائي.', 'success');
      }
    }
  };

  // Preset Selector helper
  const handleSelectPreset = (preset: typeof DAMAGE_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setCapturedImage(null);
    // Autofill annotation inputs
    setDamageType(preset.name);
    setCustomAnnotation(preset.description);
    setSeverity(preset.severity);
  };

  // Triggered when submitting the annotated photo
  const handleSaveCapturedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback: use either the live captured image or the selected preset URL
    const finalImageUrl = capturedImage || DAMAGE_PRESETS.find(p => p.id === selectedPresetId)?.url || DAMAGE_PRESETS[0].url;
    
    const severityArabic = 
      severity === 'critical' ? '🔴 تلف حرج جداً' : 
      severity === 'high' ? '🟠 تلف خطير' : 
      severity === 'medium' ? '🟡 تلف متوسط' : '🟢 تلف طفيف';

    // Formulate a beautiful annotation string
    const finalCaption = `[تلف إنشائي ميداني - ${severityArabic}] نوع التلف: ${damageType}. الملاحظات الفنية: ${customAnnotation || 'مخالفة فنية تستدعي تدخل مهندس استشاري وتوثيق فوري في ملف القضية المحال للمحكمة.'}`;

    const newPhoto: FieldPhoto = {
      id: `live-photo-${Date.now()}`,
      url: finalImageUrl,
      caption: finalCaption,
      date: new Date().toISOString().split('T')[0]
    };

    const currentPhotos = caseData.photos || [];
    onUpdateCaseData({
      photos: [...currentPhotos, newPhoto]
    });

    triggerToast('💾 تم حفظ اللقطة الميدانية مع التعليق التوضيحي وإدراجها بتقرير المعاينة ومعرض الصور بنجاح!', 'success');
    
    // Reset states
    setCapturedImage(null);
    setCustomAnnotation('');
    // Restart camera if desired
    startCamera();
  };

  // Handle uploading custom local file
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
        triggerToast('📂 تم تحميل الصورة المحلية بنجاح! أضف التعليق التوضيحي لحفظها.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl" id="field-camera-tab-container">
      
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/30 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
          <Camera className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-white text-sm font-black">كاميرا المعاينة الميدانية والتوثيق الفوري للتلفيات</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            التقط صوراً حية لعيوب الخرسانة، تصدعات الجدران، تآكل الأساسات، أو مخالفات الأدوار، مع ميزة إضافة توصيف وتصنيف فوري لمستوى خطورة التلف وحفظها مباشرة بملف القضية القضائية لتقديمها بالتقرير النهائي.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Live Webcam Stage / Capture Viewer (span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative">
            <div className="bg-slate-950 p-3 border-b border-slate-850 flex items-center justify-between">
              <span className="text-xs text-white font-black flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                <span>شاشة المعاينة والرصد الميداني الحية</span>
              </span>
              
              <div className="flex gap-2">
                {cameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/25 rounded-lg text-[10px] font-black hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    إيقاف الكاميرا
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-lg text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>تنشيط الكاميرا</span>
                  </button>
                )}
              </div>
            </div>

            {/* Camera Viewport Container */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
              {cameraActive && !capturedImage && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}

              {capturedImage && (
                <div className="w-full h-full relative">
                  <img
                    src={capturedImage}
                    alt="Captured snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم التقاط لقطة تجميد فوري</span>
                  </div>
                </div>
              )}

              {!cameraActive && !capturedImage && (
                <div className="p-6 text-center space-y-4 max-w-sm">
                  <ImageIcon className="w-12 h-12 text-slate-700 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-black">الكاميرا متوقفة مؤقتاً</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      لم يتمكن النظام الاستشاري من الاتصال بالكاميرا الصلبة حالياً. يمكنك تفعيلها، أو استخدام الكاميرا التناظرية (المحاكي) بالجانب الأيسر، أو رفع صورة محلية.
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <label className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black cursor-pointer transition-all flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>تحميل صورة محلية</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLocalImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {cameraError && !capturedImage && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 backdrop-blur-sm">
                  <ShieldAlert className="w-10 h-10 text-amber-500" />
                  <p className="text-[10px] text-amber-300 font-bold max-w-xs leading-normal">{cameraError}</p>
                  <span className="text-[9px] text-slate-500">ملاحظة: يمكنك استخدام محاكي معاينة الشقة باليسار لإكمال التجربة فوراً.</span>
                </div>
              )}

              {/* Dynamic Camera Grid Lines Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none border-dashed border-white/10 border flex flex-col justify-between p-4">
                  <div className="border-b border-white/5 w-full h-[33.3%]" />
                  <div className="border-b border-white/5 w-full h-[33.3%]" />
                  <div className="absolute inset-y-0 left-[33.3%] border-r border-white/5" />
                  <div className="absolute inset-y-0 left-[66.6%] border-r border-white/5" />
                </div>
              )}
            </div>

            {/* Controls bar below camera */}
            <div className="p-3 bg-slate-950 flex items-center justify-between border-t border-slate-850">
              <span className="text-[10px] text-slate-500 font-mono">
                {cameraActive ? '1280x720 30FPS | ACTIVE' : 'PREVIEW MODE'}
              </span>

              {cameraActive && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>التقاط لقطة تجميد</span>
                </button>
              )}

              {capturedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className="bg-slate-900 border border-slate-850 text-slate-400 hover:text-white font-black text-[10px] px-3 py-1.5 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة اللقطة</span>
                </button>
              )}
            </div>
          </div>

          {/* Preset / Simulator Camera Options */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-white text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>محاكي لقطات التلف العقاري السكني (معاينة الشقق والخرسانة)</span>
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              إذا كنت في مكتبك أو كان إذن الكاميرا مغلقاً، اختر أحد لقطات التلف الميدانية الجاهزة هذه لمحاكاة التقاط الصورة مع كتابة تعليق توضيحي فوري عليها:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAMAGE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !capturedImage;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`border rounded-xl p-1.5 cursor-pointer transition-all bg-slate-950 flex flex-col justify-between text-right overflow-hidden ${
                      isSelected 
                        ? 'border-cyan-500 ring-2 ring-cyan-500/10 scale-[1.02]' 
                        : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-[9px] text-slate-300 font-black mt-1.5 line-clamp-1 leading-tight">
                      {preset.name}
                    </span>
                    <span className={`text-[8px] font-bold mt-1 self-start px-1 rounded ${
                      preset.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                      preset.severity === 'high' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {preset.severity === 'critical' ? 'حرج' : preset.severity === 'high' ? 'خطير' : 'متوسط'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Annotation Details & Save Form (span 5) */}
        <div className="lg:col-span-5">
          <form 
            onSubmit={handleSaveCapturedPhoto} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 text-right"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-white text-xs font-black">التعليق التوضيحي الفوري وحالة التلف الإنشائي</h3>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Damage Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold">تصنيف التلف الإنشائي المرصود</label>
                <select
                  value={damageType}
                  onChange={e => setDamageType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-semibold text-xs focus:outline-none transition-all"
                >
                  <option value="شرخ إنشائي مائل بالواجهة">شرخ إنشائي مائل بالواجهة (أعمال هبوط أساسات)</option>
                  <option value="تآكل غطاء خرساني وصدأ حديد بالأعمدة">تآكل غطاء خرساني وصدأ حديد بالأعمدة</option>
                  <option value="تصدع هابط بسقف الغرفة">تصدع هابط بسقف الغرفة وتساقط المحارة</option>
                  <option value="تسرب رطوبة ومياه جدران حمام">تسرب رطوبة ومياه جدران شقة (رشح صحي)</option>
                  <option value="انهيار جزئي بالبلكونة أو سور السطح">انهيار جزئي بالبلكونة أو سور السطح</option>
                  <option value="مخالفة أدوار علوية بناء بدون رخصة">مخالفة أدوار علوية بناء بدون رخصة وتعدي كودي</option>
                  <option value="شروخ شعرية غير نافذة بالتشطيبات">شروخ شعرية غير نافذة بالتشطيبات (أمان)</option>
                </select>
              </div>

              {/* Danger/Severity Level */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold">مستوى الخطورة وتهديد السلامة</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { value: 'light', label: '🟢 طفيف', desc: 'أمان كامل' },
                    { value: 'medium', label: '🟡 متوسط', desc: 'يحتاج ترميم' },
                    { value: 'high', label: '🟠 خطير', desc: 'يهدد السلامة' },
                    { value: 'critical', label: '🔴 حرج جداً', desc: 'إخلاء فوراً' }
                  ].map((lvl) => {
                    const isSelected = severity === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setSeverity(lvl.value as any)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{lvl.label}</span>
                        <span className={`text-[8px] opacity-75 mt-0.5 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`}>
                          {lvl.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Comment Annotation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold">التعليق التوضيحي الاستشاري والوصف الميداني للتلف</label>
                <textarea
                  rows={4}
                  required
                  value={customAnnotation}
                  onChange={e => setCustomAnnotation(e.target.value)}
                  placeholder="اكتب التوصيف الفني الدقيق للتلف الإنشائي المرصود، مدى انتشاره بالوحدات السكنية (الشقق) والإجراء المقترح..."
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Preview Box */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[10px] text-slate-500 font-bold block">مظهر الإدراج المقترح بتقرير القضية:</span>
                <div className="border-r-2 border-amber-500 pr-2.5 py-1 text-[9px] text-slate-300 font-mono leading-relaxed space-y-1">
                  <p>
                    <span className="text-amber-400 font-bold">نوع الرصد:</span> {damageType}
                  </p>
                  <p className="line-clamp-2">
                    <span className="text-amber-400 font-bold">الوصف التقني:</span> {customAnnotation || '(يرجى كتابة وصف فني لإظهار المعاينة...)'}
                  </p>
                  <p>
                    <span className="text-amber-400 font-bold">مستوى الخطورة:</span> {
                      severity === 'critical' ? '🔴 تلف إنشائي حرج (طلب إخلاء وترميم عاجل)' :
                      severity === 'high' ? '🟠 تلف خطير يمس السلامة الهيكلية' :
                      severity === 'medium' ? '🟡 تلف متوسط يستلزم أعمال صيانة وترميم' :
                      '🟢 تلف تجميلي طفيف لا يعوق الاستخدام السكني'
                    }
                  </p>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الصورة والتعليق بتقرير المعاينة</span>
            </button>
          </form>
        </div>

      </div>

      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
}

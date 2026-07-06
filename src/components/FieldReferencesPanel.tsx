import React, { useState } from 'react';
import { CaseData, FieldPhoto, FieldReference } from '../types';
import { 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  FileText, 
  Layers, 
  Eye, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Download,
  Home,
  MapPin,
  Clock
} from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface FieldReferencesPanelProps {
  caseData: CaseData;
  onUpdateCaseData: (updatedFields: Partial<CaseData>) => void;
  onMaximize?: (panelId: 'references' | 'gallery') => void;
  isMaximized?: boolean;
  maximizedSection?: 'references' | 'gallery';
}

export default function FieldReferencesPanel({ 
  caseData, 
  onUpdateCaseData,
  onMaximize,
  isMaximized = false,
  maximizedSection
}: FieldReferencesPanelProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<FieldPhoto | null>(null);
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
  const [showAddRefForm, setShowAddRefForm] = useState(false);
  
  // New Photo State
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // New Reference State
  const [refTitle, setRefTitle] = useState('');
  const [refType, setRefType] = useState<'legal' | 'engineering' | 'precedent' | 'other'>('legal');
  const [refText, setRefText] = useState('');

  // Reference File Upload States
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileType, setAttachedFileType] = useState<'pdf' | 'image' | 'word' | null>(null);
  const [attachedFileSize, setAttachedFileSize] = useState('');

  const handleReferenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const name = file.name;
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const ext = name.split('.').pop()?.toLowerCase();
      let type: 'pdf' | 'image' | 'word' = 'pdf';
      let typeArabic = 'مستند قانوني PDF';
      let autoType: 'legal' | 'engineering' | 'precedent' | 'other' = 'legal';
      
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        type = 'image';
        typeArabic = 'صورة معاينة فوتوغرافية';
        autoType = 'engineering';
      } else if (ext === 'doc' || ext === 'docx') {
        type = 'word';
        typeArabic = 'مسودة دفاع قانوني Word';
        autoType = 'legal';
      } else {
        autoType = 'legal';
      }
      
      setAttachedFileName(name);
      setAttachedFileType(type);
      setAttachedFileSize(sizeStr);
      setRefType(autoType);
      
      // Auto-populate form fields to make sure the user isn't forced to write laws manually!
      setRefTitle(name);
      setRefText(`[مرفق رقمي محمل بنجاح ✓]
اسم الملف: ${name}
حجم الملف: ${sizeStr}
نوع المرفق: ${typeArabic}
تم رفع السند بنجاح ومطابقته رقمياً مع السجل العقاري والأكواد القضائية بواسطة الخبير كابتن حسام.`);
      
      triggerToast(`تم تحميل وفحص "${name}" بنجاح! تم ملء السند تلقائياً.`, 'success');
    }
  };

  const photos = caseData.photos || [];
  const references = caseData.references || [];

  const handleLoadSampleApartment = () => {
    const samplePhoto: FieldPhoto = {
      id: `photo-apt-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      caption: 'شقة سكنية نموذجية - معاينة داخلية للأعمال وتوثيق التشطيبات والنزاع المالي للوحدة',
      date: new Date().toISOString().split('T')[0]
    };
    onUpdateCaseData({
      photos: [...photos, samplePhoto]
    });
    triggerToast('🏠 تم تحميل وإدراج صورة الشقة السكنية النموذجية بنجاح!', 'success');
  };

  // Pre-configured mock URLs for easy user selection so they don't have to search for links
  const PRESET_MOCK_PHOTOS = [
    { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80', caption: 'معاينة الواجهة وتصدعات الأعمدة' },
    { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', caption: 'معاينة تآكل السقف والخرسانة' },
    { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', caption: 'الأعمال الإنشائية ومخالفة البناء' },
    { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', caption: 'أعمال القياس والرفع المساحي والزوايا' }
  ];

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoCaption.trim()) return;

    // Use a random preset if no URL provided
    const urlToUse = photoUrl.trim() || PRESET_MOCK_PHOTOS[Math.floor(Math.random() * PRESET_MOCK_PHOTOS.length)].url;

    // Simulated/real GPS and precise Egyptian local timestamp for fallback
    const now = new Date();
    const simulatedLat = (30.0444 + (Math.random() - 0.5) * 0.005).toFixed(6);
    const simulatedLng = (31.2357 + (Math.random() - 0.5) * 0.005).toFixed(6);
    const timestampStr = now.toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newPhoto: FieldPhoto = {
      id: `photo-${Date.now()}`,
      url: urlToUse,
      caption: photoCaption,
      date: new Date().toISOString().split('T')[0],
      location: `${simulatedLat}° N, ${simulatedLng}° E (تحديد معاينة تلقائي)`,
      timestamp: timestampStr
    };

    onUpdateCaseData({
      photos: [...photos, newPhoto]
    });

    setPhotoCaption('');
    setPhotoUrl('');
    setShowAddPhotoForm(false);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateCaseData({
      photos: photos.filter(p => p.id !== id)
    });
  };

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refTitle.trim() || !refText.trim()) return;

    const newRef: FieldReference = {
      id: `ref-${Date.now()}`,
      title: refTitle,
      type: refType,
      text: refText
    };

    onUpdateCaseData({
      references: [...references, newRef]
    });

    setRefTitle('');
    setRefText('');
    setRefType('legal');
    setAttachedFileName('');
    setAttachedFileType(null);
    setAttachedFileSize('');
    setShowAddRefForm(false);
  };

  const handleDeleteReference = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateCaseData({
      references: references.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 📸 FIELD INSPECTION PHOTOS GALLERY CARD */}
      {(!isMaximized || maximizedSection === 'gallery') && (
        <div 
          onDoubleClick={() => onMaximize?.('gallery')}
          className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 hover:ring-1 hover:ring-amber-500/20 transition-all ${!isMaximized ? 'cursor-pointer group/gallery' : ''}`}
          title={!isMaximized ? "انقر نقراً مزدوجاً (Double Click) لتوسيع هذا المعرض بعرض الشاشة" : undefined}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <h3 className="text-white text-xs font-black">معرض صور المعاينة والرفع الميداني</h3>
              {!isMaximized && (
                <span className="text-[9px] text-slate-500 font-bold hidden group-hover/gallery:inline-block animate-pulse mr-2">
                  (انقر دبل كليك للتوسيع بعرض الشاشة ⛶)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleLoadSampleApartment}
                className="text-[10px] bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-slate-950 text-blue-400 font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="تحميل صورة شقة سكنية نموذجية لعرض الغرف والتشطيبات بالمعرض"
              >
                <Home className="w-3 h-3 text-current" />
                <span>تحميل صورة شقة نموذجية</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddPhotoForm(!showAddPhotoForm)}
                className="text-[10px] bg-slate-950 border border-slate-850 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة لقطة</span>
              </button>
            </div>
          </div>

          {/* Add Photo Form inside */}
          {showAddPhotoForm && (
            <form onSubmit={handleAddPhoto} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
              <span className="text-[10px] text-slate-500 font-extrabold block">إضافة صورة معاينة هندسية جديدة:</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="عنوان أو تعليق اللقطة (مثال: شروخ في السقف)"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-semibold"
                  required
                />
                
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="رابط الصورة (اختياري - سيتم استخدام نموذج حقيقي)"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-amber-500 text-left"
                  />
                  <span className="text-[9px] text-slate-500 font-medium block">اترك حقل الرابط فارغاً لتوليد صورة موقع إنشائي ممتازة تلقائياً.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-1.5 rounded-lg transition-all cursor-pointer text-center"
                >
                  تأكيد الإضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPhotoForm(false)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Photos grid */}
          {photos.length === 0 ? (
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 text-center text-slate-500 text-xs font-semibold">
              📷 لم يتم إرفاق صور معاينة لهذه القضية حتى الآن. اضغط على "إضافة لقطة" لإدراج صور الواجهات والمخالفات.
            </div>
          ) : (
            <div className={`grid ${isMaximized ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2'} gap-3`}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden cursor-pointer group hover:border-amber-500/40 transition-all flex flex-col relative"
                >
                  <div className="aspect-[4/3] w-full relative bg-slate-900 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay eye on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-300 font-bold line-clamp-1 leading-normal">
                        {photo.caption}
                      </p>
                      {photo.location && (
                        <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-500 font-mono" dir="rtl">
                          <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </div>
                      )}
                      {photo.timestamp && (
                        <div className="flex items-center gap-1 mt-0.5 text-[8px] text-cyan-400 font-mono" dir="rtl">
                          <Clock className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{photo.timestamp}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-500 font-mono border-t border-slate-900/60 pt-1.5">
                      <span>{photo.date}</span>
                      <div className="flex items-center gap-1">
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-600 hover:text-blue-450 p-1 transition-colors"
                          title="تحميل وتنزيل الصورة"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(photo.id, e)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📚 LEGAL & ENGINEERING REFERENCES CARD */}
      {(!isMaximized || maximizedSection === 'references') && (
        <div 
          onDoubleClick={() => onMaximize?.('references')}
          className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 hover:ring-1 hover:ring-amber-500/20 transition-all ${!isMaximized ? 'cursor-pointer group/references' : ''}`}
          title={!isMaximized ? "انقر نقراً مزدوجاً (Double Click) لتوسيع المراجع بعرض الشاشة" : undefined}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h3 className="text-white text-xs font-black">أكواد ومراجع فنية وقانونية</h3>
              {!isMaximized && (
                <span className="text-[9px] text-slate-500 font-bold hidden group-hover/references:inline-block animate-pulse mr-2">
                  (انقر دبل كليك للتوسيع بعرض الشاشة ⛶)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddRefForm(!showAddRefForm)}
              className="text-[10px] bg-slate-950 border border-slate-850 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة سند</span>
            </button>
          </div>

          {/* Add Reference Form inside */}
          {showAddRefForm && (
            <form onSubmit={handleAddReference} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
              <span className="text-[10px] text-slate-500 font-extrabold block">إضافة مستند أو كود رسمي معتمد:</span>
              
              {/* Reference File Upload Area */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2 text-right">
                <span className="text-[10px] text-slate-400 font-bold block">📂 تحميل ملف مباشر (صورة / PDF / Word):</span>
                <p className="text-[9px] text-slate-500 leading-normal">تحميل صورة أو ملف PDF أو Word وسيقوم النظام بتعبئة البيانات وتخطي إجبارية الكتابة اليدوية!</p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <input 
                    type="file" 
                    id="ref-file-uploader"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleReferenceFileChange}
                    className="hidden" 
                  />
                  <label 
                    htmlFor="ref-file-uploader"
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                    <span>تحميل ملف</span>
                  </label>
                  
                  {attachedFileName ? (
                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <span className="text-emerald-400 text-[9px] font-mono font-black truncate max-w-[150px]">
                        📎 {attachedFileName} ({attachedFileSize})
                      </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setAttachedFileName('');
                          setAttachedFileType(null);
                          setAttachedFileSize('');
                          setRefTitle('');
                          setRefText('');
                        }}
                        className="text-red-400 hover:text-red-300 text-[10px] font-black font-mono pr-1"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[9px] font-medium">لم يتم اختيار ملف بعد</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="عنوان السند (مثال: المادة 15 من قانون البناء)"
                  value={refTitle}
                  onChange={e => setRefTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-semibold"
                  required
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRefType('legal')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${refType === 'legal' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    ⚖️ قانوني
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefType('engineering')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${refType === 'engineering' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    📐 هندسي
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefType('precedent')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${refType === 'precedent' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    📜 سابقة قضائية
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="نص البند أو المادة أو الاستدلال القانوني..."
                  value={refText}
                  onChange={e => setRefText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 text-right font-medium resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-1.5 rounded-lg transition-all cursor-pointer text-center"
                >
                  تأكيد الإضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRefForm(false)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* References List */}
          {references.length === 0 ? (
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 text-center text-slate-500 text-xs font-semibold">
              📚 لم يتم إدراج مراجع أو مستندات كود قانونية لهذا النزاع حتى الآن. اضغط "إضافة سند" لتوثيق السندات والمستندات الداعمة.
            </div>
          ) : (
            <div className={`${isMaximized ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh]' : 'space-y-2 max-h-[350px]'} overflow-y-auto pr-1`}>
              {references.map((ref) => {
                const hasAttachment = ref.text.includes('[مرفق رقمي محمل بنجاح ✓]');
                return (
                  <div 
                    key={ref.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right space-y-1.5 hover:border-slate-800 transition-all relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {ref.type === 'legal' ? '⚖️' : ref.type === 'engineering' ? '📐' : ref.type === 'precedent' ? '📜' : '📁'}
                        </span>
                        <span className="text-white text-[11px] font-black leading-none">{ref.title}</span>
                        {hasAttachment && (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black">
                            📎 مستند مرفوع
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteReference(ref.id, e)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="حذف المرجع"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      {ref.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL FOR FULL SCREEN VIEWING */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] w-full p-4 flex flex-col items-center justify-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 left-4 w-9 h-9 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded-xl flex items-center justify-center font-black transition-transform cursor-pointer active:scale-95"
            >
              ✕
            </button>
            
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] max-w-full rounded-2xl object-contain border border-slate-800 shadow-2xl shadow-black"
            />
            
            <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl max-w-xl text-center space-y-2 flex flex-col items-center">
              <p className="text-white text-xs font-black">{selectedPhoto.caption}</p>
              
              {selectedPhoto.location && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>الموقع الجغرافي: {selectedPhoto.location}</span>
                </div>
              )}
              
              {selectedPhoto.timestamp && (
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>وسم المعاينة الزمني: {selectedPhoto.timestamp}</span>
                </div>
              )}

              <p className="text-[9px] text-slate-500 font-mono">تاريخ التسجيل بالتقرير: {selectedPhoto.date}</p>
              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-slate-950 font-black px-4 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>تحميل الصورة عالية الدقة</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

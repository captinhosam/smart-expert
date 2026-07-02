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
  AlertCircle
} from 'lucide-react';

interface FieldReferencesPanelProps {
  caseData: CaseData;
  onUpdateCaseData: (updatedFields: Partial<CaseData>) => void;
}

export default function FieldReferencesPanel({ caseData, onUpdateCaseData }: FieldReferencesPanelProps) {
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

  const photos = caseData.photos || [];
  const references = caseData.references || [];

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

    const newPhoto: FieldPhoto = {
      id: `photo-${Date.now()}`,
      url: urlToUse,
      caption: photoCaption,
      date: new Date().toISOString().split('T')[0]
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <h3 className="text-white text-xs font-black">معرض صور المعاينة والرفع الميداني</h3>
          </div>
          <button
            onClick={() => setShowAddPhotoForm(!showAddPhotoForm)}
            className="text-[10px] bg-slate-950 border border-slate-850 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة لقطة</span>
          </button>
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
          <div className="grid grid-cols-2 gap-2">
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
                  <p className="text-[10px] text-slate-300 font-bold line-clamp-1 leading-normal">
                    {photo.caption}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 font-mono">
                    <span>{photo.date}</span>
                    <button
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📚 LEGAL & ENGINEERING REFERENCES CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <h3 className="text-white text-xs font-black">أكواد ومراجع فنية وقانونية</h3>
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
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {references.map((ref) => (
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
            ))}
          </div>
        )}
      </div>

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
            
            <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl max-w-xl text-center space-y-1">
              <p className="text-white text-xs font-black">{selectedPhoto.caption}</p>
              <p className="text-[10px] text-amber-500 font-mono font-bold">تاريخ المعاينة المسجلة: {selectedPhoto.date}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

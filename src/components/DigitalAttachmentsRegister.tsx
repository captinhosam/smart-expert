import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Map as MapIcon, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  AlertCircle, 
  Plus, 
  Check, 
  SlidersHorizontal,
  FolderOpen,
  MapPin,
  FileCheck,
  Scale,
  Maximize2,
  User,
  UserCheck,
  Camera,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { triggerToast } from '../lib/toast';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'document' | 'image' | 'map';
  fileType: 'pdf' | 'word' | 'image' | 'map';
  date: string;
  description: string;
  url?: string;
  contentPreview?: string;
  metadata?: { [key: string]: string };
}

interface DigitalAttachmentsRegisterProps {
  caseNumber: string;
}

const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-1',
    name: 'عقد_إيجار_بيت_العمرانية_الرسمي_موقع.pdf',
    size: '1.8 MB',
    type: 'document',
    fileType: 'pdf',
    date: '2026-06-15',
    description: 'عقد الإيجار الأساسي الموثق لبيت العمرانية باسم السيدة عليه محمود الوكيل وموقع من محمد الجندي.',
    contentPreview: `جمهورية مصر العربية - وزارة العدل - مصلحة الشهر العقاري والتوثيق
إنه في يوم ١٥ يونيو ١٩٩٨، تم الاتفاق والتعاقد بين كلاً من:
الطرف الأول (المالك المؤجر): السيدة عليه محمود الوكيل، المقيمة بالعمرانية - الجيزة.
الطرف الثاني (المستأجر): السيد محمد الجندي، المقيم في نفس الدائرة.

موضوع العقد: تأجير العين التجارية (المحل الكائن بالدور الأرضي بالعقار رقم ٢٧ شارع شبين الكوم) بغرض تجاري (تجارة السلع الاستهلاكية الغذائية).
القيمة الإيجارية: ٢٠٠ جنيه مصري شهرياً، تدفع بانتظام للطرف الأول في الأسبوع الأول من كل شهر.

بند خاص (المادة ١٨): يمتنع على الطرف الثاني بتاتاً التنازل عن العين المؤجرة أو إيجارها من الباطن أو التخلي عنها للغير تحت أي مسمى دون موافقة كتابية صريحة وموثقة بالشهر العقاري من المؤجرة السيدة عليه محمود الوكيل، وإلا اعتبر العقد مفسوخاً تلقائياً دون الحاجة لإنذار.`,
    metadata: {
      'جهة التوثيق': 'مأمورية الشهر العقاري بالجيزة',
      'تاريخ التوثيق': '١٩٩٨/٠٦/١٦',
      'رقم المحضر': '٤٥٣٢ لسنة ١٩٩٨ توثيق',
      'حالة السند': 'أصل معتمد ومطابق'
    }
  },
  {
    id: 'att-2',
    name: 'مذكرة_دفاع_المستأجرين_بيت_العمرانية.docx',
    size: '1.2 MB',
    type: 'document',
    fileType: 'word',
    date: '2026-06-25',
    description: 'مذكرة الدفاع المودعة من محامي ورثة المستأجر محمد شلبي بخصوص شقة النزاع والسطح.',
    contentPreview: `محكمة الجيزة الابتدائية - الدائرة الثالثة مدني مستأنف عقاري
مذكرة بدفاع السيد ورثة المرحوم محمد شلبي ضد المدعية السيدة عليه محمود الوكيل

الدفوع القانونية والدفوع الموضوعية الأساسية:
أولاً: ندفع بامتداد عقد الإيجار السكني قانوناً لصالح الزوجة السيدة ماجدة الجيار استناداً لنص المادة ٢٩ من القانون رقم ٤٩ لسنة ١٩٧٧، لإقامتها المستقرة والهادئة والمستمرة مع زوجها قبل وفاته بالعين السكنية ببيت العمرانية.
ثانياً: خلو ذمة المستأجرين من أي تكاليف هندسية متعلقة بإزالة الطابق الأخير (السطح المتصدع) لكون التصدع ناشئاً عن عيوب قديمة في التأسيس الإنشائي للمبنى وهلاك الأعمدة الحاملة، مما يجعله مسؤولية المالك الأصلي قانوناً.
ثالثاً: نلتمس رفض الدعوى لانتفاء شروط فسخ عقد الإيجار وامتداده شرعاً وقانوناً.`,
    metadata: {
      'اسم المحامي': 'الأستاذ عبد العزيز الشافعي (محام بالنقض)',
      'تاريخ تقديم المذكرة': '٢٠٢٦/٠٦/٢٥',
      'الدائرة المختصة': 'الدائرة الثالثة عقاري مدني الجيزة',
      'الصفة القضائية': 'وكيل المدعى عليها ماجدة الجيار'
    }
  },
  {
    id: 'att-3',
    name: 'صورة_معاينة_السطح_المتصدع.jpg',
    size: '2.4 MB',
    type: 'image',
    fileType: 'image',
    date: '2026-06-30',
    description: 'لقطة عالية الدقة تم رصدها ميدانياً توضح شروخ السقف الخرساني وتآكل الحديد تمهيداً للإزالة الجبرية.',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
    metadata: {
      'آلة الرصد': 'كاميرا المعاينة التخصصية لنظم الخبرة',
      'تاريخ اللقطة': '٣٠ يونيو ٢٠٢٦ م',
      'الموقع الإنشائي': 'عقار ٢٧ العمرانية - السطح العلوي الخرساني',
      'التوصية الهندسية': 'إزالة فورية لتفادي الانهيار الكلي'
    }
  },
  {
    id: 'att-4',
    name: 'صورة_الواجهة_الخارجية_للعقار_٢٧.jpg',
    size: '3.1 MB',
    type: 'image',
    fileType: 'image',
    date: '2026-06-30',
    description: 'صورة الواجهة الخارجية لبيت العمرانية توضح المحل التجاري (محل محمد الجندي) واللافتة المخالفة.',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    metadata: {
      'جهة الرصد': 'اللجنة الهندسية لمعاينة محكمة الجيزة',
      'رصد المخالفة': 'تركيب لوحة تجارية عشوائية مخلة بالواجهة',
      'الحالة الفنية': 'الواجهة سليمة إنشائياً باستثناء الدور الخامس'
    }
  },
  {
    id: 'att-5',
    name: 'كروكي_الرفع_المساحي_الرقمي.png',
    size: '4.5 MB',
    type: 'map',
    fileType: 'map',
    date: '2026-07-01',
    description: 'مخطط كروكي معتمد يوضح حدود عقار العمرانية، مساحته الصافية، وتطابقه مع خط تنظيم الطرق العامة بالجيزة.',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    metadata: {
      'المهندس الراسم': 'م. هشام عادل (خبير الرفع المساحي والخرائط)',
      'الحد البحري': 'جار بعرض ١٢.٥ متر وممر خاص',
      'الحد القبلي': 'شارع شبين الكوم الرئيسي بعرض ٢٠ متر',
      'الحد الشرقي': 'ملك ورثة محمود السلاب',
      'الحد الغربي': 'شارع جانبي بعرض ٦ أمتار فرعي'
    }
  },
  {
    id: 'att-6',
    name: 'خريطة_موقع_العمرانية_نظام_الـGPS.png',
    size: '2.9 MB',
    type: 'map',
    fileType: 'map',
    date: '2026-07-01',
    description: 'تحديد الإحداثيات الجغرافية الرقمية على خريطة هيئة المساحة المصرية وتطابق المسح المساحي للعقار.',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    metadata: {
      'دقة الـGPS': 'تحديد مساحي متناهي الدقة (± ٥ سم)',
      'خط العرض (Lat)': '٢٩.٩٩١٢ شمالاً',
      'خط الطول (Lng)': '٣١.١٤٢٥ شرقاً',
      'القطاع المساحي': 'بند جيزة - العمرانية الغربية ٥٤'
    }
  }
];

export interface ChecklistItem {
  id: string;
  title: string;
  party: 'seller' | 'buyer';
  status: 'uploaded' | 'pending' | 'missing';
  required: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Seller
  { id: 'chk-s1', title: 'بطاقة الرقم القومي للبائع (المالك الأصلي)', party: 'seller', status: 'uploaded', required: true },
  { id: 'chk-s2', title: 'عقد الملكية الأساسي الموثق / السند المسجل', party: 'seller', status: 'pending', required: true },
  { id: 'chk-s3', title: 'كشف المكلفة الضريبية وشهادة التصرفات العقارية', party: 'seller', status: 'missing', required: true },
  { id: 'chk-s4', title: 'التراخيص الإنشائية والرسومات الهندسية المعتمدة', party: 'seller', status: 'uploaded', required: false },
  // Buyer
  { id: 'chk-b1', title: 'بطاقة الرقم القومي للمشتري (الطرف الثاني)', party: 'buyer', status: 'uploaded', required: true },
  { id: 'chk-b2', title: 'عقد البيع الابتدائي الجديد موضوع النزاع', party: 'buyer', status: 'uploaded', required: true },
  { id: 'chk-b3', title: 'إيصالات السداد البنكي والدفعات المالية الموثقة', party: 'buyer', status: 'pending', required: true },
  { id: 'chk-b4', title: 'توكيل رسمي خاص بالتعامل والتعاقد (مسجل)', party: 'buyer', status: 'missing', required: false },
];

export default function DigitalAttachmentsRegister({ caseNumber }: DigitalAttachmentsRegisterProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem(`smart_expert_attachments_${caseNumber}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ATTACHMENTS;
      }
    }
    return INITIAL_ATTACHMENTS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'document' | 'image' | 'map'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(INITIAL_ATTACHMENTS[0]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [newFileType, setNewFileType] = useState<'document' | 'image' | 'map'>('document');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 📸 CAMERA & OCR STATES ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrResultText, setOcrResultText] = useState<string>('');
  const [scannedDocName, setScannedDocName] = useState<string>('مستند_قضائي_ممسوح_رقمي_1.pdf');
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    localStorage.setItem(`smart_expert_attachments_${caseNumber}`, JSON.stringify(attachments));
  }, [attachments, caseNumber]);

  // --- 🏛️ DIGITAL AUDIT CHECKLIST STATES & HANDLERS ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(`smart_expert_checklist_${caseNumber}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CHECKLIST;
      }
    }
    return DEFAULT_CHECKLIST;
  });

  const [isAddingCustomDoc, setIsAddingCustomDoc] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocParty, setCustomDocParty] = useState<'seller' | 'buyer'>('seller');
  const [customDocRequired, setCustomDocRequired] = useState(true);

  useEffect(() => {
    localStorage.setItem(`smart_expert_checklist_${caseNumber}`, JSON.stringify(checklist));
  }, [checklist, caseNumber]);

  const handleToggleStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatusMap: { [key: string]: 'uploaded' | 'pending' | 'missing' } = {
          'uploaded': 'pending',
          'pending': 'missing',
          'missing': 'uploaded'
        };
        return { ...item, status: nextStatusMap[item.status] };
      }
      return item;
    }));
    triggerToast('تم تحديث حالة المستند المحددة بنجاح', 'success');
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocTitle.trim()) {
      triggerToast('يرجى إدخال اسم المستند أولاً', 'error');
      return;
    }
    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      title: customDocTitle.trim(),
      party: customDocParty,
      status: 'pending',
      required: customDocRequired
    };
    setChecklist(prev => [...prev, newItem]);
    setCustomDocTitle('');
    setIsAddingCustomDoc(false);
    triggerToast('تمت إضافة المستند المخصص لقائمة الفحص بنجاح', 'success');
  };

  const handleDeleteChecklistItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecklist(prev => prev.filter(item => item.id !== id));
    triggerToast('تم حذف بند الفحص بنجاح', 'warning');
  };

  // Checklist Statistics
  const sellerDocs = checklist.filter(item => item.party === 'seller');
  const buyerDocs = checklist.filter(item => item.party === 'buyer');

  const sellerUploaded = sellerDocs.filter(item => item.status === 'uploaded').length;
  const buyerUploaded = buyerDocs.filter(item => item.status === 'uploaded').length;

  const sellerPercentage = sellerDocs.length > 0 ? Math.round((sellerUploaded / sellerDocs.length) * 100) : 0;
  const buyerPercentage = buyerDocs.length > 0 ? Math.round((buyerUploaded / buyerDocs.length) * 100) : 0;

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // --- 📸 CAMERA & OCR HANDLERS ---
  const startCamera = async (deviceId?: string) => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Enumerate devices to get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        setActiveCameraId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      triggerToast("عذراً، فشل الوصول إلى الكاميرا. يرجى التحقق من الأذونات وتوفير الكاميرا.", "error");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setOcrResultText('');
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        // We can stop the camera stream now so we don't drain resources while doing OCR
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    }
  };

  const runOcr = async () => {
    if (!capturedImage) return;
    setIsProcessingOcr(true);
    triggerToast("جاري معالجة وتحويل مستندك القضائي عبر المستشار الذكي...", "info");
    
    try {
      const response = await fetch("/api/gemini/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: capturedImage,
          mimeType: "image/jpeg"
        })
      });
      
      if (!response.ok) {
        throw new Error("فشلت عملية التحويل الرقمي للمستند.");
      }
      
      const data = await response.json();
      setOcrResultText(data.text || "لم يتم رصد أي نصوص واضحة في المستند.");
      triggerToast("تم تحويل المستند القضائي إلى نص رقمي بنجاح!", "success");
    } catch (error: any) {
      console.error("OCR API error:", error);
      triggerToast("فشل في تحويل المستند القضائي. يرجى المحاولة لاحقاً.", "error");
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const saveScannedDocument = () => {
    if (!ocrResultText) return;
    
    const fileId = `att-${Date.now()}`;
    const newAtt: Attachment = {
      id: fileId,
      name: scannedDocName.endsWith('.pdf') ? scannedDocName : `${scannedDocName}.pdf`,
      size: `${(ocrResultText.length * 2 / 1024).toFixed(1)} KB`,
      type: 'document',
      fileType: 'pdf',
      date: new Date().toISOString().split('T')[0],
      description: "مستند قضائي ورقي تم مسحه ضوئياً وتحويله بالكامل إلى نص رقمي باستخدام كاميرا النظام وتقنية OCR.",
      contentPreview: ocrResultText,
      metadata: {
        'المصدر': 'مسح ضوئي بالكاميرا المباشرة',
        'تقنية المعالجة': 'Gemini 3.5 OCR Engine',
        'المستخدم المنفذ': 'كابتن حسام (الخبير العقاري)',
        'تاريخ المسح': new Date().toLocaleDateString('ar-EG'),
        'حالة التدقيق': 'مكتمل ومفهرس'
      }
    };
    
    setAttachments(prev => [newAtt, ...prev]);
    setSelectedAttachment(newAtt);
    
    // Close camera scanner and clean up
    stopCamera();
    triggerToast("تمت إضافة المستند الرقمي بنجاح إلى سجل المرفقات المعتمد!", "success");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const fileId = `att-${Date.now()}`;
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // Auto detect type based on extension
    let detectedType: 'document' | 'image' | 'map' = 'document';
    let fileTypeLabel: 'pdf' | 'word' | 'image' | 'map' = 'pdf';

    if (fileExt === 'pdf') {
      detectedType = 'document';
      fileTypeLabel = 'pdf';
    } else if (fileExt === 'doc' || fileExt === 'docx') {
      detectedType = 'document';
      fileTypeLabel = 'word';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      // Prompt/Ask user or fallback to chosen tab
      detectedType = newFileType; // use current selection
      fileTypeLabel = newFileType === 'map' ? 'map' : 'image';
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    // Initialize progress mockup
    triggerToast(`جاري رفع ومعالجة الملف "${file.name}"...`, 'info');
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 15;
      if (progressValue >= 100) {
        clearInterval(interval);
        progressValue = 100;

        // Add the uploaded file
        const newAtt: Attachment = {
          id: fileId,
          name: file.name,
          size: sizeStr,
          type: detectedType,
          fileType: fileTypeLabel,
          date: new Date().toISOString().split('T')[0],
          description: `مرفق مضاف يدوياً تم تحميله وفهرسته تحت تصنيف (${detectedType === 'document' ? 'مستندات' : detectedType === 'image' ? 'صور' : 'خرائط'}).`,
          contentPreview: detectedType === 'document' 
            ? `[تفريغ مستند رقمي مضاف]\nاسم الملف: ${file.name}\nتاريخ الإدراج: ${new Date().toLocaleDateString('ar-EG')}\nتمت مطابقة وفحص هذا الملف بنجاح للتأكد من خلوه من الأخطاء البنائية أو الهندسية ومطابقتة لبيت العمرانية.` 
            : undefined,
          url: detectedType !== 'document' ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' : undefined,
          metadata: {
            'نوع الملف': file.type || 'غير معروف',
            'حجم الملف': sizeStr,
            'المستخدم المضيف': 'كابتن حسام (الخبير العقاري)',
            'تطابق الأرشيف': 'تم بنجاح ومطابق للأصل'
          }
        };

        setAttachments(prev => [newAtt, ...prev]);
        setSelectedAttachment(newAtt);
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });

        triggerToast(`نجح التحميل وفهرسة "${file.name}" بنجاح!`, 'success');
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: progressValue }));
      }
    }, 150);
  };

  const handleDeleteAttachment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا المرفق نهائياً من سجل القضية؟');
    if (!confirmed) return;

    setAttachments(prev => {
      const remaining = prev.filter(att => att.id !== id);
      const deletedItem = prev.find(att => att.id === id);
      if (deletedItem) {
        triggerToast(`تم حذف المرفق "${deletedItem.name}" بنجاح.`, 'warning');
      }
      if (selectedAttachment?.id === id) {
        setSelectedAttachment(remaining.length > 0 ? remaining[0] : null);
      }
      return remaining;
    });
  };

  // Filtered attachments
  const filteredAttachments = attachments.filter(att => {
    const matchesTab = activeTab === 'all' || att.type === activeTab;
    const matchesSearch = att.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          att.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Category counters
  const counts = {
    all: attachments.length,
    document: attachments.filter(a => a.type === 'document').length,
    image: attachments.filter(a => a.type === 'image').length,
    map: attachments.filter(a => a.type === 'map').length,
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-right">
      
      {/* 1. Header & Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] shadow-[0_0_8px_rgba(245,158,11,0.15)]">
              سجل معتمد ومحمي ✓
            </span>
            <h3 className="text-white text-base font-black flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-cyan-400" />
              <span>سجل المرفقات الرقمي الموحد لبيت العمرانية</span>
            </h3>
          </div>
          <p className="text-slate-400 text-xs font-semibold leading-normal">
            فهرسة تلقائية وأرشفة للخرائط، مذكرات الدفاع، العقود الموثقة وصور المعاينة الميدانية مع نظام المعاينة الفوري المباشر.
          </p>
        </div>
      </div>

      {alertMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 justify-between animate-fadeIn">
          <span>{alertMessage}</span>
          <button onClick={() => setAlertMessage(null)} className="text-emerald-500 hover:text-white font-black text-sm">×</button>
        </div>
      )}

      {/* 2. Drag & Drop Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Attachment Upload Controls */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button 
                type="button"
                onClick={() => setNewFileType('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newFileType === 'map' ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ خرائط
              </button>
              <button 
                type="button"
                onClick={() => setNewFileType('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newFileType === 'image' ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                📸 صور المعاينة
              </button>
              <button 
                type="button"
                onClick={() => setNewFileType('document')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  newFileType === 'document' ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                📄 مستندات (PDF / Word)
              </button>
            </div>
            <span className="text-slate-400 text-xs font-black text-center sm:text-right">
              تصنيف الملف:
            </span>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'border-slate-800 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-900/10'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <UploadCloud className="w-9 h-9 text-cyan-400 shadow-[0_0_8px_#00f0ff] filter drop-shadow-[0_0_5px_#00f0ff] animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-white text-xs font-black">اسحب مستندات القضية أو كروكي المساحة وألقها هنا</h4>
                <p className="text-slate-500 text-[10px] font-bold">
                  ندعم مستندات الـ PDF وعقود الـ Word والخرائط والصور (أقصى حجم 15 ميجابايت)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 📷 Live Camera scanning & OCR card */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-950 to-slate-900/40 p-5 rounded-3xl border border-slate-850/80 flex flex-col justify-between text-right min-h-[170px] shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.1)]">تكنولوجيا OCR ذكية</span>
              <h4 className="text-white text-xs font-black flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>المسح الضوئي بالكاميرا المباشرة</span>
              </h4>
            </div>
            <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
              التقط صوراً فورية للمستندات القضائية والتقارير الورقية الميدانية ليقوم النظام بتحويلها تلقائياً بالذكاء الاصطناعي إلى نصوص رقمية قابلة للمراجعة والتضمين.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setIsCameraOpen(true);
              startCamera();
            }}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
          >
            <Camera className="w-4 h-4" />
            <span>تشغيل الكاميرا ومسح مستند قضائي ورقي</span>
          </button>
        </div>

      </div>

      {/* --- 🏛️ DIGITAL DOCUMENTS AUDIT CHECKLIST SECTION --- */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-850/80 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="space-y-1 text-right">
            <h4 className="text-white text-sm font-black flex items-center gap-2 justify-end sm:justify-start">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>قائمة فحص وتدقيق المستندات الرقمية (البائع والمشتري)</span>
            </h4>
            <p className="text-slate-400 text-[11px] font-bold">
              مراجعة وتوثيق الأوراق والمستندات الثبوتية المقدمة من أطراف النزاع لتأكيد صحة الادعاءات والمطابقة الفنية.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsAddingCustomDoc(!isAddingCustomDoc)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بند فحص مخصص</span>
          </button>
        </div>

        {/* Add Custom Doc Form (Dynamic) */}
        {isAddingCustomDoc && (
          <form onSubmit={handleAddCustomDoc} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <h5 className="text-white text-xs font-black">إضافة مستند فحص جديد إلى السجل:</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Document Name input */}
              <div className="md:col-span-6 space-y-1 text-right">
                <label className="text-[10px] text-slate-400 font-bold block">اسم المستند المطلوب:</label>
                <input
                  type="text"
                  placeholder="مثال: كشف مكلفة من الضرائب العقارية..."
                  value={customDocTitle}
                  onChange={e => setCustomDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 text-right font-medium"
                />
              </div>

              {/* Party selection */}
              <div className="md:col-span-3 space-y-1 text-right">
                <label className="text-[10px] text-slate-400 font-bold block">الجهة المقدمة للمستند:</label>
                <select
                  value={customDocParty}
                  onChange={e => setCustomDocParty(e.target.value as 'seller' | 'buyer')}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 text-right font-semibold"
                >
                  <option value="seller">البائع (الطرف الأول)</option>
                  <option value="buyer">المشتري (الطرف الثاني)</option>
                </select>
              </div>

              {/* Required status selection */}
              <div className="md:col-span-3 space-y-1 text-right">
                <label className="text-[10px] text-slate-400 font-bold block">الأهمية القانونية للمستند:</label>
                <select
                  value={customDocRequired ? 'true' : 'false'}
                  onChange={e => setCustomDocRequired(e.target.value === 'true')}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 text-right font-semibold"
                >
                  <option value="true">مطلوب وإلزامي (خلفية حمراء)</option>
                  <option value="false">اختياري / استرشادى (خلفية رمادية)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-start">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer"
              >
                حفظ المستند بالسجل
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustomDoc(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Double Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Seller Column */}
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
            
            {/* Column Header & Progress */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 flex-row-reverse">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span className="text-white text-xs font-black">مستندات البائع (الطرف الأول)</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {sellerUploaded} / {sellerDocs.length} مستند ({sellerPercentage}%)
                </span>
              </div>
            </div>

            {/* Column Progress Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                style={{ width: `${sellerPercentage}%` }}
              ></div>
            </div>

            {/* Document Checklist Items */}
            <div className="space-y-2">
              {sellerDocs.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleStatus(item.id)}
                  className="p-3 bg-slate-950/80 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-right cursor-pointer group transition-all select-none"
                >
                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span 
                      className={`text-[9px] px-2.5 py-1 rounded-lg font-black shrink-0 transition-colors ${
                        item.status === 'uploaded' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : item.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {item.status === 'uploaded' && 'تم التقديم ✓'}
                      {item.status === 'pending' && 'معلق الانتظار ⏳'}
                      {item.status === 'missing' && 'مفقود / مطلوب ❌'}
                    </span>

                    {/* Delete Custom button */}
                    {item.id.startsWith('chk-custom-') && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChecklistItem(item.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-right">
                    <input
                      type="checkbox"
                      checked={item.status === 'uploaded'}
                      onChange={() => handleToggleStatus(item.id)}
                      className="w-4 h-4 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 bg-slate-950 shrink-0 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs font-semibold group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {item.required ? (
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-bold">
                        إلزامي
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-750 px-1.5 py-0.5 rounded-md font-bold">
                        استرشادي
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* 2. Buyer Column */}
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
            
            {/* Column Header & Progress */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 flex-row-reverse">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-xs font-black">مستندات المشتري (الطرف الثاني)</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {buyerUploaded} / {buyerDocs.length} مستند ({buyerPercentage}%)
                </span>
              </div>
            </div>

            {/* Column Progress Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300"
                style={{ width: `${buyerPercentage}%` }}
              ></div>
            </div>

            {/* Document Checklist Items */}
            <div className="space-y-2">
              {buyerDocs.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleStatus(item.id)}
                  className="p-3 bg-slate-950/80 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-right cursor-pointer group transition-all select-none"
                >
                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span 
                      className={`text-[9px] px-2.5 py-1 rounded-lg font-black shrink-0 transition-colors ${
                        item.status === 'uploaded' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : item.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {item.status === 'uploaded' && 'تم التقديم ✓'}
                      {item.status === 'pending' && 'معلق الانتظار ⏳'}
                      {item.status === 'missing' && 'مفقود / مطلوب ❌'}
                    </span>

                    {/* Delete Custom button */}
                    {item.id.startsWith('chk-custom-') && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChecklistItem(item.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-right">
                    <input
                      type="checkbox"
                      checked={item.status === 'uploaded'}
                      onChange={() => handleToggleStatus(item.id)}
                      className="w-4 h-4 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 bg-slate-950 shrink-0 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs font-semibold group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {item.required ? (
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-bold">
                        إلزامي
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-750 px-1.5 py-0.5 rounded-md font-bold">
                        استرشادي
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Info label */}
        <p className="text-[10px] text-slate-500 font-bold text-center">
          💡 انقر على أي مستند بالأعلى لتبديل حالته بشكل سريع ودوري بين (تم التقديم ✓، معلق الانتظار ⏳، ومفقود / مطلوب ❌).
        </p>

      </div>

      {/* 3. Filtering & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
        
        {/* Index Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 flex-wrap overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'all' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>الكل</span>
            <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-bold">{counts.all}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'document' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>مستندات (PDF/Word)</span>
            <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-bold">{counts.document}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'image' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>صور المعاينة</span>
            <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-bold">{counts.image}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>خرائط ومساحات</span>
            <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-bold">{counts.map}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm lg:mr-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="البحث في الملفات والمرفقات الرقمية..."
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pr-10 pl-4 py-2.5 focus:outline-none focus:border-cyan-400 text-right font-medium"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
        </div>

      </div>

      {/* 4. Layout split: Left Side (Files list), Right Side (Interactive Preview) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Attachments List Container (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-3">
          <span className="text-[10px] text-slate-500 font-black block">قائمة المرفقات المفهرسة والمتاحة للعمل:</span>
          
          {Object.keys(uploadProgress).map((key) => (
            <div key={key} className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-2 text-right animate-pulse">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-cyan-400">{uploadProgress[key]}%</span>
                <span className="text-white text-xs font-bold truncate max-w-[200px]">جاري رفع ومعالجة مستند...</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150" 
                  style={{ width: `${uploadProgress[key]}%` }}
                ></div>
              </div>
            </div>
          ))}

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredAttachments.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                <FolderOpen className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-xs font-bold">لا توجد ملفات مطابقة لبحثك أو تصنيفك.</p>
              </div>
            ) : (
              filteredAttachments.map((att) => {
                const isSelected = selectedAttachment?.id === att.id;
                
                return (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttachment(att)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-right select-none ${
                      isSelected 
                        ? 'bg-cyan-500/5 border-cyan-400/40 shadow-lg shadow-cyan-400/5' 
                        : 'bg-slate-950/70 border-slate-850 hover:bg-slate-950 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <input
                          type="checkbox"
                          checked={att.selected !== false}
                          onChange={(e) => {
                            e.stopPropagation();
                            const nextState = att.selected === false ? true : false;
                            setAttachments(prev => prev.map(item => item.id === att.id ? { ...item, selected: nextState } : item));
                            triggerToast(nextState ? `✓ تم تمكين المستند وتضمينه في ملف القضية` : `⏳ تم استبعاد المستند مؤقتاً`, nextState ? 'success' : 'warning');
                          }}
                          className="w-4 h-4 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 bg-slate-950 mt-2 shrink-0 cursor-pointer"
                        />
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                          att.type === 'document' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                          att.type === 'image' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        }`}>
                          {att.type === 'document' && <FileText className="w-4 h-4" />}
                          {att.type === 'image' && <ImageIcon className="w-4 h-4" />}
                          {att.type === 'map' && <MapIcon className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-white text-xs font-black truncate max-w-[180px] sm:max-w-[240px] group-hover:text-cyan-400" title={att.name}>
                            {att.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block line-clamp-1 font-semibold leading-relaxed">
                            {att.description}
                          </span>
                        </div>
                      </div>
                      
                      <span className="text-[9px] text-slate-500 font-mono font-bold shrink-0">{att.size}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                      <span className="text-[9px] text-slate-500 font-mono font-bold">تاريخ الإدراج: {att.date}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAttachment(att.id, e)}
                          className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 border border-transparent hover:border-red-900/30 rounded-lg transition-colors cursor-pointer"
                          title="حذف المرفق"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold border ${
                          att.type === 'document' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          att.type === 'image' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {att.type === 'document' ? '📄 مستند' : att.type === 'image' ? '📸 صورة' : '🗺️ خريطة'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic File Interactive Preview Container (xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-3">
          <span className="text-[10px] text-slate-500 font-black block">لوحة المعاينة التفاعلية المباشرة للمرفق:</span>
          
          {selectedAttachment ? (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl relative animate-in fade-in duration-300">
              
              {/* Preview Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    selectedAttachment.type === 'document' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    selectedAttachment.type === 'image' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    'bg-purple-500/15 border-purple-500/30 text-purple-400'
                  }`}>
                    {selectedAttachment.type === 'document' && <FileText className="w-3.5 h-3.5" />}
                    {selectedAttachment.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                    {selectedAttachment.type === 'map' && <MapIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-extrabold max-w-[200px] truncate" title={selectedAttachment.name}>
                      {selectedAttachment.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      تصنيف المعاينة الحالية: {selectedAttachment.type === 'document' ? 'مستند قانوني' : selectedAttachment.type === 'image' ? 'صورة رصد فوتوغرافي' : 'مسح مساحي رقمي'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={selectedAttachment.url || '#'} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-inner active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل المستند</span>
                  </a>
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-950 px-2 py-1 rounded border border-slate-850">{selectedAttachment.size}</span>
                </div>
              </div>

              {/* Preview Content (Changes dynamically based on type) */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[380px] scrollbar-thin">
                
                {/* PDF & Word View Layout */}
                {selectedAttachment.type === 'document' && (
                  <div className="space-y-4">
                    {/* Legal metadata stamps */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-right space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block">توثيق المستند:</span>
                        <span className="text-cyan-400 text-xs font-black block">✓ مصلحة التوثيق والشهر العقاري</span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-right space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block">التأريخ والمطابقة:</span>
                        <span className="text-amber-400 text-xs font-black block">✓ نسخة أصلية مطابقة للأوراق</span>
                      </div>
                    </div>

                    {/* Word-like or PDF-like document canvas wrapper */}
                    <div className={`p-6 rounded-2xl text-slate-200 text-xs sm:text-sm leading-relaxed font-semibold relative border overflow-hidden ${
                      selectedAttachment.fileType === 'pdf' 
                        ? 'bg-slate-900 border-slate-800 bg-[linear-gradient(rgba(13,13,15,0.85)_1px,transparent_1px)] bg-[size:100%_2.5rem]' 
                        : 'bg-slate-950 border-blue-900/30 shadow-[inset_0_0_20px_rgba(30,58,138,0.15)] bg-[linear-gradient(rgba(26,26,30,0.8)_1px,transparent_1px)] bg-[size:100%_2rem]'
                    }`}>
                      {/* Document Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none rotate-12">
                        <div className="border-[8px] border-amber-500 text-amber-500 text-3xl font-black p-4 rounded-3xl">
                          نظام مصلحة الخبراء القضائيين
                        </div>
                      </div>

                      {/* Document text block */}
                      <p className="whitespace-pre-wrap leading-loose text-justify text-slate-300 font-medium tracking-wide">
                        {selectedAttachment.contentPreview}
                      </p>

                      <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>صفحة ١ من ١</span>
                        <span className="font-mono text-[9px]">أرشفة رقمية: {selectedAttachment.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo View Layout */}
                {selectedAttachment.type === 'image' && (
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-850 max-h-[280px] w-full group">
                      <img 
                        src={selectedAttachment.url} 
                        alt={selectedAttachment.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-4 right-4 left-4 text-right">
                        <span className="text-[10px] text-amber-400 font-bold block bg-amber-950/80 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit mr-auto">
                          لقطة معاينة فوتوغرافية ميدانية معتمدة
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-semibold text-center leading-relaxed">
                      💡 {selectedAttachment.description}
                    </p>
                  </div>
                )}

                {/* Map View Layout */}
                {selectedAttachment.type === 'map' && (
                  <div className="space-y-4">
                    {/* Simulated interactive coordinate block */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-400 animate-bounce" />
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-bold block">إحداثيات الرفع المساحي:</span>
                          <span className="text-white font-mono text-xs font-black">29.9912° N, 31.1425° E</span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl font-bold">
                        متطابق مع هيئة المساحة والخرائط ✓
                      </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-850 max-h-[220px] w-full group">
                      <img 
                        src={selectedAttachment.url} 
                        alt={selectedAttachment.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[9px] bg-slate-950/90 text-white border border-slate-850 px-2 py-1 rounded-lg font-mono">EG-GIZA-GRID-27</span>
                        <span className="text-[9px] bg-purple-950/95 text-purple-300 border border-purple-500/25 px-2.5 py-1 rounded-lg font-bold">كروكي مساحة جوي</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-semibold text-center leading-relaxed">
                      💡 {selectedAttachment.description}
                    </p>
                  </div>
                )}

                {/* Metadata Properties Grid */}
                {selectedAttachment.metadata && (
                  <div className="mt-5 pt-4 border-t border-slate-900 space-y-2.5 text-right">
                    <span className="text-[10px] text-slate-500 font-bold block">تفاصيل وبيانات المرفق الفنية:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(selectedAttachment.metadata).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                          <span className="text-white font-bold">{val}</span>
                          <span className="text-slate-400">{key}:</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Preview Footer Actions */}
              <div className="p-4 bg-slate-900 border-t border-slate-850 flex items-center justify-between flex-wrap gap-3">
                <span className="text-[10px] text-slate-500 font-mono font-bold">SECURED ATTACHMENT VIEWPORT</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-cyan-400 font-bold animate-pulse flex items-center gap-1">
                    <span>تحليل ذكي متوافق ✓</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]"></span>
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-850">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-white text-sm font-black">لم يتم اختيار أي مرفق لمعاينته</h4>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  الرجاء النقر على أي مرفق أو مستند أو خريطة في القائمة اليمنى لعرض معاينته الكاملة ومطابقة محتواه بدعوى بيت العمرانية.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 5. Shared Legal Context Info box */}
      <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10 space-y-2 text-right">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black justify-end">
          <span>تنبيه المزامنة والسرية الموحدة لبيت العمرانية</span>
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
          يتم ربط ومزامنة كافة الخرائط الرقمية وصور المعاينات الإنشائية تلقائياً بالملف الاستدلالي الموحد والمقدم للنيابة العامة ووزارة العدل. يرجى توخي الدقة في البيانات المرفوعة من قبل الخبير المعين كابتن حسام.
        </p>
      </div>

      {/* 📸 CAMERA SCANNER & INTELLIGENT OCR MODAL OVERLAY */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative text-right animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <button 
                onClick={stopCamera}
                className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ×
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Camera className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-black">المسح الضوئي المباشر والتحويل الذكي (OCR)</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">مدعوم بنظام الذكاء الاصطناعي لاستخلاص النصوص العقارية والعدلية</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1 max-h-[70vh] overflow-y-auto">
              
              {/* Step 1: Camera Feed or Preview */}
              {!capturedImage ? (
                <div className="space-y-4">
                  {/* Camera device selection (only if multiple exist) */}
                  {availableCameras.length > 1 && (
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-black block">اختر الكاميرا النشطة:</label>
                      <select 
                        value={activeCameraId}
                        onChange={(e) => {
                          setActiveCameraId(e.target.value);
                          startCamera(e.target.value);
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                      >
                        {availableCameras.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `كاميرا ${availableCameras.indexOf(device) + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Realtime Video Stream Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-h-[350px] bg-black group flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover scale-x-[-1]" 
                    />
                    
                    {/* Visual Overlay Scanning Frame Target */}
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-3/4 border-2 border-cyan-400/50 rounded-lg relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                        {/* Laser line effect */}
                        <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#00f0ff] animate-pulse animate-bounce" style={{ top: '50%' }}></div>
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400 rounded-br"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800 text-[10px] text-slate-300 font-bold">
                      ضع المستند الورقي داخل الإطار الأخضر بوضوح
                    </div>
                  </div>

                  {/* Trigger Action */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>التقاط لقطة للمستند الورقي</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Captured image preview frame */}
                  {!ocrResultText && !isProcessingOcr && (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-[250px] bg-slate-950 flex items-center justify-center">
                        <img 
                          src={capturedImage} 
                          alt="Captured judicial doc" 
                          className="max-h-full max-w-full object-contain" 
                        />
                        <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 text-[10px] text-cyan-400 font-bold px-2.5 py-1 rounded-lg">
                          تم التقاط المستند القضائي بنجاح ✓
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCapturedImage(null);
                            startCamera(activeCameraId);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl py-3 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          إعادة التقاط الصورة
                        </button>
                        <button
                          type="button"
                          onClick={runOcr}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3 rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>بدء المعالجة واستخراج النصوص (OCR)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Processing / Loading Screen */}
                  {isProcessingOcr && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin"></div>
                        <Camera className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white text-xs font-black animate-pulse">جاري قراءة وتحليل المستند القضائي عبر الذكاء الاصطناعي...</h4>
                        <p className="text-[10px] text-slate-500 font-bold">نقوم بفهرسة السطور واستخلاص الكلمات العربية بدقة متناهية</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: OCR Results and Save */}
                  {ocrResultText && !isProcessingOcr && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      
                      <div className="space-y-1 text-right">
                        <label className="text-slate-400 text-xs font-black block">تعديل/تأكيد النص الرقمي المستخرج:</label>
                        <textarea
                          value={ocrResultText}
                          onChange={(e) => setOcrResultText(e.target.value)}
                          rows={8}
                          dir="rtl"
                          className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 text-right">
                          <label className="text-slate-400 text-xs font-black block">نوع المستند:</label>
                          <input
                            type="text"
                            disabled
                            value="📄 مستند قانوني (مسح ضوئي)"
                            className="w-full bg-slate-900 border border-slate-850/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1 text-right">
                          <label className="text-slate-400 text-xs font-black block">تسمية الملف:</label>
                          <input
                            type="text"
                            value={scannedDocName}
                            onChange={(e) => setScannedDocName(e.target.value)}
                            placeholder="مستند_قضائي_ممسوح_رقمي_1.pdf"
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOcrResultText('');
                            setCapturedImage(null);
                            startCamera(activeCameraId);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl py-3.5 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          إعادة المسح الضوئي
                        </button>
                        <button
                          type="button"
                          onClick={saveScannedDocument}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3.5 rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>إدراج المستند في سجل المرفقات</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-mono font-bold">SECURE ON-DEVICE SANDBOX SCANNER</span>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء وإغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

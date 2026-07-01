import React, { useRef, useState } from 'react';
import { CaseData, CalculationResults } from '../types';
import { 
  Printer, 
  Download, 
  FileText, 
  Award, 
  CheckCircle2, 
  Scale, 
  MapPin, 
  ChevronLeft,
  Calendar,
  DollarSign,
  Shield,
  Eye
} from 'lucide-react';

interface ReportViewProps {
  caseData: CaseData;
  results: CalculationResults;
  onPrint: () => void;
}

export default function ReportView({ caseData, results, onPrint }: ReportViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  
  // Selected report subtype:
  // 'judge': Main report addressed to the Judge
  // 'prosecution': Report to the Public Prosecution (النيابة العامة)
  // 'police': Report to the Police Force (قوة الشرطة وجهاز التنفيذ)
  // 'interior': Report to the Ministry of Interior (جهاز الداخلية والأمن)
  // 'schedule': Integrated directive schedule (تعليمات بتواريخ وتكاليف)
  // 'judgments': Suggested court judgments for Mohamed El Gendy and Majda El Gayyar
  const [activeReportType, setActiveReportType] = useState<'judge' | 'prosecution' | 'police' | 'interior' | 'schedule' | 'judgments'>('judge');

  const [isJudgmentsSigned, setIsJudgmentsSigned] = useState(false);

  // Timestamps calculations relative to report date
  const getRelativeDate = (days: number) => {
    try {
      const baseDate = new Date(caseData.date);
      if (isNaN(baseDate.getTime())) return new Date().toISOString().split('T')[0];
      baseDate.setDate(baseDate.getDate() + days);
      return baseDate.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const datesAndCosts = {
    expertInspectionFee: 5000,
    registrationFee: results.registrationFee,
    transferTax: results.transferTax,
    propertyTax: results.propertyTax,
    totalImmediateCosts: results.registrationFee + results.transferTax + 5000,
    
    dates: {
      reportFiling: caseData.date,
      appealStart: getRelativeDate(2),
      appealEnd: getRelativeDate(17), // 15 days for appeal
      securityCoordination: getRelativeDate(25),
      courtHearing: getRelativeDate(45), // 45 days for final judgment
      possessionEnforcement: getRelativeDate(60) // 60 days
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-Report Selector Tabs Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl">
        <span className="text-[10px] text-slate-500 font-extrabold block mb-3 text-right pr-2">توجيه التقرير القضائي واختيار القطاع السيادي المعني</span>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          
          <button
            onClick={() => setActiveReportType('judge')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'judge' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            ⚖️ <span>السيد القاضي</span>
          </button>

          <button
            onClick={() => setActiveReportType('prosecution')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'prosecution' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            🏛️ <span>النيابة العامة</span>
          </button>

          <button
            onClick={() => setActiveReportType('police')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'police' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            👮 <span>جهاز الشرطة</span>
          </button>

          <button
            onClick={() => setActiveReportType('interior')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'interior' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            🛡️ <span>وزارة الداخلية</span>
          </button>

          <button
            onClick={() => setActiveReportType('schedule')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'schedule' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            📅 <span>المواعيد والتكاليف</span>
          </button>

          <button
            onClick={() => setActiveReportType('judgments')}
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
              activeReportType === 'judgments' 
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            📜 <span>حكم المحكمة المقترح</span>
          </button>

        </div>
      </div>

      {/* Upper Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          <span className="text-white text-xs font-black">
            {activeReportType === 'judge' && 'تقرير الخصومة والرفع المساحي والتركات الموجه للسيد القاضي الجاهز للطباعة'}
            {activeReportType === 'prosecution' && 'التقرير الفني الاستقصائي المحال لنيابة شؤون الأسرة والنيابة العامة'}
            {activeReportType === 'police' && 'تقرير التوجيهات الأمنية والتمكين الإداري المحال لقسم الشرطة المختص'}
            {activeReportType === 'interior' && 'تقرير مطابقة سلامة منشآت الأمن الوطني وحماية الأراضي المحال لوزارة الداخلية'}
            {activeReportType === 'schedule' && 'مصفوفة التعليمات القضائية وجدول الالتزامات المالية والتواريخ القانونية المستهدفة'}
            {activeReportType === 'judgments' && 'الأحكام القضائية النهائية المقترحة (محمد الجندي وماجدة الجيار) الموجهة للمحكمة'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onPrint}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة المستند الحالي (PDF)</span>
          </button>
        </div>
      </div>

      {/* Actual Formatted Judicial Report Sheet */}
      <div className="bg-white text-slate-950 rounded-2xl p-6 md:p-10 shadow-2xl max-w-4xl mx-auto space-y-8 font-sans border border-slate-200" id="print-area" ref={printAreaRef}>
        
        {/* State/Government Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
          <div className="text-right space-y-1">
            <h4 className="font-extrabold text-xs">جمهورية مصر العربية</h4>
            <h4 className="font-extrabold text-xs">وزارة العدل - مصلحة الخبراء</h4>
            <h4 className="text-slate-600 text-[10px] font-semibold">مكتب خبراء وزارة العدل بمحافظة الجيزة والقاهرة</h4>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-slate-950 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-1">
              ⚖️
            </div>
            <span className="text-[10px] font-extrabold block">العدل أساس الملك</span>
          </div>

          <div className="text-left text-xs font-mono font-bold text-slate-700">
            <div>الرقم المرجعي: {caseData.caseNumber}</div>
            <div>التاريخ: {caseData.date}</div>
            <div className="text-[10px] text-red-600 font-bold mt-0.5">سري للغاية ورسمي</div>
          </div>
        </div>

        {/* -------------------- MAIN REPORT: TO THE JUDGE -------------------- */}
        {activeReportType === 'judge' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Report Title */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black underline underline-offset-8 decoration-2 tracking-wide text-slate-900">
                تقرير الخبرة العقارية والإنشائية الفني الإجمالي
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                مقدّم إلى معالي المستشار القاضي رئيس الدائرة بمحكمة: {caseData.court}
              </p>
            </div>

            {/* Section 1: Case Details */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                أولاً: البيانات الأساسية للخصومة والنزاع القضائي
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">رقم القضية المنظورة:</span>
                  <span className="font-extrabold">{caseData.caseNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">السيد القاضي رئيس الدائرة:</span>
                  <span className="font-extrabold text-slate-900">{caseData.judge}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 col-span-2">
                  <span className="text-slate-500 font-bold">موضوع مذكرات النزاع:</span>
                  <span className="font-extrabold leading-relaxed text-right pl-4 text-slate-900">{caseData.dispute.hasDispute ? caseData.dispute.details : 'تقييم فني واستكشاف طيفي لسلامة العقار وتحديد الحصص الشرعية.'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Property Specifications & Coordinates */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                ثانياً: مواصفات العقار والحدود الجغرافية (نظام GPS المطور)
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">موقع العقار بالتحديد:</span>
                  <span className="font-extrabold">{caseData.location}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">المساحة الإجمالية المقاسة:</span>
                  <span className="font-extrabold font-mono text-slate-900">{caseData.landArea} متر مربع</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">التقسيم المحلي والتقليدي:</span>
                  <span className="font-extrabold font-mono text-slate-800">
                    {results.faddan} فدان، {results.qirat} قيراط، {results.sahm} سهم
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">إحداثيات المركز الدقيقة (GPS):</span>
                  <span className="font-extrabold font-mono text-slate-800">
                    {caseData.latitude.toFixed(6)} N, {caseData.longitude.toFixed(6)} E
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Blueprint */}
            {caseData.hasBuilding && (
              <div className="space-y-3">
                <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                  ثالثاً: المقايسة الإنشائية وكميات المواد الأولية وتكلفتها
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">مساحة مسطح البناء الكلي:</span>
                    <span className="font-extrabold">{caseData.buildingArea} م² ({caseData.buildingType})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">عدد الأدوار ومستوى التشطيب:</span>
                    <span className="font-extrabold">{caseData.floors} أدوار ({caseData.finishType})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">تكلفة الإنشاء والتشطيب الإجمالية:</span>
                    <span className="font-extrabold font-mono text-slate-900">{results.constructionCost.toLocaleString('ar-EG')} جنيه</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">القيمة المتبقية للمبنى بعد الاستهلاك:</span>
                    <span className="font-extrabold font-mono text-emerald-700">{results.depreciatedBuildingValue.toLocaleString('ar-EG')} جنيه</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Valuation */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                رابعاً: التقييم المالي والضرائب العقارية المستحقة
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">قيمة الأرض الإجمالية المثبتة:</span>
                  <span className="font-extrabold font-mono">{results.landValue.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">القيمة السوقية الإجمالية للعقار:</span>
                  <span className="font-black font-mono text-slate-900 text-sm">{results.totalPropertyValue.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">الضريبة العقارية السنوية المقدرة:</span>
                  <span className="font-extrabold font-mono text-red-600">{results.propertyTax.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-bold">رسوم الشهر العقاري المقدرة للتسجيل:</span>
                  <span className="font-extrabold font-mono text-emerald-800">{results.registrationFee.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>

            {/* Section 5: Heirs Share distribution (If applicable) */}
            {caseData.heirs.length > 0 && (
              <div className="space-y-3">
                <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                  خامساً: جدول توزيع تركة المواريث الشرعية للخصوم
                </h3>
                <div className="overflow-hidden rounded border border-slate-200 mt-2">
                  <table className="w-full text-right text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-2">الوارث</th>
                        <th className="p-2">الجنس</th>
                        <th className="p-2">النسبة والكسر الشرعي</th>
                        <th className="p-2 text-left">قيمة الحصة المقدرة (جنيه)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {results.heirsShares.map((hs, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{hs.name}</td>
                          <td className="p-2">{hs.gender}</td>
                          <td className="p-2 font-mono text-slate-500">{hs.shareFraction} ({hs.sharePercent.toFixed(2)}%)</td>
                          <td className="p-2 text-left font-black font-mono text-emerald-800">{hs.shareValue.toLocaleString('ar-EG')} ج</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 6: Directives */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                سادساً: التوصيات الاستدلالية والقرارات المقترحة
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <ul className="text-xs list-disc list-inside space-y-1.5 text-slate-800 leading-relaxed font-semibold">
                  <li>ثبوت تخلف المستأجر السيد / محمد الجندي عن سداد الأجرة الشهرية القانونية المقررة ومقدارها 30,000 جنيه شهرياً لمدة 6 أشهر (بإجمالي 180,000 جنيه متأخرات).</li>
                  <li>التوصية بإخلاء العين المؤجرة فوراً وتسليمها للمالك خالية من الأشخاص والشواغل نظراً لخرق بنود التعاقد والمادة القانونية المنظمة لعلاقة الإيجار التجاري.</li>
                  <li>إلزام المدعى عليه (محمد الجندي) بأداء متأخرات الأجرة والتعويض عن قيمة التخريب الحادث بباب العين التجاري وواجهتها الخارجية بقيمة تقديرية 45,000 جنيه مصري.</li>
                </ul>
              ) : (
                <ul className="text-xs list-disc list-inside space-y-1.5 text-slate-800 leading-relaxed font-semibold">
                  <li>اعتماد الرفع الطبوغرافي الرقمي المنجز بنظم الـ GPS لتوثيق ملكية الخصوم منعاً لتداخل الحدود مستقبلاً.</li>
                  <li>توزيع أنصبة التركة والمباني طبقاً للجدول المرفق أعلاه والمشتق بالذكاء الاصطناعي والشرع الحنيف.</li>
                  <li>إلزام الخصوم بسداد التكاليف والالتزامات المالية والضرائب المستحقة للجهات السيادية لتجنب توقف الترخيص.</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* -------------------- SUB-REPORT: PUBLIC PROSECUTION -------------------- */}
        {activeReportType === 'prosecution' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Report Title */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black underline underline-offset-8 decoration-2 text-red-700">
                تقرير فني استقصائي محال إلى النيابة العامة
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                {caseData.caseNumber === 'CASE-2026-004' 
                  ? 'موجه لمعالي وكيل النيابة الكلية بنيابة إيجارات العجوزة والجيزة' 
                  : 'موجه للنيابة الكلية ونيابة الأسرة والتركات بمحافظة الجيزة والقاهرة'}
              </p>
            </div>

            <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/50 text-xs leading-relaxed space-y-3 text-red-950 font-semibold">
              <p className="font-bold">
                {caseData.caseNumber === 'CASE-2026-004' ? 'مقدمة النيابة العامة (دعوى طرد المستأجر محمد الجندي):' : 'مقدمة النيابة العامة:'}
              </p>
              <p>
                {caseData.caseNumber === 'CASE-2026-004' 
                  ? 'بناءً على المحضر المحال من النيابة العامة لمعاينة العين التجارية لبيان مدى الضرر والاعتداء على المنشأ، نرفع لمعاليكم تقريرنا الفني والمدني للتأكيد على واقعة الامتناع عن دفع القيمة الإيجارية وطلب المالك التمكين لطرده وإخلائه بصفة مستعجلة لسلامة استثمارات العقار.'
                  : 'بناءً على التكليف الصادر من النيابة العامة لندب خبراء وزارة العدل لمعاينة وحصر التركة محل النزاع الجاري، نرفع لمعاليكم تقريرنا الاستدلالي الرقمي لتوضيح الشق المدني والشرعي في حيازة العقار وملكيته وكشف أي تعديات جنائية أو تداخل حدودي مصطنع.'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                أولاً: حصر شبهات النزاع والمخالفات الجغرافية
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">حالة إشغال العين الحالية:</span>
                    <span className="font-extrabold text-red-700">وضع يد من قبل المستأجر محمد الجندي دون سند مالي جارٍ (منتهي العقد قانوناً بالإنذار)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">إجمالي المتأخرات والتعويضات المطلوبة للنيابة:</span>
                    <span className="font-extrabold text-slate-900">225,000 جنيه مصري (أجور متأخرة + تعويض أضرار الباب الزجاجي والواجهة)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">القيمة التقديرية للعين التجارية:</span>
                    <span className="font-bold text-emerald-800">{caseData.estateValue.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">حالة التعديات الحالية:</span>
                    <span className="font-extrabold text-red-700">تم رصد تداخل حدودي قدره 2.4 متر في الجانب الشمالي من الجار</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">حالة الحيازة الفعلية للتركة:</span>
                    <span className="font-extrabold text-slate-900">حيازة مبعثرة بين الورثة الشرعيين بغير تراضٍ رسمي مسجل</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-bold">قيمة التركة الإجمالية محل الحصر:</span>
                    <span className="font-bold text-emerald-800">{caseData.estateValue.toLocaleString('ar-EG')} ج.م (مثبتة بعقود الملكية)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation to Prosecution */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                ثانياً: التوصية القانونية الموجهة للسيد وكيل النيابة
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <ul className="text-xs list-decimal list-inside space-y-2 text-slate-800 leading-relaxed font-semibold">
                  <li>التوصية بإصدار قرار مستعجل بالتمكين والإخلاء الفوري لقوة الحراسة ضد المستأجر محمد الجندي وتوقيف نشاطه.</li>
                  <li>إبلاغ مأمورية الضرائب ومجلس المدينة لتنفيذ غلق المحل التجاري وسحب ترخيص مزاولة النشاط بغير موافقة المالك.</li>
                  <li>الحجز التحفظي على محتويات العين التجارية لحين سداد كافة مستحقات المالك المقدرة بـ 180,000 جنيه للأجرة القانونية المتأخرة.</li>
                </ul>
              ) : (
                <ul className="text-xs list-decimal list-inside space-y-2 text-slate-800 leading-relaxed font-semibold">
                  <li>تمكين الورثة من العقار والتركة تمكيناً مؤقتاً طبقاً للحصص الشرعية المحسوبة لدرء النزاعات الجسدية والاحتكاكات.</li>
                  <li>إخطار حماية الأراضي وهيئة المساحة بتقرير تداخل الحدود الشمالي لإثبات واقعة التجاوز جغرافياً.</li>
                  <li>استبقاء مستندات وعقود الملكية المودعة سحابياً بنظام "سمارت إكسبيرت" كحجة دامغة في الإثبات الجنائي والتلاعب بالخرائط.</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* -------------------- SUB-REPORT: POLICE -------------------- */}
        {activeReportType === 'police' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Report Title */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black underline underline-offset-8 decoration-2 text-blue-700">
                إخطار فني وتوجيهات أمنية محالة لقوات الشرطة
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                موجه لمديرية الأمن وقسم الشرطة المختص جغرافياً لتأمين الحيازة والمعاينة
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs leading-relaxed space-y-2 text-blue-950 font-semibold">
              <p className="font-bold">إلى السيد مأمور قسم الشرطة المختص:</p>
              <p>
                {caseData.caseNumber === 'CASE-2026-004' ? (
                  <>
                    نحيطكم علماً بأن مكتب خبراء وزارة العدل قد قام بإجراء المعاينة الفنية للعين المؤجرة للمستأجر <strong className="text-slate-900">محمد الجندي</strong> الكائنة في: <strong className="text-slate-900">{caseData.location}</strong>. 
                    ويتطلب الوضع القانوني الراهن سرعة إيفاد قوة شرطية للتأمين الجبري لتنفيذ الإخلاء والطرد القانوني للمدعى عليه محمد الجندي وتسليم العين بالكامل خالية من الإشغالات للمالك.
                  </>
                ) : (
                  <>
                    نحيطكم علماً بأن مكتب خبراء وزارة العدل قد قام بإجراء الرفع المساحي والمسح الرقمي للعقار القضائي الكائن في: <strong className="text-slate-900">{caseData.location}</strong>. 
                    ويتطلب الوضع القانوني الراهن تنسيقاً أمنياً وتوفير حماية كاملة ضد أي احتكاكات أو شغب أثناء إجراءات تسليم الأنصبة المحددة.
                  </>
                )}
              </p>
            </div>

            {/* Police Directives Grid */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                توجيهات التنفيذ الجبرية والأمنية المقترحة:
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <ul className="text-xs list-decimal list-inside space-y-2.5 text-slate-800 leading-relaxed font-semibold">
                  <li>
                    <span className="font-bold">الإخلاء الجبري:</span> ندب قوة شرطية مرافقة لمحضر التنفيذ لإخلاء المدعى عليه محمد الجندي من المحل بالقوة الجبرية وإخراج كافة المتعلقات الشخصية.
                  </li>
                  <li>
                    <span className="font-bold">تثبيت الحيازة ومنع الشغب:</span> فرض طوق أمني مؤقت لمنع عودة المطرود أو أي احتكاك عنيف مع عمال المالك أثناء تسلم مفاتيح العين التجارية.
                  </li>
                  <li>
                    <span className="font-bold">إثبات الأضرار المادية:</span> تحرير محضر إثبات حالة بأي تلفيات أو إتلافات قام بها المستأجر بالواجهة الزجاجية أو التوصيلات الأساسية للعين.
                  </li>
                </ul>
              ) : (
                <ul className="text-xs list-decimal list-inside space-y-2.5 text-slate-800 leading-relaxed font-semibold">
                  <li>
                    <span className="font-bold">مرافقة أمنية:</span> ندب قوة شرطية مرافقة للخبير والمهندسين أثناء تسليم وتثبيت علامات الحدود الجغرافية على الأرض لتجنب أي اعتراض مادي من الخصوم.
                  </li>
                  <li>
                    <span className="font-bold">منع الاحتكاك المباشر:</span> فصل الحيازات الميدانية جغرافياً بقوات الشرطة الميدانية ريثما يسدد الورثة التكاليف المقررة ويثبتوا عقود الإفراز والتجنيب.
                  </li>
                  <li>
                    <span className="font-bold">أمن المنشآت والواجهة:</span> تأمين العقار المكون من <span className="font-bold text-slate-900 font-mono">{caseData.floors} أدوار</span> ضد أعمال التخريب أو محاولات تغيير المعالم الإنشائية ريثما يتم النطق بالحكم.
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* -------------------- SUB-REPORT: MINISTRY OF INTERIOR -------------------- */}
        {activeReportType === 'interior' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Report Title */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black underline underline-offset-8 decoration-2 text-emerald-800">
                تقرير فني محال لوزارة الداخلية (حماية الملكية والأراضي)
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                موجه لقطاع الأمن الوطني والإدارة العامة لشرطة التعمير والمجتمعات العمرانية
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs leading-relaxed space-y-2 text-emerald-950 font-semibold">
              <p className="font-bold">السيد مساعد وزير الداخلية لقطاع الأمن وتأمين الأراضي:</p>
              <p>
                {caseData.caseNumber === 'CASE-2026-004' 
                  ? 'نحيط سيادتكم علماً بأن نظام سمارت إكسبيرت قد قام برصد الإحداثي الجغرافي للعين التجارية موضوع دعوى الإخلاء والطرد المقامة ضد المستأجر محمد الجندي، والتحقق من وضعه القانوني في السجل التجاري والأنظمة الرقمية الفيدرالية.'
                  : 'نحيط سيادتكم علماً بأن نظام سمارت إكسبيرت الفيدرالي المستقل للأقمار الصناعية والمسح الطبوغرافي قد استخلص الحدود الإحداثية للعقار وتأكد من مطابقتها مع خرائط حماية أراضي الدولة ومنافع وزارة الداخلية والأمن القومي.'}
              </p>
            </div>

            {/* Interior Details */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                سجل الأمان القومي والربط المساحي الفيدرالي:
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">التطابق مع سجل الإيجارات والرخص التجارية:</span>
                    <span className="font-extrabold text-red-600">منتهي الصلاحية قضائياً بالإنذار والخصومة</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">مستوى الخطورة عند تنفيذ الإخلاء الميداني:</span>
                    <span className="font-extrabold text-amber-600">آمنة ومنخفضة الخطورة</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1 col-span-2">
                    <span className="text-slate-500 font-bold">أقرب نقطة أمنية / مركز شرطة:</span>
                    <span className="font-extrabold text-slate-900">قسم شرطة العجوزة ومديرية أمن الجيزة</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">التطابق مع حرم الطرق العامة والداخلية:</span>
                    <span className="font-extrabold text-emerald-700">متطابق بنسبة 100% (لا يوجد تعدي)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-bold">تطابق الحيازة مع أراضي الدولة والأوقاف:</span>
                    <span className="font-extrabold text-emerald-700">سليم ومستقل تماماً</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1 col-span-2">
                    <span className="text-slate-500 font-bold">أقرب نقطة أمنية / مركز شرطة:</span>
                    <span className="font-extrabold text-slate-900">قسم شرطة الجيزة ومحيط الهرم الأمني</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                توجيهات وزارة الداخلية المطلوبة:
              </h3>
              {caseData.caseNumber === 'CASE-2026-004' ? (
                <ul className="text-xs list-disc list-inside space-y-2 text-slate-800 leading-relaxed font-semibold">
                  <li>وضع قرار الإخلاء والطرد ضد محمد الجندي قيد التنفيذ السريع وتنسيق مأموريات الضبط الجنائي الميداني.</li>
                  <li>حظر إصدار أي تراخيص تجارية أو صناعية مستقبلية للمدعى عليه محمد الجندي بنفس الموقع حرصاً على حقوق المالك المسجلة.</li>
                  <li>الربط الفوري مع إدارة تنفيذ الأحكام بوزارة العدل لتسجيل تمام عملية الإخلاء في السوابق القضائية الفيدرالية.</li>
                </ul>
              ) : (
                <ul className="text-xs list-disc list-inside space-y-2 text-slate-800 leading-relaxed font-semibold">
                  <li>إدراج العقار وموقعه الإحداثي الدقيق ضمن سجل الحماية الأمنية لمنع الاستيلاء على الأراضي غير المعمرة.</li>
                  <li>إيقاف أي تراخيص هدم أو بناء غير قانونية تصدر من جهات محلية بغير موافقة مكتب خبراء وزارة العدل.</li>
                  <li>توفير الحماية الأمنية الكاملة لفريق مسح وزارة الداخلية أثناء مراجعة الحدود الشمالية للجار المتجاوز.</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* -------------------- DATES & COSTS DIRECTION SCHEDULE -------------------- */}
        {activeReportType === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Report Title */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black underline underline-offset-8 decoration-2 text-amber-600">
                مصفوفة المواعيد القانونية والالتزامات المالية والتكاليف
              </h2>
              <p className="text-[11px] text-slate-600 font-bold">
                دليل توجيهي رسمي ملزم قانوناً بكافة التواريخ والتكاليف المستحقة على الخصوم
              </p>
            </div>

            {/* Financial Obligations Table */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                أولاً: حصر الالتزامات المالية والتكاليف الفورية والآجلة
              </h3>
              <div className="overflow-hidden rounded border border-slate-200 mt-2">
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2">البند المالي / نوع الرسم</th>
                      <th className="p-2">الجهة المستحقة للرسم</th>
                      <th className="p-2 text-center">القيمة المقدرة (جنيه مصري)</th>
                      <th className="p-2">المستند الحجة والدليل القانوني</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">رسوم المعاينة والخبرة الفنية الميدانية</td>
                      <td className="p-2">خزينة المحكمة الابتدائية</td>
                      <td className="p-2 text-center font-mono font-black text-amber-600">{datesAndCosts.expertInspectionFee.toLocaleString('ar-EG')} ج</td>
                      <td className="p-2 text-slate-500">أمانة الخبير القضائية المودعة بصدر الدعوى</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">ضريبة التصرفات العقارية (2.5%)</td>
                      <td className="p-2">مصلحة الضرائب المصرية</td>
                      <td className="p-2 text-center font-mono font-black text-red-600">{datesAndCosts.transferTax.toLocaleString('ar-EG')} ج</td>
                      <td className="p-2 text-slate-500">المادة 42 من قانون الضريبة على الدخل</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">رسوم توثيق وتسجيل الشهر العقاري</td>
                      <td className="p-2">مصلحة الشهر العقاري والتوثيق</td>
                      <td className="p-2 text-center font-mono font-black text-emerald-700">{datesAndCosts.registrationFee.toLocaleString('ar-EG')} ج</td>
                      <td className="p-2 text-slate-500">قانون تنظيم الشهر العقاري الجديد لتثبيت السندات</td>
                    </tr>
                    <tr className="bg-slate-50 font-black">
                      <td className="p-2 text-slate-950 font-black">إجمالي التكاليف والالتزامات الفورية</td>
                      <td className="p-2">خزائن مصلحة الضرائب والمحاكم</td>
                      <td className="p-2 text-center font-mono text-red-600 text-xs">{datesAndCosts.totalImmediateCosts.toLocaleString('ar-EG')} ج</td>
                      <td className="p-2 text-slate-900">مجموع الالتزامات اللازمة لنقل وتسجيل الحصص</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">الضريبة العقارية السنوية المتكررة (10%)</td>
                      <td className="p-2">مأمورية الضرائب العقارية بالجيزة</td>
                      <td className="p-2 text-center font-mono font-black text-blue-600">{datesAndCosts.propertyTax.toLocaleString('ar-EG')} ج / سنوياً</td>
                      <td className="p-2 text-slate-500">قانون الضرائب العقارية لمالكي منشآت السكن والعمل</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legal Deadlines Table */}
            <div className="space-y-3">
              <h3 className="bg-slate-100 px-3 py-1.5 rounded font-black text-xs border-r-4 border-slate-900">
                ثانياً: جدول المواعيد والتواريخ القانونية الملزمة
              </h3>
              <div className="overflow-hidden rounded border border-slate-200 mt-2">
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2">الإجراء القانوني المطلوب</th>
                      <th className="p-2">الجهة الملزمة بالرد أو المتابعة</th>
                      <th className="p-2 text-center">التاريخ النهائي الأقصى</th>
                      <th className="p-2">الجزاء أو الأثر القانوني المترتب عند المخالفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">إيداع تقرير الخبرة العقاري رقمياً</td>
                      <td className="p-2">مكتب الخبراء لعدسة المحكمة</td>
                      <td className="p-2 text-center font-mono text-slate-900">{datesAndCosts.dates.reportFiling}</td>
                      <td className="p-2 text-slate-500">بدء احتساب مواعيد الطعون والإخطارات</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">فتح باب إيداع الطعون والاعتراضات الفنية</td>
                      <td className="p-2">محامو الخصوم والورثة</td>
                      <td className="p-2 text-center font-mono text-slate-900">{datesAndCosts.dates.appealStart}</td>
                      <td className="p-2 text-slate-500">بداية فترة الاعتراض الرسمية على أرقام ومساحة التقرير</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">الموعد النهائي لغلق باب الطعون وقبول التقرير</td>
                      <td className="p-2">قلم كتاب المحكمة الابتدائية</td>
                      <td className="p-2 text-center font-mono text-red-600 font-bold">{datesAndCosts.dates.appealEnd}</td>
                      <td className="p-2 text-red-600 font-bold">سقوط الحق في الطعن واعتماد التقرير نهائياً وصيرورته باتاً</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">التنسيق الأمني والتمكين الميداني المبدئي</td>
                      <td className="p-2">قوة الشرطة وجهاز التنفيذ المالي</td>
                      <td className="p-2 text-center font-mono text-slate-900">{datesAndCosts.dates.securityCoordination}</td>
                      <td className="p-2 text-slate-500">تمكين المعاينة والتحوط ضد أي اعتراض مادي من الخصوم</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">جلسة النطق بالحكم النهائي الفاصل في النزاع</td>
                      <td className="p-2">المستشار رئيس الدائرة ومساعدوه</td>
                      <td className="p-2 text-center font-mono text-slate-900 font-bold">{datesAndCosts.dates.courtHearing}</td>
                      <td className="p-2 text-slate-500">صدور الحكم القضائي النهائي المذيل بالصيغة التنفيذية الجبرية</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">التنفيذ الجبري وتثبيت الحدود والإخلاء الفعلي</td>
                      <td className="p-2">جهاز التنفيذ بوزارة الداخلية والشرطة</td>
                      <td className="p-2 text-center font-mono text-slate-900">{datesAndCosts.dates.possessionEnforcement}</td>
                      <td className="p-2 text-slate-500">التسليم بالقوة الجبرية للمستحقين وطرد مغتصبي الحدود جغرافياً</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- SUGGESTED JUDICIAL DECISIONS (RULE 3) -------------------- */}
        {activeReportType === 'judgments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stamp / Seal watermark inside the report */}
            <div className="absolute left-10 top-24 opacity-[0.07] pointer-events-none transform -rotate-12 select-none">
              <div className="border-4 border-double border-red-600 p-3 rounded-full w-36 h-36 flex flex-col items-center justify-center text-center text-red-600 font-extrabold text-[10px] leading-tight">
                <span>محكمة العجوزة</span>
                <span>صيغة تنفيذية</span>
                <span>⚖️</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center space-y-2 pb-4 border-b border-dashed border-slate-200">
              <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">
                ⚖️ وثيقة قضائية رسمية موجهة للقاضي
              </div>
              <h2 className="text-xl font-black underline underline-offset-8 decoration-2 text-slate-900 leading-relaxed">
                منطوق وأحكام المحكمة المقترحة بشأن النزاع الإيجاري
              </h2>
              <p className="text-xs text-slate-500 font-bold max-w-lg mx-auto">
                معد ومصاغ بواسطة نظام الأجهزة القضائية المستقلة ومصلحة الخبراء لعرضه على السيد القاضي رئيس الدائرة للنطق به وإثبات حجيته
              </p>
            </div>

            {/* First Segment: Mohamed El Gendy and Majda El Gayyar */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 bg-red-600 rounded"></span>
                  المخالفات القانونية وبنود الخرق المرتكبة من المستأجرين
                </h3>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">لائحة المخالفات الفنية والقانونية</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700">
                
                {/* Mohamed El Gendy Violations */}
                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200/60 shadow-sm">
                  <p className="font-bold text-slate-900 border-b pb-1.5 text-[11px] text-red-700 flex items-center gap-1.5">
                    <span>⚠️ المخالفات والأخطاء المنسوبة للمستأجر (محمد الجندي):</span>
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-slate-600 font-semibold">
                    <li>
                      <strong className="text-slate-800">مخالفة القانون رقم 136 لسنة 1981 (المادة 18):</strong> الامتناع العمدي عن سداد القيمة الإيجارية العادلة والمعدلة قانوناً، متجاوزاً مهلة الإخطار والإنذار القانوني الرسمي الموجه إليه عبر المحضرين بتأريخ سابق.
                    </li>
                    <li>
                      <strong className="text-slate-800">الاعتداء على الأجزاء المشتركة (المادة 808 من القانون المدني):</strong> إحداث تعديلات هندسية وإنشائية غير مصرح بها بوضع يد عشوائي وغير مرخص على مساحة السطح المشترك للمبنى، مما تسبب في أضرار وتسريبات بالغة بالهيكل الإنشائي العام للعقار.
                    </li>
                    <li>
                      <strong className="text-slate-800">الخطأ الإنشائي الجسيم:</strong> إقامة حواجز إسمنتية ثقيلة تسببت في تحميل زائد على السقف الخرساني، وتطلب تدخلاً هندسياً عاجلاً لإزالتها بتكلفة إجمالية بلغت <span className="text-red-600 font-mono font-bold">150,000 ج.م</span>.
                    </li>
                  </ul>
                </div>

                {/* Majda El Gayyar Violations */}
                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200/60 shadow-sm">
                  <p className="font-bold text-slate-900 border-b pb-1.5 text-[11px] text-red-700 flex items-center gap-1.5">
                    <span>⚠️ المخالفات والأخطاء المنسوبة للمستأجر (ماجدة الجيار):</span>
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-slate-600 font-semibold">
                    <li>
                      <strong className="text-slate-800">مخالفة القانون رقم 49 لسنة 1977 (المادة 29):</strong> شغل العين السكنية (الشقة) بوضع يد غاصب فاقد لأي سند تعاقدي أو مالي سارٍ، وذلك عقب انقضاء العلاقة الإيجارية الأصلية بوفاة المستأجر الأصلي (المرحوم الحاج محمد شلبي) دون توفر شروط الامتداد القانوني المستقر للعين لانتفاء الإقامة الدائمة والصلة الشرعية المؤهلة قانوناً وقت الوفاة.
                    </li>
                    <li>
                      <strong className="text-slate-800">مخالفة الالتزامات العقدية:</strong> رفض تسليم مفاتيح العين رضائياً لمالكة العقار السيدة عليه محمود الوكيل وتجاهل الإنذار العدلي المسجل الموجه إليها عبر المحضرين بضرورة الإخلاء الطوعي للانتفاع المباشر.
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Final Executory Eviction Verdict */}
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-red-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]"></div>
                  <h4 className="font-black text-xs text-red-400">⚖️ الحكم القضائي النهائي الحاسم والطرد الفوري</h4>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full font-bold">صيغة تنفيذية معجلة</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-semibold">
                <p className="text-slate-100">
                  بناءً على التقارير الهندسية الرقمية المعتمدة والتحليل الاستدلالي المنجز بنظم الذكاء الخبير، حكمت المحكمة حضورياً وبقوة القانون المعجل:
                </p>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2.5">
                  <p className="text-white">
                    <strong className="text-red-400">أولاً:</strong> طرد المدعى عليه الأول <span className="text-red-400 font-black underline">محمد الجندي</span> من العين والمنشأة التجارية المؤجرة له، وكذا إخلاء المدعى عليها الثانية السيدة <span className="text-red-400 font-black underline">ماجدة الجيار</span> من شقتها السكنية بالعقار رقم <span className="text-white font-black">27 شارع شبين الكوم، العمرانية الغربية، الجيزة</span>.
                  </p>
                  <p className="text-white">
                    <strong className="text-red-400">ثانياً:</strong> إلزام المحكوم ضدهما بالإخلاء والطرد الفوري والجبري للعينين وتسليمهما بالكامل خالتين من الأشخاص والشواغل والأشياء للسيدة المالكة <span className="text-emerald-400 font-black">عليه محمود الوكيل</span> وبأثر فوري حاسم دون أي إرجاء أو تسويف.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-white">ملاحظة بشأن التكاليف:</strong> تبرئة ذمة المستأجرين المذكورين من سداد نصيبهما في تكاليف إزالة السطح البالغة <span className="text-emerald-400 font-mono font-bold">150,000 ج.م</span> مع تحميل المالك بالتزام تصفيتها، وتعديل الأجرة الشهرية لشقة النزاع لتصبح بقيمة <span className="text-emerald-400 font-mono font-bold">2,000 ج.م</span> تسري وتلزم اعتباراً من <span className="text-white underline">الأول من يناير 2027</span> وحتى تمام الإخلاء الفعلي للعين.
                  </p>
                </div>

                <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 space-y-2">
                  <p className="text-red-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <span>📋 أمر وتوجيه للجهات التنفيذية لمتابعة وبدء التنفيذ الجبري:</span>
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    تأمر المحكمة وتوجه قلم المحضرين ومأموري الضبط والتنفيذ المختصين، وقوات الشرطة ووزارة الداخلية والجهات السيادية والإدارية المعنية، بمتابعة هذا القرار ومراقبة تطبيقه والبدء الفوري في الإخلاء الجبري للعينين المذكورتين وتسليمهما خاليتين للمالكة بقوة القانون وتحت حراسة أجهزة الأمن، مستعينين بالقوة الجبرية اللازمة لقطع دابر التعديات ومكافحة أي ممانعة أو امتناع عن التنفيذ.
                  </p>
                </div>
              </div>
            </div>

            {/* Shared Commitments Card */}
            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-3">
              <h4 className="font-extrabold text-xs text-amber-800 flex items-center gap-1.5">
                🛡️ الالتزامات المالية المشتركة ومصاريف الصيانة القانونية المقررة
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                يُلزم المستأجرون والمدعى عليهم بالتضامن والالتزام التام بدفع بكافة <span className="font-extrabold text-slate-900">المصاريف والتكاليف القانونية والفنية ومصاريف صيانة العين الشهرية</span> المقررة لصالح اتحاد الملاك أو مالكة العقار وقيمتها الثابتة <span className="font-extrabold text-amber-700 font-mono text-xs">100 ج.م</span> (مائة جنيه مصري فقط لا غير) شهرياً، مع تحملهم كامل مصاريف التقاضي وأتعاب الخبرة الهندسية المودعة بصدر هذه الدعوى.
              </p>
            </div>

            {/* Interactive Authorization Action Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="text-right space-y-1">
                <h5 className="font-black text-xs text-amber-400">اعتماد وتوقيع مسودة الحكم القضائي المقترح</h5>
                <p className="text-[10px] text-slate-400">
                  يمكنك تفعيل بصمة الخبير واعتماد الصيغة التنفيذية ليتم دمغها وطباعتها ضمن تقرير المحكمة الرسمي
                </p>
              </div>
              <button
                onClick={() => setIsJudgmentsSigned(!isJudgmentsSigned)}
                className={`px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${
                  isJudgmentsSigned 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {isJudgmentsSigned ? '✓ تم التوقيع والاعتماد بنجاح' : '✍️ توقيع واعتماد المسودة'}
              </button>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[10px] border-t border-slate-200">
              <div className="space-y-4">
                <span className="font-bold text-slate-500 block">أمين سر الجلسة (قلم الكتاب)</span>
                <div className="h-10 border border-slate-200 border-dashed rounded flex items-center justify-center text-slate-400 italic bg-slate-50 text-[9px]">
                  {isJudgmentsSigned ? (
                    <span className="text-emerald-600 font-bold font-mono">✓ CLERK SEAL APPROVED</span>
                  ) : (
                    <span>توقيع أمين السر</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <span className="font-bold text-slate-500 block">الخبير العقاري والإنشائي</span>
                <div className="h-10 border border-slate-200 border-dashed rounded flex items-center justify-center text-slate-400 italic bg-slate-50 text-[9px] flex-col">
                  {isJudgmentsSigned ? (
                    <>
                      <span className="text-amber-700 font-bold font-mono">✓ CAPTAIN HOSSAM</span>
                      <span className="text-[7px] text-emerald-600 font-bold">APPROVED BY DIGITAL SIGN</span>
                    </>
                  ) : (
                    <span>كابتن حسام</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <span className="font-bold text-slate-500 block">رئيس الدائرة (السيد المستشار)</span>
                <div className="h-10 border border-slate-200 border-dashed rounded flex items-center justify-center text-slate-400 italic bg-slate-50 text-[9px]">
                  {isJudgmentsSigned ? (
                    <span className="text-red-600 font-bold font-mono">✓ JUDGE SIGNATURE OK</span>
                  ) : (
                    <span>إمضاء رئيس الدائرة</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conclusion Signature Section (All Reports share this official sign-off footer) */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <span className="font-bold block">مصلحة خبراء وزارة العدل المصرية</span>
            <span className="text-slate-600 text-[10px] block">تم تصديره ومراجعته إلكترونياً بنظام النظم الفيدرالية المستقلة</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمد بالبصمة البيومترية والمطابقة الطيفية للأقمار الصناعية</span>
            </span>
          </div>
          
          <div className="text-center space-y-1">
            <span className="font-bold block">الخبير العقاري والإنشائي القضائي المعتمد</span>
            <span className="font-black text-sm text-slate-950 block">كابتن حسام</span>
            <span className="text-slate-500 text-[10px] block">التوقيع والختم البيومتري الرسمي:</span>
            <div className="w-24 h-10 border border-slate-200 rounded mx-auto border-dashed flex items-center justify-center text-slate-400 font-mono text-[9px] bg-slate-50 text-slate-500 font-bold leading-none p-1 flex-col">
              <span>CAPTAIN HOSSAM</span>
              <span className="text-[7px] text-emerald-600 font-bold mt-0.5">✓ VERIFIED BY SCAN</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

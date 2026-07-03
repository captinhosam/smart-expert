import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  User, 
  ShieldAlert, 
  Cpu, 
  Gavel, 
  FileCheck, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Search 
} from 'lucide-react';

export default function DocumentsGuidePanel() {
  const [activeTab, setActiveTab] = useState<'proceedings' | 'seller_docs' | 'buyer_docs'>('proceedings');
  
  // Interactive checklist states
  const [sellerChecks, setSellerChecks] = useState({
    national_id: true,
    electronic_contract: false,
    correspondence: false,
    ownership_proofs: true,
    bank_receipts: false,
    other_digital: false,
    lawyer_power: true,
  });

  const [buyerChecks, setBuyerChecks] = useState({
    national_id: true,
    claim_sheet: true,
    digital_contract: false,
    correspondence: false,
    bank_transfers: false,
    wallet_cert: false,
    expert_reports: false,
    lawyer_power: true,
  });

  const toggleSellerCheck = (key: keyof typeof sellerChecks) => {
    setSellerChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBuyerCheck = (key: keyof typeof buyerChecks) => {
    setBuyerChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Expanded sections state for steps
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const stepsData = [
    {
      id: 1,
      title: "أ- رفع الدعوى إلكترونياً (بوابة مصر الرقمية)",
      desc: "خطوات تحرير ورفع الدعوى العقارية أو المدنية عبر المنظومة الرقمية الموحدة.",
      items: [
        { name: "1. اختيار اسم المحكمة ونوع الجدول", detail: "تحديد الاختصاص القضائي بدقة (ابتدائي، جزئي، اقتصادي) ونوع الجدول الملائم لنص العقد." },
        { name: "2. تسجيل اسم الدعوى وبيانات الأطراف وموضوعها", detail: "إدخال بيانات المدعي والمدعى عليه ومحل الإقامة المختار، وصياغة طلبات المدعي بدقة." },
        { name: "3. إرفاق التوكيلات والمستندات (ومنها الأدلة الرقمية)", detail: "مسح ورفع التوكيلات، والمراسلات، وعقود البيع والخرائط المساحية الكترونياً بصيغة PDF." },
        { name: "4. تكوين صحيفة الدعوى الإلكترونية وتأمينها", detail: "تتولى المنظومة تكوين الصحيفة تلقائياً مع إضافة رمز الاستجابة السريعة (QR Code) لتأمينها ضد التزوير." },
        { name: "5. طباعة الصحيفة وتوقيعها وإعادة المسح", detail: "يقوم المحامي بطباعة النسخة المؤمنة المخرجة، وتوقيعها بخط اليد، ثم مسحها ضوئياً مجدداً." },
        { name: "6. إرسال صور الصحيفة والتوكيلات الموقعة", detail: "إرسال الملف النهائي الموقع رقمياً أو الممسوح عبر المنظومة لتأكيد الإيداع الفعلي." },
        { name: "7. مراجعة الموظف المختص وإرسال إشعار الرسوم", detail: "يراجع موظف القيد المستندات، وفي حال استيفائها يُرسل إشعار دفع الرسوم وتاريخ أول جلسة للمحامي." }
      ]
    },
    {
      id: 2,
      title: "ب- إجراءات التحقيق (دور النيابة العامة أو المحكمة)",
      desc: "سير إجراءات الإثبات والتحقيق القضائي في الأدلة المادية والرقمية للنزاع.",
      items: [
        { name: "النيابة العامة (في المسار الجنائي/التزوير):", detail: "تستمع لأقوال أطراف النزاع، وتأمر بضبط الأدلة الرقمية (هواتف، حواسيب، خوادم) وتحريزها فنياً لمنع التلاعب، وتنتدب خبيراً تكنولوجياً من وزارة العدل." },
        { name: "المحكمة المختصة (في المسار المدني العقدي):", detail: "قد تأمر باتخاذ إجراءات تحفظية عاجلة (مثل وضع العقار تحت الحراسة)، أو تندب مكتب خبراء وزارة العدل المختص لتقديم تقرير فني شامل عن الأدلة والوضع المساحي الميداني." }
      ]
    },
    {
      id: 3,
      title: "ج- دور الخبير الرقمي والمساحي",
      desc: "مهام الخبير المعين في فحص المعالم المادية واستخلاص وتحليل البيانات الرقمية.",
      items: [
        { name: "فحص الأدلة والمنشآت وتأكيد سلامتها", detail: "يقوم الخبير بفحص الأجهزة والبرمجيات والمراسلات والخوادم، واستخراج البيانات بطريقة علمية، مع التأكد من سلامة كود التشفير والهاش (Hash) لضمان عدم التلاعب." },
        { name: "إعداد وتقديم التقرير الفني النهائي", detail: "يصوغ الخبير تقريراً مستفيضاً معللاً بالأسانيد العلمية والمقاييس المساحية الميدانية ويسلمه لقاضي الموضوع أو لجهة التحقيق." }
      ]
    },
    {
      id: 4,
      title: "د- المحاكمة والمناقشة وإصدار الحكم",
      desc: "الجلسة الختامية وتكوين عقيدة المحكمة استناداً لتقرير الخبير.",
      items: [
        { name: "انعقاد الجلسات (حضورياً أو عن بُعد)", detail: "تُعقد جلسات المرافعة ويجوز إجراؤها إلكترونياً تماشياً مع خطة التحول الرقمي بوزارة العدل المصرية." },
        { name: "مناقشة الخبير الفني وأطراف الدعوى", detail: "يحق للقاضي استدعاء الخبير لمناقشته في نتائج تقريره، وسؤال الخصوم حول الدفوع والمستندات المقدمة." },
        { name: "صدور حكم المحكمة البات", detail: "يصدر رئيس الدائرة حكمه بناءً على قناعته الوجدانية والأدلة المادية والرقمية ونتائج تقرير الخبير المعتمد." }
      ]
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6 text-right">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/25 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-base font-black">الدليل الإجرائي والمستندات القضائية والميدانية</span>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">منظومة توثيق المستندات والتحقق من استيفاء شروط تقديم الدعاوى العقارية والمدنية</span>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('proceedings')}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
              activeTab === 'proceedings' 
                ? 'bg-amber-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚖️ خطوات ومراحل التقاضي
          </button>
          <button
            onClick={() => setActiveTab('seller_docs')}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
              activeTab === 'seller_docs' 
                ? 'bg-amber-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ أوراق البائع
          </button>
          <button
            onClick={() => setActiveTab('buyer_docs')}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
              activeTab === 'buyer_docs' 
                ? 'bg-amber-500 text-slate-950 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛒 أوراق المشتري
          </button>
        </div>
      </div>

      {/* Tab 1: Proceedings & Court Steps (مراحل التقاضي الفنية) */}
      {activeTab === 'proceedings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed font-semibold">
            📢 <span className="text-white font-extrabold">توجيهات المحكمة الفنية:</span> ندرج أدناه تسلسل خطوات قيد وتحقيق ونظر الدعاوى القضائية المدنية والجنائية المرتبطة بالنزاعات العقارية، شاملة دور الخبير الفني المعين لتمكين الخبير من تتبع مراحل القضية بدقة متناهية.
          </div>

          <div className="space-y-3">
            {stepsData.map((step) => {
              const isExpanded = expandedStep === step.id;
              return (
                <div 
                  key={step.id} 
                  className="bg-slate-950/20 border border-slate-850 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-800"
                >
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className="w-full p-4 flex items-center justify-between text-right bg-slate-950/40 transition-colors hover:bg-slate-950/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        step.id === 1 ? 'bg-amber-500/10 text-amber-400' :
                        step.id === 2 ? 'bg-blue-500/10 text-blue-400' :
                        step.id === 3 ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {step.id === 1 && <Cpu className="w-4 h-4" />}
                        {step.id === 2 && <ShieldAlert className="w-4 h-4" />}
                        {step.id === 3 && <Gavel className="w-4 h-4" />}
                        {step.id === 4 && <FileCheck className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-black">{step.title}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-0.5">{step.desc}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-850 bg-slate-950/10 space-y-3 animate-in slide-in-from-top-1 duration-200">
                      {step.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-right">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <div className="flex-1 space-y-0.5">
                            <h5 className="text-white text-xs font-black">{item.name}</h5>
                            <p className="text-slate-400 text-[10.5px] leading-relaxed font-semibold">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Seller Documents Checklist (أوراق البائع) */}
      {activeTab === 'seller_docs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-right flex-1 text-xs">
              <span className="text-white font-extrabold block">الأوراق والمستندات المطلوبة من البائع (المدعى عليه أو المشتكى به)</span>
              <p className="text-slate-400 font-semibold leading-relaxed">
                تُطلب هذه الأوراق من البائع لتقديم دفوعه ونفي الاتهام أو إثبات صحة ونفاذ العقد والالتزامات العقدية والمساحية المحددة.
              </p>
            </div>
          </div>

          <div className="border border-slate-850 rounded-xl overflow-hidden">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-extrabold">
                  <th className="p-3 w-12 text-center">الحالة</th>
                  <th className="p-3">المستند المطلوب تقديمها</th>
                  <th className="p-3">الغرض والمنفعة القضائية والمستهدف الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300 font-medium">
                
                {/* 1 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.national_id}
                      onChange={() => toggleSellerCheck('national_id')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.national_id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">صورة بطاقة الرقم القومي</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">إثبات الشخصية والصفة القانونية والتحقق الميداني من هوية البائع.</td>
                </tr>

                {/* 2 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.electronic_contract}
                      onChange={() => toggleSellerCheck('electronic_contract')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.electronic_contract ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">إقرار أو عقد البيع الإلكتروني</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">تأكيد شروط التعاقد والبيانات الفنية ومقدار الثمن وشروط التسليم.</td>
                </tr>

                {/* 3 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.correspondence}
                      onChange={() => toggleSellerCheck('correspondence')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.correspondence ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">كافة المراسلات الإلكترونية مع المشتري</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">إثبات الالتزام، أو التفاهمات الجانبية، أو نفي تهمة التملص والمماطلة.</td>
                </tr>

                {/* 4 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.ownership_proofs}
                      onChange={() => toggleSellerCheck('ownership_proofs')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.ownership_proofs ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">إثباتات الملكية (عقد مسجل، مستندات الأرض)</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لإثبات صفته الشرعية وأحقيته في البيع ونقل الملكية دون منازعات عينية.</td>
                </tr>

                {/* 5 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.bank_receipts}
                      onChange={() => toggleSellerCheck('bank_receipts')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.bank_receipts ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">المستندات البنكية لاستلام الثمن</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">توثيق المبالغ المحصلة كلياً أو جزئياً وتواريخ قبض الثمن المتفق عليه.</td>
                </tr>

                {/* 6 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.other_digital}
                      onChange={() => toggleSellerCheck('other_digital')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.other_digital ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">أي مستندات أو تقارير رقمية أخرى للدفاع</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">مثل شهادات مهندس معتمد، تقارير فنية، رخص المباني والتخطيط الميداني.</td>
                </tr>

                {/* 7 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={sellerChecks.lawyer_power}
                      onChange={() => toggleSellerCheck('lawyer_power')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sellerChecks.lawyer_power ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">توكيل المحامي الرسمي</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">وكالة قانونية رسمية موثقة بالشهر العقاري تبيح الحضور والمرافعة والإنكار.</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Buyer Documents Checklist (أوراق المشتري) */}
      {activeTab === 'buyer_docs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-right flex-1 text-xs">
              <span className="text-white font-extrabold block">الأوراق والمستندات المطلوبة من المشتري (المدعي أو المجني عليه)</span>
              <p className="text-slate-400 font-semibold leading-relaxed">
                تُطلب من المدعي لإثبات صحة وسلامة تعاقده والمبالغ المالية المحولة، وصحة وقائع التسليم والخرائط المساحية.
              </p>
            </div>
          </div>

          <div className="border border-slate-850 rounded-xl overflow-hidden">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-extrabold">
                  <th className="p-3 w-12 text-center">الحالة</th>
                  <th className="p-3">المستند المطلوب تقديمها</th>
                  <th className="p-3">الغرض والمنفعة القضائية والمستهدف الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300 font-medium">
                
                {/* 1 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.national_id}
                      onChange={() => toggleBuyerCheck('national_id')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.national_id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">صورة بطاقة الرقم القومي للمشتري</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">إثبات هوية المدعي والصفة القانونية والتوثيق الميداني للبيانات الشخصية.</td>
                </tr>

                {/* 2 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.claim_sheet}
                      onChange={() => toggleBuyerCheck('claim_sheet')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.claim_sheet ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">صحيفة الدعوى (أصل + صور)</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">تُحرر وتودع بمحضر قلم كتاب المحكمة أو عبر المنظومة لبدء الإجراءات القضائية الرسمية.</td>
                </tr>

                {/* 3 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.digital_contract}
                      onChange={() => toggleBuyerCheck('digital_contract')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.digital_contract ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">العقد الإلكتروني أو الإعلان الرقمي</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لإثبات قيام العلاقة التعاقدية ونوع النزاع العقدي وحجم العقار ووصفه ومكانه.</td>
                </tr>

                {/* 4 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.correspondence}
                      onChange={() => toggleBuyerCheck('correspondence')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.correspondence ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">المراسلات الإلكترونية (واتساب، بريد، إلخ)</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لتوثيق الوعود والاتفاقات المتبادلة والتواريخ المحددة للتسليم أو تعديل الأسعار.</td>
                </tr>

                {/* 5 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.bank_transfers}
                      onChange={() => toggleBuyerCheck('bank_transfers')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.bank_transfers ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">إثباتات التحويلات البنكية الإلكترونية</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لتقديم دليل قطعي وقانوني على أداء الثمن بالكامل والوفاء بالالتزامات المالية للمشتري.</td>
                </tr>

                {/* 6 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.wallet_cert}
                      onChange={() => toggleBuyerCheck('wallet_cert')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.wallet_cert ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">شهادة بنكية أو كشف المحفظة الإلكترونية</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">توثيق معتمد من البنك المركزي المصري للمبالغ المرسلة لدحض أي ادعاء بالإنكار.</td>
                </tr>

                {/* 7 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.expert_reports}
                      onChange={() => toggleBuyerCheck('expert_reports')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.expert_reports ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">أي تقارير فنية تدعم ادعاءات المشتري</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لتقوية موقف المدعي، مثل كشوفات الرفع المساحي والقياس الطيفي المسبق.</td>
                </tr>

                {/* 8 */}
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={buyerChecks.lawyer_power}
                      onChange={() => toggleBuyerCheck('lawyer_power')}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/40 bg-slate-950 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${buyerChecks.lawyer_power ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span className="font-bold text-white">توكيل المحامي الرسمي للمشتري</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] leading-relaxed font-semibold">لتفويض الوكيل القانوني بتمثيله رسمياً في المرافعة وتقديم الأوراق ومناقشة الخبراء.</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

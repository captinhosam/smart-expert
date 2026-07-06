import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, Scale, BookOpen } from 'lucide-react';
import { triggerToast } from '../../lib/toast';

interface AgentChatInterfaceProps {
  onSend: (query: string) => void;
  agentsList: Record<string, { id: string; icon: string; desc: string }>;
}

export default function AgentChatInterface({ onSend, agentsList }: AgentChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string; agentName?: string }[]>([
    { 
      role: 'agent', 
      content: 'مرحباً بك في المحكمة الافتراضية الذكية. سأقوم بدور مستشارك القانوني وسكرتير الجلسة المعاون. اكتب أي موضوع أو قانون وسنقوم باستدعاء الوكيل القضائي الخبير فوراً لتقديم الحكم والتوصية.' 
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    onSend(userMsg);

    // Simulate Agent response timing
    setTimeout(() => {
      // Find matching agent
      const matchedAgentKey = Object.keys(agentsList).find(key => 
        userMsg.includes(key) || userMsg.includes(key.split(' ')[0])
      );
      const agentLabel = matchedAgentKey ? agentsList[matchedAgentKey].desc : 'المستشار القضائي العام';

      setMessages(prev => [
        ...prev, 
        { 
          role: 'agent', 
          content: `⚖️ تم تحويل طلبكم إلى "${agentLabel}". جاري تفنيد النصوص واستخراج التوصية الشرعية والقانونية المناسبة للنزاع...`,
          agentName: agentLabel
        }
      ]);
    }, 600);

    if (!overrideText) {
      setInput('');
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    triggerToast('🎙️ جاري تفعيل الاستماع للمحاكاة الصوتية للمحكمة...', 'info');

    // Simulate voice translation after 2.5 seconds
    setTimeout(() => {
      setIsRecording(false);
      const randomQueries = [
        'قانون العقوبات بخصوص جريمة تبديد منقولات زوجية',
        'قانون الأحوال الشخصية بشأن دعوى بطلان حصر الإرث للورثة',
        'القانون التجاري ونطاق تعويض فسخ عقود الشركات',
        'القانون الإداري في نزاع سحب قرار ترخيص البناء',
        'قانون المرافعات في الدفع بعدم الاختصاص المكاني للمحكمة'
      ];
      const selectedQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      setInput(selectedQuery);
      triggerToast('✓ تم تحويل كلامك الصوتي إلى نص بنجاح!', 'success');
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950/40 border-t border-slate-900 overflow-hidden">
      
      {/* Quick Agent Select Horizontal Scrollbar */}
      <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-900 scrollbar-none shrink-0" style={{ direction: 'rtl' }}>
        {Object.entries(agentsList).map(([name, agent]) => (
          <button
            key={agent.id}
            onClick={() => {
              setInput(name);
              handleSubmit(name);
            }}
            className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-full text-[10px] font-black text-slate-300 hover:text-amber-400 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-sm">{agent.icon}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" style={{ direction: 'rtl' }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-amber-500 text-slate-950 rounded-br-none font-extrabold shadow-md shadow-amber-500/5' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'agent' && (
                <span className="flex items-center gap-1.5 text-[10px] text-amber-500 font-black mb-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{msg.agentName || 'الوكيل المعاون'}</span>
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/85" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-2">
          {/* Micro button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isRecording 
                ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="انقر للتحدث للمحكمة"
          >
            <Mic className="w-4 h-4" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={isRecording ? 'جاري الاستماع لرسالتك الصوتية...' : 'اكتب موضوعاً قانونياً أو تهمة...'}
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40 transition-all font-semibold"
          />
          
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim()}
            className="p-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 rounded-xl text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, User, Loader2, Mic, MicOff, Volume2, Languages, Settings2, PhoneOff, PhoneCall, Radio, BrainCircuit } from 'lucide-react';
import { getAIResponse } from '../services/geminiService';
import { Message, Transaction, Product, UserProfile } from '../types';

interface AIAssistantProps {
  transactions?: Transaction[];
  products?: Product[];
  user?: UserProfile | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions = [], products = [], user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Bonjour Patron. Je suis Musa 6.0. Je gère vos stocks, votre comptabilité et votre staff. Vous pouvez m'écrire ici ou m'appeler via le bouton flottant pour une discussion vocale naturelle." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState(user?.learningProfile.preferredLanguage || 'Français');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendText = async () => {
    if (!input.trim() || isLoading || !user) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const responseText = await getAIResponse(messages, userMsg, { transactions, products, user });
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Je n'ai pas pu traiter cette requête. Réessayez." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Désolé Patron, une erreur réseau bloque ma réflexion." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-slate-900 border border-slate-800 rounded-[56px] overflow-hidden shadow-3xl">
      <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20 backdrop-blur-xl">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-[24px] mali-gradient flex items-center justify-center shadow-2xl">
              <BrainCircuit className="w-9 h-9 text-white" />
           </div>
           <div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Musa Neural Core</h2>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Apprentissage Actif • {lang}
              </div>
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
            <div className={`flex gap-5 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-slate-800 border border-slate-700' : 'mali-gradient'}`}>
                {msg.role === 'user' ? <User className="w-7 h-7 text-slate-400" /> : <Bot className="w-7 h-7 text-white" />}
              </div>
              <div className={`p-8 rounded-[40px] text-[15px] font-medium leading-relaxed shadow-2xl ${msg.role === 'user' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 items-center p-8 bg-slate-950/40 rounded-[32px] w-fit">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Musa analyse vos données...</span>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-800 bg-slate-950/40">
        <div className="flex gap-5">
          <input 
            type="text" 
            placeholder={`Écrire à Musa (${lang})...`} 
            className="flex-1 bg-slate-950 border border-slate-800 rounded-[32px] px-10 py-7 text-white text-lg font-medium focus:border-yellow-500 outline-none transition-all shadow-inner" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()} 
          />
          <button 
            onClick={handleSendText} 
            disabled={isLoading || !input.trim()} 
            className="w-20 h-20 mali-gradient rounded-[32px] flex items-center justify-center shadow-3xl active:scale-90 transition-all text-white disabled:opacity-50"
          >
            <Send className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

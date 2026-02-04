
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Mic, X, Bot, PhoneOff, BrainCircuit, Keyboard, Send, 
  MessageSquare, History, ShieldCheck, Zap, Package, ShoppingCart, Volume2, CreditCard, Truck,
  Sparkles, HeartPulse, Share2, Video, TrendingUp
} from 'lucide-react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { UserProfile, Transaction, Product, BusinessType, Debt, Supplier } from '../types';

interface FloatingConsoleProps {
  user: UserProfile;
  products: Product[];
  debts: Debt[];
  suppliers: Supplier[];
  onAddTransaction: (t: any) => void;
  onAddDebt: (d: any) => void;
  onAddSupplier: (s: any) => void;
  onUpdateStock: (id: string, qty: number) => void;
  onOpenTab: (tab: any) => void;
  onUpdateBusiness?: (type: BusinessType) => void;
}

const FloatingConsole: React.FC<FloatingConsoleProps> = ({ 
  user, products, debts, suppliers, onAddTransaction, onAddDebt, onAddSupplier, onUpdateStock, onOpenTab, onUpdateBusiness
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [hybridText, setHybridText] = useState('');
  const [transcriptions, setTranscriptions] = useState<{user: string, ai: string, emotion?: string}[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const encode = useCallback((bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }, []);

  const decode = useCallback((base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }, []);

  const stopLive = useCallback(() => {
    setIsLive(false);
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close?.());
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const sendHybridText = () => {
    if (!hybridText.trim() || !sessionRef.current) return;
    const txt = hybridText.trim();
    setHybridText('');
    setTranscriptions(prev => [...prev, { user: txt, ai: 'Musa analyse votre message...' }]);
    sessionRef.current.then((s: any) => s.send({ parts: [{ text: txt }] }));
  };

  const shareMusaPlusSocial = (platform: 'whatsapp' | 'tiktok') => {
    const latestProd = products[0];
    const text = `🚀 Nouveauté chez ${user.businessName} !\n✨ ${latestProd?.name || 'Découvrez nos offres'}\n💰 Prix imbattable : ${latestProd?.price.toLocaleString() || '---'} F\n📍 Localisation : ${user.location}\nBoosté par AESCOMPT Musa+ AI Hub.`.trim();
    
    if(platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      // Pour TikTok, on propose un script de vidéo
      const script = `Musa+ Script TikTok :\n1. Montrez le produit : ${latestProd?.name}\n2. Dites : "Disponible chez ${user.businessName} à seulement ${latestProd?.price} F !"\n3. Collez ceci en description : #AESCOMPT #Business #Promo #TikTokShopAfrique`.trim();
      navigator.clipboard.writeText(script);
      alert("Script promotionnel Musa+ copié ! Ouvrez TikTok et collez-le en description. ✨");
      window.open('https://www.tiktok.com/', '_blank');
    }
  };

  const startLive = async () => {
    if (isLive) return stopLive();
    setIsLive(true);
    setIsOpen(false);
    setTranscriptions([{ user: '', ai: 'Je vous écoute, patron. Comment puis-je faire prospérer votre business aujourd\'hui ?' }]);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputCtx = audioContextRef.current;
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            if (sessionRef.current && isLive) {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              }));
            }
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.inputTranscription) {
            setTranscriptions(prev => {
              const last = prev[prev.length - 1];
              if (last && !last.ai) return [...prev.slice(0, -1), { ...last, user: (last.user + ' ' + msg.serverContent?.inputTranscription?.text).trim() }];
              return [...prev, { user: msg.serverContent?.inputTranscription?.text || '', ai: '' }];
            });
          }
          if (msg.serverContent?.outputTranscription) {
            setTranscriptions(prev => {
              const last = prev[prev.length - 1];
              if (last && last.ai !== undefined) {
                const newAiText = (last.ai.includes('Musa analyse') ? '' : last.ai) + ' ' + msg.serverContent?.outputTranscription?.text;
                return [...prev.slice(0, -1), { ...last, ai: newAiText.trim() }];
              }
              return [...prev, { user: '', ai: msg.serverContent?.outputTranscription?.text || '' }];
            });
          }

          if (msg.toolCall) {
            for (const fc of msg.toolCall.functionCalls) {
              if (fc.name === 'add_transaction') {
                onAddTransaction(fc.args);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { status: "La transaction a été enregistrée avec succès, patron." } }
                }));
              }
            }
          }

          const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), outputCtx);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onclose: () => stopLive(),
        onerror: () => stopLive()
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [{
          functionDeclarations: [
            {
              name: 'add_transaction',
              description: "Enregistre une vente ou une dépense dans la comptabilité.",
              parameters: {
                type: Type.OBJECT,
                properties: { 
                  type: { type: Type.STRING, enum: ['sale', 'expense'], description: 'Type de flux' }, 
                  amount: { type: Type.NUMBER, description: 'Montant en FCFA' }, 
                  description: { type: Type.STRING, description: 'Détails de l\'opération' } 
                },
                required: ['type', 'amount', 'description']
              }
            }
          ]
        }],
        systemInstruction: `Tu es Musa Synesthésie, l'intelligence émotionnelle de AESCOMPT. Ton ton est professionnel, respectueux, et axé sur le succès commercial en Afrique de l'Ouest.`
      }
    });
    sessionRef.current = sessionPromise;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  return (
    <div className="fixed bottom-8 right-8 z-[10000]">
      {isLive && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-between p-4 md:p-8 animate-in zoom-in duration-500">
           <div className="w-full max-w-5xl flex justify-between items-center py-6 border-b border-slate-800/50">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-yellow-600 rounded-[28px] flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(202,138,4,0.4)]">
                    <HeartPulse className="w-9 h-9 text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Musa Synesthésie</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp className="w-3 h-3 text-green-500" /> IA Souveraine de AESCOMPT
                    </p>
                 </div>
              </div>
              <button onClick={stopLive} className="p-5 bg-red-600 text-white rounded-[24px] hover:bg-red-700 active:scale-95 transition-all shadow-xl">
                 <PhoneOff className="w-8 h-8" />
              </button>
           </div>

           <div ref={scrollRef} className="flex-1 w-full max-w-5xl overflow-y-auto space-y-12 px-4 py-16 custom-scrollbar">
              {transcriptions.map((t, i) => (
                <div key={i} className="space-y-6 animate-in slide-in-from-bottom-2">
                   {t.user && (
                     <div className="flex justify-end">
                       <div className="max-w-[85%] p-8 bg-yellow-600/10 border border-yellow-500/20 rounded-[40px] text-yellow-500 text-xl font-black italic shadow-lg">
                         "{t.user}"
                       </div>
                     </div>
                   )}
                   {t.ai && (
                     <div className="flex justify-start items-start gap-6">
                       <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                         <Bot className="w-7 h-7 text-yellow-500" />
                       </div>
                       <div className="max-w-[85%] p-8 bg-slate-900 border border-slate-800 rounded-[40px] text-white text-xl font-bold shadow-2xl leading-relaxed">
                         {t.ai}
                       </div>
                     </div>
                   )}
                </div>
              ))}
           </div>

           <div className="w-full max-w-5xl space-y-10 pb-12 flex flex-col items-center">
              {/* Pont Social Musa+ */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                  <button onClick={() => shareMusaPlusSocial('whatsapp')} className="px-6 py-4 bg-green-600/20 text-green-500 rounded-full flex items-center gap-3 border border-green-600/30 font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">
                    <MessageSquare className="w-5 h-5" /> Musa+ WhatsApp Marketing
                  </button>
                  <button onClick={() => shareMusaPlusSocial('tiktok')} className="px-6 py-4 bg-purple-600/20 text-purple-500 rounded-full flex items-center gap-3 border border-purple-600/30 font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                    <Video className="w-5 h-5" /> Musa+ TikTok Creator
                  </button>
              </div>
              <div className="relative group w-full">
                 <input 
                   type="text" 
                   placeholder="Parlez ou écrivez ici pour gérer votre stock..." 
                   className="w-full bg-slate-900 border border-slate-800 rounded-[48px] px-14 py-10 text-white text-xl font-medium focus:border-yellow-500 outline-none pr-40 shadow-3xl transition-all" 
                   value={hybridText} 
                   onChange={e => setHybridText(e.target.value)} 
                   onKeyPress={e => e.key === 'Enter' && sendHybridText()} 
                 />
                 <button onClick={sendHybridText} className="absolute right-8 top-1/2 -translate-y-1/2 w-20 h-20 mali-gradient rounded-[32px] flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all">
                   <Send className="w-10 h-10" />
                 </button>
              </div>
           </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`w-32 h-32 rounded-[48px] flex items-center justify-center shadow-[0_0_100px_rgba(202,138,4,0.4)] transition-all duration-700 ${isOpen ? 'bg-slate-900 border-2 border-slate-800 rotate-90 scale-90' : 'mali-gradient hover:scale-110 shadow-3xl'}`}>
        {isOpen ? <X className="w-14 h-14 text-white" /> : <Bot className="w-20 h-20 text-white animate-pulse" />}
      </button>

      {isOpen && !isLive && (
        <div className="absolute bottom-40 right-0 flex flex-col gap-8 animate-in slide-in-from-bottom-5 duration-500">
           <button onClick={startLive} className="p-12 bg-slate-900 border border-slate-800 rounded-[64px] flex items-center gap-10 group hover:border-yellow-500 transition-all shadow-3xl backdrop-blur-2xl">
              <div className="p-8 bg-yellow-600 rounded-[36px] shadow-[0_0_40px_rgba(202,138,4,0.5)] animate-pulse">
                <Mic className="w-14 h-14 text-white" />
              </div>
              <div className="text-left pr-12">
                <p className="text-3xl font-black text-white italic uppercase tracking-tighter">Lancer Musa</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Intelligence Vocale Active</p>
              </div>
           </button>
        </div>
      )}
    </div>
  );
};

export default FloatingConsole;

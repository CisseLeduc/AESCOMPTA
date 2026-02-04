import React, { useState } from 'react';
import { 
  Share2, Printer, X, QrCode, Building, Palette, Info 
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';

interface ReceiptProps {
  transaction: Transaction;
  user: UserProfile;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, user, onClose }) => {
  const [customerName, setCustomerName] = useState(transaction.customerName || "Client Passager");
  const [discount, setDiscount] = useState(transaction.discount || 0);
  const headerNote = user.receiptConfig?.headerNote || user.businessName;
  const footerNote = user.receiptConfig?.footerNote || "Merci de votre fidélité !";
  
  const finalTotal = transaction.amount - discount;

  const handleShare = async () => {
    const text = `📜 REÇU AESCOMPT - ${headerNote}\nDate: ${new Date(transaction.date).toLocaleDateString()}\nClient: ${customerName}\nTOTAL : ${finalTotal.toLocaleString()} F\n${footerNote}`.trim();
    if (navigator.share) {
      try { await navigator.share({ title: `Reçu ${headerNote}`, text }); } 
      catch (e) { navigator.clipboard.writeText(text); alert("Copié !"); }
    } else {
      navigator.clipboard.writeText(text);
      alert("Reçu copié dans le presse-papier !");
    }
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl max-h-[90vh]">
        <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6 overflow-y-auto">
           <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Palette className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-black text-white uppercase italic">Éditeur</h3>
           </div>
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Nom Client</label>
                 <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-xs outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Remise (F)</label>
                 <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-red-500 font-black outline-none" />
              </div>
              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
                 <Info className="w-4 h-4 text-blue-500 shrink-0" />
                 <p className="text-[9px] text-slate-400 font-medium leading-tight">Musa recommande d'enregistrer le client pour un suivi de fidélité optimal.</p>
              </div>
           </div>
        </div>

        <div className="flex-1 bg-white text-slate-950 rounded-[40px] shadow-3xl overflow-hidden flex flex-col relative print:shadow-none">
           <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all print:hidden z-10"><X className="w-6 h-6" /></button>
           <div className="p-8 md:p-12 space-y-8 overflow-y-auto flex-1">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-950 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-xl overflow-hidden">
                    {user.receiptConfig?.logo ? <img src={user.receiptConfig.logo} className="w-full h-full object-cover" /> : <span className="text-4xl font-black italic">{headerNote[0]}</span>}
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{headerNote}</h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Building className="w-3 h-3" /> {user.location} • AESCOMPT OS
                 </p>
              </div>
              <div className="border-y-2 border-dashed border-slate-100 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest space-y-2">
                 <div className="flex justify-between"><span>TICKET N°</span><span className="text-slate-900">#AES-{transaction.id.substr(0,8)}</span></div>
                 <div className="flex justify-between"><span>CLIENT</span><span className="text-slate-900">{customerName}</span></div>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <p className="text-lg font-black text-slate-900 uppercase italic">{transaction.description}</p>
                    <span className="font-black text-xl text-slate-900">{transaction.amount.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Payé</span>
                    <span className="text-4xl font-black italic tracking-tighter">{finalTotal.toLocaleString()} F</span>
                 </div>
              </div>
              <div className="flex flex-col items-center pt-6 border-t border-slate-100">
                 <QrCode className="w-20 h-20 text-slate-900 mb-4" />
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{footerNote}</p>
              </div>
           </div>
           <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4 print:hidden">
              <button onClick={() => window.print()} className="py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3">
                 <Printer className="w-4 h-4" /> Imprimer
              </button>
              <button onClick={handleShare} className="py-4 mali-gradient text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3 shadow-lg">
                 <Share2 className="w-4 h-4" /> Partager
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
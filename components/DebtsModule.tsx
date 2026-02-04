
import React, { useState } from 'react';
import { CreditCard, Search, Plus, User, Clock, CheckCircle2, AlertCircle, X, Send, History, Phone, MessageSquare, Info } from 'lucide-react';
import { Debt } from '../types';

interface DebtsModuleProps {
  debts: Debt[];
  onAddDebt: (d: any) => void;
  onPayDebt: (id: string, amount: number) => void;
}

const DebtsModule: React.FC<DebtsModuleProps> = ({ debts, onAddDebt, onPayDebt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  
  const [newDebt, setNewDebt] = useState({
    customerName: '',
    phone: '',
    amount: '',
    description: '',
    dueDate: ''
  });

  const sendWhatsAppReminder = (debt: Debt) => {
    // Nettoyage du numéro pour WhatsApp
    const cleanPhone = debt.phone.replace(/\D/g, '');
    const message = `Bonjour ${debt.customerName}, Musa vous informe poliment que votre solde chez AESCOMPT est de ${debt.remainingAmount.toLocaleString()} FCFA. Merci de régulariser dès que possible. Excellente journée !`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filtered = debts.filter(d => 
    d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.phone && d.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-6 w-6 h-6 text-slate-500" />
          <input 
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full bg-slate-900 border border-slate-800 rounded-[32px] pl-16 py-6 font-black text-white outline-none focus:border-yellow-500 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-6 bg-red-600/10 border border-red-500/20 text-red-500 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-red-600 hover:text-white">
           <Plus className="w-6 h-6" /> Nouveau Crédit Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(debt => (
          <div key={debt.id} className={`bg-slate-900 border border-slate-800 rounded-[48px] p-10 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-yellow-500 transition-all ${debt.status === 'paid' ? 'opacity-50 grayscale' : ''}`}>
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-yellow-500 shadow-inner">
                      <User className="w-8 h-8" />
                   </div>
                   <div className="max-w-[120px]">
                      <h3 className="text-xl font-black italic text-white uppercase truncate">{debt.customerName}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{debt.phone}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   {debt.phone && (
                     <>
                        <a href={`tel:${debt.phone}`} className="p-3 bg-slate-800 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                           <Phone className="w-4 h-4" />
                        </a>
                        <button onClick={() => sendWhatsAppReminder(debt)} className="p-3 bg-slate-800 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                           <MessageSquare className="w-4 h-4" />
                        </button>
                     </>
                   )}
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Dette Restante</p>
                   <p className="text-3xl font-black text-white italic tracking-tighter">{debt.remainingAmount.toLocaleString()} F</p>
                </div>
                <div className="flex items-center gap-2 p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                   <Info className="w-3 h-3 text-slate-600" />
                   <p className="text-[10px] text-slate-400 font-medium italic truncate">"{debt.description}"</p>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   <Clock className="w-4 h-4" /> {new Date(debt.date).toLocaleDateString()}
                </div>
                {debt.status !== 'paid' && (
                  <button onClick={() => setShowPayModal(debt)} className="px-6 py-3 bg-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg">Rembourser</button>
                )}
             </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[6000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-lg rounded-[64px] p-12 border border-slate-800 shadow-3xl space-y-10">
              <div className="flex justify-between items-center text-white">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Accorder Crédit</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-slate-800 rounded-3xl text-slate-500"><X className="w-8 h-8" /></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Identité Client</label>
                   <input type="text" placeholder="Nom Complet" value={newDebt.customerName} onChange={e => setNewDebt({...newDebt, customerName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none focus:border-yellow-500" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Contact Direct (WhatsApp/Tel)</label>
                   <input type="tel" placeholder="+223..." value={newDebt.phone} onChange={e => setNewDebt({...newDebt, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none focus:border-yellow-500" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Montant du Crédit (F)</label>
                   <input type="number" placeholder="0 F" value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-red-500 text-3xl outline-none" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Motif</label>
                   <textarea placeholder="Détails de l'achat à crédit..." value={newDebt.description} onChange={e => setNewDebt({...newDebt, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-medium text-white outline-none h-24" />
                 </div>
                 <button onClick={() => { 
                   if(!newDebt.customerName || !newDebt.amount || !newDebt.phone) return alert("Nom, Téléphone et Montant requis.");
                   onAddDebt({ ...newDebt, amount: Number(newDebt.amount), phone: newDebt.phone }); 
                   setShowAddModal(false); 
                   setNewDebt({customerName:'', phone:'', amount:'', description:'', dueDate:''}); 
                 }} className="w-full py-8 bg-red-600 text-white rounded-[32px] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all">Valider le Crédit Client</button>
              </div>
           </div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-[6000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="bg-slate-900 w-full max-w-lg rounded-[64px] p-12 border border-slate-800 shadow-3xl space-y-10">
              <div className="flex justify-between items-center text-white">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Encaissement Dette</h3>
                 <button onClick={() => setShowPayModal(null)} className="p-4 bg-slate-800 rounded-3xl text-slate-500"><X className="w-8 h-8" /></button>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Solde restant pour {showPayModal.customerName}</p>
                 <p className="text-5xl font-black text-yellow-500 italic tracking-tighter">{showPayModal.remainingAmount.toLocaleString()} F</p>
              </div>
              <div className="space-y-6">
                 <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 font-black text-green-500 text-4xl text-center outline-none focus:border-green-500" />
                 <button onClick={() => { 
                   if(!payAmount) return;
                   onPayDebt(showPayModal.id, Number(payAmount)); 
                   setShowPayModal(null); 
                   setPayAmount(''); 
                 }} className="w-full py-8 bg-green-600 text-white rounded-[32px] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all">Confirmer Remboursement</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DebtsModule;


import React, { useState } from 'react';
import { Truck, Search, Plus, User, Phone, MapPin, X, Send, History, Briefcase, DollarSign, ExternalLink } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  onAddSupplier: (s: any) => void;
  onUpdateBalance: (id: string, amount: number) => void;
}

const SuppliersModule: React.FC<SuppliersModuleProps> = ({ suppliers, onAddSupplier, onUpdateBalance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', category: '', address: '' });

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openWhatsApp = (contact: string) => {
    const cleanContact = contact.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanContact}`, '_blank');
  };

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-6 w-6 h-6 text-slate-500" />
          <input 
            type="text"
            placeholder="Rechercher par nom ou spécialité (ex: Riz, Ciment)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-[32px] pl-16 py-6 font-black text-white outline-none focus:border-yellow-500 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-6 mali-gradient text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
           <Plus className="w-6 h-6" /> Nouveau Partenaire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(s => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 flex flex-col space-y-8 group hover:border-blue-500 transition-all shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
             
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                      <Truck className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic text-white uppercase truncate max-w-[150px]">{s.name}</h3>
                      <div className="px-3 py-1 bg-slate-800 text-slate-500 text-[8px] font-black uppercase rounded-full tracking-widest mt-1">{s.category}</div>
                   </div>
                </div>
                <button onClick={() => openWhatsApp(s.contact)} className="p-3 bg-green-600/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all">
                   <Phone className="w-5 h-5" />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800">
                   <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Volume d'Achat</p>
                   <p className="text-lg font-black text-white">{s.totalBusiness.toLocaleString()} F</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800">
                   <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Dette Fournisseur</p>
                   <p className="text-lg font-black text-red-500">{s.balance.toLocaleString()} F</p>
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                   <MapPin className="w-4 h-4 shrink-0" />
                   <span className="truncate">{s.address || 'Adresse non spécifiée'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                   <History className="w-4 h-4 shrink-0" />
                   <span>Livré le: {s.lastDelivery ? new Date(s.lastDelivery).toLocaleDateString() : 'Jamais'}</span>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ID: {s.id}</span>
                <button className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">
                   Historique Commandes <ExternalLink className="w-3 h-3" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[6000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="bg-slate-900 w-full max-w-lg rounded-[64px] p-12 border border-slate-800 shadow-3xl space-y-10">
              <div className="flex justify-between items-center text-white">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Nouveau Partenaire</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-slate-800 rounded-3xl"><X className="w-8 h-8 text-slate-500" /></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Nom de l'Entreprise</label><input type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none focus:border-blue-500" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Contact (WhatsApp/Tel)</label><input type="text" placeholder="+223..." value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Spécialité / Catégorie</label><input type="text" placeholder="Ex: Matériaux de construction" value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Localisation</label><input type="text" placeholder="Ville / Quartier" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none" /></div>
                 <button onClick={() => { onAddSupplier(newSupplier); setShowAddModal(false); setNewSupplier({name:'', contact:'', category:'', address:''}); }} className="w-full py-8 mali-gradient text-white rounded-[32px] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all">Enregistrer Partenaire</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersModule;

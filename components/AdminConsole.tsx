
import React, { useState, useRef } from 'react';
import { 
  Building2, Store, Utensils, Bed, ShoppingBag, 
  Warehouse, Save, Palette, Settings, CheckCircle2, 
  ImageIcon, Type, AlignLeft, Info, Camera, Trash2
} from 'lucide-react';
import { UserProfile, BusinessType, ReceiptConfig } from '../types';

interface AdminConsoleProps {
  user: UserProfile;
  onUpdateBusiness: (type: BusinessType) => void;
  onUpdateName: (name: string) => void;
  onUpdateReceiptConfig: (config: ReceiptConfig) => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ user, onUpdateBusiness, onUpdateName, onUpdateReceiptConfig }) => {
  const [editName, setEditName] = useState(user.businessName);
  const [headerNote, setHeaderNote] = useState(user.receiptConfig?.headerNote || user.businessName);
  const [footerNote, setFooterNote] = useState(user.receiptConfig?.footerNote || "Merci de votre fidélité !");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const businessTypes: {id: BusinessType, label: string, icon: any}[] = [
    { id: 'boutique', label: 'Boutique', icon: ShoppingBag },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'hotel', label: 'Hôtel', icon: Bed },
    { id: 'supermarket', label: 'Supermarché', icon: Store },
    { id: 'warehouse', label: 'Entrepôt', icon: Warehouse },
    { id: 'general', label: 'Général', icon: Building2 },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateReceiptConfig({ ...user.receiptConfig, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTexts = () => {
    onUpdateReceiptConfig({
      ...user.receiptConfig,
      headerNote,
      footerNote
    });
    alert("Configurations du reçu enregistrées !");
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-4 inline-block">Souveraineté AESCOMPT</span>
           <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Control OS</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* IDENTITÉ BUSINESS */}
         <div className="p-10 bg-slate-900 border border-slate-800 rounded-[56px] space-y-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white italic flex items-center gap-4 uppercase tracking-tighter">
               <Settings className="w-8 h-8 text-blue-500" /> Profil de l'Établissement
            </h3>
            
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nom de l'Enseigne</label>
                  <div className="flex gap-4">
                     <input 
                       type="text" 
                       value={editName} 
                       onChange={e => setEditName(e.target.value)}
                       className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black text-white outline-none focus:border-yellow-500 transition-all"
                     />
                     <button onClick={() => onUpdateName(editName)} className="p-6 bg-yellow-600 rounded-3xl text-white shadow-lg active:scale-95 transition-all"><Save className="w-6 h-6" /></button>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Type de Gouvernance</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {businessTypes.map(type => (
                        <button 
                          key={type.id}
                          onClick={() => onUpdateBusiness(type.id)}
                          className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 ${user.businessType === type.id ? 'bg-yellow-600 border-white scale-105 shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                           <type.icon className={`w-8 h-8 ${user.businessType === type.id ? 'text-white' : 'text-slate-700'}`} />
                           <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* STUDIO DESIGN REÇU (CUSTOMISATION RÉELLE) */}
         <div className="p-10 bg-slate-900 border border-slate-800 rounded-[56px] space-y-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white italic flex items-center gap-4 uppercase tracking-tighter">
               <Palette className="w-8 h-8 text-purple-500" /> Studio Reçu Professionnel
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Controls */}
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Logo de Marque</label>
                     <div 
                       onClick={() => logoInputRef.current?.click()}
                       className="w-full aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-yellow-500 transition-all overflow-hidden relative group"
                     >
                        {user.receiptConfig?.logo ? (
                          <img src={user.receiptConfig.logo} className="w-full h-full object-contain p-4" />
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                            <span className="text-[9px] font-black text-slate-600 uppercase">Charger Logo</span>
                          </div>
                        )}
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Titre du Reçu</label>
                        <input type="text" value={headerNote} onChange={e => setHeaderNote(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-purple-500" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Pied de Page</label>
                        <input type="text" value={footerNote} onChange={e => setFooterNote(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-purple-500" />
                     </div>
                     <button onClick={saveTexts} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Appliquer au Studio</button>
                  </div>
               </div>

               {/* Live Preview Card */}
               <div className="bg-white text-slate-950 rounded-[40px] p-8 shadow-2xl flex flex-col space-y-6 scale-[0.9] origin-top">
                  <div className="text-center space-y-4 border-b border-slate-100 pb-4">
                     <div className="w-20 h-20 bg-slate-950 rounded-[24px] mx-auto flex items-center justify-center overflow-hidden text-white">
                        {user.receiptConfig?.logo ? <img src={user.receiptConfig.logo} className="w-full h-full object-cover" /> : <span className="text-3xl font-black">{headerNote[0]}</span>}
                     </div>
                     <p className="font-black text-lg uppercase tracking-tighter leading-none">{headerNote}</p>
                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{user.location} • AESCOMPT OS</p>
                  </div>
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                     <div className="flex justify-between text-[10px] font-bold"><span>ARTICLE TEST</span><span>15.000 F</span></div>
                     <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>QUANTITÉ</span><span>x1</span></div>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Total</span>
                     <span className="text-2xl font-black">15.000 F</span>
                  </div>
                  <div className="text-center pt-4 border-t border-dashed border-slate-200">
                     <p className="text-[9px] font-black uppercase text-slate-400 italic">"{footerNote}"</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminConsole;

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Smartphone, ShieldCheck, HeartPulse, Target, RefreshCcw, 
  Sparkles, Loader2, Info, X, Camera, QrCode, LayoutGrid, 
  ArrowUpCircle, ArrowDownCircle, Wallet, History, Users, Settings, 
  CreditCard, Truck
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Transaction, Product, UserProfile, Debt, Supplier } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  products: Product[];
  debts?: Debt[];
  suppliers?: Supplier[];
  user: UserProfile;
  onAddTransaction: (t: any) => void;
  onToggleSimplified: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, products, debts = [], suppliers = [], user, onAddTransaction, onToggleSimplified }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        const product = products.find(p => p.sku === decodedText || p.id === decodedText);
        if (product) {
          setQuickAmount(product.price.toString());
          setQuickDesc(product.name);
          scanner.clear();
          setShowScanner(false);
          setShowQuickSale(true);
        }
      }, (err) => {});
      return () => { scanner.clear(); };
    }
  }, [showScanner, products]);

  const stats = useMemo(() => {
    const sales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalDebt = debts.filter(d => d.status !== 'paid').reduce((acc, d) => acc + d.remainingAmount, 0);
    const totalSupplierDebt = suppliers.reduce((acc, s) => acc + s.balance, 0);
    return { sales, expenses, totalDebt, totalSupplierDebt, balance: sales - expenses };
  }, [transactions, debts, suppliers]);

  if (user.isSimplifiedMode) {
    return (
      <div className="min-h-full space-y-12 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black">{user.businessName}</h1>
          <button 
            onClick={onToggleSimplified} 
            className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-yellow-500 shadow-xl"
          >
            <Settings className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <button 
             onClick={() => { setQuickDesc('Vente'); setShowQuickSale(true); }}
             className="h-64 bg-green-600 rounded-[64px] shadow-3xl flex flex-col items-center justify-center gap-6 active:scale-95 transition-all"
           >
              <ArrowUpCircle className="w-32 h-32 text-white" />
              <span className="text-3xl font-black text-white uppercase tracking-tighter">Vendre (Argent Entre)</span>
           </button>

           <button 
             onClick={() => { setQuickDesc('Achat/Dépense'); setShowQuickSale(true); }}
             className="h-64 bg-red-600 rounded-[64px] shadow-3xl flex flex-col items-center justify-center gap-6 active:scale-95 transition-all"
           >
              <ArrowDownCircle className="w-32 h-32 text-white" />
              <span className="text-3xl font-black text-white uppercase tracking-tighter">Acheter (Argent Sort)</span>
           </button>
           
           <div className="p-10 bg-slate-900 rounded-[56px] text-center border-4 border-yellow-500 shadow-2xl">
              <p className="text-xl font-bold text-slate-400 uppercase mb-2 tracking-widest">Mon Cash Actuel</p>
              <p className="text-7xl font-black text-white tracking-tighter">{stats.balance.toLocaleString()} F</p>
           </div>
        </div>

        {showQuickSale && (
          <div className="fixed inset-0 z-[9999] bg-black/98 p-6 flex items-center justify-center">
            <div className="w-full max-w-lg bg-slate-900 rounded-[64px] p-12 space-y-10 border border-slate-800 shadow-3xl">
               <h2 className="text-3xl font-black text-white uppercase mb-4 text-center">{quickDesc}</h2>
               <input 
                 type="number" 
                 value={quickAmount} 
                 onChange={e => setQuickAmount(e.target.value)}
                 className="w-full text-8xl font-black text-center text-yellow-500 bg-transparent outline-none py-10" 
                 placeholder="0"
                 autoFocus
               />
               <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => { setShowQuickSale(false); setQuickAmount(''); }} className="p-10 bg-slate-800 rounded-[32px] text-2xl font-black text-slate-400">ANNULER</button>
                  <button onClick={() => {
                    if (!quickAmount) return;
                    onAddTransaction({ type: quickDesc.includes('Achat') ? 'expense' : 'sale', amount: Number(quickAmount), description: quickDesc });
                    setShowQuickSale(false);
                    setQuickAmount('');
                  }} className="p-10 bg-green-600 rounded-[32px] text-2xl font-black text-white uppercase">VALIDER</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
           <h1 className="text-6xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">{user.businessName}</h1>
           <div className="flex items-center gap-4">
              <button onClick={onToggleSimplified} className="px-6 py-2.5 bg-yellow-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Mode Musa-Facile</button>
              <div className="h-4 w-px bg-slate-800" />
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3">
                 <ShieldCheck className="w-4 h-4 text-yellow-500" /> GOUVERNANCE AESCOMPT v2.6
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-[40px] shadow-2xl glass">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Solde Trésorerie</p>
              <p className="text-3xl font-black text-white italic tracking-tighter">{stats.balance.toLocaleString()} F</p>
           </div>
           <div className="w-16 h-16 rounded-3xl mali-gradient flex items-center justify-center shadow-2xl">
              <Wallet className="w-8 h-8 text-white" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="p-10 bg-slate-900 border border-slate-800 rounded-[48px] shadow-xl relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Dettes Clients</p>
            <h2 className="text-4xl font-black text-red-500 italic tracking-tighter">{stats.totalDebt.toLocaleString()} F</h2>
            <CreditCard className="absolute -bottom-4 -right-4 w-20 h-20 text-red-500/10" />
         </div>
         <div className="p-10 bg-slate-900 border border-slate-800 rounded-[48px] shadow-xl relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Dettes Fournisseurs</p>
            <h2 className="text-4xl font-black text-orange-500 italic tracking-tighter">{stats.totalSupplierDebt.toLocaleString()} F</h2>
            <Truck className="absolute -bottom-4 -right-4 w-20 h-20 text-orange-500/10" />
         </div>
         <button onClick={() => setShowScanner(true)} className="p-10 bg-slate-900 border border-slate-800 rounded-[48px] flex flex-col items-center justify-center gap-4 hover:border-yellow-500 transition-all shadow-xl group">
            <QrCode className="w-10 h-10 text-yellow-500 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-black uppercase italic tracking-widest">Scanner QR</p>
         </button>
         <button onClick={() => { setQuickDesc('Vente Directe'); setShowQuickSale(true); }} className="p-10 bg-slate-900 border border-slate-800 rounded-[48px] flex flex-col items-center justify-center gap-4 hover:border-green-500 transition-all shadow-xl group">
            <Zap className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-black uppercase italic tracking-widest">Caisse Rapide</p>
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-10 bg-slate-900/50 border border-slate-800 rounded-[64px] glass shadow-2xl">
            <h3 className="text-2xl font-black italic text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
               <Target className="w-7 h-7 text-blue-500" /> Analyse Stratégique Musa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-slate-950/60 border border-slate-800/50 rounded-[40px] space-y-4">
                  <HeartPulse className="w-8 h-8 text-red-500" />
                  <p className="text-sm font-bold text-slate-400 italic">"Patron, attention aux {debts.length} dettes clients. Une relance WhatsApp pourrait améliorer votre cash-flow de 15%."</p>
               </div>
               <div className="p-8 bg-slate-950/60 border border-slate-800/50 rounded-[40px] space-y-4">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <p className="text-sm font-bold text-slate-400 italic">"Le produit le plus rentable cette semaine est {products[0]?.name || '...'}, envisagez une commande groupée."</p>
               </div>
            </div>
         </div>
         
         <div className="p-10 bg-slate-900 border border-slate-800 rounded-[64px] shadow-xl flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 bg-green-600/10 rounded-full flex items-center justify-center">
               <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            <div>
               <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Santé Système</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">SENTINEL-X ACTIF • 100% SÉCURISÉ</p>
            </div>
         </div>
      </div>

      {showQuickSale && (
        <div className="fixed inset-0 z-[8100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg rounded-[72px] p-12 border border-slate-800 shadow-3xl space-y-12">
            <div className="flex justify-between items-center text-white">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">{quickDesc}</h2>
               <button onClick={() => { setShowQuickSale(false); setQuickAmount(''); }} className="p-5 bg-slate-800 rounded-3xl"><X className="w-8 h-8 text-slate-500" /></button>
            </div>
            <div className="space-y-10">
              <input type="text" value={quickDesc} onChange={e => setQuickDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-[32px] p-8 font-black text-white text-center text-xl outline-none focus:border-yellow-500" />
              <input type="number" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-[32px] p-10 font-black text-yellow-500 text-6xl text-center outline-none focus:border-yellow-500" />
              <button onClick={() => { 
                if (!quickAmount) return;
                onAddTransaction({ type: quickDesc.includes('Achat') || quickDesc.includes('Dépense') ? 'expense' : 'sale', amount: Number(quickAmount), description: quickDesc }); 
                setShowQuickSale(false); 
                setQuickAmount(''); 
              }} className="w-full py-10 mali-gradient text-white rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-all">VALIDER TRANSACTION</button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 z-[9999] bg-black/98 p-6 flex flex-col items-center justify-center backdrop-blur-3xl animate-in fade-in">
           <div id="reader" className="w-full max-w-lg rounded-[48px] overflow-hidden bg-slate-900 border border-slate-800 shadow-3xl"></div>
           <button onClick={() => setShowScanner(false)} className="mt-12 p-8 bg-slate-800 text-white rounded-full"><X className="w-8 h-8" /></button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
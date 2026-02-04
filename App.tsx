
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Package, History, LogOut, Menu, X, ShieldCheck, 
  Settings, CreditCard, Truck, LayoutGrid, BrainCircuit, Bell
} from 'lucide-react';
import { Transaction, Product, UserProfile, BusinessType, SupportedLanguage, Debt, Supplier, AuditLog, ReceiptConfig } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Auth from './components/Auth';
import AdminConsole from './components/AdminConsole';
import DebtsModule from './components/DebtsModule';
import SuppliersModule from './components/SuppliersModule';
import FloatingConsole from './components/FloatingConsole';
import Receipt from './components/Receipt';
import { SentinelX } from './services/SentinelX';

type TabID = 'dashboard' | 'inventory' | 'history' | 'debts' | 'suppliers' | 'admin';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<TabID>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const addAudit = useCallback((action: string, details: string, severity: any) => {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      action, details, severity
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  useEffect(() => {
    const saved = {
      txs: localStorage.getItem('aes_transactions'),
      prods: localStorage.getItem('aes_products'),
      debts: localStorage.getItem('aes_debts'),
      supps: localStorage.getItem('aes_suppliers'),
      user: localStorage.getItem('aes_user_profile'),
    };
    if (saved.txs) setTransactions(JSON.parse(saved.txs));
    if (saved.prods) setProducts(JSON.parse(saved.prods));
    if (saved.debts) setDebts(JSON.parse(saved.debts));
    if (saved.supps) setSuppliers(JSON.parse(saved.supps));
    if (saved.user) {
      setUser(JSON.parse(saved.user));
      setIsAuth(true);
    }
    SentinelX.heal(addAudit);
  }, [addAudit]);

  useEffect(() => {
    localStorage.setItem('aes_transactions', JSON.stringify(transactions));
    localStorage.setItem('aes_products', JSON.stringify(products));
    localStorage.setItem('aes_debts', JSON.stringify(debts));
    localStorage.setItem('aes_suppliers', JSON.stringify(suppliers));
    if (user) localStorage.setItem('aes_user_profile', JSON.stringify(user));
  }, [transactions, products, debts, suppliers, user]);

  const addTransaction = (t: any) => {
    const newT: Transaction = { 
      ...t, 
      id: Math.random().toString(36).substr(2, 9).toUpperCase(), 
      date: new Date().toISOString(), 
      category: t.category || 'Vente Directe',
      paymentMethod: t.paymentMethod || 'Cash'
    };
    setTransactions(prev => [newT, ...prev]);
    addAudit("Finance", `${t.type === 'sale' ? 'Encaissement' : 'Décaissement'}: ${t.amount} F`, "low");
    
    if (t.type === 'sale') {
      setSelectedTxForReceipt(newT);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    const newUser: UserProfile = {
      ...userData,
      businessName: "AESCOMPT Business",
      businessType: "general",
      location: "Bamako",
      isSimplifiedMode: false,
      receiptConfig: {
        headerNote: "AESCOMPT Business",
        footerNote: "Merci de votre fidélité !",
        showQR: true
      },
      learningProfile: { preferredLanguage: "Français" }
    };
    setUser(newUser);
    setIsAuth(true);
  };

  const menuItems: {id: TabID, label: string, icon: any}[] = [
    { id: 'dashboard', label: 'Oracle Pro', icon: LayoutDashboard },
    { id: 'inventory', label: 'Logistique', icon: Package },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'debts', label: 'Dettes Clients', icon: CreditCard },
    { id: 'suppliers', label: 'Partenaires', icon: Truck },
    { id: 'admin', label: 'Control OS', icon: ShieldCheck }
  ];

  if (!isAuth) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-inter">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[4000] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[5000] w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${user?.isSimplifiedMode ? 'hidden' : 'flex flex-col'}`}>
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50">
          <div className="w-12 h-12 mali-gradient rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg">A</div>
          <div>
            <h1 className="text-lg font-black italic tracking-tighter text-white uppercase">AESCOMPT</h1>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Souveraineté OS</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-yellow-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={() => { setIsAuth(false); setUser(null); }} className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-600 hover:text-red-500 font-black text-[9px] uppercase tracking-[0.2em] transition-all">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-12 bg-slate-950/40 border-b border-slate-800/50 backdrop-blur-md shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-3 bg-slate-900 rounded-xl border border-slate-800 ${user?.isSimplifiedMode ? 'hidden' : ''}`}><Menu className="w-6 h-6" /></button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">{activeTab}</h2>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">Management Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-white">{user?.businessName}</p>
              <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">{user?.location}</p>
            </div>
            <div className="w-12 h-12 rounded-xl mali-gradient p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-white text-lg overflow-hidden">
                {(user?.receiptConfig?.logo || user?.logo) ? <img src={user.receiptConfig?.logo || user?.logo} className="w-full h-full object-cover" /> : user?.name[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <Dashboard transactions={transactions} products={products} debts={debts} suppliers={suppliers} user={user!} onAddTransaction={addTransaction} onToggleSimplified={() => setUser(u => u ? {...u, isSimplifiedMode: !u.isSimplifiedMode} : null)} />
          )}
          {activeTab === 'inventory' && (
            <Inventory products={products} suppliers={suppliers} onAddProduct={(p) => setProducts(prev => [...prev, p])} />
          )}
          {activeTab === 'history' && <Transactions transactions={transactions} onShowReceipt={(t) => setSelectedTxForReceipt(t)} />}
          {activeTab === 'debts' && (
            <DebtsModule debts={debts} onAddDebt={(d) => setDebts(prev => [...prev, {...d, id: Math.random().toString(36).substr(2,9).toUpperCase(), date: new Date().toISOString(), status: 'pending', remainingAmount: d.amount}])} onPayDebt={(id, amt) => setDebts(prev => prev.map(d => d.id === id ? {...d, remainingAmount: Math.max(0, d.remainingAmount - amt), status: (d.remainingAmount - amt) <= 0 ? 'paid' : 'pending'} : d))} />
          )}
          {activeTab === 'suppliers' && (
            <SuppliersModule suppliers={suppliers} onAddSupplier={(s) => setSuppliers(prev => [...prev, {...s, id: Math.random().toString(36).substr(2,9).toUpperCase(), totalBusiness: 0, balance: 0}])} onUpdateBalance={(id, amt) => setSuppliers(prev => prev.map(s => s.id === id ? {...s, balance: s.balance + amt} : s))} />
          )}
          {activeTab === 'admin' && (
            <AdminConsole 
              user={user!} 
              onUpdateBusiness={(t) => setUser(u => u ? {...u, businessType: t} : null)} 
              onUpdateName={(n) => setUser(u => u ? {...u, businessName: n} : null)} 
              onUpdateReceiptConfig={(c) => setUser(u => u ? {...u, receiptConfig: c} : null)}
            />
          )}
        </main>
      </div>

      {selectedTxForReceipt && (
        <Receipt transaction={selectedTxForReceipt} user={user!} onClose={() => setSelectedTxForReceipt(null)} />
      )}

      <FloatingConsole user={user!} products={products} debts={debts} suppliers={suppliers} onAddTransaction={addTransaction} onAddDebt={(d) => setDebts(prev => [...prev, d])} onAddSupplier={(s) => setSuppliers(prev => [...prev, s])} onUpdateStock={(id, qty) => setProducts(prev => prev.map(p => p.id === id ? {...p, stock: qty} : p))} onOpenTab={(tab) => setActiveTab(tab)} />
    </div>
  );
};

export default App;

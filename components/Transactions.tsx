
import React, { useState, useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownRight, Download, Calendar, X, FileText } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  onShowReceipt: (t: Transaction) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onShowReceipt }) => {
  const [filter, setFilter] = useState<'all' | 'sale' | 'expense'>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filter === 'all' ? true : t.type === filter;
      const tDate = new Date(t.date);
      const startMatch = dateStart ? tDate >= new Date(dateStart) : true;
      const endMatch = dateEnd ? tDate <= new Date(dateEnd) : true;
      return typeMatch && startMatch && endMatch;
    });
  }, [transactions, filter, dateStart, dateEnd]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Categorie', 'Montant (FCFA)', 'Methode'];
    const rows = filtered.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type === 'sale' ? 'Vente' : 'Depense',
      t.description,
      t.category,
      t.amount,
      t.paymentMethod
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aescompt_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Historique des Flux</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gérez et exportez vos données.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-6 py-3 bg-yellow-600/10 border border-yellow-600/30 rounded-xl text-xs font-black text-yellow-500 hover:bg-yellow-600 hover:text-white transition-all">
            <Download className="w-4 h-4" /> EXPORTER DATA
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        {(['all', 'sale', 'expense'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-500'}`}>
            {f === 'all' ? 'Tous' : f === 'sale' ? 'Ventes' : 'Dépenses'}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">Désignation</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase text-right">Montant</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase text-center">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'sale' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.type === 'sale' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-sm text-slate-100">{t.description}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${t.type === 'sale' ? 'text-green-500' : 'text-red-500'}`}>{t.amount.toLocaleString()} F</td>
                  <td className="px-6 py-4 text-center">
                    {t.type === 'sale' && (
                      <button onClick={() => onShowReceipt(t)} className="p-3 bg-slate-800 text-slate-500 rounded-xl hover:bg-yellow-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <FileText className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

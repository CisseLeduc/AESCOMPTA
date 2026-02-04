
import React, { useState, useRef } from 'react';
import { Package, Search, Plus, X, QrCode as QrIcon, Camera, Sparkles, Trash2, Loader2, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { Product, Supplier } from '../types';
import { analyzeProductLens } from '../services/geminiService';

interface InventoryProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (p: any) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, suppliers, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProductQR, setSelectedProductQR] = useState<Product | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', purchasePrice: '', stock: '', minStock: '5', category: 'Général', unit: 'pcs'
  });

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Accès caméra refusé. Vérifiez les permissions.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setCapturedImage(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const handleLensAnalysis = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    const result = await analyzeProductLens(capturedImage);
    if (result) {
      setNewProduct(prev => ({
        ...prev,
        name: result.name || prev.name,
        category: result.category || prev.category,
        price: result.suggestedPrice?.toString() || prev.price
      }));
    }
    setIsAnalyzing(false);
  };

  const generateAndAdd = async () => {
    if (!newProduct.name || !newProduct.price) return alert("Le nom et le prix sont obligatoires.");
    
    // Génération d'un ID unique pour le suivi QR
    const uniqueId = "AES-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      // Génération réelle du QR Code unique basé sur l'ID produit
      const qrDataUrl = await QRCode.toDataURL(uniqueId, {
        margin: 2,
        scale: 10,
        color: { dark: '#020617', light: '#ffffff' }
      });

      onAddProduct({
        ...newProduct,
        id: uniqueId,
        sku: uniqueId,
        price: Number(newProduct.price),
        purchasePrice: Number(newProduct.purchasePrice),
        stock: Number(newProduct.stock),
        minStock: Number(newProduct.minStock),
        qrCode: qrDataUrl,
        image: capturedImage
      });

      setNewProduct({ name: '', price: '', purchasePrice: '', stock: '', minStock: '5', category: 'Général', unit: 'pcs' });
      setCapturedImage(null);
      setShowAddModal(false);
    } catch (err) {
      alert("Erreur lors de la génération du QR Code.");
    }
  };

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-6 w-6 h-6 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un produit ou scanner..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-[32px] pl-16 py-6 text-white outline-none focus:border-yellow-500 shadow-xl" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full lg:w-auto px-10 py-6 mali-gradient text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
           <Plus className="w-6 h-6" /> Nouveau Produit IA
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-[48px] p-6 space-y-6 group hover:border-yellow-500 transition-all shadow-xl relative overflow-hidden">
             <div className="aspect-square bg-slate-950 rounded-[40px] flex items-center justify-center overflow-hidden relative shadow-inner">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Package className="w-20 h-20 text-slate-800" />
                )}
                {p.stock <= p.minStock && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase rounded-full animate-pulse shadow-lg">Stock Critique</div>
                )}
             </div>
             <div className="space-y-1 px-2">
                <h3 className="text-xl font-black italic text-white truncate">{p.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.stock} {p.unit} en stock • {p.category}</p>
             </div>
             <div className="flex justify-between items-center border-t border-slate-800 pt-4 px-2">
                <span className="text-2xl font-black text-yellow-500 italic">{p.price.toLocaleString()} F</span>
                <button onClick={() => setSelectedProductQR(p)} className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white hover:bg-slate-700 transition-all">
                   <QrIcon className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal d'affichage/impression du QR Code */}
      {selectedProductQR && (
        <div className="fixed inset-0 z-[7000] bg-black/95 flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="bg-white p-10 rounded-[48px] max-w-sm w-full text-center space-y-8 shadow-3xl">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-slate-950 text-xl uppercase italic">Traçabilité QR</h3>
                 <button onClick={() => setSelectedProductQR(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 bg-slate-50 rounded-[32px] shadow-inner">
                 <img src={selectedProductQR.qrCode} className="w-full h-auto mx-auto" alt="Unique Product QR" />
              </div>
              <div className="space-y-2">
                 <p className="font-black text-slate-950 text-2xl tracking-tighter leading-none">{selectedProductQR.name}</p>
                 <p className="text-slate-400 font-black text-xs uppercase tracking-widest">ID Logistique: {selectedProductQR.sku}</p>
              </div>
              <button onClick={() => window.print()} className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <Printer className="w-5 h-5" /> Imprimer Étiquette
              </button>
           </div>
        </div>
      )}

      {/* Modal d'ajout avec IA Photo */}
      {showAddModal && (
        <div className="fixed inset-0 z-[6000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[64px] p-10 md:p-14 border border-slate-800 space-y-10 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center">
               <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">Inventaire Photo</h3>
               <button onClick={() => setShowAddModal(false)} className="p-4 bg-slate-800 rounded-3xl text-slate-500 hover:text-white transition-all"><X className="w-8 h-8" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-[48px] flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                     {isCameraOpen ? (
                       <div className="absolute inset-0 z-20">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-8 border-slate-300 shadow-2xl active:scale-90 transition-all"></button>
                       </div>
                     ) : capturedImage ? (
                       <div className="absolute inset-0">
                          <img src={capturedImage} className="w-full h-full object-cover" />
                          <button onClick={() => setCapturedImage(null)} className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full"><Trash2 className="w-5 h-5" /></button>
                          <button onClick={handleLensAnalysis} disabled={isAnalyzing} className="absolute bottom-4 left-4 right-4 py-3 bg-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-xl">
                             {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyser par Musa Lens
                          </button>
                       </div>
                     ) : (
                       <button onClick={startCamera} className="flex flex-col items-center gap-3 text-slate-700 hover:text-yellow-500 transition-colors">
                          <Camera className="w-16 h-16" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Photographier Produit</span>
                       </button>
                     )}
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identification</label>
                    <input type="text" placeholder="Nom de l'Article" className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[28px] text-white font-bold outline-none focus:border-yellow-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Prix Public (F)</label>
                    <input type="number" placeholder="Prix Vente" className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[28px] text-yellow-500 font-black text-2xl outline-none focus:border-yellow-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Stock Initial</label>
                        <input type="number" placeholder="Quantité" className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[28px] text-white font-bold outline-none focus:border-yellow-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Unité</label>
                        <input type="text" placeholder="pcs, kg..." className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[28px] text-white font-bold outline-none focus:border-yellow-500" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                     </div>
                  </div>
                  <button onClick={generateAndAdd} className="w-full py-8 mali-gradient text-white rounded-[32px] font-black uppercase text-sm shadow-2xl active:scale-95 transition-all">Enregistrer & Créer QR UNIQUE</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

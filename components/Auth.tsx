import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Lock, ShieldCheck, AlertCircle, Loader2, 
  KeyRound, Smartphone, CheckCircle2, Grid3X3, Key, 
  ChevronLeft, Hash, ShieldAlert, X, Eye, EyeOff, Info
} from 'lucide-react';
import GestureLock from './GestureLock';

interface AuthProps {
  onAuthSuccess: (userData: any) => void;
}

type AuthMode = 'selection' | 'biometric' | 'pin' | 'gesture' | 'password' | 'emergency';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        if (window.PublicKeyCredential && 
            window.isSecureContext && 
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
          setIsBiometricAvailable(true);
        }
      } catch (e) {
        setIsBiometricAvailable(false);
      }
    };
    checkBiometric();
  }, []);

  const handleSuccess = (method: string) => {
    setIsLoading(true);
    setError(null);
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    
    setTimeout(() => {
      onAuthSuccess({ id: 'owner_1', name: "Patron", role: 'owner' });
    }, 800);
  };

  const triggerBiometric = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const options: any = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      };

      const assertion = await navigator.credentials.get(options);
      if (assertion) {
        handleSuccess('biometric');
      }
    } catch (err: any) {
      let msg = "Accès biométrique non disponible.";
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        msg = "Veuillez utiliser votre code PIN pour l'authentification.";
      }
      
      setError(msg);
      setIsLoading(false);
      setMode('pin');
    }
  };

  const handlePinSubmit = () => {
    if (pin === '0000') handleSuccess('pin');
    else { 
      setError("Code PIN incorrect"); 
      setPin('');
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') handleSuccess('password');
    else {
      setError("Mot de passe incorrect");
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-inter select-none">
      <div className="w-full max-w-lg space-y-10">
        
        <div className="text-center space-y-4">
           <div className="w-28 h-28 mali-gradient rounded-[36px] flex items-center justify-center shadow-[0_0_80px_rgba(202,138,4,0.3)] mx-auto relative animate-in zoom-in duration-700">
              <ShieldCheck className="w-14 h-14 text-white" />
           </div>
           <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">AESCOMPT</h1>
           <p className="text-slate-500 font-black uppercase text-[9px] tracking-[0.5em]">Gouvernance Business OS</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/50 rounded-[56px] p-8 shadow-3xl backdrop-blur-3xl relative overflow-hidden">
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-6">
               <div className="relative">
                  <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
                  <Fingerprint className="w-8 h-8 text-yellow-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600 animate-pulse text-center">Initialisation Sécurisée...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[32px] space-y-2 animate-in shake">
                  <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-tight">
                    <ShieldAlert className="w-4 h-4" /> Alerte Sécurité
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">{error}</p>
                </div>
              )}

              {mode === 'selection' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                   <button 
                    onClick={() => { setMode('biometric'); triggerBiometric(); }} 
                    className={`p-8 bg-slate-950/50 border border-slate-800 rounded-[32px] flex flex-col items-center gap-4 transition-all group active:scale-95 shadow-xl ${!isBiometricAvailable ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-yellow-500/50'}`}
                   >
                      <Fingerprint className="w-12 h-12 text-yellow-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Empreinte</span>
                   </button>
                   <button onClick={() => setMode('pin')} className="p-8 bg-slate-950/50 border border-slate-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-blue-500/50 transition-all group active:scale-95 shadow-xl">
                      <Hash className="w-12 h-12 text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Code PIN</span>
                   </button>
                   <button onClick={() => setMode('gesture')} className="p-8 bg-slate-950/50 border border-slate-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-green-500/50 transition-all group active:scale-95 shadow-xl">
                      <Grid3X3 className="w-12 h-12 text-green-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Schéma</span>
                   </button>
                   <button onClick={() => setMode('password')} className="p-8 bg-slate-950/50 border border-slate-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-purple-500/50 transition-all group active:scale-95 shadow-xl">
                      <Lock className="w-12 h-12 text-purple-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mot de passe</span>
                   </button>
                </div>
              )}

              {mode === 'pin' && (
                <div className="flex flex-col items-center space-y-8 animate-in zoom-in">
                   <div className="flex items-center justify-between w-full">
                      <button onClick={() => setMode('selection')} className="p-3 bg-slate-800 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                      <h3 className="text-lg font-black italic uppercase">Code PIN (0000)</h3>
                      <div className="w-10" />
                   </div>
                   <div className="flex gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full border-2 border-yellow-500/50 transition-all duration-300 ${pin.length > i ? 'bg-yellow-500 shadow-[0_0_15px_#ca8a04]' : ''}`} />
                      ))}
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      {[1,2,3,4,5,6,7,8,9, 'C', 0, 'OK'].map((n) => (
                        <button 
                          key={n.toString()}
                          onClick={() => {
                            if (n === 'C') setPin('');
                            else if (n === 'OK') handlePinSubmit();
                            else if (pin.length < 4) {
                                setPin(prev => prev + n);
                                if (window.navigator.vibrate) window.navigator.vibrate(10);
                            }
                          }}
                          className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-xl font-black hover:bg-yellow-600 transition-all active:scale-90"
                        >
                          {n}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {mode === 'gesture' && (
                <div className="flex flex-col items-center animate-in zoom-in">
                   <div className="flex items-center justify-between w-full mb-6">
                      <button onClick={() => setMode('selection')} className="p-3 bg-slate-800 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                      <h3 className="text-lg font-black italic uppercase">Schéma Tactile</h3>
                      <div className="w-10" />
                   </div>
                   <GestureLock onComplete={() => handleSuccess('gesture')} onCancel={() => setMode('selection')} />
                </div>
              )}

              {mode === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in slide-in-from-right-4">
                   <div className="flex items-center justify-between w-full">
                      <button onClick={() => setMode('selection')} className="p-3 bg-slate-800 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                      <h3 className="text-lg font-black italic uppercase">Accès Admin</h3>
                      <div className="w-10" />
                   </div>
                   <div className="space-y-4">
                      <div className="relative">
                         <input 
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-[24px] p-6 font-bold text-white outline-none focus:border-purple-500 text-center"
                           placeholder="admin"
                         />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">
                            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                         </button>
                      </div>
                      <button type="submit" className="w-full py-6 bg-purple-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Connexion</button>
                   </div>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest text-center opacity-50">
           Architecture AESCOMPT • Protocole FIDO2-Secure
        </p>
      </div>
    </div>
  );
};

export default Auth;
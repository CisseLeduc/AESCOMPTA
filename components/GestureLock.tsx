
import React, { useState, useRef, useEffect } from 'react';

interface GestureLockProps {
  onComplete: (pattern: string) => void;
  onCancel: () => void;
  title?: string;
}

const GestureLock: React.FC<GestureLockProps> = ({ onComplete, onCancel, title = "Dessinez votre schéma" }) => {
  const [nodes, setNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.TouchEvent | React.MouseEvent, index: number) => {
    setIsDrawing(true);
    setNodes([index]);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent, index: number) => {
    if (!isDrawing) return;
    if (!nodes.includes(index)) {
      setNodes([...nodes, index]);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }
  };

  const handleEnd = () => {
    if (nodes.length >= 3) {
      onComplete(nodes.join('-'));
    } else if (nodes.length > 0) {
      // Trop court
      setNodes([]);
    }
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-2">
      <div 
        ref={containerRef}
        className="grid grid-cols-3 gap-8 p-10 bg-slate-950/60 rounded-[56px] border border-slate-800 shadow-3xl select-none touch-none"
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            onMouseDown={(e) => handleStart(e, i)}
            onMouseEnter={(e) => handleMove(e, i)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStart(e, i);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const element = document.elementFromPoint(touch.clientX, touch.clientY);
              const index = element?.getAttribute('data-index');
              if (index !== null && index !== undefined) handleMove(e, parseInt(index));
            }}
            data-index={i}
            className={`w-16 h-16 rounded-full border-4 transition-all duration-300 flex items-center justify-center relative ${
              nodes.includes(i) 
                ? 'bg-yellow-500 border-white scale-125 shadow-[0_0_30px_rgba(234,179,8,0.6)] z-10' 
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${nodes.includes(i) ? 'bg-black' : 'bg-slate-600'}`} />
          </div>
        ))}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connectez au moins 3 points</p>
    </div>
  );
};

export default GestureLock;

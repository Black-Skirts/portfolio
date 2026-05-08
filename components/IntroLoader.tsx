
import React, { useState, useEffect, useMemo } from 'react';

interface IntroLoaderProps {
  onComplete: () => void;
}

interface Particle {
  id: number;
  val: string;
  isKey: boolean;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  delay: number;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Swarm, 1: Highlight, 2: Gather, 3: Final, 4: Exit
  const [isVisible, setIsVisible] = useState(true);

  const particles = useMemo(() => {
    const p: Particle[] = [];
    const keys = ['3', '6', '9'];
    
    for (let i = 0; i < 100; i++) {
      const isKey = i < 15;
      const keyVal = isKey ? keys[i % 3] : Math.floor(Math.random() * 10).toString();
      
      let tx = 50;
      let ty = 50;
      // Specific targets for center "369"
      if (i === 0) { tx = 44; ty = 50; }
      else if (i === 1) { tx = 50; ty = 50; }
      else if (i === 2) { tx = 56; ty = 50; }
      
      p.push({
        id: i,
        val: keyVal,
        isKey: keys.includes(keyVal),
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        targetX: tx,
        targetY: ty,
        delay: Math.random() * 600,
      });
    }
    return p;
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3000),
      setTimeout(() => setStage(4), 3800),
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-black overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${stage === 4 ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-full h-full">
        {particles.map((p, idx) => {
          const isLogoPart = idx < 3;
          const isKey = p.isKey && stage >= 1;
          const isGathering = stage >= 2 && isLogoPart;
          const isFading = (stage >= 1 && !p.isKey) || (stage >= 2 && p.isKey && !isLogoPart);

          return (
            <div
              key={p.id}
              className="absolute transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none flex items-center justify-center"
              style={{
                left: `${isGathering ? p.targetX : p.initialX}%`,
                top: `${isGathering ? p.targetY : p.initialY}%`,
                transform: `translate(-50%, -50%) scale(${isGathering ? 1.6 : (isKey ? 1.1 : 0.7)})`,
                opacity: isFading ? 0 : (isKey ? 1 : 0.1),
                color: isKey ? '#FFFFFF' : '#444444',
                fontSize: isGathering ? 'clamp(60px, 10vw, 140px)' : 'clamp(16px, 2vw, 32px)',
                fontWeight: isKey ? 900 : 400,
                zIndex: isKey ? 50 : 10,
                transitionDelay: stage === 2 ? '0ms' : `${p.delay}ms`
              }}
            >
              {p.val}
            </div>
          );
        })}

        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${stage >= 3 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-90 blur-xl pointer-events-none'}`}>
          <span className="text-[clamp(80px,12vw,180px)] font-black text-white tracking-tighter">SML.</span>
        </div>
      </div>
    </div>
  );
};

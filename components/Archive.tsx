
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GridContainer } from './GridContainer';

// --- Individual Particle Component ---
const DollarBill: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const settings = useMemo(() => ({
    startRot: Math.random() * 60 - 30,
    endRot: Math.random() * 40 - 20,
    driftX: (Math.random() - 0.5) * 800,
    peakY: -(200 + Math.random() * 300),
    endY: window.innerHeight - y + 60 + Math.random() * 40,
    duration: 2.5 + Math.random() * 1,
    scale: 0.8 + Math.random() * 0.4,
  }), []);

  return (
    <div
      className="fixed pointer-events-none will-change-transform opacity-0 animate-bill-fall z-[9999]"
      style={{
        left: x,
        top: y,
        '--start-rot': `${settings.startRot}deg`,
        '--end-rot': `${settings.endRot}deg`,
        '--drift-x': `${settings.driftX}px`,
        '--peak-y': `${settings.peakY}px`,
        '--end-y': `${settings.endY}px`,
        '--scale': settings.scale,
        animationDuration: `${settings.duration}s`
      } as React.CSSProperties}
    >
      <img 
        src="/images/archive/dollar.jpg" 
        className="w-[280px] h-auto rounded-sm"
        alt="money"
      />
    </div>
  );
};

// --- Digital Film Strip Component ---
const RollingDigit: React.FC<{ value: number }> = ({ value }) => {
  const digits = useMemo(() => {
    const d = [];
    for (let i = 0; i < 60; i++) d.push(i.toString().padStart(2, '0'));
    return ["59", ...d, "00", "01"];
  }, []);

  const targetIndex = value + 1;

  return (
    <div className="relative h-[1em] overflow-visible w-[1.12em] flex justify-center tracking-[-0.02em]">
      <div 
        className="absolute inset-x-[-20%] -top-[2em] -bottom-[2em] z-10 pointer-events-none" 
        style={{
          background: 'linear-gradient(to bottom, #313131 0%, rgba(49, 49, 49, 0) 40%, rgba(49, 49, 49, 0) 60%, #313131 100%)'
        }}
      />
      
      <div 
        className="flex flex-col items-center transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateY(-${targetIndex}em)` }}
      >
        {digits.map((d, i) => (
          <div 
            key={`${d}-${i}`} 
            className={`h-[1em] flex items-center justify-center transition-colors duration-500 ${i === targetIndex ? 'text-[#5B5B5B]' : 'text-[#3C3C3C]'}`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Archive Component ---
export const Archive: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [moneyList, setMoneyList] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const nextId = useRef(0);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      setNow(new Date());
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isHovering) return;
    const interval = setInterval(() => {
      if (!mousePos.current) return;
      setMoneyList(prev => [...prev.slice(-40), {
        id: nextId.current++,
        x: mousePos.current!.x,
        y: mousePos.current!.y,
      }]);
    }, 80);
    return () => clearInterval(interval);
  }, [isHovering]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  };

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const totalSeconds = (now.getTime() - startOfDay.getTime()) / 1000;

  // Use continuous cumulative angles to prevent the "spin-back" effect
  const sAngle = totalSeconds * 6;
  const mAngle = (totalSeconds / 60) * 6;
  const hAngle = (totalSeconds / 3600) * 30;

  return (
    <section 
      className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden pt-12"
    >
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {moneyList.map((m) => (
          <DollarBill key={m.id} x={m.x} y={m.y} />
        ))}
      </div>

      <GridContainer className="relative flex flex-col items-center">
        <div 
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative w-full max-w-[660px] aspect-[1.25/1] bg-[#313131] border border-white/5 rounded-[330px] flex items-center justify-center overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.9)] transform translate-y-24 cursor-crosshair group"
        >
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <div className="flex items-center justify-center gap-0 text-[clamp(110px,22vw,220px)] font-medium tabular-nums leading-none transform -translate-x-[0.03em]">
              <div className="text-[#5B5B5B] w-[1.12em] flex items-center justify-center tracking-[-0.08em]">
                {now.getHours().toString().padStart(2, '0')}
              </div>
              <span className="text-[#5B5B5B] flex items-center justify-center px-[0.02em] mb-[0.1em] opacity-100 tracking-normal">:</span>
              <RollingDigit value={now.getMinutes()} />
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center z-10 pointer-events-none">
            <div 
              className="absolute w-[5px] h-[28%] bg-[#ECECEC] origin-bottom bottom-1/2 rounded-full shadow-2xl will-change-transform"
              style={{ transform: `rotate(${hAngle}deg)` }}
            />
            <div 
              className="absolute w-[5px] h-[42%] bg-[#ECECEC] origin-bottom bottom-1/2 rounded-full shadow-2xl will-change-transform"
              style={{ transform: `rotate(${mAngle}deg)` }}
            />
            <div 
              className="absolute w-[3px] h-[50%] bg-[#FF0000] origin-bottom bottom-1/2 rounded-full shadow-2xl will-change-transform"
              style={{ 
                transform: `rotate(${sAngle}deg)`,
                bottom: 'calc(50% - 7%)',
                transformOrigin: '50% 86%'
              }}
            />
            <div className="w-4 h-4 bg-[#FF0000] rounded-full z-20 shadow-2xl" />
          </div>
        </div>

        <div 
          className={`mt-32 pb-12 text-center transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="text-[20px] font-medium tracking-normal text-white leading-none antialiased transform-gpu">
            Time is Gold...
          </p>
        </div>
      </GridContainer>

      <style>{`
        @keyframes bill-fall {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(calc(var(--scale) * 0.5)) rotate(var(--start-rot));
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }
          8% {
            opacity: 1;
          }
          38% {
            transform: translate(calc(-50% + var(--drift-x) * 0.4), calc(-50% + var(--peak-y))) scale(var(--scale)) rotate(calc(var(--start-rot) + 90deg));
            animation-timing-function: cubic-bezier(0.3, 0, 0.6, 0.8);
          }
          80% {
            transform: translate(calc(-50% + var(--drift-x)), calc(-50% + var(--end-y))) scale(var(--scale)) rotate(var(--end-rot));
            opacity: 1;
            animation-timing-function: linear;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--drift-x)), calc(-50% + var(--end-y))) scale(var(--scale)) rotate(var(--end-rot));
          }
        }
        .animate-bill-fall {
          animation: bill-fall linear forwards;
        }
      `}</style>
    </section>
  );
};


import React, { useEffect, useRef, useCallback } from 'react';
import { SETTINGS, LABELS } from './constants';
import { Point3D, OrbitConfig, Label } from './types';

const normalize = (p: Point3D): Point3D => {
  const mag = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  return { x: p.x / mag, y: p.y / mag, z: p.z / mag };
};

const cross = (a: Point3D, b: Point3D): Point3D => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitsRef = useRef<OrbitConfig[]>([]);
  const labelsRef = useRef<Label[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cursorRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const frameIdRef = useRef<number>(0);
  const animationStartTimeRef = useRef<number>(0);

  // Reverted to original rotation values to maintain the desired perspective
  const INITIAL_ROT_Y = -Math.PI * 0.45;
  const INITIAL_ROT_X = 0.1;

  const initSimulation = useCallback(() => {
    const orbits: OrbitConfig[] = [];
    const sphereRadius = SETTINGS.sphereRadius;

    const normals = [
      normalize({ x: 1, y: 0.2, z: 0.1 }),
      normalize({ x: 0.1, y: 1, z: 0.2 }),
      normalize({ x: -0.5, y: -0.5, z: 1 }),
      normalize({ x: 0.8, y: -0.8, z: 0.3 }),
      normalize({ x: -0.2, y: 0.7, z: -0.6 }),
    ];

    for (let i = 0; i < SETTINGS.orbitCount; i++) {
      const normal = normals[i % normals.length];
      let temp = { x: 1, y: 0, z: 0 };
      if (Math.abs(normal.x) > 0.9) temp = { x: 0, y: 1, z: 0 };
      const u = normalize(cross(normal, temp));
      const v = cross(normal, u);

      orbits.push({ radius: sphereRadius, normal, u, v });
    }
    orbitsRef.current = orbits;

    const labels: Label[] = LABELS.map((text, idx) => ({
      text,
      orbitIndex: idx % orbits.length,
      t: (idx / LABELS.length),
      speed: 1,
    }));
    labelsRef.current = labels;
  }, []);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    cursorRef.current.targetX = e.clientX;
    cursorRef.current.targetY = e.clientY;
  };

  useEffect(() => {
    initSimulation();
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    animationStartTimeRef.current = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / (dpr * 2);
      const centerY = height / (dpr * 2);

      const elapsedTime = time - animationStartTimeRef.current;
      const sphereEntryProgress = Math.min(1, elapsedTime / 1200);
      const sphereScale = easeOutCubic(sphereEntryProgress);
      const orbitAlphaProgress = Math.max(0, Math.min(1, (elapsedTime - 500) / 1000));

      const loopTime = elapsedTime % SETTINGS.loopDuration;
      const progress = loopTime / SETTINGS.loopDuration;
      
      const autoRotY = progress * Math.PI * 2;
      const autoRotX = Math.sin(progress * Math.PI * 2) * 0.1;
      
      const patternLength = SETTINGS.dashStyle[0] + SETTINGS.dashStyle[1];
      const dashOffset = progress * 100 * patternLength;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const rotY = autoRotY + INITIAL_ROT_Y - mouseRef.current.x * 0.85;
      const rotX = autoRotX + INITIAL_ROT_X + mouseRef.current.y * 0.85;

      // Smoothing for custom cursor (stronger interpolation)
      cursorRef.current.x += (cursorRef.current.targetX - cursorRef.current.x) * 0.08;
      cursorRef.current.y += (cursorRef.current.targetY - cursorRef.current.y) * 0.08;

      // Fill with solid dark background
      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(0, 0, width, height);
      
      ctx.save();
      ctx.scale(dpr, dpr);

      const project = (p: Point3D): { x: number; y: number; z: number; scale: number } => {
        const scaledP = { x: p.x * sphereScale, y: p.y * sphereScale, z: p.z * sphereScale };
        let x = scaledP.x * Math.cos(rotY) + scaledP.z * Math.sin(rotY);
        let z = -scaledP.x * Math.sin(rotY) + scaledP.z * Math.cos(rotY);
        let y = scaledP.y * Math.cos(rotX) - z * Math.sin(rotX);
        z = scaledP.y * Math.sin(rotX) + z * Math.cos(rotX);
        const scale = SETTINGS.fov / (SETTINGS.fov + z);
        return { x: centerX + x * scale, y: centerY + y * scale, z, scale };
      };

      const processedLabels = labelsRef.current.map((label, idx) => {
        const orbit = orbitsRef.current[label.orbitIndex];
        const currentT = (label.t + progress) % 1;
        const angle = currentT * Math.PI * 2;
        const p3d = {
          x: orbit.radius * (Math.cos(angle) * orbit.u.x + Math.sin(angle) * orbit.v.x),
          y: orbit.radius * (Math.cos(angle) * orbit.u.y + Math.sin(angle) * orbit.v.y),
          z: orbit.radius * (Math.cos(angle) * orbit.u.z + Math.sin(angle) * orbit.v.z),
        };
        
        const groupIndex = Math.floor(idx / 3);
        const labelDelay = 700 + groupIndex * 250; 
        const labelAppearProgress = Math.max(0, Math.min(1, (elapsedTime - labelDelay) / 500));
        const labelScale = labelAppearProgress > 0 ? easeOutBack(labelAppearProgress) : 0;
        const labelAlpha = Math.min(1, labelAppearProgress * 1.5);

        return { ...label, p3d, ...project(p3d), appearScale: labelScale, appearAlpha: labelAlpha };
      });

      const drawTechnicalLines = (labels: any[]) => {
        const center = project({ x: 0, y: 0, z: 0 });
        
        // Draw connection lines from center to labels
        labels.forEach(l => {
          if (l.appearScale < 0.1) return;
          
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([2, 4]); // Dotted lines for technical feel
          const depthAlpha = l.z > 0 ? 0.2 : 0.45;
          ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha * l.appearAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(l.x, l.y);
          ctx.stroke();
          ctx.restore();
        });

        // Draw central point
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.restore();
      };

      const drawOrbits = (isFront: boolean) => {
        if (orbitAlphaProgress <= 0) return;
        ctx.setLineDash(SETTINGS.dashStyle);
        ctx.lineDashOffset = dashOffset;
        orbitsRef.current.forEach((orbit, idx) => {
          const steps = 140;
          for (let j = 0; j < steps; j++) {
            const a1 = (j / steps) * Math.PI * 2;
            const a2 = ((j + 1) / steps) * Math.PI * 2;
            const p1 = {
              x: orbit.radius * (Math.cos(a1) * orbit.u.x + Math.sin(a1) * orbit.v.x),
              y: orbit.radius * (Math.cos(a1) * orbit.u.y + Math.sin(a1) * orbit.v.y),
              z: orbit.radius * (Math.cos(a1) * orbit.u.z + Math.sin(a1) * orbit.v.z),
            };
            const p2 = {
              x: orbit.radius * (Math.cos(a2) * orbit.u.x + Math.sin(a2) * orbit.v.x),
              y: orbit.radius * (Math.cos(a2) * orbit.u.y + Math.sin(a2) * orbit.v.y),
              z: orbit.radius * (Math.cos(a2) * orbit.u.z + Math.sin(a2) * orbit.v.z),
            };
            const proj1 = project(p1);
            const proj2 = project(p2);
            const avgZ = (proj1.z + proj2.z) / 2;
            if (isFront !== (avgZ < 0)) continue;
            const zNorm = (avgZ + SETTINGS.sphereRadius * sphereScale) / (2 * SETTINGS.sphereRadius * sphereScale || 1);
            const alpha = SETTINGS.opacityRange[1] - (zNorm * (SETTINGS.opacityRange[1] - SETTINGS.opacityRange[0]));
            const finalAlpha = Math.max(0.1, alpha * (isFront ? 1 : 0.95)) * orbitAlphaProgress;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${finalAlpha})`;
            // Make two orbits (index 1 and 3) thicker (2.4 instead of 0.6)
            const baseWidth = (idx === 1 || idx === 3) ? 2.4 : 0.6;
            ctx.lineWidth = baseWidth * proj1.scale;
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();
          }
        });
      };

      const currentRadius = SETTINGS.sphereRadius * sphereScale;

      drawSphereBase(ctx, centerX, centerY, currentRadius, sphereScale);
      drawOrbits(false);
      drawTechnicalLines(processedLabels.filter(l => l.z > 0)); 
      processedLabels.filter(l => l.z > 0 && l.appearScale !== 0).forEach(l => drawLabel(ctx, l));
      drawSphereSurface(ctx, centerX, centerY, currentRadius, sphereScale);
      drawOrbits(true);
      drawTechnicalLines(processedLabels.filter(l => l.z <= 0));
      processedLabels.filter(l => l.z <= 0 && l.appearScale !== 0).forEach(l => drawLabel(ctx, l));

      // Draw the custom cursor onto the canvas so it's included in recordings
      if (cursorRef.current.targetX !== -100) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cursorRef.current.x, cursorRef.current.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FAFFDC';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    const drawSphereBase = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, scale: number) => {
      if (scale <= 0) return;
      ctx.save();
      // Transparent base, only outline in surface
      ctx.restore();
    };

    const drawSphereSurface = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, scale: number) => {
      if (scale <= 0) return;
      ctx.save();
      
      // Peripheral outline
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const drawLabel = (ctx: CanvasRenderingContext2D, label: any) => {
      const depthAlpha = label.z > 0 ? 0.35 : 1.0; 
      const finalAlpha = depthAlpha * label.appearAlpha;
      
      const baseFontSize = 13;
      const perspectiveScale = 0.25 + (label.scale * 0.75);
      const fontSize = baseFontSize * perspectiveScale * label.appearScale;
      
      ctx.save();
      ctx.translate(label.x, label.y);
      ctx.font = `600 ${fontSize}px 'Google Sans Flex', system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
      ctx.fillText(label.text, 0, 0);
      ctx.restore();
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initSimulation, handleResize]);

  return (
    <div className="relative w-screen h-screen bg-[#1C1C1C] overflow-hidden flex items-center justify-center cursor-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default App;

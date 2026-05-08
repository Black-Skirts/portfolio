
import React, { useEffect, useRef } from 'react';

interface Point3D { x: number; y: number; z: number }
interface OrbitConfig { radius: number; normal: Point3D; u: Point3D; v: Point3D }
interface LabelItem { text: string; orbitIndex: number; t: number }

const LABELS = ['Klik', 'Ninehire', 'Gigmon', 'Loop AI', 'Jobkorea', 'Bossmon', 'Jobplanet', 'Nooc', 'Gamejob', 'Albamon'];
const FOV = 1500;
const DASH_STYLE = [1, 3];
const OPACITY_RANGE: [number, number] = [0.4, 0.7];
const LOOP_DURATION = 30000;
const ORBIT_COUNT = 5;
const INITIAL_ROT_Y = -Math.PI * 0.45;
const INITIAL_ROT_X = 0.1;

const normalize = (p: Point3D): Point3D => {
  const mag = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  return { x: p.x / mag, y: p.y / mag, z: p.z / mag };
};
const cross = (a: Point3D, b: Point3D): Point3D => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const NORMALS = (
  [[1, 0.2, 0.1], [0.1, 1, 0.2], [-0.5, -0.5, 1], [0.8, -0.8, 0.3], [-0.2, 0.7, -0.6]] as [number, number, number][]
).map(([x, y, z]) => normalize({ x, y, z }));

export const WxphereCanvas: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let sphereRadius = 280;
    const orbits: OrbitConfig[] = [];
    const labels: LabelItem[] = [];
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const buildSim = (radius: number) => {
      sphereRadius = radius;
      orbits.length = 0;
      for (let i = 0; i < ORBIT_COUNT; i++) {
        const normal = NORMALS[i % NORMALS.length];
        let temp = { x: 1, y: 0, z: 0 };
        if (Math.abs(normal.x) > 0.9) temp = { x: 0, y: 1, z: 0 };
        const u = normalize(cross(normal, temp));
        const v = cross(normal, u);
        orbits.push({ radius, normal, u, v });
      }
      labels.length = 0;
      LABELS.forEach((text, idx) => {
        labels.push({ text, orbitIndex: idx % ORBIT_COUNT, t: idx / LABELS.length });
      });
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = root.offsetWidth;
      const h = root.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      buildSim(Math.min(w, h) * 0.3);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(root);

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      mouse.targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouse.targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    };
    const onMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };
    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('mouseleave', onMouseLeave);

    const startTime = performance.now();

    const animate = (time: number) => {
      try {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(animate); return; }

      const centerX = root.offsetWidth / 2;
      const centerY = root.offsetHeight / 2;
      const elapsed = time - startTime;

      const sphereScale = easeOutCubic(Math.min(1, elapsed / 1200));
      const orbitAlpha = Math.max(0, Math.min(1, (elapsed - 500) / 1000));
      const progress = (elapsed % LOOP_DURATION) / LOOP_DURATION;
      const autoRotY = progress * Math.PI * 2;
      const autoRotX = Math.sin(progress * Math.PI * 2) * 0.1;
      const dashOff = progress * 100 * (DASH_STYLE[0] + DASH_STYLE[1]);

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const rotY = autoRotY + INITIAL_ROT_Y - mouse.x * 0.85;
      const rotX = autoRotX + INITIAL_ROT_X + mouse.y * 0.85;

      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      const project = (p: Point3D) => {
        const sx = p.x * sphereScale, sy = p.y * sphereScale, sz = p.z * sphereScale;
        let x = sx * Math.cos(rotY) + sz * Math.sin(rotY);
        let z = -sx * Math.sin(rotY) + sz * Math.cos(rotY);
        let y = sy * Math.cos(rotX) - z * Math.sin(rotX);
        z = sy * Math.sin(rotX) + z * Math.cos(rotX);
        const s = FOV / (FOV + z);
        return { x: centerX + x * s, y: centerY + y * s, z, scale: s };
      };

      type P = ReturnType<typeof project> & { text: string; as: number; aa: number };

      const pts: P[] = labels.map((lbl, idx) => {
        const orb = orbits[lbl.orbitIndex];
        if (!orb) return { text: lbl.text, x: centerX, y: centerY, z: 0, scale: 1, as: 0, aa: 0 };
        const ang = ((lbl.t + progress) % 1) * Math.PI * 2;
        const p3 = {
          x: orb.radius * (Math.cos(ang) * orb.u.x + Math.sin(ang) * orb.v.x),
          y: orb.radius * (Math.cos(ang) * orb.u.y + Math.sin(ang) * orb.v.y),
          z: orb.radius * (Math.cos(ang) * orb.u.z + Math.sin(ang) * orb.v.z),
        };
        const delay = 700 + Math.floor(idx / 3) * 250;
        const ap = Math.max(0, Math.min(1, (elapsed - delay) / 500));
        return { text: lbl.text, ...project(p3), as: ap > 0 ? easeOutBack(ap) : 0, aa: Math.min(1, ap * 1.5) };
      });

      const drawLines = (list: P[]) => {
        const ctr = project({ x: 0, y: 0, z: 0 });
        list.forEach(l => {
          if (l.as < 0.1) return;
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = `rgba(255,255,255,${(l.z > 0 ? 0.2 : 0.45) * l.aa})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(ctr.x, ctr.y);
          ctx.lineTo(l.x, l.y);
          ctx.stroke();
          ctx.restore();
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(ctr.x, ctr.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.restore();
      };

      const drawOrbits = (front: boolean) => {
        if (orbitAlpha <= 0) return;
        ctx.setLineDash(DASH_STYLE);
        ctx.lineDashOffset = dashOff;
        const R = sphereRadius * sphereScale;
        orbits.forEach((orb, idx) => {
          const steps = 140;
          for (let j = 0; j < steps; j++) {
            const a1 = (j / steps) * Math.PI * 2;
            const a2 = ((j + 1) / steps) * Math.PI * 2;
            const pt = (a: number) => ({
              x: orb.radius * (Math.cos(a) * orb.u.x + Math.sin(a) * orb.v.x),
              y: orb.radius * (Math.cos(a) * orb.u.y + Math.sin(a) * orb.v.y),
              z: orb.radius * (Math.cos(a) * orb.u.z + Math.sin(a) * orb.v.z),
            });
            const p1 = project(pt(a1));
            const p2 = project(pt(a2));
            const avgZ = (p1.z + p2.z) / 2;
            if (front !== (avgZ < 0)) continue;
            const zN = (avgZ + R) / (2 * R || 1);
            const al = OPACITY_RANGE[1] - zN * (OPACITY_RANGE[1] - OPACITY_RANGE[0]);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.1, al * (front ? 1 : 0.95)) * orbitAlpha})`;
            ctx.lineWidth = ((idx === 1 || idx === 3) ? 2.4 : 0.6) * p1.scale;
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      };

      const drawLabel = (l: P) => {
        if (l.as <= 0) return;
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.font = `600 ${13 * (0.25 + l.scale * 0.75) * l.as}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255,255,255,${(l.z > 0 ? 0.35 : 1.0) * l.aa})`;
        ctx.fillText(l.text, 0, 0);
        ctx.restore();
      };

      const R = sphereRadius * sphereScale;

      drawOrbits(false);
      drawLines(pts.filter(l => l.z > 0));
      pts.filter(l => l.z > 0).forEach(drawLabel);

      ctx.save();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      drawOrbits(true);
      drawLines(pts.filter(l => l.z <= 0));
      pts.filter(l => l.z <= 0).forEach(drawLabel);

      ctx.restore();
      } catch (e) { /* keep loop alive on render errors */ }
      rafId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Use RAF to guarantee layout is complete before reading dimensions
    rafId = requestAnimationFrame(() => {
      handleResize();
      rafId = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      root.removeEventListener('mousemove', onMouseMove);
      root.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="bg-[#1C1C1C] rounded-[20px] overflow-hidden select-none"
      style={{ height: '820px', position: 'relative' }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </div>
  );
};

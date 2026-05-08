
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GridContainer } from './GridContainer';
import { PROJECTS } from '../constants';
import { Project } from '../types';

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?';
const CELL = 18;
const FONT_SIZE = 12;

const extractColors = (src: string): Promise<string[]> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 30;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const colors: string[] = [];
      for (let i = 0; i < data.length; i += 4 * 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 230 && g > 230 && b > 230) continue;
        colors.push(`rgb(${r},${g},${b})`);
      }
      resolve(colors.length > 0 ? colors : ['rgb(20,20,20)']);
    };
    img.onerror = () => resolve(['rgb(20,20,20)']);
    img.src = src;
  });

// Reveal animation: clear cells one by one to expose new page
const startReveal = (canvas: HTMLCanvasElement) => {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cols = Math.ceil(w / CELL);
  const rows = Math.ceil(h / CELL);
  const ctx = canvas.getContext('2d')!;

  const indices = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const REVEAL_MS = 800;
  const BATCHES = 35;
  const batchSize = Math.ceil(indices.length / BATCHES);
  let removed = 0;

  const step = () => {
    indices.slice(removed, removed + batchSize).forEach(idx => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      ctx.clearRect(c * CELL, r * CELL, CELL * dpr, CELL * dpr);
    });
    removed += batchSize;
    if (removed < indices.length) {
      setTimeout(step, REVEAL_MS / BATCHES);
    } else {
      canvas.parentElement?.remove();
    }
  };
  step();
};

const hexToRgb = (hex: string): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgb(${r},${g},${b})`;
};

const dominantColor = (colors: string[]): string => {
  if (colors.length === 0) return 'rgb(20,20,20)';
  const freq: Record<string, { count: number; r: number; g: number; b: number }> = {};
  colors.forEach(c => {
    const m = c.match(/\d+/g)!;
    const r = Math.round(+m[0] / 32) * 32;
    const g = Math.round(+m[1] / 32) * 32;
    const b = Math.round(+m[2] / 32) * 32;
    const key = `${r},${g},${b}`;
    if (!freq[key]) freq[key] = { count: 0, r: 0, g: 0, b: 0 };
    freq[key].count++;
    freq[key].r += +m[0]; freq[key].g += +m[1]; freq[key].b += +m[2];
  });
  const best = Object.values(freq).sort((a, b) => b.count - a.count)[0];
  return `rgb(${Math.round(best.r / best.count)},${Math.round(best.g / best.count)},${Math.round(best.b / best.count)})`;
};

const contrastColor = (rgb: string): string => {
  const m = rgb.match(/\d+/g)!;
  const lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
  return lum > 128 ? 'rgb(20,20,20)' : 'rgb(235,235,235)';
};

interface TransitionState {
  src: string;
  colors: string[];
  origin: { x: number; y: number };
}

const TransitionOverlay: React.FC<{ state: TransitionState; onDone: () => void }> = ({ state, onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const doneCalledRef = useRef(false);

  const bgColor = dominantColor(state.colors);
  const fgColor = contrastColor(bgColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    const total = cols * rows;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.font = `bold ${FONT_SIZE}px monospace`;

    type Cell = { x: number; y: number; char: string; active: boolean };
    const grid: Cell[] = Array.from({ length: total }, (_, i) => ({
      x: (i % cols) * CELL + 3,
      y: Math.floor(i / cols) * CELL + FONT_SIZE,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      active: false,
    }));

    const ox = state.origin.x;
    const oy = state.origin.y;
    const order = Array.from({ length: total }, (_, i) => i).sort((a, b) => {
      const ax = (a % cols) * CELL + CELL / 2, ay = Math.floor(a / cols) * CELL + CELL / 2;
      const bx = (b % cols) * CELL + CELL / 2, by = Math.floor(b / cols) * CELL + CELL / 2;
      return Math.hypot(ax - ox, ay - oy) - Math.hypot(bx - ox, by - oy);
    });

    const FILL_MS = 800;
    const FILL_BATCHES = 35;
    const HOLD_MS = 600;
    const batchSize = Math.ceil(total / FILL_BATCHES);
    let filled = 0;

    const fillBatch = () => {
      order.slice(filled, filled + batchSize).forEach(idx => {
        const cell = grid[idx];
        cell.active = true;
        ctx.fillStyle = bgColor;
        ctx.fillRect(cell.x - 3, cell.y - FONT_SIZE, CELL, CELL);
        ctx.fillStyle = fgColor;
        ctx.fillText(cell.char, cell.x, cell.y);
      });
      filled += batchSize;
      if (filled < total) {
        setTimeout(fillBatch, FILL_MS / FILL_BATCHES);
      } else {
        setTimeout(() => {
          if (!doneCalledRef.current) {
            doneCalledRef.current = true;
            cancelAnimationFrame(rafRef.current);
            const c = canvasRef.current!;
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
            c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
            wrapper.appendChild(c);
            document.body.appendChild(wrapper);
            setTimeout(() => {
              onDone();
              setTimeout(() => startReveal(c), 80);
            }, 150);
          }
        }, HOLD_MS);
      }
    };
    fillBatch();

    let frame = 0;
    const loop = () => {
      frame++;
      if (frame % 3 === 0) {
        grid.forEach(cell => {
          if (!cell.active) return;
          ctx.fillStyle = bgColor;
          ctx.fillRect(cell.x - 3, cell.y - FONT_SIZE, CELL, CELL);
          cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = fgColor;
          ctx.fillText(cell.char, cell.x, cell.y);
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [bgColor, fgColor, state.origin, onDone]);

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

interface ProjectGridProps {
  onProjectClick: (project: Project) => void;
  activeCategory: string;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ onProjectClick, activeCategory }) => {
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const pendingProject = useRef<Project | null>(null);
  const filteredProjects = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.categories.includes(activeCategory));

  const handleClick = useCallback(async (project: Project, el: HTMLElement) => {
    if (project.externalUrl) {
      window.open(project.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (transition) return;
    const img = el.querySelector('img');
    const rect = img ? img.getBoundingClientRect() : el.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const colors = project.transitionColor
      ? [hexToRgb(project.transitionColor)]
      : await extractColors(project.imageUrl);
    pendingProject.current = project;
    setTransition({ src: project.imageUrl, colors, origin });
  }, [transition]);

  const handleDone = useCallback(() => {
    if (pendingProject.current) onProjectClick(pendingProject.current);
    setTransition(null);
  }, [onProjectClick]);

  return (
    <section className="pb-32">
      {transition && <TransitionOverlay state={transition} onDone={handleDone} />}
      <GridContainer>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-3 gap-y-16 md:gap-y-20 items-start">
          {filteredProjects.map((project) => (
            <div key={project.id} className="col-span-4 md:col-span-4 lg:col-span-3">
              <div
                className={`relative bg-[#F5F5F5] rounded-[20px] overflow-hidden mb-3.5 group ${project.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={(e) => !project.comingSoon && handleClick(project, e.currentTarget)}
              >
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                />
                {project.comingSoon && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-[13px] font-semibold tracking-tight">Coming Soon</span>
                  </div>
                )}
              </div>
              <div className="px-1">
                <h3 className="text-[13px] font-semibold leading-[1.1] mb-1 tracking-tight text-[#121212]">
                  {project.title}
                </h3>
                <p className="text-[13px] font-medium text-[#121212] opacity-60 leading-[1.1] tracking-[-0.01em]">
                  {project.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GridContainer>
    </section>
  );
};

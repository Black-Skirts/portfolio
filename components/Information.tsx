
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';

// 1. Scramble Animation Component
const ScrambledTitle: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const elementRef = useRef<HTMLHeadingElement>(null);

  const startScramble = () => {
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (iterations > (maxIterations / text.length) * index + 2) {
              return text[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('');
      });

      if (iterations >= maxIterations + 10) {
        setDisplayText(text);
        clearInterval(interval);
      }
      iterations++;
    }, 35);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startScramble();
        } else {
          setDisplayText(text.split('').map(c => c === ' ' ? ' ' : SCRAMBLE_CHARS[0]).join(''));
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [text]);

  return <span ref={elementRef} className={className}>{displayText}</span>;
};

// 2. Line Animation Component
const AnimatedLine: React.FC<{ className?: string; delay?: number }> = ({ className = "w-full h-[0.5px] bg-white", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (lineRef.current) observer.observe(lineRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={lineRef}
      className={`${className} transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)]`}
      style={{ 
        width: isVisible ? '100%' : '0%',
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    />
  );
};

// 3. Fade In Up Component
const FadeInUp: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        setIsVisible(entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`${className} transition-all duration-[1000ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};

// 4. Scroll-linked Scale In Component
const ScaleIn: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const [progress, setProgress] = useState(0);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!domRef.current) return;
      const rect = domRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const start = windowHeight; 
      const end = windowHeight * 0.3; 
      const currentProgress = (start - rect.top) / (start - end);
      const clamped = Math.min(Math.max(currentProgress, 0), 1);
      setProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={domRef}
      className={`${className} transition-opacity duration-300 ease-out origin-center will-change-transform`}
      style={{ 
        transform: `scale(${0.75 + (progress * 0.25)})`,
        opacity: progress
      }}
    >
      {children}
    </div>
  );
};

const Clock = () => {
  const [angles, setAngles] = useState({ s: 0, m: 0, h: 0 });

  useEffect(() => {
    let frameId: number;
    const update = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const totalSeconds = (now.getTime() - startOfDay.getTime()) / 1000;

      // Using total seconds elapsed today ensures the angle always increases
      // 360 degrees / 60 seconds = 6 degrees per second
      setAngles({
        s: totalSeconds * 6,
        m: (totalSeconds / 60) * 6,
        h: (totalSeconds / 3600) * 30
      });
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="relative w-full aspect-square border-[0.5px] border-white rounded-full flex items-center justify-center">
      <div className="w-3 h-3 bg-white rounded-full z-10" />
      <div 
        className="absolute w-[3px] h-[25%] bg-white origin-bottom bottom-1/2 rounded-full will-change-transform"
        style={{ transform: `rotate(${angles.h}deg)` }}
      />
      <div 
        className="absolute w-[2px] h-[42%] bg-white origin-bottom bottom-1/2 rounded-full will-change-transform"
        style={{ transform: `rotate(${angles.m}deg)` }}
      />
      <div 
        className="absolute w-[1.5px] h-[52%] rounded-full will-change-transform"
        style={{ 
          transform: `rotate(${angles.s}deg)`,
          backgroundColor: '#ECECEC',
          bottom: 'calc(50% - 5%)',
          transformOrigin: '50% 90.4%'
        }}
      />
    </div>
  );
};

const SERVICE_DATA = {
  first: {
    left: { header: 'Work', items: ['Brand Identity', 'Visual Systems', 'Art Direction', 'Editorial Design', 'Typeface Design', 'UI / UX Design'] },
    right: { header: 'Category', items: ['Entertainment', 'Consumer Goods', 'Broadcasting', 'Fashion & Lifestyle', 'Corporate', 'Digital Product'] },
  },
  second: {
    left: { header: 'Direction', items: ['Brand Strategy', 'Concept Development', 'Visual Language', 'System Thinking', 'Narrative & Tone', 'Experience Design'] },
    right: { header: 'Technology', items: ['Motion Graphic', 'AR / XR', '3D', 'Development', 'Interaction', 'Generative AI'] },
  },
};

const ServiceList = ({ section }: { section: 'first' | 'second' }) => {
  const { left, right } = SERVICE_DATA[section];
  return (
    <div className="grid grid-cols-2 gap-x-8 text-[14px] leading-[1.4] tracking-tight">
      <div className="flex flex-col">
        <p className="font-semibold mb-2 text-white">{left.header}</p>
        <div className="space-y-0.5">
          {left.items.map((item, i) => <p key={i} className="font-medium text-[#A5A5A5]">{item}</p>)}
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-semibold mb-2 text-white">{right.header}</p>
        <div className="space-y-0.5">
          {right.items.map((item, i) => <p key={i} className="font-medium text-[#A5A5A5]">{item}</p>)}
        </div>
      </div>
    </div>
  );
};

const AWARDS_DATA = [
  { award: 'IF Award',            project: 'Pledis Entertainment',            img: '/images/projects/1.jpg', url: 'https://ifdesign.com/en/winner-ranking/project/pledis-entertainment/751205' },
  { award: 'Koto Award',          project: 'Pledis Entertainment',            img: '/images/projects/1.jpg', url: 'https://www.kgd-a.org/2025-laureates/en/pledis-entertainment-corporate-identity-development' },
  { award: 'German Design Award', project: 'Pledis Entertainment',            img: '/images/projects/1.jpg', url: 'https://www.german-design-award.com/en/gallery/detail/corporate-identity/pledis-entertainment' },
  { award: 'German Design Award', project: 'Channel A',                       img: '/images/projects/5.jpg', url: 'https://www.german-design-award.com/en/gallery/detail/corporate-identity/channel-a' },
  { award: 'Red Dot Winner',      project: 'Kaywon Play Sans',                img: '/images/projects/7.jpg', url: 'https://www.red-dot.org/project/kaywon-university-of-art-design-kaywon-play-sans-black-73026' },
  { award: 'Red Dot Winner',      project: 'Kaywon Degree Show in 2021~2023', img: '/images/projects/9.jpeg', url: 'https://www.red-dot.org/project/kaywon-university-of-art-design-kaywon-art-design-festival-kaywon-degree-show-in-2021-2023-73025' },
];

export const Information: React.FC = () => {
  const [isClockHovered, setIsClockHovered] = useState(false);
  const [hoveredAward, setHoveredAward] = useState<number | null>(null);

  const handleAwardClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="pt-32 md:pt-64 pb-32 bg-black text-white min-h-screen">
      <GridContainer>
        {/* Main Statement */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 mb-32">
          <div className="col-span-4 md:col-span-8 lg:col-span-12">
            <FadeInUp>
              <h1 className="text-[clamp(26px,4vw,58px)] font-semibold leading-[1.1] tracking-[-0.01em]">
                SML is an independent designer working at the intersection of brand, interface, and culture.
                Collaborating with forward-thinking teams and individuals, SML builds identities and experiences that are clear, refined, and built to evolve.
              </h1>
            </FadeInUp>
          </div>
        </div>

        {/* Contact & Clock Section */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-3 gap-y-0 mb-48 lg:min-h-[500px]">
          <div className="col-span-4 lg:col-span-3 lg:col-start-1 lg:row-start-1 self-start mb-12 lg:mb-0">
            <div className="mb-4 inline-block">
              <h2 className="text-[20px] font-semibold tracking-tight pb-0 leading-tight">
                Contact
              </h2>
              <AnimatedLine className="h-[0.5px] bg-white w-full" />
            </div>
            
            <FadeInUp>
              <div className="space-y-0 text-[20px] font-medium tracking-tight leading-[1.4] text-white">
                <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr]">
                  <span>Phone</span>
                  <span>010-6683-3588</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr]">
                  <span>E-mail</span>
                  <a href="mailto:Hello@369creative.co" className="hover:opacity-60 transition-opacity">Hello@369creative.co</a>
                </div>
                <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr]">
                  <span>Social</span>
                  <a href="#" className="hover:opacity-60 transition-opacity">Instagram</a>
                </div>
              </div>
            </FadeInUp>
          </div>

          <div className={`hidden lg:block lg:col-span-3 lg:col-start-1 lg:row-start-2 self-end transition-all duration-500 ease-out ${isClockHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="aspect-[1.4/1] bg-[#1a1a1a] rounded-[15px] overflow-hidden mb-3">
               <img 
                src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover opacity-80" 
                alt="Gold bars"
               />
            </div>
            <p className="text-[10px] font-semibold tracking-tight opacity-60">I Know, Your Time is Gold...</p>
          </div>

          <div 
            className="col-span-4 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2 self-start cursor-pointer group"
            onMouseEnter={() => setIsClockHovered(true)}
            onMouseLeave={() => setIsClockHovered(false)}
          >
            <ScaleIn>
              <Clock />
            </ScaleIn>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="pt-0 mb-48">
          <AnimatedLine className="w-full h-[0.5px] bg-white" />
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-3 gap-y-12">
            <div className="col-span-4 md:col-span-4 lg:col-span-6 pt-[16px]">
              <h2 className="text-[clamp(48px,6vw,90px)] font-semibold tracking-tight leading-none">
                <ScrambledTitle text="Practice" />
              </h2>
            </div>
            
            <div className="col-span-4 md:col-span-4 lg:col-span-6 pt-[16px]">
              <FadeInUp>
                <div className="mb-[42px]">
                  <ServiceList section="first" />
                </div>
              </FadeInUp>
              <AnimatedLine className="w-full h-[0.5px] bg-white mb-[16px]" />
              <FadeInUp delay={100}>
                <ServiceList section="second" />
              </FadeInUp>
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div className="pt-0 mb-48 relative">
          <AnimatedLine className="w-full h-[0.5px] bg-white" />
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-3 gap-y-12">
            <div className="col-span-4 md:col-span-4 lg:col-span-6 pt-[16px]">
              <h2 className="text-[clamp(48px,6vw,90px)] font-semibold tracking-tight leading-none">
                <ScrambledTitle text="Awards" />
              </h2>
            </div>
            <div className="col-span-4 md:col-span-4 lg:col-span-6">
              <div>
                {AWARDS_DATA.map((award, i) => (
                  <FadeInUp key={i} delay={i * 40}>
                    <div
                      className="grid grid-cols-2 py-4 text-[13px] font-semibold tracking-tight transition-opacity duration-200 hover:opacity-60 cursor-pointer"
                      onMouseEnter={() => setHoveredAward(i)}
                      onMouseLeave={() => setHoveredAward(null)}
                      onClick={() => handleAwardClick(award.url)}
                    >
                      <span>{award.award}</span>
                      <span className="text-right md:text-left">{award.project}</span>
                    </div>
                    <AnimatedLine className="w-full h-[0.5px] bg-white" />
                  </FadeInUp>
                ))}
              </div>
            </div>
          </div>
          {/* Hover preview image */}
          <div
            className={`absolute right-0 top-16 w-[180px] aspect-square overflow-hidden rounded-[12px] pointer-events-none transition-opacity duration-300 ${hoveredAward !== null ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={hoveredAward !== null ? AWARDS_DATA[hoveredAward].img : ''}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </GridContainer>
    </section>
  );
};

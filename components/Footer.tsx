
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';

interface FooterProps {
  isDark?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark = false }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contactDisplay, setContactDisplay] = useState('Contact Me');
  const [emailDisplay, setEmailDisplay] = useState('leeseungmin.work@gmail.com');
  
  const footerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetContact = 'Contact Me';
  const targetEmail = 'leeseungmin.work@gmail.com';

  const scrambleText = (target: string, setter: (val: string) => void, iterations: number = 20) => {
    let count = 0;
    const interval = setInterval(() => {
      setter(
        target
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (count > (iterations / target.length) * index + 4) {
              return target[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      if (count >= iterations + 8) {
        setter(target);
        clearInterval(interval);
      }
      count++;
    }, 35);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementVisibleHeight = windowHeight - rect.top;
      const isMobile = window.innerWidth < 768;
      const divisor = isMobile ? windowHeight * 0.4 : windowHeight * 0.8;
      const progress = Math.min(Math.max(elementVisibleHeight / divisor, 0), 1);
      setScrollProgress(progress);
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scrambleText(targetContact, setContactDisplay, 20);
            scrambleText(targetEmail, setEmailDisplay, 25);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observerRef.current.observe(footerRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const textPrimaryClass = isDark ? 'text-white' : 'text-black';
  const textSecondaryClass = isDark ? 'text-white/40' : 'text-[#A5A5A5]';
  const textHoverClass = isDark ? 'hover:text-white' : 'hover:text-black';
  const borderClass = isDark ? 'border-white/20' : 'border-black/20';

  return (
    <footer className={`pt-12 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`} ref={footerRef}>
      <GridContainer>
        <div className="mb-8">
          <h2 className={`text-[clamp(44px,5vw,100px)] font-semibold leading-none mb-1 tracking-tighter tabular-nums min-h-[1.1em] ${textPrimaryClass}`}>
            {contactDisplay}
          </h2>
          <a 
            href="mailto:leeseungmin.work@gmail.com" 
            className={`text-[clamp(44px,5vw,100px)] font-semibold leading-none transition-colors tracking-tighter block tabular-nums break-all lg:break-normal min-h-[1.1em] ${textSecondaryClass} ${textHoverClass}`}
          >
            {emailDisplay}
          </a>
        </div>
      </GridContainer>

      {/* Huge full-bleed 369 with Scroll Interaction */}
      <div className="w-full overflow-hidden select-none pointer-events-none mb-0 flex justify-center items-center pr-[3vw] md:pr-[4vw] lg:pr-[3vw]">
        <h1
          className={`text-[48vw] lg:text-[48vw] min-[1440px]:text-[48vw] min-[1920px]:text-[48vw] min-[2560px]:text-[50vw] min-[3840px]:text-[51vw] font-semibold leading-[0.8] tracking-[-0.07em] text-center w-full whitespace-nowrap block pb-[1vw] transition-all duration-100 ease-out will-change-transform ${textPrimaryClass}`}
          style={{
            transform: `scale(${0.85 + (scrollProgress * 0.15)})`,
            opacity: isDark ? 0.05 + (scrollProgress * 0.95) : 0.1 + (scrollProgress * 0.9),
            filter: `blur(${(1 - scrollProgress) * 20}px)`,
          }}
        >
          SML
        </h1>
      </div>

      <GridContainer>
        <div className={`py-8 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 items-end text-[12px] tracking-tight leading-tight ${textPrimaryClass}`}>
          {/* Contact Column */}
          <div className="col-span-4 md:col-span-3 lg:col-span-3 flex flex-col mb-6 md:mb-0">
            <p className="font-semibold mb-0">Contact</p>
            <a href="mailto:leeseungmin.work@gmail.com" className="underline font-medium hover:opacity-50 transition-opacity">
              leeseungmin.work@gmail.com
            </a>
          </div>

          {/* Copyright Column - 3 columns on mobile to leave 1 for Scroll Top */}
          <div className="col-span-3 md:col-span-4 lg:col-start-4 lg:col-span-5 font-medium">
            ©Copyright 2026 leeseungmin.work
          </div>

          {/* Scroll Top Column - 1 column on mobile, aligned right */}
          <div className="col-span-1 md:col-start-8 lg:col-start-9 lg:col-span-4 flex justify-end">
            <button 
              onClick={scrollToTop}
              className="font-medium hover:opacity-50 transition-opacity whitespace-nowrap"
            >
              Scroll Top
            </button>
          </div>
        </div>
      </GridContainer>
    </footer>
  );
};

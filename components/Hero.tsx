
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';
import { CATEGORIES } from '../constants';

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';

interface HeroProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ activeCategory, onCategoryChange }) => {
  const [displayNumber, setDisplayNumber] = useState('0');
  const [displayText, setDisplayText] = useState('Works');
  const sectionRef = useRef<HTMLElement>(null);
  
  const targetNumber = '8';
  const targetText = 'Works';

  const runAnimations = () => {
    let numIterations = 0;
    const maxNumIterations = 12;
    
    const numInterval = setInterval(() => {
      if (numIterations >= maxNumIterations) {
        setDisplayNumber(targetNumber);
        clearInterval(numInterval);
        return;
      }
      const randomChar = Math.floor(Math.random() * 10).toString();
      setDisplayNumber(randomChar);
      numIterations++;
    }, 50);

    let textIterations = 0;
    const maxTextIterations = 18;
    
    const textInterval = setInterval(() => {
      setDisplayText(() => {
        return targetText
          .split('')
          .map((char, index) => {
            if (textIterations > (maxTextIterations / targetText.length) * index + 4) {
              return targetText[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('');
      });

      if (textIterations >= maxTextIterations + 6) {
        setDisplayText(targetText);
        clearInterval(textInterval);
      }
      textIterations++;
    }, 40);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimations();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const CategoryMenu = () => (
    <>
      <span className="text-[#A5A5A5] text-[14px] font-[550] tracking-tight">Category</span>
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-[21px] font-[550] transition-colors tracking-tight ${activeCategory === cat ? 'text-black' : 'text-[#B8B8B8] hover:text-black'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <section className="pt-32 md:pt-64 pb-16" ref={sectionRef}>
      <GridContainer>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 items-baseline">
          {/* "8" remains in col-span-1 */}
          <div className="col-span-1">
            <h1 className="text-[clamp(72px,7vw,150px)] font-semibold leading-[0.8] tabular-nums tracking-tighter">
              {displayNumber}
            </h1>
          </div>

          {/* "Works" text */}
          <div className="col-span-3 md:col-span-7 lg:col-start-4 lg:col-span-9 flex flex-col">
            <h2 className="text-[clamp(72px,7vw,150px)] font-semibold leading-[0.8] tracking-tighter">
              {displayText}
            </h2>
            
            {/* Desktop-only Category menu */}
            <div className="hidden lg:flex mt-8 flex-wrap gap-x-6 gap-y-4 items-center">
              <CategoryMenu />
            </div>
          </div>

          {/* Mobile/Tablet Category menu */}
          <div className="lg:hidden col-span-4 md:col-span-8 mt-12 flex flex-wrap gap-x-6 gap-y-4 items-center">
            <CategoryMenu />
          </div>
        </div>
      </GridContainer>
    </section>
  );
};

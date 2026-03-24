
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';
import { PROJECTS } from '../constants';
import { Project } from '../types';

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';

const ASPECT_RATIOS = [
  'aspect-[1/1.12]',
  'aspect-[1.05/1]',
  'aspect-[1/1.08]',
  'aspect-[1.03/1]',
  'aspect-[1/1.1]',
  'aspect-[1.06/1]',
  'aspect-[1/1.09]',
  'aspect-[1.04/1]',
];

export const News: React.FC<{ onProjectClick: (project: Project) => void }> = ({ onProjectClick }) => {
  const [displayNumber, setDisplayNumber] = useState('0');
  const [displayText, setDisplayText] = useState('News');
  const sectionRef = useRef<HTMLElement>(null);
  
  const targetNumber = '4';
  const targetText = 'News';

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

  // Show only 4 projects as news items based on the reference image
  const newsItems = PROJECTS.slice(0, 4);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-32 md:pt-64 pb-20" ref={sectionRef}>
        <GridContainer>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 items-baseline">
            <div className="col-span-1">
              <h1 className="text-[clamp(72px,7vw,150px)] font-bold leading-[0.8] tabular-nums tracking-tighter">
                {displayNumber}
              </h1>
            </div>

            <div className="col-span-3 md:col-span-7 lg:col-start-4 lg:col-span-9">
              <h2 className="text-[clamp(72px,7vw,150px)] font-bold leading-[0.8] tracking-tighter">
                {displayText}
              </h2>
            </div>
          </div>
        </GridContainer>
      </section>

      {/* Grid Section */}
      <section className="pb-32">
        <GridContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16 items-start">
            {newsItems.map((project, index) => (
              <div 
                key={project.id} 
                className="w-full group cursor-pointer"
                onClick={() => onProjectClick(project)}
              >
                <div className={`${ASPECT_RATIOS[index % ASPECT_RATIOS.length]} bg-[#F5F5F5] rounded-[20px] overflow-hidden mb-3.5`}>
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="px-1">
                  <h3 className="text-[13px] font-bold leading-[1.1] mb-1 tracking-tight text-[#121212]">
                    {project.title}
                  </h3>
                  <p className="text-[11px] text-[#A5A5A5] leading-[1.1] tracking-[-0.01em] font-semibold">
                    {project.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GridContainer>
      </section>
    </div>
  );
};

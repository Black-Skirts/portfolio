
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';
import { Project } from '../types';

const SCRAMBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';

const ScrambledHeader: React.FC<{ text: string }> = ({ text }) => {
  const [display, setDisplay] = useState(text);
  
  useEffect(() => {
    let count = 0;
    const iterations = 20;
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (count > (iterations / text.length) * i + 5) return text[i];
          // Fix: corrected typo in variable name SCRAMRAMBLE_CHARS to SCRAMBLE_CHARS
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('')
      );
      if (count >= iterations + 10) {
        setDisplay(text);
        clearInterval(interval);
      }
      count++;
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <h1 className="text-[clamp(40px,5vw,80px)] font-bold leading-[1.05] tracking-tight mb-12">{display}</h1>;
};

const FadeInImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} bg-[#F5F5F5] rounded-[20px] overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white text-black pt-32 pb-12">
      <GridContainer>
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-bold mb-8 hover:opacity-50 transition-opacity tracking-tight"
        >
          <span className="text-[18px]">←</span> Back to Works
        </button>

        {/* Title Section */}
        <div className="max-w-[1200px] mb-16">
          <ScrambledHeader text={project.title} />
        </div>

        {/* Main Hero Image */}
        <FadeInImage 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full aspect-[16/9] mb-3" 
        />

        {/* Secondary Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <FadeInImage 
            src={`https://picsum.photos/1200/1500?random=${project.id}-1`} 
            alt="detail 1" 
            className="aspect-[3/4]" 
          />
          <FadeInImage 
            src={`https://picsum.photos/1200/1500?random=${project.id}-2`} 
            alt="detail 2" 
            className="aspect-[3/4]" 
          />
        </div>

        {/* Full width stacked images */}
        <FadeInImage 
          src={`https://picsum.photos/1920/1080?random=${project.id}-3`} 
          alt="detail 3" 
          className="w-full aspect-[16/9] mb-24" 
        />

        {/* Information Section - Desktop uses 24-column grid to allow 5/12 and 1.5/12 column spans */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-[repeat(24,minmax(0,1fr))] gap-x-3 gap-y-16 lg:gap-y-0 mb-48 items-start">
          
          {/* Project Overview - Spans 10/24 columns (equivalent to 5/12) */}
          <div className="col-span-4 md:col-span-4 lg:col-span-10 lg:pr-8">
            <h3 className="text-[14px] font-bold mb-1 tracking-tight">Project Overview</h3>
            <div className="text-[14px] leading-[1.5] font-normal tracking-[-0.01em] text-[#404040] space-y-6">
              <p>
                25 years of Google brought the world closer through the power of search. Now, at another pivotal technological turn, an opportunity emerged to define a category. Gemini, the artificial intelligence formerly known as Bard, faced an unexpected challenge. As new competitors entered the category, once-innovative brand codes became generic AI language. At the same time, AI underwent a significant shift—from an invisible force, quietly powering systems behind the scenes, to becoming a tangible presence in everyday life. This shift represented the driving potential to assert Gemini's leadership and connect at a human level with the next kind of workers and learners.
              </p>
              <p>
                Our charge: Make Gemini the Google Magic for a new generation. To manifest this magic, Gemini required a bold reframing—distinct yet seamlessly integrated within Google's ecosystem of products and services. We began by reclaiming the now ubiquitous symbol of AI, the Spark, as an invitation to explore. Just as Gemini activates curiosity, we activate the Spark through immersive motion that initiates exploration, reveals content, and invokes the Gemini magic.
              </p>
              <p>
                The duality and interplay between the human input and magic output sits at the heart of our design system, visualizing Gemini as both a responsive partner and a source of discovery. To fully claim its space, Gemini also needed a system to hero its interface in a way that only Google's legacy makes possible. The result: a confident, pointed visual language celebrating Gemini's helpfulness. We distilled product elements to their essence, focusing on delivering answers and highlighting what matters most to users.
              </p>
            </div>
          </div>

          {/* Credits Group 1 - Starts after a 1-column gap (lg:col-start-13) and spans 3/24 columns (equivalent to 1.5/12) */}
          <div className="col-span-2 md:col-span-2 lg:col-start-13 lg:col-span-3 space-y-10">
            <div>
              <h4 className="text-[14px] font-bold mb-0.5 tracking-tight">Creative Director</h4>
              <ul className="text-[14px] font-normal text-[#404040] space-y-0.5 leading-[1.35]">
                <li>Sang Mun</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5 tracking-tight">BX Designer</h4>
              <ul className="text-[14px] font-normal text-[#404040] space-y-0.5 leading-[1.35]">
                <li>Sang Mun</li>
                <li>Jungeun Shin</li>
                <li>Goeun Park</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5 tracking-tight">BX Designer</h4>
              <ul className="text-[14px] font-normal text-[#404040] space-y-0.5 leading-[1.35]">
                <li>Sang Mun</li>
                <li>Jungeun Shin</li>
                <li>Goeun Park</li>
              </ul>
            </div>
          </div>

          {/* Credits Group 2 - Spans 3/24 columns (equivalent to 1.5/12) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3 space-y-10">
            <div>
              <h4 className="text-[14px] font-bold mb-0.5 tracking-tight">Client</h4>
              <ul className="text-[14px] font-normal text-[#404040] space-y-0.5 leading-[1.35]">
                <li>Sang Mun</li>
                <li>Jungeun Shin</li>
                <li>Goeun Park</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5 tracking-tight">Ceo</h4>
              <ul className="text-[14px] font-normal text-[#404040] space-y-0.5 leading-[1.35]">
                <li>Sang Mun</li>
                <li>Jungeun Shin</li>
                <li>Goeun Park</li>
              </ul>
            </div>
          </div>
        </div>
      </GridContainer>
    </div>
  );
};

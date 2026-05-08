
import React, { useState, useEffect, useRef } from 'react';
import { GridContainer } from './GridContainer';
import { Project, DetailSection, MediaItem, CreditGroup } from '../types';
import { WxphereCanvas } from './WxphereCanvas';

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

  return <h1 className="text-[clamp(40px,5vw,80px)] font-semibold leading-[1.05] tracking-tight mb-12">{display}</h1>;
};

const useFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
};

const FadeInImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
  const { ref, isVisible } = useFadeIn();
  return (
    <div ref={ref} className={`${className} bg-[#F5F5F5] rounded-[20px] overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

const FadeInWrapper: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => {
  const { ref, isVisible } = useFadeIn();
  return (
    <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={style}>
      {children}
    </div>
  );
};

const ClickToPlayVideo: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { ref, isVisible } = useFadeIn();

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  };

  return (
    <div
      ref={ref}
      className={`w-full rounded-[20px] overflow-hidden bg-black relative cursor-pointer transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      onClick={toggle}
    >
      <video ref={videoRef} src={src} className="w-full h-auto block" loop playsInline />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const mediaClass = project.layout === 'contained' ? 'px-[8vw]' : '';

  return (
    <div className="bg-white text-black pt-32 pb-12">
      <GridContainer>
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-semibold mb-8 hover:opacity-50 transition-opacity tracking-tight"
        >
          <span className="text-[18px]">←</span> Back to Works
        </button>

        {/* Title Section */}
        <div className={`max-w-[1200px] mb-16 ${mediaClass}`}>
          <ScrambledHeader text={project.title.replace(/\s*\(\d{4}\)$/, '')} />
        </div>

        {/* Detail Sections */}
        {project.detailSections ? (
          project.detailSections.map((section, i) => (
            <div key={i} className={`${mediaClass} mb-3${i === 3 ? ' mt-[100px]' : ''}`}>
              {section.type === 'image' && (
                <FadeInImage src={section.src} alt={`section-${i}`} className="w-full" />
              )}
              {section.type === 'images' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.srcs.map((src, j) => (
                    <FadeInImage key={j} src={src} alt={`section-${i}-${j}`} className="w-full" />
                  ))}
                </div>
              )}
              {section.type === 'video' && (
                section.clickToPlay
                  ? <ClickToPlayVideo src={section.src} />
                  : <FadeInWrapper className="w-full rounded-[20px] overflow-hidden bg-black">
                      <video src={section.src} className="w-full h-auto block" style={section.scale ? { transform: `scale(${section.scale})` } : undefined} autoPlay loop muted playsInline />
                    </FadeInWrapper>
              )}
              {section.type === 'vimeo' && (
                <FadeInWrapper className="w-full rounded-[20px] overflow-hidden bg-black" style={{ paddingTop: section.aspect ?? '56.25%', position: 'relative' } as React.CSSProperties}>
                  <iframe
                    src={`https://player.vimeo.com/video/${section.id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&pip=0`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%', transform: `translate(-50%, -50%) scale(${section.scale ?? 1})`, transformOrigin: 'center' }}
                  />
                </FadeInWrapper>
              )}
              {section.type === 'media' && (() => {
                const cols = section.items.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
                return (
                  <FadeInWrapper className={`grid ${cols} gap-3`}>
                    {section.items.map((item, j) => (
                      item.kind === 'image'
                        ? <FadeInImage key={j} src={item.src} alt={`media-${i}-${j}`} className="w-full" />
                        : item.kind === 'vimeo'
                        ? <div key={j} className="w-full rounded-[20px] overflow-hidden bg-black" style={{ paddingTop: item.aspect ?? '56.25%', position: 'relative' }}>
                            <iframe
                              src={`https://player.vimeo.com/video/${item.id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&pip=0`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                          </div>
                        : <div key={j} className="w-full rounded-[20px] overflow-hidden bg-black">
                            <video src={item.src} className="w-full h-full object-cover block" autoPlay loop muted playsInline />
                          </div>
                    ))}
                  </FadeInWrapper>
                );
              })()}
              {section.type === 'interactive' && (
                <FadeInWrapper className="w-full">
                  <WxphereCanvas />
                </FadeInWrapper>
              )}
            </div>
          ))
        ) : (
          <>
            <div className={mediaClass}>
              <FadeInImage src={project.imageUrl} alt={project.title} className="w-full aspect-[16/9] mb-3" />
            </div>
            <div className={mediaClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <FadeInImage src={`https://picsum.photos/1200/1500?random=${project.id}-1`} alt="detail 1" className="aspect-[3/4]" />
                <FadeInImage src={`https://picsum.photos/1200/1500?random=${project.id}-2`} alt="detail 2" className="aspect-[3/4]" />
              </div>
            </div>
            <div className={mediaClass}>
              <FadeInImage src={`https://picsum.photos/1920/1080?random=${project.id}-3`} alt="detail 3" className="w-full aspect-[16/9] mb-3" />
            </div>
            {project.videos?.map((url, i) => (
              <div key={i} className={`${mediaClass} mb-3`}>
                <div className="w-full rounded-[20px] overflow-hidden bg-black">
                  <video src={url} className="w-full h-auto block" autoPlay loop muted playsInline />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Information Section */}
        {(project.overview || project.credits) && (
          <div className={`grid grid-cols-4 md:grid-cols-8 lg:grid-cols-[repeat(24,minmax(0,1fr))] gap-x-3 gap-y-16 lg:gap-y-0 mt-16 mb-48 items-start ${mediaClass}`}>

            {/* Project Overview */}
            {project.overview && (
              <div className="col-span-4 md:col-span-4 lg:col-span-10 lg:pr-8">
                <h3 className="text-[14px] font-semibold tracking-tight leading-[1.3] mb-1">Project Overview</h3>
                <div className="text-[14px] leading-[1.5] font-[430] tracking-[-0.01em] text-[#404040] space-y-6">
                  {project.overview.map((para, i) => <p key={i}>{para}</p>)}
                </div>
                {project.overviewKr && (
                  <>
                    <h3 className="text-[14px] font-bold tracking-tight leading-[1.3] mt-6 mb-1">프로젝트 소개</h3>
                    <div className="text-[14px] leading-[1.6] font-[430] tracking-[-0.01em] text-[#404040] space-y-6">
                      {project.overviewKr.map((para, i) => <p key={`kr-${i}`}>{para}</p>)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Credits */}
            {project.credits?.map((group, gi) => (
              <div
                key={gi}
                className={`col-span-2 md:col-span-2 ${gi === 0 ? 'lg:col-start-13 lg:col-span-3' : 'lg:col-span-3'} space-y-6`}
              >
                {group.label && (
                  <div>
                    <h4 className="text-[14px] font-semibold tracking-tight leading-[1.3] mb-0.5">{group.label}</h4>
                    {group.value && (
                      group.valueLink
                        ? <a href={group.valueLink} target="_blank" rel="noopener noreferrer" className="block text-[14px] font-semibold text-[#404040] leading-[1.3] hover:opacity-50 transition-opacity">{group.value}</a>
                        : <p className="text-[14px] font-semibold text-[#404040] leading-[1.3]">{group.value}</p>
                    )}
                  </div>
                )}
                {group.roles.map((role, ri) => (
                  <div key={ri}>
                    <h4 className="text-[14px] font-semibold tracking-tight leading-[1.3] mb-0.5">{role.title}</h4>
                    <ul className="text-[14px] font-[430] text-[#404040] space-y-0.5 leading-[1.35]">
                      {role.names.map((name, ni) => <li key={ni}>{name}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </GridContainer>
    </div>
  );
};

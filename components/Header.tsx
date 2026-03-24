
import React, { useState, useEffect } from 'react';
import { GridContainer } from './GridContainer';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateInfo: () => void;
  onNavigateNews: () => void;
  onNavigateArchive: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigateHome, 
  onNavigateInfo, 
  onNavigateNews, 
  onNavigateArchive,
  currentView 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldBlend, setShouldBlend] = useState(true);

  // Sync blending state with menu state to avoid inversion during transitions
  useEffect(() => {
    if (isOpen) {
      setShouldBlend(false);
    } else {
      // Delay re-enabling blend mode until the slide-up animation (500ms) is complete
      const timer = setTimeout(() => {
        setShouldBlend(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleInfoClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onNavigateInfo();
    setIsOpen(false);
  };

  const handleHomeClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onNavigateHome();
    setIsOpen(false);
  };

  const handleNewsClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onNavigateNews();
    setIsOpen(false);
  };

  const handleArchiveClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onNavigateArchive();
    setIsOpen(false);
  };

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = (fn: () => void) => {
    fn();
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const menuItems = [
    { label: 'Project', action: handleHomeClick },
    { label: 'Information', action: handleInfoClick },
    { label: 'News', action: handleNewsClick },
    { label: 'Archive', action: handleArchiveClick },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 py-6 text-white pointer-events-none transition-all duration-300 ${shouldBlend ? 'mix-blend-difference' : 'mix-blend-normal'}`}>
      <GridContainer className="pointer-events-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 items-center">
          
          <div className="col-span-1">
            <button 
              onClick={handleHomeClick}
              className={`text-[24px] font-bold leading-none tracking-tighter hover:opacity-50 transition-colors ${isOpen ? 'text-black' : 'text-white'}`}
            >
              369.
            </button>
          </div>

          <nav className="hidden lg:flex items-center col-start-4 col-span-5 gap-8 text-[13px] font-medium tracking-tight">
            <button 
              onClick={handleHomeClick}
              className={`hover:opacity-50 transition-opacity ${currentView === 'home' ? 'underline underline-offset-4 decoration-1' : ''}`}
            >
              Project
            </button>
            <button 
              onClick={handleInfoClick}
              className={`hover:opacity-50 transition-opacity ${currentView === 'information' ? 'underline underline-offset-4 decoration-1' : ''}`}
            >
              Information
            </button>
            <button 
              onClick={handleNewsClick}
              className={`hover:opacity-50 transition-opacity ${currentView === 'news' ? 'underline underline-offset-4 decoration-1' : ''}`}
            >
              News
            </button>
            <button 
              onClick={handleArchiveClick}
              className={`hover:opacity-50 transition-opacity ${currentView === 'archive' ? 'underline underline-offset-4 decoration-1' : ''}`}
            >
              Archive
            </button>
          </nav>

          <div className="hidden lg:flex items-center justify-end col-start-9 col-span-4 gap-8 text-[13px] font-medium tracking-tight">
            <a 
              href="https://www.instagram.com/3.6.9.creative/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:opacity-50 transition-opacity"
            >
              Instagram
            </a>
            <a 
              href="https://www.behance.net/esh14123c1f" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:opacity-50 transition-opacity"
            >
              Behance
            </a>
            <a href="mailto:Hello@369creative.co" className="hover:opacity-50 transition-opacity">Hello@369creative.co</a>
          </div>

          <div className="lg:hidden col-start-4 md:col-start-8 flex justify-end">
            <button 
              className="flex flex-col gap-1.5 p-2 z-[70] relative"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'bg-black rotate-45 translate-y-2' : 'bg-white'}`} />
              <span className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'bg-black opacity-0' : 'bg-white'}`} />
              <span className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'bg-black -rotate-45 -translate-y-2' : 'bg-white'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="flex flex-col items-center gap-6 text-[32px] font-bold text-black tracking-tighter">
            {menuItems.map((item, idx) => (
              <div key={item.label} className="overflow-hidden">
                <button 
                  onClick={() => closeMenu(item.action)}
                  className={`block transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                  style={{ transitionDelay: isOpen ? `${idx * 60 + 200}ms` : '0ms' }}
                >
                  {item.label}
                </button>
              </div>
            ))}
            
            <div className={`w-12 h-[0.5px] bg-black/10 my-4 transition-all duration-700 delay-500 ${isOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
            
            <div className={`flex flex-col items-center gap-3 text-[16px] font-medium text-black/60 tracking-wide transition-all duration-700 delay-600 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <a 
                href="https://www.instagram.com/3.6.9.creative/" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setIsOpen(false)}
                className="hover:text-black transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://www.behance.net/esh14123c1f" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setIsOpen(false)}
                className="hover:text-black transition-colors"
              >
                Behance
              </a>
              <a 
                href="mailto:Hello@369creative.co" 
                onClick={() => setIsOpen(false)}
                className="hover:text-black transition-colors"
              >
                Hello@369creative.co
              </a>
            </div>
          </div>
        </div>
      </GridContainer>
    </header>
  );
};

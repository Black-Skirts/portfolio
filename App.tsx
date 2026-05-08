
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectGrid } from './components/ProjectGrid';
import { Footer } from './components/Footer';
import { Information } from './components/Information';
import { News } from './components/News';
import { Archive } from './components/Archive';
import { ProjectDetail } from './components/ProjectDetail';
import { Project } from './types';

type View = 'home' | 'information' | 'news' | 'archive' | 'detail';

function App() {
  const [view, setView] = useState<View>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

  const navigateToDetail = (project: Project) => {
    scrollToTop();
    setSelectedProject(project);
    setView('detail');
  };

  const navigateToHome = () => { scrollToTop(); setView('home'); };
  const navigateToInfo = () => { scrollToTop(); setView('information'); };
  const navigateToNews = () => { scrollToTop(); setView('news'); };
  const navigateToArchive = () => { scrollToTop(); setView('archive'); };

  const isDarkBackground = view === 'information' || view === 'archive';

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-700 ${isDarkBackground ? 'bg-black' : 'bg-white'}`}>
      <Header 
        onNavigateHome={navigateToHome} 
        onNavigateInfo={navigateToInfo} 
        onNavigateNews={navigateToNews}
        onNavigateArchive={navigateToArchive}
        currentView={view} 
      />
      <main>
        {view === 'home' && (
          <>
            <Hero activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            <ProjectGrid onProjectClick={navigateToDetail} activeCategory={activeCategory} />
          </>
        )}
        {view === 'information' && <Information />}
        {view === 'news' && <News onProjectClick={navigateToDetail} />}
        {view === 'archive' && <Archive />}
        {view === 'detail' && selectedProject && (
          <ProjectDetail project={selectedProject} onBack={navigateToHome} />
        )}
      </main>
      <Footer isDark={isDarkBackground} />
    </div>
  );
}

export default App;

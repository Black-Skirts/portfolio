
import React from 'react';
import { GridContainer } from './GridContainer';
import { PROJECTS } from '../constants';
import { Project } from '../types';

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

interface ProjectGridProps {
  onProjectClick: (project: Project) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ onProjectClick }) => {
  return (
    <section className="pb-32">
      <GridContainer>
        {/* Using a 12-column grid to match the Hero and News page structure */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-3 gap-y-16 md:gap-y-20 items-start">
          {PROJECTS.map((project, index) => (
            <div 
              key={project.id} 
              className="col-span-4 md:col-span-4 lg:col-span-3 group cursor-pointer"
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
                <p className="text-[13px] text-[#121212] opacity-60 leading-[1.1] tracking-[-0.01em]">
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

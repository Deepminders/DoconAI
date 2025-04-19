import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsList = ({ projects, filter, isMobile }) => {
  return (
    <div className="mt-[13%] max-[200px]:mt-[60%] max-md:mt-[25%] lg:ml-60 p-4 transition-all duration-300">
      <h1 className="relative flex items-center justify-center text-2xl font-bold mb-4 text-sky-700">
        <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
        <span className="whitespace-nowrap">{filter}</span>
        <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
      </h1>

      <div className="overflow-x-auto">
        <div className="hidden md:flex text-gray-500 border-b-2 border-sky-700 mb-4">
          {['Project Name', 'Status', 'Last Updated', 'Documents', 'Categories', 'Team Members'].map((heading, index) => (
            <div key={index} className="flex-1 py-2 px-4 text-left font-light">
              {heading}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              isMobile={isMobile} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
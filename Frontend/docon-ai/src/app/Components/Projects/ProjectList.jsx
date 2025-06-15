import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsList = ({ projects, filter, isMobile, loading = false, error = null }) => {
  // Handle loading state (if needed at component level)
  if (loading) {
    return (
      <div className="mt-[13%] p-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3 mx-auto"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state (if needed at component level)
  if (error) {
    return (
      <div className="mt-[13%] p-4 text-center text-red-500">
        <div className="text-4xl mb-2">⚠️</div>
        <p>Error: {error}</p>
      </div>
    );
  }

  // Handle empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="mt-[13%] max-[200px]:mt-[60%] max-md:mt-[25%] lg:ml-60 p-4 transition-all duration-300">
        <h1 className="relative flex items-center justify-center text-2xl font-bold mb-4 text-sky-700">
          <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
          <span className="whitespace-nowrap">{filter}</span>
          <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
        </h1>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-gray-300">📂</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
          <p className="text-gray-500">
            {filter === "All Projects" 
              ? "No projects have been created yet." 
              : `No projects found with status "${filter}".`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[13%] max-[200px]:mt-[60%] max-md:mt-[25%] lg:ml-60 p-4 transition-all duration-300">
      <h1 className="relative flex items-center justify-center text-2xl font-bold mb-4 text-sky-700">
        <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
        <span className="whitespace-nowrap">
          {filter} ({projects.length})
        </span>
        <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
      </h1>

      <div className="overflow-x-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex text-gray-500 border-b-2 border-sky-700 mb-4">
          {['Project Name', 'Status', 'Project Lead', 'Start Date', 'End Date', 'Last Updated'].map((heading, index) => (
            <div key={`heading-${index}`} className="flex-1 py-2 px-4 text-left font-light">
              {heading}
            </div>
          ))}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.projectId || project.id} 
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
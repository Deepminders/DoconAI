import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsList = ({ projects, filter, isMobile, loading = false, error = null }) => {
  // Handle loading state (responsive)
  if (loading) {
    return (
      <div className="mt-[660px] sm:mt-[180px] md:mt-[160px] lg:mt-[140px] p-3 sm:p-4 text-center">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded mb-3 sm:mb-4 w-2/3 sm:w-1/3 mx-auto"></div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state (responsive)
  if (error) {
    return (
      <div className="mt-[660px] sm:mt-[180px] md:mt-[160px] lg:mt-[140px] p-3 sm:p-4 text-center text-red-500">
        <div className="text-3xl sm:text-4xl mb-2">⚠️</div>
        <p className="text-sm sm:text-base">Error: {error}</p>
      </div>
    );
  }

  // Handle empty state (responsive)
  if (!projects || projects.length === 0) {
    return (
      <div className="mt-[660px] sm:mt-[180px] md:mt-[160px] lg:mt-[140px]  p-3 sm:p-4 transition-all duration-300">
        {/* Responsive Centered Blue Header */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex-1 h-0.5 bg-blue-600"></div>
          <h1 className="px-3 sm:px-6 text-lg sm:text-xl md:text-2xl font-bold text-blue-600 bg-white text-center">
            {filter}
          </h1>
          <div className="flex-1 h-0.5 bg-blue-600"></div>
        </div>

        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 text-gray-300">📂</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">
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
    <div className="mt-[320px] sm:mt-[180px] md:mt-[200px] lg:mt-[140px] transition-all duration-300">
      {/* Responsive Centered Blue Header with Project Count */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex-1 h-0.5 bg-blue-600"></div>
        <h1 className="px-3 sm:px-6 text-lg sm:text-xl md:text-2xl font-bold text-blue-600 bg-white text-center whitespace-nowrap">
          {filter} ({projects.length})
        </h1>
        <div className="flex-1 h-0.5 bg-blue-600"></div>
      </div>

      <div className="overflow-x-auto">
        {/* Desktop Header (Large screens) */}
        <div className="hidden lg:flex text-gray-500 border-b-2 border-blue-600 mb-4">
          {['Project Name', 'Status', 'Project Lead', 'Start Date', 'End Date'].map((heading, index) => (
            <div key={`heading-${index}`} className="flex-1 py-2 px-4 text-left font-light text-sm xl:text-base">
              {heading}
            </div>
          ))}
        </div>

        {/* Tablet Header (Medium screens) */}
        <div className="hidden md:flex lg:hidden text-gray-500 border-b-2 border-blue-600 mb-4">
          {['Project', 'Status', 'Lead', 'Dates'].map((heading, index) => (
            <div key={`tablet-heading-${index}`} className="flex-1 py-2 px-3 text-left font-light text-sm">
              {heading}
            </div>
          ))}
        </div>

        {/* Mobile Header (Small screens) */}
        <div className="flex md:hidden text-gray-500 border-b-2 border-blue-600 mb-4 px-2">
          <div className="flex-1 py-2 text-left font-light text-sm">
            Projects
          </div>
        </div>

        {/* Responsive Projects List */}
        <div className="space-y-3 sm:space-y-4">
          {projects.map((project, index) => (
            <div
              key={project.projectId || project.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProjectCard
                project={project}
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>

        {/* Responsive Footer */}
        <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-col xs:flex-row items-center justify-between space-y-2 xs:space-y-0 text-center xs:text-left">
            <p className="text-xs sm:text-sm text-gray-500">
              Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ProjectsList;
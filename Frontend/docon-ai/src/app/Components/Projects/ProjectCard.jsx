import React from 'react';
import { useRouter } from 'next/navigation';

const getStatusColor = (status) => {
  const baseClasses = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-all duration-200";
  
  const statusClasses = {
    'In Progress': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20',
    'Completed': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20',
    'Delayed': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20',
    'On Hold': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20',
    'Cancelled': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20',
    'default': 'bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100 hover:ring-blue-700/20'
  };

  return `${baseClasses} ${statusClasses[status] || statusClasses.default}`;
};

const formatProjectDate = (dateString) => {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

const ProjectCard = ({ project, isMobile }) => {
  const router = useRouter();

  if (!project) return null;

  const handleClick = () => {
    router.push(`/Client/Project/${project.projectId}`);
  };

  const {
    projectName = 'Unnamed Project',
    projectStatus = 'Unknown',
    projectLead = 'Unassigned',
    startDate = null,
    endDate = null,
    updatedAt = null,
    createdAt = null
  } = project;

  if (isMobile) {
    return (
      <div 
        className="relative bg-white rounded-xl border border-blue-200 p-4 shadow-sm
          hover:border-blue-300 hover:shadow-lg hover:bg-blue-50
          transition-all duration-300 cursor-pointer group
          before:absolute before:inset-0 before:bg-blue-100/20 before:opacity-0 
          before:transition-opacity before:duration-300 hover:before:opacity-100"
        onClick={handleClick}
      >
        {/* Project Name and Status */}
        <div className="w-full flex justify-between items-center pb-2 mb-2 border-b border-blue-100 group-hover:border-blue-200 transition-colors">
          <span className="text-blue-800 font-semibold truncate flex-1 mr-2 group-hover:text-blue-900 transition-colors">
            📋 {projectName}
          </span>
          <span className={getStatusColor(projectStatus)}>
            {projectStatus}
          </span>
        </div>

        {/* Project Lead */}
        <div className="w-full text-sm pb-2 mb-2 border-b border-blue-100 group-hover:border-blue-200 transition-colors">
          <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
            👤 <span className="font-medium">Lead:</span> {projectLead}
          </span>
        </div>

        {/* Dates */}
        <div className="w-full flex justify-between text-sm pb-2 mb-2 border-b border-blue-100 group-hover:border-blue-200 transition-colors">
          <span className="text-green-600 group-hover:text-green-700 transition-colors">
            📅 <span className="font-medium">Start:</span> {formatProjectDate(startDate)}
          </span>
          <span className="text-red-600 group-hover:text-red-700 transition-colors">
            🏁 <span className="font-medium">End:</span> {formatProjectDate(endDate)}
          </span>
        </div>

        {/* Last Updated */}
        <div className="w-full text-sm flex justify-between items-center">
          <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
            🔄 <span className="font-medium">Updated:</span> {formatProjectDate(updatedAt || createdAt)}
          </span>
          <span className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
            →
          </span>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div 
      className="relative bg-white rounded-lg border border-blue-200 p-4 shadow-sm
        hover:border-blue-300 hover:shadow-lg hover:bg-blue-50
        transition-all duration-300 cursor-pointer group
        before:absolute before:inset-0 before:bg-blue-100/20 
        before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      onClick={handleClick}
    >
      <div className="grid grid-cols-6 gap-4 items-center relative z-10">
        {/* Project Name */}
        <div className="py-2 px-2 truncate font-medium text-blue-800 group-hover:text-blue-900 transition-colors flex items-center">
          <span className="mr-2">📋</span>
          {projectName}
        </div>
        
        {/* Status */}
        <div className="py-2 px-2">
          <span className={getStatusColor(projectStatus)}>
            {projectStatus}
          </span>
        </div>
        
        {/* Project Lead */}
        <div className="py-2 px-2 truncate text-blue-600 group-hover:text-blue-800 transition-colors">
          {projectLead}
        </div>
        
        {/* Start Date */}
        <div className="py-2 px-2 text-green-600 text-sm group-hover:text-green-700 transition-colors">
          {formatProjectDate(startDate)}
        </div>
        
        {/* End Date */}
        <div className="py-2 px-2 text-red-600 text-sm group-hover:text-red-700 transition-colors">
          {formatProjectDate(endDate)}
        </div>
        
        {/* Last Updated */}
        <div className="py-2 px-2 flex items-center justify-between">
          <span className="text-blue-600 text-sm group-hover:text-blue-800 transition-colors">
            {formatProjectDate(updatedAt || createdAt)}
          </span>
          <span className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all">
            →
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
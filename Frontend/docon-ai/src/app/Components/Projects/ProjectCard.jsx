import React from 'react';
import Image from 'next/image';

// Helper functions (could be moved to a utils file)
const getStatusColor = (status) => {
    const baseClasses = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";
    
    const statusClasses = {
      'In Progress': 'bg-blue-50 text-blue-700 ring-blue-700/10',
      'Completed': 'bg-green-50 text-green-700 ring-green-600/20',
      'Delayed': 'bg-amber-50 text-amber-800 ring-amber-600/20',
      'default': 'bg-gray-50 text-gray-600 ring-gray-500/10'
    };
  
    return statusClasses[status] || statusClasses.default;
  };

const  formatProjectDate = (dateString) => {
    // Handle both "DD/MM/YYYY" and already formatted dates
    if (!dateString) return 'No date';
    
    // Check if already in correct format (like from API)
    if (dateString.includes(',')) return dateString;
  
    // Parse DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(`${month}/${day}/${year}`);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    // Fallback for other formats
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

const ProjectCard = ({ project, isMobile }) => {
    if (isMobile) {
        return (
            <div className="bg-gray-50 border border-sky-600 text-[16px] rounded-lg p-4 
        hover:border-[1.5px] hover:border-sky-700 hover:bg-white 
        hover:shadow-lg hover:shadow-sky-300/40 transition-all duration-100">
                <div className="w-full flex justify-between items-center text-sm font-medium border-b pb-1">
                    <span className="text-gray-600">📌 {project.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(project.status)} whitespace-nowrap`}>
                        {project.status}
                    </span>
                </div>

                <div className="w-full flex justify-between text-sm border-b pb-1">
                    <span className="text-gray-600">📄 {project.totalDocuments} Docs</span>
                    <span className="text-gray-600">📂 {project.categories} Categories</span>
                </div>

                <div className="w-full text-sm text-gray-500 border-b pb-1 flex items-center">
                    <span className="text-gray-600">📅 Updated:</span>
                    <span className="ml-1">{formatProjectDate(project.lastUpdated)}</span>
                </div>

                <div className="w-full flex flex-col items-start gap-1 pt-2">
                    <span className="text-gray-600">👥 Team:</span>
                    <div className="flex flex-wrap gap-2">
                        {project.teamMembers.map((member, idx) => (
                            <Image
                                key={idx}
                                src={member.profileImage}
                                alt={member.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border-2 border-sky-500 hover:scale-110 transition-transform"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border border-sky-600 rounded-lg p-4 
      hover:border-[1.5px] hover:border-sky-700 hover:bg-white 
      hover:shadow-lg hover:shadow-sky-300/40 transition-all duration-100">
            <div className="flex w-full">
                <div className="flex-1 py-2 px-4 border-r border-gray-300">{project.name}</div>
                <div className={`flex-1 py-2 px-4 border-r border-gray-300 ${getStatusColor(project.status)}`}>
                    {project.status}
                </div>
                <div className="flex-1 py-2 px-4 border-r border-gray-300">{formatProjectDate(project.lastUpdated)}</div>
                <div className="flex-1 py-2 px-4 border-r border-gray-300">{project.totalDocuments}</div>
                <div className="flex-1 py-2 px-4 border-r border-gray-300">{project.categories}</div>
                <div className="flex-1 flex items-center gap-2">
                    {project.teamMembers.map((member, idx) => (
                        <Image
                            key={idx}
                            src={member.profileImage}
                            alt={member.name}
                            width={40}
                            height={40}
                            className={`w-10 h-10 rounded-full border-2 border-sky-500 ${idx !== 0 ? '-ml-3' : ''} hover:scale-110 transition-transform`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
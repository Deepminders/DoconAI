import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Pause, 
  XCircle,
  Play
} from 'lucide-react';

const getStatusConfig = (status) => {
  const statusConfigs = {
    'In Progress': {
      color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200',
      icon: Play,
      iconColor: 'text-emerald-600'
    },
    'Completed': {
      color: 'bg-blue-50 text-blue-700 ring-blue-600/20 border-blue-200',
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    'Delayed': {
      color: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600'
    },
    'On Hold': {
      color: 'bg-gray-50 text-gray-700 ring-gray-600/20 border-gray-200',
      icon: Pause,
      iconColor: 'text-gray-600'
    },
    'Cancelled': {
      color: 'bg-red-50 text-red-700 ring-red-600/20 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  };

  return statusConfigs[status] || statusConfigs['In Progress'];
};

const formatProjectDate = (dateString) => {
  if (!dateString) return 'Not set';
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

const getTimeAgo = (dateString) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  } catch {
    return 'Unknown';
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
    projectStatus = 'In Progress',
    projectLead = 'Unassigned',
    startDate = null,
    endDate = null,
    updatedAt = null,
    createdAt = null
  } = project;

  const statusConfig = getStatusConfig(projectStatus);
  const StatusIcon = statusConfig.icon;

  if (isMobile) {
    return (
      <div 
        className="group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm
          hover:shadow-xl hover:border-blue-300 hover:-translate-y-1
          transition-all duration-300 cursor-pointer overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br 
          before:from-blue-50/50 before:to-indigo-50/50 before:opacity-0 
          before:transition-opacity before:duration-300 hover:before:opacity-100"
        onClick={handleClick}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                  {projectName}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Project #{project.projectId?.slice(-6) || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
              <span>{projectStatus}</span>
            </div>
          </div>

          {/* Project Lead */}
          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Project Lead:</span>
            <span className="text-sm font-medium text-gray-900">{projectLead}</span>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Start Date</span>
              </div>
              <p className="text-sm font-semibold text-green-800">{formatProjectDate(startDate)}</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">End Date</span>
              </div>
              <p className="text-sm font-semibold text-red-800">{formatProjectDate(endDate)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Updated {getTimeAgo(updatedAt || createdAt)}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div 
      className="group relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm
        hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5
        transition-all duration-300 cursor-pointer overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-r 
        before:from-blue-50/30 before:to-indigo-50/30 before:opacity-0 
        before:transition-opacity before:duration-300 hover:before:opacity-100"
      onClick={handleClick}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      
      <div className="grid grid-cols-6 gap-6 items-center relative z-10">
        {/* Project Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
              {projectName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              #{project.projectId?.slice(-6) || 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex justify-start">
          <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
            <span>{projectStatus}</span>
          </div>
        </div>
        
        {/* Project Lead */}
        <div className="flex items-center space-x-2 min-w-0">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
            {projectLead}
          </span>
        </div>
        
        {/* Start Date */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-green-100 rounded-md">
            <Calendar className="h-3.5 w-3.5 text-green-600" />
          </div>
          <span className="text-sm text-green-700 font-medium">
            {formatProjectDate(startDate)}
          </span>
        </div>
        
        {/* End Date */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-red-100 rounded-md">
            <Calendar className="h-3.5 w-3.5 text-red-600" />
          </div>
          <span className="text-sm text-red-700 font-medium">
            {formatProjectDate(endDate)}
          </span>
        </div>
        
        {/* Last Updated & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {getTimeAgo(updatedAt || createdAt)}
            </span>
          </div>
          <div className="ml-4 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <ArrowRight className="h-4 w-4 text-blue-500 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
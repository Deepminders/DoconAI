import React, { memo } from 'react';
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
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Play,
      iconColor: 'text-emerald-600'
    },
    'Completed': {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    'Delayed': {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600'
    },
    'On Hold': {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Pause,
      iconColor: 'text-gray-600'
    },
    'Cancelled': {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  };
  return statusConfigs[status] || statusConfigs['On Hold'];
};

const formatProjectDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid Date';
  }
};

const getTimeAgo = (dateString) => {
  if (!dateString) return 'never';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 50) return `${diffInDays}d ago`;

    const diffInMonths = Math.floor(diffInDays / 30.44); // Average days in a month
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;

  } catch {
    return 'unknown';
  }
};

const ProjectCard = memo(({ project, isMobile }) => {
  const router = useRouter();
  if (!project) return null;

  const handleClick = () => router.push(`/Client/Project/${project.projectId}`);

  const {
    projectName = 'Unnamed Project',
    projectStatus = 'On Hold',
    projectLead = 'Unassigned',
    startDate,
    endDate,
    updatedAt,
    createdAt
  } = project;

  const statusConfig = getStatusConfig(projectStatus);
  const StatusIcon = statusConfig.icon;

  if (isMobile) {
    return (
      <div
        onClick={handleClick}
        role="button"
        aria-label={`View project: ${projectName}`}
        className="group relative bg-white rounded-2xl border border-gray-200 p-5 shadow-sm
          hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-800">
                  {projectName}
                </h3>
                <p className="text-sm text-gray-500">
                  #{project.projectId?.slice(-6) || 'N/A'}
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
              <span>{projectStatus}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50/80 rounded-lg">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Lead:</span>
            <span className="text-sm font-medium text-gray-800 truncate">{projectLead}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="text-xs font-medium text-green-700">Start Date</span>
              <p className="text-sm font-semibold text-green-900">{formatProjectDate(startDate)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <span className="text-xs font-medium text-red-700">End Date</span>
              <p className="text-sm font-semibold text-red-900">{formatProjectDate(endDate)}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Updated {getTimeAgo(updatedAt || createdAt)}
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div
      onClick={handleClick}
      role="button"
      aria-label={`View project: ${projectName}`}
      className="group bg-white rounded-xl border border-gray-200 shadow-sm
        hover:shadow-md hover:border-blue-300 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
        transition-all duration-200 ease-in-out cursor-pointer"
    >
      <div className="grid grid-cols-12 gap-4 items-center p-4">
        <div className="col-span-3 flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-700" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-800">
              {projectName}
            </h3>
            <p className="text-xs text-gray-500">
              Project #{project.projectId?.slice(-6) || 'N/A'}
            </p>
          </div>
        </div>

        <div className="col-span-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
            <span>{projectStatus}</span>
          </div>
        </div>

        <div className="col-span-2 flex items-center space-x-2 min-w-0">
          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{projectLead}</span>
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-700 font-medium">{formatProjectDate(startDate)}</span>
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-red-600" />
          <span className="text-sm text-gray-700 font-medium">{formatProjectDate(endDate)}</span>
        </div>

        <div className="col-span-1 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">{getTimeAgo(updatedAt || createdAt)}</span>
            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
              <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;
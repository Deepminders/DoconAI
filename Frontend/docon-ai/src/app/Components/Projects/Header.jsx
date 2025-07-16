import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Filter, SortAsc, PlusCircle, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import profile from '../../(Pages)/Client/Projects/profile.jpg';
import { useRouter } from 'next/navigation';

const Header = ({
  onFilterClick,
  onSortClick,
  isReversed,
  onNewProjectClick,
  onSearch,
  projects = [],
  showNewProjectButton = true
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [userInfo, setUserInfo] = useState({ username: '', user_role: '', email: '' });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`)
      .then(res => res.json())
      .then(user => setUserInfo({
        username: user?.username || '',
        user_role: user?.user_role || '',
        email: user?.email || ''
      }))
      .catch(() => setUserInfo({ username: '', user_role: '', email: '' }));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Logout functions
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  // Calculate real project statistics
  const projectStats = React.useMemo(() => {
    const stats = {
      active: 0,
      completed: 0,
      delayed: 0,
      onHold: 0,
      cancelled: 0
    };

    projects.forEach(project => {
      const status = project.projectStatus?.toLowerCase();
      switch (status) {
        case 'in progress':
          stats.active++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'delayed':
          stats.delayed++;
          break;
        case 'on hold':
          stats.onHold++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        default:
          stats.active++;
      }
    });

    return stats;
  }, [projects]);

  return (
    <div className="fixed top-0 left-0 lg:left-60 right-0 z-20 bg-white/95 backdrop-blur-lg border-b border-gray-200 transition-all duration-300">
      {/* Main Header Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 ml-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">

          {/* Left Section - Title & Breadcrumb */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-blue-600 font-medium">Projects</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              My Projects
            </h1>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl w-full">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                  transition-all duration-200 placeholder-gray-400 text-gray-700"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Right Section - Profile & Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <Bell size={20} />
              {/* Only show notification dot if there are actual notifications */}
              {projectStats.delayed > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <Settings size={20} />
            </button>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 relative">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{userInfo.username || "User"}</p>
                <p className="text-xs text-gray-500">{userInfo.user_role || "Role"}</p>
              </div>
              <button
                onClick={() => setIsProfileDropdownOpen((v) => !v)}
                className="relative flex items-center focus:outline-none"
              >
                <Image
                  src={profile}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  {/* Click outside to close dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-25 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={profile}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {userInfo.username}
                          </p>
                          <p className="text-xs text-gray-500">{userInfo.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userInfo.user_role}
                      </div>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          {/* Left Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center ml-10 space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg 
                hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                transition-all duration-200 shadow-sm"
              onClick={onFilterClick}
            >
              <Filter size={16} />
              <span className="font-medium">Filter</span>
            </button>

            <button
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg 
                hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                transition-all duration-200 shadow-sm"
              onClick={onSortClick}
            >
              <SortAsc size={16} className={`transition-transform duration-200 ${isReversed ? "rotate-180" : ""}`} />
              <span className="font-medium">
                {isReversed ? "Oldest First" : "Newest First"}
              </span>
            </button>

            {/* Real Project Stats - Only show if there are projects */}
            {projects.length > 0 && (
              <div className="hidden md:flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                {projectStats.active > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{projectStats.active} Active</span>
                  </div>
                )}
                {projectStats.completed > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{projectStats.completed} Completed</span>
                  </div>
                )}
                {projectStats.delayed > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{projectStats.delayed} Delayed</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action - New Project */}
          {showNewProjectButton && (
            <button
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 
                text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 
                focus:ring-blue-500/20 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              onClick={onNewProjectClick}
            >
              <PlusCircle size={18} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="z-50 flex items-center justify-center p-4 fixed inset-0">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mt-24">
            <div className="flex items-center mb-4">
              <LogOut className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your projects.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
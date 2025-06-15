"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Bell, HelpCircle } from "lucide-react";

const ProjectHeader = ({ 
  projectId, // Now we pass projectId instead of projectName
  showNotifications = true,
  profileImage,
  // Remove projectStatus from props since we'll get it from API
}) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/project/findProject/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Message === "Project found" && data.User) {
          setProjectData(data.User);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Get project name and status with fallbacks
  const projectName = projectData?.projectName || "Loading...";
  const projectStatus = projectData?.projectStatus || "Unknown";

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 sm:pb-4 px-2 sm:px-4 lg:px-6 bg-white sticky top-0 z-10 gap-2 sm:gap-0">
      {/* Left Section - Project Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Project Name */}
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-800 flex items-center gap-2">
          <span className="bg-sky-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="truncate max-w-[200px] sm:max-w-none">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : error ? (
              <span className="text-red-500 text-sm">Error loading project</span>
            ) : (
              projectName
            )}
          </span>
        </h1>
        
        {/* Status Badge - Show on mobile below title, on desktop inline */}
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            projectStatus === "Active" || projectStatus === "In Progress" 
              ? "bg-green-500" 
              : projectStatus === "Completed" 
                ? "bg-blue-500"
                : "bg-gray-400"
          }`}></span>
          <span className="truncate">{loading ? "Loading..." : projectStatus}</span>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto justify-end sm:justify-start">
        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showNotifications && (
            <button className="p-1.5 sm:p-2 relative text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors">
              <Bell size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors">
            <HelpCircle size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Profile Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Image
            src={profileImage}
            alt="User profile"
            width={32}
            height={32}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 object-cover"
            priority
          />
          <ChevronDown size={14} className="text-gray-400 hidden lg:block" />
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
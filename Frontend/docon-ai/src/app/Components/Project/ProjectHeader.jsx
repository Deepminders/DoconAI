"use client";

import Image from "next/image";
import { ChevronDown, Bell, HelpCircle } from "lucide-react";

const ProjectHeader = ({ 
  projectName = "Taj Hotel", 
  showNotifications = true,
  profileImage,
  projectStatus = "Active"
}) => {
  return (
    <header className="flex justify-between items-center border-b pb-4 px-2 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-sky-800 flex items-center gap-2">
          <span className="bg-sky-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          </span>
          {projectName}
        </h1>
        
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full ${
            projectStatus === "Active" ? "bg-green-500" : "bg-gray-400"
          }`}></span>
          <span>{projectStatus}</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showNotifications && (
          <button className="p-2 relative text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}
        
        <button className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full">
          <HelpCircle size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <Image
            src={profileImage}
            alt="User profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-blue-500 object-cover"
            priority
          />
          <ChevronDown size={16} className="text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
"use client";

import React from "react";
import {
  FolderKanban,
  FileText,
  Settings,
  X,
} from "lucide-react";

// Sidebar Item Component (can be moved to a separate file if reused)
const SidebarItem = ({ icon, label }) => (
  <li className="flex items-center gap-2 hover:underline cursor-pointer">
    {icon} {label}
  </li>
);

const Sidebar = ({ isOpen, isMobile, toggleSidebar }) => (
  <aside
    className={`fixed lg:relative z-40 bg-sky-900 text-white w-64 h-full p-4 
      transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
  >
    <button
      onClick={toggleSidebar}
      className="lg:hidden mb-4 text-white hover:text-sky-200 flex items-center gap-2"
      aria-label="Close sidebar"
    >
      <X size={24} /> Close
    </button>
    <h2 className="text-xl font-bold">Sidebar</h2>
    <ul className="mt-4 space-y-3">
      <SidebarItem icon={<FolderKanban size={18} />} label="Dashboard" />
      <SidebarItem icon={<FileText size={18} />} label="Projects" />
      <SidebarItem icon={<Settings size={18} />} label="Settings" />
    </ul>
  </aside>
);

export default Sidebar;
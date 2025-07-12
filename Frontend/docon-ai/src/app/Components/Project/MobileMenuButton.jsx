"use client";

import { Menu } from "lucide-react";

const MobileMenuButton = ({ toggleSidebar }) => (
  <button
    onClick={toggleSidebar}
    className="fixed z-50 top-2 left-2 p-2 bg-white text-sky-600 rounded-md shadow-lg border border-sky-600 hover:bg-sky-50 transition-colors"
    aria-label="Open sidebar"
  >
    <Menu size={24} />
  </button>
);

export default MobileMenuButton;
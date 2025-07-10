"use client";

import React from "react";
import { Search } from "lucide-react";

const DocumentSearch = ({ onSearch }) => (
  <div className="relative mt-6 w-full max-w-xl mx-auto">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      size={20}
    />
    <input
      type="text"
      onChange={(e) => onSearch(e.target.value)}
      className="w-full border border-gray-300 bg-white rounded-full py-2.5 pl-12 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
      placeholder="Search documents by name, category, or uploader..."
    />
  </div>
);

export default DocumentSearch;
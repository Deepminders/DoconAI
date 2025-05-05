"use client";

import React from "react";
import { Search } from "lucide-react";

const DocumentSearch = ({ onSearch }) => (
  <div className="relative mt-4 w-full max-w-lg mx-auto">
    <input
      type="text"
      onChange={(e) => onSearch(e.target.value)}
      className="w-full border-2 border-blue-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Search documents by name, category, or uploader..."
    />
    <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
  </div>
);

export default DocumentSearch;
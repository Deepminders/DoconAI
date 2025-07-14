"use client";

import React from "react";
import { ChartNoAxesGantt } from "lucide-react";

const DocumentCategories = () => (
  <div className="py-8">
    <div className="relative flex items-center">
      <div className="flex-grow border-t-2 border-sky-700"></div>
      <span className="flex-shrink mx-4 text-2xl font-bold text-sky-700 flex items-center gap-3">
        <ChartNoAxesGantt size={28} />
        Documents
        <ChartNoAxesGantt size={28} />
      </span>
      <div className="flex-grow border-t-2 border-sky-700"></div>
    </div>
  </div>
);

export default DocumentCategories;
"use client";

import React from "react";

const CategoryCard = ({ category }) => (
  <div className="flex items-center gap-2 border-2 border-sky-600 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition duration-300 cursor-pointer min-w-[200px]">
    {category.icon}
    <div>
      <p className="text-sm font-medium">{category.name}</p>
      <p className="text-xs text-gray-500">{category.files}</p>
    </div>
  </div>
);

const DocumentCategories = ({ categories }) => (
  <div className="text-center">
    <h1 className="relative flex items-center justify-center text-2xl font-light mb-4 mt-4 text-sky-800">
      <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
      <span className="whitespace-nowrap">Documents</span>
      <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
    </h1>

    <h2 className="text-xl font-bold text-sky-800 mt-5">Categories</h2>
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {categories.map((category, index) => (
        <CategoryCard key={index} category={category} />
      ))}
    </div>
  </div>
);

export default DocumentCategories;
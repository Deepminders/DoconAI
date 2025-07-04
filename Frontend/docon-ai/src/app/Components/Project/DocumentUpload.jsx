"use client";

import React from "react";
import { UploadCloud } from "lucide-react";

const DocumentUpload = () => (
  <div className="mt-4 border-dashed border-2 border-gray-300 p-6 text-center rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition">
    <UploadCloud size={32} className="text-gray-500" />
    <p className="mt-2 text-sm text-gray-600">Drag & Drop or Click to upload</p>
  </div>
);

export default DocumentUpload;
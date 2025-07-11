"use client";

import React from "react";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA"); 
};

const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const DocumentRow = ({ document, isSelected, onToggleSelect, projectId }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-100 text-gray-700 text-sm cursor-pointer">
      <td className="p-3 border border-gray-300">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(document.document_id)}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        />
      </td>
      <td className="p-3 border border-gray-300">{document.document_name}</td>
      <td className="p-3 border border-gray-300">
        {document.document_category}
      </td>
      <td className="p-3 border border-gray-300">
        {formatSize(document.document_size)}
      </td>
      <td className="p-3 border border-gray-300">
        {formatDate(document.last_modified_date)}
      </td>
      <td className="p-3 border border-gray-300">
        {formatDate(document.upload_date)}
        <br />
        <span className="text-gray-500 text-xs">{document.uploadedBy}</span>
      </td>
    </tr>
  );
};

export default DocumentRow;
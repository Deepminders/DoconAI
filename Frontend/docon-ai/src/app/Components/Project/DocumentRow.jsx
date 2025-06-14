"use client";

import React from "react";

const DocumentRow = ({ document, isSelected, onToggleSelect }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-100 text-gray-700 text-sm cursor-pointer">
    <td className="p-3 border border-gray-300">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(document.name)}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
      />
    </td>
    <td className="p-3 border border-gray-300">{document.name}</td>
    <td className="p-3 border border-gray-300">{document.category}</td>
    <td className="p-3 border border-gray-300">{document.size}</td>
    <td className="p-3 border border-gray-300">
      {document.modified}
      <br />
      <span className="text-gray-500 text-xs">{document.modifiedBy}</span>
    </td>
    <td className="p-3 border border-gray-300">
      {document.uploaded}
      <br />
      <span className="text-gray-500 text-xs">{document.uploadedBy}</span>
    </td>
  </tr>
);

export default DocumentRow;
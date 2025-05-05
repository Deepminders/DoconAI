"use client";

import React from "react";
import DocumentRow from "./DocumentRow";

const DocumentsTable = ({ documents, selectedDocs, onToggleSelect }) => {
  if (documents.length === 0) {
    return (
      <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No documents found matching your search</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-left text-[13px]">
            <th className="p-3 border border-gray-300"></th>
            <th className="p-3 border border-gray-300 font-semibold">Document</th>
            <th className="p-3 border border-gray-300 font-semibold">Category</th>
            <th className="p-3 border border-gray-300 font-semibold">Size</th>
            <th className="p-3 border border-gray-300 font-semibold">Date Modified</th>
            <th className="p-3 border border-gray-300 font-semibold">Date Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <DocumentRow
              key={doc.name}
              document={doc}
              isSelected={selectedDocs.includes(doc.name)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentsTable;
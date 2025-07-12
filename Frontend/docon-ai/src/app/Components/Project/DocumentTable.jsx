"use client";

import React from "react";
import DocumentRow from "./DocumentRow";

const DocumentsTable = ({ documents, selectedDocs, onToggleSelect, projectId }) => {
  if (documents.length === 0) {
    return (
      <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No documents found matching your search</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-200 text-gray-800 text-left text-md">
            <th className="p-3 border border-gray-300 font-semibold"></th>
            <th className="p-3 border border-gray-300 font-semibold">Document</th>
            <th className="p-3 border border-gray-300 font-semibold">Category</th>
            <th className="p-3 border border-gray-300 font-semibold">Doc ID</th>
            <th className="p-3 border border-gray-300 font-semibold">Date Modified</th>
            <th className="p-3 border border-gray-300 font-semibold">Doc Version</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <DocumentRow
              key={doc._id || doc.document_id || doc.name}
              document={doc}
              isSelected={selectedDocs.includes(doc.document_id)}
              onToggleSelect={onToggleSelect}
              projectId={projectId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentsTable;
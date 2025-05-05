"use client";

import React from "react";
import { X } from "lucide-react";

const GroupDocumentsModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  setCategoryName,
  selectedCount
}) => (
  <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Group Documents</h3>
      <p className="text-gray-600 mb-4">
        {selectedCount} document(s) will be grouped under:
      </p>

      <input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Enter category name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!categoryName.trim()}
          className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${!categoryName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Group Documents
        </button>
      </div>
    </div>
  </div>
);

export default GroupDocumentsModal;
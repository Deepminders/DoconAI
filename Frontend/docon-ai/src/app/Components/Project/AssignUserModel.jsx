"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const AssignUserModel = ({ isOpen, onClose, onAssign }) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(userId, role);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Assign User</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">User Id</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignUserModel;
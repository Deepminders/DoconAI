"use client";

import React from "react";
import { UserMinus } from "lucide-react";

const DeleteUserModel = ({ isOpen, onClose, onConfirm, userName }) => (
  <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <UserMinus size={32} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unassign User?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to unassign {userName} from this project? They will no longer have access to this project.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Unassign User
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteUserModel;
"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const UserRow = ({ user, onEditClick, onDeleteClick }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
      {user.name}
    </td>
    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
      {user.role}
    </td>
    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
      {user.email}
    </td>
    <td className="py-4 px-6 whitespace-nowrap">
      <div className="flex items-center gap-1">
        <button
          onClick={onEditClick}
          className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
          aria-label="Edit user"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDeleteClick(user)}
          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Delete user"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

export default UserRow;
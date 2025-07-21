"use client";

import React, { useState } from "react";
import { CircleUserRound, UserMinus } from "lucide-react";

const UserRow = ({
  user,
  onRemoveFromProject,
  projectId
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const userData = {
    id: user.id || user.user_id || user._id,
    name: user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.name || `${user.staff_fname || ''} ${user.staff_lname || ''}`.trim(),
    email: user.email || user.staff_email,
    role: user.role || user.staff_role,
  };

  const handleRemove = () => {
    // Don't hide the row immediately - let the modal handle the confirmation
    // Only call the onRemoveFromProject to trigger the modal
    onRemoveFromProject(userData.id, projectId);
  };

  if (!isVisible) {
    return null; // Don't render anything if the row is hidden
  }

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      {/* Name Column */}
      <td className="py-4 px-4 w-[30%]">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <CircleUserRound className="text-gray-600 w-5 h-5" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
              {userData.name}
            </div>
          </div>
        </div>
      </td>

      {/* Role Column */}
      <td className="py-4 px-4 w-[25%]">
        <div className="text-sm text-gray-900">{userData.role}</div>
      </td>

      {/* Email Column */}
      <td className="py-4 px-4 w-[35%]">
        <div className="text-sm text-gray-500 truncate max-w-[220px]">
          {userData.email}
        </div>
      </td>

      {/* Actions Column */}
      <td className="py-4 px-4 w-[10%] text-center">
        <button
          onClick={handleRemove}
          className="text-gray-500 hover:text-red-500 transition-colors"
          title="Remove from project"
        >
          <UserMinus className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
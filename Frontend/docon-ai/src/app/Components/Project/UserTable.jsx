"use client";

import React, { useState } from "react";
import UserRow from "./UserRow";
import AssignUserModal from "./AssignUserModel";
import StaffModalWithTrigger  from "./AssignProjects";
//import { toast } from "react-toastify"; // Optional for notifications

const UsersTable = ({
  users = [],
  onRemoveFromProject = () => {},
  isProjectView = false,
  projectId = null,
}) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);

  // Get the correct user ID based on your data structure
  const getUserId = (user) => {
    if (!user) {
      console.error("Undefined user encountered");
      return `invalid-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Use staff_id as the primary identifier
    return (
      user.staff_id ||
      user._id ||
      user.id ||
      `temp-${Math.random().toString(36).substr(2, 9)}`
    );
  };

  const handleAssign = async (userId, role) => {
    setIsAssigning(true);
    setError(null);
    try {
      await onAssignUser(userId, role);
      setIsAssignModalOpen(false);
      toast.success("User assigned successfully");
    } catch (err) {
      setError(err.message || "Failed to assign user");
      toast.error(err.message || "Failed to assign user");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="relative flex items-center justify-center text-2xl font-light mb-4 text-sky-700">
        <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
        <span className="whitespace-nowrap">
          {isProjectView ? "Project Team Members" : "Users"}
        </span>
        <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
      </h1>

      <StaffModalWithTrigger projectid = {projectId}/>
      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isProjectView ? "Actions" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const userId = getUserId(user);

              if (
                !user ||
                typeof user !== "object" ||
                Object.keys(user).length === 0
              ) {
                console.warn("Invalid user data:", user);
                return null;
              }

              return (
                <UserRow
                  key={userId}
                  user={user}
                  onRemoveFromProject={onRemoveFromProject}
                  isProjectView={isProjectView}
                  projectId={projectId}
                />
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {isProjectView
              ? "No staff members assigned to this project"
              : "No users found"}
          </div>
        )}
      </div>

      {!isProjectView && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            disabled={isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign User"}
          </button>
        </div>
      )}

      <AssignUserModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        isLoading={isAssigning}
        error={error}
      />
    </div>
  );
};

export default UsersTable;

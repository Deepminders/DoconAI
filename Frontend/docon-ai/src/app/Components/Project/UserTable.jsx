"use client";

import React, { useState } from "react";
import UserRow from "./UserRow";
import AssignUserModal from "./AssignUserModel";

const UsersTable = ({ users, onEditUser, onDeleteUser, onAssignUser }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAssign = (userId, role) => {
    if (onAssignUser) {
      onAssignUser(userId, role);
    }
    setIsAssignModalOpen(false);
  };

  return (
    <div className="mt-8">
      <h1 className="relative flex items-center justify-center text-2xl font-light mb-4 text-sky-700">
        <span className="flex-[2] border-t-3 border-sky-700 mr-4"></span>
        <span className="whitespace-nowrap">Users</span>
        <span className="flex-[2] border-t-3 border-sky-700 ml-4"></span>
      </h1>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email address</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEditClick={() => onEditUser(user)}
                onDeleteClick={onDeleteUser}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          Assign User
        </button>
      </div>
      <AssignUserModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default UsersTable;
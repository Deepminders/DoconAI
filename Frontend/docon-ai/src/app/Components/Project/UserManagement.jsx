"use client";

import React, { useState } from "react";
import UsersTable from "./UserTable";

const UserManagement = ({
  users,
  onEditUser,
  onDeleteUser,
  onAssignUser,
  projectId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRemoveFromProject = async (staffId) => {
    try {
      if (!projectId) throw new Error("Project ID is missing");
      if (!staffId) throw new Error("Staff ID is missing");

      setLoading(true);
      setError(null);

      // Call the onDeleteUser function passed from parent
      if (onDeleteUser) {
        // Create a user object that matches what the parent expects
        const userToDelete = users.find(user => user.id === staffId);
        if (userToDelete) {
          onDeleteUser(userToDelete);
        }
      }

    } catch (err) {
      console.error("Removal failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use the users prop directly - this contains the assigned staff data
  const displayUsers = users || [];

  return (
    <>
      {loading && <div className="text-center py-4">Loading staff members...</div>}
      {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}

      <UsersTable
        users={displayUsers}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
        onAssignUser={onAssignUser}
        onRemoveFromProject={handleRemoveFromProject}
        isProjectView={!!projectId}
        projectId={projectId}
      />
    </>
  );
};

export default UserManagement;  
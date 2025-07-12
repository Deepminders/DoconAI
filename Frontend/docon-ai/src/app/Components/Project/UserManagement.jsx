"use client";

import React, { useState, useEffect } from "react";
import UsersTable from "./UserTable";

const UserManagement = ({
  users,
  onEditUser,
  onDeleteUser,
  onAssignUser,
  projectId
}) => {
  const [projectStaff, setProjectStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectStaff = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/project/staff-by-project/${projectId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProjectStaff(data.staff || []);
      } catch (err) {
        console.error("Failed to fetch project staff:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStaff();
  }, [projectId]);

const handleRemoveFromProject = async (staffId) => {
  try {
    if (!projectId) throw new Error("Project ID is missing");
    if (!staffId) throw new Error("Staff ID is missing");

    setLoading(true);
    setError(null);

    const response = await fetch(
      `http://127.0.0.1:8000/project/staff/${staffId}/remove-project`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to remove staff from project`);
    }

    // Update local state to remove the user
    setProjectStaff(prev => prev.filter(user => user._id !== staffId));

  } catch (err) {
    console.error("Removal failed:", err);
    setError(err.message);
    // You might want to show this error to the user
  } finally {
    setLoading(false);
  }
};

  const displayUsers = projectId ? projectStaff : users;

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
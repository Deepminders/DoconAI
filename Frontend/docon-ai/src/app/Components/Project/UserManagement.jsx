"use client";

import React from "react";
import UsersTable from "./UserTable";

const UserManagement = ({ users, onEditUser, onDeleteUser, onAssignUser }) => (
  <UsersTable
    users={users}
    onEditUser={onEditUser}
    onDeleteUser={onDeleteUser}
    onAssignUser={onAssignUser}
  />
);

export default UserManagement;
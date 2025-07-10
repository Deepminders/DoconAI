import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'user_001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin', // Can be 'Admin', 'Project Manager', 'Team Member', 'Viewer'
    permissions: []
  });

  // Define role-based permissions
  const rolePermissions = {
    'Admin': ['view', 'edit', 'delete', 'upload', 'manage_users'],
    'Project Manager': ['view', 'edit', 'delete', 'upload'],
    'Team Member': ['view', 'edit', 'upload'],
    'Viewer': ['view']
  };

  // Update permissions when role changes
  useEffect(() => {
    const permissions = rolePermissions[user.role] || ['view'];
    setUser(prev => ({ ...prev, permissions }));
  }, [user.role]);

  // Helper function to check if user has specific permission
  const hasPermission = (permission) => {
    return user.permissions.includes(permission);
  };

  // Helper function to check if user can delete documents
  const canDelete = () => {
    return user.role === 'Admin' || user.role === 'Project Manager';
  };

  // Helper function to check if user can edit documents
  const canEdit = () => {
    return hasPermission('edit');
  };

  // Helper function to check if user can upload documents
  const canUpload = () => {
    return hasPermission('upload');
  };

  const value = {
    user,
    setUser,
    hasPermission,
    canDelete,
    canEdit,
    canUpload,
    rolePermissions
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
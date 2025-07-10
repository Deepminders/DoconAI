import React, { useState } from 'react';
import { Settings, User, Shield, UserCheck, Eye } from 'lucide-react';
import { useUser } from './UserContext';

const RoleSelector = () => {
  const { user, setUser, rolePermissions } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { value: 'Admin', label: 'Admin', icon: Shield, color: 'purple', description: 'Full access to all features' },
    { value: 'Project Manager', label: 'Project Manager', icon: UserCheck, color: 'blue', description: 'Can manage documents and team members' },
    { value: 'Team Member', label: 'Team Member', icon: User, color: 'green', description: 'Can view, edit, and upload documents' },
    { value: 'Viewer', label: 'Viewer', icon: Eye, color: 'gray', description: 'Can only view documents' }
  ];

  const handleRoleChange = (newRole) => {
    const oldRole = user.role;
    setUser(prev => ({ ...prev, role: newRole }));
    setIsOpen(false);
    
    // Simple notification - you can replace this with your notification system
    console.log(`Role changed from ${oldRole} to ${newRole}`);
  };

  const currentRole = roles.find(role => role.value === user.role);
  const CurrentIcon = currentRole?.icon || User;

  return (
    <div className="relative">
      {/* Role Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          isOpen 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <CurrentIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{user.role}</span>
        <Settings className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Switch Role</h3>
              <p className="text-xs text-gray-500 mt-1">
                For demo purposes - change your role to test different permission levels
              </p>
            </div>
            
            <div className="p-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = role.value === user.role;
                const permissions = rolePermissions[role.value] || [];
                
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(role.value)}
                    disabled={isActive}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    } disabled:cursor-default`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {role.label}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {permissions.map((permission) => (
                            <span
                              key={permission}
                              className={`px-2 py-0.5 text-xs rounded-md ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> In a real application, role changes would require proper authentication and authorization.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSelector;
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Download, Edit, Eye, Search, Grid3X3, List, Calendar, User, FileText, FolderOpen, X, Trash2, LogOut, ChevronDown, Users, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../Common/NotificationSystem';
import UploadDocument from './UploadDocument';
import UpdateDocument from './UpdateDocument';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function AllDocuments() {
  const [recentDocs, setRecentDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [documentView, setDocumentView] = useState('project'); // 'project' or 'own'

  // Initialize hooks
  const router = useRouter();
  const notify = useNotifications();

  // User state from token
  const [user, setUser] = useState({
    user_id: '',
    first_name: '',
    user_role: '',
    username: '',
    email: '',
    profile_picture: ''
  });
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Logout functions
  const handleLogout = () => {
    console.log('🔒 User initiated logout, opening confirmation modal');
    setIsLogoutModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const confirmLogout = () => {
    console.log('🚪 Confirming logout...');
    localStorage.removeItem('token');
    notify.success('Logged out successfully', {
      title: 'Goodbye!',
      duration: 2000
    });
    console.log('🚪 User logged out, token removed from localStorage');
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  const cancelLogout = () => {
    console.log('🔒 Logout cancelled');
    setIsLogoutModalOpen(false);
  };

  const getInitials = (firstName, username) => {
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Decode token and get user information
  const fetchUserFromToken = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Retrieved token from localStorage:', token);

      if (!token) {
        throw new Error('No token found');
      }

      console.log('📡 Making request to decode endpoint...');
      const response = await fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to decode token');
      }

      const userData = await response.json();
      console.log('✅ Decoded user data:', userData);
      console.log('👤 User ID:', userData.user_id);
      console.log('👤 First Name:', userData.first_name);
      console.log('🎭 User Role:', userData.user_role);
      console.log('📧 Username:', userData.username);
      console.log('📧 Email:', userData.email);

      setUser(userData);
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      notify.error('Failed to authenticate user. Please login again.', {
        title: 'Authentication Error'
      });
    } finally {
      setIsUserLoading(false);
    }
  }, [notify]);

  // Role-based permission functions
  const canEdit = useCallback(() => {
    return user.user_role === 'Project Owner' || user.user_role === 'Project Manager';
  }, [user.user_role]);

  const canDelete = useCallback(() => {
    return user.user_role === 'Project Owner' || user.user_role === 'Project Manager';
  }, [user.user_role]);

  const canUpload = useCallback(() => {
    return true;
  }, []);

  const canView = useCallback(() => {
    return true;
  }, []);

  const canDownload = useCallback(() => {
    return true;
  }, []);

  // Updated fetch functions using new endpoints
  const fetchProjectDocuments = useCallback(async () => {
    if (!user.user_id) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching project documents for user:', user.user_id);
      const response = await fetch(`http://127.0.0.1:8000/api/doc/user/${user.user_id}/project-documents`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Project documents data:', data);
      setRecentDocs(data.recent_documents || []);

      // Show info about access level
      if (data.access_level === 'project_manager') {
        notify.info(`You have access to ${data.count} documents across ${data.assigned_projects?.length || 0} projects`, {
          title: 'Project Manager Access',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching project documents:', error);
      setError('Failed to load project documents. Please try again.');
      notify.error('Failed to load project documents. Please check your connection.', {
        title: 'Loading Error',
        action: {
          label: 'Retry',
          onClick: () => fetchProjectDocuments()
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, notify]);

  const fetchOwnDocuments = useCallback(async () => {
    if (!user.user_id) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching own documents for user:', user.user_id);
      const response = await fetch(`http://127.0.0.1:8000/api/doc/user/${user.user_id}/documents`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Own documents data:', data);
      setRecentDocs(data.recent_documents || []);

      notify.info(`Showing ${data.count} documents you uploaded`, {
        title: 'Your Documents',
        duration: 2000
      });
    } catch (error) {
      console.error('Error fetching own documents:', error);
      setError('Failed to load your documents. Please try again.');
      notify.error('Failed to load your documents. Please check your connection.', {
        title: 'Loading Error',
        action: {
          label: 'Retry',
          onClick: () => fetchOwnDocuments()
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, notify]);

  // Main fetch function that chooses which endpoint to use
  const fetchRecentDocuments = useCallback(async () => {
    if (documentView === 'project') {
      await fetchProjectDocuments();
    } else {
      await fetchOwnDocuments();
    }
  }, [documentView, fetchProjectDocuments, fetchOwnDocuments]);

  useEffect(() => {
    fetchUserFromToken();
  }, [fetchUserFromToken]);

  useEffect(() => {
    if (!isUserLoading && user.user_id) {
      fetchRecentDocuments();
    }
  }, [fetchRecentDocuments, isUserLoading, user.user_id]);

  useEffect(() => {
    let filtered = [...recentDocs];
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.document_category && doc.document_category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.document_name.localeCompare(b.document_name);
        case 'date':
          return new Date(b.last_modified_date || 0) - new Date(a.last_modified_date || 0);
        default:
          return new Date(b.last_modified_date || 0) - new Date(a.last_modified_date || 0);
      }
    });

    setFilteredDocs(filtered);
  }, [recentDocs, searchTerm, sortBy]);

  const closeEditSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedDocument(null);
  };

  const handleUpdate = (doc) => {
    if (!canEdit()) {
      notify.warning('You do not have permission to edit documents. Only Project Owners and Project Managers can edit documents.', {
        title: 'Access Denied',
        duration: 4000
      });
      return;
    }
    setSelectedDocument(doc);
    setIsSidebarOpen(true);
    notify.info(`Editing "${doc.document_name}"`, { title: 'Document Selected' });
  };

  const handleDelete = (doc) => {
    if (!canDelete()) {
      notify.warning('You do not have permission to delete documents. Only Project Owners and Project Managers can delete documents.', {
        title: 'Access Denied',
        duration: 5000
      });
      return;
    }
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (deletedDocId) => {
    setRecentDocs(prevDocs => prevDocs.filter(doc => doc.document_id !== deletedDocId));
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleDocumentUpdate = useCallback(async (updatedDocumentId = null) => {
    if (updatedDocumentId) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/doc/info/${updatedDocumentId}`);
        if (response.ok) {
          const data = await response.json();
          const updatedDoc = data.document;

          setRecentDocs(prevDocs =>
            prevDocs.map(doc =>
              doc.document_id === updatedDocumentId ? updatedDoc : doc
            )
          );

          if (selectedDocument && selectedDocument.document_id === updatedDocumentId) {
            setSelectedDocument(updatedDoc);
          }

          notify.success('Document list updated successfully', {
            title: 'Updated',
            duration: 2000
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch specific document, falling back to full refresh:', error);
      }
    }

    await fetchRecentDocuments();
  }, [fetchRecentDocuments, selectedDocument, notify]);

  // Handle view switching
  const handleViewChange = (newView) => {
    setDocumentView(newView);
    console.log('📋 Switching to view:', newView);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="h-10 w-10 text-gray-500" />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="h-10 w-10 text-red-500" />;
      case 'docx': return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FileText className="h-10 w-10 text-green-500" />;
      default: return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const getCategoryBadge = (category) => {
    if (!category) return null;

    const categoryColors = {
      'Bill of Quantities (BOQ)': 'bg-green-100 text-green-800',
      'Contracts and Agreements': 'bg-blue-100 text-blue-800',
      'Tender Documents': 'bg-purple-100 text-purple-800',
      'Progress Reports': 'bg-yellow-100 text-yellow-800',
      'Final Reports': 'bg-orange-100 text-orange-800',
      'Cost Estimations': 'bg-pink-100 text-pink-800',
      'Invoices and Financials': 'bg-lime-100 text-lime-800',
      'Drawings and Plans': 'bg-cyan-100 text-cyan-800',
      'Permits and Licenses': 'bg-indigo-100 text-indigo-800',
      'Safety and Compliance': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };

    const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {category}
      </span>
    );
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Project Owner':
        return 'bg-purple-100 text-purple-800';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Team Member':
        return 'bg-green-100 text-green-800';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const DocumentCard = ({ doc }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between mb-4">
          {getFileIcon(doc.versions && doc.versions[0] ? doc.versions[0].original_filename : doc.document_name)}
          <div className="relative">
            <div className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight h-10 mb-2">{doc.document_name}</h3>
        {getCategoryBadge(doc.document_category)}
      </div>
      <div className="px-5 pb-4 text-xs text-gray-500 space-y-2">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-2 flex-shrink-0" />
          <span className="truncate">{doc.versions && doc.versions[0] ? doc.versions[0].uploaded_by : 'Unknown User'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
          <span>{new Date(doc.last_modified_date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center justify-end p-2 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-1">
          {canView() && (
            <button onClick={() => window.open(doc.document_link, '_blank')} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View">
              <Eye className="h-4 w-4" />
            </button>
          )}
          {canDownload() && (
            <button onClick={() => window.open(doc.download_link, '_blank')} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Download">
              <Download className="h-4 w-4" />
            </button>
          )}
          {canEdit() && (
            <button onClick={() => handleUpdate(doc)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Edit">
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete() && (
            <button onClick={() => handleDelete(doc)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const DocumentListItem = ({ doc }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-3 flex items-center space-x-4">
      <div className="flex-shrink-0">{getFileIcon(doc.versions && doc.versions[0] ? doc.versions[0].original_filename : doc.document_name)}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{doc.document_name}</p>
        <p className="text-xs text-gray-500">{doc.document_category || 'Uncategorized'}</p>
      </div>
      <div className="hidden md:block text-xs text-gray-500 text-right">
        <p>Last Modified</p>
        <p>{new Date(doc.last_modified_date).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center space-x-1">
        {canView() && (
          <button onClick={() => window.open(doc.document_link, '_blank')} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View">
            <Eye className="h-4 w-4" />
          </button>
        )}
        {canDownload() && (
          <button onClick={() => window.open(doc.download_link, '_blank')} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Download">
            <Download className="h-4 w-4" />
          </button>
        )}
        {canEdit() && (
          <button onClick={() => handleUpdate(doc)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Edit">
            <Edit className="h-4 w-4" />
          </button>
        )}
        {canDelete() && (
          <button onClick={() => handleDelete(doc)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  // Show loading while user data is being fetched
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeEditSidebar} />}

      {/* Header with Profile Section */}
      <div className="border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Title */}
            <div className="mb-6 mt-5">
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
              <p className="text-gray-600 mt-1">Manage and organize your documents efficiently</p>
            </div>

            {/* Right side - Profile Section */}
            <div className="relative">
              <button
                onClick={() => {
                  console.log('📋 Profile dropdown clicked');
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Profile Picture or Initials */}
                <div className="flex-shrink-0">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.first_name, user.username)}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">{user.user_role}</p>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  {/* Click outside to close dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      console.log('📋 Clicked outside dropdown, closing');
                      setIsProfileDropdownOpen(false);
                    }}
                  />

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {getInitials(user.first_name, user.username)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name || user.username}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_role)}`}>
                        {user.user_role}
                      </div>
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          console.log('🔴 Logout button clicked');
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">


        {canUpload() && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
              Upload New Document
            </h2>
            <UploadDocument onUpload={() => handleDocumentUpdate()} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Document View Switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Documents
              </h2>

              {/* View Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewChange('project')}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${documentView === 'project'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Project Access
                </button>
                <button
                  onClick={() => handleViewChange('own')}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${documentView === 'own'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Folder className="h-4 w-4 mr-1" />
                  My Uploads
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="recent">Sort by Recent</option>
                <option value="name">Sort by Name</option>
              </select>
              <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}>
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Document View Description */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {documentView === 'project' ? (
                <>
                  <strong>Project Access:</strong> {user.user_role === 'Project Owner' || user.user_role === 'Project Manager'
                    ? 'Showing all documents from your assigned projects'
                    : 'Showing only documents you uploaded'}
                </>
              ) : (
                <>
                  <strong>My Uploads:</strong> Showing only documents you have uploaded
                </>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p>Loading documents...</p>
            </div>) : error ? (
              <div className="text-center py-16 text-red-500">{error}</div>
            ) : filteredDocs.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                {filteredDocs.map((doc) => viewMode === 'grid' ? <DocumentCard key={doc.document_id} doc={doc} /> : <DocumentListItem key={doc.document_id} doc={doc} />)}
              </div>
            ) : (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' :
                  documentView === 'project' ? 'No documents available in your assigned projects.' :
                    'You haven\'t uploaded any documents yet. Upload a document to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {canEdit() && (
        <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 h-full border-l border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Edit Document</h2>
              <button onClick={closeEditSidebar} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <UpdateDocument
                selectedDocument={selectedDocument}
                onClose={closeEditSidebar}
                onUpdate={(updatedDocId) => handleDocumentUpdate(updatedDocId || (selectedDocument ? selectedDocument.document_id : null))}
              />
            </div>
          </div>
        </div>
      )}

      {canDelete() && (
        <DeleteConfirmationModal
          document={documentToDelete}
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <LogOut className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your documents.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  console.log('🔒 Cancel logout clicked');
                  cancelLogout();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('🔴 Confirm logout clicked');
                  confirmLogout();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
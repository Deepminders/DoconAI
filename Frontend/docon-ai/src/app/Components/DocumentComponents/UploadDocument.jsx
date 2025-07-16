"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../Common/NotificationSystem';

export default function UploadDocument({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('initial');
  const [classificationData, setClassificationData] = useState(null);
  const [confirmedCategory, setConfirmedCategory] = useState('');

  // Project selection state
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  // User state from token
  const [user, setUser] = useState({
    user_id: '',
    first_name: '',
    user_role: '',
    username: '',
    email: ''
  });
  const [isUserLoading, setIsUserLoading] = useState(true);

  const fileInputRef = useRef(null);
  const docNameRef = useRef(null);

  const notify = useNotifications();

  // Fetch user's assigned projects
  const fetchUserProjects = async (userId, userRole) => {
    setIsProjectsLoading(true);
    try {
      console.log('📡 Fetching projects for user:', userId);
      if (userRole != 'Project Manager' && userRole != 'Project Owner') {
        const response = await fetch(`http://127.0.0.1:8000/staff/user/${userId}/projects`);

        if (!response.ok) {
          throw new Error('Failed to fetch user projects');
        }

        const data = await response.json();
        console.log('✅ User projects data:', data);

        if (data.status === 'success') {
          setUserProjects(data.projects || []);

          // Auto-select if only one project
          if (data.projects && data.projects.length === 1) {
            setSelectedProjectId(data.projects[0].project_id);
            console.log('🎯 Auto-selected single project:', data.projects[0].project_name);
          }

          notify.info(`Found ${data.count} assigned projects`, {
            title: 'Projects Loaded',
            duration: 2000
          });
        }
      }
      else {
        const response = await fetch(`http://127.0.0.1:8000/staff/owner/${userId}/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch user projects');
        }

        const data = await response.json();
        console.log('✅ User projects data:', data);

        if (data.status === 'success') {
          setUserProjects(data.projects || []);

          // Auto-select if only one project
          if (data.projects && data.projects.length === 1) {
            setSelectedProjectId(data.projects[0].project_id);
            console.log('🎯 Auto-selected single project:', data.projects[0].project_name);
          }

          notify.info(`Found ${data.count} assigned projects`, {
            title: 'Projects Loaded',
            duration: 2000
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      notify.error('Failed to load your assigned projects.', {
        title: 'Projects Loading Error'
      });
      setUserProjects([]);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Decode token and get user information
  const fetchUserFromToken = async () => {
    setIsUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Retrieved token from localStorage for upload:', token);

      if (!token) {
        throw new Error('No token found');
      }

      console.log('📡 Making request to decode endpoint for upload...');
      const response = await fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`);

      console.log('📥 Upload token decode response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload token decode error:', errorText);
        throw new Error('Failed to decode token');
      }

      const userData = await response.json();
      console.log('✅ Upload component - decoded user data:', userData);
      console.log('👤 Upload user ID:', userData.user_id);
      console.log('👤 Upload user name:', userData.first_name);

      setUser(userData);

      // Fetch user's projects after getting user data
      await fetchUserProjects(userData.user_id, userData.user_role);

    } catch (error) {
      console.error('❌ Error fetching user data for upload:', error);
      notify.error('Failed to authenticate user. Please login again.', {
        title: 'Authentication Error'
      });
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFromToken();
  }, []);

  const handleFileSelection = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (file && (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension))) {
      setSelectedFile(file);
      setUploadStep('initial');
      setClassificationData(null);
      setConfirmedCategory('');
    } else {
      notify.error('Please select a valid PDF, DOCX, or Excel file.', { title: 'Invalid File Type' });
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      notify.warning('Please select a file first.', { title: 'No File' });
      return;
    }

    if (!user.user_id) {
      notify.error('User not authenticated. Please login again.', { title: 'Authentication Required' });
      return;
    }

    if (!selectedProjectId) {
      notify.warning('Please select a project first.', { title: 'Project Required' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doc/classify', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Document classification failed');
      }
      const data = await response.json();
      setClassificationData(data);
      setConfirmedCategory(data.predicted_category);
      setUploadStep('confirming');
      notify.info('Please confirm the document category.', { title: 'Classification Complete' });
    } catch (error) {
      console.error('Error during classification:', error);
      notify.error('Could not classify the document. Please try again.', { title: 'Classification Error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!classificationData) {
      notify.error('Classification data is missing. Please try again.', { title: 'Error' });
      return;
    }

    if (!user.user_id) {
      notify.error('User not authenticated. Please login again.', { title: 'Authentication Required' });
      return;
    }

    if (!selectedProjectId) {
      notify.error('Please select a project.', { title: 'Project Required' });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('proj_id', selectedProjectId); // Use selected project ID
    formData.append('doc_name', docNameRef.current?.value || selectedFile.name);
    formData.append('confirmed_category', confirmedCategory);
    formData.append('temp_file_path', classificationData.temp_file_path);
    formData.append('original_filename', classificationData.original_filename);
    formData.append('user_id', user.user_id);

    console.log('📤 Uploading document with user_id:', user.user_id, 'project_id:', selectedProjectId);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doc/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Final file upload failed');
      }
      const data = await response.json();
      console.log('✅ Upload successful:', data);

      const selectedProject = userProjects.find(p => p.project_id === selectedProjectId);
      notify.success(`Document uploaded to "${selectedProject?.project_name}" project successfully!`, {
        title: 'Upload Successful'
      });

      if (onUpload) onUpload();
      clearFile();
    } catch (error) {
      console.error('Error uploading file:', error);
      notify.error('There was a problem uploading your file.', { title: 'Upload Failed' });
    } finally {
      setIsLoading(false);
      setUploadStep('initial');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setClassificationData(null);
    setConfirmedCategory('');
    setUploadStep('initial');
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docNameRef.current) docNameRef.current.value = "";
  };

  // Show loading while user data is being fetched
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading user information...</p>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user.user_id) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium mb-2">Authentication Required</p>
        <p className="text-red-500 text-sm">Please login to upload documents.</p>
      </div>
    );
  }

  // Show error if no projects assigned
  if (!isProjectsLoading && userProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600 font-medium mb-2">No Projects Assigned</p>
        <p className="text-yellow-500 text-sm">You need to be assigned to at least one project to upload documents.</p>
        <button
          onClick={() => fetchUserProjects(user.user_id)}
          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Refresh Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
      <div className="flex-1 w-full">
        {/* User Info Display */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Uploading as:</span> {user.first_name || user.username} ({user.user_role})
          </p>
        </div>

        {/* Project Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project <span className="text-red-500">*</span>
          </label>
          {isProjectsLoading ? (
            <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-2"></div>
              <span className="text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Choose a project...</option>
              {userProjects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                  {project.project_description && ` - ${project.project_description}`}
                </option>
              ))}
            </select>
          )}
          {userProjects.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {userProjects.length} project{userProjects.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-sky-900'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-sky-900 mb-4">Drag & drop a PDF, DOCX, or Excel file</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xls,.xlsx"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            id="fileInput"
            disabled={isLoading || !selectedProjectId}
          />
          <label
            htmlFor="fileInput"
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition-all duration-200 ${isLoading || !selectedProjectId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Choose File
          </label>
          {!selectedProjectId && (
            <p className="text-sm text-red-500 mt-2">Please select a project first</p>
          )}
        </div>

        {selectedFile && (
          <>
            <div className="mt-4">
              <input
                type="text"
                className="w-full border border-sky-900 rounded-lg p-2 placeholder:text-sky-900 placeholder:opacity-30"
                placeholder="Enter Document Name (optional)"
                ref={docNameRef}
                defaultValue={selectedFile.name.replace(/\.[^/.]+$/, "")}
              />
            </div>
            {uploadStep === 'confirming' && classificationData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sky-900">Confirm Category</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Predicted Category: <span className="font-bold">{classificationData.predicted_category}</span>
                </p>
                <select
                  className="w-full border border-sky-900 rounded-lg p-2"
                  value={confirmedCategory}
                  onChange={(e) => setConfirmedCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option value="Bill of Quantities (BOQ)">Bill of Quantities (BOQ)</option>
                  <option value="Contracts and Agreements">Contracts and Agreements</option>
                  <option value="Tender Documents">Tender Documents</option>
                  <option value="Progress Reports">Progress Reports</option>
                  <option value="Final Reports">Final Reports</option>
                  <option value="Cost Estimations">Cost Estimations</option>
                  <option value="Invoices and Financials">Invoices and Financials</option>
                  <option value="Drawings and Plans">Drawings and Plans</option>
                  <option value="Permits and Licenses">Permits and Licenses</option>
                  <option value="Safety and Compliance">Safety and Compliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <div className="mt-4 flex space-x-2">
              {uploadStep === 'initial' && (
                <button
                  className="flex-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 py-2"
                  onClick={handleClassify}
                  disabled={isLoading || !selectedProjectId}
                >
                  {isLoading ? (
                    <div className="inline-flex items-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Classifying...
                    </div>
                  ) : (
                    'Classify & Proceed'
                  )}
                </button>
              )}
              {uploadStep === 'confirming' && (
                <button
                  className="flex-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-all duration-200 py-2"
                  onClick={handleConfirmUpload}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-flex items-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Confirm & Upload'
                  )}
                </button>
              )}
              <button
                className="flex-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-all duration-200 py-2"
                onClick={clearFile}
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>
      {selectedFile && (
        <div className="flex-1 w-full bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-sky-900 mb-2">Upload Details</h3>
          <p className="text-sky-900 break-words">
            <span className="font-medium">File:</span> {selectedFile.name}
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Type:</span> {selectedFile.type}
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Project:</span> {userProjects.find(p => p.project_id === selectedProjectId)?.project_name || 'Not selected'}
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Uploader:</span> {user.first_name || user.username}
          </p>
          <p className="text-sky-900">
            <span className="font-medium">Role:</span> {user.user_role}
          </p>
        </div>
      )}
    </div>
  );
}
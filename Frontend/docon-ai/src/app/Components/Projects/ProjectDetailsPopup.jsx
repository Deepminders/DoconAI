"use client";

import React, { useState } from 'react';

const ProjectDetailsPopup = ({ onClose, onSubmit, onRefresh, isLoading, defaultClient, clientId }) => {
  const [details, setDetails] = useState({
    projectName: '',
    projectLead: '',
    projectStatus: 'In Progress',
    startDate: '',
    endDate: '',
    Client: defaultClient || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate end date is after start date
    if (new Date(details.endDate) < new Date(details.startDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      // Format dates for API
      const projectData = {
        ...details,
        Client: defaultClient,           // from props, the username
        client_id: clientId,             // from props, the user_id
        startDate: new Date(details.startDate).toISOString(),
        endDate: new Date(details.endDate).toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSubmit(projectData);

      // Call refresh function to update the project list
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const isFormValid = details.projectName &&
    details.projectLead &&
    details.Client &&
    details.startDate &&
    details.endDate;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Project Details</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name:
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={details.projectName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Project Name"
                required
              />
            </div>

            <div>
              <label htmlFor="projectLead" className="block text-sm font-medium text-gray-700 mb-1">
                Project Lead:
              </label>
              <input
                type="text"
                id="projectLead"
                name="projectLead"
                value={details.projectLead}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Team Lead Name"
                required
              />
            </div>

            <div>
              <label htmlFor="Client" className="block text-sm font-medium text-gray-700 mb-1">
                Client:
              </label>
              <input
                type="text"
                id="Client"
                name="Client"
                value={defaultClient}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={defaultClient || "Client Name"}
                required
              />
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client ID:
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={clientId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                placeholder="Client ID"
              />
            </div>

            <div>
              <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Project Status:
              </label>
              <select
                id="projectStatus"
                name="projectStatus"
                value={details.projectStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={details.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={details.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDetailsPopup;
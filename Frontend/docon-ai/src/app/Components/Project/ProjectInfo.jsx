"use client";
import { useState, useEffect } from "react";
import InfoRow from "./InfoRow";

const ProjectInfo = ({ 
  projectId,
  className = ""
}) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Replace with your actual FastAPI backend URL
          const response = await fetch(`http://localhost:8000/project/findProject/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Message === "Project found" && data.User) {
          setProjectData(data.User);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Loading state
  if (loading) {
    return (
      <div className={`mt-4 text-sm text-gray-500 ${className}`}>
        Loading project information...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`mt-4 text-sm text-red-600 ${className}`}>
        Error: {error}
      </div>
    );
  }

  // No data state
  if (!projectData) {
    return (
      <div className={`mt-4 text-sm text-gray-500 ${className}`}>
        No project data found
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-y-2 mt-4 text-sm text-gray-700 ${className}`}>
      <InfoRow label="Project ID:" value={projectData.projectId} />
      <InfoRow label="Project Name:" value={projectData.projectName} />
      <InfoRow label="Start Date:" value={formatDate(projectData.startDate)} />
      <InfoRow
        label="Project Status:"
        value={projectData.projectStatus}
        highlight={
          projectData.projectStatus === "In Progress" 
            ? "text-yellow-600 font-semibold" 
            : projectData.projectStatus === "Completed" 
              ? "text-green-600 font-semibold" 
              : "text-red-600 font-semibold"
        }
      />
      <InfoRow label="End Date:" value={formatDate(projectData.endDate)} />
      <InfoRow label="Project Lead:" value={projectData.projectLead} />
    </div>
  );
};

export default ProjectInfo;
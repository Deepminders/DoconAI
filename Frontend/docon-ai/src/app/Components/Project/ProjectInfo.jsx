"use client";

import InfoRow from "./InfoRow";

const ProjectInfo = ({ 
  projectId = "20481948",
  startDate = "2025-03-09",
  endDate = "2025-12-31",
  status = "In Progress",
  projectLead = "Fernando",
  className = ""
}) => {
  return (
    <div className={`grid grid-cols-2 gap-y-2 mt-4 text-sm text-gray-700 ${className}`}>
      <InfoRow label="Project ID:" value={projectId} />
      <InfoRow label="Start Date:" value={startDate} />
      <InfoRow
        label="Project Status:"
        value={status}
        highlight={
          status === "In Progress" 
            ? "text-yellow-600 font-semibold" 
            : status === "Completed" 
              ? "text-green-600 font-semibold" 
              : "text-red-600 font-semibold"
        }
      />
      <InfoRow label="End Date:" value={endDate} />
      <InfoRow label="Project Lead:" value={projectLead} />
    </div>
  );
};

export default ProjectInfo;
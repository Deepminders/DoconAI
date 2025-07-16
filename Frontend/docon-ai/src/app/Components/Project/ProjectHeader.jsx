"use client";

import { ChevronDown, Bell, HelpCircle, PenLine, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const ProjectHeader = ({
  projectId,
  showNotifications = true,
  profileImage,
}) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Project updated successfully." },
    { id: 2, message: "New document uploaded." },
    { id: 3, message: "Milestone deadline approaching." },
  ]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    projectId: projectId || "",
    projectName: projectData?.projectName || "",
    startDate: projectData?.startDate || "",
    projectStatus: projectData?.projectStatus || "",
    endDate: projectData?.endDate || "",
    projectLead: projectData?.projectLead || "",
  });
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState({});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notifRef = useRef();

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

  // Log the received projectId
  useEffect(() => {
    console.log("Received projectId from page.jsx:", projectId);
  }, [projectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    if (showNotifDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifDropdown]);

  // Update editData when projectData changes
  useEffect(() => {
    setEditData({
      projectId: projectId || "",
      projectName: projectData?.projectName || "",
      startDate: toDateInputValue(projectData?.startDate),
      projectStatus: projectData?.projectStatus || "",
      endDate: toDateInputValue(projectData?.endDate),
      projectLead: projectData?.projectLead || "",
    });
  }, [projectData, projectId]);

  // Fetch user info from token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`)
      .then(res => res.json())
      .then(user => {
        setUser(user || {});
        setUserRole(user?.user_role || null);
      })
      .catch(() => {
        setUser({});
        setUserRole(null);
      });
  }, []);

  // Helper for initials
  const getInitials = (name, username) => {
    if (name) return name[0].toUpperCase();
    if (username) return username[0].toUpperCase();
    return "U";
  };

  // Helper for badge color
  const getRoleBadgeColor = (role) => {
    if (role === "Project Owner") return "bg-green-100 text-green-700";
    if (role === "Supervisor") return "bg-blue-100 text-blue-700";
    if (role === "Staff") return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3000/Client/Home";
  };

  // Get project name and status with fallbacks
  const projectName = projectData?.projectName || "Loading...";
  const projectStatus = projectData?.projectStatus || "Unknown";

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/project/${editData.projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: editData.projectName,
          startDate: editData.startDate,
          projectStatus: editData.projectStatus,
          endDate: editData.endDate,
          projectLead: editData.projectLead,
        }),
      });
      if (!response.ok) throw new Error("Failed to update project");
      setShowEditForm(false);
      // Optionally, refresh project data:
      // setLoading(true);
      // fetchProject();
      window.location.reload(); // or trigger a state update to refresh data
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 sm:pb-4 px-2 sm:px-4 lg:px-6 bg-white  top-0 z-10 gap-2 sm:gap-0">
      {/* Left Section - Project Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Project Name */}
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-800 flex items-center gap-2">
          <span className="bg-sky-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="truncate max-w-[200px] sm:max-w-none">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : error ? (
              <span className="text-red-500 text-sm">Error loading project</span>
            ) : (
              projectName
            )}
          </span>

        </h1>


        {/* Status Badge - Show on mobile below title, on desktop inline */}
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${projectStatus === "Active" || projectStatus === "In Progress"
              ? "bg-green-500"
              : projectStatus === "Completed"
                ? "bg-blue-500"
                : "bg-gray-400"
              }`}></span>
            <span className="truncate">{loading ? "Loading..." : projectStatus}</span>
          </span>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto justify-end sm:justify-start">
        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showNotifications && (
            <div className="relative" ref={notifRef}>
              <button
                className="p-1.5 sm:p-2 relative text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                aria-label="Show notifications"
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className={`absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200 ${showNotifDropdown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                  <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="p-3 text-gray-500 text-sm">No notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id} className="p-3 text-gray-700 border-b last:border-b-0 text-sm hover:bg-sky-50 cursor-pointer transition-colors">
                          {notif.message}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Only show PenLine (edit) button if user is Project Owner */}
          {userRole === "Project Owner" && (
            <button
              className="ml-2 p-1 rounded hover:bg-sky-100"
              onClick={() => setShowEditForm(true)}
              aria-label="Edit project details"
              type="button"
            >
              <PenLine size={18} className="text-sky-600" />
            </button>
          )}

          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors">
            <HelpCircle size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setIsProfileDropdownOpen((v) => !v)}
          >
            {user.profile_picture ? (
              <Image
                src={user.profile_picture}
                alt="User profile"
                width={32}
                height={32}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 object-cover"
                priority
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-2 border-blue-500">
                {getInitials(user.first_name, user.username)}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-800">{user.username || "User"}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isProfileDropdownOpen && (
            <>
              {/* Overlay to close dropdown */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {user.profile_picture ? (
                      <Image
                        src={user.profile_picture}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        priority
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
                    onClick={handleLogout}
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

      {/* Edit Project Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative border border-sky-100">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowEditForm(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-sky-700 flex items-center gap-2">
              <PenLine size={22} className="text-sky-500" />
              Edit Project Details
            </h2>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project ID:</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={editData.projectId}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Name:</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={editData.projectName}
                  onChange={e => setEditData({ ...editData, projectName: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    value={editData.startDate}
                    onChange={e => setEditData({ ...editData, startDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    value={editData.endDate}
                    onChange={e => setEditData({ ...editData, endDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Status:</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={editData.projectStatus}
                  onChange={e => setEditData({ ...editData, projectStatus: e.target.value })}
                  required
                >
                  <option value="">Select status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Lead:</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={editData.projectLead}
                  onChange={e => setEditData({ ...editData, projectLead: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition shadow"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

function toDateInputValue(dateString) {
  if (!dateString) return "";
  // If dateString contains 'T', split and take only the date part
  const datePart = dateString.split('T')[0];
  return datePart;
}

export default ProjectHeader;
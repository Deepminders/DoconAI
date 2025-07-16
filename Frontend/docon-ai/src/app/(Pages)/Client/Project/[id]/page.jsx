"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ShieldCheck, Scale, ArrowLeft, Plus } from "lucide-react";
import axios from "axios";
import profile from "../profile.jpg";

import MobileMenuButton from "../../../../Components/Project/MobileMenuButton";
import ProjectHeader from "../../../../Components/Project/ProjectHeader";
import ProjectInfo from "../../../../Components/Project/ProjectInfo";
import DocumentManagement from "../../../../Components/Project/DocumentManagement";
import GroupDocumentsModal from "../../../../Components/Project/GroupDocumentsModel";
import DeleteDocumentsModal from "../../../../Components/Project/DeleteDocumentsModal";
import UserManagement from "../../../../Components/Project/UserManagement";
import StaffModalWithTrigger from "../../../../Components/Project/AssignProjects";
import DeleteUserModel from "../../../../Components/Project/DeleteUserModel";
import EditUserModel from "../../../../Components/Project/EditUserModel";
import ProjectActions from "../../../../Components/Project/ProjectActions";
import DeleteConfirmationModel from "../../../../Components/Project/DeleteConfirmationModel";
import Summarizer from "../../../../Components/Project/summarizer";
import FinanceBOQCostPredictor from "../../../../Components/Project/FinanceBOQCostPredictor";
import DocumentSidebar from "../../../../Components/DocumentComponents/DocumentSidebar";

const categories = [
  {
    name: "Financial Documents",
    files: "4 Files | 123MB",
    icon: <Briefcase size={20} />,
  },
  {
    name: "Safety Documents",
    files: "4 Files | 123MB",
    icon: <ShieldCheck size={20} />,
  },
  {
    name: "Legal Documents",
    files: "4 Files | 123MB",
    icon: <Scale size={20} />,
  },
];

const initialDocuments = [
  // ... your existing initialDocuments array
];

const ProjectPage = () => {
  const { id } = useParams();
  const router = useRouter();

  // Debugging for the project ID
  console.log("🔍 ProjectPage DEBUG: id from useParams:", id);
  console.log("🔍 ProjectPage DEBUG: id type:", typeof id);

  // UI State
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modal States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeleteDocumentsModal, setShowDeleteDocumentsModal] = useState(false);
  
  // Staff Assignment Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Document States
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState(initialDocuments);
  const [newCategoryName, setNewCategoryName] = useState("");

  // User States
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Summarizer state
  const [showSummarizer, setShowSummarizer] = useState(false);

  // Profile dropdown and logout modal states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    user_role: "",
    email: "",
  });

  // Fetch staff list for assignment
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get("http://localhost:8000/staff/getstaff");
        console.log("Fetched staff:", response.data);
        setStaffList(response.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  // ... your existing useEffect hooks ...

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/projects/getproject/${id}`
        );
        const data = await response.json();
        setProjectData(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProject();
  }, [id]);

  // Add this useEffect to fetch documents when projectId changes
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/doc/ProjectDocs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const mappedDocs = (data.documents || []).map((doc) => ({
          ...doc,
          name: doc.document_name,
          category: doc.document_category,
          size: doc.document_size,
          modified: doc.last_modified_date,
          uploaded: doc.upload_date,
          modifiedBy: doc.uploaded_by,
          uploadedBy: doc.uploaded_by,
        }));
        setDocuments(mappedDocs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Search filter effect
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = documents.filter((doc) => {
        // Safely get values with fallbacks
        const name = (doc.document_name || doc.name || "").toLowerCase();
        const category = (
          doc.document_category ||
          doc.category ||
          ""
        ).toLowerCase();
        const modifiedBy = (doc.modifiedBy || "").toLowerCase();
        const uploadedBy = (doc.uploadedBy || "").toLowerCase();

        return (
          name.includes(query) ||
          category.includes(query) ||
          modifiedBy.includes(query) ||
          uploadedBy.includes(query)
        );
      });
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  useEffect(() => {
    // Responsive layout effect
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user info from token
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`)
      .then((res) => res.json())
      .then((user) => {
        setUserInfo({
          username: user?.username || "",
          user_role: user?.user_role || "",
          email: user?.email || "",
        });
        setUserRole(user?.user_role || null);
      })
      .catch(() => {
        setUserInfo({ username: "", user_role: "", email: "" });
        setUserRole(null);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  // UI Handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Staff Assignment Handler
  const handleAddStaff = async (staff) => {
    console.log("Add clicked for:", staff);
    try {
      const staffId = staff.id || staff._id;
      const response = await axios.put(
        `http://localhost:8000/staff/assignProject/${staffId}/${id}`
      );
      console.log("Staff assigned successfully:", response.data);
      
      // Close modal after successful assignment
      setShowStaffModal(false);
      
      // Optionally refresh project data or show success message
      // You might want to refetch project data here to update the UI
      
    } catch (error) {
      console.error("Error assigning project:", error);
      // Handle error - maybe show a toast or error message
    }
  };

  // Document Handlers
  const handleToggleSelect = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGroupDocuments = () => {
    setShowGroupModal(true);
  };

  const handleDeleteDocuments = async () => {
    if (selectedDocs.length === 0) return;

    // Delete each selected document by document_id (integer)
    await Promise.all(
      selectedDocs.map(async (docId) => {
        await fetch(`http://localhost:8000/api/doc/delete/${docId}`, {
          method: "DELETE",
        });
      })
    );

    // Remove deleted documents from state
    setDocuments((prevDocs) =>
      prevDocs.filter((doc) => !selectedDocs.includes(doc.document_id))
    );
    setSelectedDocs([]);
  };

  const confirmGroupDocuments = () => {
    if (!newCategoryName.trim()) return;
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        selectedDocs.includes(doc.name)
          ? { ...doc, category: newCategoryName }
          : doc
      )
    );
    setSelectedDocs([]);
    setNewCategoryName("");
    setShowGroupModal(false);
  };

  const confirmDeleteDocuments = () => {
    setDocuments((prevDocs) =>
      prevDocs.filter((doc) => !selectedDocs.includes(doc.name))
    );
    setSelectedDocs([]);
    setShowDeleteDocumentsModal(false);
  };

  const handleSummarizeClick = () => {
    setShowSummarizer(true);
  };

  const closeModal = () => {
    setShowSummarizer(false);
  };

  // User Handlers
  const handleAssignUserToProject = async (userId, role) => {
    try {
      const response = await fetch(`/api/projects/${id}/assign-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign user");
      }

      const updatedProject = await response.json();
      setProjectData(updatedProject);
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  const handleDeleteClick = (user) => {
    const userToDelete = {
      id: user.staff_id || user.id,
      name: user.staff_fname
        ? `${user.staff_fname} ${user.staff_lname}`
        : user.name,
    };
    setUserToDelete(userToDelete);
  };

  const handleEditUser = (user) => {
    const userToEdit = {
      id: user.staff_id || user.id,
      name: user.staff_fname
        ? `${user.staff_fname} ${user.staff_lname}`
        : user.name,
      role: user.staff_role || user.role,
      email: user.staff_email || user.email,
    };
    setEditingUser(userToEdit);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const response = await fetch(`/api/staff/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();
      // Update your state accordingly
    } catch (error) {
      console.error("Error updating user:", error);
    }
    setEditingUser(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/staff/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Project Handlers
  const handleDeleteProject = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    router.push("/Client/Projects");
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Staff Modal Component (integrated directly)
  const StaffAssignmentModal = () => {
    if (!showStaffModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-96">
          <h2 className="text-xl font-bold mb-4">Select Staff Member</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {staffList && staffList.length > 0 ? (
              staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span className="font-medium">
                    {staff.first_name} {staff.last_name}
                  </span>
                  <button
                    onClick={() => handleAddStaff(staff)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p>No staff members found.</p>
            )}
          </div>
          <button
            onClick={() => setShowStaffModal(false)}
            className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DocumentSidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />

      {isMobile && !isSidebarOpen && (
        <MobileMenuButton toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-6xl mx-auto p-6 border rounded-lg shadow-md bg-white">
          <ProjectHeader projectId={id} profileImage={profile} />

          <ProjectInfo projectId={id} className="my-custom-class" />
          <ProjectActions
            onDeleteProject={handleDeleteProject}
            onSummarize={handleSummarizeClick}
            // Only show Delete Project if user is Project Owner
            showDelete={userRole === "Project Owner"}
          />

          {showSummarizer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl relative">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
                >
                  &times;
                </button>
                <Summarizer
                  onClose={() => setShowSummarizer(false)}
                  projectId={id}
                />
              </div>
            </div>
          )}

          {/* Finance BOQ Cost Predictor */}
          <div className="mt-8">
            <FinanceBOQCostPredictor projectId={id} />
          </div>

          {/* Document Section */}
          <DocumentManagement
            documents={filteredDocuments}
            categories={categories}
            selectedDocs={selectedDocs}
            onSearch={setSearchQuery}
            onToggleSelect={handleToggleSelect}
            onGroupClick={handleGroupDocuments}
            onDeleteClick={handleDeleteDocuments}
            projectId={id}
          />

          {/* User Section */}
          <UserManagement
            projectId={id}
            users={staffList} // Will be overridden by project staff
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
            onAssignUser={handleAssignUserToProject}
          />

          {/* Add Staff Button */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setShowStaffModal(true)}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              Assign Staff to Project
            </button>
            <StaffModalWithTrigger projectid={id} />
          </div>

          {/* Modals */}
          <StaffAssignmentModal />

          <DeleteConfirmationModel
            isOpen={showDeleteConfirm}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Project?"
            message="This action cannot be undone. All project data will be permanently removed."
            projectId={id}
          />

          <DeleteUserModel
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={confirmDeleteUser}
            userName={userToDelete?.name || ""}
          />

          <GroupDocumentsModal
            isOpen={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            onConfirm={confirmGroupDocuments}
            categoryName={newCategoryName}
            setCategoryName={setNewCategoryName}
            selectedCount={selectedDocs.length}
          />

          <DeleteDocumentsModal
            isOpen={showDeleteDocumentsModal}
            onClose={() => setShowDeleteDocumentsModal(false)}
            onConfirm={confirmDeleteDocuments}
            selectedCount={selectedDocs.length}
          />

          <button
            onClick={() => router.push("/Client/Projects")}
            className="group mt-8 inline-flex items-center gap-2 rounded-lg border-2 border-sky-600 px-4 py-2 text-sm font-semibold text-sky-600 shadow-sm transition-all duration-200 hover:bg-sky-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Projects</span>
          </button>

          {editingUser && (
            <EditUserModel
              isOpen={!!editingUser}
              onClose={() => setEditingUser(null)}
              user={editingUser}
              onSave={handleSaveUser}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
"use client";

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    ShieldCheck,
    Scale,
} from "lucide-react";
import profile from "../profile.jpg";
import Sidebar from '../../../../Components/Project/Sidebar'
import MobileMenuButton from "../../../../Components/Project/MobileMenuButton"
import ProjectHeader from '../../../../Components/Project/ProjectHeader'
import ProjectInfo from '../../../../Components/Project/ProjectInfo'
import DocumentManagement from "../../../../Components/Project/DocumentManagement";
import GroupDocumentsModal from "../../../../Components/Project/GroupDocumentsModel";
import DeleteDocumentsModal from "../../../../Components/Project/DeleteDocumentsModal";
import UserManagement from "../../../../Components/Project/UserManagement";
import DeleteUserModel from "../../../../Components/Project/DeleteUserModel";
import EditUserModel from "../../../../Components/Project/EditUserModel";
import ProjectActions from "../../../../Components/Project/ProjectActions";
import DeleteConfirmationModel from "../../../../Components/Project/DeleteConfirmationModel";
import Summarizer from '../../../../Components/Project/summarizer'
import CostEstimation from '../../../../Components/Project/CostEstimation';

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
    {
        name: "Project_Contract_V2.pdf",
        category: "Legal",
        size: "2.45MB",
        modified: "Mar 15, 2025",
        uploaded: "Mar 10, 2025",
        modifiedBy: "Alex Johnson",
        uploadedBy: "Sarah Williams"
    },
    {
        name: "Q1_Financial_Report.xlsx",
        category: "Financial",
        size: "1.78MB",
        modified: "Apr 5, 2025",
        uploaded: "Apr 1, 2025",
        modifiedBy: "Michael Chen",
        uploadedBy: "Emma Davis"
    },
    {
        name: "Site_Safety_Protocols.docx",
        category: "Safety",
        size: "0.89MB",
        modified: "Feb 18, 2025",
        uploaded: "Feb 15, 2025",
        modifiedBy: "David Wilson",
        uploadedBy: "Jessica Brown"
    },
    {
        name: "Environmental_Impact_Assessment.pdf",
        category: "Environmental",
        size: "5.32MB",
        modified: "Jan 30, 2025",
        uploaded: "Jan 25, 2025",
        modifiedBy: "Olivia Martinez",
        uploadedBy: "Robert Taylor"
    },
    {
        name: "Stakeholder_Agreement.pdf",
        category: "Legal",
        size: "3.15MB",
        modified: "Mar 22, 2025",
        uploaded: "Mar 20, 2025",
        modifiedBy: "Daniel Anderson",
        uploadedBy: "Sophia Garcia"
    },
    {
        name: "Bill_of_Quantities.xlsx",
        category: "Financial",
        size: "1.05MB",
        modified: "Apr 8, 2025",
        uploaded: "Apr 5, 2025",
        modifiedBy: "William Lee",
        uploadedBy: "Emily Rodriguez"
    },
    {
        name: "Material_Specifications.pdf",
        category: "Technical",
        size: "4.76MB",
        modified: "Mar 5, 2025",
        uploaded: "Mar 1, 2025",
        modifiedBy: "James Smith",
        uploadedBy: "Ava Martinez"
    },
    {
        name: "Project_Timeline_Gantt.xlsx",
        category: "Planning",
        size: "0.95MB",
        modified: "Feb 28, 2025",
        uploaded: "Feb 25, 2025",
        modifiedBy: "Ethan Wilson",
        uploadedBy: "Mia Thompson"
    },
    {
        name: "Quality_Assurance_Checklist.pdf",
        category: "Quality",
        size: "1.42MB",
        modified: "Mar 12, 2025",
        uploaded: "Mar 10, 2025",
        modifiedBy: "Charlotte White",
        uploadedBy: "Benjamin Harris"
    },
    {
        name: "Meeting_Minutes_20250315.docx",
        category: "Administrative",
        size: "0.56MB",
        modified: "Mar 16, 2025",
        uploaded: "Mar 15, 2025",
        modifiedBy: "Liam Clark",
        uploadedBy: "Amelia Lewis"
    }
];



const ProjectPage = () => {
    const { id } = useParams();
    const router = useRouter();

    // Add debugging for the project ID
    console.log('🔍 ProjectPage DEBUG: id from useParams:', id);
    console.log('🔍 ProjectPage DEBUG: id type:', typeof id);


    // State declarations grouped by category
    // UI State
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Modal States
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showDeleteDocumentsModal, setShowDeleteDocumentsModal] = useState(false);

    // Document States
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [documents, setDocuments] = useState(initialDocuments);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDocuments, setFilteredDocuments] = useState(initialDocuments);
    const [newCategoryName, setNewCategoryName] = useState("");

    // User States
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    // Summarizer state
    const [showSummarizer, setShowSummarizer] = useState(false);

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/project/getproject/${id}`);
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

    // Effect Hooks
    useEffect(() => {
        // Search filter effect
        if (searchQuery.trim() === "") {
            setFilteredDocuments(documents);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = documents.filter(
                (doc) =>
                    doc.name.toLowerCase().includes(query) ||
                    doc.category.toLowerCase().includes(query) ||
                    doc.modifiedBy.toLowerCase().includes(query) ||
                    doc.uploadedBy.toLowerCase().includes(query)
            );
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

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                {/* Your sidebar */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
                </div>
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="flex h-screen bg-gray-50">
                {/* Your sidebar */}
                <div className="flex-1 flex items-center justify-center">
                    <p>Project not found</p>
                </div>
            </div>
        );
    }

    // UI Handlers 
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Document Handlers
    const handleToggleSelect = (docName) => {
        setSelectedDocs((prev) =>
            prev.includes(docName) ? prev.filter((name) => name !== docName) : [...prev, docName]
        );
    };

    const handleGroupDocuments = () => {
        setShowGroupModal(true);
    };

    const handleDeleteDocuments = () => {
        if (selectedDocs.length === 0) return;
        setShowDeleteDocumentsModal(true);
    };

    const confirmGroupDocuments = () => {
        if (!newCategoryName.trim()) return;
        setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
                selectedDocs.includes(doc.name) ? { ...doc, category: newCategoryName } : doc
            )
        );
        setSelectedDocs([]);
        setNewCategoryName("");
        setShowGroupModal(false);
    };

    const confirmDeleteDocuments = () => {
        setDocuments((prevDocs) => prevDocs.filter((doc) => !selectedDocs.includes(doc.name)));
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
            // Call your API to assign user to project
            const response = await fetch(`/api/projects/${id}/assign-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign user');
            }

            // Refresh the user list or update state as needed
            const updatedProject = await response.json();
            setProjectData(updatedProject);
        } catch (error) {
            console.error('Error assigning user:', error);
        }
    };

    const handleDeleteClick = (user) => {
        // Ensure we're using the correct ID field
        const userToDelete = {
            id: user.staff_id || user.id,
            name: user.staff_fname ? `${user.staff_fname} ${user.staff_lname}` : user.name,
        };
        setUserToDelete(userToDelete);
    };

    const handleEditUser = (user) => {
        // Convert to the editing format if needed
        const userToEdit = {
            id: user.staff_id || user.id,
            name: user.staff_fname ? `${user.staff_fname} ${user.staff_lname}` : user.name,
            role: user.staff_role || user.role,
            email: user.staff_email || user.email,
        };
        setEditingUser(userToEdit);
    };

    const handleSaveUser = async (updatedUser) => {
        try {
            // Call your API to update the user
            const response = await fetch(`/api/staff/${updatedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            // Refresh user data
            const data = await response.json();
            // Update your state accordingly
        } catch (error) {
            console.error('Error updating user:', error);
        }
        setEditingUser(null);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/staff/${userToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
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

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
            />

            {isMobile && !isSidebarOpen && <MobileMenuButton toggleSidebar={toggleSidebar} />}

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-6xl mx-auto p-6 border rounded-lg shadow-md bg-white">
                    <ProjectHeader
                        projectId={id}
                        profileImage={profile}
                    />
                    <ProjectInfo
                        projectId={id}
                        className="my-custom-class"
                    />
                    <ProjectActions
                        onDeleteProject={handleDeleteProject}
                        onSummarize={handleSummarizeClick}
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
                                <Summarizer onClose={() => setShowSummarizer(false)} projectId={id} />
                            </div>
                        </div>
                    )}

                    {/* Document Section */}
                    <DocumentManagement
                        documents={filteredDocuments}
                        categories={categories}
                        selectedDocs={selectedDocs}
                        onSearch={setSearchQuery}
                        onToggleSelect={handleToggleSelect}
                        onGroupClick={handleGroupDocuments}
                        onDeleteClick={handleDeleteDocuments}
                    />

                    {/* User Section */}
                    <UserManagement
                        projectId={id}
                        users={[]} // Will be overridden by project staff
                        onEditUser={handleEditUser}
                        onDeleteUser={handleDeleteClick}
                        onAssignUser={handleAssignUserToProject} // Use the new handler
                    />

                    {/* Modals */}
                    <DeleteConfirmationModel
                        isOpen={showDeleteConfirm}
                        onClose={cancelDelete}
                        onConfirm={confirmDelete}
                        title="Delete Project?"
                        message="This action cannot be undone. All project data will be permanently removed."
                        projectId={id}  // Make sure your modal component actually uses this if needed
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
                        onClick={() => router.push('/Client/Projects')}
                        className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sky-600 hover:text-white hover:bg-sky-600 transition-all duration-300 shadow-sm hover:shadow-md border border-sky-200 hover:border-sky-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
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
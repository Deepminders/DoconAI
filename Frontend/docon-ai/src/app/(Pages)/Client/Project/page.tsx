"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
    Menu,
    X,
    FolderKanban,
    FileText,
    Settings,
    Trash2,
    Briefcase,
    ShieldCheck,
    Scale,
    Search,
    UploadCloud,
    FileCheck2,
    Pencil,
} from "lucide-react";
import profile from "../Projects/profile.jpg";
import Sidebar from '../../../Components/Project/Sidebar'
import MobileMenuButton from "../../../Components/Project/MobileMenuButton"
import ProjectHeader from '../../../Components/Project/ProjectHeader'
import ProjectInfo from '../../../Components/Project/ProjectInfo'
import DocumentManagement from "../../../Components/Project/DocumentManagement";
import GroupDocumentsModal from "../../../Components/Project/GroupDocumentsModel";
import DeleteDocumentsModal from "../../../Components/Project/DeleteDocumentsModal";
import UserManagement from "../../../Components/Project/UserManagement";
import DeleteUserModel from "../../../Components/Project/DeleteUserModel";
import EditUserModel from "../../../Components/Project/EditUserModel";
import ProjectActions from "../../../Components/Project/ProjectActions";
import DeleteConfirmationModel from "../../../Components/Project/DeleteConfirmationModel";

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

const myusers = [
    {
        id: "1",
        name: "Laavanjan",
        role: "Project Lead",
        email: "laavanjanlaa@gmail.com",
    },
    {
        id: "2",
        name: "Nive",
        role: "Site Engineer",
        email: "Nivelaa@gmail.com",
    },
    {
        id: "3",
        name: "Laavan",
        role: "QS",
        email: "laavanlaa@gmail.com",
    },
    {
        id: "4",
        name: "Mahesh",
        role: "Site Engineer",
        email: "laavanjalaa@gmail.com",
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
    // State declarations grouped by category
    // UI State
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
    const [users, setUsers] = useState(myusers);
    const [userToDelete, setUserToDelete] = useState(null);

    const router = useRouter();

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

    // User Handlers
    const handleAssignUser = (userId, role) => {
        setUsers([
            ...users,
            {
                id: userId,
                name: "New User",
                role,
                email: `${userId}@example.com`,
            },
        ]);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleSaveUser = (updatedUser) => {
        setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        setEditingUser(null);
    };

    const confirmDeleteUser = () => {
        if (userToDelete) {
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            setUserToDelete(null);
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
                        projectName="Taj Hotel"
                        profileImage={profile}
                        projectStatus="Active"
                    />
                    <ProjectInfo />
                    <ProjectActions onDeleteProject={handleDeleteProject} />

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
                        users={users}
                        onEditUser={handleEditUser}
                        onDeleteUser={handleDeleteClick}
                        onAssignUser={handleAssignUser}
                    />

                    {/* Modals */}
                    <DeleteConfirmationModel
                        isOpen={showDeleteConfirm}
                        onClose={cancelDelete}
                        onConfirm={confirmDelete}
                        title="Delete Project?"
                        message="This action cannot be undone. All project data will be permanently removed."
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
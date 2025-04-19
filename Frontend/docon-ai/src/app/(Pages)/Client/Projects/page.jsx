"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from '../../../Components/Projects/Sidebar';
import Header from '../../../Components/Projects/Header'
import FilterPopup from '../../../Components/Projects/FilterPopup';
import ProjectDetailsPopup from '../../../Components/Projects/ProjectDetailsPopup'
import ProjectList from '../../../Components/Projects/ProjectList'

const projects = [
  // ... (your existing projects data)
  {
    id: "67d932ab6f07f6ed3216dfd1",
    name: "Project 01",
    description: "This is an SE Project",
    created_at: "28/02/2025",
    lastUpdated: "02/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "67d932ab6f07f6ed3216dfd2",
    name: "Project 01",
    description: "This is an SE Project",
    created_at: "28/02/2025",
    lastUpdated: "02/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "a1b2c3d4e5f6a7b8c9d0e1f2",
    name: "Project Alpha",
    description: "A research initiative",
    created_at: "15/01/2025",
    lastUpdated: "20/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "f2e1d0c9b8a7f6e5d4c3b2a1",
    name: "Project Beta",
    description: "Software development task",
    created_at: "10/03/2025",
    lastUpdated: "12/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "1a2b3c4d5e6f7a8b9c0d1e2f",
    name: "Project Gamma",
    description: "Marketing campaign",
    created_at: "05/02/2025",
    lastUpdated: "18/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "2f1e0d9c8b7a6f5e4d3c2b1a",
    name: "Project Delta",
    description: "Infrastructure upgrade",
    created_at: "20/01/2025",
    lastUpdated: "22/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "3a4b5c6d7e8f9a0b1c2d3e4f",
    name: "Project Epsilon",
    description: "Data migration project",
    created_at: "12/03/2025",
    lastUpdated: "15/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "4f3e2d1c0b9a8f7e6d5c4b3a",
    name: "Project Zeta",
    description: "User interface redesign",
    created_at: "08/02/2025",
    lastUpdated: "19/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "5a6b7c8d9e0f1a2b3c4d5e6f",
    name: "Project Eta",
    description: "Security audit",
    created_at: "25/01/2025",
    lastUpdated: "24/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "6f5e4d3c2b1a0f9e8d7c6b5a",
    name: "Project Theta",
    description: "Performance optimization",
    created_at: "14/03/2025",
    lastUpdated: "17/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "7a8b9c0d1e2f3a4b5c6d7e8f",
    name: "Project Iota",
    description: "Content creation",
    created_at: "11/02/2025",
    lastUpdated: "20/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "8f7e6d5c4b3a2f1e0d9c8b7a",
    name: "Project Kappa",
    description: "Training program",
    created_at: "28/01/2025",
    lastUpdated: "25/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "9c0d1e2f3a4b5c6d7e8f1a2b",
    name: "Project Lambda",
    description: "API development",
    created_at: "16/03/2025",
    lastUpdated: "19/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "0b9a8f7e6d5c4b3a3f2e1d0c",
    name: "Project Mu",
    description: "Bug fixing",
    created_at: "13/02/2025",
    lastUpdated: "21/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "1e2f3a4b5c6d7e8f9a0b8c81d",
    name: "Project Nu",
    description: "System deployment",
    created_at: "30/01/2025",
    lastUpdated: "26/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "2d1c0b9a8f7e6d5c4b3a9f8e",
    name: "Project Xi",
    description: "Data analysis",
    created_at: "18/03/2025",
    lastUpdated: "21/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "3c4d5e6f7a8b9c0d1e2f0a1b",
    name: "Project Omicron",
    description: "Feature implementation",
    created_at: "15/02/2025",
    lastUpdated: "22/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "4b3a2f1e0d9c8b7a6f5e7d8c",
    name: "Project Pi",
    description: "Code refactoring",
    created_at: "01/02/2025",
    lastUpdated: "27/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "5e6f7a8b9c0d1e2f3a4b6c5d",
    name: "Project Rho",
    description: "Database optimization",
    created_at: "20/03/2025",
    lastUpdated: "23/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "6d5c4b3a2f1e0d9c8b7a7e8f",
    name: "Project Sigma",
    description: "Documentation update",
    created_at: "17/02/2025",
    lastUpdated: "23/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "7a8b9c0d1e2f3a4b5c6d8f9e",
    name: "Project Tau",
    description: "User testing",
    created_at: "03/02/2025",
    lastUpdated: "28/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "8f9e0d1c2b3a4f5e6d7c9a8b",
    name: "Project Upsilon",
    description: "Market research",
    created_at: "22/03/2025",
    lastUpdated: "25/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "9c0d1e2f3a4b5c6d7e8f0a1b",
    name: "Project Phi",
    description: "System integration",
    created_at: "19/02/2025",
    lastUpdated: "24/03/2025",
    status: "Delayed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "0b1a2b3c4d5e6f7a8b9c0d1e",
    name: "Project Chi",
    description: "Process improvement",
    created_at: "05/02/2025",
    lastUpdated: "29/03/2025",
    status: "Completed",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  },
  {
    id: "1e2f3a4b5c6d7e8f9a0b8c7d",
    name: "Project Psi",
    description: "Risk assessment",
    created_at: "24/03/2025",
    lastUpdated: "26/03/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-161634.jpg" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  }, {
    id: "9a0b8c7d1e2f3a4b5c6d7e8f",
    name: "Project laa",
    description: "Risk assessment",
    created_at: "24/03/2025",
    lastUpdated: "26/05/2025",
    status: "In Progress",
    totalDocuments: 8,
    categories: 4,
    teamMembers: [
      { name: "Alice", profileImage: "https://th.bing.com/th/id/OIP.TQwCBONZTbLSm1D_Hmz5ggHaHa?pid=ImgDet&w=184&h=184&c=7&dpr=1.3" },
      { name: "Bob", profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg" }
    ],
  }

  // ... (rest of your projects data)
];

// ==================== UTILS ====================
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

export default function ProjectsDashboard() {
  const [allProjects, setAllProjects] = useState(projects);
  const [filter, setFilter] = useState("All Projects");
  const [isReversed, setIsReversed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);
  const [isProjectPopupVisible, setIsProjectPopupVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

// 1. Sidebar Responsiveness Handler
useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (mobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 3. Project Filtering and Sorting Logic
const filteredProjects = useMemo(() => {
  let result = filter === "All Projects"
    ? allProjects
    : allProjects.filter(project => project.status === filter);

  if (searchTerm.trim()) {
    result = result.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return result;
}, [allProjects, filter, searchTerm]);

const sortedProjects = useMemo(() => {
  return [...filteredProjects].sort((a, b) => {
    const dateA = new Date(parseDate(a.lastUpdated));
    const dateB = new Date(parseDate(b.lastUpdated));
    return isReversed
      ? dateA.getTime() - dateB.getTime() // Oldest first
      : dateB.getTime() - dateA.getTime(); // Newest first
  });
}, [filteredProjects, isReversed]);

// 4. Event Handlers
const handleSearch = (term) => {
  setSearchTerm(term);
};

const handleFilterChange = (newFilter) => {
  setFilter(newFilter);
  setIsFilterPopupVisible(false);
};

const handleSort = () => setIsReversed(prev => !prev);

const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

const handleNewProjectSubmit = (details) => {
  const newProject = {
    id: `proj-${Math.random().toString(36).substr(2, 9)}`,
    name: details.projectName,
    description: "",
    created_at: new Date().toLocaleDateString('en-GB'),
    lastUpdated: new Date().toLocaleDateString('en-GB'),
    status: "In Progress",
    totalDocuments: 0,
    categories: 0,
    teamMembers: [{
      name: details.projectLead,
      profileImage: "https://img.freepik.com/premium-photo/profile-icon-white-background_941097-160702.jpg"
    }]
  };

  setAllProjects(prev => [...prev, newProject]);
  setIsProjectPopupVisible(false);
};
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

        <div className="
          flex-1 overflow-y-auto
          pt-[150px]             /* Default (smallest screens) */
          max-[600px]:pt-[150px] /* 0-600px */
          max-[765px]:pt-[10px]  /* 601-765px */
          md:pt-[50px]           /* 768px+ */
          lg:pt-[20px]           /* 1024px+ */
        ">
          {isMobile && !isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="fixed top-1 left-4 z-50 bg-sky-700 text-white p-2 rounded-lg lg:hidden"
            >
              📂 Menu
            </button>
          )}
          <Header
            onFilterClick={() => setIsFilterPopupVisible(true)}
            onSortClick={handleSort}
            isReversed={isReversed}
            onNewProjectClick={() => setIsProjectPopupVisible(true)}
            onSearch={handleSearch}
          />
          <ProjectList
            projects={sortedProjects}
            filter={filter}
            isMobile={isMobile}
          />

        </div>

      <FilterPopup
        isVisible={isFilterPopupVisible}
        onClose={() => setIsFilterPopupVisible(false)}
        onFilterChange={handleFilterChange}
        currentFilter={filter}
      />

      {isProjectPopupVisible && (
        <ProjectDetailsPopup
          onClose={() => setIsProjectPopupVisible(false)}
          onSubmit={handleNewProjectSubmit}
        />
      )}
    </div>
  );
}


// your original Dashboard.jsx file (or where it's located)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import UserProfileMenu from '../../../Components/Common/UserProfileMenu';
import DashboardContent from '../../../Components/Dashboard/PODashboard'; // Import the new component

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      router.push('/Client/Login');
    }
  }, [router]);

  // Handle screen size for sidebar toggle
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        active="dashboard"
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-2 transition-all duration-300"> {/* Added lg:ml-60 back for sidebar spacing */}
        {/* Top Header with Profile */}
        <div className="flex justify-end items-center p-4  top-0 z-40shadow-sm"> {/* Added bg-white and shadow-sm for header */}
          <UserProfileMenu userName="Lahiruni Meegama" profileImageUrl="/default-avatar.png" />
        </div>

        {/* Dashboard content */}
        <DashboardContent /> {/* Render the extracted component */}
      </div>
    </div>
  );
}
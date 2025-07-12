'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import UserProfileMenu from '../../../Components/Common/UserProfileMenu'; // make sure this path is correct

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
      <div className="flex-1 ml-0 lg:ml-60 transition-all duration-300">
        {/* Top Header with Profile */}
        <div className="flex justify-end items-center p-4   sticky top-0 z-40">
          <UserProfileMenu userName="Lahiruni Meegama" profileImageUrl="/default-avatar.png" />
        </div>

        {/* Dashboard content */}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4 text-[#166394]">Dashboard</h1>
          <p className="text-lg text-gray-700">Welcome to your dashboard! 🎉</p>
        </div>
      </div>
    </div>
  );
}

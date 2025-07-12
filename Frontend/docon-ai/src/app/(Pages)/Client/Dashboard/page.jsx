"use client";
import React, { useState, useEffect } from 'react'
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
const page = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);

            // Auto-open sidebar on desktop, close on mobile
            if (!mobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Initial check
        checkScreenSize();

        // Add event listener
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        console.log(`Sidebar: ${!isSidebarOpen ? 'Open' : 'Closed'}`);
    };


    return (

        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <DocumentSidebar
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
                isMobile={isMobile}
                active={'documents'}
            />

            {/* Main Content Area */}
            <div className={`
                          flex-1 flex flex-col
                          transition-all duration-300 ease-in-out
                          ${!isMobile && isSidebarOpen ? 'ml-60' : 'ml-0'}
                          lg:ml-5
                          min-h-screen
                        `}>

            </div>
        </div>
    )
}

export default page
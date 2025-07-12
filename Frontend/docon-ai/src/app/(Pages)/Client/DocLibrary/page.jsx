"use client";
import React, { useState, useEffect } from 'react';

import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import DocHeader from '../../../Components/DocumentComponents/DocHeader';
import SectionTitle from '../../../Components/DocumentComponents/SectionTitle';
import AllDocuments from '../../../Components/DocumentComponents/AllDocuments';
import { NotificationProvider, createNotificationHelpers } from '../../../Components/Common/NotificationSystem';
import { UserProvider } from '../../../Components/auth/UserContext';
import "../../../CSS/Docs/style.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-red-600 mb-2">
                An unexpected error occurred while loading the application.
              </p>
              <details className="text-xs text-gray-600">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
              </details>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
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
    <ErrorBoundary>
      <NotificationProvider>
        <UserProvider>
          <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <DocumentSidebar 
              isOpen={isSidebarOpen} 
              onToggle={toggleSidebar} 
              isMobile={isMobile} 
              
            />
            
            {/* Main Content Area */}
            <div className={`
              flex-1 flex flex-col
              transition-all duration-300 ease-in-out
              ${!isMobile && isSidebarOpen ? 'ml-60' : 'ml-0'}
              lg:ml-5
              min-h-screen
            `}>
              {/* Header
              <div className="flex-shrink-0 p-4 lg:p-6">
                <DocHeader />
              </div> */}
              
              {/* Main Content - Scrollable */}
              <div className={`flex-1 -ml-${isMobile?0:100} overflow-auto p-4 lg:p-6 pt-0`}>
                <AllDocuments />
              </div>
            </div>
          </div>
        </UserProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default Page;
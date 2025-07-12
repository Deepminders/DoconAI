'use client';

import { useState, useEffect } from 'react';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import UserProfileMenu from '../../../Components/Common/UserProfileMenu'; // Adjust path if needed

export default function EditProfile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simulate fetching user data
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    setProfileData({ ...user, password: '' });
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated profile:', profileData);
    alert('Profile updated successfully!');
    // TODO: Add actual API call to update profile
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-0 lg:ml-60 transition-all duration-300">
        {/* Top bar with profile menu */}
        <div className="flex justify-end mb-6">
          <UserProfileMenu userName={profileData.name} profileImageUrl={profileImage || undefined} />
        </div>

        {/* Profile Edit Form */}
        <div className="flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={profileImage || '/default-profile.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              <label className="mt-2 text-sm text-blue-700 cursor-pointer hover:underline">
                Change Profile Picture
                <input type="file" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={profileData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={profileData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="New Password (Optional)"
                value={profileData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

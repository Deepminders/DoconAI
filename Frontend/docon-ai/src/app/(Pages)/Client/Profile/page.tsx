'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import UserProfileMenu from '../../../Components/Common/UserProfileMenu';
import { useNotifications} from '../../../Components/Common/NotificationSystem';

export default function EditProfile() {
  const [originalData, setOriginalData] = useState({
    company: '',
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    phone: '',
    gender: '',
    user_role: '',
    profile_image_url: '',  // Added this for profile picture URL
  });

  const [formData, setFormData] = useState({ ...originalData, password: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false); // New state for image upload loading
  const notifications = useNotifications();
  useEffect(() => {
  async function fetchUser() {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notifications.error("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/user/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }

      const user = await response.json();

      const backendURL = "http://localhost:8000";
      const fullProfileImageUrl = user.profile_image_url
        ? user.profile_image_url.startsWith('http')
          ? user.profile_image_url
          : backendURL + user.profile_image_url
        : '';

      setOriginalData({
        ...user,
        profile_image_url: fullProfileImageUrl,
      });

      setFormData({
        company: user.company || '',
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        gender: user.gender || '',
        user_role: user.user_role || '',
        profile_image_url: fullProfileImageUrl,
        password: '',
      });

      console.log("Fetched profile image URL:", fullProfileImageUrl);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }
  fetchUser();
}, []);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle form input changes (same as before)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      const edited = Object.keys(updated).some(
        key => key === 'password'
          ? updated[key] !== ''
          : (updated[key as keyof typeof updated] !== originalData[key as keyof typeof originalData] && key !== 'password')
      );

      setIsEdited(edited);
      return updated;
    });
  };

  // Handle profile picture upload
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const token = localStorage.getItem("token");
    if (!token) {
      notifications.error("Authentication required. Please log in.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    try {
      setUploadingImage(true);
      const response = await fetch('http://localhost:8000/user/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }

      const data = await response.json();

      // Update originalData with new profile image url
      const fullImageUrl = `http://localhost:8000${data.profile_image_url}`;
      setOriginalData(prev => ({ ...prev, profile_image_url: fullImageUrl }));
    setFormData(prev => ({ ...prev, profile_image_url: fullImageUrl }));
      notifications.success("Profile picture updated successfully!");

    } catch (err: any) {
     notifications.error(err.message || 'An unexpected error occurred.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Form submit (same as before)
const handleSubmit = async () => {
  try {
    const updatePayload = {
      company_name: formData.company || '',
      first_name: formData.firstname || '',
      last_name: formData.lastname || '',
      email: formData.email || '',
      phone_number: formData.phone || '',
      gender: formData.gender || '',
      password: formData.password || undefined,
    };

    const token = localStorage.getItem('token'); // Adjust if using cookies
    const response = await fetch(`http://localhost:8000/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) throw new Error('Failed to update profile');

    // ✅ Make a fresh GET call to retrieve the updated profile
    const profileRes = await fetch(`http://localhost:8000/user/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileRes.ok) throw new Error('Failed to fetch updated profile');

    const updatedProfile = await profileRes.json();

    const formatted = {
      company: updatedProfile.company || '',
      firstname: updatedProfile.firstname || '',
      lastname: updatedProfile.lastname || '',
      email: updatedProfile.email || '',
      username: updatedProfile.username || '',
      phone: updatedProfile.phone || '',
      gender: updatedProfile.gender || '',
      user_role: updatedProfile.user_role || '',
      profile_image_url: updatedProfile.profile_image_url || '',
    };

    setOriginalData(formatted);
    setFormData({ ...formatted, password: '' });
    setIsEdited(false);
    notifications.success('Profile updated successfully! 🎉');
  } catch (error) {
    console.error(error);
    notifications.error('Error updating profile.');
  }
};

  const backendURL = "http://localhost:8000";
  const getProfileImage = () => {
  const url = originalData.profile_image_url;
  if (
    url &&
    typeof url === "string" &&
    url.trim() !== "" &&
    !url.toLowerCase().includes("null") &&
    !url.toLowerCase().includes("undefined")
  ) {
    // If url already starts with http, just return it
    if (url.startsWith("http")) return url;
    // Otherwise, prepend backend origin
    return backendURL + url;
  }
  return "/default-profile.png";
};
console.log("Profile image URL:", getProfileImage());
  const fields = [
    { label: "Company", name: "company", type: "text" },
    { label: "First Name", name: "firstname", type: "text" },
    { label: "Last Name", name: "lastname", type: "text" },
    { label: "Email Address", name: "email", type: "email" },
    { label: "Username", name: "username", type: "text" },
    { label: "Phone Number", name: "phone", type: "text" },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female"] },
    { label: "User Role", name: "user_role", type: "text", disabled: true },
    { label: "New Password (optional)", name: "password", type: "password" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-700">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      <main
        className="flex-1 flex flex-col p-6 transition-all duration-300 bg-gray-100"
        style={{ marginLeft: isSidebarOpen && !isMobile ? '1rem' : '0' }}
      >
        <div className="w-full flex justify-end mb-6">
          <UserProfileMenu />
        </div>

        <div className="flex justify-center items-start w-full flex-grow">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-5 border-t-4 border-green-700">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Edit Profile</h2>

            <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
              {/* Left Side - Profile Image and Upload */}
              <div className="flex flex-col items-center w-full lg:w-1/3 text-center">
                <div className="relative group w-40 h-40">
   {getProfileImage() ? (
  <img
    src={`${getProfileImage()}?t=${new Date().getTime()}`}
    alt="Profile"
    className="w-full h-full rounded-full object-cover shadow-md border-4 border-blue-900"
  />
) : (
  <img
    src="/default-profile.png"
    alt="Default Profile"
    className="w-full h-full rounded-full object-cover shadow-md border-4 border-gray-500"
  />
)}
    <div
      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      onClick={() => document.getElementById("profile-upload")?.click()}
    >
      <span className="text-white text-sm font-medium">Change</span>
    </div>
    <input
      type="file"
      accept="image/*"
      id="profile-upload"
      onChange={handleImageChange}
      disabled={uploadingImage}
      className="hidden"
    />
  </div>
  {uploadingImage && (
    <p className="text-sm text-blue-600 mt-2 animate-pulse">Uploading image...</p>
  )}
  <p className="text-xl font-semibold text-gray-800 mt-4">
    {originalData.firstname} {originalData.lastname}
  </p>
  <p className="text-sm text-gray-600 mt-1">{originalData.user_role}</p>
              </div>

              {/* Right Side - Form */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full lg:w-2/3"
              >
                {fields.map(({ label, name, type = "text", disabled = false, options }) => (
                  <div key={name} className="flex flex-col">
                    <label
                      htmlFor={name}
                      className="text-sm font-semibold text-gray-700 mb-1"
                    >
                      {label}
                    </label>
                    {type === "select" && options ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange as any}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                                   hover:shadow-sm hover:border-blue-400 text-base"
                        disabled={disabled}
                      >
                        <option value="">Select {label}</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        type={type}
                        name={name}
                        placeholder={label}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange as any}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                                   hover:shadow-sm hover:border-blue-400
                                   disabled:bg-gray-200 disabled:text-gray-500 text-base"
                        autoComplete={name === "password" ? "new-password" : "off"}
                        disabled={disabled}
                      />
                    )}
                  </div>
                ))}

                <div className="col-span-full mt-4">
                  <button
                    type="submit"
                    disabled={!isEdited}
                    className={`w-full py-3 rounded-lg text-white text-lg font-semibold transition
                      ${isEdited ? "bg-blue-900 hover:bg-blue-700 active:bg-blue-800" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

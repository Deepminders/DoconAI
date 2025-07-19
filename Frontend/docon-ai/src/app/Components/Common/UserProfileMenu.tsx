"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

export default function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("/default-profile.png");
  const [userRole, setUserRole] = useState(""); 
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8000/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        setUserName(`${data.firstname || ""} ${data.lastname || ""}`.trim());
        setUserRole(data.user_role || "");
        if (data.profile_image_url) {
          setProfileImageUrl(`http://localhost:8000${data.profile_image_url}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/Client/Login");
  };

  const handleUpdateProfile = () => {
    router.push("/Client/Profile");
  };

  return (
    <div className="relative flex items-center space-x-3 cursor-pointer select-none" ref={dropdownRef}>
      {/* Name and Role */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-right"
        style={{ minWidth: '140px' }}
      >
        <p className="font-medium text-gray-900 truncate">{userName || "User Name"}</p>
        {userRole && (
          <p className="text-sm text-gray-500 font-small truncate">{userRole}</p>
        )}
      </div>

      {/* Profile Image */}
      <img
        src={profileImageUrl}
        alt="Profile"
        onClick={() => setIsOpen((prev) => !prev)}
        className=" w-12 h-12 rounded-full border-2 border-blue-950 hover:border-sky-500 transition-all"
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white text-black rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-600">Signed in as</p>
            <p className="font-semibold truncate">{userName}</p>
            {userRole && (
              <p className="text-sm text-blue-700 font-medium mt-1 truncate">{userRole}</p>
            )}
          </div>
          <button
            onClick={handleUpdateProfile}
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Update Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

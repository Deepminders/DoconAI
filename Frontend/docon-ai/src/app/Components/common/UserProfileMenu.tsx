"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

interface UserProfileMenuProps {
  userName: string;
  profileImageUrl?: string;
}

export default function UserProfileMenu({
  userName,
  profileImageUrl,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

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
    router.push("/Pages/Login"); // Ensure correct route
  };

  const handleUpdateProfile = () => {
    router.push("/Client/Profile");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Only profile image visible until clicked */}
      <img
        src={profileImageUrl || "/default-avatar.png"}
        alt="Profile"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-950 hover:border-sky-500 transition-all"
      />

      {/* Dropdown only rendered if open */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-600">Signed in as</p>
            <p className="font-semibold truncate">{userName}</p>
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

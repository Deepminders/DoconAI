"use client";

import { ReactNode } from "react";

const Button = ({ 
  label, 
  color = "blue", 
  icon, 
  onClick, 
  disabled = false,
  className = "",
  type = "button"
}) => {
  const colorClasses = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    gray: "bg-gray-500 hover:bg-gray-600",
    green: "bg-green-500 hover:bg-green-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${colorClasses[color]} rounded-md transition duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {icon && <span className="icon-container">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
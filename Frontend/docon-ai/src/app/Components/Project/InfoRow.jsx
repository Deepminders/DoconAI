"use client";

const InfoRow = ({ 
  label, 
  value, 
  highlight = "text-gray-800",
  className = "" 
}) => (
  <div className={`flex ${className}`}>
    <span className="font-medium text-gray-600 min-w-[120px]">{label}</span>
    <span className={`ml-2 ${highlight}`}>{value}</span>
  </div>
);

export default InfoRow;
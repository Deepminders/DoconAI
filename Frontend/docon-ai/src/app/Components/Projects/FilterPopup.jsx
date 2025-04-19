import React, { useEffect, useRef } from 'react';

const FilterPopup = ({ isVisible, onClose, onFilterChange, currentFilter }) => {
  const filters = [
    { name: "All Projects", icon: "🌐", color: "bg-gray-100", hoverColor: "hover:bg-gray-200" },
    { name: "In Progress", icon: "⏳", color: "bg-blue-50", hoverColor: "hover:bg-blue-100" },
    { name: "Completed", icon: "✅", color: "bg-green-50", hoverColor: "hover:bg-green-100" },
    { name: "Delayed", icon: "⚠️", color: "bg-amber-50", hoverColor: "hover:bg-amber-100" }
  ];

  const popupRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div
        ref={popupRef}
        className="bg-white w-[95%] max-w-md rounded-xl shadow-2xl border border-sky-100/50 overflow-hidden animate-scaleIn"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              <h3 className="text-xl font-bold">Filter Projects</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">Select a project status to filter</p>
        </div>

        {/* Filter options */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => onFilterChange(filter.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${filter.color} ${filter.hoverColor} ${
                currentFilter === filter.name ? 'ring-2 ring-sky-500' : ''
              }`}
            >
              <span className="text-2xl">{filter.icon}</span>
              <span className="font-medium text-gray-800">{filter.name}</span>
              {currentFilter === filter.name ? (
                <span className="ml-auto bg-sky-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
              ) : (
                <span className="ml-auto text-gray-400 group-hover:text-sky-500 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;


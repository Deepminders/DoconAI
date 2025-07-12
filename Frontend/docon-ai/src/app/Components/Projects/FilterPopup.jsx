import React, { useEffect, useRef } from 'react';
import { Filter, X, Check, Globe, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// Moved outside component to prevent re-creation on each render
const FILTERS_CONFIG = [
  {
    name: "All Projects",
    icon: Globe,
    color: "from-slate-50 to-slate-100",
    hoverColor: "hover:from-slate-100 hover:to-slate-200",
    ringColor: "ring-slate-400",
    iconColor: "text-slate-600"
  },
  {
    name: "In Progress",
    icon: Clock,
    color: "from-blue-50 to-blue-100",
    hoverColor: "hover:from-blue-100 hover:to-blue-200",
    ringColor: "ring-blue-400",
    iconColor: "text-blue-600"
  },
  {
    name: "Completed",
    icon: CheckCircle,
    color: "from-emerald-50 to-emerald-100",
    hoverColor: "hover:from-emerald-100 hover:to-emerald-200",
    ringColor: "ring-emerald-400",
    iconColor: "text-emerald-600"
  },
  {
    name: "Delayed",
    icon: AlertTriangle,
    color: "from-amber-50 to-amber-100",
    hoverColor: "hover:from-amber-100 hover:to-amber-200",
    ringColor: "ring-amber-400",
    iconColor: "text-amber-600"
  }
];

const FilterPopup = ({ isVisible, onClose, onFilterChange, currentFilter }) => {
  const popupRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleFilterSelect = (filterName) => {
    onFilterChange(filterName);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={popupRef}
        className="bg-white w-[95%] max-w-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Filter Projects
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Filter options Grid */}
        <div className="p-5 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-4">
            {FILTERS_CONFIG.map((filter) => {
              const IconComponent = filter.icon;
              const isSelected = currentFilter === filter.name;

              return (
                <button
                  key={filter.name}
                  onClick={() => handleFilterSelect(filter.name)}
                  className={`relative group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1
                    bg-gradient-to-br ${filter.color} ${filter.hoverColor}
                    ${isSelected ? `border-blue-500 shadow-lg ${filter.ringColor}` : 'border-transparent'}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                  <div className={`mb-3 p-3 rounded-full bg-white/70 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                    <IconComponent className={`w-6 h-6 ${filter.iconColor}`} />
                  </div>
                  <span className={`font-semibold text-center ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                    {filter.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
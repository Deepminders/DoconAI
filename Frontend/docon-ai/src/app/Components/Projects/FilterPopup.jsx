import React, { useEffect, useRef } from 'react';
import { Filter, X, Check, ChevronRight, Sparkles, Globe, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const FilterPopup = ({ isVisible, onClose, onFilterChange, currentFilter }) => {
  const filters = [
    {
      name: "All Projects",
      icon: Globe,
      color: "bg-slate-50",
      hoverColor: "hover:bg-slate-100",
      ringColor: "ring-slate-300",
      iconColor: "text-slate-600"
    },
    {
      name: "In Progress",
      icon: Clock,
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      ringColor: "ring-blue-300",
      iconColor: "text-blue-600"
    },
    {
      name: "Completed",
      icon: CheckCircle,
      color: "bg-emerald-50",
      hoverColor: "hover:bg-emerald-100",
      ringColor: "ring-emerald-300",
      iconColor: "text-emerald-600"
    },
    {
      name: "Delayed",
      icon: AlertTriangle,
      color: "bg-amber-50",
      hoverColor: "hover:bg-amber-100",
      ringColor: "ring-amber-300",
      iconColor: "text-amber-600"
    }
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
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={popupRef}
        className="bg-white w-[95%] max-w-md rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 relative"
      >
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500"></div>

        {/* Header */}
        <div className="relative bg-white p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Filter Projects
                </h3>
                <p className="text-sm text-gray-500">Select your preferred view</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filter options */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {filters.map((filter, index) => {
            const IconComponent = filter.icon;
            const isSelected = currentFilter === filter.name;

            return (
              <button
                key={filter.name}
                onClick={() => onFilterChange(filter.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-md transition-all duration-200 group ${filter.color} ${filter.hoverColor} ${isSelected ? `ring-1 ${filter.ringColor} shadow-sm` : ''
                  }`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-white shadow-sm' : 'bg-white/70'
                  }`}>
                  <IconComponent className={`w-4.5 h-4.5 ${filter.iconColor}`} />
                </div>

                <div className="flex-1 text-left">
                  <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                    {filter.name}
                  </span>
                </div>

                <div className="flex items-center">
                  {isSelected ? (
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Apply</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
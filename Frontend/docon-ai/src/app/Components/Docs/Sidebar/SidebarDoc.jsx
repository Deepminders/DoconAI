import React from 'react'

const SidebarDoc = () => {
  return (
    <div className={`
      fixed left-0 top-0
      ${isOpen ? 'z-50' : 'z-30'}
      bg-sky-900 text-white w-60 h-screen p-4
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:z-30
    `}>
      {/* Mobile toggle button (only shown on mobile or when sidebar is closed) */}
      {(isMobile || !isOpen) && (
        <button
          onClick={onToggle}
          className="lg:hidden mb-4 text-white hover:text-sky-200"
          aria-label="Toggle sidebar"
        >
          {isOpen ? "❌ Close" : "📂 Menu"}
        </button>
      )}
      
      {/* Sidebar content */}
      <h2 className="text-xl font-bold">Sidebar</h2>
      <ul className="mt-4 space-y-2">
        <li className="hover:underline cursor-pointer">Dashboard</li>
        <li className="hover:underline cursor-pointer">Projects</li>
        <li className="hover:underline cursor-pointer">Settings</li>
      </ul>
    </div>
  )
}

export default SidebarDoc
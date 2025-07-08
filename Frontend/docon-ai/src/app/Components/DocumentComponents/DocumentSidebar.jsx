import { Book, BoxIcon, Home, LayoutDashboardIcon, Library } from 'lucide-react';

export default function DocumentSidebar({ isOpen, onToggle, isMobile }) {
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
            <div className="row flex mt-0 items-center">
                <BoxIcon width={50} height={50}/>
                <h2 className="text-xl font-bold items-center ml-0">Docon. AI</h2>
            </div>

            <ul className="mt-1 space-y-2">
                    <li className="sidebar-item flex items-center hover:underline cursor-pointer">
                        <Home className=" text-white" width={45} height={45} />
                        <h3 className="hover:underline cursor-pointer mt-0"> Home</h3>
                    </li>
                    <li className="sidebar-item flex items-center hover:underline cursor-pointer">
                        <LayoutDashboardIcon className=" text-white" width={45} height={45} />
                        <h3 className="hover:underline cursor-pointer mt-0 text-1xl">  Dashboard</h3>
                    </li>
                    <li className="sidebar-item flex items-center hover:underline cursor-pointer">
                        <LayoutDashboardIcon className=" text-white" width={45} height={45} />
                        <h3 className="hover:underline cursor-pointer">  Dashboard</h3>
                    </li>
            </ul>
        </div>

    );
}
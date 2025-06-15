import React from 'react';
import Image from 'next/image';
import { Search, Filter, SortAsc, PlusCircle } from 'lucide-react';
import profile from '../../(Pages)/Client/Projects/profile.jpg'; // Update path as needed

const Header = ({
  onFilterClick,
  onSortClick,
  isReversed,
  onNewProjectClick,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="fixed top-0 left-0 lg:left-60 right-0 z-40 pb-4 pt-4 px-4 sm:px-5 bg-white shadow-md md:mb-[250px] transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
        <h2 className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] max-[1330px]:text-[24px] font-bold text-sky-700 whitespace-nowrap">
          MY PROJECTS
        </h2>

        <div className="relative w-full sm:w-64 md:w-96 lg:w-160 flex-grow mx-4 sm:mx-6 md:mx-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search a Project"
            className="w-full pl-10 pr-4 py-2 border-2 sm:border-3 border-sky-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Image
          src={profile}
          alt="User Avatar"
          width={48}
          height={48}
          className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 border-sky-700"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-4">
        <button
          className="flex items-center justify-center gap-1 px-3 py-2 text-white bg-sky-700 rounded-lg hover:bg-sky-600 w-full sm:w-auto"
          onClick={onFilterClick}
        >
          <Filter size={16} />
          Filter
        </button>

        <button
          className="flex items-center justify-center gap-1 px-3 py-2 text-white bg-sky-700 rounded-lg hover:bg-sky-600 w-full sm:w-auto"
          onClick={onSortClick}
        >
          <SortAsc size={16} className={isReversed ? "transform rotate-180" : ""} />
          {isReversed ? "Lastly Updated" : "Recently Updated"}
        </button>

        <button
          className="flex items-center justify-center gap-1 px-4 py-2 text-white bg-sky-700 rounded-lg hover:bg-blue-600 w-full sm:w-auto sm:ml-auto"
          onClick={onNewProjectClick}
        >
          <PlusCircle size={16} />
          New Project
        </button>
      </div>
    </div>
  );
};

export default Header;
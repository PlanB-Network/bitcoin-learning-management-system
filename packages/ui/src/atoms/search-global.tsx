import type React from 'react';
import { useState } from 'react';

interface Filter {
  id: string;
  text: string;
}

interface SearchBarProps {
  setSearch: (value: string) => void;
  setFilters: (selectedFilters: string[]) => void;
  filters: { [key: string]: Filter[] };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  setSearch,
  setFilters,
  filters,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('tab1');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSearch(e.target.value);
  };

  const clearInput = () => {
    setInputValue('');
    setSearch('');
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId],
    );
    setFilters(selectedFilters);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedFilters([]); // Resetuj filtere kad se promeni tab
  };

  return (
    <div className="relative">
      <div className="flex items-center relative">
        <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-2 text-black">
          %
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="block w-full border rounded p-2 text-black"
        />
        {inputValue && (
          <button
            onClick={clearInput}
            className="ml-2 text-black absolute inset-y-0 right-0 flex items-center"
          >
            &times;
          </button>
        )}
        <button onClick={toggleDropdown} className="ml-2">
          🔽
        </button>
      </div>
      {showDropdown && (
        <div className="absolute bg-white border rounded mt-2">
          <div className="flex border-b">
            <button
              onClick={() => handleTabChange('tab1')}
              className={`flex-1 text-black ${activeTab === 'tab1' ? 'font-bold' : ''}`}
            >
              Tab 1
            </button>
            <button
              onClick={() => handleTabChange('tab2')}
              className={`flex-1 text-black ${activeTab === 'tab2' ? 'font-bold' : ''}`}
            >
              Tab 2
            </button>
          </div>
          <div className="flex">
            <div className="flex-1 p-2">
              {activeTab === 'tab1' &&
                filters.tab1.map((filter) => (
                  <label key={filter.id} className="text-black">
                    <input
                      type="checkbox"
                      className="text-black"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => toggleFilter(filter.id)}
                    />
                    {filter.text}
                  </label>
                ))}
            </div>
            <div className="flex-1 p-2">
              {activeTab === 'tab2' &&
                filters.tab2.map((filter) => (
                  <label key={filter.id} className="text-black">
                    <input
                      type="checkbox"
                      className="text-black"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => toggleFilter(filter.id)}
                    />
                    {filter.text}
                  </label>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

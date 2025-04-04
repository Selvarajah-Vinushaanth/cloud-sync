import React, { useState, useEffect } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (onSearch) {
      onSearch(query);
    }
  }, [query, onSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      <div className='flex gap-3 bg-white p-2 rounded-lg items-center w-full'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type='text'
          placeholder='Search files'
          value={query}
          onChange={handleChange}
          className='bg-transparent outline-none w-full text-[14px] text-black'
        />
        {query && (
          <button onClick={() => setQuery('')} className='text-gray-500 text-sm'>Clear</button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Order of the Fallen Star" className="h-8 w-8" />
          <span className="text-xl font-bold">Order of the Fallen Star</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
          <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
          <a href="/fleet" className="hover:text-blue-400 transition-colors">Fleet</a>
          <a href="/join" className="hover:text-blue-400 transition-colors">Join</a>
          <a href="/progress" className="hover:text-blue-400 transition-colors">Progress</a>
        </div>
        <button className="md:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

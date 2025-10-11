import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.svg" alt="Order of the Fallen Star" className="h-6 w-6" />
              <span className="text-lg font-bold">Order of the Fallen Star</span>
            </div>
            <p className="text-gray-400">
              Dedicated to excellence and honor among the stars.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="/fleet" className="text-gray-400 hover:text-white transition-colors">Fleet</a></li>
              <li><a href="/join" className="text-gray-400 hover:text-white transition-colors">Join</a></li>
              <li><a href="/progress" className="text-gray-400 hover:text-white transition-colors">Progress</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Forums</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Events</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: contact@ofs.org</li>
              <li className="text-gray-400">Recruitment: join@ofs.org</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Order of the Fallen Star. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

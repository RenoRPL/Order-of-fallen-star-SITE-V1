import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About Us</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              The Order of the Fallen Star is a distinguished organization founded on the principles of honor, 
              excellence, and mutual support. We strive to create a community where members can achieve their 
              highest potential while contributing to the greater good of our collective mission.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Excellence</h3>
                <p className="text-gray-600">We pursue the highest standards in all our endeavors.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Honor</h3>
                <p className="text-gray-600">We conduct ourselves with integrity and respect.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Unity</h3>
                <p className="text-gray-600">Together, we achieve what none can accomplish alone.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our History</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in the early days of space exploration, the Order of the Fallen Star has grown from a 
              small group of pioneers into a respected organization spanning multiple sectors and specialties. 
              Our name honors those who have sacrificed for the advancement of our shared goals, and our 
              symbol represents the light that guides us through the darkest of times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

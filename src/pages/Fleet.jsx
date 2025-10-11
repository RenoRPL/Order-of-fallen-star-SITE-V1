import React from 'react';

const Fleet = () => {
  const ships = [
    {
      name: "OFS Constellation",
      class: "Dreadnought",
      status: "Active",
      crew: "1,200",
      specialization: "Heavy Combat Operations"
    },
    {
      name: "OFS Phoenix",
      class: "Battlecruiser",
      status: "Active",
      crew: "800",
      specialization: "Exploration & Research"
    },
    {
      name: "OFS Nebula",
      class: "Frigate",
      status: "In Dock",
      crew: "150",
      specialization: "Reconnaissance"
    },
    {
      name: "OFS Starfall",
      class: "Destroyer",
      status: "Active",
      crew: "300",
      specialization: "Fast Attack"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Fleet</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <p className="text-gray-600 text-center leading-relaxed">
              The Order of the Fallen Star maintains a diverse fleet of vessels, each designed for specific 
              missions and operations. Our ships represent the finest in engineering and are crewed by 
              dedicated members committed to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ships.map((ship, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{ship.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ship.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ship.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold text-gray-800">{ship.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crew:</span>
                    <span className="font-semibold text-gray-800">{ship.crew}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-semibold text-gray-800">{ship.specialization}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Fleet Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                <div className="text-gray-600">Active Vessels</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">2,450</div>
                <div className="text-gray-600">Total Crew</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                <div className="text-gray-600">Missions Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                <div className="text-gray-600">Operational Readiness</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fleet;

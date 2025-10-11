import React from 'react';

const Progress = () => {
  const milestones = [
    {
      date: "Q4 2024",
      title: "Fleet Expansion Complete",
      description: "Successfully added two new vessels to our fleet",
      status: "completed"
    },
    {
      date: "Q1 2025",
      title: "New Training Program Launch",
      description: "Implemented advanced training protocols for all members",
      status: "completed"
    },
    {
      date: "Q2 2025",
      title: "Research Initiative",
      description: "Ongoing research into advanced propulsion systems",
      status: "in-progress"
    },
    {
      date: "Q3 2025",
      title: "Outreach Campaign",
      description: "Expanding our recruitment and community engagement efforts",
      status: "planned"
    }
  ];

  const stats = [
    { label: "Total Members", value: "1,247", change: "+12%" },
    { label: "Active Missions", value: "8", change: "+3" },
    { label: "Completion Rate", value: "94%", change: "+2%" },
    { label: "Fleet Readiness", value: "98%", change: "0%" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Progress</h1>
          
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <div className={`text-sm font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stat.change} from last quarter
                </div>
              </div>
            ))}
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Roadmap & Milestones</h2>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-500' 
                      : milestone.status === 'in-progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
                        <p className="text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="text-sm text-gray-500">{milestone.date}</span>
                        <div className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : milestone.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Initiatives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Projects</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Advanced Propulsion Research</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Member Training Program</span>
                    <span className="text-sm text-gray-500">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Fleet Modernization</span>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Completed advanced combat training for 200+ members</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Successfully deployed new communication systems</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Established partnerships with 3 allied organizations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Achieved 100% fleet operational status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;

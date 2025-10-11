import React, { useState } from 'react';

const Join = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    interest: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Application submitted:', formData);
    alert('Application submitted successfully! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Join Our Ranks</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Join the Order?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🚀 Adventure Awaits</h3>
                <p className="text-gray-600">Participate in exciting missions and explore the unknown.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🤝 Strong Community</h3>
                <p className="text-gray-600">Join a supportive community of like-minded individuals.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">📚 Continuous Learning</h3>
                <p className="text-gray-600">Develop new skills and advance your career.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🏆 Recognition</h3>
                <p className="text-gray-600">Your contributions will be valued and recognized.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Application Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Experience Level</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Area of Interest</label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your area of interest</option>
                  <option value="combat">Combat Operations</option>
                  <option value="exploration">Exploration</option>
                  <option value="research">Research & Development</option>
                  <option value="logistics">Logistics</option>
                  <option value="command">Command & Leadership</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Tell us about yourself</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Why do you want to join the Order? What skills and experience do you bring?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Application Process</h3>
            <ol className="text-blue-700 space-y-1">
              <li>1. Submit your application form above</li>
              <li>2. Initial review by our recruitment team (1-3 days)</li>
              <li>3. Interview with department leadership (if selected)</li>
              <li>4. Final decision and welcome aboard!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;

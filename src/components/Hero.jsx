import React from 'react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Order of the Fallen Star
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          A distinguished organization dedicated to excellence, honor, and the pursuit of greatness among the stars.
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Join Our Ranks
          </button>
          <button className="border border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

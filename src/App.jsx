import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome to the Order</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                The Order of the Fallen Star stands as a beacon of excellence, honor, and unity in an ever-expanding universe. 
                We are more than an organization—we are a brotherhood and sisterhood bound by shared values and common purpose.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App

import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <Header />
      
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="hero-title">Welcome to Order of the Fallen Star</h1>
            <p className="hero-subtitle">
              Elite Star Citizen Organization - Forging Legends Among the Stars
            </p>
            <p className="hero-description">
              Join our ranks as we explore the vast universe, engage in epic battles, 
              and build a legacy that will echo through the cosmos.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">150+</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Fleet Ships</div>
              </div>
              <div className="stat">
                <div className="stat-number">5+</div>
                <div className="stat-label">Systems Explored</div>
              </div>
            </div>
            
            <div className="hero-buttons">
              <a href="/join" className="btn primary">Join Our Ranks</a>
              <a href="/fleet" className="btn secondary">Explore Our Fleet</a>
            </div>
          </div>
        </section>
        
        <section className="features-section">
          <div className="features-container">
            <h2>What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Exploration</h3>
                <p>Venture into uncharted territories and discover new worlds</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚔️</div>
                <h3>Combat Operations</h3>
                <p>Engage in strategic battles and protect our interests</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏭</div>
                <h3>Trade & Industry</h3>
                <p>Build economic prosperity through commerce and manufacturing</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Community</h3>
                <p>Join a brotherhood of elite pilots and lifelong friends</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="join-section">
          <div className="join-overlay">
            <div className="join-container">
              <div className="join-content">
                <h2>Ready to Join the Elite?</h2>
                <p className="join-description">
                  Take your place among the stars with Order of the Fallen Star. 
                  Experience epic adventures, forge unbreakable bonds, and become 
                  part of a legendary organization that shapes the galaxy's future.
                </p>
                <div className="join-benefits">
                  <div className="benefit">
                    <span className="benefit-icon">🌟</span>
                    <span>Exclusive missions and events</span>
                  </div>
                  <div className="benefit">
                    <span className="benefit-icon">🚀</span>
                    <span>Access to organization fleet</span>
                  </div>
                  <div className="benefit">
                    <span className="benefit-icon">🤝</span>
                    <span>Active community support</span>
                  </div>
                </div>
                <div className="join-buttons">
                  <a href="/join" className="btn primary">Join Now</a>
                  <a href="https://discord.gg/3dhZ38nbNZ" target="_blank" rel="noopener noreferrer" className="btn secondary">
                    Join Discord
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

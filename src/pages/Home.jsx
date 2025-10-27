import React, { useRef, useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { contentService } from '../services/contentService'
import './Home.css'

export default function Home() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [content, setContent] = useState(contentService.getContent());

  useEffect(() => {
    // Listen for content updates
    const updateContent = () => {
      setContent(contentService.getContent());
    };

    // Update content when component mounts
    updateContent();

    // Optional: Add event listener for real-time updates
    window.addEventListener('contentUpdated', updateContent);
    
    // Handle escape key to close modal
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedPath(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('contentUpdated', updateContent);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleCardClick = (index) => {
    setSelectedPath(index);
  };

  const closeModal = () => {
    setSelectedPath(null);
  };

  const refreshPaths = async () => {
    await contentService.refreshPaths();
  };

  return (
    <div className="home-page">
      <Header />
      
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="hero-title">{content.hero.title}</h1>
            <p className="hero-subtitle">
              {content.hero.subtitle}
            </p>
            <p className="hero-description">
              {content.hero.description}
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">{content.hero.stats.members}</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat">
                <div className="stat-number">{content.hero.stats.ships}</div>
                <div className="stat-label">Fleet Ships</div>
              </div>
              <div className="stat">
                <div className="stat-number">{content.hero.stats.systems}</div>
                <div className="stat-label">Systems Explored</div>
              </div>
            </div>
            
            <div className="hero-buttons">
              <a href="/join" className="btn primary">{content.hero.buttons.primary}</a>
              <a href="/fleet" className="btn secondary">{content.hero.buttons.secondary}</a>
            </div>
          </div>
        </section>
        
        <section className="features-section">
          <div className="features-container">
            <h2>{content.features.title}</h2>
            <div className="features-grid">
              {content.features.cards.map((card, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="destiny-section">
          <div className="destiny-container">
            <h2>{content.destiny.title}</h2>
            <p className="destiny-subtitle">{content.destiny.subtitle}</p>
            
            <div className="destiny-cards">
              {content.destiny.paths.map((path, index) => (
                <div key={index} className="destiny-card" 
                     onClick={() => handleCardClick(index)}>
                  <img 
                    src={path.image}
                    alt={path.title}
                    className="destiny-image"
                  />
                  
                  <div className="card-overlay">
                    <h3>{path.title}</h3>
                    <p>{path.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Path Modal */}
          {selectedPath !== null && (
            <div className={`path-modal-overlay ${selectedPath !== null ? 'visible' : ''}`} 
                 onClick={closeModal}>
              <div className="path-modal" onClick={(e) => e.stopPropagation()}>
                <button className="path-modal-close" onClick={closeModal}>
                  &times;
                </button>
                <div className="path-modal-content">
                  <div className="path-modal-image">
                    <img 
                      src={content.destiny.paths[selectedPath].heroImage || content.destiny.paths[selectedPath].image}
                      alt={content.destiny.paths[selectedPath].title}
                    />
                  </div>
                  <div className="path-modal-info">
                    <h3 className="path-modal-title">{content.destiny.paths[selectedPath].title}</h3>
                    <h4 className="path-modal-subtitle">{content.destiny.paths[selectedPath].subtitle}</h4>
                    
                    <div className="path-modal-description">
                      <p>{content.destiny.paths[selectedPath].description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        
        <section className="join-section">
          <div className="join-overlay">
            <div className="join-container">
              <div className="join-content">
                <h2>{content.join.title}</h2>
                <p className="join-description">
                  {content.join.description}
                </p>
                <div className="join-benefits">
                  {content.join.benefits.map((benefit, index) => (
                    <div key={index} className="benefit">
                      <span className="benefit-icon">{benefit.icon}</span>
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
                <div className="join-buttons">
                  <a href="/join" className="btn primary">{content.join.buttons.primary}</a>
                  <a href="https://discord.gg/3dhZ38nbNZ" target="_blank" rel="noopener noreferrer" className="btn secondary">
                    {content.join.buttons.secondary}
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

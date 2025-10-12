import React, { useRef, useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { contentService } from '../services/contentService'
import './Home.css'

export default function Home() {
  const videoRefs = useRef([]);
  const [expandedCard, setExpandedCard] = useState(null);
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
    
    return () => {
      window.removeEventListener('contentUpdated', updateContent);
    };
  }, []);

  const handleMouseEnter = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].currentTime = 0;
      videoRefs.current[index].play();
    }
  };

  const handleMouseLeave = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].pause();
      videoRefs.current[index].currentTime = 0;
    }
  };

  const handleCardClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
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
              {content.destiny.ranks.map((rank, index) => (
                <div key={index} className={`destiny-card ${expandedCard === index ? 'expanded' : ''}`} 
                     onMouseEnter={() => handleMouseEnter(index)}
                     onMouseLeave={() => handleMouseLeave(index)}
                     onClick={() => handleCardClick(index)}>
                  <video 
                    ref={(el) => videoRefs.current[index] = el}
                    className="destiny-video" 
                    muted 
                    loop 
                    playsInline
                    preload="metadata">
                    <source src={`/video cards/Card ${index + 1}.mp4`} type="video/mp4" />
                  </video>
                  
                  <div className={`card-overlay ${expandedCard === index ? 'hidden' : ''}`}>
                    <h3>{rank.title}</h3>
                    <p>{rank.subtitle}</p>
                  </div>

                  <div className={`card-details ${expandedCard === index ? 'visible' : ''}`}>
                    <button className="details-close" onClick={(e) => {e.stopPropagation(); setExpandedCard(null);}}>
                      &times;
                    </button>
                    <div className="details-content">
                      <h3 className="details-title">{rank.title}</h3>
                      <h4 className="details-subtitle">{rank.subtitle}</h4>
                      
                      <div className="details-description">
                        <p>{rank.description}</p>
                      </div>

                      <div className="details-responsibilities">
                        <h5>Key Responsibilities:</h5>
                        <ul>
                          {rank.responsibilities.map((responsibility, respIndex) => (
                            <li key={respIndex}>{responsibility}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

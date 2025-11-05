import React, { useRef, useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { contentService } from '../services/contentService'
import OFSDataService from '../services/ofsDataService'
import './Home.css'

export default function Home() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for content updates
    const updateContent = () => {
      try {
        const newContent = contentService.getContent();
        console.log('Content updated in Home component:', newContent);
        setContent(newContent);
      } catch (error) {
        console.error('Error getting content:', error);
        // Set minimal fallback content
        setContent({
          hero: {
            title: "Welcome to Order of the Fallen Star",
            subtitle: "Elite Star Citizen Organization - Forging Legends Among the Stars",
            description: "Under the light of the Fallen Star, we bind our blades, our names, and our futures. This Codex governs all from Serf to Primarch.",
            stats: { members: "150+", quests: "50+", systems: "2" },
            buttons: { primary: "Join Our Ranks", secondary: "RSI Page" }
          },
          features: { title: "What We Offer", cards: [] },
          destiny: { title: "Choose Your Path", subtitle: "Select your role and define your legacy among the stars", paths: [] },
          socialLinks: {
            discord: { url: "https://discord.gg/3dhZ38nbNZ", enabled: true },
            spectrum: { url: "https://robertsspaceindustries.com/en/orgs/FALLSTR", enabled: true }
          }
        });
      }
    };

    // Initialize content and wait for dynamic data
    const initializeContent = async () => {
      console.log('Initializing Home component...');
      
      // Get initial content immediately (default or cached)
      updateContent();
      
      // Wait for dynamic data to load
      try {
        await contentService.waitForInitialization();
        console.log('Content service initialized');
        // Update with loaded data
        updateContent();
      } catch (error) {
        console.error('Error waiting for initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeContent();

    // Add event listener for real-time updates
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

  // Show loading state if content is not available
  if (!content) {
    return (
      <div className="home-page">
        <Header />
        <main className="home-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            color: '#39b9ff',
            fontSize: '1.2rem'
          }}>
            Loading...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="hero-title">{content?.hero?.title || "Welcome to Order of the Fallen Star"}</h1>
            <p className="hero-subtitle">
              {content?.hero?.subtitle || "Elite Star Citizen Organization"}
            </p>
            <p className="hero-description">
              {content?.hero?.description || "Join our ranks and forge your legend among the stars."}
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">{content?.hero?.stats?.members || "150+"}</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat">
                <div className="stat-number">{content?.hero?.stats?.quests || "50+"}</div>
                <div className="stat-label">Total Quests Completed</div>
              </div>
              <div className="stat">
                <div className="stat-number">{content?.hero?.stats?.systems || "2"}</div>
                <div className="stat-label">Systems Held</div>
              </div>
            </div>
            
            <div className="hero-buttons">
              <a href={content?.socialLinks?.discord?.url || "https://discord.gg/3dhZ38nbNZ"} target="_blank" rel="noopener noreferrer" className="btn primary">{content?.hero?.buttons?.primary || "Join Our Ranks"}</a>
              <a href={content?.socialLinks?.spectrum?.url || "https://robertsspaceindustries.com/en/orgs/FALLSTR"} target="_blank" rel="noopener noreferrer" className="btn secondary">{content?.hero?.buttons?.secondary || "RSI Page"}</a>
            </div>
          </div>
        </section>
        
        <section className="features-section" id="what-we-offer">
          <div className="features-container">
            <h2>{content?.features?.title || "What We Offer"}</h2>
            <div className="features-grid">
              {(content?.features?.cards || []).map((card, index) => (
                <div key={index} className="feature-card">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="destiny-section">
          <div className="destiny-container">
            <h2>{content?.destiny?.title || "Choose Your Path"}</h2>
            <p className="destiny-subtitle">{content?.destiny?.subtitle || "Select your role and define your legacy among the stars"}</p>
            
            <div className="destiny-cards">
              {(content?.destiny?.paths || []).map((path, index) => (
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
          {selectedPath !== null && content?.destiny?.paths?.[selectedPath] && (
            <div className={`path-modal-overlay ${selectedPath !== null ? 'visible' : ''}`} 
                 onClick={closeModal}>
              <div className="path-modal" onClick={(e) => e.stopPropagation()}>
                <button className="path-modal-close" onClick={closeModal}>
                  &times;
                </button>
                <div className="path-modal-content">
                  <div className="path-modal-image">
                    <img 
                      src={content?.destiny?.paths?.[selectedPath]?.heroImage || content?.destiny?.paths?.[selectedPath]?.image || '/Role Path/The Explorer.jpg'}
                      alt={content?.destiny?.paths?.[selectedPath]?.title || 'Path Image'}
                    />
                  </div>
                  <div className="path-modal-info">
                    <h3 className="path-modal-title">{content?.destiny?.paths?.[selectedPath]?.title || 'Path Title'}</h3>
                    <h4 className="path-modal-subtitle">{content?.destiny?.paths?.[selectedPath]?.subtitle || 'Path Subtitle'}</h4>
                    
                    <div className="path-modal-description">
                      <p>{content?.destiny?.paths?.[selectedPath]?.description || 'Path description loading...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        
        <section 
          className="join-section"
          style={{
            backgroundImage: `url('${OFSDataService.convertImgurUrl(content?.join?.backgroundImage) || '/Join Fallen Star BG.png'}')`
          }}
        >
          <div className="join-overlay">
            <div className="join-container">
              <div className="join-content">
                <h2>{content?.join?.title || "Ready to Join the Elite?"}</h2>
                <p className="join-description">
                  {content?.join?.description || "Take your place among the stars with Order of the Fallen Star."}
                </p>
                <div className="join-benefits">
                  {(content?.join?.benefits || []).map((benefit, index) => (
                    <div key={index} className="benefit">
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
                <div className="join-buttons">
                  <a href="https://robertsspaceindustries.com/en/orgs/FALLSTR" target="_blank" rel="noopener noreferrer" className="btn primary">{content?.join?.buttons?.primary || "Join Org"}</a>
                  <a href="https://discord.gg/3dhZ38nbNZ" target="_blank" rel="noopener noreferrer" className="btn secondary">
                    {content?.join?.buttons?.secondary || "Join Discord"}
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

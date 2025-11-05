import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OFSDataService from '../services/ofsDataService'
import './Primarchs.css'

export default function Primarchs() {
  const [primarchs, setPrimarchs] = useState([])
  const [selectedPrimarch, setSelectedPrimarch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPrimarchs()
  }, [])

  const loadPrimarchs = async () => {
    try {
      setIsLoading(true)
      console.log('Loading Primarchs...')
      
      // Fetch member log data
      const memberLogUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=2052923864&single=true&output=csv'
      const members = await OFSDataService.fetchCSV(memberLogUrl)
      
      console.log('All members:', members)
      
      // Filter for Primarch rank (Column C)
      const primarchMembers = members.filter(member => {
        const rank = member['Rank'] || member.C || member.rank || ''
        return rank.toLowerCase().includes('primarch')
      })
      
      console.log('Primarch members found:', primarchMembers)
      
      // Map to primarch data with role-based images
      const primarchData = primarchMembers.map(member => {
        const role = member['Role'] || member.D || member.role || ''
        const backstory = member['Back Story'] || member.J || member.backstory || member['Backstory'] || 'No backstory available.'
        const rsiHandle = member['RSI Handle'] || member.B || member['Name'] || 'Unknown'
        const username = member['Username'] || member.B || rsiHandle || 'Unknown'
        const discordName = member['Discord Name'] || member.A || ''
        
        console.log('Processing Primarch:', { name, role, backstory })
        
        // Map role to images
        const roleImageMap = {
          'Harmony': {
            card: '/Role Path/Harmony.jpg',
            hero: '/Role Path/Harmony - Hero.png'
          },
          'Conquest': {
            card: '/Role Path/Conquest.jpg',
            hero: '/Role Path/Conquest - Hero.png'
          },
          'Justice': {
            card: '/Role Path/Justice.jpg',
            hero: '/Role Path/Justice - Hero.png'
          }
        }
        
        const images = roleImageMap[role] || {
          card: '/Role Path/Harmony.jpg',
          hero: '/Role Path/Harmony - Hero.png'
        }
        
        return {
          rsiHandle: rsiHandle,
          username: username,
          discordName: discordName,
          role: role,
          backstory: backstory,
          cardImage: images.card,
          heroImage: images.hero
        }
      })
      
      console.log('Final primarch data:', primarchData)
      setPrimarchs(primarchData)
      setError(null)
    } catch (error) {
      console.error('Error loading primarchs:', error)
      setError('Failed to load Primarchs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (primarch) => {
    setSelectedPrimarch(primarch)
  }

  const closeModal = () => {
    setSelectedPrimarch(null)
  }

  // Format backstory text (handles both HTML and plain text)
  const formatBackstoryText = (text) => {
    if (!text) return null
    
    // Check if the text contains HTML tags
    const hasHtmlTags = /<[^>]*>/.test(text)
    
    if (hasHtmlTags) {
      // For HTML content, render as HTML
      return (
        <div 
          className="backstory-html-content"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )
    } else {
      // For plain text, use paragraph formatting
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
      
      return paragraphs.map((paragraph, index) => {
        const formattedParagraph = paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
        
        return (
          <p key={index} className="backstory-paragraph">
            {formattedParagraph}
          </p>
        )
      })
    }
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="primarchs-page">
      <Header />
      
      <main className="primarchs-content">
        {/* Hero Section */}
        <section className="primarchs-hero">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="primarchs-title">The Primarchs</h1>
            <p className="primarchs-subtitle">
              The legendary founders and leaders of Order of the Fallen Star
            </p>
            <p className="primarchs-description">
              Meet the elite warriors who forged our organization and continue to lead us into the stars. 
              Each Primarch represents a pillar of our Order, guiding members on their chosen paths.
            </p>
          </div>
        </section>

        {/* Primarchs Grid */}
        <section className="primarchs-grid-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading Primarchs...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={loadPrimarchs} className="retry-button">
                Retry
              </button>
            </div>
          ) : primarchs.length === 0 ? (
            <div className="no-primarchs">
              <p>No Primarchs found at this time.</p>
            </div>
          ) : (
            <div className="primarchs-grid">
              {primarchs.map((primarch, index) => (
                <div
                  key={index}
                  className="primarch-card"
                  onClick={() => handleCardClick(primarch)}
                >
                  <div className="card-image-wrapper">
                    <img
                      src={primarch.cardImage}
                      alt={primarch.username}
                      className="card-image"
                      loading="lazy"
                    />
                    <div className="card-overlay">
                      <div className="card-role-badge">{primarch.role}</div>
                    </div>
                  </div>
                  <div className="card-info">
                    <h3 className="card-title">{primarch.username}</h3>
                    <p className="card-role">Primarch of {primarch.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal for Primarch Details */}
      {selectedPrimarch && (
        <div className="primarch-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            
            <div className="modal-hero-image">
              <img
                src={selectedPrimarch.heroImage}
                alt={selectedPrimarch.username}
                className="hero-image"
              />
              <div className="modal-hero-overlay">
                <h2 className="modal-title">{selectedPrimarch.username}</h2>
                <p className="modal-subtitle">Primarch of {selectedPrimarch.role}</p>
              </div>
            </div>
            
            <div className="modal-body">
              <h3 className="backstory-title">Backstory</h3>
              <div className="backstory-content">
                {formatBackstoryText(selectedPrimarch.backstory)}
              </div>
              
              <div className="primarch-details">
                {selectedPrimarch.rsiHandle && (
                  <div className="detail-item">
                    <span className="detail-label">RSI Handle:</span>
                    <span className="detail-value">{selectedPrimarch.rsiHandle}</span>
                  </div>
                )}
                {selectedPrimarch.discordName && (
                  <div className="detail-item">
                    <span className="detail-label">Discord:</span>
                    <span className="detail-value">{selectedPrimarch.discordName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

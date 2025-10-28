import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { googleSheetsService } from '../services/googleSheetsService'
import './Header.css'
import LoginButton from './LoginButton'

export default function Header({ commandCenterProps }) {
  const { user, userStats, isAuthenticated } = useAuth()
  const [showingStats, setShowingStats] = useState(false)
  const [currentStatIndex, setCurrentStatIndex] = useState(0)
  const [userPatrolStats, setUserPatrolStats] = useState(null)
  const [formattedStats, setFormattedStats] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState('')

  // Fetch user patrol stats when user is available
  useEffect(() => {
    if (user && user.id) {
      const fetchStats = async () => {
        try {
          const stats = await googleSheetsService.fetchUserStats(user.id)
          setUserPatrolStats(stats)
          setFormattedStats(googleSheetsService.getFormattedStats(stats))
        } catch (error) {
          console.error('Error fetching patrol stats:', error)
        }
      }
      
      fetchStats()
    }
  }, [user])

  // Initialize display text
  useEffect(() => {
    if (user) {
      setDisplayText(userStats?.orgName || user.username)
    }
  }, [user, userStats])

  // Cycling logic with fade transitions
  useEffect(() => {
    if (!isAuthenticated || !user || formattedStats.length === 0) return

    let cycleTimer
    let isInNamePhase = true
    let currentIndex = 0

    const startCycle = () => {
      // Function to transition to next content
      const transitionToNext = () => {
        setIsTransitioning(true)
        
        // Fade out current content
        setTimeout(() => {
          if (isInNamePhase) {
            // Switch to stats phase
            isInNamePhase = false
            setShowingStats(true)
            currentIndex = 0
            setDisplayText(`${formattedStats[currentIndex].label}: ${formattedStats[currentIndex].value}`)
            setCurrentStatIndex(currentIndex)
            
            // Schedule next stat in 4 seconds
            cycleTimer = setTimeout(transitionToNext, 4000)
          } else {
            // Currently showing stats
            currentIndex++
            
            if (currentIndex >= formattedStats.length) {
              // Finished all stats, go back to name
              isInNamePhase = true
              setShowingStats(false)
              setDisplayText(userStats?.orgName || user.username)
              
              // Schedule name phase for 15 seconds
              cycleTimer = setTimeout(transitionToNext, 15000)
            } else {
              // Show next stat
              setDisplayText(`${formattedStats[currentIndex].label}: ${formattedStats[currentIndex].value}`)
              setCurrentStatIndex(currentIndex)
              
              // Schedule next stat in 4 seconds
              cycleTimer = setTimeout(transitionToNext, 4000)
            }
          }
          
          // Fade back in
          setTimeout(() => {
            setIsTransitioning(false)
          }, 50) // Brief moment to ensure content is updated
        }, 250) // Half of transition duration
      }

      // Start with name for 15 seconds
      setDisplayText(userStats?.orgName || user.username)
      setShowingStats(false)
      
      // Schedule first transition to stats after 15 seconds
      cycleTimer = setTimeout(transitionToNext, 15000)
    }

    startCycle()

    return () => {
      if (cycleTimer) {
        clearTimeout(cycleTimer)
      }
    }
  }, [isAuthenticated, user, formattedStats, userStats])

  const getAvatarUrl = (userId, avatarHash) => {
    if (!avatarHash) {
      const defaultAvatar = (parseInt(user?.discriminator || '0') % 5)
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Order of the Fallen Star" className="logo" />
            <span className="org-name">Order of the Fallen Star</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <a href="/#what-we-offer" className="nav-link">About</a>
          <a href="/fleet" className="nav-link">Fleet</a>
          <a href="/primarchs" className="nav-link">Primarchs</a>
          <a href="/codex" className="nav-link">Codex</a>
        </nav>
        
        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              {/* Command Center Pill - Position behind profile pill */}
              {commandCenterProps && (
                <div className="command-pill-container">
                  <div 
                    className={`command-pill ${commandCenterProps.isCommandCenterOpen ? 'expanded' : 'collapsed'}`}
                    onClick={() => commandCenterProps.setIsCommandCenterOpen(!commandCenterProps.isCommandCenterOpen)}
                  >
                    <div className="command-pill-tab">
                      <span className="command-pill-text">CMD</span>
                    </div>
                    
                    <div className="command-pill-content">
                      <div className="command-pill-buttons">
                        {commandCenterProps.memberData?.RSI_Verified || commandCenterProps.rsiData ? (
                          <button className="pill-btn success">
                            <span className="pill-btn-text">RSI ✓</span>
                          </button>
                        ) : (
                          <button className="pill-btn primary" onClick={(e) => {e.stopPropagation(); commandCenterProps.openRsiModal();}}>
                            <span className="pill-btn-text">Link RSI</span>
                          </button>
                        )}
                        <button className="pill-btn secondary">
                          <span className="pill-btn-text">Profile</span>
                        </button>
                        <button className="pill-btn secondary">
                          <span className="pill-btn-text">Privacy</span>
                        </button>
                        <button className="pill-btn danger" onClick={(e) => {e.stopPropagation(); commandCenterProps.handleLogout();}}>
                          <span className="pill-btn-text">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link to="/profile" className="profile-link">
                <div className="avatar-container">
                  <img 
                    src={getAvatarUrl(user.id, user.avatar)} 
                    alt="Profile"
                    className="profile-avatar"
                  />
                  {userStats?.rankIcon && (
                    <img 
                      src={userStats.rankIcon} 
                      alt="Rank Icon" 
                      className="rank-icon-large rank-overlay"
                      onError={(e) => {
                        console.error('Failed to load rank icon:', userStats.rankIcon)
                        e.target.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Rank icon loaded successfully:', userStats.rankIcon)
                      }}
                    />
                  )}
                </div>
                <div className="profile-info">
                  <span className={`profile-name ${showingStats ? 'cycling-stats' : ''} ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                    {displayText}
                  </span>
                  <div className="profile-details">
                    <div className="profile-stat">
                      <span className="profile-rank">{userStats?.rank || 'Loading...'}</span>
                      <span className="profile-label">Rank</span>
                    </div>
                    <span className="profile-separator">•</span>
                    <div className="profile-stat">
                      <span className="profile-role">{userStats?.role || 'Loading...'}</span>
                      <span className="profile-label">Role</span>
                    </div>
                    <span className="profile-separator">•</span>
                    <div className="profile-stat">
                      <span className="profile-path">{userStats?.path || 'Loading...'}</span>
                      <span className="profile-label">Path</span>
                    </div>
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  )
}

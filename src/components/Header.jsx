import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { googleSheetsService } from '../services/googleSheetsService'
import { contentService } from '../services/contentService'
import './Header.css'
import LoginButton from './LoginButton'

export default function Header() {
  const { user, userStats, isAuthenticated } = useAuth()
  const [showingStats, setShowingStats] = useState(false)
  const [currentStatIndex, setCurrentStatIndex] = useState(0)
  const [userPatrolStats, setUserPatrolStats] = useState(null)
  const [formattedStats, setFormattedStats] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [headerNav, setHeaderNav] = useState(null)

  // Load header navigation settings
  useEffect(() => {
    const content = contentService.getContent()
    setHeaderNav(content.headerNav || {
      about: { label: "About", visible: true, href: "/#what-we-offer" },
      fleet: { label: "Fleet", visible: true, href: "/fleet" },
      primarchs: { label: "Primarchs", visible: true, href: "/primarchs" },
      codex: { label: "Codex", visible: true, href: "/codex" }
    })
  }, [])

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
          {headerNav && headerNav.about?.visible && (
            <a href={headerNav.about.href} className="nav-link">{headerNav.about.label}</a>
          )}
          {headerNav && headerNav.fleet?.visible && (
            <a href={headerNav.fleet.href} className="nav-link">{headerNav.fleet.label}</a>
          )}
          {headerNav && headerNav.primarchs?.visible && (
            <a href={headerNav.primarchs.href} className="nav-link">{headerNav.primarchs.label}</a>
          )}
          {headerNav && headerNav.codex?.visible && (
            <a href={headerNav.codex.href} className="nav-link">{headerNav.codex.label}</a>
          )}
        </nav>
        
        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
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

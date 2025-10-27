import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { googleSheetsService } from '../services/googleSheetsService'
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

    const initialTimer = setTimeout(() => {
      setShowingStats(true)
      
      // Function to transition to next stat
      const transitionToNext = () => {
        setIsTransitioning(true)
        
        // Fade out current content
        setTimeout(() => {
          // Update content during fade
          setCurrentStatIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % formattedStats.length
            setDisplayText(`${formattedStats[nextIndex].label}: ${formattedStats[nextIndex].value}`)
            return nextIndex
          })
          
          // Fade back in
          setTimeout(() => {
            setIsTransitioning(false)
          }, 50) // Brief moment to ensure content is updated
        }, 250) // Half of transition duration
      }

      // Set initial stat
      setDisplayText(`${formattedStats[0].label}: ${formattedStats[0].value}`)
      
      // Start cycling through stats every 4 seconds
      const interval = setInterval(transitionToNext, 4000)

      return () => clearInterval(interval)
    }, 15000) // Show name for 15 seconds first

    return () => clearTimeout(initialTimer)
  }, [isAuthenticated, user, formattedStats])

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
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  )
}

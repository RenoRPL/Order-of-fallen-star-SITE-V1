import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import OFSDataService from '../services/ofsDataService'
import './UC_Profile_Minimal.css'

const UC_Profile_Minimal = () => {
  const { user, isAuthenticated, login } = useAuth()
  const [memberData, setMemberData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true)
          console.log('User data:', user)
          console.log('User ID:', user.id)
          
          // Check if OFSDataService has the function
          if (typeof OFSDataService.getPatrolStats !== 'function') {
            console.error('getPatrolStats function not found in OFSDataService')
            setError('Service error: getPatrolStats function not available')
            setLoading(false)
            return
          }
          
          // Get patrol stats using Discord ID
          const patrolStats = await OFSDataService.getPatrolStats(user.id)
          console.log('Patrol stats response:', patrolStats)
          
          if (patrolStats) {
            setMemberData(patrolStats)
            setError(null)
          } else {
            setError('No patrol stats found for your Discord account')
          }
        } catch (err) {
          console.error('Error loading member data:', err)
          setError(`Failed to load member data: ${err.message}`)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        if (!isAuthenticated) {
          setShowLoginModal(true)
        }
      }
    }

    loadData()
  }, [isAuthenticated, user])

  const handleDiscordLogin = () => {
    console.log('Discord login button clicked!')
    console.log('Login function:', login)
    try {
      login()
    } catch (error) {
      console.error('Error calling login function:', error)
    }
  }

  const closeModal = () => {
    setShowLoginModal(false)
    // Redirect back to home page
    window.location.href = '/'
  }

  // Login Modal
  if (showLoginModal && !isAuthenticated) {
    return (
      <div className="login-modal-overlay">
        <div className="login-modal">
          <button className="modal-close" onClick={closeModal}>
            ✕
          </button>
          <div className="modal-content">
            <h2>Member Stats Access</h2>
            <p>Please sign in with Discord to view your member statistics (Beta)</p>
            <button onClick={handleDiscordLogin} className="modal-discord-btn">
              Sign in with Discord
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="loading-stats">
            <div className="loading-spinner"></div>
            <h2>Loading Member Stats...</h2>
            <p>Fetching your data from the organization database</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="error-stats">
            <h2>❌ Error Loading Stats</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Member not found
  if (!memberData) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="member-not-found">
            <h2>👤 Member Not Found</h2>
            <p>Discord User: <strong>{user.username}</strong></p>
            <p>Your Discord account is not yet registered in our member database.</p>
            <div className="contact-info">
              <p>Please contact leadership to get your stats added to the system.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Display member stats
  return (
    <div className="uc-stats-page">
      <div className="stats-container">
        
        {/* Member Header */}
        <div className="member-header">
          <div className="member-avatar">
            {user.avatar ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                alt={user.username}
              />
            ) : (
              <div className="default-avatar">{user.username?.charAt(0)?.toUpperCase()}</div>
            )}
          </div>
          <div className="member-info">
            <h1>{memberData.DisplayName || user.username}</h1>
            <div className="member-details">
              <span className="discord-tag">@{user.username}</span>
              <span className="rank">Active Member</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          
          {/* Activity Stats */}
          <div className="stat-card">
            <h3>� Activity Stats</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">Total Patrols</span>
                <span className="value highlight">{memberData.PatrolCount || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Last Patrol</span>
                <span className="value">
                  {memberData.LastPatrolDate && memberData.LastPatrolDate !== '' 
                    ? new Date(memberData.LastPatrolDate).toLocaleDateString()
                    : 'No patrols yet'
                  }
                </span>
              </div>
              <div className="stat-row">
                <span className="label">First Patrol</span>
                <span className="value">
                  {memberData.FirstPatrolDate && memberData.FirstPatrolDate !== '' 
                    ? new Date(memberData.FirstPatrolDate).toLocaleDateString()
                    : 'No patrols yet'
                  }
                </span>
              </div>
              <div className="stat-row">
                <span className="label">Total Length</span>
                <span className="value">{memberData.TotalLength || 0} hours</span>
              </div>
            </div>
          </div>

          {/* Combat Stats */}
          <div className="stat-card">
            <h3>⚔️ Combat Stats</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">FPS Kills</span>
                <span className="value highlight">{memberData.FPS_Kills_Total || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Ship Kills</span>
                <span className="value highlight">{memberData.Ship_Kills_Total || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Turret Kills</span>
                <span className="value highlight">{memberData.Turret_Kills_Total || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Crusades</span>
                <span className="value">{memberData.Crusades_Total || 0}</span>
              </div>
            </div>
          </div>

          {/* Mission Stats */}
          <div className="stat-card">
            <h3>🎯 Mission Stats</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">Quests Completed</span>
                <span className="value highlight">{memberData.Quest_Total || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Quests Led</span>
                <span className="value highlight">{memberData.Led_Completed_Quests || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Crusades Led</span>
                <span className="value highlight">{memberData.Led_Completed_Crusades || 0}</span>
              </div>
              <div className="stat-row">
                <span className="label">Star Citizen Patrols</span>
                <span className="value">{memberData['Game:Star Citizen Patrols'] || 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="stats-footer">
          <p>Data last updated: {new Date().toLocaleDateString()}</p>
          <p>For questions about your stats, contact organization leadership</p>
        </div>

      </div>
    </div>
  )
}

export default UC_Profile_Minimal

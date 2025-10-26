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
          <div className="error-message">
            <h2>⚠️ Error Loading Stats</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
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

  // Display member stats with new layout
  return (
    <div className="uc-stats-page">
      <div className="stats-container">
        
        {/* Profile Layout */}
        <div className="profile-layout">
          
          {/* Left Sidebar - Member Info */}
          <div className="left-sidebar">
            <div className="search-section">
              <div className="input-field">
                <input type="text" placeholder="Search Bar For Other Members" disabled />
              </div>
            </div>
            
            <div className="member-info-section">
              <div className="input-field">
                <label>Character Name</label>
                <input type="text" value={memberData.DisplayName || user.username} readOnly />
              </div>
              
              <div className="input-field">
                <label>Rank Name</label>
                <input type="text" value="Active Member" readOnly />
              </div>
              
              <div className="input-field">
                <label>Role Name</label>
                <input type="text" value="Organization Member" readOnly />
              </div>
              
              <div className="input-field">
                <label>Chapter Name</label>
                <input type="text" value="Order of the Fallen Star" readOnly />
              </div>
            </div>
          </div>

          {/* Center Section - Wall of Medals */}
          <div className="center-section">
            <h3>Wall of Medals</h3>
            <div className="medals-grid">
              {/* Top row of medals */}
              <div className="medal-row">
                <div className={`medal ${(memberData.PatrolCount || 0) >= 1 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.PatrolCount || 0) >= 3 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.PatrolCount || 0) >= 5 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.FPS_Kills_Total || 0) >= 10 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.Quest_Total || 0) >= 5 ? 'earned' : ''}`}>⭐</div>
              </div>
              {/* Bottom row of medals */}
              <div className="medal-row">
                <div className={`medal ${(memberData.Led_Completed_Quests || 0) >= 1 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.FPS_Kills_Total || 0) >= 25 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.PatrolCount || 0) >= 10 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.Quest_Total || 0) >= 10 ? 'earned' : ''}`}>⭐</div>
                <div className={`medal ${(memberData.Led_Completed_Crusades || 0) >= 1 ? 'earned' : ''}`}>⭐</div>
              </div>
            </div>
          </div>

          {/* Right Section - Stats */}
          <div className="right-sidebar">
            
            {/* Led Stats */}
            <div className="stats-section">
              <h4>Led</h4>
              <div className="stat-boxes">
                <div className="stat-box">
                  <div className="stat-number">{memberData.Led_Completed_Quests || 0}</div>
                  <div className="stat-label">Quests</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{memberData.Led_Completed_Crusades || 0}</div>
                  <div className="stat-label">Crusades</div>
                </div>
              </div>
            </div>

            {/* Completed Stats */}
            <div className="stats-section">
              <h4>Completed</h4>
              <div className="stat-boxes">
                <div className="stat-box">
                  <div className="stat-number">{memberData.Quest_Total || 0}</div>
                  <div className="stat-label">Quests</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{memberData.Crusades_Total || 0}</div>
                  <div className="stat-label">Crusades</div>
                </div>
              </div>
            </div>

            {/* Kills Stats */}
            <div className="stats-section">
              <h4>Kills</h4>
              <div className="stat-boxes">
                <div className="stat-box">
                  <div className="stat-number">{memberData.FPS_Kills_Total || 0}</div>
                  <div className="stat-label">Ground</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{memberData.Ship_Kills_Total || 0}</div>
                  <div className="stat-label">Pilot</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{memberData.Turret_Kills_Total || 0}</div>
                  <div className="stat-label">Turret</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          
          {/* Completed Quests */}
          <div className="quest-section">
            <h3>Completed Quests</h3>
            <div className="quest-list">
              <div className="quest-item">Quest data coming soon...</div>
            </div>
          </div>

          {/* Completed Crusades */}
          <div className="crusade-section">
            <h3>Completed Crusades</h3>
            <div className="crusade-list">
              <div className="crusade-item">Crusade data coming soon...</div>
            </div>
          </div>

          {/* Backstory */}
          <div className="backstory-section">
            <h3>Backstory</h3>
            <div className="backstory-content">
              <p>Member of the Order of the Fallen Star organization.</p>
              <p>Join Date: {memberData.FirstPatrolDate ? new Date(memberData.FirstPatrolDate).toLocaleDateString() : 'Unknown'}</p>
              <p>Total Patrols: {memberData.PatrolCount || 0}</p>
              <p>Last Activity: {memberData.LastPatrolDate ? new Date(memberData.LastPatrolDate).toLocaleDateString() : 'No recent activity'}</p>
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

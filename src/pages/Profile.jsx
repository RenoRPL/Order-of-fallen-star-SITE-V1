import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OFSDataService from '../services/ofsDataService'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [memberData, setMemberData] = useState(null)
  const [patrolData, setPatrolData] = useState([])
  const [patrolStats, setPatrolStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch member and patrol data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch member data
        const member = await OFSDataService.getMemberData(user.id)
        setMemberData(member)
        
        // Fetch patrol data
        const patrols = await OFSDataService.getPatrolData(user.id)
        setPatrolData(patrols)
        
        // Calculate patrol stats
        const stats = OFSDataService.formatPatrolStats(patrols)
        setPatrolStats(stats)
        
      } catch (err) {
        console.error('Error fetching OFS data:', err)
        setError('Failed to load organization data')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (isAuthenticated && user?.id) {
      fetchData()
    }
  }, [user?.id, isAuthenticated])

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(parseInt(timestamp) / 4194304 + 1420070400000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvatarUrl = (userId, avatarHash) => {
    if (!avatarHash) {
      // Default Discord avatar based on discriminator
      const defaultAvatar = (parseInt(user?.discriminator || '0') % 5)
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-main">
        <div className="profile-container">
          
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-header-bg"></div>
            <div className="profile-header-content">
              <div className="profile-avatar">
                <img 
                  src={getAvatarUrl(user?.id, user?.avatar)} 
                  alt={`${user?.username || 'User'}'s avatar`}
                  className="avatar-image"
                />
                <div className="status-indicator online"></div>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">
                  {user?.display_name || user?.global_name || user?.username || 'Unknown User'}
                </h1>
                <p className="profile-username">@{user?.username || 'unknown'}</p>
                <div className="profile-badges">
                  <span className="badge discord-member">Discord Member</span>
                  <span className="badge ofs-member">OFS Member</span>
                  {memberData?.Rank && (
                    <span className="badge rank-badge">{memberData.Rank}</span>
                  )}
                  {memberData?.['Role Path'] && (
                    <span className="badge role-badge">{memberData['Role Path']}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            
            {/* Error Display */}
            {error && (
              <div className="error-section">
                <p className="error-message">⚠️ {error}</p>
              </div>
            )}
            
            {/* Discord Information */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">🎮</span>
                Discord Information
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Discord ID</label>
                  <span className="info-value">{user?.id || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <span className="info-value">{user?.username || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Account Created</label>
                  <span className="info-value">{formatJoinDate(user?.id)}</span>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <span className="info-value">Discord User</span>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">⭐</span>
                Order of the Fallen Star
              </h2>
              {isLoading ? (
                <div className="loading-state">Loading organization data...</div>
              ) : memberData ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Member Status</label>
                    <span className="info-value status-active">Active Member</span>
                  </div>
                  <div className="info-item">
                    <label>Rank</label>
                    <span className="info-value">{memberData.Rank || 'Unassigned'}</span>
                  </div>
                  <div className="info-item">
                    <label>Join Date</label>
                    <span className="info-value">{memberData['Join Date'] || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <label>Role Path</label>
                    <span className="info-value">{memberData['Role Path'] || memberData.Role || 'Unassigned'}</span>
                  </div>
                  <div className="info-item">
                    <label>Time in Service</label>
                    <span className="info-value">{OFSDataService.calculateTimeInService(memberData['Join Date'])}</span>
                  </div>
                  <div className="info-item">
                    <label>Current Chapter</label>
                    <span className="info-value">{memberData['Current Chapter'] || 'General'}</span>
                  </div>
                </div>
              ) : (
                <div className="no-data-state">
                  <p>Member data not found in organization records.</p>
                  <p>You may need to complete your membership registration.</p>
                </div>
              )}
            </div>

            {/* Combat Statistics */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">⚔️</span>
                Combat Statistics
              </h2>
              {isLoading ? (
                <div className="loading-state">Loading combat statistics...</div>
              ) : patrolStats ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Total Patrols</label>
                    <span className="info-value">{patrolStats.totalPatrols}</span>
                  </div>
                  <div className="info-item">
                    <label>Patrols Led</label>
                    <span className="info-value">{patrolStats.patrolsLed}</span>
                  </div>
                  <div className="info-item">
                    <label>Quests Completed</label>
                    <span className="info-value">{patrolStats.totalQuests}</span>
                  </div>
                  <div className="info-item">
                    <label>FPS Kills</label>
                    <span className="info-value">{patrolStats.totalFPSKills}</span>
                  </div>
                  <div className="info-item">
                    <label>Ship Kills</label>
                    <span className="info-value">{patrolStats.totalShipKills}</span>
                  </div>
                  <div className="info-item">
                    <label>Crusades</label>
                    <span className="info-value">{patrolStats.totalCrusades}</span>
                  </div>
                </div>
              ) : (
                <div className="no-data-state">
                  <p>No patrol data found.</p>
                  <p>Join a patrol to start building your combat record!</p>
                </div>
              )}
            </div>

            {/* Recent Patrol Activity */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">📊</span>
                Recent Patrol Activity
              </h2>
              {isLoading ? (
                <div className="loading-state">Loading patrol history...</div>
              ) : patrolData && patrolData.length > 0 ? (
                <div className="patrol-history">
                  {patrolData.slice(0, 5).map((patrol, index) => (
                    <div key={index} className="patrol-item">
                      <div className="patrol-info">
                        <div className="patrol-header">
                          <h4 className="patrol-name">{patrol['Patrol Name'] || 'Unknown Mission'}</h4>
                          <span className="patrol-date">{patrol['Patrol Start Time'] ? new Date(patrol['Patrol Start Time']).toLocaleDateString() : 'Unknown Date'}</span>
                        </div>
                        <p className="patrol-description">{patrol['Patrol Description'] || 'No description available'}</p>
                        <div className="patrol-stats">
                          <span className="stat">Leader: {patrol['Patrol Leader '] || 'Unknown'}</span>
                          {patrol['Quest'] && patrol['Quest'] !== '❓' && (
                            <span className="stat">Quests: {patrol['Quest']}</span>
                          )}
                          {patrol['Fps kills'] && patrol['Fps kills'] !== '❓' && (
                            <span className="stat">FPS Kills: {patrol['Fps kills']}</span>
                          )}
                          {patrol['Ship kills'] && patrol['Ship kills'] !== '❓' && (
                            <span className="stat">Ship Kills: {patrol['Ship kills']}</span>
                          )}
                        </div>
                      </div>
                      {patrol['Patrol Leader ID'] === user?.id && (
                        <div className="patrol-leader-badge">Leader</div>
                      )}
                    </div>
                  ))}
                  {patrolData.length > 5 && (
                    <div className="more-patrols">
                      <p>And {patrolData.length - 5} more patrol activities...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data-state">
                  <p>No patrol history found.</p>
                  <p>Participate in patrols to see your activity history here!</p>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">⚙️</span>
                Account Settings
              </h2>
              <div className="action-buttons">
                <button className="action-btn primary">
                  <span className="btn-icon">🔗</span>
                  Connect RSI Account
                </button>
                <button className="action-btn secondary">
                  <span className="btn-icon">🔧</span>
                  Edit Profile
                </button>
                <button className="action-btn secondary">
                  <span className="btn-icon">🔒</span>
                  Privacy Settings
                </button>
                <button className="action-btn danger" onClick={handleLogout}>
                  <span className="btn-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

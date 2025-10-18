import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

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
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            
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
              <div className="info-grid">
                <div className="info-item">
                  <label>Member Status</label>
                  <span className="info-value status-active">Active Member</span>
                </div>
                <div className="info-item">
                  <label>Rank</label>
                  <span className="info-value">Recruit</span>
                </div>
                <div className="info-item">
                  <label>Join Date</label>
                  <span className="info-value">Recently Joined</span>
                </div>
                <div className="info-item">
                  <label>Division</label>
                  <span className="info-value">General</span>
                </div>
              </div>
            </div>

            {/* Star Citizen Information */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">🚀</span>
                Star Citizen Profile
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>RSI Handle</label>
                  <span className="info-value">Not Connected</span>
                </div>
                <div className="info-item">
                  <label>UEE Citizen Record</label>
                  <span className="info-value">N/A</span>
                </div>
                <div className="info-item">
                  <label>Organization</label>
                  <span className="info-value">Order of the Fallen Star</span>
                </div>
                <div className="info-item">
                  <label>Primary Ship</label>
                  <span className="info-value">Not Specified</span>
                </div>
              </div>
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

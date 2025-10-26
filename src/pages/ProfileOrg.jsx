import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import './ProfileOrg.css'

// Mock data matching the Star Citizen org style
const mockOrgData = {
  organizationName: "ORDER OF THE FALLEN STAR",
  subtitle: "ORGANIZATION PROFILE",
  member: {
    name: "Page RenoTG", 
    rank: "Knight Commander",
    tier: "10",
    serviceTime: "12 days",
    status: "Active",
    joinDate: "2024-01-15"
  },
  stats: {
    quests: 96,
    led: 55, 
    kills: 158
  },
  leftPanelData: [
    { label: "Current Rank", value: "Knight Commander", type: "highlight" },
    { label: "Service Start", value: "Jan 15, 2024", type: "normal" },
    { label: "Total Missions", value: "96", type: "success" },
    { label: "Leadership Role", value: "Squadron Leader", type: "highlight" },
    { label: "Specialization", value: "Combat & Exploration", type: "normal" },
    { label: "Home System", value: "Stanton", type: "normal" }
  ],
  rightPanelData: [
    { label: "Combat Rating", value: "Elite", type: "success" },
    { label: "FPS Kills", value: "158", type: "success" },
    { label: "Ship Kills", value: "23", type: "success" },
    { label: "Exploration", value: "Advanced", type: "highlight" },
    { label: "Mining", value: "Proficient", type: "normal" },
    { label: "Trading", value: "Experienced", type: "normal" }
  ],
  achievements: [
    {
      icon: "🏆",
      title: "Squadron Leader",
      description: "Leading elite combat operations across multiple systems"
    },
    {
      icon: "⚔️", 
      title: "Battle Veteran",
      description: "Survived 50+ high-risk combat encounters"
    },
    {
      icon: "🌟",
      title: "Explorer",
      description: "Discovered 12 new jump points and resource locations"
    },
    {
      icon: "🛡️",
      title: "Guardian",
      description: "Protected civilian transports from pirate attacks"
    }
  ]
}

const ProfileOrg = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  console.log("ProfileOrg component loaded!")

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
  }

  const handleMouseEnter = (e) => {
    const video = e.target.querySelector('.knight-video')
    if (video && isVideoLoaded) {
      video.currentTime = 0
      video.play().catch(console.error)
    }
  }

  const handleMouseLeave = (e) => {
    const video = e.target.querySelector('.knight-video')
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-main">
        <div className="profile-container">
          
          {/* Organization Header */}
          <div className="org-header">
            <h1 className="org-title">{mockOrgData.organizationName}</h1>
            <div className="org-subtitle">{mockOrgData.subtitle}</div>
          </div>

          {/* Main Profile Layout */}
          <div className="profile-main-layout">
            
            {/* Left Info Panel */}
            <div className="left-panels">
              <div className="info-panel">
                <div className="panel-header">
                  <div className="panel-icon">📋</div>
                  <h3 className="panel-title">Member Details</h3>
                </div>
                {mockOrgData.leftPanelData.map((item, index) => (
                  <div key={index} className="data-row">
                    <span className="data-label">{item.label}</span>
                    <span className={`data-value ${item.type}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="info-panel">
                <div className="panel-header">
                  <div className="panel-icon">⚡</div>
                  <h3 className="panel-title">Active Missions</h3>
                </div>
                <div className="data-row">
                  <span className="data-label">Panic at Distro</span>
                  <span className="data-value success">In Progress</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Battle at Dupree</span>
                  <span className="data-value success">In Progress</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Hathor Mining</span>
                  <span className="data-value success">In Progress</span>
                </div>
              </div>
            </div>

            {/* Central Knight Figure */}
            <div className="knight-figure">
              
              {/* Animated Knight Card */}
              <div 
                className="knight-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Static Image */}
                <img 
                  src="/Knights/Knight1.jpg" 
                  alt="Knight Commander" 
                  className="knight-image"
                  loading="lazy"
                />
                
                {/* Hover Video */}
                <video 
                  className="knight-video"
                  muted
                  loop
                  preload="metadata"
                  onLoadedData={handleVideoLoad}
                >
                  <source src="/Knights/Knight1_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Card Info Overlay */}
                <div className="knight-card-info">
                  <div className="knight-rank-overlay">{mockOrgData.member.rank}</div>
                  <div className="knight-name-overlay">{mockOrgData.member.name}</div>
                </div>
              </div>

              <div className="rank-display-main">
                <div className="rank-emblem">
                  <div className="rank-icon-large">🛡️</div>
                </div>
                <h2 className="rank-title-main">{mockOrgData.member.rank}</h2>
                <div className="rank-tier-main">Tier {mockOrgData.member.tier}</div>
              </div>
              
              <div className="member-name-main">{mockOrgData.member.name}</div>
              <div className="service-duration">
                Order of the Fallen Star • {mockOrgData.member.serviceTime}
              </div>

              {/* Central Stats Bar */}
              <div className="central-stats">
                <div className="stat-item">
                  <div className="stat-number">{mockOrgData.stats.quests}</div>
                  <div className="stat-label">Quests</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{mockOrgData.stats.led}</div>
                  <div className="stat-label">Led</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{mockOrgData.stats.kills}</div>
                  <div className="stat-label">Kills</div>
                </div>
              </div>
            </div>

            {/* Right Info Panel */}
            <div className="right-panels">
              <div className="info-panel">
                <div className="panel-header">
                  <div className="panel-icon">⚔️</div>
                  <h3 className="panel-title">Combat Stats</h3>
                </div>
                {mockOrgData.rightPanelData.map((item, index) => (
                  <div key={index} className="data-row">
                    <span className="data-label">{item.label}</span>
                    <span className={`data-value ${item.type}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="info-panel">
                <div className="panel-header">
                  <div className="panel-icon">🏅</div>
                  <h3 className="panel-title">Recent Honors</h3>
                </div>
                <div className="data-row">
                  <span className="data-label">Victory at Orison</span>
                  <span className="data-value highlight">Oct 15</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Cargo Escort Success</span>
                  <span className="data-value highlight">Oct 12</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Mining Expedition</span>
                  <span className="data-value highlight">Oct 08</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Achievement Panels */}
          <div className="achievement-grid">
            {mockOrgData.achievements.map((achievement, index) => (
              <div key={index} className="achievement-panel">
                <div className="achievement-icon">{achievement.icon}</div>
                <h4 className="achievement-title">{achievement.title}</h4>
                <p className="achievement-description">{achievement.description}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}

export default ProfileOrg

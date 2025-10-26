import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import './Profile.css'

// Mock data for testing
const mockMemberData = {
  Username: "TestPilot",
  Rank: "Knight Commander",
  "Join Date": "2024-01-15",
  Status: "Active",
  "Total Patrols": 45,
  "Patrols Led": 12,
  "Total FPS Kills": 158,
  "Total Ship Kills": 23
}

const mockRankData = {
  Rank: "Knight Commander",
  Tier: "10",
  "Rank Icon": "/public/Rank Icons/knight-commander.png", // You can create a mock icon
  Description: "Elite warrior of the fallen stars"
}

const mockActiveQuests = [
  {
    name: "Panic at the Distro",
    type: "Combat Mission",
    description: "Spamming Distros - Eliminate hostile forces at the distribution center",
    date: "2025-10-18",
    location: "Stanton System",
    difficulty: "High",
    rewards: "25,000 aUEC"
  },
  {
    name: "Battle at Dupree",
    type: "Station Defense", 
    description: "Man the stations! All hands on deck! A battle has broken out at Dupree! RDV at closest space station.",
    date: "2025-10-17",
    location: "Dupree Station",
    difficulty: "Extreme",
    rewards: "50,000 aUEC"
  },
  {
    name: "Hathor Mining Op",
    type: "Resource Gathering",
    description: "Secure valuable resources from the Hathor mining facility",
    date: "2025-10-16",
    location: "Hathor System",
    difficulty: "Medium", 
    rewards: "15,000 aUEC"
  }
]

const mockCompletedQuests = [
  {
    name: "Crusader Security Sweep",
    type: "Patrol Mission",
    description: "Successfully cleared hostile forces from Crusader sector",
    date: "2025-10-10",
    location: "Crusader",
    rewards: "20,000 aUEC"
  },
  {
    name: "Cargo Escort Mission",
    type: "Transport",
    description: "Safely escorted valuable cargo through dangerous space",
    date: "2025-10-08",
    location: "Stanton System",
    rewards: "12,000 aUEC"
  },
  {
    name: "Reconnaissance Flight",
    type: "Intel Gathering",
    description: "Gathered crucial intel on enemy movements",
    date: "2025-10-05",
    location: "Pyro System",
    rewards: "8,000 aUEC"
  }
]

const ProfileTest = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Debug log to ensure component is loading
  console.log("ProfileTest component loaded!")

  // Mock stats calculation
  const mockPatrolStats = {
    totalQuests: mockActiveQuests.length + mockCompletedQuests.length,
    activeQuests: mockActiveQuests.length,
    completedQuests: mockCompletedQuests.length,
    patrolsLed: mockMemberData["Patrols Led"],
    totalFPSKills: mockMemberData["Total FPS Kills"],
    totalShipKills: mockMemberData["Total Ship Kills"],
    currentQuests: mockActiveQuests,
    completedQuestList: mockCompletedQuests
  }

  const calculateTimeInService = (joinDate) => {
    if (!joinDate) return "New Recruit"
    const join = new Date(joinDate)
    const now = new Date()
    const diffTime = Math.abs(now - join)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  return (
    <div className="profile-page">
      <Header />
      
      {/* Star Field Animation */}
      <div className="star-field">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <main className="profile-main">
        <div className="profile-container">
          
          {/* Epic Profile Header with Rank Display - Compact */}
          <div className="profile-hero">
            <div className="nebula-background"></div>
            <div className="stars-overlay"></div>
            
            {/* Left: Rank Display */}
            <div className="rank-display">
              <div className="rank-icon-container">
                <div className="rank-icon-placeholder">
                  🛡️
                </div>
                <div className="rank-glow"></div>
              </div>
              
              <div className="rank-info">
                <div className="rank-tier">
                  Tier {mockRankData.Tier}
                </div>
                <h1 className="rank-title">
                  {mockMemberData.Rank}
                </h1>
                <div className="member-title">
                  Member
                </div>
              </div>
            </div>

            {/* Center: Welcome Info */}
            <div className="hero-info">
              <h2 className="hero-welcome">
                Welcome, {mockMemberData.Username}
              </h2>
              <p className="hero-subtitle">
                Order of the Fallen Star • {calculateTimeInService(mockMemberData["Join Date"])}
              </p>
            </div>

            {/* Right: Stats Overview */}
            <div className="profile-stats-overview">
              <div className="stat-crystal">
                <div className="stat-value">{mockPatrolStats.totalQuests}</div>
                <div className="stat-label">Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">{mockPatrolStats.patrolsLed}</div>
                <div className="stat-label">Led</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">{mockPatrolStats.totalFPSKills}</div>
                <div className="stat-label">Kills</div>
              </div>
            </div>
          </div>

          {/* Content Grid - Compact 2-Column Layout */}
          <div className="profile-content">
            
            {/* Left Column: Active Quests */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">⚔️</span>
                Active Quests
              </h2>
              <div className="quest-grid">
                {mockActiveQuests.map((quest, index) => (
                  <div key={index} className="quest-card active">
                    <div className="quest-header">
                      <h3 className="quest-title">{quest.name}</h3>
                      <span className="quest-status active">Active</span>
                    </div>
                    <p className="quest-description">
                      {quest.description}
                    </p>
                    <div className="quest-meta">
                      <span className="quest-location">📍 {quest.location}</span>
                      <span className="quest-difficulty difficulty-{quest.difficulty?.toLowerCase()}">
                        🔥 {quest.difficulty}
                      </span>
                      <span className="quest-rewards">💰 {quest.rewards}</span>
                    </div>
                    <div className="quest-progress">
                      <span className="quest-progress-text">
                        Started: {quest.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Completed Quests */}
            <div className="profile-section">
              <h2 className="section-title">
                <span className="section-icon">🏆</span>
                Completed Quests
              </h2>
              <div className="quest-grid">
                {mockCompletedQuests.map((quest, index) => (
                  <div key={index} className="quest-card completed">
                    <div className="quest-header">
                      <h3 className="quest-title">{quest.name}</h3>
                      <span className="quest-status completed">Complete</span>
                    </div>
                    <p className="quest-description">
                      {quest.description}
                    </p>
                    <div className="quest-meta">
                      <span className="quest-location">📍 {quest.location}</span>
                      <span className="quest-rewards">💰 {quest.rewards}</span>
                    </div>
                    <div className="quest-progress">
                      <span className="quest-progress-text">
                        Completed: {quest.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Knight's Codex - Member Information */}
          <div className="codex-panel">
            <h2 className="section-title">
              <span className="section-icon">📖</span>
              Knight's Codex
            </h2>
            <div className="codex-content">
              
              {/* Member Stats */}
              <div className="codex-section">
                <h3>Battle Statistics</h3>
                <div className="battle-stats">
                  <div className="battle-stat">
                    <span className="stat-icon">⚔️</span>
                    <div className="stat-info">
                      <div className="stat-number">{mockMemberData["Total Patrols"]}</div>
                      <div className="stat-name">Total Patrols</div>
                    </div>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-info">
                      <div className="stat-number">{mockMemberData["Total FPS Kills"]}</div>
                      <div className="stat-name">FPS Kills</div>
                    </div>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-icon">🚀</span>
                    <div className="stat-info">
                      <div className="stat-number">{mockMemberData["Total Ship Kills"]}</div>
                      <div className="stat-name">Ship Kills</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="codex-section">
                <h3>Service Record</h3>
                <div className="codex-grid">
                  <div className="codex-item">
                    <label>Current Rank</label>
                    <div className="codex-value rank">{mockMemberData.Rank}</div>
                  </div>
                  <div className="codex-item">
                    <label>Service Start</label>
                    <div className="codex-value">{mockMemberData["Join Date"]}</div>
                  </div>
                  <div className="codex-item">
                    <label>Status</label>
                    <div className="codex-value path">{mockMemberData.Status}</div>
                  </div>
                  <div className="codex-item">
                    <label>Missions Led</label>
                    <div className="codex-value">{mockMemberData["Patrols Led"]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Command Center */}
          <div className="command-panel">
            <h2 className="section-title">
              <span className="section-icon">🎮</span>
              Command Center
            </h2>
            <div className="command-grid">
              <button className="command-btn primary">
                <span className="btn-icon">📋</span>
                <span className="btn-text">View All Quests</span>
              </button>
              <button className="command-btn secondary">
                <span className="btn-icon">🛸</span>
                <span className="btn-text">Fleet Status</span>
              </button>
              <button className="command-btn secondary">
                <span className="btn-icon">👥</span>
                <span className="btn-text">Member Directory</span>
              </button>
              <button className="command-btn danger">
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileTest

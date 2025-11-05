import { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import './Fleet.css'

export default function Fleet() {
  const [fleetMembers, setFleetMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [shipRegistry, setShipRegistry] = useState([])
  const [filterRank, setFilterRank] = useState('All')
  
  // Rank hierarchy order (highest to lowest)
  const rankOrder = [
    'Primarch',
    'Chapter Master',
    'Lord Commander',
    'Commander',
    'Lord',
    'Marshal',
    'Templar',
    'Knight',
    'Squire',
    'Page'
  ]

  useEffect(() => {
    loadFleetData()
  }, [])

  const loadFleetData = async () => {
    try {
      setLoading(true)
      
      // Load ship registry first
      const registry = await OFSDataService.getShipRegistry()
      setShipRegistry(registry)
      console.log('Loaded ship registry:', registry.length, 'ships')
      
      // Load all member data
      const allMembers = await OFSDataService.getAllMembers()
      console.log('Loaded members:', allMembers.length)
      
      // Filter members who have ships and valid ranks
      const membersWithShips = allMembers
        .filter(member => {
          const hasRank = member['Rank'] || member.C
          const hasShip = member['Ship Name'] || member.S
          const rank = (hasRank || '').toLowerCase()
          
          // Exclude Serf rank and members without ships
          return hasRank && hasShip && rank !== 'serf'
        })
        .map(member => {
          const rank = member['Rank'] || member.C
          const shipName = member['Ship Name'] || member.S
          const customShipImage = member['Custom Ship Image'] || member.T || ''
          const username = member['Username'] || member.B || 'Unknown'
          const discordName = member['Discord Name'] || member.A || ''
          const role = member['Role'] || member.D || 'Unknown'
          
          // Find ship in registry
          const registryShip = registry.find(ship => 
            ship.fullName.toLowerCase() === shipName.toLowerCase() ||
            ship.value === shipName.toLowerCase()
          )
          
          // Determine which image to use (prioritize custom image)
          let shipImage = customShipImage && customShipImage.trim() !== '' 
            ? customShipImage 
            : (registryShip?.imageUrl || '/Nebula BG.jpeg')
          
          // Convert Google Drive and Imgur URLs to direct image URLs
          shipImage = OFSDataService.convertImgurUrl(shipImage)
          
          return {
            username,
            discordName,
            rank,
            role,
            shipName,
            shipImage,
            hasCustomImage: !!(customShipImage && customShipImage.trim() !== ''),
            rankOrder: rankOrder.indexOf(rank) !== -1 ? rankOrder.indexOf(rank) : 999
          }
        })
      
      // Sort by rank hierarchy (lowest rankOrder number = highest rank)
      membersWithShips.sort((a, b) => {
        if (a.rankOrder !== b.rankOrder) {
          return a.rankOrder - b.rankOrder
        }
        // If same rank, sort alphabetically by username
        return a.username.localeCompare(b.username)
      })
      
      setFleetMembers(membersWithShips)
      console.log('Fleet members loaded:', membersWithShips.length)
      
    } catch (error) {
      console.error('Error loading fleet data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique ranks for filter
  const uniqueRanks = [...new Set(fleetMembers.map(member => member.rank))]
    .sort((a, b) => {
      const aIndex = rankOrder.indexOf(a)
      const bIndex = rankOrder.indexOf(b)
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })

  // Filter members by rank
  const filteredMembers = filterRank === 'All' 
    ? fleetMembers 
    : fleetMembers.filter(member => member.rank === filterRank)

  if (loading) {
    return (
      <div className="fleet-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Fleet Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fleet-container">
      <div className="fleet-header">
        <h1 className="fleet-title">Order Fleet Registry</h1>
        <p className="fleet-subtitle">
          Our fleet spans the stars - from nimble scouts to mighty capital ships
        </p>
        <p className="fleet-description">
          Each vessel represents a warrior's chosen instrument of duty. Together, we are unstoppable.
        </p>
      </div>

      <div className="fleet-filters">
        <div className="filter-group">
          <label>Filter by Rank:</label>
          <select 
            value={filterRank} 
            onChange={(e) => setFilterRank(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Ranks ({fleetMembers.length})</option>
            {uniqueRanks.map(rank => (
              <option key={rank} value={rank}>
                {rank} ({fleetMembers.filter(m => m.rank === rank).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fleet-grid">
        {filteredMembers.map((member, index) => (
          <div 
            key={`${member.username}-${index}`} 
            className="fleet-card"
          >
            <div className="fleet-card-image-wrapper">
              <img 
                src={member.shipImage} 
                alt={member.shipName}
                className="fleet-card-image"
                onError={(e) => {
                  e.target.src = '/Nebula BG.jpeg'
                }}
              />
              <div className="fleet-card-overlay"></div>
              {member.hasCustomImage && (
                <div className="custom-badge" title="Custom Ship Image">
                  ⭐
                </div>
              )}
            </div>
            
            <div className="fleet-card-content">
              <div className="fleet-card-header">
                <h3 className="fleet-card-username">{member.username}</h3>
                <div className="fleet-card-rank-badge">
                  <img 
                    src={`/Ranks/${member.rank}.png`}
                    alt={member.rank}
                    className="rank-icon-small"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span>{member.rank}</span>
                </div>
              </div>
              
              <div className="fleet-card-ship-info">
                <h4 className="ship-name">{member.shipName}</h4>
                <p className="ship-role">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="no-results">
          <p>No fleet members found with selected filters.</p>
        </div>
      )}
    </div>
  )
}

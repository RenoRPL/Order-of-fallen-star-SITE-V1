import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import OFSDataService from '../services/ofsDataService'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Roster.css'

export default function Roster() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('Username')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterRank, setFilterRank] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch all member data on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const allMembers = await OFSDataService.getAllMemberData()
        // Filter members who have a rank (column C is not empty)
        const membersWithRank = allMembers.filter(member => 
          member.Rank && member.Rank.trim() !== ''
        )
        setMembers(membersWithRank)
        console.log('Loaded roster members:', membersWithRank.length)
      } catch (error) {
        console.error('Error fetching roster data:', error)
      }
      setIsLoading(false)
    }

    fetchMembers()
  }, [])

  // Get unique ranks and roles for filters
  const uniqueRanks = [...new Set(members.map(member => member.Rank).filter(Boolean))].sort()
  const uniqueRoles = [...new Set(members.map(member => member.Role).filter(Boolean))].sort()

  // Filter and sort members
  const filteredAndSortedMembers = members
    .filter(member => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const username = member.Username?.toLowerCase() || ''
        const rank = member.Rank?.toLowerCase() || ''
        const role = member.Role?.toLowerCase() || ''
        if (!username.includes(search) && !rank.includes(search) && !role.includes(search)) {
          return false
        }
      }
      
      // Rank filter
      if (filterRank !== 'All' && member.Rank !== filterRank) {
        return false
      }
      
      // Role filter
      if (filterRole !== 'All' && member.Role !== filterRole) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''
      
      // Convert to strings for comparison
      aValue = aValue.toString().toLowerCase()
      bValue = bValue.toString().toLowerCase()
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleMemberClick = (member) => {
    // Navigate to profile page with the member's User ID as a query parameter
    if (member['User ID']) {
      navigate(`/profile?playerId=${member['User ID']}`)
    }
  }

  return (
    <div className="roster-page">
      <Header />
      
      <div className="roster-container">
        <div className="roster-header">
          <h1>Order of the Fallen Star - Roster</h1>
          <p className="roster-subtitle">
            {isLoading ? 'Loading members...' : `${filteredAndSortedMembers.length} of ${members.length} members`}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="roster-controls">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters">
            <select
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Ranks</option>
              {uniqueRanks.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Table */}
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading roster data...</p>
          </div>
        ) : (
          <div className="roster-table-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('Username')}
                    className={`sortable ${sortBy === 'Username' ? 'active' : ''}`}
                  >
                    Username
                    {sortBy === 'Username' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('Rank')}
                    className={`sortable ${sortBy === 'Rank' ? 'active' : ''}`}
                  >
                    Rank
                    {sortBy === 'Rank' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('Role')}
                    className={`sortable ${sortBy === 'Role' ? 'active' : ''}`}
                  >
                    Role
                    {sortBy === 'Role' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('Join Date')}
                    className={`sortable ${sortBy === 'Join Date' ? 'active' : ''}`}
                  >
                    Join Date
                    {sortBy === 'Join Date' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedMembers.map((member, index) => (
                  <tr 
                    key={member['User ID'] || index}
                    className="roster-row clickable"
                    onClick={() => handleMemberClick(member)}
                    title={`View ${member.Username || 'Unknown'}'s profile`}
                  >
                    <td className="username-cell">
                      <div className="member-info">
                        <span className="username">{member.Username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="rank-cell">
                      <div className="rank-info">
                        {member.Rank && (
                          <img 
                            src={`/Ranks/${member.Rank}.png`}
                            alt={`${member.Rank} Rank`}
                            className="rank-icon"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                        <span className="rank-name">{member.Rank || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="role-cell">
                      <span className="role-badge">{member.Role || 'Unknown'}</span>
                    </td>
                    <td className="date-cell">
                      <span className="join-date">{formatJoinDate(member['Join Date'])}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedMembers.length === 0 && !isLoading && (
              <div className="no-results">
                <p>No members found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
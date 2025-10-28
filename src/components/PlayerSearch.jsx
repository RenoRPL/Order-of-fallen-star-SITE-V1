import React, { useState, useEffect, useRef } from 'react'
import OFSDataService from '../services/ofsDataService'
import './PlayerSearch.css'

export default function PlayerSearch({ onPlayerSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

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
        console.log('Loaded members with ranks:', membersWithRank.length)
      } catch (error) {
        console.error('Error fetching member data:', error)
      }
      setIsLoading(false)
    }

    fetchMembers()
  }, [])

  // Filter members based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredMembers([])
      setShowSuggestions(false)
      return
    }

    const filtered = members.filter(member => {
      const username = member.Username?.toLowerCase() || ''
      const rank = member.Rank?.toLowerCase() || ''
      const role = member.Role?.toLowerCase() || ''
      const search = searchTerm.toLowerCase()

      return username.includes(search) || 
             rank.includes(search) || 
             role.includes(search)
    }).slice(0, 10) // Limit to 10 suggestions

    setFilteredMembers(filtered)
    setShowSuggestions(filtered.length > 0)
    setSelectedIndex(-1)
  }, [searchTerm, members])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredMembers[selectedIndex]) {
          selectMember(filteredMembers[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const selectMember = (member) => {
    setSearchTerm(member.Username || '')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    if (onPlayerSelect) {
      onPlayerSelect(member)
    }
  }

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const clearSearch = () => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    if (onPlayerSelect) {
      onPlayerSelect(null)
    }
  }

  return (
    <div className="player-search-container" ref={searchRef}>
      <div className="player-search-header">
        <h3>Player Search</h3>
        <span className="member-count">
          {isLoading ? 'Loading...' : `${members.length} ranked members`}
        </span>
      </div>
      
      <div className="search-input-wrapper">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by username, rank, or role..."
            className="search-input"
            disabled={isLoading}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-button">
              ×
            </button>
          )}
        </div>

        {showSuggestions && (
          <div className="suggestions-dropdown" ref={suggestionsRef}>
            {filteredMembers.map((member, index) => (
              <div
                key={member['User ID'] || index}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectMember(member)}
              >
                <div className="suggestion-main">
                  <span className="suggestion-username">
                    {member.Username || 'Unknown User'}
                  </span>
                  <span className="suggestion-rank">
                    {member.Rank}
                  </span>
                </div>
                <div className="suggestion-details">
                  <span className="suggestion-role">
                    {member.Role || 'No Role'}
                  </span>
                  <span className="suggestion-path">
                    {member['Role Path'] || 'No Path'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
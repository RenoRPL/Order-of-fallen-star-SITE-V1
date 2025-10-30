import React, { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import RichTextEditor from './RichTextEditor'
import './EditProfileModal.css'

export default function EditProfileModal({ isOpen, onClose, onSave, currentBio = '', currentShip = '' }) {
  const [bio, setBio] = useState(currentBio)
  const [selectedShip, setSelectedShip] = useState(currentShip)
  const [isSaving, setIsSaving] = useState(false)
  const [ships, setShips] = useState([])
  const [shipsLoading, setShipsLoading] = useState(false)

  // Fetch ships from Google Sheets when modal opens
  useEffect(() => {
    const fetchShips = async () => {
      if (isOpen && ships.length === 0) {
        setShipsLoading(true)
        try {
          const shipRegistry = await OFSDataService.getShipRegistry()
          setShips(shipRegistry)
        } catch (error) {
          console.error('Error fetching ship registry:', error)
        } finally {
          setShipsLoading(false)
        }
      }
    }

    fetchShips()
  }, [isOpen, ships.length])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBio(currentBio)
      setSelectedShip(currentShip)
    }
  }, [isOpen, currentBio, currentShip])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert HTML to plain text for character limit validation
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = bio
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      if (textContent.length > 5000) {
        alert('Backstory exceeds 5000 character limit. Please shorten your text.')
        setIsSaving(false)
        return
      }
      
      await onSave({
        bio: bio.trim(),
        ship: selectedShip
      })
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setBio(currentBio)
    setSelectedShip(currentShip)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="edit-profile-modal-overlay" onClick={handleCancel}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close-button" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="form-section">
            <label htmlFor="bio-input" className="form-label">
              Back Story
              <span className="form-note">Use the formatting tools to style your backstory</span>
            </label>
            <RichTextEditor
              value={bio}
              onChange={setBio}
              placeholder="Tell others about your character's background, your role in the organization, your journey in the 'verse...

Use the toolbar above to format your text with different sizes, bold, underline, and colors."
              maxLength={5000}
            />
          </div>

          <div className="form-section">
            <label htmlFor="ship-select" className="form-label">
              Primary Ship
              <span className="form-note">Your main or favorite ship</span>
            </label>
            <select
              id="ship-select"
              value={selectedShip}
              onChange={(e) => setSelectedShip(e.target.value)}
              className="ship-select"
              disabled={shipsLoading}
            >
              <option value="">
                {shipsLoading ? 'Loading ships...' : 'Select a ship...'}
              </option>
              {ships.map((ship) => (
                <option key={ship.value} value={ship.value}>
                  {ship.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
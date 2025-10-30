import React, { useState, useEffect } from 'react'
import './EditProfileModal.css'

export default function EditProfileModal({ isOpen, onClose, onSave, currentBio = '', currentShip = '' }) {
  const [bio, setBio] = useState(currentBio)
  const [selectedShip, setSelectedShip] = useState(currentShip)
  const [isSaving, setIsSaving] = useState(false)

  // Star Citizen ships list (popular ones to start)
  const starCitizenShips = [
    { value: '', label: 'Select a ship...' },
    { value: 'aegis-avenger-titan', label: 'Aegis Avenger Titan' },
    { value: 'aegis-gladius', label: 'Aegis Gladius' },
    { value: 'aegis-sabre', label: 'Aegis Sabre' },
    { value: 'aegis-vanguard-warden', label: 'Aegis Vanguard Warden' },
    { value: 'anvil-arrow', label: 'Anvil Arrow' },
    { value: 'anvil-f7c-hornet', label: 'Anvil F7C Hornet' },
    { value: 'anvil-hawk', label: 'Anvil Hawk' },
    { value: 'anvil-hurricane', label: 'Anvil Hurricane' },
    { value: 'anvil-terrapin', label: 'Anvil Terrapin' },
    { value: 'argo-cargo', label: 'Argo MPUV Cargo' },
    { value: 'crusader-mercury-star-runner', label: 'Crusader Mercury Star Runner' },
    { value: 'crusader-nomad', label: 'Crusader Nomad' },
    { value: 'drake-buccaneer', label: 'Drake Buccaneer' },
    { value: 'drake-caterpillar', label: 'Drake Caterpillar' },
    { value: 'drake-cutlass-black', label: 'Drake Cutlass Black' },
    { value: 'drake-herald', label: 'Drake Herald' },
    { value: 'origin-300i', label: 'Origin 300i' },
    { value: 'origin-325a', label: 'Origin 325a' },
    { value: 'origin-350r', label: 'Origin 350r' },
    { value: 'origin-600i', label: 'Origin 600i' },
    { value: 'origin-890-jump', label: 'Origin 890 Jump' },
    { value: 'rsi-aurora-mr', label: 'RSI Aurora MR' },
    { value: 'rsi-constellation-andromeda', label: 'RSI Constellation Andromeda' },
    { value: 'rsi-mantis', label: 'RSI Mantis' },
    { value: 'misc-freelancer', label: 'MISC Freelancer' },
    { value: 'misc-prospector', label: 'MISC Prospector' },
    { value: 'misc-starfarer', label: 'MISC Starfarer' },
    { value: 'banu-defender', label: 'Banu Defender' },
    { value: 'esperia-prowler', label: 'Esperia Prowler' },
    { value: 'vanduul-scythe', label: 'Vanduul Scythe' }
  ]

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBio(currentBio)
      setSelectedShip(currentShip)
    }
  }, [isOpen, currentBio, currentShip])

  // Handle bio text change (allow emojis)
  const handleBioChange = (e) => {
    const text = e.target.value
    setBio(text)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
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
              Bio
            </label>
            <textarea
              id="bio-input"
              value={bio}
              onChange={handleBioChange}
              placeholder="Tell others about yourself, your role in the organization, your favorite activities in Star Citizen..."
              className="bio-textarea"
              maxLength={700}
              rows={6}
            />
            <div className="character-count">
              {bio.length}/700 characters
            </div>
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
            >
              {starCitizenShips.map((ship) => (
                <option key={ship.value} value={ship.value}>
                  {ship.label}
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
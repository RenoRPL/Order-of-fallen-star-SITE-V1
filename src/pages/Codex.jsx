import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AdminCodexControls from '../components/AdminCodexControls'
import './Codex.css'

export default function Codex() {
  const { user, isAuthenticated } = useAuth()
  const [codexEntries, setCodexEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setAdminLoading(false)
        return
      }

      try {
        const response = await fetch('/.netlify/functions/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discordId: user.id
          })
        })

        if (response.ok) {
          const result = await response.json()
          setIsAdmin(result.isAdmin)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Fetch codex entries
  useEffect(() => {
    const fetchCodexEntries = async () => {
      try {
        const response = await fetch('/.netlify/functions/get-codex-entries')
        
        if (response.ok) {
          const entries = await response.json()
          setCodexEntries(entries)
          // Auto-select first entry if available
          if (entries.length > 0) {
            setSelectedEntry(entries[0])
          }
        } else {
          throw new Error('Failed to fetch codex entries')
        }
      } catch (error) {
        console.error('Error fetching codex entries:', error)
        setError('Failed to load codex entries')
      } finally {
        setLoading(false)
      }
    }

    fetchCodexEntries()
  }, [])

  // Get unique categories for filtering
  const categories = ['All', ...new Set(codexEntries.map(entry => entry.category).filter(Boolean))]

  // Filter entries based on search and category
  const filteredEntries = codexEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry)
  }

  const handleRefreshCodex = async () => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/get-codex-entries')
      if (response.ok) {
        const entries = await response.json()
        setCodexEntries(entries)
        // Update selected entry if it still exists
        if (selectedEntry) {
          const updatedEntry = entries.find(e => e.id === selectedEntry.id)
          setSelectedEntry(updatedEntry || entries[0] || null)
        }
      }
    } catch (error) {
      console.error('Error refreshing codex:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="codex-page">
        <Header />
        <main className="codex-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading the ancient texts...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="codex-page">
        <Header />
        <main className="codex-content">
          <div className="error-container">
            <h2>Error Loading Codex</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="codex-page">
      <Header />
      
      <main className="codex-content">
        <div className="codex-header">
          <div className="codex-title-section">
            <h1 className="codex-title">
              <span className="codex-icon">📜</span>
              Order of the Fallen Star Codex
            </h1>
            <p className="codex-subtitle">
              Ancient documents and sacred texts of our Order
            </p>
          </div>
          
          {/* Admin Controls */}
          {!adminLoading && isAdmin && (
            <AdminCodexControls 
              onRefresh={handleRefreshCodex}
              selectedEntry={selectedEntry}
            />
          )}
        </div>

        <div className="codex-main">
          {/* Sidebar Navigation */}
          <aside className="codex-sidebar">
            <div className="codex-search">
              <input
                type="text"
                placeholder="Search the codex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="codex-filters">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="codex-navigation">
              <h3>Documents ({filteredEntries.length})</h3>
              {filteredEntries.length === 0 ? (
                <p className="no-entries">No documents found</p>
              ) : (
                <ul className="codex-list">
                  {filteredEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className={`codex-item ${selectedEntry?.id === entry.id ? 'active' : ''}`}
                      onClick={() => handleEntrySelect(entry)}
                    >
                      <div className="codex-item-header">
                        <h4 className="codex-item-title">{entry.title}</h4>
                        {entry.category && (
                          <span className="codex-item-category">{entry.category}</span>
                        )}
                      </div>
                      {entry.author && (
                        <p className="codex-item-author">By: {entry.author}</p>
                      )}
                      {entry.dateCreated && (
                        <p className="codex-item-date">
                          {new Date(entry.dateCreated).toLocaleDateString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Main Content Display */}
          <section className="codex-viewer">
            {selectedEntry ? (
              <div className="codex-document">
                <header className="document-header">
                  <h1 className="document-title">{selectedEntry.title}</h1>
                  <div className="document-meta">
                    {selectedEntry.author && (
                      <span className="document-author">
                        <strong>Author:</strong> {selectedEntry.author}
                      </span>
                    )}
                    {selectedEntry.category && (
                      <span className="document-category">
                        <strong>Category:</strong> {selectedEntry.category}
                      </span>
                    )}
                    {selectedEntry.dateCreated && (
                      <span className="document-date">
                        <strong>Created:</strong> {new Date(selectedEntry.dateCreated).toLocaleDateString()}
                      </span>
                    )}
                    {selectedEntry.lastModified && (
                      <span className="document-modified">
                        <strong>Last Modified:</strong> {new Date(selectedEntry.lastModified).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </header>

                <div className="document-content">
                  <div 
                    className="document-text"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedEntry.content.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>

                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <footer className="document-footer">
                    <div className="document-tags">
                      <strong>Tags:</strong>
                      {selectedEntry.tags.map((tag, index) => (
                        <span key={index} className="document-tag">{tag}</span>
                      ))}
                    </div>
                  </footer>
                )}
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-content">
                  <h2>Select a Document</h2>
                  <p>Choose a document from the sidebar to view its contents.</p>
                  <div className="codex-illustration">📚</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
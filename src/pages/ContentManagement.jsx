import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { DiscordAuthService } from '../services/discordAuth';
import OFSDataService from '../services/ofsDataService';
import './ContentManagement.css';

export default function ContentManagement() {
  const navigate = useNavigate();
  const [content, setContent] = useState(contentService.getContent());
  const [activeTab, setActiveTab] = useState('hero');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check admin authorization on mount
  useEffect(() => {
    const checkAuthorization = async () => {
      const userData = DiscordAuthService.getUserData();
      
      if (!userData || !userData.user) {
        // Not logged in, redirect to profile
        console.log('No Discord login found, redirecting to profile');
        navigate('/profile');
        return;
      }

      try {
        // Check if user is admin
        const response = await fetch('/.netlify/functions/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discordId: userData.user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            console.log('Admin access granted for:', userData.user.username);
            setIsAuthorized(true);
          } else {
            console.log('Access denied: User is not an admin');
            alert('Access Denied: You must be an admin to access this page.');
            navigate('/home');
          }
        } else {
          console.error('Error checking admin status');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        navigate('/home');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const updateContent = (section, field, value) => {
    const newContent = { ...content };
    
    if (typeof field === 'string') {
      newContent[section][field] = value;
    } else if (Array.isArray(field)) {
      let target = newContent[section];
      for (let i = 0; i < field.length - 1; i++) {
        target = target[field[i]];
      }
      target[field[field.length - 1]] = value;
    }
    
    setContent(newContent);
    setHasChanges(true);
  };

  const saveChanges = () => {
    const success = contentService.saveContent(content);
    if (success) {
      setHasChanges(false);
      setSaveStatus('Changes saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Error saving changes. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const resetContent = () => {
    if (window.confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      const defaultContent = contentService.resetToDefault();
      setContent(defaultContent);
      setHasChanges(false);
      setSaveStatus('Content reset to defaults');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const renderHeaderEditor = () => {
    // Initialize headerNav if it doesn't exist
    if (!content.headerNav) {
      const newContent = { ...content };
      newContent.headerNav = {
        about: { label: "About", visible: true, href: "/#what-we-offer" },
        fleet: { label: "Fleet", visible: true, href: "/fleet" },
        primarchs: { label: "Primarchs", visible: true, href: "/primarchs" },
        codex: { label: "Codex", visible: true, href: "/codex" }
      };
      setContent(newContent);
      setHasChanges(true);
      return <div>Initializing...</div>;
    }

    return (
      <div className="editor-section">
        <h3>Header Navigation Settings</h3>
        <p className="section-description">
          Control which pages appear in the header navigation. Uncheck pages you want to temporarily hide while editing them.
        </p>

        <div className="header-nav-grid">
          {Object.keys(content.headerNav).map((key) => {
            const navItem = content.headerNav[key];
            return (
              <div key={key} className="header-nav-item">
                <div className="nav-item-header">
                  <h4>{navItem.label}</h4>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={navItem.visible}
                      onChange={(e) => updateContent('headerNav', [key, 'visible'], e.target.checked)}
                    />
                    <span className="checkbox-label">Visible in Header</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Label Text</label>
                  <input
                    type="text"
                    value={navItem.label}
                    onChange={(e) => updateContent('headerNav', [key, 'label'], e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Link URL</label>
                  <input
                    type="text"
                    value={navItem.href}
                    onChange={(e) => updateContent('headerNav', [key, 'href'], e.target.value)}
                    placeholder="/page or /#section"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeroEditor = () => (
    <div className="editor-section">
      <h3>Hero Section</h3>
      
      <div className="form-group">
        <label>Main Title</label>
        <input
          type="text"
          value={content.hero.title}
          onChange={(e) => updateContent('hero', 'title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Subtitle</label>
        <input
          type="text"
          value={content.hero.subtitle}
          onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          rows={4}
          value={content.hero.description}
          onChange={(e) => updateContent('hero', 'description', e.target.value)}
        />
      </div>

      <div className="stats-grid">
        <div className="form-group">
          <label>Active Members</label>
          <input
            type="text"
            value={content.hero.stats.members}
            onChange={(e) => updateContent('hero', ['stats', 'members'], e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Fleet Ships</label>
          <input
            type="text"
            value={content.hero.stats.ships}
            onChange={(e) => updateContent('hero', ['stats', 'ships'], e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Systems Explored</label>
          <input
            type="text"
            value={content.hero.stats.systems}
            onChange={(e) => updateContent('hero', ['stats', 'systems'], e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderFeaturesEditor = () => (
    <div className="editor-section">
      <h3>What We Offer Section</h3>
      
      <div className="form-group">
        <label>Section Title</label>
        <input
          type="text"
          value={content.features.title}
          onChange={(e) => updateContent('features', 'title', e.target.value)}
        />
      </div>

      <h4>Feature Cards</h4>
      {content.features.cards.map((card, index) => (
        <div key={index} className="feature-card-editor">
          <h5>Feature {index + 1}</h5>
          
          <div className="form-group">
            <label>Icon (Emoji)</label>
            <input
              type="text"
              value={card.icon}
              onChange={(e) => updateContent('features', ['cards', index, 'icon'], e.target.value)}
              style={{ maxWidth: '100px' }}
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={card.title}
              onChange={(e) => updateContent('features', ['cards', index, 'title'], e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={card.description}
              onChange={(e) => updateContent('features', ['cards', index, 'description'], e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSocialLinksEditor = () => {
    // Initialize socialLinks if it doesn't exist
    if (!content.socialLinks) {
      const newContent = { ...content };
      newContent.socialLinks = {
        discord: { url: "https://discord.gg/your-server-code", enabled: true },
        spectrum: { url: "https://robertsspaceindustries.com/orgs/OOFS", enabled: true },
        website: { url: "https://your-org-website.com", enabled: false },
        youtube: { url: "https://youtube.com/your-channel", enabled: false }
      };
      setContent(newContent);
      setHasChanges(true);
      return <div>Loading...</div>;
    }

    return (
      <div className="editor-section">
        <h3>Social Links Management</h3>
        <p className="section-description">Configure your organization's social media and community links. These links will be used throughout the site for buttons and social navigation.</p>
        
        <div className="social-links-grid">
          <div className="social-link-card">
            <h4>🎮 Discord Server</h4>
            <div className="form-group">
              <label>Discord Invite URL</label>
              <input
                type="url"
                value={content.socialLinks.discord.url}
                onChange={(e) => updateContent('socialLinks', ['discord', 'url'], e.target.value)}
              placeholder="https://discord.gg/your-server-code"
            />
            <small className="input-hint">Get this from your Discord server settings → Invites → Create Invite</small>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.socialLinks.discord.enabled}
                onChange={(e) => updateContent('socialLinks', ['discord', 'enabled'], e.target.checked)}
              />
              Enable Discord Link
            </label>
          </div>
        </div>

        <div className="social-link-card">
          <h4>🌌 RSI Spectrum</h4>
          <div className="form-group">
            <label>Spectrum Organization URL</label>
            <input
              type="url"
              value={content.socialLinks.spectrum.url}
              onChange={(e) => updateContent('socialLinks', ['spectrum', 'url'], e.target.value)}
              placeholder="https://robertsspaceindustries.com/orgs/YOURID"
            />
            <small className="input-hint">Your organization page on Roberts Space Industries website</small>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.socialLinks.spectrum.enabled}
                onChange={(e) => updateContent('socialLinks', ['spectrum', 'enabled'], e.target.checked)}
              />
              Enable Spectrum Link
            </label>
          </div>
        </div>

        <div className="social-link-card">
          <h4>🌐 Website</h4>
          <div className="form-group">
            <label>Organization Website</label>
            <input
              type="url"
              value={content.socialLinks.website.url}
              onChange={(e) => updateContent('socialLinks', ['website', 'url'], e.target.value)}
              placeholder="https://your-org-website.com"
            />
            <small className="input-hint">Your main organization website (optional)</small>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.socialLinks.website.enabled}
                onChange={(e) => updateContent('socialLinks', ['website', 'enabled'], e.target.checked)}
              />
              Enable Website Link
            </label>
          </div>
        </div>

        <div className="social-link-card">
          <h4>📺 YouTube</h4>
          <div className="form-group">
            <label>YouTube Channel</label>
            <input
              type="url"
              value={content.socialLinks.youtube.url}
              onChange={(e) => updateContent('socialLinks', ['youtube', 'url'], e.target.value)}
              placeholder="https://youtube.com/your-channel"
            />
            <small className="input-hint">Your organization's YouTube channel (optional)</small>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.socialLinks.youtube.enabled}
                onChange={(e) => updateContent('socialLinks', ['youtube', 'enabled'], e.target.checked)}
              />
              Enable YouTube Link
            </label>
          </div>
        </div>
      </div>

      <div className="social-preview">
        <h4>Link Preview</h4>
        <div className="preview-links">
          {content.socialLinks.discord.enabled && (
            <a href={content.socialLinks.discord.url} target="_blank" rel="noopener noreferrer" className="preview-link discord">
              🎮 Join Discord
            </a>
          )}
          {content.socialLinks.spectrum.enabled && (
            <a href={content.socialLinks.spectrum.url} target="_blank" rel="noopener noreferrer" className="preview-link spectrum">
              🌌 View on Spectrum
            </a>
          )}
          {content.socialLinks.website.enabled && (
            <a href={content.socialLinks.website.url} target="_blank" rel="noopener noreferrer" className="preview-link website">
              🌐 Visit Website
            </a>
          )}
          {content.socialLinks.youtube.enabled && (
            <a href={content.socialLinks.youtube.url} target="_blank" rel="noopener noreferrer" className="preview-link youtube">
              📺 YouTube Channel
            </a>
          )}
        </div>
        {!Object.values(content.socialLinks).some(link => link.enabled) && (
          <p className="no-links">No social links enabled. Enable links above to see them here.</p>
        )}
      </div>
    </div>
    );
  };

  const renderJoinEditor = () => (
    <div className="editor-section">
      <h3>Join Section</h3>
      
      <div className="form-group">
        <label>Section Title</label>
        <input
          type="text"
          value={content.join.title}
          onChange={(e) => updateContent('join', 'title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          rows={4}
          value={content.join.description}
          onChange={(e) => updateContent('join', 'description', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          Background Image URL
          <span className="recommended-size">Recommended: 1920x1080px or larger (16:9 aspect ratio)</span>
        </label>
        <input
          type="text"
          value={content.join.backgroundImage || '/Join Fallen Star BG.png'}
          onChange={(e) => updateContent('join', 'backgroundImage', e.target.value)}
          placeholder="Enter image URL or path (e.g., /images/background.png)"
        />
        {content.join.backgroundImage && (
          <div className="image-preview-container">
            <img 
              src={OFSDataService.convertImgurUrl(content.join.backgroundImage)} 
              alt="Join section background preview" 
              className="background-preview"
              onError={(e) => {
                e.target.src = '/Nebula BG.jpeg'
                e.target.alt = 'Preview failed - check image URL or file permissions'
              }}
            />
            <p className="preview-note">Preview (actual display will be full-width)</p>
            <p className="preview-note" style={{ color: '#39b9ff', fontSize: '0.85rem' }}>
              Converted URL: {OFSDataService.convertImgurUrl(content.join.backgroundImage)}
            </p>
          </div>
        )}
      </div>

      <h4>Benefits</h4>
      {content.join.benefits.map((benefit, index) => (
        <div key={index} className="benefit-editor">
          <h5>Benefit {index + 1}</h5>
          
          <div className="benefit-row">
            <div className="form-group">
              <label>Icon (Emoji)</label>
              <input
                type="text"
                value={benefit.icon}
                onChange={(e) => updateContent('join', ['benefits', index, 'icon'], e.target.value)}
                style={{ maxWidth: '100px' }}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Text</label>
              <input
                type="text"
                value={benefit.text}
                onChange={(e) => updateContent('join', ['benefits', index, 'text'], e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="button-section">
        <h4>Action Buttons</h4>
        
        <div className="form-group">
          <label>Primary Button Text</label>
          <input
            type="text"
            value={content.join.buttons.primary}
            onChange={(e) => updateContent('join', ['buttons', 'primary'], e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Secondary Button Text</label>
          <input
            type="text"
            value={content.join.buttons.secondary}
            onChange={(e) => updateContent('join', ['buttons', 'secondary'], e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderDestinyEditor = () => {
    // Check if paths exist and are loaded
    if (!content.destiny.paths || content.destiny.paths.length === 0) {
      return (
        <div className="editor-section">
          <h3>Pick Your Destiny Section</h3>
          <div className="loading-message">
            <p>⚠️ No paths loaded yet. The "Choose Your Path" section is dynamically loaded from Google Sheets.</p>
            <p>Paths will appear here once they are loaded from your spreadsheet.</p>
          </div>
          
          <div className="form-group">
            <label>Section Title</label>
            <input
              type="text"
              value={content.destiny.title}
              onChange={(e) => updateContent('destiny', 'title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={content.destiny.subtitle}
              onChange={(e) => updateContent('destiny', 'subtitle', e.target.value)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="editor-section">
        <h3>Pick Your Destiny Section</h3>
        <p className="section-description">
          These paths are dynamically loaded from your Google Sheets. Changes here will only affect the titles. 
          To modify path details, edit them in your Google Sheet.
        </p>
        
        <div className="form-group">
          <label>Section Title</label>
          <input
            type="text"
            value={content.destiny.title}
            onChange={(e) => updateContent('destiny', 'title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            value={content.destiny.subtitle}
            onChange={(e) => updateContent('destiny', 'subtitle', e.target.value)}
          />
        </div>

        <div className="paths-preview">
          <h4>Loaded Paths ({content.destiny.paths.length})</h4>
          {content.destiny.paths.map((path, index) => (
            <div key={index} className="path-card-preview">
              <div className="path-preview-header">
                <h5>{path.title}</h5>
                {path.image && <img src={path.image} alt={path.title} className="path-preview-image" />}
              </div>
              <p className="path-preview-subtitle">{path.subtitle}</p>
              <p className="path-preview-description">{path.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleBackToSite = () => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/home');
  };

  // Show loading screen while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="content-management">
        <div className="auth-check-container">
          <div className="auth-check-content">
            <div className="auth-spinner"></div>
            <h2>Checking Authorization...</h2>
            <p>Verifying admin credentials</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="content-management">
      <div className="cm-header">
        <div className="cm-header-left">
          <button className="back-button" onClick={handleBackToSite}>
            ← Back to Site
          </button>
          <h1>Content Management <span className="system-label">System</span></h1>
        </div>
        <div className="cm-actions">
          {saveStatus && <span className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>{saveStatus}</span>}
          <button 
            className={`btn save ${hasChanges ? 'has-changes' : ''}`} 
            onClick={saveChanges}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
          <button className="btn reset" onClick={resetContent}>
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="section-divider">
        <h2>Home Page Content Editor</h2>
      </div>

      <div className="cm-tabs">
        <button 
          className={activeTab === 'header' ? 'active' : ''} 
          onClick={() => setActiveTab('header')}
        >
          Header Settings
        </button>
        <button 
          className={activeTab === 'hero' ? 'active' : ''} 
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button 
          className={activeTab === 'features' ? 'active' : ''} 
          onClick={() => setActiveTab('features')}
        >
          What We Offer
        </button>
        <button 
          className={activeTab === 'destiny' ? 'active' : ''} 
          onClick={() => setActiveTab('destiny')}
        >
          Pick Your Destiny
        </button>
        <button 
          className={activeTab === 'join' ? 'active' : ''} 
          onClick={() => setActiveTab('join')}
        >
          Join Section
        </button>
        <button 
          className={activeTab === 'social' ? 'active' : ''} 
          onClick={() => setActiveTab('social')}
        >
          Social Links
        </button>
      </div>

      <div className="cm-content">
        {activeTab === 'header' && renderHeaderEditor()}
        {activeTab === 'hero' && renderHeroEditor()}
        {activeTab === 'features' && renderFeaturesEditor()}
        {activeTab === 'destiny' && renderDestinyEditor()}
        {activeTab === 'join' && renderJoinEditor()}
        {activeTab === 'social' && renderSocialLinksEditor()}
      </div>
    </div>
  );
}

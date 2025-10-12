import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import './ContentManagement.css';

export default function ContentManagement() {
  const navigate = useNavigate();
  const [content, setContent] = useState(contentService.getContent());
  const [activeTab, setActiveTab] = useState('hero');
  const [activePage, setActivePage] = useState('home');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

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

  const addResponsibility = (rankIndex) => {
    const newContent = { ...content };
    newContent.destiny.ranks[rankIndex].responsibilities.push('New responsibility');
    setContent(newContent);
    setHasChanges(true);
  };

  const removeResponsibility = (rankIndex, respIndex) => {
    const newContent = { ...content };
    newContent.destiny.ranks[rankIndex].responsibilities.splice(respIndex, 1);
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

  const renderDestinyEditor = () => (
    <div className="editor-section">
      <h3>Pick Your Destiny Section</h3>
      
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

      {content.destiny.ranks.map((rank, index) => (
        <div key={index} className="rank-editor">
          <h4>Rank {index + 1}: {rank.title}</h4>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={rank.title}
              onChange={(e) => updateContent('destiny', ['ranks', index, 'title'], e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={rank.subtitle}
              onChange={(e) => updateContent('destiny', ['ranks', index, 'subtitle'], e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={6}
              value={rank.description}
              onChange={(e) => updateContent('destiny', ['ranks', index, 'description'], e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Responsibilities</label>
            {rank.responsibilities.map((resp, respIndex) => (
              <div key={respIndex} className="responsibility-item">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => updateContent('destiny', ['ranks', index, 'responsibilities', respIndex], e.target.value)}
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeResponsibility(index, respIndex)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addResponsibility(index)}
            >
              + Add Responsibility
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const availablePages = [
    { id: 'home', name: 'Home Page', description: 'Main landing page content' },
    { id: 'about', name: 'About Page', description: 'Organization information (Coming Soon)' },
    { id: 'fleet', name: 'Fleet Page', description: 'Ship showcase and details (Coming Soon)' },
    { id: 'join', name: 'Join Page', description: 'Recruitment information (Coming Soon)' },
    { id: 'progress', name: 'Progress Page', description: 'Development updates (Coming Soon)' }
  ];

  const handleBackToSite = () => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/');
  };

  return (
    <div className="content-management">
      <div className="cm-header">
        <div className="cm-header-left">
          <button className="back-button" onClick={handleBackToSite}>
            ← Back to Site
          </button>
          <h1>Content Management System</h1>
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

      <div className="page-navigation">
        <h2>Select Page to Edit</h2>
        <div className="page-grid">
          {availablePages.map((page) => (
            <div 
              key={page.id} 
              className={`page-card ${activePage === page.id ? 'active' : ''} ${page.id !== 'home' ? 'disabled' : ''}`}
              onClick={() => page.id === 'home' && setActivePage(page.id)}
            >
              <h3>{page.name}</h3>
              <p>{page.description}</p>
              {page.id !== 'home' && <div className="coming-soon">Coming Soon</div>}
              {page.id === 'home' && activePage === page.id && <div className="active-indicator">Currently Editing</div>}
            </div>
          ))}
        </div>
      </div>

      {activePage === 'home' && (
        <>
          <div className="section-divider">
            <h2>Home Page Content Editor</h2>
          </div>

          <div className="cm-tabs">
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
      </div>

          <div className="cm-content">
            {activeTab === 'hero' && renderHeroEditor()}
            {activeTab === 'features' && renderFeaturesEditor()}
            {activeTab === 'destiny' && renderDestinyEditor()}
            {activeTab === 'join' && renderJoinEditor()}
          </div>
        </>
      )}
    </div>
  );
}

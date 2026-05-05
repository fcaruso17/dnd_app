import { useState, useEffect } from 'react';
import './App.css';
import { useCharacterStore } from './store/useCharacterStore';
import { useTheme } from './hooks/useTheme';
import { parseAndValidate } from './utils/validate';

import { PageOneCore } from './components/PageOne';
import { PageTwoDetails } from './components/PageTwo';
import { PageThreeSpells } from './components/PageThree';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('dnd-active-tab');
    return parseAndValidate(saved, 1, 3, 1);
  });
  const exportCharacter = useCharacterStore(state => state.exportCharacter);
  const resetCharacter = useCharacterStore(state => state.resetCharacter);
  const importCharacter = useCharacterStore(state => state.importCharacter);
  const lastSaved = useCharacterStore(state => state.lastSaved);
  const characterName = useCharacterStore(state => state.character.header.characterName);
  const isEditMode = useCharacterStore(state => state.isEditMode);
  const toggleEditMode = useCharacterStore(state => state.toggleEditMode);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    document.title = characterName ? `${characterName} — The Codex` : 'The Codex';
  }, [characterName]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('dnd-active-tab', tab);
  };

  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleTabChange(activeTab === 3 ? 1 : activeTab + 1);
    else if (e.key === 'ArrowLeft') handleTabChange(activeTab === 1 ? 3 : activeTab - 1);
    else if (e.key === 'Home') { e.preventDefault(); handleTabChange(1); }
    else if (e.key === 'End') { e.preventDefault(); handleTabChange(3); }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => importCharacter(event.target.result);
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleReset = () => {
    if (window.confirm('Reset all character data? This cannot be undone.')) resetCharacter();
  };

  return (
    <div className="app-container">
      {/* Single consolidated topbar */}
      <header className="topbar" role="banner">
        <div className="topbar-inner">
          {/* Brand */}
          <div className="topbar-brand">
            <span className="topbar-title">The Codex</span>
            <span className="topbar-save saved" title={`Last saved ${new Date(lastSaved).toLocaleTimeString()}`}>
              ●
            </span>
          </div>

          {/* Tabs inline */}
          <nav className="topbar-tabs" role="tablist" onKeyDown={handleTabKeyDown}>
            {[
              { id: 1, label: 'Core & Combat' },
              { id: 2, label: 'Details' },
              { id: 3, label: 'Spellcasting' },
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`topbar-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right controls — grouped and labeled */}
          <div className="topbar-controls">
            {/* Edit toggle with label */}
            <button
              className={`edit-toggle-btn${isEditMode ? ' edit-toggle-btn--active' : ''}`}
              onClick={toggleEditMode}
              aria-label={isEditMode ? 'Sheet is in edit mode. Click to lock.' : 'Sheet is locked for play. Click to enable editing.'}
            >
              <span className="edit-toggle-icon">{isEditMode ? '🔓' : '🔒'}</span>
              <span className="edit-toggle-label">{isEditMode ? 'Editing' : 'Locked'}</span>
            </button>

            {/* Appearance group */}
            <div className="topbar-appearance">
              <span className="topbar-group-label">THEME</span>
              <div className="theme-picker">
                {themes.map(t => (
                  <button
                    key={t.id}
                    className={`theme-swatch${theme === t.id ? ' active' : ''}`}
                    style={{ background: t.swatch }}
                    onClick={() => setTheme(t.id)}
                    aria-label={`Switch to ${t.label} theme`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>

            {/* Actions group */}
            <div className="topbar-actions">
              <label className="btn btn-sm">
                Import
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
              <button className="btn btn-sm" onClick={exportCharacter}>Export</button>
              <button className="btn btn-sm btn-danger" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      </header>

      <main key={activeTab} className="tab-content animate-fade-in">
        {activeTab === 1 && <PageOneCore />}
        {activeTab === 2 && <PageTwoDetails />}
        {activeTab === 3 && <PageThreeSpells />}
      </main>
    </div>
  );
}

export default App;

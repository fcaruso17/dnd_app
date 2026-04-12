import { useState, useEffect } from 'react';
import './App.css';
import { useCharacterStore } from './store/useCharacterStore';
import { useTheme } from './hooks/useTheme';

import { PageOneCore } from './components/PageOne';
import { PageTwoDetails } from './components/PageTwo';
import { PageThreeSpells } from './components/PageThree';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = parseInt(localStorage.getItem('dnd-active-tab'));
    return saved >= 1 && saved <= 3 ? saved : 1;
  });
  const exportCharacter = useCharacterStore(state => state.exportCharacter);
  const resetCharacter = useCharacterStore(state => state.resetCharacter);
  const importCharacter = useCharacterStore(state => state.importCharacter);
  const lastSaved = useCharacterStore(state => state.lastSaved);
  const characterName = useCharacterStore(state => state.character.header.characterName);
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
      <header className="app-header">
        <div>
          <h1 className="header-title">The Codex</h1>
          <div className="save-status saved">
            Auto-saved locally • {new Date(lastSaved).toLocaleTimeString()}
          </div>
        </div>

        <div className="theme-picker">
          {themes.map(t => (
            <button
              key={t.id}
              className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
              style={{ background: t.swatch }}
              onClick={() => setTheme(t.id)}
              aria-label={`Switch to ${t.label} theme`}
              title={t.label}
            />
          ))}
        </div>

        <div className="header-controls">
          <label className="btn" style={{ cursor: 'pointer' }}>
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn" onClick={exportCharacter}>Export .json</button>
          <button className="btn btn-danger" onClick={handleReset}>Reset</button>
        </div>
      </header>

      <nav className="tabs-nav" role="tablist" onKeyDown={handleTabKeyDown}>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(1)}
        >
          Core & Combat
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 2}
          className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => handleTabChange(2)}
        >
          Character Details
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 3}
          className={`tab-btn ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => handleTabChange(3)}
        >
          Spellcasting
        </button>
      </nav>

      <main key={activeTab} className="tab-content animate-fade-in">
        {activeTab === 1 && <PageOneCore />}
        {activeTab === 2 && <PageTwoDetails />}
        {activeTab === 3 && <PageThreeSpells />}
      </main>
    </div>
  );
}

export default App;

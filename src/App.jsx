import { useState } from 'react';
import './App.css';
import { useCharacterStore } from './store/useCharacterStore';

import { PageOneCore } from './components/PageOne';
import { PageTwoDetails } from './components/PageTwo';
import { PageThreeSpells } from './components/PageThree';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState(1);
  const exportCharacter = useCharacterStore(state => state.exportCharacter);
  const resetCharacter = useCharacterStore(state => state.resetCharacter);
  const importCharacter = useCharacterStore(state => state.importCharacter);
  const lastSaved = useCharacterStore(state => state.lastSaved);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => importCharacter(event.target.result);
    reader.readAsText(file);
    // Reset input so you can re-import the same file if needed
    e.target.value = null;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="header-title">D&D Digital Sheet</h1>
          <div className="save-status saved">
            Auto-saved locally • {new Date(lastSaved).toLocaleTimeString()}
          </div>
        </div>
        <div className="header-controls">
          <label className="btn" style={{ cursor: 'pointer' }}>
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn" onClick={exportCharacter}>Export .json</button>
          <button className="btn btn-primary" onClick={resetCharacter}>Reset</button>
        </div>
      </header>

      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Core & Combat
        </button>
        <button
          className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          Character Details
        </button>
        <button
          className={`tab-btn ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => setActiveTab(3)}
        >
          Spellcasting
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 1 && <PageOneCore />}
        {activeTab === 2 && <PageTwoDetails />}
        {activeTab === 3 && <PageThreeSpells />}
      </main>
    </div>
  );
};

function App() {
  return (
    <MainApp />
  );
}

export default App;

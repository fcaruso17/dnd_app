import { useCharacterStore } from '../../store/useCharacterStore';
import './PageOne.css'; // Let's define specific page layout css

export const Header = () => {
    const data = useCharacterStore(state => state.character.header);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getTotalLevel = useCharacterStore(state => state.getTotalLevel);
    const getProficiencyBonus = useCharacterStore(state => state.getProficiencyBonus);

    const handleClassChange = (index, field, value) => {
        const newClasses = [...data.classes];
        if (field === 'level') value = parseInt(value) || 1;
        newClasses[index] = { ...newClasses[index], [field]: value };
        updateNestedField('header', 'classes', newClasses);
    };

    const addClass = () => {
        const newClasses = [...data.classes, { className: '', level: 1 }];
        updateNestedField('header', 'classes', newClasses);
    };

    const removeClass = (index) => {
        if (data.classes.length <= 1) return;
        const newClasses = data.classes.filter((_, i) => i !== index);
        updateNestedField('header', 'classes', newClasses);
    };

    return (
        <div className="glass-panel header-panel">

            {/* Top row: Name & Player */}
            <div className="header-row">
                <label className="input-group large">
                    <span>Character Name</span>
                    <input
                        type="text"
                        value={data.characterName}
                        onChange={(e) => updateNestedField('header', 'characterName', e.target.value)}
                        placeholder="e.g. Drizzt Do'Urden"
                    />
                </label>

                <label className="input-group">
                    <span>Player Name</span>
                    <input
                        type="text"
                        value={data.playerName}
                        onChange={(e) => updateNestedField('header', 'playerName', e.target.value)}
                    />
                </label>
            </div>

            {/* Middle row: Multi-class Array */}
            <div className="header-row class-row flex" style={{ gap: '2rem', alignItems: 'stretch', justifyContent: 'flex-start' }}>
                <div className="classes-container" style={{ flex: '0 1 400px' }}>
                    <div className="classes-header flex-between mb-2">
                        <span>Classes & Levels</span>
                        <button className="btn btn-sm" onClick={addClass}>+ Add Class</button>
                    </div>
                    {data.classes.map((cls, idx) => (
                        <div key={idx} className="class-entry flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Class"
                                value={cls.className}
                                onChange={(e) => handleClassChange(idx, 'className', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Lvl"
                                min="1" max="20"
                                value={cls.level}
                                onChange={(e) => handleClassChange(idx, 'level', e.target.value)}
                                style={{ width: '60px' }}
                            />
                            <button
                                className="btn-danger-icon"
                                onClick={() => removeClass(idx)}
                                disabled={data.classes.length === 1}
                                title="Remove Class"
                            >✕</button>
                        </div>
                    ))}
                </div>

                <div className="auto-calc-box" style={{ flex: '0 0 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px solid var(--glass-border-strong)', background: 'rgba(212, 175, 55, 0.08)', borderRadius: 'var(--radius-md)' }}>
                    <div className="calc-value" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1 }}>{getTotalLevel()}</div>
                    <div className="calc-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', marginTop: '0.5rem' }}>Total Lvl</div>
                </div>
            </div>

            {/* Bottom row: Details */}
            <div className="header-row details-row">
                <label className="input-group">
                    <span>Background</span>
                    <input type="text" value={data.background} onChange={e => updateNestedField('header', 'background', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Race</span>
                    <input type="text" value={data.race} onChange={e => updateNestedField('header', 'race', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Alignment</span>
                    <input type="text" value={data.alignment} onChange={e => updateNestedField('header', 'alignment', e.target.value)} />
                </label>
                <label className="input-group small-input">
                    <span>XP</span>
                    <input type="number" value={data.experiencePoints} onChange={e => updateNestedField('header', 'experiencePoints', parseInt(e.target.value) || 0)} />
                </label>
            </div>

        </div>
    );
};

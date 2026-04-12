import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { TraitModal } from './TraitModal';

const TRAIT_FIELDS = [
    { field: 'features',    label: 'Features & Traits' },
    { field: 'personality', label: 'Personality' },
    { field: 'ideals',      label: 'Ideals' },
    { field: 'bonds',       label: 'Bonds' },
    { field: 'flaws',       label: 'Flaws' },
];

export const Header = () => {
    const data = useCharacterStore(state => state.character.header);
    const traits = useCharacterStore(state => state.character.traits);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getTotalLevel = useCharacterStore(state => state.getTotalLevel);

    const [openTrait, setOpenTrait] = useState(null);

    const handleClassChange = (index, field, value) => {
        const newClasses = [...data.classes];
        if (field === 'level') value = parseInt(value) || 1;
        newClasses[index] = { ...newClasses[index], [field]: value };
        updateNestedField('header', 'classes', newClasses);
    };

    const addClass = () => {
        updateNestedField('header', 'classes', [...data.classes, { id: crypto.randomUUID(), className: '', level: 1 }]);
    };

    const removeClass = (index) => {
        if (data.classes.length <= 1) return;
        updateNestedField('header', 'classes', data.classes.filter((_, i) => i !== index));
    };

    const activeTrait = openTrait ? TRAIT_FIELDS.find(t => t.field === openTrait) : null;

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

            {/* Middle row: Classes + Total Level + Trait Chips */}
            <div className="header-row class-row">
                <div className="classes-container">
                    <div className="classes-header flex-between mb-2">
                        <span>Classes & Levels</span>
                        <button className="btn btn-sm" onClick={addClass}>+ Add Class</button>
                    </div>
                    {data.classes.map((cls, idx) => (
                        <div key={cls.id || idx} className="class-entry flex gap-2 mb-2">
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
                                className="class-level-input"
                            />
                            <button
                                className="btn-danger-icon"
                                onClick={() => removeClass(idx)}
                                disabled={data.classes.length === 1}
                                aria-label="Remove class"
                            >✕</button>
                        </div>
                    ))}
                </div>

                <div className="auto-calc-box">
                    <div className="calc-value">{getTotalLevel()}</div>
                    <div className="calc-label">Total Lvl</div>
                </div>

                <div className="trait-chips">
                    <button
                        className="trait-chip trait-chip--wide"
                        onClick={() => setOpenTrait('features')}
                    >
                        <span className="trait-chip-label">Features & Traits</span>
                        <span className="trait-chip-preview">
                            {traits.features ? traits.features.slice(0, 60) + (traits.features.length > 60 ? '…' : '') : 'Click to edit…'}
                        </span>
                    </button>
                    <div className="trait-chips-row">
                        {TRAIT_FIELDS.slice(1).map(({ field, label }) => (
                            <button
                                key={field}
                                className="trait-chip"
                                onClick={() => setOpenTrait(field)}
                            >
                                <span className="trait-chip-label">{label}</span>
                                <span className="trait-chip-preview">
                                    {traits[field] ? traits[field].slice(0, 28) + (traits[field].length > 28 ? '…' : '') : '—'}
                                </span>
                            </button>
                        ))}
                    </div>
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

            {activeTrait && (
                <TraitModal
                    label={activeTrait.label}
                    value={traits[openTrait] || ''}
                    onChange={(val) => updateNestedField('traits', openTrait, val)}
                    onClose={() => setOpenTrait(null)}
                />
            )}
        </div>
    );
};

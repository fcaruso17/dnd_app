import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { TraitModal } from './TraitModal';
import { CLASSES, SUBCLASSES } from '../../data/classes';

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
        if (field === 'className') {
            newClasses[index] = { ...newClasses[index], className: value, subclass: '' };
        } else {
            newClasses[index] = { ...newClasses[index], [field]: value };
        }
        updateNestedField('header', 'classes', newClasses);
    };

    const addClass = () => {
        updateNestedField('header', 'classes', [...data.classes, { id: crypto.randomUUID(), className: '', level: 1, subclass: '' }]);
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
                    {data.classes.map((cls, idx) => {
                        const isHomebrew = cls.subclass && !SUBCLASSES[cls.className]?.includes(cls.subclass);
                        return (
                            <div key={cls.id || idx} className="class-entry">
                                <div className="class-entry-top">
                                    <select
                                        value={cls.className}
                                        onChange={(e) => handleClassChange(idx, 'className', e.target.value)}
                                        className="class-select"
                                    >
                                        <option value="">— Select Class —</option>
                                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
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
                                {cls.className && cls.level >= 3 && (
                                    <div className="subclass-row">
                                        <span className="subclass-label">Subclass</span>
                                        {isHomebrew ? (
                                            <input
                                                type="text"
                                                className="subclass-input"
                                                placeholder="Homebrew subclass"
                                                value={cls.subclass}
                                                onChange={(e) => handleClassChange(idx, 'subclass', e.target.value)}
                                                aria-label="Subclass (custom)"
                                            />
                                        ) : (
                                            <select
                                                className="subclass-input"
                                                value={cls.subclass}
                                                onChange={(e) => {
                                                    if (e.target.value === '__other__') {
                                                        handleClassChange(idx, 'subclass', ' ');
                                                    } else {
                                                        handleClassChange(idx, 'subclass', e.target.value);
                                                    }
                                                }}
                                                aria-label="Subclass"
                                            >
                                                <option value="">— Select Subclass —</option>
                                                {(SUBCLASSES[cls.className] || []).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                                <option value="__other__">Other… (homebrew)</option>
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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

import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { searchSpells } from '../../services/spellData';
import { PREPARED_CASTER_CLASSES } from '../../data/classes';
import { PreparedCount } from './PreparedCount';

export const SpellLevel = ({ level }) => {
    const data = useCharacterStore(state => state.character.spellcasting);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getPreparedMax = useCharacterStore(state => state.getPreparedMax);
    const headerClasses = useCharacterStore(state => state.character.header.classes);
    const spellcastingExclusions = useCharacterStore(state => state.character.spellcasting.spellcastingExclusions || []);

    const levelData = data.spells[level] || [];
    const slotData = data.slots[level] || { total: 0, expended: 0 };
    // All prepared-caster classes the character has — used for prepared count logic
    const spellcastingClasses = PREPARED_CASTER_CLASSES.filter(cls =>
        headerClasses.some(c => c.className === cls)
    );
    // Active filter = all classes minus what the user has manually excluded — used for search
    const activeFilterClasses = spellcastingClasses.filter(cls => !spellcastingExclusions.includes(cls));

    const [isSearching, setIsSearching] = useState(false);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSpellId, setExpandedSpellId] = useState(null);
    const [customSpell, setCustomSpell] = useState({
        name: '', castingTime: '', range: '', components: '', duration: '', desc: ''
    });

    // Inline search results — no portal needed (inline flow, not positioned)
    const searchResults = searchQuery.length > 0
        ? searchSpells(searchQuery, activeFilterClasses, level)
        : [];

    // Prepared enforcement: count all prepared spells across ALL levels
    const totalPrepared = Object.values(data.spells).flat().filter(s => s.prepared).length;
    const totalPreparedMax = spellcastingClasses.reduce((sum, cls) => sum + getPreparedMax(cls), 0);
    const atPreparedMax = spellcastingClasses.length > 0 && totalPreparedMax > 0 && totalPrepared >= totalPreparedMax;

    const handleSelectSpell = (spell) => {
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: [...levelData, {
                id: crypto.randomUUID(),
                name: spell.name,
                castingTime: spell.castingTime,
                range: spell.range,
                components: spell.materials || '',
                duration: spell.duration,
                desc: spell.desc,
                concentration: spell.concentration,
                ritual: spell.ritual,
                school: spell.school,
                saveOrAttack: spell.saveOrAttack,
                source: spell.source,
                prepared: false,
            }]
        });
        setIsSearching(false);
        setSearchQuery('');
    };

    const handleAddCustomSpell = () => {
        if (!customSpell.name.trim()) return;
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: [...levelData, { id: crypto.randomUUID(), ...customSpell, prepared: false }]
        });
        setCustomSpell({ name: '', castingTime: '', range: '', components: '', duration: '', desc: '' });
        setIsAddingCustom(false);
    };

    const removeSpell = (id) => {
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: levelData.filter(s => s.id !== id)
        });
    };

    const togglePrepared = (spell) => {
        const isPrepared = spell.prepared ?? false;
        if (!isPrepared && atPreparedMax) return; // enforce cap
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: levelData.map(s =>
                s.id === spell.id ? { ...s, prepared: !isPrepared } : s
            )
        });
    };

    const toggleSlot = (increment) => {
        const newVal = Math.max(0, Math.min(slotData.total, slotData.expended + increment));
        updateNestedField('spellcasting', 'slots', {
            ...data.slots,
            [level]: { ...slotData, expended: newVal }
        });
    };

    const setTotalSlots = (val) => {
        updateNestedField('spellcasting', 'slots', {
            ...data.slots,
            [level]: { ...slotData, total: parseInt(val) || 0 }
        });
    };

    return (
        <div className="glass-panel spell-level-box">
            <div className="spell-level-header">
                <h4 className="level-title">
                    {level === 0 ? 'Cantrips (0 Level)' : `Level ${level}`}
                </h4>

                {level > 0 && (
                    <div className="slots-container">
                        <span>Slots</span>
                        <input
                            type="number"
                            value={slotData.total}
                            onChange={(e) => setTotalSlots(e.target.value)}
                            title="Total Slots"
                            className="slot-input"
                        />
                        <div className="slot-expended">
                            <button className="btn-sm" onClick={() => toggleSlot(-1)} aria-label="Recover spell slot">-</button>
                            <span className="slot-count">{slotData.total - slotData.expended}</span>
                            <button className="btn-sm" onClick={() => toggleSlot(1)} disabled={slotData.expended >= slotData.total}>Use</button>
                        </div>
                        <PreparedCount spellcastingClasses={spellcastingClasses} />
                    </div>
                )}
            </div>

            <div className="spell-list">
                {levelData.map((spell) => {
                    const isExpanded = expandedSpellId === spell.id;
                    const isPrepared = spell.prepared ?? false;
                    // Cantrips are always known — no prepared toggle
                    const showPreparedToggle = level > 0 && spellcastingClasses.length > 0 && totalPreparedMax > 0;
                    const toggleDisabled = !isPrepared && atPreparedMax;

                    return (
                        <div key={spell.id} className={`spell-item${isPrepared ? ' spell-prepared' : ''}`}>
                            <div className="spell-item-header">
                                {showPreparedToggle && (
                                    <button
                                        className={`prepared-toggle${isPrepared ? ' prepared-toggle--on' : ''}`}
                                        onClick={() => togglePrepared(spell)}
                                        disabled={toggleDisabled}
                                        aria-label={isPrepared ? 'Unprepare spell' : 'Prepare spell'}
                                        aria-pressed={isPrepared}
                                        title={toggleDisabled ? 'Prepared spell limit reached' : (isPrepared ? 'Prepared' : 'Not prepared')}
                                    >
                                        {isPrepared ? '★' : '☆'}
                                    </button>
                                )}
                                <span
                                    className="spell-name"
                                    onClick={() => setExpandedSpellId(isExpanded ? null : spell.id)}
                                >
                                    {isExpanded ? '▼' : '▶'} {spell.name}
                                    {spell.concentration && <span className="spell-tag spell-tag--conc">C</span>}
                                    {spell.ritual && <span className="spell-tag spell-tag--ritual">R</span>}
                                </span>
                                <button
                                    className="btn-danger-icon"
                                    onClick={() => removeSpell(spell.id)}
                                    aria-label="Remove spell"
                                >✕</button>
                            </div>

                            {isExpanded && (
                                <div className="spell-details">
                                    <div className="spell-meta">
                                        <div><strong>Time:</strong> {spell.castingTime}</div>
                                        <div><strong>Range:</strong> {spell.range}</div>
                                        <div><strong>Comp:</strong> {spell.components || spell.materials}</div>
                                        <div><strong>Duration:</strong> {spell.duration}</div>
                                        {spell.school && <div><strong>School:</strong> {spell.school}</div>}
                                        {spell.saveOrAttack && <div><strong>Save/Atk:</strong> {spell.saveOrAttack}</div>}
                                        {spell.source && <div><strong>Source:</strong> {spell.source}</div>}
                                    </div>
                                    <p className="spell-desc">{spell.desc}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="add-spell-controls">
                {isSearching ? (
                    <div className="spell-search-container">
                        <input
                            type="text"
                            autoFocus
                            className="spell-search-input"
                            placeholder={
                                activeFilterClasses.length
                                    ? `Search ${activeFilterClasses.join(' / ')} spells…`
                                    : 'Search all spells…'
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="spell-search-results">
                                {searchResults.map(spell => (
                                    <button
                                        key={spell.name}
                                        className="spell-search-result"
                                        onClick={() => handleSelectSpell(spell)}
                                    >
                                        <span className="result-name">{spell.name}</span>
                                        <span className="result-meta">{spell.school} · {spell.castingTime}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            className="btn-sm btn-danger ml-2"
                            onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : isAddingCustom ? (
                    <div className="custom-spell-form glass-panel">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Spell Name *"
                            value={customSpell.name}
                            onChange={(e) => setCustomSpell({ ...customSpell, name: e.target.value })}
                        />
                        <div className="custom-spell-row">
                            <input
                                type="text"
                                placeholder="Casting Time"
                                value={customSpell.castingTime}
                                onChange={(e) => setCustomSpell({ ...customSpell, castingTime: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Range"
                                value={customSpell.range}
                                onChange={(e) => setCustomSpell({ ...customSpell, range: e.target.value })}
                            />
                        </div>
                        <div className="custom-spell-row">
                            <input
                                type="text"
                                placeholder="Components"
                                value={customSpell.components}
                                onChange={(e) => setCustomSpell({ ...customSpell, components: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Duration"
                                value={customSpell.duration}
                                onChange={(e) => setCustomSpell({ ...customSpell, duration: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Description..."
                            rows={3}
                            value={customSpell.desc}
                            onChange={(e) => setCustomSpell({ ...customSpell, desc: e.target.value })}
                        />
                        <div className="custom-spell-actions">
                            <button className="btn btn-sm btn-primary" onClick={handleAddCustomSpell}>Add Spell</button>
                            <button className="btn-sm btn-danger ml-2" onClick={() => setIsAddingCustom(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="add-spell-buttons">
                        <button className="btn btn-sm btn-primary" onClick={() => setIsSearching(true)}>+ Add Spell</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setIsAddingCustom(true)}>+ Custom Spell</button>
                    </div>
                )}
            </div>
        </div>
    );
};

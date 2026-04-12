import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchAllSpells, searchList, fetchSpellDetails } from '../../services/dndApi';
import { ApiSearchDropdown } from '../shared/ApiSearchDropdown';

const SpellLevel = ({ level, allSpellsList }) => {
    const data = useCharacterStore(state => state.character.spellcasting);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const levelData = data.spells[level] || [];
    const slotData = data.slots[level] || { total: 0, expended: 0 };

    const [isSearching, setIsSearching] = useState(false);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [expandedSpell, setExpandedSpell] = useState(null);
    const [customSpell, setCustomSpell] = useState({
        name: '', castingTime: '', range: '', components: '', duration: '', desc: ''
    });

    useEffect(() => {
        if (searchQuery.length > 0) {
            setSearchResults(searchList(allSpellsList, searchQuery, { level }));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, allSpellsList, level]);

    const handleSelectOfficialSpell = async (spellIndex) => {
        try {
            const details = await fetchSpellDetails(spellIndex);
            if (!details) return;

            let descText = details.desc ? details.desc.join('\n') : '';
            if (details.higher_level && details.higher_level.length > 0) {
                descText += '\n\nAt Higher Levels: ' + details.higher_level.join(' ');
            }

            updateNestedField('spellcasting', 'spells', {
                ...data.spells,
                [level]: [...levelData, {
                    id: crypto.randomUUID(),
                    name: details.name,
                    castingTime: details.casting_time,
                    range: details.range,
                    components: details.components ? details.components.join(', ') : '',
                    duration: details.duration,
                    desc: descText
                }]
            });
        } catch (err) {
            console.error("Failed to fetch spell details:", err);
        } finally {
            setIsSearching(false);
            setSearchQuery('');
        }
    };

    const handleAddCustomSpell = () => {
        if (!customSpell.name.trim()) return;
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: [...levelData, { id: crypto.randomUUID(), ...customSpell }]
        });
        setCustomSpell({ name: '', castingTime: '', range: '', components: '', duration: '', desc: '' });
        setIsAddingCustom(false);
    };

    const removeSpell = (idx) => {
        updateNestedField('spellcasting', 'spells', {
            ...data.spells,
            [level]: levelData.filter((_, i) => i !== idx)
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
                <h4 className="level-title">{level === 0 ? 'Cantrips (0 Level)' : `Level ${level}`}</h4>

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
                    </div>
                )}
            </div>

            <div className="spell-list">
                {levelData.map((spell, idx) => {
                    const isExpanded = expandedSpell === idx;
                    return (
                        <div key={spell.id || idx} className="spell-item">
                            <div className="spell-item-header">
                                <span className="spell-name" onClick={() => setExpandedSpell(isExpanded ? null : idx)}>
                                    {isExpanded ? '▼' : '▶'} {spell.name}
                                </span>
                                <button className="btn-danger-icon" onClick={() => removeSpell(idx)} aria-label="Remove spell">✕</button>
                            </div>

                            {isExpanded && (
                                <div className="spell-details">
                                    <div className="spell-meta">
                                        <div><strong>Time:</strong> {spell.castingTime}</div>
                                        <div><strong>Range:</strong> {spell.range}</div>
                                        <div><strong>Comp:</strong> {spell.components}</div>
                                        <div><strong>Duration:</strong> {spell.duration}</div>
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
                    <div className="api-search-container">
                        <ApiSearchDropdown
                            placeholder="Search via 5e API..."
                            query={searchQuery}
                            onQueryChange={setSearchQuery}
                            results={searchResults}
                            onSelect={handleSelectOfficialSpell}
                        />
                        <button className="btn-sm btn-danger ml-2" onClick={() => setIsSearching(false)}>Cancel</button>
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
                        <button className="btn btn-sm btn-primary" onClick={() => setIsSearching(true)}>+ From API</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setIsAddingCustom(true)}>+ Custom Spell</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SpellSlotTracker = () => {
    const { data: allSpells } = useQuery({
        queryKey: ['spells'],
        queryFn: fetchAllSpells
    });

    const levelsColumn1 = [0, 1, 2, 3, 4];
    const levelsColumn2 = [5, 6, 7, 8, 9];

    return (
        <div className="spell-tracker-container">
            <div className="spell-tracker-column">
                {levelsColumn1.map(level => (
                    <SpellLevel key={level} level={level} allSpellsList={allSpells} />
                ))}
            </div>
            <div className="spell-tracker-column">
                {levelsColumn2.map(level => (
                    <SpellLevel key={level} level={level} allSpellsList={allSpells} />
                ))}
            </div>
        </div>
    );
};

import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';

export const CharacterCard = () => {
    const details    = useCharacterStore(s => s.character.details);
    const combat     = useCharacterStore(s => s.character.combat);
    const inventory  = useCharacterStore(s => s.character.inventory);
    const update     = useCharacterStore(s => s.updateNestedField);
    const isEditMode = useCharacterStore(s => s.isEditMode);
    const [newProf, setNewProf] = useState('');

    const customProfs = combat.customProficiencies || [];

    const handleAddProficiency = () => {
        if (newProf.trim()) {
            update('combat', 'customProficiencies', [...customProfs, newProf.trim()]);
            setNewProf('');
        }
    };

    const handleRemoveProficiency = (idx) => {
        update('combat', 'customProficiencies', customProfs.filter((_, i) => i !== idx));
    };

    const toggleWeaponProf = (type) => {
        update('combat', 'weaponProficiencies', {
            ...combat.weaponProficiencies,
            [type]: !combat.weaponProficiencies[type]
        });
    };

    const toggleArmorProf = (type) => {
        update('inventory', 'training', {
            ...inventory.training,
            [type]: !inventory.training[type]
        });
    };

    return (
        <div className="character-card glass-panel">
            <div className="cc-section-label">PROFICIENCIES & LANGUAGES</div>

            {/* Languages Section */}
            <div className="cc-languages-section">
                <div className="cc-subsection-label">Languages</div>
                {isEditMode
                    ? <textarea
                        className="cc-input"
                        value={details.proficienciesLanguages || ''}
                        onChange={e => update('details', 'proficienciesLanguages', e.target.value)}
                        placeholder="Common, Elvish, Draconic..."
                        rows={3}
                      />
                    : <p className="cc-display">{details.proficienciesLanguages || '—'}</p>
                }
            </div>

            {/* Other Proficiencies Section */}
            <div className="cc-proficiencies-section">
                <div className="cc-subsection-label">Other Proficiencies</div>

                {/* Weapon Proficiencies */}
                <div className="cc-proficiency-group">
                    <div className="cc-proficiency-group-label">Weapon Proficiencies</div>
                    {isEditMode ? (
                        <div className="cc-proficiency-checkboxes">
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={combat.weaponProficiencies.simple || false}
                                    onChange={() => toggleWeaponProf('simple')}
                                />
                                <span>Simple Weapons</span>
                            </label>
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={combat.weaponProficiencies.martial || false}
                                    onChange={() => toggleWeaponProf('martial')}
                                />
                                <span>Martial Weapons</span>
                            </label>
                        </div>
                    ) : (
                        <div className="cc-proficiency-display">
                            {[combat.weaponProficiencies.simple && 'Simple', combat.weaponProficiencies.martial && 'Martial']
                                .filter(Boolean)
                                .join(', ') || '—'}
                        </div>
                    )}
                </div>

                {/* Armor Proficiencies */}
                <div className="cc-proficiency-group">
                    <div className="cc-proficiency-group-label">Armor Proficiencies</div>
                    {isEditMode ? (
                        <div className="cc-proficiency-checkboxes">
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={inventory.training.light || false}
                                    onChange={() => toggleArmorProf('light')}
                                />
                                <span>Light Armor</span>
                            </label>
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={inventory.training.medium || false}
                                    onChange={() => toggleArmorProf('medium')}
                                />
                                <span>Medium Armor</span>
                            </label>
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={inventory.training.heavy || false}
                                    onChange={() => toggleArmorProf('heavy')}
                                />
                                <span>Heavy Armor</span>
                            </label>
                            <label className="cc-proficiency-checkbox">
                                <input
                                    type="checkbox"
                                    checked={inventory.training.shields || false}
                                    onChange={() => toggleArmorProf('shields')}
                                />
                                <span>Shields</span>
                            </label>
                        </div>
                    ) : (
                        <div className="cc-proficiency-display">
                            {['light', 'medium', 'heavy', 'shields']
                                .map(t => inventory.training[t] && t.charAt(0).toUpperCase() + t.slice(1))
                                .filter(Boolean)
                                .join(', ') || '—'}
                        </div>
                    )}
                </div>

                {/* Custom Proficiencies */}
                {(customProfs.length > 0 || isEditMode) && (
                    <div className="cc-proficiency-group">
                        <div className="cc-proficiency-group-label">Custom Proficiencies</div>
                        {customProfs.length > 0 && (
                            <ul className="cc-custom-profs-list">
                                {customProfs.map((prof, idx) => (
                                    <li key={idx} className="cc-custom-prof-item">
                                        <span>{prof}</span>
                                        {isEditMode && (
                                            <button
                                                className="cc-remove-prof"
                                                onClick={() => handleRemoveProficiency(idx)}
                                                aria-label="Remove proficiency"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isEditMode && (
                            <div className="cc-add-prof-input">
                                <input
                                    type="text"
                                    value={newProf}
                                    onChange={e => setNewProf(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddProficiency()}
                                    placeholder="Add custom proficiency..."
                                />
                                <button
                                    className="cc-add-prof-btn"
                                    onClick={handleAddProficiency}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';

export const OtherProficiencies = () => {
    const detailsData = useCharacterStore(state => state.character.details);
    const combat = useCharacterStore(state => state.character.combat);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const setWeaponProf = (key, checked) => {
        updateNestedField('combat', 'weaponProficiencies', {
            ...(combat.weaponProficiencies || {}),
            [key]: checked,
        });
    };

    return (
        <div className="glass-panel other-proficiencies-container">
            <h4 className="section-label">Other Proficiencies & Languages</h4>

            <div className="weapon-prof-section">
                <span className="weapon-prof-label">Weapon Proficiencies</span>
                <div className="weapon-prof-checkboxes">
                    {[
                        { key: 'simple',  label: 'Simple Weapons'  },
                        { key: 'martial', label: 'Martial Weapons' },
                    ].map(({ key, label }) => (
                        <label key={key} className="weapon-prof-checkbox">
                            <input
                                type="checkbox"
                                checked={combat.weaponProficiencies?.[key] === true}
                                onChange={e => setWeaponProf(key, e.target.checked)}
                                aria-label={label}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <textarea
                className="other-prof-textarea"
                value={detailsData.additionalFeatures || ''}
                onChange={e => updateNestedField('details', 'additionalFeatures', e.target.value)}
                placeholder="Languages, tool proficiencies, etc."
            />
        </div>
    );
};

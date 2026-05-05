import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

export const CombatStats = () => {
    const vitals = useCharacterStore(s => s.character.vitals);
    const attributes = useCharacterStore(s => s.character.attributes);
    const update = useCharacterStore(s => s.updateNestedField);
    const getModifier = useCharacterStore(s => s.getModifier);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    const initiative = formatModifier(getModifier(attributes.dex));

    return (
        <div className="combat-stats-panel glass-panel">
            <div className="combat-stats-grid">
                {/* AC */}
                <div className="combat-stat-box">
                    {isEditMode ? (
                        <input
                            type="number"
                            className="combat-stat-input tabular"
                            value={vitals.armorClass}
                            onChange={e => update('vitals', 'armorClass', parseInt(e.target.value) || 0)}
                            aria-label="Armor class"
                            min="0"
                        />
                    ) : (
                        <div className="combat-stat-value tabular">{vitals.armorClass}</div>
                    )}
                    <div className="combat-stat-label">AC</div>
                </div>

                {/* Initiative (read-only, auto-calculated) */}
                <div className="combat-stat-box">
                    <div className="combat-stat-value tabular">{initiative}</div>
                    <div className="combat-stat-label">INIT</div>
                </div>

                {/* Speed */}
                <div className="combat-stat-box">
                    {isEditMode ? (
                        <input
                            type="number"
                            className="combat-stat-input tabular"
                            value={vitals.speed}
                            onChange={e => update('vitals', 'speed', parseInt(e.target.value) || 0)}
                            aria-label="Speed in feet"
                            min="0"
                        />
                    ) : (
                        <div className="combat-stat-value tabular">{vitals.speed} ft</div>
                    )}
                    <div className="combat-stat-label">SPEED</div>
                </div>
            </div>
        </div>
    );
};

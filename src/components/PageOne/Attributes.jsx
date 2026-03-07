import { useCharacterStore } from '../../store/useCharacterStore';

const ATTRIBUTE_NAMES = [
    { key: 'str', label: 'Strength' },
    { key: 'dex', label: 'Dexterity' },
    { key: 'con', label: 'Constitution' },
    { key: 'int', label: 'Intelligence' },
    { key: 'wis', label: 'Wisdom' },
    { key: 'cha', label: 'Charisma' }
];

export const Attributes = () => {
    const data = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);

    return (
        <div className="attributes-column">
            {ATTRIBUTE_NAMES.map(({ key, label }) => {
                const score = data[key];
                const mod = getModifier(score);
                const displayMod = mod > 0 ? `+${mod}` : mod;

                return (
                    <div key={key} className="glass-panel attribute-box">
                        <span className="attr-label">{label}</span>
                        <div className="attr-modifier">{displayMod}</div>
                        <div className="attr-score-container">
                            <input
                                type="number"
                                className="attr-score"
                                value={score}
                                onChange={(e) => updateNestedField('attributes', key, parseInt(e.target.value) || 0)}
                                min="1"
                                max="30"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

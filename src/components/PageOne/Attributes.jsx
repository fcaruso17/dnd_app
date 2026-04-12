import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

const ATTRIBUTE_NAMES = [
    { key: 'str', label: 'STR', title: 'Strength' },
    { key: 'dex', label: 'DEX', title: 'Dexterity' },
    { key: 'con', label: 'CON', title: 'Constitution' },
    { key: 'int', label: 'INT', title: 'Intelligence' },
    { key: 'wis', label: 'WIS', title: 'Wisdom' },
    { key: 'cha', label: 'CHA', title: 'Charisma' },
];

export const Attributes = () => {
    const data = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);

    return (
        <div className="attributes-column">
            {ATTRIBUTE_NAMES.map(({ key, label, title }) => (
                <div key={key} className="glass-panel attribute-box">
                    <span className="attr-label" title={title}>{label}</span>
                    <div className="attr-modifier">{formatModifier(getModifier(data[key]))}</div>
                    <div className="attr-score-container">
                        <input
                            type="number"
                            className="attr-score"
                            value={data[key]}
                            onChange={(e) => updateNestedField('attributes', key, parseInt(e.target.value) || 0)}
                            min="1"
                            max="30"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

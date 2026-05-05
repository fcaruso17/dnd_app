import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

const ATTRS = [
    { key: 'str', label: 'STR', title: 'Strength' },
    { key: 'dex', label: 'DEX', title: 'Dexterity' },
    { key: 'con', label: 'CON', title: 'Constitution' },
    { key: 'int', label: 'INT', title: 'Intelligence' },
    { key: 'wis', label: 'WIS', title: 'Wisdom' },
    { key: 'cha', label: 'CHA', title: 'Charisma' },
];

export const Attributes = () => {
    const data = useCharacterStore(s => s.character.attributes);
    const update = useCharacterStore(s => s.updateNestedField);
    const getModifier = useCharacterStore(s => s.getModifier);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    return (
        <div className="attributes-column glass-panel">
            {/* Attributes Grid */}
            {ATTRS.map(({ key, label, title }) => (
                <div key={key} className="attr-box" title={title}>
                    <div className="attr-modifier tabular">
                        {formatModifier(getModifier(data[key]))}
                    </div>
                    <div className="attr-score tabular">
                        {isEditMode
                            ? <input
                                type="number"
                                className="attr-score-input tabular"
                                value={data[key]}
                                onChange={e => update('attributes', key, parseInt(e.target.value) || 0)}
                                min="1" max="30"
                                aria-label={title}
                              />
                            : data[key]
                        }
                    </div>
                    <div className="attr-label">{label}</div>
                </div>
            ))}
        </div>
    );
};

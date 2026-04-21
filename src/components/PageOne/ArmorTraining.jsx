import { useCharacterStore } from '../../store/useCharacterStore';

const TRAINING_TYPES = [
    { key: 'light',   label: 'Light' },
    { key: 'medium',  label: 'Medium' },
    { key: 'heavy',   label: 'Heavy' },
    { key: 'shields', label: 'Shields' },
];

export const ArmorTraining = () => {
    const training = useCharacterStore(state => state.character.inventory.training);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const toggle = (key) => {
        updateNestedField('inventory', 'training', { ...training, [key]: !training[key] });
    };

    return (
        <fieldset className="armor-training">
            <legend>Armor Training</legend>
            <div className="armor-training-row">
                {TRAINING_TYPES.map(({ key, label }) => (
                    <label key={key} className="armor-training-item">
                        <input
                            type="checkbox"
                            checked={training[key] === true}
                            onChange={() => toggle(key)}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';

const TRAIT_FIELDS = [
    { field: 'personality', label: 'Personality Traits' },
    { field: 'ideals', label: 'Ideals' },
    { field: 'bonds', label: 'Bonds' },
    { field: 'flaws', label: 'Flaws' },
];

export const Traits = () => {
    const data = useCharacterStore(state => state.character.traits);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    return (
        <div className="traits-container">
            <div className="glass-panel trait-box features-traits-box">
                <label htmlFor="input-features">Features & Traits</label>
                <textarea
                    id="input-features"
                    value={data.features || ''}
                    onChange={(e) => updateNestedField('traits', 'features', e.target.value)}
                    placeholder="List all class features, racial traits, feats, and special abilities here..."
                />
            </div>

            {TRAIT_FIELDS.map(({ field, label }) => (
                <div key={field} className="glass-panel trait-box">
                    <label htmlFor={`input-${field}`}>{label}</label>
                    <textarea
                        id={`input-${field}`}
                        value={data[field]}
                        onChange={(e) => updateNestedField('traits', field, e.target.value)}
                        rows={3}
                    />
                </div>
            ))}
        </div>
    );
};

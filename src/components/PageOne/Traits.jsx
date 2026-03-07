import { useCharacterStore } from '../../store/useCharacterStore';

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

            <div className="glass-panel trait-box">
                <label htmlFor="input-personality">Personality Traits</label>
                <textarea
                    id="input-personality"
                    value={data.personality}
                    onChange={(e) => updateNestedField('traits', 'personality', e.target.value)}
                    rows={3}
                />
            </div>

            <div className="glass-panel trait-box">
                <label htmlFor="input-ideals">Ideals</label>
                <textarea
                    id="input-ideals"
                    value={data.ideals}
                    onChange={(e) => updateNestedField('traits', 'ideals', e.target.value)}
                    rows={3}
                />
            </div>

            <div className="glass-panel trait-box">
                <label htmlFor="input-bonds">Bonds</label>
                <textarea
                    id="input-bonds"
                    value={data.bonds}
                    onChange={(e) => updateNestedField('traits', 'bonds', e.target.value)}
                    rows={3}
                />
            </div>

            <div className="glass-panel trait-box">
                <label htmlFor="input-flaws">Flaws</label>
                <textarea
                    id="input-flaws"
                    value={data.flaws}
                    onChange={(e) => updateNestedField('traits', 'flaws', e.target.value)}
                    rows={3}
                />
            </div>

        </div>
    );
};

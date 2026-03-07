import { useCharacterStore } from '../../store/useCharacterStore';

export const Lore = () => {
    const data = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    return (
        <div className="lore-container">
            <div className="glass-panel lore-box">
                <label htmlFor="input-backstory">Character Backstory</label>
                <textarea
                    id="input-backstory"
                    value={data.backstory}
                    onChange={(e) => updateNestedField('details', 'backstory', e.target.value)}
                    rows={15}
                    placeholder="Write your epic origin tale here..."
                />
            </div>

            <div className="glass-panel lore-box">
                <label htmlFor="input-allies">Allies & Organizations</label>
                <textarea
                    id="input-allies"
                    value={data.allies}
                    onChange={(e) => updateNestedField('details', 'allies', e.target.value)}
                    rows={8}
                />
            </div>

            <div className="glass-panel lore-box">
                <label htmlFor="input-add-features">Additional Features & Traits</label>
                <textarea
                    id="input-add-features"
                    value={data.additionalFeatures}
                    onChange={(e) => updateNestedField('details', 'additionalFeatures', e.target.value)}
                    rows={8}
                />
            </div>

            <div className="glass-panel lore-box">
                <label htmlFor="input-treasure">Treasure</label>
                <textarea
                    id="input-treasure"
                    value={data.treasure}
                    onChange={(e) => updateNestedField('details', 'treasure', e.target.value)}
                    rows={6}
                />
            </div>
        </div>
    );
};

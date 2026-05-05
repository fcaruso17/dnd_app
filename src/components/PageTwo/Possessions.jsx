import { useCharacterStore } from '../../store/useCharacterStore';

export const Possessions = () => {
    const data = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    return (
        <details>
            <summary>Treasures</summary>
            <div className="possessions-container">
                <textarea
                    id="input-treasure"
                    value={data.treasure}
                    onChange={(e) => updateNestedField('details', 'treasure', e.target.value)}
                    placeholder="Describe your valuable items and possessions..."
                />
            </div>
        </details>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';

export const Allies = () => {
    const data = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    return (
        <details open>
            <summary>Allies & Organizations</summary>
            <div className="lore-container">
                <textarea
                    id="input-allies"
                    value={data.allies}
                    onChange={(e) => updateNestedField('details', 'allies', e.target.value)}
                    placeholder="Who are your allies? What organizations are you part of?"
                />
            </div>
        </details>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';

export const OtherProficiencies = () => {
    const detailsData = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    return (
        <div className="glass-panel other-proficiencies-container">
            <h4 className="section-label">Other Proficiencies & Languages</h4>
            <textarea
                className="other-prof-textarea"
                value={detailsData.additionalFeatures || ''}
                onChange={e => updateNestedField('details', 'additionalFeatures', e.target.value)}
                placeholder="Languages, tool proficiencies, etc."
            />
        </div>
    );
};

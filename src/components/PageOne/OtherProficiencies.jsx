import { useCharacterStore } from '../../store/useCharacterStore';

export const OtherProficiencies = () => {
    const data = useCharacterStore(state => state.character.skillsSaves);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const detailsData = useCharacterStore(state => state.character.details);

    return (
        <div className="glass-panel other-proficiencies-container">
            <h4 className="box-title" style={{ marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Other Proficiencies & Languages</h4>
            <textarea
                value={detailsData.additionalFeatures || ''}
                onChange={e => updateNestedField('details', 'additionalFeatures', e.target.value)}
                placeholder="Languages, tool proficiencies, etc."
                style={{ width: '100%', minHeight: '120px', resize: 'vertical', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem' }}
            />
        </div>
    );
};

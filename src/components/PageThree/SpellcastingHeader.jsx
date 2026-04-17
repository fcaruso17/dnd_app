import { useCharacterStore } from '../../store/useCharacterStore';
import { PREPARED_CASTER_CLASSES, SPELLCASTING_ABILITY } from '../../data/classes';

export const SpellcastingHeader = () => {
    const headerClasses = useCharacterStore(state => state.character.header.classes);
    const attributes = useCharacterStore(state => state.character.attributes);
    const exclusions = useCharacterStore(state => state.character.spellcasting.spellcastingExclusions || []);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const totalLevel = headerClasses.reduce((sum, c) => sum + (parseInt(c.level) || 0), 0);
    const profBonus = Math.ceil(Math.max(totalLevel, 1) / 4) + 1;
    const modifier = (score) => Math.floor(((parseInt(score) || 10) - 10) / 2);

    const spellcastingClasses = PREPARED_CASTER_CLASSES.filter(cls =>
        headerClasses.some(c => c.className === cls)
    );

    const toggleExclusion = (cls) => {
        // Remove classes no longer on the character, then toggle the clicked one
        const cleaned = exclusions.filter(c => spellcastingClasses.includes(c));
        const updated = cleaned.includes(cls)
            ? cleaned.filter(c => c !== cls)
            : [...cleaned, cls];
        updateNestedField('spellcasting', 'spellcastingExclusions', updated);
    };

    if (spellcastingClasses.length === 0) {
        return (
            <div className="glass-panel spell-header-container">
                <h3>Spellcasting</h3>
                <p className="empty-state">No spellcasting classes detected. Set your class on the Core &amp; Combat tab.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel spell-header-container">
            <h3>Spellcasting</h3>
            <div className="spell-classes-list">
                <div className="spell-class-row-header">
                    <span>Class</span>
                    <span style={{ textAlign: 'center' }}>Ability</span>
                    <span style={{ textAlign: 'center' }}>Save DC</span>
                    <span style={{ textAlign: 'center' }}>Atk Bonus</span>
                </div>
                {spellcastingClasses.map(cls => {
                    const abilityKey = SPELLCASTING_ABILITY[cls];
                    const abilityScore = attributes[abilityKey] ?? 10;
                    const mod = modifier(abilityScore);
                    const saveDc = 8 + profBonus + mod;
                    const atkBonus = profBonus + mod;
                    return (
                        <div key={cls} className="spell-class-row spell-class-row--auto">
                            <span>{cls}</span>
                            <span>{abilityKey?.toUpperCase()}</span>
                            <span>{saveDc}</span>
                            <span>{atkBonus >= 0 ? `+${atkBonus}` : atkBonus}</span>
                        </div>
                    );
                })}
            </div>

            <div className="spellcasting-class-selector">
                <span className="selector-label">Filter spells by class:</span>
                <div className="selector-chips">
                    {spellcastingClasses.map(cls => {
                        const isActive = !exclusions.includes(cls);
                        return (
                            <button
                                key={cls}
                                className={`class-chip${isActive ? ' class-chip--active' : ''}`}
                                onClick={() => toggleExclusion(cls)}
                                aria-pressed={isActive}
                                title={isActive ? `Filtering ${cls} spells — click to exclude` : `${cls} excluded — click to include`}
                            >
                                {cls}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

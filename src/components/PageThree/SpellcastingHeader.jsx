import { useCharacterStore } from '../../store/useCharacterStore';
import { PREPARED_CASTER_CLASSES, SPELLCASTING_ABILITY } from '../../data/classes';
import { RESOURCE_CONFIGS } from '../../data/resourceTables';

export const SpellcastingHeader = () => {
    const headerClasses = useCharacterStore(state => state.character.header.classes);
    const attributes    = useCharacterStore(state => state.character.attributes);
    const exclusions    = useCharacterStore(state => state.character.spellcasting.spellcastingExclusions || []);
    const resources     = useCharacterStore(state => state.character.resources);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const totalLevel = headerClasses.reduce((sum, c) => sum + (parseInt(c.level) || 0), 0);
    const profBonus  = Math.ceil(Math.max(totalLevel, 1) / 4) + 1;
    const modifier   = (score) => Math.floor(((parseInt(score) || 10) - 10) / 2);

    const spellcastingClasses = PREPARED_CASTER_CLASSES.filter(cls =>
        headerClasses.some(c => c.className === cls)
    );

    const toggleExclusion = (cls) => {
        const cleaned = exclusions.filter(c => spellcastingClasses.includes(c));
        const updated = cleaned.includes(cls)
            ? cleaned.filter(c => c !== cls)
            : [...cleaned, cls];
        updateNestedField('spellcasting', 'spellcastingExclusions', updated);
    };

    // Determine which class names have at least one active resource
    const resourceClassNames = new Set();
    for (const cfg of RESOURCE_CONFIGS) {
        if (cfg.getTotal(headerClasses, attributes) > 0) {
            for (const hc of headerClasses) {
                if (cfg.getTotal([hc], attributes) > 0) resourceClassNames.add(hc.className);
            }
        }
    }

    const allActiveClassNames = new Set([
        ...spellcastingClasses,
        ...headerClasses.map(c => c.className).filter(n => resourceClassNames.has(n))
    ]);

    // Preserve the order classes appear in the character header
    const orderedClasses = headerClasses
        .map(c => c.className)
        .filter((n, i, arr) => n && allActiveClassNames.has(n) && arr.indexOf(n) === i);

    // Assign each active resource to its first owning class (header order).
    // This prevents Channel Divinity from rendering twice for Cleric/Paladin multiclass.
    const resourceOwner = {};  // { [cfg.key]: className }
    for (const cfg of RESOURCE_CONFIGS) {
        if (cfg.getTotal(headerClasses, attributes) <= 0) continue;
        for (const hc of headerClasses) {
            if (hc.className && cfg.getTotal([hc], attributes) > 0) {
                resourceOwner[cfg.key] = hc.className;
                break;
            }
        }
    }

    if (orderedClasses.length === 0) {
        return (
            <div className="glass-panel spell-header-container">
                <h3>Spellcasting &amp; Class Abilities</h3>
                <p className="empty-state">No spellcasting classes or class abilities detected. Set your class on the Core &amp; Combat tab.</p>
            </div>
        );
    }

    const hasAnySpellcaster = spellcastingClasses.length > 0;

    const renderResources = (cls) => {
        const classResources = RESOURCE_CONFIGS.filter(cfg => resourceOwner[cfg.key] === cls);
        if (classResources.length === 0) return null;
        return (
            <div className="unified-resources">
                {classResources.map(cfg => {
                    const total = cfg.getTotal(headerClasses, attributes);
                    const ann   = cfg.getAnnotation(headerClasses, attributes);
                    const exp   = Math.min(resources[cfg.key] || 0, total);
                    return (
                        <div key={cfg.key} className="unified-resource-group">
                            <span className="unified-resource-label">
                                {cfg.label}{ann ? ` (${ann})` : ''}
                            </span>
                            {cfg.displayType === 'number' ? (
                                <div className="resource-number">
                                    <input
                                        type="number"
                                        min={0} max={total}
                                        value={exp}
                                        onChange={e => updateNestedField('resources', cfg.key,
                                            Math.min(total, Math.max(0, parseInt(e.target.value) || 0))
                                        )}
                                        className="resource-number-input"
                                        aria-label={`${cfg.label} used`}
                                    />
                                    <span className="resource-number-max">/ {total}</span>
                                </div>
                            ) : (
                                <div className="unified-pips">
                                    {Array.from({ length: Math.min(total, 100) }, (_, i) => {
                                        const isSpent = i < exp;
                                        return (
                                            <button
                                                key={i}
                                                className={`resource-diamond${isSpent ? ' resource-diamond--spent' : ''}`}
                                                onClick={() => updateNestedField('resources', cfg.key, isSpent ? i : i + 1)}
                                                aria-label={`${cfg.label} ${i + 1}: ${isSpent ? 'expended' : 'available'}`}
                                                aria-pressed={isSpent}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="glass-panel spell-header-container">
            <h3>Spellcasting &amp; Class Abilities</h3>

            {hasAnySpellcaster && (
                <div className="spell-classes-list">
                    <div className="spell-class-row-header unified-row">
                        <span>Class</span>
                        <span style={{ textAlign: 'center' }}>Ability</span>
                        <span style={{ textAlign: 'center' }}>Save DC</span>
                        <span style={{ textAlign: 'center' }}>Atk Bonus</span>
                        <span>Filter</span>
                        <span>Resources</span>
                    </div>

                    {orderedClasses.map(cls => {
                        const isSpellcaster = spellcastingClasses.includes(cls);
                        const isActive      = !exclusions.includes(cls);
                        const abilityKey    = SPELLCASTING_ABILITY[cls];
                        const abilityScore  = attributes[abilityKey] ?? 10;
                        const mod           = modifier(abilityScore);
                        const saveDc        = 8 + profBonus + mod;
                        const atkBonus      = profBonus + mod;

                        return (
                            <div key={cls} className="spell-class-row unified-row">
                                <span className="unified-class-name">{cls}</span>

                                {isSpellcaster ? (
                                    <>
                                        <span style={{ textAlign: 'center' }}>{abilityKey?.toUpperCase()}</span>
                                        <span style={{ textAlign: 'center' }}>{saveDc}</span>
                                        <span style={{ textAlign: 'center' }}>{atkBonus >= 0 ? `+${atkBonus}` : atkBonus}</span>
                                        <span>
                                            <button
                                                className={`class-chip class-chip--sm${isActive ? ' class-chip--active' : ''}`}
                                                onClick={() => toggleExclusion(cls)}
                                                aria-pressed={isActive}
                                                title={isActive ? `Filtering ${cls} spells — click to exclude` : `${cls} excluded — click to include`}
                                            >
                                                {cls}
                                            </button>
                                        </span>
                                    </>
                                ) : (
                                    <span className="unified-no-spells">No spellcasting</span>
                                )}

                                {renderResources(cls)}
                            </div>
                        );
                    })}
                </div>
            )}

            {!hasAnySpellcaster && (
                <div className="spell-classes-list">
                    {orderedClasses.map(cls => (
                        <div key={cls} className="unified-resource-only-row">
                            <span className="unified-class-name">{cls}</span>
                            {renderResources(cls)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

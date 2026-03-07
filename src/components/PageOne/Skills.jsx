import { useCharacterStore } from '../../store/useCharacterStore';

const SKILL_MAP = {
    'Acrobatics': 'dex',
    'Animal Handling': 'wis',
    'Arcana': 'int',
    'Athletics': 'str',
    'Deception': 'cha',
    'History': 'int',
    'Insight': 'wis',
    'Intimidation': 'cha',
    'Investigation': 'int',
    'Medicine': 'wis',
    'Nature': 'int',
    'Perception': 'wis',
    'Performance': 'cha',
    'Persuasion': 'cha',
    'Religion': 'int',
    'Sleight of Hand': 'dex',
    'Stealth': 'dex',
    'Survival': 'wis'
};

const SKILLS_LIST = Object.keys(SKILL_MAP);
const STATS_LIST = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const Skills = () => {
    const data = useCharacterStore(state => state.character.skillsSaves);
    const attributes = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);
    const getProficiencyBonus = useCharacterStore(state => state.getProficiencyBonus);

    const profBonus = getProficiencyBonus();

    const toggleProficiency = (skill) => {
        let newProfs = [...data.proficiencies];
        if (newProfs.includes(skill)) {
            newProfs = newProfs.filter(s => s !== skill);
        } else {
            newProfs.push(skill);
        }
        updateNestedField('skillsSaves', 'proficiencies', newProfs);
    };

    const toggleExpertise = (skill) => {
        let newExp = [...data.expertise];
        if (newExp.includes(skill)) {
            newExp = newExp.filter(s => s !== skill);
        } else {
            newExp.push(skill);
        }
        updateNestedField('skillsSaves', 'expertise', newExp);
    };

    const toggleSaveProficiency = (stat) => {
        let newSaves = [...(data.saveProficiencies || [])];
        if (newSaves.includes(stat)) {
            newSaves = newSaves.filter(s => s !== stat);
        } else {
            newSaves.push(stat);
        }
        updateNestedField('skillsSaves', 'saveProficiencies', newSaves);
    };

    const getSkillTotal = (skillName, statKey) => {
        let total = getModifier(attributes[statKey]);
        if (data.proficiencies.includes(skillName)) total += profBonus;
        // if (data.expertise.includes(skillName)) total += profBonus; // Removed visible expertise checkbox per previous wave, but logic remains if data exists
        return total;
    };

    const getSaveTotal = (stat) => {
        let total = getModifier(attributes[stat]);
        const saves = data.saveProficiencies || [];
        if (saves.includes(stat)) total += profBonus;
        return total;
    };

    const passivePerception = 10 + getSkillTotal('Perception', 'wis');

    return (
        <div className="glass-panel skills-container" style={{ flex: 1 }}>
            <div className="skills-top-modules" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label className="inspiration-toggle" style={{ flex: 1, margin: 0 }}>
                    <input
                        type="checkbox"
                        checked={data.inspiration}
                        onChange={(e) => updateNestedField('skillsSaves', 'inspiration', e.target.checked)}
                    />
                    <span className="inspiration-label">Inspiration</span>
                </label>

                <div className="prof-bonus-box" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(212, 175, 55, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border-strong)' }}>
                    <div className="prof-val" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', fontWeight: 'bold' }}>+{profBonus}</div>
                    <div className="prof-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 'bold' }}>Prof Bonus</div>
                </div>
            </div>

            <div className="skills-list saves-list" style={{ marginBottom: '1.5rem' }}>
                <h4>Saving Throws</h4>
                <div className="skills-grid">
                    {STATS_LIST.map(stat => {
                        const isProf = (data.saveProficiencies || []).includes(stat);
                        const totalBonus = getSaveTotal(stat);
                        const displayBonus = totalBonus >= 0 ? `+${totalBonus}` : totalBonus;

                        return (
                            <div key={stat} className="skill-row">
                                <input
                                    type="checkbox"
                                    checked={isProf}
                                    onChange={() => toggleSaveProficiency(stat)}
                                    title="Proficient"
                                />
                                <div className="skill-mod">{displayBonus}</div>
                                <span className={`skill-name ${isProf ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>
                                    {stat}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="skills-list">
                <h4>Skills & Proficiencies</h4>
                <div className="skills-grid">
                    {SKILLS_LIST.map(skill => {
                        const isProf = data.proficiencies.includes(skill);
                        const isExp = data.expertise.includes(skill);
                        const statKey = SKILL_MAP[skill];
                        const totalBonus = getSkillTotal(skill, statKey);
                        const displayBonus = totalBonus >= 0 ? `+${totalBonus}` : totalBonus;

                        return (
                            <div key={skill} className="skill-row">
                                <input
                                    type="checkbox"
                                    checked={isProf}
                                    onChange={() => toggleProficiency(skill)}
                                    title="Proficient"
                                />
                                <div className="skill-mod">{displayBonus}</div>
                                <span className={`skill-name ${(isProf || isExp) ? 'active' : ''}`}>
                                    {skill} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>({statKey.toUpperCase()})</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="passive-perception-box" style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                <div className="passive-val">{passivePerception}</div>
                <div className="passive-label">Passive Wisdom (Perception)</div>
            </div>
        </div>
    );
};

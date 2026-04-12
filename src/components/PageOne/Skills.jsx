import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

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

const toggleArrayItem = (array, item) =>
    array.includes(item) ? array.filter(s => s !== item) : [...array, item];

export const Skills = () => {
    const data = useCharacterStore(state => state.character.skillsSaves);
    const attributes = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);
    const getProficiencyBonus = useCharacterStore(state => state.getProficiencyBonus);

    const profBonus = getProficiencyBonus();

    const getSkillTotal = (skillName, statKey) => {
        let total = getModifier(attributes[statKey]);
        if (data.proficiencies.includes(skillName)) total += profBonus;
        return total;
    };

    const getSaveTotal = (stat) => {
        let total = getModifier(attributes[stat]);
        if ((data.saveProficiencies || []).includes(stat)) total += profBonus;
        return total;
    };

    const passivePerception = 10 + getSkillTotal('Perception', 'wis');

    return (
        <div className="glass-panel skills-container">
            <div className="skills-top-modules">
                <label className="inspiration-toggle">
                    <input
                        type="checkbox"
                        checked={data.inspiration}
                        onChange={(e) => updateNestedField('skillsSaves', 'inspiration', e.target.checked)}
                    />
                    <span className="inspiration-label">Inspiration</span>
                </label>

                <div className="prof-bonus-box">
                    <div className="prof-val">+{profBonus}</div>
                    <div className="prof-label">Prof Bonus</div>
                </div>
            </div>

            <div className="skills-list saves-list">
                <h4>Saving Throws</h4>
                <div className="skills-grid">
                    {STATS_LIST.map(stat => {
                        const isProf = (data.saveProficiencies || []).includes(stat);
                        return (
                            <div key={stat} className="skill-row">
                                <input
                                    type="checkbox"
                                    checked={isProf}
                                    onChange={() => updateNestedField('skillsSaves', 'saveProficiencies', toggleArrayItem(data.saveProficiencies || [], stat))}
                                    title="Proficient"
                                />
                                <div className="skill-mod">{formatModifier(getSaveTotal(stat))}</div>
                                <span className={`skill-name skill-name-capitalize ${isProf ? 'active' : ''}`}>
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
                        const statKey = SKILL_MAP[skill];
                        return (
                            <div key={skill} className="skill-row">
                                <input
                                    type="checkbox"
                                    checked={isProf}
                                    onChange={() => updateNestedField('skillsSaves', 'proficiencies', toggleArrayItem(data.proficiencies, skill))}
                                    title="Proficient"
                                />
                                <div className="skill-mod">{formatModifier(getSkillTotal(skill, statKey))}</div>
                                <span className={`skill-name ${isProf ? 'active' : ''}`}>
                                    {skill} <span className="skill-stat-abbr">({statKey.toUpperCase()})</span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="passive-perception-box">
                <div className="passive-val">{passivePerception}</div>
                <div className="passive-label">Passive Wisdom (Perception)</div>
            </div>
        </div>
    );
};

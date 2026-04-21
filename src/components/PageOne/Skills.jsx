import { useEffect, useRef, useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { profBonusForTier } from '../../utils/skills';
import { SkillRow } from './SkillRow';
import { SaveRow } from './SaveRow';

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

    // expandedRow is `skill:Athletics` | `save:str` | null.
    const [expandedRow, setExpandedRow] = useState(null);
    const containerRef = useRef(null);

    // Close on click outside the panel.
    useEffect(() => {
        if (!expandedRow) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setExpandedRow(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [expandedRow]);

    // Close on Escape.
    useEffect(() => {
        if (!expandedRow) return;
        const handler = (e) => {
            if (e.key === 'Escape') setExpandedRow(null);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [expandedRow]);

    const getSkillTotal = (skillName, statKey) => {
        const tier = data.skillProficiencies?.[skillName];
        const bonus = data.skillBonuses?.[skillName] ?? 0;
        return getModifier(attributes[statKey]) + profBonusForTier(tier, profBonus) + bonus;
    };

    const getSaveTotal = (stat) => {
        const isProf = (data.saveProficiencies || []).includes(stat);
        const bonus = data.saveBonuses?.[stat] ?? 0;
        return getModifier(attributes[stat]) + (isProf ? profBonus : 0) + bonus;
    };

    const setSkillTier = (skill, tier) => {
        const next = { ...(data.skillProficiencies || {}) };
        if (tier === undefined) delete next[skill]; else next[skill] = tier;
        updateNestedField('skillsSaves', 'skillProficiencies', next);
    };

    const passivePerception = 10 + getSkillTotal('Perception', 'wis');
    const passiveInsight    = 10 + getSkillTotal('Insight', 'wis');

    return (
        <div className="glass-panel skills-container" ref={containerRef}>
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
                        const rowKey = `save:${stat}`;
                        return (
                            <SaveRow
                                key={stat}
                                stat={stat}
                                isProf={isProf}
                                total={getSaveTotal(stat)}
                                isExpanded={expandedRow === rowKey}
                                onToggleExpand={() => setExpandedRow(expandedRow === rowKey ? null : rowKey)}
                                onToggleProf={() => updateNestedField(
                                    'skillsSaves',
                                    'saveProficiencies',
                                    toggleArrayItem(data.saveProficiencies || [], stat)
                                )}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="skills-list">
                <h4>Skills &amp; Proficiencies</h4>
                <div className="skills-grid">
                    {SKILLS_LIST.map(skill => {
                        const statKey = SKILL_MAP[skill];
                        const tier = data.skillProficiencies?.[skill];
                        const rowKey = `skill:${skill}`;
                        return (
                            <SkillRow
                                key={skill}
                                skill={skill}
                                statKey={statKey}
                                tier={tier}
                                total={getSkillTotal(skill, statKey)}
                                isExpanded={expandedRow === rowKey}
                                onToggleExpand={() => setExpandedRow(expandedRow === rowKey ? null : rowKey)}
                                onTierChange={(newTier) => setSkillTier(skill, newTier)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="passives-container">
                <div className="passive-box">
                    <div className="passive-val">{passivePerception}</div>
                    <div className="passive-label">Passive Wisdom (Perception)</div>
                </div>
                <div className="passive-box">
                    <div className="passive-val">{passiveInsight}</div>
                    <div className="passive-label">Passive Wisdom (Insight)</div>
                </div>
            </div>
        </div>
    );
};

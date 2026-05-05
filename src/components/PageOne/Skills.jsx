import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { profBonusForTier } from '../../utils/skills';
import { TierPips } from './TierPips';

const SKILL_MAP = {
    'Acrobatics': 'dex', 'Animal Handling': 'wis', 'Arcana': 'int',
    'Athletics': 'str', 'Deception': 'cha', 'History': 'int',
    'Insight': 'wis', 'Intimidation': 'cha', 'Investigation': 'int',
    'Medicine': 'wis', 'Nature': 'int', 'Perception': 'wis',
    'Performance': 'cha', 'Persuasion': 'cha', 'Religion': 'int',
    'Sleight of Hand': 'dex', 'Stealth': 'dex', 'Survival': 'wis',
};
const SKILLS_LIST = Object.keys(SKILL_MAP).sort();
const STATS_LIST  = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const STAT_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

const toggleArr = (arr, item) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

const Row = ({ name, modifier, tier, bonus, note, isProficient, isEditMode,
               onTierChange, onBonusChange, onNoteChange }) => {
    const [open, setOpen] = useState(false);
    const isMuted = !isProficient;

    return (
        <div className={`skill-row${open ? ' skill-row--open' : ''}${isMuted ? ' skill-row--muted' : ''}`}>
            <div
                className={`skill-row-main${isEditMode ? ' pressable' : ''}`}
                onClick={() => isEditMode && setOpen(o => !o)}
            >
                <span className="skill-row-name">{name}</span>
                <span className="skill-row-mod tabular">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                {isEditMode && <span className="skill-row-chevron">{open ? '∨' : '›'}</span>}
            </div>
            {open && isEditMode && (
                <div className="skill-row-expand expand-animate">
                    <TierPips tier={tier} onChange={onTierChange} />
                    <label className="skill-row-bonus-label">
                        Misc
                        <input
                            type="number"
                            className="skill-row-bonus-input tabular"
                            value={bonus || ''}
                            onChange={e => onBonusChange(parseInt(e.target.value) || 0)}
                        />
                    </label>
                    <input
                        type="text"
                        className="skill-row-note-input"
                        value={note || ''}
                        onChange={e => onNoteChange(e.target.value)}
                        placeholder="note"
                    />
                </div>
            )}
        </div>
    );
};

export const Skills = () => {
    const data       = useCharacterStore(s => s.character.skillsSaves);
    const attrs      = useCharacterStore(s => s.character.attributes);
    const update     = useCharacterStore(s => s.updateNestedField);
    const getModifier = useCharacterStore(s => s.getModifier);
    const getProficiencyBonus = useCharacterStore(s => s.getProficiencyBonus);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    const profBonus = getProficiencyBonus();

    const skillMod = (name) => {
        const stat = SKILL_MAP[name];
        const tier = data.skillProficiencies[name];
        const pb = profBonusForTier(tier, profBonus);
        return getModifier(attrs[stat]) + pb + (data.skillBonuses[name] || 0);
    };

    const saveMod = (stat) => {
        const proficient = data.saveProficiencies.includes(stat);
        return getModifier(attrs[stat]) + (proficient ? profBonus : 0) + (data.saveBonuses[stat] || 0);
    };

    const passivePerception = 10 + skillMod('Perception');
    const passiveInsight    = 10 + skillMod('Insight');

    return (
        <div className="skills-card glass-panel">
            <div className="skills-stacked">
                <div className="skills-col skills-col--saves">
                    {/* Proficiency Bonus & Inspiration Header */}
                    <div className="saves-header">
                        <label className="save-stat save-stat-inspiration">
                            <input
                                type="checkbox"
                                checked={data.inspiration}
                                onChange={e => update('skillsSaves', 'inspiration', e.target.checked)}
                                aria-label="Inspiration"
                            />
                            <span className="save-stat-label">Inspiration</span>
                        </label>
                        <div className="save-stat">
                            <div className="save-stat-value tabular">
                                {profBonus >= 0 ? '+' : ''}{profBonus}
                            </div>
                            <div className="save-stat-value-label">
                                <span className="save-stat-bonus-label">Prof</span>
                                <span className="save-stat-bonus-label">Bonus</span>
                            </div>
                        </div>
                    </div>

                    <div className="skills-col-header">SAVES</div>

                    {STATS_LIST.map(stat => (
                        <Row
                            key={stat}
                            name={STAT_LABELS[stat]}
                            modifier={saveMod(stat)}
                            tier={data.saveProficiencies.includes(stat) ? 'proficient' : undefined}
                            bonus={data.saveBonuses[stat]}
                            note={data.saveNotes[stat]}
                            isProficient={data.saveProficiencies.includes(stat)}
                            isEditMode={isEditMode}
                            onTierChange={() => update('skillsSaves', 'saveProficiencies', toggleArr(data.saveProficiencies, stat))}
                            onBonusChange={v => update('skillsSaves', 'saveBonuses', { ...data.saveBonuses, [stat]: v })}
                            onNoteChange={v => update('skillsSaves', 'saveNotes', { ...data.saveNotes, [stat]: v })}
                        />
                    ))}
                </div>

                <div className="skills-col skills-col--skills">
                    <div className="skills-col-header">SKILLS</div>
                    {SKILLS_LIST.map(name => (
                        <Row
                            key={name}
                            name={name}
                            modifier={skillMod(name)}
                            tier={data.skillProficiencies[name]}
                            bonus={data.skillBonuses[name]}
                            note={data.skillNotes[name]}
                            isProficient={!!data.skillProficiencies[name]}
                            isEditMode={isEditMode}
                            onTierChange={tier => update('skillsSaves', 'skillProficiencies', { ...data.skillProficiencies, [name]: tier })}
                            onBonusChange={v => update('skillsSaves', 'skillBonuses', { ...data.skillBonuses, [name]: v })}
                            onNoteChange={v => update('skillsSaves', 'skillNotes', { ...data.skillNotes, [name]: v })}
                        />
                    ))}
                </div>
            </div>
            <div className="skills-passives-footer">
                <div className="passive-stat">
                    <span className="passive-stat-value tabular">{passivePerception}</span>
                    <span className="passive-stat-label">Passive Perception</span>
                </div>
                <div className="passive-stat">
                    <span className="passive-stat-value tabular">{passiveInsight}</span>
                    <span className="passive-stat-label">Passive Insight</span>
                </div>
            </div>
        </div>
    );
};

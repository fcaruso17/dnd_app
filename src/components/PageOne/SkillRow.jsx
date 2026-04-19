import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';
import { TierPips } from './TierPips';

const BONUS_MIN = -20;
const BONUS_MAX = 20;

const clampBonus = (n) => Math.max(BONUS_MIN, Math.min(BONUS_MAX, n));

// Only re-renders the inputs row when this skill's data changes.
export const SkillRow = ({ skill, statKey, tier, total, isExpanded, onToggleExpand, onTierChange }) => {
    const bonus = useCharacterStore(state => state.character.skillsSaves.skillBonuses?.[skill] ?? 0);
    const note  = useCharacterStore(state => state.character.skillsSaves.skillNotes?.[skill] ?? '');
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const bonuses = useCharacterStore(state => state.character.skillsSaves.skillBonuses);
    const notes   = useCharacterStore(state => state.character.skillsSaves.skillNotes);

    const hasCustomization = bonus !== 0 || note.trim() !== '';

    const setBonus = (val) => {
        const next = { ...bonuses };
        if (val === 0) delete next[skill]; else next[skill] = val;
        updateNestedField('skillsSaves', 'skillBonuses', next);
    };

    const setNote = (val) => {
        const next = { ...notes };
        if (val === '') delete next[skill]; else next[skill] = val;
        updateNestedField('skillsSaves', 'skillNotes', next);
    };

    const tierActive = !!tier;

    return (
        <div className={`skill-row${isExpanded ? ' skill-row--expanded' : ''}`}>
            <div className="skill-row-main">
                <TierPips
                    tier={tier}
                    onChange={onTierChange}
                    ariaLabel={`${skill} proficiency tier`}
                />
                <button
                    type="button"
                    className="skill-row-toggle"
                    onClick={onToggleExpand}
                    aria-expanded={isExpanded}
                    aria-label={`${skill} details — click to ${isExpanded ? 'collapse' : 'expand'}`}
                >
                    <div className="skill-mod">{formatModifier(total)}</div>
                    <span className={`skill-name${tierActive ? ' active' : ''}`}>
                        {skill} <span className="skill-stat-abbr">({statKey.toUpperCase()})</span>
                    </span>
                    {hasCustomization && <span className="skill-customization-dot" aria-hidden="true" />}
                </button>
            </div>

            {isExpanded && (
                <div className="skill-row-details">
                    <label className="skill-row-details-field">
                        <span>Misc bonus</span>
                        <input
                            type="number"
                            min={BONUS_MIN}
                            max={BONUS_MAX}
                            value={bonus}
                            onChange={(e) => {
                                const raw = parseInt(e.target.value);
                                setBonus(Number.isFinite(raw) ? clampBonus(raw) : 0);
                            }}
                            className={`misc-bonus-input${bonus !== 0 ? ' misc-bonus-input--active' : ''}`}
                            aria-label={`Misc bonus to ${skill}`}
                        />
                    </label>
                    <label className="skill-row-details-field skill-row-details-field--wide">
                        <span>Note</span>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="optional — e.g. Jack of All Trades"
                            className="skill-note-input"
                            aria-label={`Note for ${skill}`}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

const BONUS_MIN = -20;
const BONUS_MAX = 20;
const clampBonus = (n) => Math.max(BONUS_MIN, Math.min(BONUS_MAX, n));

export const SaveRow = ({ stat, isProf, total, isExpanded, onToggleExpand, onToggleProf }) => {
    const bonus = useCharacterStore(state => state.character.skillsSaves.saveBonuses?.[stat] ?? 0);
    const note  = useCharacterStore(state => state.character.skillsSaves.saveNotes?.[stat] ?? '');
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const bonuses = useCharacterStore(state => state.character.skillsSaves.saveBonuses);
    const notes   = useCharacterStore(state => state.character.skillsSaves.saveNotes);

    const hasCustomization = bonus !== 0 || note.trim() !== '';

    const setBonus = (val) => {
        const next = { ...bonuses };
        if (val === 0) delete next[stat]; else next[stat] = val;
        updateNestedField('skillsSaves', 'saveBonuses', next);
    };

    const setNote = (val) => {
        const next = { ...notes };
        if (val === '') delete next[stat]; else next[stat] = val;
        updateNestedField('skillsSaves', 'saveNotes', next);
    };

    return (
        <div className={`skill-row${isExpanded ? ' skill-row--expanded' : ''}`}>
            <div className="skill-row-main">
                <input
                    type="checkbox"
                    checked={isProf}
                    onChange={onToggleProf}
                    title="Proficient"
                    aria-label={`${stat.toUpperCase()} save proficient`}
                />
                <button
                    type="button"
                    className="skill-row-toggle"
                    onClick={onToggleExpand}
                    aria-expanded={isExpanded}
                    aria-label={`${stat.toUpperCase()} save details — click to ${isExpanded ? 'collapse' : 'expand'}`}
                >
                    <div className="skill-mod">{formatModifier(total)}</div>
                    <span className={`skill-name skill-name-capitalize ${isProf ? 'active' : ''}`}>
                        {stat}
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
                            aria-label={`Misc bonus to ${stat.toUpperCase()} save`}
                        />
                    </label>
                    <label className="skill-row-details-field skill-row-details-field--wide">
                        <span>Note</span>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="optional — e.g. Cloak of Protection"
                            className="skill-note-input"
                            aria-label={`Note for ${stat.toUpperCase()} save`}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

// Four-pip segmented control for skill proficiency tier.
// tier: undefined | 'half' | 'proficient' | 'expertise'
// onChange receives the new tier value, or undefined when the active pip is re-clicked.
const OPTIONS = [
    { value: undefined,    glyph: '—',  label: 'None' },
    { value: 'half',        glyph: '½',  label: 'Half proficiency' },
    { value: 'proficient',  glyph: '●',  label: 'Proficient' },
    { value: 'expertise',   glyph: '★',  label: 'Expertise' },
];

export const TierPips = ({ tier, onChange, ariaLabel }) => {
    const handleClick = (e, value) => {
        // Prevent the surrounding row's expand/collapse toggle from firing.
        e.stopPropagation();
        onChange(value === tier ? undefined : value);
    };

    return (
        <div className="tier-pips" role="radiogroup" aria-label={ariaLabel}>
            {OPTIONS.map(opt => {
                const isActive = opt.value === tier || (opt.value === undefined && !tier);
                return (
                    <button
                        key={opt.label}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={opt.label}
                        title={opt.label}
                        className={`tier-pip${isActive ? ' tier-pip--active' : ''}`}
                        onClick={(e) => handleClick(e, opt.value)}
                    >
                        {opt.glyph}
                    </button>
                );
            })}
        </div>
    );
};

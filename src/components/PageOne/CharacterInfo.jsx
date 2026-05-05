import { useCharacterStore } from '../../store/useCharacterStore';

export const CharacterInfo = () => {
    const header = useCharacterStore(s => s.character.header);
    const update = useCharacterStore(s => s.updateNestedField);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    const xpDisplay = `${header.experiencePoints || 0}`;
    const totalLevel = header.classes.reduce((s, c) => s + (c.level || 0), 0);

    return (
        <div className="character-info-panel">
            {/* Left Element: Character Name + Total Level (cohesive visual container) */}
            <div className="character-info-name-and-level">
                {/* Character Name — left side */}
                <div className="character-info-name-section">
                    <div className="character-info-field">
                        <span className="character-info-label">CHARACTER NAME</span>
                        {isEditMode ? (
                            <input
                                type="text"
                                className="character-info-input character-info-name-input"
                                value={header.characterName || ''}
                                onChange={e => update('header', 'characterName', e.target.value)}
                                placeholder="e.g. Ras"
                            />
                        ) : (
                            <span className="character-info-value">{header.characterName || 'Not set'}</span>
                        )}
                    </div>
                </div>

                {/* Total Level Badge — right side */}
                {!isEditMode && header.classes.length > 0 && (
                    <div className="character-info-total-level">
                        <span className="character-info-total-level-number">{totalLevel}</span>
                        <span className="character-info-total-level-label">TOTAL LEVEL</span>
                    </div>
                )}
            </div>

            {/* Right Element: 2×2 Grid: Race, Alignment, Background, XP */}
            <div className="character-info-grid">
                {/* Race */}
                <div className="character-info-field">
                    <span className="character-info-label">RACE</span>
                    {isEditMode ? (
                        <input
                            type="text"
                            className="character-info-input"
                            value={header.race || ''}
                            onChange={e => update('header', 'race', e.target.value)}
                            placeholder="e.g. Half-Orc"
                        />
                    ) : (
                        <span className="character-info-value">{header.race || 'Not set'}</span>
                    )}
                </div>

                {/* Alignment */}
                <div className="character-info-field">
                    <span className="character-info-label">ALIGNMENT</span>
                    {isEditMode ? (
                        <input
                            type="text"
                            className="character-info-input"
                            value={header.alignment || ''}
                            onChange={e => update('header', 'alignment', e.target.value)}
                            placeholder="e.g. Chaotic Good"
                        />
                    ) : (
                        <span className="character-info-value">{header.alignment || 'Not set'}</span>
                    )}
                </div>

                {/* Background */}
                <div className="character-info-field">
                    <span className="character-info-label">BACKGROUND</span>
                    {isEditMode ? (
                        <input
                            type="text"
                            className="character-info-input"
                            value={header.background || ''}
                            onChange={e => update('header', 'background', e.target.value)}
                            placeholder="e.g. Criminal"
                        />
                    ) : (
                        <span className="character-info-value">{header.background || 'Not set'}</span>
                    )}
                </div>

                {/* XP */}
                <div className="character-info-field">
                    <span className="character-info-label">XP</span>
                    {isEditMode ? (
                        <input
                            type="number"
                            className="character-info-input tabular"
                            value={header.experiencePoints || 0}
                            onChange={e => update('header', 'experiencePoints', Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                        />
                    ) : (
                        <span className="character-info-value tabular">{xpDisplay}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

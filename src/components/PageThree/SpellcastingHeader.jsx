import { useCharacterStore } from '../../store/useCharacterStore';

export const SpellcastingHeader = () => {
    const data = useCharacterStore(state => state.character.spellcasting);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const handleClassChange = (index, field, value) => {
        const newClasses = [...data.classes];
        newClasses[index] = { ...newClasses[index], [field]: value };
        updateNestedField('spellcasting', 'classes', newClasses);
    };

    const addClass = () => {
        updateNestedField('spellcasting', 'classes', [
            ...data.classes,
            { id: crypto.randomUUID(), name: '', ability: 'WIS', saveDc: 10, attackBonus: 0 }
        ]);
    };

    const removeClass = (index) => {
        updateNestedField('spellcasting', 'classes', data.classes.filter((_, i) => i !== index));
    };

    return (
        <div className="glass-panel spell-header-container">
            <div className="flex-between">
                <h3>Spellcasting Classes</h3>
                <button className="btn btn-sm btn-primary" onClick={addClass}>+ Add Caster Class</button>
            </div>

            <div className="spell-classes-list">
                {data.classes.length > 0 && (
                    <div className="spell-class-row-header">
                        <span>Class Name</span>
                        <span>Ability</span>
                        <span>Save DC</span>
                        <span>Atk Bonus</span>
                        <span></span>
                    </div>
                )}

                {data.classes.map((cls, idx) => (
                    <div key={cls.id || idx} className="spell-class-row">
                        <input
                            type="text" placeholder="e.g. Cleric"
                            value={cls.name} onChange={(e) => handleClassChange(idx, 'name', e.target.value)}
                        />
                        <select
                            value={cls.ability}
                            onChange={(e) => handleClassChange(idx, 'ability', e.target.value)}
                        >
                            <option value="INT">INT</option>
                            <option value="WIS">WIS</option>
                            <option value="CHA">CHA</option>
                        </select>
                        <input
                            type="number" placeholder="13"
                            value={cls.saveDc} onChange={(e) => handleClassChange(idx, 'saveDc', parseInt(e.target.value) || 0)}
                        />
                        <input
                            type="number" placeholder="+5"
                            value={cls.attackBonus} onChange={(e) => handleClassChange(idx, 'attackBonus', parseInt(e.target.value) || 0)}
                        />
                        <button className="btn-danger-icon" onClick={() => removeClass(idx)} aria-label="Remove caster class">✕</button>
                    </div>
                ))}
                {data.classes.length === 0 && <p className="empty-state">No spellcasting classes added.</p>}
            </div>
        </div>
    );
};

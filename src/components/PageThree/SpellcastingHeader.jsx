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
            { name: '', ability: 'WIS', saveDc: 10, attackBonus: 0 }
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
                        <span style={{ flex: 2 }}>Class Name</span>
                        <span style={{ flex: 1 }}>Ability</span>
                        <span style={{ flex: 1 }}>Save DC</span>
                        <span style={{ flex: 1 }}>Atk Bonus</span>
                        <span style={{ width: '32px' }}></span>
                    </div>
                )}

                {data.classes.map((cls, idx) => (
                    <div key={idx} className="spell-class-row">
                        <input
                            style={{ flex: 2 }} type="text" placeholder="e.g. Cleric"
                            value={cls.name} onChange={(e) => handleClassChange(idx, 'name', e.target.value)}
                        />
                        <select
                            style={{ flex: 1 }}
                            value={cls.ability}
                            onChange={(e) => handleClassChange(idx, 'ability', e.target.value)}
                        >
                            <option value="INT">INT</option>
                            <option value="WIS">WIS</option>
                            <option value="CHA">CHA</option>
                        </select>
                        <input
                            style={{ flex: 1 }} type="number" placeholder="13"
                            value={cls.saveDc} onChange={(e) => handleClassChange(idx, 'saveDc', parseInt(e.target.value) || 0)}
                        />
                        <input
                            style={{ flex: 1 }} type="number" placeholder="+5"
                            value={cls.attackBonus} onChange={(e) => handleClassChange(idx, 'attackBonus', parseInt(e.target.value) || 0)}
                        />
                        <button className="btn-danger-icon" onClick={() => removeClass(idx)}>✕</button>
                    </div>
                ))}
                {data.classes.length === 0 && <p className="empty-state">No spellcasting classes added.</p>}
            </div>
        </div>
    );
};

import { useCharacterStore } from '../../store/useCharacterStore';
import { computeAttack, formatAtkBonus } from '../../utils/weapons';

export const AttacksPanel = () => {
    const inventory  = useCharacterStore(s => s.character.inventory);
    const combat     = useCharacterStore(s => s.character.combat);
    const attributes = useCharacterStore(s => s.character.attributes);
    const update     = useCharacterStore(s => s.updateNestedField);
    const getModifier = useCharacterStore(s => s.getModifier);
    const getProficiencyBonus = useCharacterStore(s => s.getProficiencyBonus);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    const equippedWeapons = inventory.items.filter(i => i.type === 'weapon' && i.equippedSlot);
    const customAttacks = combat.attacks || [];

    const addCustomAttack = () =>
        update('combat', 'attacks', [...customAttacks, {
            id: crypto.randomUUID(), name: '', bonus: '', damage: '1d6', type: 'bludgeoning',
        }]);

    const updateCustomAttack = (id, patch) =>
        update('combat', 'attacks', customAttacks.map(a => a.id === id ? { ...a, ...patch } : a));

    const deleteCustomAttack = (id) =>
        update('combat', 'attacks', customAttacks.filter(a => a.id !== id));

    return (
        <div className="attacks-panel glass-panel">
            <div className="attacks-panel-header">
                <span className="attacks-panel-title">ATTACKS</span>
                <span className="attacks-panel-meta">{equippedWeapons.length} equipped · {customAttacks.length} custom</span>
            </div>
            <table className="attacks-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Ability</th>
                        <th>ATK</th>
                        <th>Damage</th>
                        <th>Type</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {equippedWeapons.map(item => {
                        const attackData = computeAttack(item, { attributes, combat, getModifier, getProficiencyBonus });
                        const ability = item.ability === 'finesse' ? (item.abilityOverride ?? 'str') : item.ability;
                        const abilityDisplay = item.ability === 'finesse' ? 'Finesse (Str)' : (ability ? ability.toUpperCase() : '—');
                        return (
                            <tr key={item.id} className="attacks-row--equipped">
                                <td className="attacks-cell-name">{item.name}</td>
                                <td className="attacks-cell-dmg tabular">{attackData.damageLabel} ({attackData.damageType})</td>
                                <td colSpan={4}>
                                    <span className="attacks-cell-ability">Ability: {abilityDisplay}</span>
                                    <span className="attacks-cell-atk tabular">ATK: {formatAtkBonus(attackData.atkBonus)}</span>
                                    <span className="attacks-cell-badge">
                                        <span className="attacks-slot-badge">
                                            {item.equippedSlot === 'two-handed' ? '2H' : item.equippedSlot.toUpperCase()}
                                        </span>
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {equippedWeapons.length > 0 && customAttacks.length > 0 && (
                        <tr className="attacks-divider"><td colSpan={6} /></tr>
                    )}
                    {customAttacks.map(atk => (
                        <tr key={atk.id} className="attacks-row--custom">
                            {isEditMode ? (
                                <>
                                    <td className="attacks-cell-name">
                                        <input
                                            type="text"
                                            className="attacks-input-name"
                                            value={atk.name}
                                            onChange={e => updateCustomAttack(atk.id, { name: e.target.value })}
                                            placeholder="Attack name"
                                        />
                                    </td>
                                    <td className="attacks-cell-atk tabular">
                                        <input
                                            type="text"
                                            className="attacks-input-bonus tabular"
                                            value={atk.bonus}
                                            onChange={e => updateCustomAttack(atk.id, { bonus: e.target.value })}
                                            placeholder="+0"
                                        />
                                    </td>
                                    <td className="attacks-cell-dmg tabular">
                                        <input
                                            type="text"
                                            className="attacks-input-dmg tabular"
                                            value={atk.damage}
                                            onChange={e => updateCustomAttack(atk.id, { damage: e.target.value })}
                                            placeholder="1d6"
                                        />
                                    </td>
                                    <td className="attacks-cell-type">
                                        <input
                                            type="text"
                                            className="attacks-input-type"
                                            value={atk.type || ''}
                                            onChange={e => updateCustomAttack(atk.id, { type: e.target.value })}
                                            placeholder="type"
                                        />
                                    </td>
                                    <td className="attacks-cell-action">
                                        <button
                                            className="attacks-delete-btn pressable"
                                            onClick={() => deleteCustomAttack(atk.id)}
                                            aria-label="Delete custom attack"
                                        >✕</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="attacks-cell-name">{atk.name}</td>
                                    <td className="attacks-cell-atk tabular">{atk.bonus || '—'}</td>
                                    <td className="attacks-cell-dmg tabular">{atk.damage}</td>
                                    <td className="attacks-cell-type">{atk.type}</td>
                                    <td className="attacks-cell-badge">
                                        <span className="attacks-custom-badge">CUSTOM</span>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isEditMode && (
                <button
                    className="attacks-add-btn pressable"
                    onClick={addCustomAttack}
                >+ Custom Attack</button>
            )}
        </div>
    );
};

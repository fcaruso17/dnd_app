import { useCharacterStore } from '../../store/useCharacterStore';
import { computeAttack, formatAtkBonus, getWeaponStats } from '../../utils/weapons';

export const AttacksPanel = () => {
    const inventory  = useCharacterStore(s => s.character.inventory);
    const combat     = useCharacterStore(s => s.character.combat);
    const attributes = useCharacterStore(s => s.character.attributes);
    const update     = useCharacterStore(s => s.updateNestedField);
    const equipItem  = useCharacterStore(s => s.equipItem);
    const getModifier = useCharacterStore(s => s.getModifier);
    const getProficiencyBonus = useCharacterStore(s => s.getProficiencyBonus);
    const isEditMode = useCharacterStore(s => s.isEditMode);

    const equippedWeapons = inventory.items.filter(i => i.type === 'weapon' && i.equippedSlot);
    const customAttacks = combat.attacks || [];

    const addCustomAttack = () =>
        update('combat', 'attacks', [...customAttacks, {
            id: crypto.randomUUID(), name: '', ability: 'str', bonus: '', damage: '1d6', type: 'bludgeoning', equippedSlot: null, attuned: false,
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
                        const stats = item.damage != null ? item : getWeaponStats(item.name);
                        const weaponAbility = stats?.ability ?? '—';
                        const abilityDisplay = weaponAbility === 'finesse' ? 'Finesse (Str)' : (weaponAbility && weaponAbility !== '—' ? weaponAbility.toUpperCase() : '—');
                        return (
                            <tr key={item.id} className="attacks-row--equipped">
                                <td className="attacks-cell-name">{item.name}</td>
                                <td className="attacks-cell-ability">{abilityDisplay}</td>
                                <td className="attacks-cell-atk tabular">{formatAtkBonus(attackData.atkBonus)}</td>
                                <td className="attacks-cell-dmg tabular">{attackData.damageLabel}</td>
                                <td className="attacks-cell-type">{attackData.damageType}</td>
                                <td className="attacks-cell-badge">
                                    <span className="attacks-slot-badge">
                                        {item.equippedSlot === 'two-handed' ? '2H' : item.equippedSlot.toUpperCase()}
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
                                    <td className="attacks-cell-ability">
                                        <select
                                            aria-label="Attack ability modifier" className="attacks-input-ability"
                                            value={atk.ability || 'str'}
                                            onChange={e => updateCustomAttack(atk.id, { ability: e.target.value })}
                                        >
                                            <option value="str">STR</option>
                                            <option value="dex">DEX</option>
                                            <option value="con">CON</option>
                                            <option value="int">INT</option>
                                            <option value="wis">WIS</option>
                                            <option value="cha">CHA</option>
                                        </select>
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
                                    <td className="attacks-cell-badge">
                                        <div className="attacks-edit-controls">
                                            <div className="attacks-slot-buttons">
                                                {[
                                                    { key: 'main', label: 'Main' },
                                                    { key: 'off', label: 'Off' },
                                                    { key: 'two-handed', label: '2H' },
                                                ].map(({ key, label }) => (
                                                    <button key={key}
                                                        className={`attacks-slot-btn pressable${atk.equippedSlot === key ? ' attacks-slot-btn--active' : ''}`}
                                                        onClick={() => {
                                                            if (atk.equippedSlot === key) {
                                                                updateCustomAttack(atk.id, { equippedSlot: null });
                                                            } else {
                                                                equipItem(atk.id, key, true);
                                                            }
                                                        }}
                                                    >{label}</button>
                                                ))}
                                            </div>
                                            <label className="attacks-attune-toggle">
                                                <input type="checkbox" checked={atk.attuned || false}
                                                    onChange={e => updateCustomAttack(atk.id, { attuned: e.target.checked })}
                                                />
                                                Attune
                                            </label>
                                            <button
                                                className="attacks-delete-btn pressable"
                                                onClick={() => deleteCustomAttack(atk.id)}
                                                aria-label="Delete custom attack"
                                            >✕</button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="attacks-cell-name">{atk.name}</td>
                                    <td className="attacks-cell-ability">{(atk.ability || 'str').toUpperCase()}</td>
                                    <td className="attacks-cell-atk tabular">{atk.bonus || '—'}</td>
                                    <td className="attacks-cell-dmg tabular">{atk.damage}</td>
                                    <td className="attacks-cell-type">{atk.type}</td>
                                    <td className="attacks-cell-badge">
                                        <span className={atk.equippedSlot ? "attacks-slot-badge" : "attacks-custom-badge"}>
                                            {atk.equippedSlot === 'two-handed' ? '2H' : (atk.equippedSlot ? atk.equippedSlot.toUpperCase() : 'CUSTOM')}
                                        </span>
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

import { useMemo } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { getWeaponStats, formatAtkBonus } from '../../utils/weapons';

const SLOT_ORDER  = { main: 0, off: 1, 'two-handed': 2 };
const SLOT_LABELS = { main: 'Main Hand', off: 'Off Hand', 'two-handed': '2H' };

export const Attacks = () => {
    const inventory  = useCharacterStore(state => state.character.inventory);
    const attributes = useCharacterStore(state => state.character.attributes);
    const combat     = useCharacterStore(state => state.character.combat);
    const updateNestedField   = useCharacterStore(state => state.updateNestedField);
    const getModifier         = useCharacterStore(state => state.getModifier);
    const getProficiencyBonus = useCharacterStore(state => state.getProficiencyBonus);

    const equippedWeapons = useMemo(() =>
        (inventory.items || [])
            .filter(i => i.type === 'weapon' && i.equippedSlot != null)
            .sort((a, b) => (SLOT_ORDER[a.equippedSlot] ?? 99) - (SLOT_ORDER[b.equippedSlot] ?? 99)),
        [inventory.items]
    );

    const computeAttack = (item) => {
        const stats = getWeaponStats(item.name);
        if (!stats || stats.damage == null) return { atkBonus: null, damageLabel: '—', stats };

        const effectiveAbility = stats.ability === 'finesse'
            ? (item.abilityOverride ?? 'str')
            : stats.ability;

        const isProficient = stats.category === 'simple'
            ? (combat.weaponProficiencies?.simple ?? false)
            : (combat.weaponProficiencies?.martial ?? false);

        const atkBonus = getModifier(attributes[effectiveAbility])
            + (isProficient ? getProficiencyBonus() : 0)
            + (item.magicBonus || 0);

        const isVersatile2H = item.equippedSlot === 'two-handed' && stats.damageVersatile != null;
        const baseDmg = isVersatile2H ? stats.damageVersatile : stats.damage;
        const damageLabel = stats.damageVersatile && item.equippedSlot !== 'two-handed'
            ? `${stats.damage} (${stats.damageVersatile})`
            : baseDmg;

        return { atkBonus, damageLabel, stats };
    };

    const handleAddCustomAttack = () => {
        updateNestedField('combat', 'attacks', [
            ...combat.attacks,
            { id: crypto.randomUUID(), name: '', bonus: '', damage: '', type: '' },
        ]);
    };

    const updateAttack = (index, field, value) => {
        const next = [...combat.attacks];
        next[index] = { ...next[index], [field]: value };
        updateNestedField('combat', 'attacks', next);
    };

    const removeAttack = (index) => {
        updateNestedField('combat', 'attacks', combat.attacks.filter((_, i) => i !== index));
    };

    return (
        <div className="glass-panel attacks-container">
            <div className="box-title">
                <h3>Attacks</h3>
            </div>

            {/* Zone 1: Weapon Cards */}
            <div className="attacks-zone">
                <span className="attacks-zone-title">Equipped Weapons</span>

                {equippedWeapons.length === 0 && (
                    <p className="empty-state">
                        No weapons equipped. Equip a weapon from the Inventory below.
                    </p>
                )}

                <div className="weapon-cards">
                    {equippedWeapons.map(item => {
                        const { atkBonus, damageLabel, stats } = computeAttack(item);

                        return (
                            <div key={item.id} className="weapon-card">
                                {/* Card header: name + slot badge */}
                                <div className="weapon-card-header">
                                    <span className="weapon-card-name">{item.name}</span>
                                    <span className="weapon-slot-badge">
                                        {SLOT_LABELS[item.equippedSlot]}
                                    </span>
                                </div>

                                {/* Stat block row */}
                                <div className="weapon-card-stats">
                                    <div className="weapon-card-stat weapon-card-stat--bonus">
                                        <span className="weapon-card-stat-label">Atk Bonus</span>
                                        <span className="weapon-card-stat-value">
                                            {stats ? formatAtkBonus(atkBonus) : '—'}
                                        </span>
                                    </div>
                                    <div className="weapon-card-stat">
                                        <span className="weapon-card-stat-label">Damage</span>
                                        <span className="weapon-card-stat-value">{damageLabel}</span>
                                        {stats?.damageType && (
                                            <span className="weapon-card-stat-sub">{stats.damageType}</span>
                                        )}
                                    </div>
                                    <div className="weapon-card-stat">
                                        <span className="weapon-card-stat-label">Range</span>
                                        <span className="weapon-card-stat-value">
                                            {stats?.range ?? '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer: properties + mastery */}
                                {stats && (stats.properties?.length > 0 || stats.mastery) && (
                                    <div className="weapon-card-footer">
                                        <span className="weapon-property-chips">
                                            {(stats.properties || []).map(p => (
                                                <span key={p} className="weapon-property-chip">{p}</span>
                                            ))}
                                        </span>
                                        {stats.mastery && (
                                            <span className="weapon-mastery-tag">⊕ {stats.mastery}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Zone 2: Custom Attacks */}
            <div className="attacks-zone attacks-zone--custom">
                <span className="attacks-zone-title">Custom Attacks</span>

                {combat.attacks.length === 0 && (
                    <p className="empty-state">
                        Add Unarmed Strike, natural weapons, or other non-inventory attacks here.
                    </p>
                )}

                <div className="weapon-cards">
                    {combat.attacks.map((atk, idx) => (
                        <div key={atk.id || idx} className="weapon-card weapon-card--custom">
                            <div className="weapon-card-header">
                                <input
                                    type="text"
                                    className="weapon-card-name-input"
                                    placeholder="Unarmed Strike"
                                    value={atk.name}
                                    onChange={e => updateAttack(idx, 'name', e.target.value)}
                                    aria-label="Attack name"
                                />
                                <button
                                    className="weapon-card-delete"
                                    onClick={() => removeAttack(idx)}
                                    aria-label="Remove attack"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="weapon-card-stats">
                                <div className="weapon-card-stat weapon-card-stat--bonus">
                                    <span className="weapon-card-stat-label">Atk Bonus</span>
                                    <input
                                        type="text"
                                        className="weapon-card-stat-input weapon-card-stat-input--bonus"
                                        placeholder="+5"
                                        value={atk.bonus}
                                        onChange={e => updateAttack(idx, 'bonus', e.target.value)}
                                        aria-label="Attack bonus"
                                    />
                                </div>
                                <div className="weapon-card-stat">
                                    <span className="weapon-card-stat-label">Damage</span>
                                    <input
                                        type="text"
                                        className="weapon-card-stat-input"
                                        placeholder="1d6"
                                        value={atk.damage}
                                        onChange={e => updateAttack(idx, 'damage', e.target.value)}
                                        aria-label="Damage dice"
                                    />
                                </div>
                                <div className="weapon-card-stat">
                                    <span className="weapon-card-stat-label">Type</span>
                                    <input
                                        type="text"
                                        className="weapon-card-stat-input"
                                        placeholder="Piercing"
                                        value={atk.type}
                                        onChange={e => updateAttack(idx, 'type', e.target.value)}
                                        aria-label="Damage type"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn btn-primary" onClick={handleAddCustomAttack}>
                    + Add Custom Attack
                </button>
            </div>
        </div>
    );
};

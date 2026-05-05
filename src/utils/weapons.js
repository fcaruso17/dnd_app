import itemsDatabase from '../data/items.json';

export const getWeaponStats = (name) =>
    itemsDatabase.find(i => i.name === name && i.type === 'weapon') ?? null;

export const formatAtkBonus = (n) => {
    if (typeof n !== 'number') return '—';
    return n >= 0 ? `+${n}` : `${n}`;
};

export const computeAttack = (item, { attributes, combat, getModifier, getProficiencyBonus }) => {
    // Use stored item properties; fall back to database lookup for legacy data
    const stats = item.damage != null ? item : getWeaponStats(item.name);
    if (!stats || stats.damage == null) return { atkBonus: null, damageLabel: '—', damageType: '—' };
    const ability = stats.ability === 'finesse' ? (item.abilityOverride ?? 'str') : stats.ability;
    const isProficient = stats.category === 'simple'
        ? (combat.weaponProficiencies?.simple ?? false)
        : (combat.weaponProficiencies?.martial ?? false);
    const atkMod = getModifier(attributes[ability]) + (isProficient ? getProficiencyBonus() : 0) + (item.magicBonus || 0);
    const die = item.equippedSlot === 'two-handed' && stats.damageVersatile ? stats.damageVersatile : stats.damage;
    const dmgMod = getModifier(attributes[ability]) + (item.magicBonus || 0);
    return {
        atkBonus: atkMod,
        damageLabel: `${die}${dmgMod >= 0 ? '+' : ''}${dmgMod}`,
        damageType: stats.damageType,
    };
};

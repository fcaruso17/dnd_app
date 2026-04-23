import itemsDatabase from '../data/items.json';

export const getWeaponStats = (name) =>
    itemsDatabase.find(i => i.name === name && i.type === 'weapon') ?? null;

export const formatAtkBonus = (n) => {
    if (typeof n !== 'number') return '—';
    return n >= 0 ? `+${n}` : `${n}`;
};

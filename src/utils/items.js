// Rarity tier ordering (ascending). Used for sorting and for per-tier CSS variables.
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];

// Human-readable labels for rarity chips.
export const RARITY_LABELS = {
    common:      'Common',
    uncommon:    'Uncommon',
    rare:        'Rare',
    'very rare': 'Very Rare',
    legendary:   'Legendary',
    artifact:    'Artifact',
};

// Map a rarity string to the CSS variable suffix (no space). 'very rare' → 'veryrare'.
export const rarityVarKey = (rarity) => (rarity === 'very rare' ? 'veryrare' : rarity);

// An item is "magic" iff it has a rarity tier. Derived, never stored.
export const isMagicItem = (item) => item?.rarity != null;

// Count of currently-attuned items in the inventory.
export const countAttuned = (items) =>
    (items || []).filter(i => i && i.attuned === true).length;

// An item is "customized" (shows the gold dot) if the user has edited it beyond defaults.
export const hasCustomization = (item) => {
    if (!item) return false;
    const note = (item.notes || '').trim();
    const qty  = Number(item.quantity) || 0;
    return note !== '' || qty > 1 || item.attuned === true;
};

// Clamp quantity to a positive integer. Used at data boundaries (migration + import).
export const clampQuantity = (q) => {
    const n = Math.floor(Number(q));
    return Number.isFinite(n) && n >= 1 ? n : 1;
};

// Build a fresh inventory row from either a database match or a raw name.
// `dbEntry` is an items.json record or null.
const newRow = (name, dbEntry) => {
    if (dbEntry) {
        return {
            id: crypto.randomUUID(),
            name: dbEntry.name,
            quantity: 1,
            type: dbEntry.type,
            rarity: dbEntry.rarity ?? null,
            attuned: false,
            description: dbEntry.description || '',
            notes: '',
            custom: false,
            equippedSlot: null,
            magicBonus: 0,
            abilityOverride: null,
        };
    }
    return {
        id: crypto.randomUUID(),
        name,
        quantity: 1,
        type: 'gear',
        rarity: null,
        attuned: false,
        description: '',
        notes: '',
        custom: true,
        equippedSlot: null,
        magicBonus: 0,
        abilityOverride: null,
    };
};

// Case-insensitive exact-name lookup against the provided database array.
const findInDatabase = (name, database) => {
    const needle = (name || '').toLowerCase().trim();
    if (!needle) return null;
    return (database || []).find(d => d.name.toLowerCase() === needle) || null;
};

// Parse the legacy `inventory.equipment` textarea blob into a fully-shaped items[] array.
// Pure — no React, no store access. `database` is the items.json array.
export const migrateLegacyEquipment = (blob, database) => {
    if (typeof blob !== 'string' || blob.trim() === '') return [];
    const lines = blob.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => newRow(line, findInDatabase(line, database)));
};

// Defensively normalize a saved items[] array. Used by mergeWithDefaults on load/import.
// Drops entries without a name. Fills missing fields with defaults. Clamps quantity.
export const normalizeItems = (savedItems) => {
    if (!Array.isArray(savedItems)) return [];
    return savedItems
        .filter(i => i && typeof i.name === 'string' && i.name.trim() !== '')
        .map(i => ({
            id: typeof i.id === 'string' ? i.id : crypto.randomUUID(),
            name: i.name.trim(),
            quantity: clampQuantity(i.quantity),
            type: ['weapon', 'armor', 'gear', 'tool'].includes(i.type) ? i.type : 'gear',
            rarity: RARITY_ORDER.includes(i.rarity) ? i.rarity : null,
            attuned: i.attuned === true,
            description: typeof i.description === 'string' ? i.description : '',
            notes: typeof i.notes === 'string' ? i.notes : '',
            custom: i.custom === true,
            equippedSlot: ['main', 'off', 'two-handed'].includes(i.equippedSlot) ? i.equippedSlot : null,
            magicBonus: Number.isInteger(i.magicBonus) && i.magicBonus >= 0 && i.magicBonus <= 3
                ? i.magicBonus : 0,
            abilityOverride: ['str', 'dex'].includes(i.abilityOverride) ? i.abilityOverride : null,
        }));
};

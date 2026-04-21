import items from '../data/items.json';
import { isMagicItem } from '../utils/items';

export const ALL_ITEMS = items;

/**
 * Search the local items database. Substring (case-insensitive) match against name,
 * optionally filtered by type and/or magic-only. Capped at 20 results.
 *
 * @param {string} query
 * @param {{ type?: 'weapon'|'armor'|'gear'|'tool'|null, magicOnly?: boolean }} [opts]
 * @returns {Array}
 */
export const searchItems = (query, { type = null, magicOnly = false } = {}) => {
    const q = (query || '').toLowerCase().trim();
    return ALL_ITEMS.filter(i => {
        if (type && i.type !== type) return false;
        if (magicOnly && !isMagicItem(i)) return false;
        if (q && !i.name.toLowerCase().includes(q)) return false;
        return true;
    }).slice(0, 20);
};

/**
 * Exact-name case-insensitive lookup. Used by migration + any future "hydrate by name" flow.
 * @param {string} name
 * @returns {object|undefined}
 */
export const findItemByName = (name) =>
    ALL_ITEMS.find(i => i.name.toLowerCase() === (name || '').toLowerCase().trim());

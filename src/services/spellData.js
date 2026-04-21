import spells from '../data/spells.json';

/**
 * Search the local spell database.
 *
 * @param {string} query        - Substring to match against spell name (case-insensitive)
 * @param {string[]} classes    - Filter to spells available to any of these classes.
 *                                Empty array = no class filter (show all).
 * @param {number|null} level   - Filter to this spell level. null = all levels.
 * @returns {Array}             Matching spell objects, capped at 30 results.
 */
export const searchSpells = (query, classes = [], level = null) => {
  const q = query.toLowerCase().trim();
  return spells
    .filter(spell => {
      const matchesQuery = !q || spell.name.toLowerCase().includes(q);
      const matchesClass = !classes.length || classes.some(cls => spell.classes.includes(cls));
      const matchesLevel = level === null || spell.level === level;
      return matchesQuery && matchesClass && matchesLevel;
    })
    .slice(0, 30);
};

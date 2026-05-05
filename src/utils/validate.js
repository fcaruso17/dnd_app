/**
 * Validation utilities for defensive programming at data boundaries
 */

/**
 * Parse and validate an integer within a range
 * @param {*} value - Value to parse
 * @param {number} min - Minimum valid value (inclusive)
 * @param {number} max - Maximum valid value (inclusive)
 * @param {number} fallback - Default value if validation fails
 * @returns {number} - Valid integer within range, or fallback
 */
export const parseAndValidate = (value, min, max, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max
        ? parsed
        : fallback;
};

/**
 * Validate a die format (e.g., 'd6', 'd20')
 * @param {string} die - Die string to validate
 * @returns {number} - Parsed die sides, or 8 (default)
 */
export const parseDie = (die) => {
    if (!die || typeof die !== 'string') return 8;
    const sides = parseInt(die.replace('d', ''), 10);
    return Number.isFinite(sides) && sides > 0 ? sides : 8;
};

/**
 * Validate and parse localStorage value
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or is invalid
 * @param {Function} validator - Optional validation function (receives parsed value)
 * @returns {*} - Validated value or defaultValue
 */
export const getStorageValue = (key, defaultValue, validator) => {
    try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;

        let parsed = value;
        // Try to parse as JSON if it looks like JSON
        if (value.startsWith('{') || value.startsWith('[')) {
            parsed = JSON.parse(value);
        }

        // Apply custom validator if provided
        if (validator && !validator(parsed)) {
            return defaultValue;
        }

        return parsed;
    } catch (error) {
        console.warn(`Failed to get storage value for key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Safely set localStorage value
 * @param {string} key - localStorage key
 * @param {*} value - Value to store
 * @returns {boolean} - True if successful, false otherwise
 */
export const setStorageValue = (key, value) => {
    try {
        const toStore = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, toStore);
        return true;
    } catch (error) {
        console.warn(`Failed to set storage value for key "${key}":`, error);
        return false;
    }
};

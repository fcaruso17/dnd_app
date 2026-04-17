// src/services/dndApi.js

const BASE_URL = 'https://www.dnd5eapi.co/api';

const fetchData = async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
};

/**
 * Get full list of equipment
 */
export const fetchEquipment = async () => fetchData('/equipment');

/**
 * Get details for a specific piece of equipment 
 * Helpful to extract damage dice or armor class
 */
export const fetchEquipmentDetails = async (index) => fetchData(`/equipment/${index}`);

/**
 * Search helper for fetching lists based on user input
 * Does client side filtering to avoid excessive API calls
 */
export const searchList = (listData, query, filters = {}) => {
    if (!listData || !listData.results) return [];

    let results = listData.results;

    if (filters.level !== undefined) {
        results = results.filter(item => item.level === filters.level);
    }

    if (!query) return results.slice(0, 10); // Return first 10 if no query

    const lowerQuery = query.toLowerCase();
    return results.filter(item =>
        item.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
};

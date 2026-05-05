import { useState, useEffect } from 'react';

export const THEMES = [
    { id: 'shadow-realm',   label: 'Shadow Realm',  swatch: '#d4af37' },
    { id: 'arcane-scholar', label: 'Arcane Scholar', swatch: '#c0cfe8' },
    { id: 'eldritch-void',  label: 'Eldritch Void',  swatch: '#00c896' },
];

const STORAGE_KEY = 'dnd-theme';
const VALID_THEME_IDS = new Set(THEMES.map(t => t.id));

export const useTheme = () => {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY) || 'shadow-realm';
        return VALID_THEME_IDS.has(saved) ? saved : 'shadow-realm';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return { theme, setTheme: setThemeState, themes: THEMES };
};

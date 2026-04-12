import { useState, useEffect } from 'react';

export const THEMES = [
    { id: 'shadow-realm',    label: 'Shadow Realm',   swatch: '#d4af37' },
    { id: 'parchment',       label: 'Parchment & Ink', swatch: '#7a5c1e' },
    { id: 'arcane-scholar',  label: 'Arcane Scholar',  swatch: '#c0cfe8' },
    { id: 'infernal-pact',   label: 'Infernal Pact',   swatch: '#e8610a' },
    { id: 'celestial-dawn',  label: 'Celestial Dawn',  swatch: '#b8960c' },
    { id: 'eldritch-void',  label: 'Eldritch Void',   swatch: '#00c896' },
    { id: 'druids-grove',   label: "Druid's Grove",   swatch: '#8fba4e' },
    { id: 'frost-citadel',  label: 'Frost Citadel',   swatch: '#a8d4e8' },
];

const STORAGE_KEY = 'dnd-theme';

export const useTheme = () => {
    const [theme, setThemeState] = useState(
        () => localStorage.getItem(STORAGE_KEY) || 'shadow-realm'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return { theme, setTheme: setThemeState, themes: THEMES };
};

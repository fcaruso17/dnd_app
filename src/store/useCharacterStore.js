import { create } from 'zustand';
import spellcastingTables from '../data/spellcastingTables.json';

// Default empty character structure based on 5E mechanics
const defaultCharacterState = {
    header: {
        characterName: '',
        playerName: '',
        background: '',
        race: '',
        alignment: '',
        experiencePoints: 0,
        classes: [{ id: crypto.randomUUID(), className: '', level: 1, subclass: '' }] // Array for multiclassing
    },
    attributes: {
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    },
    vitals: {
        armorClass: 10,
        speed: 30,
        hpMax: 10,
        hpCurrent: 10,
        hpTemp: 0,
        hitDice: [{ id: crypto.randomUUID(), class: '', die: 'd8', total: 1, expended: 0 }],
        deathSaves: { successes: 0, failures: 0 }
    },
    skillsSaves: {
        inspiration: false,
        proficiencies: [],
        expertise: [],
        saveProficiencies: [],
    },
    combat: {
        attacks: [] // { name, bonus, damage, type }
    },
    inventory: {
        cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
        equipment: ''
    },
    traits: {
        personality: '',
        ideals: '',
        bonds: '',
        flaws: '',
        features: ''
    },
    details: {
        age: '', height: '', weight: '', eyes: '', skin: '', hair: '',
        allies: '',
        backstory: '',
        additionalFeatures: '',
        treasure: '',
        portraitBase64: null
    },
    spellcasting: {
        classes: [],
        spellcastingClasses: [],      // legacy — no longer used
        spellcastingExclusions: [],   // classes the user has manually deselected from spell filter
        slots: {
            1: { total: 0, expended: 0 },
            2: { total: 0, expended: 0 },
            3: { total: 0, expended: 0 },
            4: { total: 0, expended: 0 },
            5: { total: 0, expended: 0 },
            6: { total: 0, expended: 0 },
            7: { total: 0, expended: 0 },
            8: { total: 0, expended: 0 },
            9: { total: 0, expended: 0 }
        },
        spells: {
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
        }
    }
};

// Shallow-merge each top-level section with its defaults so that new fields
// added to defaultCharacterState don't crash against old localStorage saves.
const mergeWithDefaults = (saved) => {
    const merged = { ...defaultCharacterState };
    for (const key of Object.keys(defaultCharacterState)) {
        const savedVal = saved[key];
        const defaultVal = defaultCharacterState[key];
        if (savedVal !== undefined && savedVal !== null && typeof savedVal === 'object' && !Array.isArray(savedVal)) {
            merged[key] = { ...defaultVal, ...savedVal };
        } else if (savedVal !== undefined) {
            merged[key] = savedVal;
        }
    }
    return merged;
};

const getInitialState = () => {
    const saved = localStorage.getItem('dnd-character');
    if (saved) {
        try {
            return mergeWithDefaults(JSON.parse(saved));
        } catch {
            console.error("Failed to parse local storage data.");
            return defaultCharacterState;
        }
    }
    return defaultCharacterState;
};

export const useCharacterStore = create((set, get) => ({
    character: getInitialState(),
    lastSaved: Date.now(),

    updateNestedField: (section, field, value) => set((state) => ({
        character: {
            ...state.character,
            [section]: {
                ...state.character[section],
                [field]: value
            }
        },
        lastSaved: Date.now()
    })),

    resetCharacter: () => {
        if (window.confirm("Are you sure you want to reset all character data?")) {
            set({ character: defaultCharacterState, lastSaved: Date.now() });
        }
    },

    importCharacter: (jsonData) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (typeof parsed !== 'object' || parsed === null) throw new Error('Not an object');
            set({ character: mergeWithDefaults(parsed), lastSaved: Date.now() });
            alert("Character imported successfully!");
        } catch {
            alert("Invalid JSON file format.");
        }
    },

    exportCharacter: () => {
        const { character } = get();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${character.header.characterName || 'character'}_sheet.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    // Helper for total level calculation based on SRD multiclassing
    getTotalLevel: () => {
        return get().character.header.classes.reduce((sum, cls) => sum + (parseInt(cls.level) || 0), 0);
    },

    // Helper for proficiency bonus
    getProficiencyBonus: () => {
        const level = get().getTotalLevel() || 1;
        return Math.ceil(level / 4) + 1;
    },

    // Helper for ability modifiers
    getModifier: (score) => {
        return Math.floor(((parseInt(score) || 10) - 10) / 2);
    },

    // Returns the max number of prepared spells for a given class based on
    // that class's current level in the character's class list.
    // Returns 0 for non-prepared-caster classes (Barbarian, Fighter, Monk, Rogue).
    getPreparedMax: (className) => {
        const { character } = get();
        const classEntry = character.header.classes.find(c => c.className === className);
        if (!classEntry) return 0;
        const level = Math.max(1, Math.min(20, parseInt(classEntry.level) || 1));
        const table = spellcastingTables[className];
        if (!table) return 0;
        return table[level - 1] || 0;
    }
}));

// Setup automatic local storage persistence listener
useCharacterStore.subscribe(
    (state, prevState) => {
        if (state.character !== prevState.character) {
            try {
                localStorage.setItem('dnd-character', JSON.stringify(state.character));
            } catch (err) {
                console.error("Failed to save character to localStorage:", err);
            }
        }
    }
);

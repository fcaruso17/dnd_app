import { create } from 'zustand';
import { z } from 'zod';

// Default empty character structure based on 5E mechanics
const defaultCharacterState = {
    header: {
        characterName: '',
        playerName: '',
        background: '',
        race: '',
        alignment: '',
        experiencePoints: 0,
        classes: [{ className: '', level: 1 }] // Array for multiclassing
    },
    attributes: {
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    },
    vitals: {
        armorClass: 10,
        initiativeBonus: 0,
        speed: 30,
        hpMax: 10,
        hpCurrent: 10,
        hpTemp: 0,
        hitDice: [{ class: '', die: 'd8', total: 1, expended: 0 }],
        deathSaves: { successes: 0, failures: 0 }
    },
    skillsSaves: {
        inspiration: false,
        proficiencies: [],
        expertise: [],
        savingThrowProficiencies: [],
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

const characterSchema = z.object({
    header: z.object({ classes: z.array(z.any()).optional() }).passthrough().optional(),
    attributes: z.object({ str: z.any().optional() }).passthrough().optional(),
    vitals: z.object({ hpMax: z.any().optional() }).passthrough().optional(),
    skillsSaves: z.object({ proficiencies: z.array(z.string()).optional() }).passthrough().optional(),
    combat: z.object({ attacks: z.array(z.any()).optional() }).passthrough().optional(),
    inventory: z.object({ gp: z.any().optional() }).passthrough().optional(),
    traits: z.object({ personality: z.string().optional() }).passthrough().optional(),
    details: z.object({ age: z.string().optional() }).passthrough().optional(),
    spellcasting: z.object({ classes: z.array(z.any()).optional() }).passthrough().optional()
}).passthrough();

const getInitialState = () => {
    const saved = localStorage.getItem('dnd-character');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (err) {
            console.error("Failed to parse local storage data.");
            return defaultCharacterState;
        }
    }
    return defaultCharacterState;
};

export const useCharacterStore = create((set, get) => ({
    character: getInitialState(),
    lastSaved: Date.now(),

    updateSection: (section, payload) => set((state) => {
        const newCharacter = {
            ...state.character,
            [section]: {
                ...state.character[section],
                ...payload
            }
        };
        return { character: newCharacter, lastSaved: Date.now() };
    }),

    updateNestedField: (section, field, value) => set((state) => {
        const newCharacter = {
            ...state.character,
            [section]: {
                ...state.character[section],
                [field]: value
            }
        };
        return { character: newCharacter, lastSaved: Date.now() };
    }),

    resetCharacter: () => {
        if (window.confirm("Are you sure you want to reset all character data?")) {
            set({ character: defaultCharacterState, lastSaved: Date.now() });
        }
    },

    importCharacter: (jsonData) => {
        try {
            const parsed = JSON.parse(jsonData);
            // Validate schema structurally so we don't crash when passing random JSON
            const validatedData = characterSchema.parse(parsed);

            set({ character: { ...defaultCharacterState, ...validatedData }, lastSaved: Date.now() });
            alert("Character imported successfully!");
        } catch (e) {
            if (e instanceof z.ZodError) {
                console.error("Zod Validation Failed:", e.errors);
                alert("Imported JSON has invalid structure for this D&D character sheet.");
            } else {
                alert("Invalid JSON file format.");
            }
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
    }
}));

// Setup automatic local storage persistence listener
useCharacterStore.subscribe(
    (state, prevState) => {
        if (state.character !== prevState.character) {
            localStorage.setItem('dnd-character', JSON.stringify(state.character));
        }
    }
);

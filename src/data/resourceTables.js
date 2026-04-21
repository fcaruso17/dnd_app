// Each entry describes one class resource.
// getTotal(classes, attributes) → number (0 if class not present)
// getAnnotation(classes, attributes) → string | null

const getLevel = (classes, className) =>
    parseInt(classes.find(c => c.className === className)?.level) || 0;

export const RESOURCE_CONFIGS = [
    {
        key: 'rage',
        label: 'Rage',
        displayType: 'pips',
        resetOn: 'long',
        getTotal(classes) {
            const level = getLevel(classes, 'Barbarian');
            if (!level) return 0;
            if (level < 3) return 2;
            if (level < 6) return 3;
            if (level < 12) return 4;
            if (level < 17) return 5;
            return 6;
        },
        getAnnotation(classes) {
            const level = getLevel(classes, 'Barbarian');
            if (!level) return null;
            if (level < 9) return '+2';
            if (level < 16) return '+3';
            return '+4';
        },
    },
    {
        key: 'bardicInspiration',
        label: 'Bardic Inspiration',
        displayType: 'pips',
        resetOn: 'long',
        getTotal(classes, attributes) {
            const level = getLevel(classes, 'Bard');
            if (!level) return 0;
            const chaMod = Math.floor(((parseInt(attributes.cha) || 10) - 10) / 2);
            return Math.max(1, chaMod);
        },
        getAnnotation(classes) {
            const level = getLevel(classes, 'Bard');
            if (!level) return null;
            if (level < 5)  return 'd6';
            if (level < 10) return 'd8';
            if (level < 15) return 'd10';
            return 'd12';
        },
    },
    {
        key: 'channelDivinity',
        label: 'Channel Divinity',
        displayType: 'pips',
        resetOn: 'short',
        getTotal(classes) {
            const clericLvl = getLevel(classes, 'Cleric');
            const paladinLvl = getLevel(classes, 'Paladin');
            const clericTotal = clericLvl < 2 ? 0 : clericLvl < 6 ? 2 : clericLvl < 18 ? 3 : 4;
            const paladinTotal = paladinLvl < 3 ? 0 : paladinLvl < 11 ? 2 : 3;
            return Math.max(clericTotal, paladinTotal);
        },
        getAnnotation() { return null; },
    },
    {
        key: 'wildShape',
        label: 'Wild Shape',
        displayType: 'pips',
        resetOn: 'short',
        getTotal(classes) {
            const level = getLevel(classes, 'Druid');
            if (!level) return 0;
            if (level < 4) return 2;
            if (level < 10) return 3;
            return 4;
        },
        getAnnotation() { return null; },
    },
    {
        key: 'secondWind',
        label: 'Second Wind',
        displayType: 'pips',
        resetOn: 'short',
        getTotal(classes) {
            const level = getLevel(classes, 'Fighter');
            if (!level) return 0;
            if (level < 4) return 2;
            if (level < 10) return 3;
            return 4;
        },
        getAnnotation() { return null; },
    },
    {
        key: 'focusPoints',
        label: 'Focus Points',
        displayType: 'number',
        resetOn: 'short',
        getTotal(classes) {
            const level = getLevel(classes, 'Monk');
            return level < 2 ? 0 : level;
        },
        getAnnotation() { return null; },
    },
    {
        key: 'favoredEnemy',
        label: 'Favored Enemy',
        displayType: 'pips',
        resetOn: 'long',
        getTotal(classes) {
            const level = getLevel(classes, 'Ranger');
            if (!level) return 0;
            if (level < 5) return 2;
            if (level < 9) return 3;
            if (level < 13) return 4;
            if (level < 17) return 5;
            return 6;
        },
        getAnnotation() { return null; },
    },
    {
        key: 'sorceryPoints',
        label: 'Sorcery Points',
        displayType: 'number',
        resetOn: 'long',
        getTotal(classes) {
            const level = getLevel(classes, 'Sorcerer');
            return level < 2 ? 0 : level;
        },
        getAnnotation() { return null; },
    },
];

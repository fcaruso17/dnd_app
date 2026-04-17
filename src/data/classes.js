// All playable classes (used for Header dropdown and spell filtering)
export const CLASSES = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid',
  'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue',
  'Sorcerer', 'Warlock', 'Wizard',
];

// Classes with a prepared spell list in spellcastingTables.json.
// Used to decide whether to show the prepared toggle on the spell page.
export const PREPARED_CASTER_CLASSES = [
  'Artificer', 'Bard', 'Cleric', 'Druid',
  'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard',
];

// Fixed spellcasting ability per class (2024 rules)
export const SPELLCASTING_ABILITY = {
  Artificer: 'int',
  Bard:      'cha',
  Cleric:    'wis',
  Druid:     'wis',
  Paladin:   'cha',
  Ranger:    'wis',
  Sorcerer:  'cha',
  Warlock:   'cha',
  Wizard:    'int',
};

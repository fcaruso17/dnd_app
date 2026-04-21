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

// Subclass options per class (2024 PHB). Sourced from Excel Levels sheet.
export const SUBCLASSES = {
  Artificer:  ['Alchemist'],
  Barbarian:  ['Path of the Berserker', 'Path of the Wild Heart', 'Path of the World Tree', 'Path of the Zealot'],
  Bard:       ['College of Dance', 'College of Glamour', 'College of Lore', 'College of Valor'],
  Cleric:     ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain'],
  Druid:      ['Circle of the Land', 'Circle of the Moon', 'Circle of the Sea', 'Circle of the Stars'],
  Fighter:    ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior'],
  Monk:       ['Warrior of Mercy', 'Warrior of Shadow', 'Warrior of the Elements', 'Warrior of the Open Hand'],
  Paladin:    ['Oath of Devotion', 'Oath of Glory', 'Oath of the Ancients', 'Oath of Vengeance'],
  Ranger:     ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'],
  Rogue:      ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief'],
  Sorcerer:   ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic Sorcery'],
  Warlock:    ['Archfey Patron', 'Celestial Patron', 'Fiend Patron', 'Great Old One Patron'],
  Wizard:     ['Abjurer', 'Diviner', 'Evoker', 'Illusionist'],
};

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

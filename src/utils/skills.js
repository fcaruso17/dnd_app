// Skill proficiency tiers and their prof-bonus multipliers.
// 'half' rounds DOWN per 2024 PHB (Jack of All Trades / Remarkable Athlete).
export const profBonusForTier = (tier, profBonus) => {
    if (tier === 'expertise')  return profBonus * 2;
    if (tier === 'proficient') return profBonus;
    if (tier === 'half')       return Math.floor(profBonus / 2);
    return 0;
};

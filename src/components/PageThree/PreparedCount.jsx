import { useCharacterStore } from '../../store/useCharacterStore';

/**
 * Displays "Prepared X / Y" for the selected spellcasting classes.
 * X = total prepared spells across all levels.
 * Y = sum of getPreparedMax() across all selected spellcasting classes.
 *
 * Returns null if no spellcasting classes are selected.
 */
export const PreparedCount = ({ spellcastingClasses }) => {
    const spells = useCharacterStore(state => state.character.spellcasting.spells);
    const getPreparedMax = useCharacterStore(state => state.getPreparedMax);

    if (!spellcastingClasses || spellcastingClasses.length === 0) return null;

    const preparedCount = Object.values(spells).flat().filter(s => s.prepared).length;
    const preparedMax = spellcastingClasses.reduce((sum, cls) => sum + getPreparedMax(cls), 0);
    const atMax = preparedCount >= preparedMax;

    return (
        <span className={`prepared-count${atMax ? ' prepared-count--full' : ''}`}>
            Prepared {preparedCount} / {preparedMax}
        </span>
    );
};

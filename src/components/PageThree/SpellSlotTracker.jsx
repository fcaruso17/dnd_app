import { SpellLevel } from './SpellLevel';

const levelsColumn1 = [0, 1, 2, 3, 4];
const levelsColumn2 = [5, 6, 7, 8, 9];

export const SpellSlotTracker = () => {
    return (
        <div className="spell-tracker-container">
            <div className="spell-tracker-column">
                {levelsColumn1.map(level => (
                    <SpellLevel key={level} level={level} />
                ))}
            </div>
            <div className="spell-tracker-column">
                {levelsColumn2.map(level => (
                    <SpellLevel key={level} level={level} />
                ))}
            </div>
        </div>
    );
};

import { SpellcastingHeader } from './SpellcastingHeader';
import { SpellSlotTracker } from './SpellSlotTracker';
import './PageThree.css';

export const PageThreeSpells = () => {
    return (
        <div className="page-three-container animate-fade-in">
            <SpellcastingHeader />
            <SpellSlotTracker />
        </div>
    );
};

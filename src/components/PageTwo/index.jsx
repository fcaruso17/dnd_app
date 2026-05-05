import { FeatureAndTraits } from './FeatureAndTraits';
import { Lore } from './Lore';
import { Allies } from './Allies';
import { Appearance } from './Appearance';
import { Possessions } from './Possessions';
import './PageTwo.css';

export const PageTwoDetails = () => {
    return (
        <div className="page-two-grid animate-fade-in">
            {/* Column 1: Appearance */}
            <div className="card card-appearance">
                <h3 className="card-title">Appearance</h3>
                <Appearance />
            </div>

            {/* Column 2: Personality & Values */}
            <div className="card card-personality">
                <h3 className="card-title">Personality & Values</h3>
                <FeatureAndTraits />
            </div>

            {/* Column 3: Collapsible sections (stacked) */}
            <div className="card card-secondaries">
                <Lore />
                <Allies />
                <Possessions />
            </div>
        </div>
    );
};

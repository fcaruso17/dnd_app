import { Appearance } from './Appearance';
import { Lore } from './Lore';
import './PageTwo.css';

export const PageTwoDetails = () => {
    return (
        <div className="page-two-grid animate-fade-in">
            <Appearance />
            <Lore />
        </div>
    );
};

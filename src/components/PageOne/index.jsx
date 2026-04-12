import { Header } from './Header';
import { Attributes } from './Attributes';
import { Vitals } from './Vitals';
import { Skills } from './Skills';
import { Actions } from './Actions';
import { Inventory } from './Inventory';
import { OtherProficiencies } from './OtherProficiencies';
import './PageOne.css';

const LeftColumn = () => (
    <div className="left-column-wrapper">
        <div className="left-column-top">
            <Attributes />
            <Skills />
        </div>
        <OtherProficiencies />
    </div>
);

const CenterColumn = () => (
    <div className="center-column-wrapper">
        <Vitals />
        <Actions />
        <Inventory />
    </div>
);

export const PageOneCore = () => {
    return (
        <div className="page-one-grid animate-fade-in">
            <Header />
            <LeftColumn />
            <CenterColumn />
        </div>
    );
};

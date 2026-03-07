import { Header } from './Header';
import { Attributes } from './Attributes';
import { Vitals } from './Vitals';
import { Skills } from './Skills';
import { Actions } from './Actions';
import { Traits } from './Traits';
import { Inventory } from './Inventory';
import { OtherProficiencies } from './OtherProficiencies';
import './PageOne.css';

const LeftColumn = () => (
    <div className="left-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridArea: 'left_col' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Attributes />
            <Skills />
        </div>
        <OtherProficiencies />
    </div>
);

const CenterColumn = () => (
    <div className="center-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridArea: 'center_col' }}>
        <Vitals />
        <Actions />
        <Inventory />
    </div>
);

const RightColumn = () => (
    <div className="right-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridArea: 'right_col' }}>
        <Traits />
    </div>
);

export const PageOneCore = () => {
    return (
        <div className="page-one-grid animate-fade-in">
            <Header />
            <LeftColumn />
            <CenterColumn />
            <RightColumn />
        </div>
    );
};

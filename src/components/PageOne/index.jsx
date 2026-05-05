import { CombatStrip }   from './CombatStrip';
import { Attributes }    from './Attributes';
import { Skills }        from './Skills';
import { CombatStats }   from './CombatStats';
import { AttacksPanel }  from './AttacksPanel';
import { WeaponsGear }   from './WeaponsGear';
import { CharacterCard } from './CharacterCard';
import './PageOne.css';

const AmbientBlobs = () => (
    <div className="page-one-blobs" aria-hidden="true">
        <div className="page-one-blob page-one-blob--a" />
        <div className="page-one-blob page-one-blob--b" />
        <div className="page-one-blob page-one-blob--c" />
    </div>
);

export const PageOneCore = () => (
    <>
        <AmbientBlobs />
        <div className="page-one-wrapper">
            <CombatStrip />
            <div className="page-one-content">
                <div className="bento-grid">
                    <div className="bento-abilities">
                        <Attributes />
                    </div>
                    <div className="bento-skills">
                        <Skills />
                    </div>
                    <div className="bento-right-column">
                        <div className="bento-combat-stats">
                            <CombatStats />
                        </div>
                        <div className="bento-attacks">
                            <AttacksPanel />
                        </div>
                        <div className="bento-weapons">
                            <WeaponsGear />
                        </div>
                    </div>
                </div>
                <div className="page-one-sidebar">
                    <CharacterCard />
                </div>
            </div>
        </div>
    </>
);

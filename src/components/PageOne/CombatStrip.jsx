import { useState, useEffect, useRef } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { parseDie } from '../../utils/validate';

import { CLASSES, SUBCLASSES } from '../../data/classes';
import { CharacterInfo } from './CharacterInfo';

export const CombatStrip = () => {
    const vitals        = useCharacterStore(s => s.character.vitals);
    const header        = useCharacterStore(s => s.character.header);
    const update        = useCharacterStore(s => s.updateNestedField);
    const getModifier   = useCharacterStore(s => s.getModifier);
    const attributes    = useCharacterStore(s => s.character.attributes);
    const shortRest     = useCharacterStore(s => s.shortRest);
    const longRest      = useCharacterStore(s => s.longRest);
    const addHitDice    = useCharacterStore(s => s.addHitDice);
    const deleteHitDice = useCharacterStore(s => s.deleteHitDice);
    const isEditMode    = useCharacterStore(s => s.isEditMode);

    const [hpInput, setHpInput]             = useState('');
    const [shortRestSpending, setShortRestSpending] = useState(false);
    const [hdSpend, setHdSpend]             = useState({});
    const [shortRestHp, setShortRestHp]     = useState('');
    const [longRestPhase, setLongRestPhase] = useState(0);
    const [longRestCount, setLongRestCount] = useState(3);
    const longRestTimer = useRef(null);
    const longRestFired = useRef(false);
    const longRestRef   = useRef(longRest);

    useEffect(() => { longRestRef.current = longRest; }, [longRest]);
    useEffect(() => () => clearInterval(longRestTimer.current), []);

    const isCritical = vitals.hpMax > 0 && vitals.hpCurrent / vitals.hpMax <= 0.25;
    const isDying    = vitals.hpCurrent === 0;
    const hpPct      = vitals.hpMax > 0 ? Math.min(100, (vitals.hpCurrent / vitals.hpMax) * 100) : 0;
    const tempPct    = vitals.hpMax > 0 ? Math.min(100, (vitals.hpTemp / vitals.hpMax) * 100) : 0;


    const startLongRest = () => {
        if (longRestPhase === 1) return;
        longRestFired.current = false;
        setLongRestPhase(1);
        setLongRestCount(3);
        longRestTimer.current = setInterval(() => {
            setLongRestCount(n => {
                if (n <= 1) {
                    if (!longRestFired.current) {
                        longRestFired.current = true;
                        clearInterval(longRestTimer.current);
                        setLongRestPhase(0);
                        setLongRestCount(3);
                        longRestRef.current();
                    }
                    return 1;
                }
                return n - 1;
            });
        }, 1000);
    };

    const cancelLongRest = () => {
        clearInterval(longRestTimer.current);
        longRestFired.current = false;
        setLongRestPhase(0);
        setLongRestCount(3);
    };

    const calcShortRestHp = () => {
        let total = 0;
        vitals.hitDice.forEach(pool => {
            const n = parseInt(hdSpend[pool.id]) || 0;
            const sides = parseDie(pool.die);
            const conMod = getModifier(attributes.con);
            for (let j = 0; j < n; j++) total += Math.floor(Math.random() * sides) + 1 + conMod;
        });
        setShortRestHp(String(Math.max(0, total)));
    };

    const commitShortRest = () => {
        const gain = parseInt(shortRestHp) || 0;
        shortRest();
        update('vitals', 'hpCurrent', Math.min(vitals.hpMax, vitals.hpCurrent + gain));

        // Update expended counts for spent dice
        const updated = vitals.hitDice.map(pool => {
            const spent = parseInt(hdSpend[pool.id]) || 0;
            return {
                ...pool,
                expended: pool.expended + spent
            };
        });
        update('vitals', 'hitDice', updated);

        setHdSpend({});
        setShortRestHp('');
        setShortRestSpending(false);
    };

    const toggleDeathSave = (type, index) => {
        const current = vitals.deathSaves[type];
        const next = current > index ? index : index + 1;
        update('vitals', 'deathSaves', { ...vitals.deathSaves, [type]: Math.min(3, next) });
    };

    const updateClass = (i, patch) => {
        const next = [...header.classes];
        next[i] = { ...next[i], ...patch };
        // Clear subclass if level drops below 3
        if (patch.level && patch.level < 3 && next[i].subclass) {
            next[i].subclass = '';
        }
        update('header', 'classes', next);
    };

    return (
        <div className="combat-strip glass-panel">
            {/* Classes and Subclasses Section */}
            <div className="cs-group cs-group--identity">
                <div className="cs-identity-title">CLASSES AND SUBCLASSES</div>
                {/* Classes Horizontal Cards */}
                <div className="cs-classes-horizontal">
                    {header.classes.map((cls, i) => {
                        // Get classes selected in OTHER slots (exclude current one)
                        const otherSelectedClasses = header.classes
                            .filter((_, idx) => idx !== i)
                            .map(c => c.className)
                            .filter(name => name !== '');

                        return (
                        <div key={cls.id} className="cs-class-card" data-class={cls.className || 'Homebrew'}>
                            {isEditMode ? (
                                <div className="cs-class-edit">
                                    <select className="cs-class-select" value={cls.className}
                                        onChange={e => updateClass(i, { className: e.target.value, subclass: '' })}>
                                        <option value="">— Class —</option>
                                        {CLASSES.map(c => (
                                            <option key={c} value={c} disabled={otherSelectedClasses.includes(c)}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                    <input type="number" aria-label="Class level" className="cs-level-edit tabular"
                                        value={cls.level} min="1" max="20"
                                        onChange={e => updateClass(i, { level: parseInt(e.target.value) || 1 })} />
                                    {cls.className && cls.level >= 3 && SUBCLASSES[cls.className]?.length > 0 && (
                                        <select className="cs-subclass-select" value={cls.subclass || ''}
                                            onChange={e => updateClass(i, { subclass: e.target.value })}>
                                            <option value="">— Subclass —</option>
                                            {SUBCLASSES[cls.className].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    )}
                                    {cls.className && cls.level < 3 && SUBCLASSES[cls.className]?.length > 0 && (
                                        <span className="cs-subclass-locked">Subclass at Lv3</span>
                                    )}
                                    {header.classes.length > 1 && (
                                        <button className="cs-remove-class pressable"
                                            onClick={() => update('header', 'classes', header.classes.filter((_, j) => j !== i))}
                                            aria-label="Remove class">✕</button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="cs-card-header">
                                        <span className="cs-card-class-name">{cls.className ? cls.className.toUpperCase() : 'CLASS'}</span>
                                        <span className="cs-card-level">LVL {cls.level}</span>
                                    </div>
                                    {cls.level >= 3 ? (
                                        <span className="cs-card-subclass">{cls.subclass || '(no subclass)'}</span>
                                    ) : (
                                        <span className="cs-card-subclass-locked">(Subclass at Lv3)</span>
                                    )}
                                </>
                            )}
                        </div>
                        );
                    })}
                    {isEditMode && (
                        <button className="cs-add-class pressable"
                            onClick={() => update('header', 'classes', [
                                ...header.classes,
                                { id: crypto.randomUUID(), className: '', level: 1, subclass: '' }
                            ])}
                            disabled={header.classes.some(c => !c.className)}>+ class</button>
                    )}
                </div>
            </div>

            {/* Group 2: Character Info (Race, Alignment, Background, XP) */}
            <CharacterInfo />

            {/* Group 3: Hit Points (compact but prominent) */}
            <div className="cs-group cs-group--vitals">
                <div className="cs-group-label">HIT POINTS</div>
                <div className="cs-hp-row">
                    <span className={`cs-hp-current tabular${isCritical ? ' hp-critical' : ''}`}>
                        {vitals.hpCurrent}
                    </span>
                    <span className="cs-hp-sep">/</span>
                    <input type="number" className="cs-hp-max-input tabular"
                        value={vitals.hpMax}
                        onChange={e => update('vitals', 'hpMax', parseInt(e.target.value) || 0)}
                        aria-label="Maximum hit points" min="0" />
                </div>
                <div className="cs-hp-bar-wrap" role="meter"
                    aria-valuenow={vitals.hpCurrent} aria-valuemin={0} aria-valuemax={vitals.hpMax}
                    aria-label="Hit points">
                    <div className="cs-hp-bar" style={{ width: `${hpPct}%` }} />
                </div>
                <div className="cs-temp-row">
                    <span className="cs-temp-label">TMP</span>
                    <input type="number" className="cs-hp-temp-input tabular"
                        value={vitals.hpTemp || ''}
                        onChange={e => update('vitals', 'hpTemp', Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="0"
                        aria-label="Temporary hit points" min="0" />
                    {vitals.hpTemp > 0 && (
                        <div className="cs-temp-bar-wrap">
                            <div className="cs-temp-bar" style={{ width: `${tempPct}%` }} />
                        </div>
                    )}
                </div>
                <div className="cs-hp-actions">
                    <button className="cs-hp-btn cs-hp-heal pressable"
                        onClick={() => {
                            const n = parseInt(hpInput) || 1;
                            update('vitals', 'hpCurrent', Math.min(vitals.hpMax, vitals.hpCurrent + n));
                            setHpInput('');
                        }}>+ Heal</button>
                    <input type="number" className="cs-hp-input tabular"
                        value={hpInput} onChange={e => setHpInput(e.target.value)}
                        placeholder="amt" min="0" />
                    <button className="cs-hp-btn cs-hp-dmg pressable"
                        onClick={() => {
                            const n = parseInt(hpInput) || 1;
                            const absorbed = Math.min(vitals.hpTemp, n);
                            update('vitals', 'hpTemp', vitals.hpTemp - absorbed);
                            update('vitals', 'hpCurrent', Math.max(0, vitals.hpCurrent - (n - absorbed)));
                            setHpInput('');
                        }}>− Dmg</button>
                </div>
            </div>

            {/* Group 3: Hit Dices (Hit Dice pools, Rests) */}
            <div className="cs-group cs-group--hit-dices">
                <div className="cs-hd-header">
                    <span className="cs-group-label">HIT DICE</span>
                    {isEditMode && (
                        <button className="cs-hd-add-btn pressable" onClick={addHitDice} aria-label="Add hit die pool">+</button>
                    )}
                </div>
                <div className="cs-hd-divider" />
                <div className="cs-hd-pools">
                    {vitals.hitDice.map(pool => {
                        const available = Math.max(0, pool.total - pool.expended);
                        return (
                            <div key={pool.id} className="cs-hd-pool-row">
                                {isEditMode ? (
                                    <>
                                        <select className="cs-hd-die-select tabular"
                                            value={pool.die}
                                            onChange={e => {
                                                const updated = vitals.hitDice.map(hd =>
                                                    hd.id === pool.id ? { ...hd, die: e.target.value } : hd
                                                );
                                                update('vitals', 'hitDice', updated);
                                            }}>
                                            <option value="d6">d6</option>
                                            <option value="d8">d8</option>
                                            <option value="d10">d10</option>
                                            <option value="d12">d12</option>
                                        </select>
                                        <span className="cs-hd-pools-label">Pools:</span>
                                        <input type="number" className="cs-hd-available-input tabular" min="0"
                                            value={available}
                                            onChange={e => {
                                                const n = Math.max(0, parseInt(e.target.value) || 0);
                                                const updated = vitals.hitDice.map(hd =>
                                                    hd.id === pool.id ? { ...hd, expended: Math.max(0, hd.total - n) } : hd
                                                );
                                                update('vitals', 'hitDice', updated);
                                            }} />
                                        <span className="cs-hd-sep">/</span>
                                        <input type="number" className="cs-hd-total-input tabular" min="1"
                                            value={pool.total}
                                            onChange={e => {
                                                const n = Math.max(1, parseInt(e.target.value) || 1);
                                                const updated = vitals.hitDice.map(hd =>
                                                    hd.id === pool.id ? { ...hd, total: n, expended: Math.min(hd.expended, n) } : hd
                                                );
                                                update('vitals', 'hitDice', updated);
                                            }} />
                                        <button className="cs-hd-delete pressable" onClick={() => deleteHitDice(pool.id)} aria-label="Delete hit die pool">✕</button>
                                    </>
                                ) : shortRestSpending ? (
                                    <>
                                        <span className="cs-hd-die tabular">{pool.die}</span>
                                        <span className="cs-hd-pools-label">Spend:</span>
                                        <input type="number" className="cs-hd-spend-input tabular" min="0" max={available}
                                            value={hdSpend[pool.id] || ''}
                                            onChange={e => setHdSpend(s => ({ ...s, [pool.id]: e.target.value }))}
                                            placeholder="0" />
                                        <span className="cs-hd-sep">/</span>
                                        <span className="cs-hd-total tabular">{available}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="cs-hd-die tabular">{pool.die}</span>
                                        <span className="cs-hd-pools-label">Pools:</span>
                                        <span className="cs-hd-available tabular">{available}</span>
                                        <span className="cs-hd-sep">/</span>
                                        <span className="cs-hd-total tabular">{pool.total}</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="cs-hd-divider" />
                {shortRestSpending ? (
                    <div className="cs-rest-btns">
                        <button className="cs-rest-btn cs-short-rest pressable"
                            onClick={calcShortRestHp}>Roll</button>
                        {shortRestHp !== '' && (
                            <>
                                <span className="cs-sr-result tabular">+{shortRestHp} HP</span>
                                <button className="cs-rest-btn cs-short-rest pressable"
                                    onClick={commitShortRest}>Apply</button>
                            </>
                        )}
                        <button className="cs-rest-btn cs-short-rest-cancel pressable"
                            onClick={() => {
                                setShortRestSpending(false);
                                setHdSpend({});
                                setShortRestHp('');
                            }}>Cancel</button>
                    </div>
                ) : (
                    <div className="cs-rest-btns">
                        <button className="cs-rest-btn cs-short-rest pressable"
                            onClick={() => setShortRestSpending(true)}>Short Rest</button>
                        <button
                            className={`cs-rest-btn cs-long-rest pressable${longRestPhase === 1 ? ' cs-long-rest--armed' : ''}`}
                            onClick={longRestPhase === 0 ? startLongRest : cancelLongRest}>
                            {longRestPhase === 1 ? `Cancel (${longRestCount})` : 'Long Rest'}
                        </button>
                    </div>
                )}
            </div>

            {/* Death saves — slides in when HP = 0 */}
            {isDying && (
                <div className="cs-death-saves">
                    <span className="cs-ds-label">Death Saves</span>
                    <div className="cs-ds-row">
                        <span className="cs-ds-type cs-ds-success">Success</span>
                        {[0, 1, 2].map(i => (
                            <button key={i}
                                className={`cs-ds-pip pressable${i < vitals.deathSaves.successes ? ' cs-ds-pip--success' : ''}`}
                                onClick={() => toggleDeathSave('successes', i)}
                                aria-label={`Death save success ${i + 1} of 3, ${i < vitals.deathSaves.successes ? 'filled' : 'empty'}`}>
                                {i < vitals.deathSaves.successes ? '✓' : ''}
                            </button>
                        ))}
                    </div>
                    <div className="cs-ds-row">
                        <span className="cs-ds-type cs-ds-failure">Failure</span>
                        {[0, 1, 2].map(i => (
                            <button key={i}
                                className={`cs-ds-pip pressable${i < vitals.deathSaves.failures ? ' cs-ds-pip--failure' : ''}`}
                                onClick={() => toggleDeathSave('failures', i)}
                                aria-label={`Death save failure ${i + 1} of 3, ${i < vitals.deathSaves.failures ? 'filled' : 'empty'}`}>
                                {i < vitals.deathSaves.failures ? '✕' : ''}
                            </button>
                        ))}
                    </div>
                    <button className="cs-stabilize-btn pressable"
                        onClick={() => {
                            update('vitals', 'hpCurrent', 1);
                            update('vitals', 'deathSaves', { successes: 0, failures: 0 });
                        }}>Stabilize</button>
                </div>
            )}
        </div>
    );
};

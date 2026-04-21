import { useState, useEffect, useRef } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { formatModifier } from '../../utils/format';

export const Vitals = () => {
    const data = useCharacterStore(state => state.character.vitals);
    const attributes = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);
    const shortRest = useCharacterStore(state => state.shortRest);
    const longRest  = useCharacterStore(state => state.longRest);
    const [hpChangeAmount, setHpChangeAmount] = useState('');
    const [shortRestOpen, setShortRestOpen]     = useState(false);
    const [hdSpend, setHdSpend]                 = useState({});      // { [poolIndex]: number }
    const [shortRestHp, setShortRestHp]         = useState('');
    const [longRestPhase, setLongRestPhase]     = useState(0);       // 0=idle 1=armed
    const [longRestCount, setLongRestCount]     = useState(3);
    const longRestTimer = useRef(null);

    const handleHitDiceChange = (index, field, value) => {
        const newHitDice = [...data.hitDice];
        if (field === 'total' || field === 'expended') value = parseInt(value) || 0;
        newHitDice[index] = { ...newHitDice[index], [field]: value };
        updateNestedField('vitals', 'hitDice', newHitDice);
    };

    const addHitDicePool = () => {
        updateNestedField('vitals', 'hitDice', [...data.hitDice, { id: crypto.randomUUID(), class: '', die: 'd8', total: 1, expended: 0 }]);
    };

    const removeHitDicePool = (index) => {
        if (data.hitDice.length <= 1) return;
        updateNestedField('vitals', 'hitDice', data.hitDice.filter((_, i) => i !== index));
    };

    const handleDamage = (amount) => {
        const tempAbsorbed = Math.min(data.hpTemp, amount);
        updateNestedField('vitals', 'hpTemp', data.hpTemp - tempAbsorbed);
        updateNestedField('vitals', 'hpCurrent', Math.max(0, data.hpCurrent - (amount - tempAbsorbed)));
    };

    const openShortRest = () => {
        setHdSpend({});
        setShortRestHp('');
        setShortRestOpen(true);
    };

    const cancelShortRest = () => setShortRestOpen(false);

    const applyShortRest = () => {
        const hp = parseInt(shortRestHp) || 0;
        if (hp > 0) {
            updateNestedField('vitals', 'hpCurrent',
                Math.min(data.hpCurrent + hp, data.hpMax)
            );
        }
        const newHitDice = data.hitDice.map((hd, idx) => {
            const spent = Math.min(hdSpend[idx] || 0, hd.total - hd.expended);
            return { ...hd, expended: hd.expended + spent };
        });
        updateNestedField('vitals', 'hitDice', newHitDice);
        shortRest();
        setShortRestOpen(false);
    };

    const armLongRest = () => {
        if (longRestPhase === 1) {
            clearInterval(longRestTimer.current);
            longRestTimer.current = null;
            setLongRestPhase(0);
            longRest();
            return;
        }
        if (longRestTimer.current) return; // guard against rapid double-click
        setLongRestPhase(1);
        setLongRestCount(3);
        let count = 3;
        longRestTimer.current = setInterval(() => {
            count -= 1;
            setLongRestCount(count);
            if (count <= 0) {
                clearInterval(longRestTimer.current);
                longRestTimer.current = null;
                setLongRestPhase(0);
                longRest();
            }
        }, 1000);
    };

    const cancelLongRest = (e) => {
        e.stopPropagation();
        clearInterval(longRestTimer.current);
        longRestTimer.current = null;
        setLongRestPhase(0);
    };

    useEffect(() => () => clearInterval(longRestTimer.current), []);

    return (
        <div className="vitals-container">
            {/* Top vital stats */}
            <div className="vitals-row">
                <div className="glass-panel shield-box">
                    <input
                        type="number"
                        value={data.armorClass}
                        onChange={(e) => updateNestedField('vitals', 'armorClass', parseInt(e.target.value) || 0)}
                    />
                    <span>Armor Class</span>
                </div>
                <div className="glass-panel stat-box">
                    <input
                        type="text"
                        value={formatModifier(getModifier(attributes.dex))}
                        readOnly
                        className="auto-calculated-input"
                    />
                    <span>Initiative</span>
                </div>
                <div className="glass-panel stat-box">
                    <input
                        type="number"
                        value={data.speed}
                        onChange={(e) => updateNestedField('vitals', 'speed', parseInt(e.target.value) || 0)}
                    />
                    <span>Speed</span>
                </div>
            </div>

            {/* Health points tracking */}
            <div className="glass-panel health-box">
                <div className="health-header">
                    <span className="health-title">Hit Points</span>
                </div>
                <div className="health-controls">
                    <label className="hp-input-group">
                        <span>Current HP</span>
                        <input
                            type="number"
                            className="large-hp"
                            value={data.hpCurrent}
                            onChange={(e) => updateNestedField('vitals', 'hpCurrent', parseInt(e.target.value) || 0)}
                        />
                    </label>
                    <div className="hp-divider">/</div>
                    <label className="hp-input-group">
                        <span>Max HP</span>
                        <input
                            type="number"
                            value={data.hpMax}
                            onChange={(e) => updateNestedField('vitals', 'hpMax', parseInt(e.target.value) || 0)}
                        />
                    </label>
                </div>

                <div className="temp-health-controls">
                    <label className="hp-input-group row-align">
                        <span>Temp HP:</span>
                        <input
                            type="number"
                            value={data.hpTemp}
                            onChange={(e) => updateNestedField('vitals', 'hpTemp', parseInt(e.target.value) || 0)}
                        />
                    </label>

                    <div className="quick-heal-dmg">
                        <input
                            type="number"
                            placeholder="1"
                            value={hpChangeAmount}
                            onChange={(e) => setHpChangeAmount(e.target.value)}
                            className="hp-change-input"
                        />
                        <button className="btn btn-sm" onClick={() => {
                            const val = parseInt(hpChangeAmount) || 1;
                            updateNestedField('vitals', 'hpCurrent', Math.min(data.hpCurrent + val, data.hpMax));
                            setHpChangeAmount('');
                        }}>Heal</button>
                        <button className="btn btn-sm btn-danger" onClick={() => {
                            const val = parseInt(hpChangeAmount) || 1;
                            handleDamage(val);
                            setHpChangeAmount('');
                        }}>Dmg</button>
                    </div>
                </div>
            </div>

            {/* Hit Dice pools (Multiclass array support) */}
            <div className="vitals-row halves">
                <div className="glass-panel hit-dice-box">
                    <div className="box-title flex-between">
                        <span>Hit Dice</span>
                        <button className="btn-sm" onClick={addHitDicePool} disabled={shortRestOpen} aria-label="Add hit dice pool">+</button>
                    </div>
                    <div className="hit-dice-list">
                        {data.hitDice.map((hd, idx) => (
                            <div key={hd.id || idx} className="hit-dice-row">
                                <input
                                    type="text"
                                    value={hd.die}
                                    placeholder="d8"
                                    onChange={(e) => handleHitDiceChange(idx, 'die', e.target.value)}
                                    className="hit-dice-input"
                                />
                                <span> Pools: </span>
                                <input
                                    type="number"
                                    value={hd.total - hd.expended}
                                    onChange={(e) => handleHitDiceChange(idx, 'expended', hd.total - (parseInt(e.target.value) || 0))}
                                    title="Available Hit Dice"
                                    className="hit-dice-input"
                                />
                                <span> / </span>
                                <input
                                    type="number"
                                    value={hd.total}
                                    onChange={(e) => handleHitDiceChange(idx, 'total', e.target.value)}
                                    title="Total Hit Dice"
                                    className="hit-dice-input"
                                />
                                <button className="btn-danger-icon" onClick={() => removeHitDicePool(idx)} disabled={data.hitDice.length === 1 || shortRestOpen} aria-label="Remove hit dice pool">✕</button>
                            </div>
                        ))}
                    </div>

                    {/* Short rest inline panel */}
                    {shortRestOpen && (
                        <div className="hd-rest-panel">
                            <div className="hd-rest-panel-title">Short Rest — Spend Hit Dice</div>
                            {data.hitDice.map((hd, idx) => {
                                const available = hd.total - hd.expended;
                                const spending = hdSpend[idx] || 0;
                                return (
                                    <div key={hd.id || idx} className="hd-spend-row">
                                        <span className="hd-spend-die">{hd.die}</span>
                                        <span className="hd-spend-avail">{available - spending} left</span>
                                        <div className="hd-spend-controls">
                                            <button
                                                className="btn-sm"
                                                onClick={() => setHdSpend(s => ({ ...s, [idx]: Math.max(0, (s[idx] || 0) - 1) }))}
                                                disabled={spending <= 0}
                                                aria-label="Spend one fewer die"
                                            >−</button>
                                            <span className="hd-spend-count">{spending}</span>
                                            <button
                                                className="btn-sm"
                                                onClick={() => setHdSpend(s => ({ ...s, [idx]: Math.min(available, (s[idx] || 0) + 1) }))}
                                                disabled={spending >= available}
                                                aria-label="Spend one more die"
                                            >+</button>
                                        </div>
                                    </div>
                                );
                            })}
                            <label className="hd-spend-hp-row">
                                <span>HP recovered:</span>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={shortRestHp}
                                    onChange={e => setShortRestHp(e.target.value)}
                                    className="hd-spend-hp-input"
                                    aria-label="HP recovered this short rest"
                                />
                            </label>
                            <div className="hd-rest-actions">
                                <button className="btn btn-sm btn-secondary" onClick={cancelShortRest}>Cancel</button>
                                <button className="btn btn-sm" onClick={applyShortRest}>Apply</button>
                            </div>
                        </div>
                    )}

                    {/* Rest buttons */}
                    <div className="hd-rest-footer">
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={openShortRest}
                            disabled={shortRestOpen || longRestPhase === 1}
                            title="Spend hit dice to recover HP. Resets: Channel Divinity, Wild Shape, Second Wind, Focus Points."
                        >
                            Short Rest
                        </button>
                        <button
                            className={`btn btn-sm btn-long-rest${longRestPhase === 1 ? ' btn-long-rest--armed' : ''}`}
                            onClick={armLongRest}
                            title="Long Rest: restores HP, all hit dice, spell slots, class resources, and clears death saves."
                        >
                            {longRestPhase === 1 ? `Confirm? (${longRestCount})` : 'Long Rest'}
                        </button>
                        {longRestPhase === 1 && (
                            <button className="btn btn-sm btn-secondary" onClick={cancelLongRest} aria-label="Cancel long rest">✕</button>
                        )}
                    </div>
                </div>

                {/* Death Saves */}
                <div className="glass-panel death-saves-box">
                    <div className="box-title">Death Saves</div>
                    <div className="death-save-row">
                        <span>Successes</span>
                        <div className="checkboxes">
                            {[1, 2, 3].map(num => (
                                <button
                                    key={`succ-${num}`}
                                    className={`death-save-pip success ${data.deathSaves.successes >= num ? 'active' : ''}`}
                                    onClick={() => {
                                        const newVal = data.deathSaves.successes >= num ? num - 1 : num;
                                        updateNestedField('vitals', 'deathSaves', { ...data.deathSaves, successes: newVal });
                                    }}
                                    aria-label={`Success ${num}: ${data.deathSaves.successes >= num ? 'filled' : 'empty'}`}
                                    aria-pressed={data.deathSaves.successes >= num}
                                >
                                    {data.deathSaves.successes >= num ? '✓' : '○'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="death-save-row">
                        <span>Failures</span>
                        <div className="checkboxes">
                            {[1, 2, 3].map(num => (
                                <button
                                    key={`fail-${num}`}
                                    className={`death-save-pip failure ${data.deathSaves.failures >= num ? 'active' : ''}`}
                                    onClick={() => {
                                        const newVal = data.deathSaves.failures >= num ? num - 1 : num;
                                        updateNestedField('vitals', 'deathSaves', { ...data.deathSaves, failures: newVal });
                                    }}
                                    aria-label={`Failure ${num}: ${data.deathSaves.failures >= num ? 'filled' : 'empty'}`}
                                    aria-pressed={data.deathSaves.failures >= num}
                                >
                                    {data.deathSaves.failures >= num ? '✕' : '○'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

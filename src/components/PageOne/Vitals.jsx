import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';

export const Vitals = () => {
    const data = useCharacterStore(state => state.character.vitals);
    const attributes = useCharacterStore(state => state.character.attributes);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const getModifier = useCharacterStore(state => state.getModifier);
    const [hpChangeAmount, setHpChangeAmount] = useState('');

    const handleHitDiceChange = (index, field, value) => {
        const newHitDice = [...data.hitDice];
        if (field === 'total' || field === 'expended') value = parseInt(value) || 0;
        newHitDice[index] = { ...newHitDice[index], [field]: value };
        updateNestedField('vitals', 'hitDice', newHitDice);
    };

    const addHitDicePool = () => {
        updateNestedField('vitals', 'hitDice', [...data.hitDice, { class: '', die: 'd8', total: 1, expended: 0 }]);
    };

    const removeHitDicePool = (index) => {
        if (data.hitDice.length <= 1) return;
        updateNestedField('vitals', 'hitDice', data.hitDice.filter((_, i) => i !== index));
    };

    const handleDamage = (amount) => {
        let remainingDamage = amount;
        let newTempHp = data.hpTemp;
        let newCurrentHp = data.hpCurrent;

        if (newTempHp > 0) {
            if (newTempHp >= remainingDamage) {
                newTempHp -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= newTempHp;
                newTempHp = 0;
            }
            updateNestedField('vitals', 'hpTemp', newTempHp);
        }

        if (remainingDamage > 0) {
            newCurrentHp = Math.max(newCurrentHp - remainingDamage, 0);
            updateNestedField('vitals', 'hpCurrent', newCurrentHp);
        }
    };

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
                        value={getModifier(attributes.dex) > 0 ? `+${getModifier(attributes.dex)}` : getModifier(attributes.dex)}
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

                    <div className="quick-heal-dmg" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="1"
                            value={hpChangeAmount}
                            onChange={(e) => setHpChangeAmount(e.target.value)}
                            style={{ width: '45px', fontSize: '0.9rem', textAlign: 'center', height: '28px', padding: '0 0.25rem' }}
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
                        <button className="btn-sm" onClick={addHitDicePool}>+</button>
                    </div>
                    <div className="hit-dice-list">
                        {data.hitDice.map((hd, idx) => (
                            <div key={idx} className="hit-dice-row">
                                <input
                                    type="text"
                                    value={hd.die}
                                    placeholder="d8"
                                    onChange={(e) => handleHitDiceChange(idx, 'die', e.target.value)}
                                    style={{ width: '40px' }}
                                />
                                <span> Pools: </span>
                                <input
                                    type="number"
                                    value={hd.total - hd.expended}
                                    onChange={(e) => handleHitDiceChange(idx, 'expended', hd.total - (parseInt(e.target.value) || 0))}
                                    title="Available Hit Dice"
                                    style={{ width: '40px' }}
                                />
                                <span> / </span>
                                <input
                                    type="number"
                                    value={hd.total}
                                    onChange={(e) => handleHitDiceChange(idx, 'total', e.target.value)}
                                    title="Total Hit Dice"
                                    style={{ width: '40px' }}
                                />
                                <button className="btn-danger-icon" onClick={() => removeHitDicePool(idx)} disabled={data.hitDice.length === 1}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Death Saves */}
                <div className="glass-panel death-saves-box">
                    <div className="box-title">Death Saves</div>
                    <div className="death-save-row success">
                        <span>Successes</span>
                        <div className="checkboxes">
                            {[1, 2, 3].map(num => (
                                <input
                                    type="checkbox"
                                    key={`succ-${num}`}
                                    checked={data.deathSaves.successes >= num}
                                    onChange={() => {
                                        const newVal = data.deathSaves.successes >= num ? num - 1 : num;
                                        updateNestedField('vitals', 'deathSaves', { ...data.deathSaves, successes: newVal });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="death-save-row failure">
                        <span>Failures</span>
                        <div className="checkboxes">
                            {[1, 2, 3].map(num => (
                                <input
                                    type="checkbox"
                                    key={`fail-${num}`}
                                    checked={data.deathSaves.failures >= num}
                                    onChange={() => {
                                        const newVal = data.deathSaves.failures >= num ? num - 1 : num;
                                        updateNestedField('vitals', 'deathSaves', { ...data.deathSaves, failures: newVal });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchEquipment, fetchEquipmentDetails, searchList } from '../../services/dndApi';

export const Actions = () => {
    const data = useCharacterStore(state => state.character.combat); // { attacks: [{ name, bonus, damage, type }] }
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data: equipmentList } = useQuery({
        queryKey: ['equipment'],
        queryFn: fetchEquipment
    });

    useEffect(() => {
        if (searchQuery.length > 1 && equipmentList) {
            setSearchResults(searchList(equipmentList, searchQuery));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, equipmentList]);

    const handleAddCustomAttack = () => {
        updateNestedField('combat', 'attacks', [
            ...data.attacks,
            { name: '', bonus: '', damage: '', type: '' }
        ]);
    };

    const handleSelectOfficialWeapon = async (weaponIndex) => {
        setIsSearching(true);
        const details = await fetchEquipmentDetails(weaponIndex);
        setIsSearching(false);

        if (details) {
            const damageDice = details.damage?.damage_dice || '';
            const damageType = details.damage?.damage_type?.name || '';

            updateNestedField('combat', 'attacks', [
                ...data.attacks,
                {
                    name: details.name,
                    bonus: '', // User will fill this in based on STR/DEX
                    damage: damageDice,
                    type: damageType
                }
            ]);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const updateAttack = (index, field, value) => {
        const newAttacks = [...data.attacks];
        newAttacks[index] = { ...newAttacks[index], [field]: value };
        updateNestedField('combat', 'attacks', newAttacks);
    };

    const removeAttack = (index) => {
        updateNestedField('combat', 'attacks', data.attacks.filter((_, i) => i !== index));
    };

    return (
        <div className="glass-panel actions-container">
            <div className="box-title flex-between" style={{ marginBottom: '1rem' }}>
                <h3>Attacks & Spellcasting</h3>
            </div>

            <div className="attacks-list">
                {data.attacks.length > 0 && (
                    <div className="attacks-header-row">
                        <span style={{ flex: 2 }}>Name</span>
                        <span style={{ flex: 1 }}>Bonus</span>
                        <span style={{ flex: 1.5 }}>Damage</span>
                        <span style={{ flex: 1.5 }}>Type</span>
                        <span style={{ width: '30px' }}></span>
                    </div>
                )}

                {data.attacks.map((atk, idx) => (
                    <div key={idx} className="attack-row">
                        <input
                            style={{ flex: 2 }} type="text" placeholder="Dagger"
                            value={atk.name} onChange={(e) => updateAttack(idx, 'name', e.target.value)}
                        />
                        <input
                            style={{ flex: 1 }} type="text" placeholder="+5"
                            value={atk.bonus} onChange={(e) => updateAttack(idx, 'bonus', e.target.value)}
                        />
                        <input
                            style={{ flex: 1.5 }} type="text" placeholder="1d4"
                            value={atk.damage} onChange={(e) => updateAttack(idx, 'damage', e.target.value)}
                        />
                        <input
                            style={{ flex: 1.5 }} type="text" placeholder="Piercing"
                            value={atk.type} onChange={(e) => updateAttack(idx, 'type', e.target.value)}
                        />
                        <button className="btn-danger-icon" onClick={() => removeAttack(idx)}>✕</button>
                    </div>
                ))}

                {data.attacks.length === 0 && <p className="empty-state">No attacks added.</p>}
            </div>

            <div className="actions-controls">
                <button className="btn btn-primary" onClick={handleAddCustomAttack}>+ Add Custom Attack</button>

                <div className="api-search-container">
                    <input
                        type="text"
                        placeholder="Search API for Weapon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && <span className="loading-spinner">↺</span>}

                    {searchResults.length > 0 && (
                        <ul className="search-dropdown glass-panel">
                            {searchResults.map(res => (
                                <li key={res.index} onClick={() => handleSelectOfficialWeapon(res.index)}>
                                    {res.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

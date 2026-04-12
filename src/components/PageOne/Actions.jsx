import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchEquipment, fetchEquipmentDetails, searchList } from '../../services/dndApi';
import { ApiSearchDropdown } from '../shared/ApiSearchDropdown';

export const Actions = () => {
    const data = useCharacterStore(state => state.character.combat);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data: equipmentList } = useQuery({
        queryKey: ['equipment'],
        queryFn: fetchEquipment
    });

    useEffect(() => {
        if (searchQuery.length > 0 && equipmentList) {
            setSearchResults(searchList(equipmentList, searchQuery));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, equipmentList]);

    const handleAddCustomAttack = () => {
        updateNestedField('combat', 'attacks', [
            ...data.attacks,
            { id: crypto.randomUUID(), name: '', bonus: '', damage: '', type: '' }
        ]);
    };

    const handleSelectOfficialWeapon = async (weaponIndex) => {
        setIsSearching(true);
        try {
            const details = await fetchEquipmentDetails(weaponIndex);
            if (details) {
                updateNestedField('combat', 'attacks', [
                    ...data.attacks,
                    {
                        name: details.name,
                        bonus: '',
                        damage: details.damage?.damage_dice || '',
                        type: details.damage?.damage_type?.name || ''
                    }
                ]);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Failed to fetch weapon details:", err);
        } finally {
            setIsSearching(false);
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
            <div className="box-title flex-between attacks-title">
                <h3>Attacks & Spellcasting</h3>
            </div>

            <div className="attacks-list">
                {data.attacks.length > 0 && (
                    <div className="attacks-header-row">
                        <span>Name</span>
                        <span>Bonus</span>
                        <span>Damage</span>
                        <span>Type</span>
                        <span></span>
                    </div>
                )}

                {data.attacks.map((atk, idx) => (
                    <div key={atk.id || idx} className="attack-row">
                        <input type="text" placeholder="Dagger"
                            value={atk.name} onChange={(e) => updateAttack(idx, 'name', e.target.value)}
                        />
                        <input type="text" placeholder="+5"
                            value={atk.bonus} onChange={(e) => updateAttack(idx, 'bonus', e.target.value)}
                        />
                        <input type="text" placeholder="1d4"
                            value={atk.damage} onChange={(e) => updateAttack(idx, 'damage', e.target.value)}
                        />
                        <input type="text" placeholder="Piercing"
                            value={atk.type} onChange={(e) => updateAttack(idx, 'type', e.target.value)}
                        />
                        <button className="btn-danger-icon" onClick={() => removeAttack(idx)} aria-label="Remove attack">✕</button>
                    </div>
                ))}

                {data.attacks.length === 0 && <p className="empty-state">No attacks added.</p>}
            </div>

            <div className="actions-controls">
                <button className="btn btn-primary" onClick={handleAddCustomAttack}>+ Add Custom Attack</button>
                <ApiSearchDropdown
                    placeholder="Search API for Weapon..."
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    results={searchResults}
                    isLoading={isSearching}
                    onSelect={handleSelectOfficialWeapon}
                />
            </div>
        </div>
    );
};

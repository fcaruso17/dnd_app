import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchEquipment, fetchEquipmentDetails, searchList } from '../../services/dndApi';
import { ApiSearchDropdown } from '../shared/ApiSearchDropdown';

const CURRENCIES = [
    { key: 'cp', label: 'CP' },
    { key: 'sp', label: 'SP' },
    { key: 'ep', label: 'EP' },
    { key: 'gp', label: 'GP' },
    { key: 'pp', label: 'PP' },
];

export const Inventory = () => {
    const data = useCharacterStore(state => state.character.inventory);
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

    const handleSelectEquipment = async (itemIndex) => {
        setIsSearching(true);
        try {
            const details = await fetchEquipmentDetails(itemIndex);
            if (details) {
                const updatedEquip = data.equipment ? `${data.equipment}\n${details.name}` : details.name;
                updateNestedField('inventory', 'equipment', updatedEquip);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Failed to fetch equipment details:", err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="glass-panel inventory-container">
            <div className="currency-box">
                {CURRENCIES.map(({ key, label }) => (
                    <div key={key} className="currency-row">
                        <input
                            type="number"
                            value={data[key]}
                            onChange={(e) => updateNestedField('inventory', key, parseInt(e.target.value) || 0)}
                        />
                        <span className={`${key}-label`}>{label}</span>
                    </div>
                ))}
            </div>

            <div className="equipment-box">
                <label>Equipment List</label>
                <textarea
                    value={data.equipment}
                    onChange={(e) => updateNestedField('inventory', 'equipment', e.target.value)}
                    rows={12}
                />
            </div>

            <div className="inventory-search-wrapper">
                <ApiSearchDropdown
                    placeholder="Search API for Armor/Gear..."
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    results={searchResults}
                    isLoading={isSearching}
                    onSelect={handleSelectEquipment}
                />
            </div>
        </div>
    );
};

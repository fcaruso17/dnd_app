import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchEquipment, fetchEquipmentDetails, searchList } from '../../services/dndApi';

export const Inventory = () => {
    const data = useCharacterStore(state => state.character.inventory);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const [equipmentList, setEquipmentList] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchEquipment().then(list => setEquipmentList(list));
    }, []);

    useEffect(() => {
        if (searchQuery.length > 1) {
            setSearchResults(searchList(equipmentList, searchQuery));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, equipmentList]);

    const handleSelectEquipment = async (itemIndex) => {
        setIsSearching(true);
        const details = await fetchEquipmentDetails(itemIndex);
        setIsSearching(false);

        if (details) {
            const currentEquip = data.equipment;
            // Append name, and maybe weight or generic property if useful, but just name is safe
            const newEntry = details.name;
            const updatedEquip = currentEquip ? `${currentEquip}\n${newEntry}` : newEntry;
            updateNestedField('inventory', 'equipment', updatedEquip);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleCurrencyChange = (type, value) => {
        updateNestedField('inventory', type, parseInt(value) || 0);
    };

    return (
        <div className="glass-panel inventory-container">
            <div className="currency-box">
                <div className="currency-row">
                    <input type="number" value={data.cp} onChange={(e) => handleCurrencyChange('cp', e.target.value)} />
                    <span className="cp-label">CP</span>
                </div>
                <div className="currency-row">
                    <input type="number" value={data.sp} onChange={(e) => handleCurrencyChange('sp', e.target.value)} />
                    <span className="sp-label">SP</span>
                </div>
                <div className="currency-row">
                    <input type="number" value={data.ep} onChange={(e) => handleCurrencyChange('ep', e.target.value)} />
                    <span className="ep-label">EP</span>
                </div>
                <div className="currency-row">
                    <input type="number" value={data.gp} onChange={(e) => handleCurrencyChange('gp', e.target.value)} />
                    <span className="gp-label">GP</span>
                </div>
                <div className="currency-row">
                    <input type="number" value={data.pp} onChange={(e) => handleCurrencyChange('pp', e.target.value)} />
                    <span className="pp-label">PP</span>
                </div>
            </div>

            <div className="equipment-box">
                <label>Equipment List</label>
                <textarea
                    value={data.equipment}
                    onChange={(e) => updateNestedField('inventory', 'equipment', e.target.value)}
                    rows={12}
                />
            </div>

            <div className="api-search-container" style={{ marginTop: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Search API for Armor/Gear..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && <span className="loading-spinner">↺</span>}

                {searchResults.length > 0 && (
                    <ul className="search-dropdown glass-panel">
                        {searchResults.map(res => (
                            <li key={res.index} onClick={() => handleSelectEquipment(res.index)}>
                                {res.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

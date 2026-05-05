import { useState, useRef, useMemo } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { countAttuned } from '../../utils/items';
import { ApiSearchDropdown } from '../shared/ApiSearchDropdown';
import { searchItems } from '../../services/itemsData';

const RARITY_COLORS = {
    common:    'rgba(160,160,170,0.7)',
    uncommon:  '#4ade80',
    rare:      '#38bdf8',
    'very rare': '#a78bfa',
    legendary: '#facc15',
    artifact:  '#fb7185',
};
const RARITY_LABELS = {
    common: 'COMM', uncommon: 'UNC', rare: 'RARE',
    'very rare': 'V.RARE', legendary: 'LEG', artifact: 'ART',
};
const FILTER_TYPES = ['All', 'Weapon', 'Armor', 'Gear', 'Tool'];
const CURRENCY_META = [
    { key: 'cp', label: 'cp', color: 'rgba(180,140,100,0.8)' },
    { key: 'sp', label: 'sp', color: 'rgba(200,200,215,0.85)' },
    { key: 'ep', label: 'ep', color: 'rgba(210,185,145,0.7)' },
    { key: 'gp', label: 'gp', color: '#d4af37' },
    { key: 'pp', label: 'pp', color: 'rgba(210,210,255,0.85)' },
];

export const WeaponsGear = () => {
    const inventory  = useCharacterStore(s => s.character.inventory);
    const update     = useCharacterStore(s => s.updateNestedField);
    const equipItem  = useCharacterStore(s => s.equipItem);

    const [filterType, setFilterType]   = useState('All');
    const [magicOnly, setMagicOnly]     = useState(false);
    const [expandedId, setExpandedId]   = useState(null);
    const [undoItem, setUndoItem]       = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customItem, setCustomItem] = useState({ name: '', type: 'Gear', rarity: 'common' });
    const undoTimer = useRef(null);

    const searchResults = useMemo(
        () => searchQuery.trim() ? searchItems(searchQuery) : [],
        [searchQuery]
    );

    const attunedCount = countAttuned(inventory.items);

    const updateItem = (id, patch) =>
        update('inventory', 'items', inventory.items.map(it => it.id === id ? { ...it, ...patch } : it));

    const deleteItem = (id) => {
        const item = inventory.items.find(i => i.id === id);
        update('inventory', 'items', inventory.items.filter(i => i.id !== id));
        setUndoItem(item);
        clearTimeout(undoTimer.current);
        undoTimer.current = setTimeout(() => setUndoItem(null), 3000);
    };

    const restoreItem = () => {
        if (!undoItem) return;
        update('inventory', 'items', [...inventory.items, undoItem]);
        setUndoItem(null);
        clearTimeout(undoTimer.current);
    };

    const addCustomItem = () => {
        if (!customItem.name.trim()) return;
        update('inventory', 'items', [
            ...inventory.items,
            {
                ...customItem,
                id: crypto.randomUUID(),
                quantity: 1,
                attuned: false,
                notes: '',
                equippedSlot: null,
                custom: true
            }
        ]);
        setCustomItem({ name: '', type: 'Gear', rarity: 'common' });
        setShowCustomForm(false);
    };

    const filteredItems = inventory.items.filter(item => {
        if (filterType !== 'All' && item.type?.toLowerCase() !== filterType.toLowerCase()) return false;
        if (magicOnly && (!item.rarity || item.rarity === 'common')) return false;
        return true;
    });

    return (
        <div className="weapons-gear glass-panel">
            <div className="wg-header">
                <span className="wg-title">WEAPONS & GEAR ({inventory.items.length})</span>
                <div className="wg-header-meta">
                    <ApiSearchDropdown
                        placeholder="+ Database search..."
                        query={searchQuery}
                        onQueryChange={setSearchQuery}
                        results={searchResults}
                        isLoading={false}
                        onSelect={item => {
                            update('inventory', 'items', [
                                ...inventory.items,
                                { ...item, id: crypto.randomUUID(), quantity: 1, attuned: false, notes: '', equippedSlot: null }
                            ]);
                            setSearchQuery('');
                        }}
                    />
                    <button
                        className="wg-custom-item-btn pressable"
                        onClick={() => setShowCustomForm(!showCustomForm)}
                        aria-label={showCustomForm ? 'Close custom item form' : 'Add custom item'}
                        title="Add a custom item"
                    >
                        + Custom
                    </button>
                </div>
            </div>

            <div className="wg-currency-row">
                {CURRENCY_META.map(({ key, label, color }) => (
                    <div key={key} className="wg-currency-field">
                        <input
                            type="number"
                            className="wg-currency-input tabular"
                            value={inventory[key]}
                            onChange={e => update('inventory', key, Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            aria-label={`${label} currency`}
                            style={{ color }}
                        />
                        <span className="wg-currency-label" style={{ color }}>{label.toUpperCase()}</span>
                    </div>
                ))}
            </div>

            {showCustomForm && (
                <div className="wg-custom-form">
                    <input
                        type="text"
                        placeholder="Item name (required)"
                        value={customItem.name}
                        onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && addCustomItem()}
                        className="wg-custom-input"
                        aria-label="Item name"
                    />
                    <select
                        value={customItem.type}
                        onChange={e => setCustomItem({ ...customItem, type: e.target.value })}
                        className="wg-custom-select"
                        aria-label="Item type"
                    >
                        <option value="Weapon">Weapon</option>
                        <option value="Armor">Armor</option>
                        <option value="Gear">Gear</option>
                        <option value="Tool">Tool</option>
                    </select>
                    <select
                        value={customItem.rarity}
                        onChange={e => setCustomItem({ ...customItem, rarity: e.target.value })}
                        className="wg-custom-select"
                        aria-label="Item rarity"
                    >
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="very rare">Very Rare</option>
                        <option value="legendary">Legendary</option>
                        <option value="artifact">Artifact</option>
                    </select>
                    <div className="wg-custom-actions">
                        <button className="wg-custom-save pressable" onClick={addCustomItem} disabled={!customItem.name.trim()}>
                            Add
                        </button>
                        <button className="wg-custom-cancel pressable" onClick={() => {
                            setShowCustomForm(false);
                            setCustomItem({ name: '', type: 'Gear', rarity: 'common' });
                        }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="wg-filters-row">
                <div className="wg-filters">
                    {FILTER_TYPES.map(t => (
                        <button
                            key={t}
                            className={`wg-filter-chip pressable${filterType === t ? ' wg-filter-chip--active' : ''}`}
                            onClick={() => setFilterType(t)}
                        >{t}</button>
                    ))}
                    <button
                        className={`wg-filter-chip pressable${magicOnly ? ' wg-filter-chip--active' : ''}`}
                        onClick={() => setMagicOnly(!magicOnly)}
                        aria-label={magicOnly ? 'Magic items filter on. Click to show all items.' : 'Magic items filter off. Click to show magic items only.'}
                    >
                        Magic
                    </button>
                </div>
                <div className={`wg-attunement-card${attunedCount >= 3 ? ' wg-attunement-card--full' : ''}`}>
                    <span className="wg-attunement-label">ATTUNED</span>
                    <span className="wg-attunement-count">{attunedCount}/3</span>
                </div>
            </div>

            <div className="wg-item-list">
                {filteredItems.length === 0 && (
                    <div className="wg-empty">No items. Use + Add Item to search.</div>
                )}
                {filteredItems.map(item => {
                    const isEquippedWeapon = item.type === 'weapon' && item.equippedSlot;
                    const isOpen = expandedId === item.id;
                    const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;

                    return (
                        <div key={item.id} className={`wg-item${isEquippedWeapon ? ' wg-item--equipped' : ''}${isOpen ? ' wg-item--open' : ''}`}>
                            <div
                                className="wg-item-row pressable"
                                onClick={() => setExpandedId(isOpen ? null : item.id)}
                            >
                                <span className="wg-item-qty tabular">{item.quantity || 1}</span>
                                <span className="wg-item-name">{item.name}</span>
                                {item.equippedSlot && (
                                    <span className="wg-item-slot">{item.equippedSlot.toUpperCase()}</span>
                                )}
                                {item.rarity && item.rarity !== 'common' && (
                                    <span className="wg-item-rarity" style={{ color: rarityColor }}>
                                        {RARITY_LABELS[item.rarity] || item.rarity.toUpperCase()}
                                    </span>
                                )}
                                {item.attuned && (
                                    <span className="wg-item-attune-badge">✦ ATTUNED</span>
                                )}
                                <span className="wg-item-chevron">{isOpen ? '∨' : '›'}</span>
                            </div>


                            {isOpen && (
                                <div className="wg-item-detail expand-animate">
                                    {item.requiresAttunement && (
                                        <div className="wg-item-attunement-banner">⚠️ Requires Attunement</div>
                                    )}
                                    {item.description && <p className="wg-item-desc">{item.description}</p>}
                                    {item.type === 'weapon' && (
                                        <div className="wg-item-stats">
                                            <div className="wg-stat-row">
                                                <span className="wg-stat-label">Damage:</span>
                                                <span className="wg-stat-value">{item.damage} ({item.damageType})</span>
                                            </div>
                                            {item.damageVersatile && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Versatile:</span>
                                                    <span className="wg-stat-value">{item.damageVersatile}</span>
                                                </div>
                                            )}
                                            {item.range && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Range:</span>
                                                    <span className="wg-stat-value">{item.range}</span>
                                                </div>
                                            )}
                                            {item.properties && item.properties.length > 0 && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Properties:</span>
                                                    <span className="wg-stat-value">{item.properties.join(', ')}</span>
                                                </div>
                                            )}
                                            {item.ability && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Ability:</span>
                                                    <span className="wg-stat-value">{item.ability.toUpperCase()}</span>
                                                </div>
                                            )}
                                            {item.category && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Category:</span>
                                                    <span className="wg-stat-value">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                                                </div>
                                            )}
                                            {item.mastery && (
                                                <div className="wg-stat-row">
                                                    <span className="wg-stat-label">Mastery:</span>
                                                    <span className="wg-stat-value">{item.mastery}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="wg-item-controls">
                                        <label className="wg-item-qty-label">
                                            Qty
                                            <input type="number" className="tabular" min="0"
                                                value={item.quantity || 1}
                                                onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                            />
                                        </label>
                                        {item.type === 'weapon' && (
                                            <div className="wg-equip-slots">
                                                {[
                                                    { key: 'main',       label: 'Main Hand' },
                                                    { key: 'off',        label: 'Off Hand'  },
                                                    { key: 'two-handed', label: '2H'        },
                                                ].map(({ key, label }) => (
                                                    <button key={key}
                                                        className={`wg-slot-btn pressable${item.equippedSlot === key ? ' wg-slot-btn--active' : ''}`}
                                                        onClick={() => {
                                                            if (item.equippedSlot === key) {
                                                                updateItem(item.id, { equippedSlot: null });
                                                            } else {
                                                                equipItem(item.id, key, false);
                                                            }
                                                        }}
                                                    >{label}</button>
                                                ))}
                                            </div>
                                        )}
                                        <label className="wg-attune-toggle">
                                            <input type="checkbox" checked={item.attuned || false}
                                                onChange={e => updateItem(item.id, { attuned: e.target.checked })}
                                            />
                                            Attune
                                        </label>
                                        <textarea
                                            className="wg-item-notes"
                                            value={item.notes || ''}
                                            onChange={e => updateItem(item.id, { notes: e.target.value })}
                                            placeholder="notes…"
                                            rows={2}
                                        />
                                        <button className="wg-delete-btn pressable"
                                            onClick={() => { deleteItem(item.id); setExpandedId(null); }}
                                        >Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>


            {undoItem && (
                <div className="wg-undo-toast">
                    <span>Deleted {undoItem.name}</span>
                    <button className="pressable" onClick={restoreItem}>Undo</button>
                </div>
            )}
        </div>
    );
};

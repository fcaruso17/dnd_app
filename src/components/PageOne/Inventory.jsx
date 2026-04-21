import { useState, useEffect, useRef, useMemo } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { searchItems } from '../../services/itemsData';
import { countAttuned } from '../../utils/items';
import { ApiSearchDropdown } from '../shared/ApiSearchDropdown';
import { ItemRow } from './ItemRow';
import { AttunementCounter } from './AttunementCounter';
import { ArmorTraining } from './ArmorTraining';

const CURRENCIES = [
    { key: 'cp', label: 'CP' },
    { key: 'sp', label: 'SP' },
    { key: 'ep', label: 'EP' },
    { key: 'gp', label: 'GP' },
    { key: 'pp', label: 'PP' },
];

const TYPE_FILTERS = [
    { key: 'all',    label: 'All' },
    { key: 'weapon', label: 'Weapon' },
    { key: 'armor',  label: 'Armor' },
    { key: 'gear',   label: 'Gear' },
    { key: 'tool',   label: 'Tool' },
];

const UNDO_MS = 3000;

export const Inventory = () => {
    const inventory = useCharacterStore(state => state.character.inventory);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const [expandedRow, setExpandedRow] = useState(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [magicOnly, setMagicOnly] = useState(false);

    const [dbQuery, setDbQuery] = useState('');
    const [dbResults, setDbResults] = useState([]);
    const [dbPickerOpen, setDbPickerOpen] = useState(false);

    // Single-toast undo: { item, index, timerId } | null. New delete replaces the previous.
    const [undo, setUndo] = useState(null);

    const containerRef = useRef(null);

    // Close expanded row on click outside panel.
    useEffect(() => {
        if (!expandedRow) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setExpandedRow(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [expandedRow]);

    // Close expanded row + dismiss undo on Escape.
    useEffect(() => {
        const handler = (e) => {
            if (e.key !== 'Escape') return;
            if (expandedRow) setExpandedRow(null);
            if (undo) dismissUndo();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedRow, undo]);

    // DB search updates.
    useEffect(() => {
        if (!dbPickerOpen) {
            setDbResults([]);
            return;
        }
        setDbResults(searchItems(dbQuery));
    }, [dbQuery, dbPickerOpen]);

    // Clean up undo timer on unmount.
    useEffect(() => () => { if (undo?.timerId) clearTimeout(undo.timerId); }, [undo]);

    const visibleItems = useMemo(() => {
        const q = filterQuery.toLowerCase().trim();
        return (inventory.items || []).filter(i => {
            if (typeFilter !== 'all' && i.type !== typeFilter) return false;
            if (magicOnly && i.rarity == null) return false;
            if (q && !i.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [inventory.items, filterQuery, typeFilter, magicOnly]);

    const attunedCount = countAttuned(inventory.items);

    const setItems = (nextItems) => updateNestedField('inventory', 'items', nextItems);

    const addRow = (row, { expand = false } = {}) => {
        const next = [...(inventory.items || []), row];
        setItems(next);
        if (expand) setExpandedRow(row.id);
    };

    const addFromDb = (dbEntry) => {
        addRow({
            id: crypto.randomUUID(),
            name: dbEntry.name,
            quantity: 1,
            type: dbEntry.type,
            rarity: dbEntry.rarity ?? null,
            attuned: false,
            description: dbEntry.description || '',
            notes: '',
            custom: false,
        });
        setDbQuery('');
        setDbPickerOpen(false);
    };

    const addCustom = (prefillName = '') => {
        const row = {
            id: crypto.randomUUID(),
            name: prefillName,
            quantity: 1,
            type: 'gear',
            rarity: null,
            attuned: false,
            description: '',
            notes: '',
            custom: true,
        };
        addRow(row, { expand: true });
        setFilterQuery('');
    };

    const dismissUndo = () => {
        if (undo?.timerId) clearTimeout(undo.timerId);
        setUndo(null);
    };

    const handleDelete = (item) => {
        const items = inventory.items || [];
        const idx = items.findIndex(i => i.id === item.id);
        if (idx === -1) return;

        setItems(items.filter(i => i.id !== item.id));
        if (expandedRow === item.id) setExpandedRow(null);

        if (undo?.timerId) clearTimeout(undo.timerId);
        const timerId = setTimeout(() => setUndo(null), UNDO_MS);
        setUndo({ item, index: idx, timerId });
    };

    const handleUndo = () => {
        if (!undo) return;
        const items = inventory.items || [];
        const restored = [...items];
        const insertAt = Math.min(undo.index, restored.length);
        restored.splice(insertAt, 0, undo.item);
        setItems(restored);
        dismissUndo();
    };

    // Arrow-key roving-tabindex within filter chips group.
    const chipRefs = useRef({});
    const onChipKeyDown = (e, idx) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx = (idx + delta + TYPE_FILTERS.length) % TYPE_FILTERS.length;
        const nextKey = TYPE_FILTERS[nextIdx].key;
        setTypeFilter(nextKey);
        chipRefs.current[nextKey]?.focus();
    };

    const filterMatchesNothing = visibleItems.length === 0 && filterQuery.trim() !== '';

    return (
        <div className="glass-panel inventory-container" ref={containerRef}>
            <div className="inventory-top-row">
                <div className="currency-box">
                    {CURRENCIES.map(({ key, label }) => (
                        <label key={key} className="currency-row">
                            <input
                                type="number"
                                value={inventory[key]}
                                onChange={(e) => updateNestedField('inventory', key, parseInt(e.target.value, 10) || 0)}
                                aria-label={`${label} currency`}
                            />
                            <span className={`${key}-label`}>{label}</span>
                        </label>
                    ))}
                </div>
                <AttunementCounter count={attunedCount} />
            </div>

            <ArmorTraining />

            <div className="inventory-filter-row">
                <input
                    type="text"
                    className="inventory-filter-input"
                    placeholder="Filter your items…"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    aria-label="Filter owned items by name"
                />
                <button
                    type="button"
                    className="inventory-action-btn"
                    onClick={() => setDbPickerOpen(o => !o)}
                    aria-expanded={dbPickerOpen}
                    aria-controls="inventory-db-picker"
                    aria-label="Add item from database"
                >
                    + Add from DB
                </button>
                <button
                    type="button"
                    className="inventory-action-btn"
                    onClick={() => addCustom('')}
                    aria-label="Add custom item"
                >
                    + Custom
                </button>
            </div>

            {dbPickerOpen && (
                <div className="inventory-db-picker" id="inventory-db-picker">
                    <ApiSearchDropdown
                        placeholder="Search the items database…"
                        query={dbQuery}
                        onQueryChange={setDbQuery}
                        results={dbResults.map((it, idx) => ({
                            index: String(idx),
                            name: it.rarity ? `${it.name} [${it.rarity}]` : it.name,
                        }))}
                        isLoading={false}
                        onSelect={(idxStr) => {
                            const picked = dbResults[Number(idxStr)];
                            if (picked) addFromDb(picked);
                        }}
                    />
                </div>
            )}

            <div
                className="items-filter-chips"
                role="radiogroup"
                aria-label="Item type"
            >
                {TYPE_FILTERS.map(({ key, label }, idx) => (
                    <button
                        key={key}
                        type="button"
                        ref={(el) => { chipRefs.current[key] = el; }}
                        className={`items-filter-chip${typeFilter === key ? ' items-filter-chip--active' : ''}`}
                        role="radio"
                        aria-checked={typeFilter === key}
                        tabIndex={typeFilter === key ? 0 : -1}
                        onClick={() => setTypeFilter(key)}
                        onKeyDown={(e) => onChipKeyDown(e, idx)}
                    >
                        {label}
                    </button>
                ))}
                <button
                    type="button"
                    className={`items-filter-chip items-filter-chip--magic${magicOnly ? ' items-filter-chip--active' : ''}`}
                    aria-pressed={magicOnly}
                    onClick={() => setMagicOnly(v => !v)}
                >
                    Magic only
                </button>
            </div>

            <div className="items-list">
                {visibleItems.length === 0 && !filterMatchesNothing && (
                    <div className="items-list-empty">No items yet.</div>
                )}
                {filterMatchesNothing && (
                    <div className="items-list-empty">
                        No matches.{' '}
                        <button
                            type="button"
                            className="items-list-empty-action"
                            onClick={() => addCustom(filterQuery)}
                        >
                            + Add "{filterQuery}" as custom
                        </button>
                    </div>
                )}
                {visibleItems.map(item => (
                    <ItemRow
                        key={item.id}
                        item={item}
                        isExpanded={expandedRow === item.id}
                        onToggleExpand={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {undo && (
                <div className="undo-toast" role="status" aria-live="polite">
                    <span>Deleted "{undo.item.name}"</span>
                    <button
                        type="button"
                        onClick={handleUndo}
                        aria-label={`Undo delete ${undo.item.name}`}
                    >
                        Undo
                    </button>
                </div>
            )}
        </div>
    );
};

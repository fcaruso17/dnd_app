import { useCharacterStore } from '../../store/useCharacterStore';
import {
    RARITY_LABELS,
    rarityVarKey,
    isMagicItem,
    hasCustomization,
    clampQuantity,
} from '../../utils/items';

// Keeps render isolation: this row only re-renders when its own fields in the
// inventory.items array change, not on unrelated inventory edits.
export const ItemRow = ({ item, isExpanded, onToggleExpand, onDelete }) => {
    const items = useCharacterStore(state => state.character.inventory.items);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);

    const patchItem = (patch) => {
        const next = items.map(i => (i.id === item.id ? { ...i, ...patch } : i));
        updateNestedField('inventory', 'items', next);
    };

    const setQuantity = (n) => patchItem({ quantity: clampQuantity(n) });
    const bumpQuantity = (delta) => setQuantity((item.quantity || 1) + delta);

    const magic = isMagicItem(item);
    const rarityKey = magic ? rarityVarKey(item.rarity) : null;
    const rarityLabel = magic ? RARITY_LABELS[item.rarity] : null;
    const customized = hasCustomization(item);

    const attunedSuffix = item.attuned ? ', attuned' : '';
    const ariaLabel = magic
        ? `${item.name}, ${rarityLabel}${attunedSuffix} — click to ${isExpanded ? 'collapse' : 'expand'}`
        : `${item.name}${attunedSuffix} — click to ${isExpanded ? 'collapse' : 'expand'}`;
    const detailsId = `item-details-${item.id}`;

    return (
        <div className={`item-row${isExpanded ? ' item-row--expanded' : ''}`}>
            <div className="item-row-main">
                <span className="item-row-qty" aria-hidden="true">{item.quantity || 1}</span>
                <button
                    type="button"
                    className="item-row-toggle"
                    onClick={onToggleExpand}
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    aria-label={ariaLabel}
                >
                    <span className="item-row-name">{item.name}</span>
                    {magic && (
                        <span
                            className="rarity-chip"
                            style={{
                                background: `color-mix(in srgb, var(--rarity-${rarityKey}) 22%, transparent)`,
                                color: `var(--rarity-${rarityKey})`,
                            }}
                            aria-hidden="true"
                        >
                            {rarityLabel}
                        </span>
                    )}
                    {item.attuned && (
                        <span className="item-row-attuned-star" aria-hidden="true">★</span>
                    )}
                    {customized && <span className="item-row-customization-dot" aria-hidden="true" />}
                    <span className="item-row-chevron" aria-hidden="true">›</span>
                </button>
            </div>

            {isExpanded && (
                <div className="item-row-details" id={detailsId}>
                    <label className="item-row-field item-row-field--wide">
                        <span>Description</span>
                        <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => patchItem({ description: e.target.value })}
                            placeholder="What does it do?"
                            aria-label={`Description of ${item.name}`}
                        />
                    </label>
                    <label className="item-row-field item-row-field--wide">
                        <span>Notes</span>
                        <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => patchItem({ notes: e.target.value })}
                            placeholder="e.g. Left pouch, 3 charges"
                            aria-label={`Notes for ${item.name}`}
                        />
                    </label>

                    <div className="item-row-controls">
                        <div className="item-row-qty-stepper" role="group" aria-label={`Quantity of ${item.name}`}>
                            <button
                                type="button"
                                onClick={() => bumpQuantity(-1)}
                                disabled={(item.quantity || 1) <= 1}
                                aria-label={`Decrease quantity of ${item.name}`}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min={1}
                                value={item.quantity || 1}
                                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                                aria-label={`Quantity of ${item.name}`}
                            />
                            <button
                                type="button"
                                onClick={() => bumpQuantity(1)}
                                aria-label={`Increase quantity of ${item.name}`}
                            >
                                +
                            </button>
                        </div>

                        {magic && (
                            <label className="item-row-attune-toggle">
                                <input
                                    type="checkbox"
                                    checked={item.attuned === true}
                                    onChange={(e) => patchItem({ attuned: e.target.checked })}
                                    aria-label={`Attune ${item.name}`}
                                />
                                <span>Attuned</span>
                            </label>
                        )}

                        <button
                            type="button"
                            className="item-row-delete"
                            onClick={() => onDelete(item)}
                            aria-label={`Delete ${item.name}`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

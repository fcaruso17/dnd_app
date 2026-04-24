import { useCharacterStore } from '../../store/useCharacterStore';
import { getWeaponStats } from '../../utils/weapons';
import {
    RARITY_LABELS,
    rarityVarKey,
    isMagicItem,
    hasCustomization,
    clampQuantity,
} from '../../utils/items';

const EQUIP_SLOTS = [
    { key: 'main',        label: 'Main Hand' },
    { key: 'off',         label: 'Off Hand'  },
    { key: 'two-handed',  label: '2H'        },
];

// This component re-renders only when its own item's fields change,
// not on unrelated inventory edits, preserving render isolation.
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
    const weaponStats = item.type === 'weapon' ? getWeaponStats(item.name) : null;

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

            {/* Equip slot chips — weapons only, always visible */}
            {item.type === 'weapon' && (
                <div className="equip-slot-chips" role="group" aria-label={`Equip ${item.name}`}>
                    {EQUIP_SLOTS.map(({ key, label }) => {
                        const isTwoHanded = key === 'two-handed';
                        const disabled = isTwoHanded && weaponStats != null &&
                            !weaponStats.properties.includes('Two-Handed') &&
                            !weaponStats.properties.includes('Versatile');
                        return (
                            <button
                                key={key}
                                type="button"
                                className={[
                                    'equip-slot-chip',
                                    item.equippedSlot === key ? 'equip-slot-chip--active' : '',
                                    disabled ? 'equip-slot-chip--disabled' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => patchItem({ equippedSlot: item.equippedSlot === key ? null : key })}
                                disabled={disabled}
                                aria-pressed={item.equippedSlot === key}
                                aria-label={item.equippedSlot === key ? `Unequip from ${label}` : `Equip to ${label}`}
                                title={item.equippedSlot === key ? 'Click to unequip' : undefined}
                            >
                                {item.equippedSlot === key ? `✕ ${label}` : label}
                            </button>
                        );
                    })}
                </div>
            )}

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

                    {/* Magic bonus stepper — weapons only */}
                    {item.type === 'weapon' && (
                        <div className="item-row-field">
                            <span>Magic Bonus</span>
                            <div className="item-row-qty-stepper" role="group" aria-label={`Magic bonus for ${item.name}`}>
                                <button
                                    type="button"
                                    onClick={() => patchItem({ magicBonus: Math.max(0, (item.magicBonus || 0) - 1) })}
                                    disabled={(item.magicBonus || 0) <= 0}
                                    aria-label="Decrease magic bonus"
                                >
                                    −
                                </button>
                                <span className="magic-bonus-display">+{item.magicBonus || 0}</span>
                                <button
                                    type="button"
                                    onClick={() => patchItem({ magicBonus: Math.min(3, (item.magicBonus || 0) + 1) })}
                                    disabled={(item.magicBonus || 0) >= 3}
                                    aria-label="Increase magic bonus"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Ability override — Finesse weapons only */}
                    {item.type === 'weapon' && weaponStats?.ability === 'finesse' && (
                        <div className="item-row-field">
                            <span>Attack with</span>
                            <div className="finesse-toggle" role="group" aria-label={`Ability for ${item.name}`}>
                                {['str', 'dex'].map(ability => (
                                    <button
                                        key={ability}
                                        type="button"
                                        className={`finesse-toggle-btn${(item.abilityOverride ?? 'str') === ability ? ' finesse-toggle-btn--active' : ''}`}
                                        onClick={() => patchItem({ abilityOverride: ability })}
                                        aria-pressed={(item.abilityOverride ?? 'str') === ability}
                                    >
                                        {ability.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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

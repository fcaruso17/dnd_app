import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';

export const FeatureAndTraits = () => {
    const traits = useCharacterStore(state => state.character.traits);
    const details = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const [newFeature, setNewFeature] = useState('');
    const [showAddFeature, setShowAddFeature] = useState(false);

    const features = details.additionalFeatures
        ? details.additionalFeatures.split('\n').filter(f => f.trim())
        : [];

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            const updated = features.length > 0
                ? details.additionalFeatures + '\n' + newFeature
                : newFeature;
            updateNestedField('details', 'additionalFeatures', updated);
            setNewFeature('');
            setShowAddFeature(false);
        }
    };

    const handleDeleteFeature = (index) => {
        const updated = features
            .filter((_, i) => i !== index)
            .join('\n');
        updateNestedField('details', 'additionalFeatures', updated);
    };

    return (
        <div className="character-traits-section">
            <div className="traits-grid">
                <div className="trait-box">
                    <label htmlFor="input-personality">Personality Traits</label>
                    <textarea
                        id="input-personality"
                        value={traits.personality}
                        onChange={(e) => updateNestedField('traits', 'personality', e.target.value)}
                        rows={5}
                        placeholder="What are your defining personality traits?"
                    />
                </div>
                <div className="trait-box">
                    <label htmlFor="input-ideals">Ideals</label>
                    <textarea
                        id="input-ideals"
                        value={traits.ideals}
                        onChange={(e) => updateNestedField('traits', 'ideals', e.target.value)}
                        rows={5}
                        placeholder="What are your guiding principles?"
                    />
                </div>
                <div className="trait-box">
                    <label htmlFor="input-bonds">Bonds</label>
                    <textarea
                        id="input-bonds"
                        value={traits.bonds}
                        onChange={(e) => updateNestedField('traits', 'bonds', e.target.value)}
                        rows={5}
                        placeholder="What are your connections to others?"
                    />
                </div>
                <div className="trait-box">
                    <label htmlFor="input-flaws">Flaws</label>
                    <textarea
                        id="input-flaws"
                        value={traits.flaws}
                        onChange={(e) => updateNestedField('traits', 'flaws', e.target.value)}
                        rows={5}
                        placeholder="What are your weaknesses or character flaws?"
                    />
                </div>
            </div>

            <div className="features-traits-list">
                <div className="features-traits-header">
                    <h4>Features & Traits</h4>
                    <button
                        className="btn-add-feature"
                        onClick={() => setShowAddFeature(!showAddFeature)}
                        title="Add new feature or trait"
                    >
                        + Add
                    </button>
                </div>

                {showAddFeature && (
                    <div className="add-feature-input">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                            placeholder="New feature or trait..."
                            autoFocus
                        />
                        <button
                            className="btn-save"
                            onClick={handleAddFeature}
                        >
                            Save
                        </button>
                        <button
                            className="btn-cancel"
                            onClick={() => {
                                setShowAddFeature(false);
                                setNewFeature('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {features.length > 0 ? (
                    <ul className="features-list">
                        {features.map((feature, idx) => (
                            <li key={idx} className="feature-item">
                                <span>{feature}</span>
                                <button
                                    className="btn-delete-feature"
                                    onClick={() => handleDeleteFeature(idx)}
                                    title="Delete feature"
                                    aria-label={`Delete: ${feature}`}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="features-empty">No features or traits added yet</p>
                )}
            </div>
        </div>
    );
};

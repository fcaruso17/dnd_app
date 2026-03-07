import { useRef } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';

export const Appearance = () => {
    const data = useCharacterStore(state => state.character.details);
    const updateNestedField = useCharacterStore(state => state.updateNestedField);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit size if needed for heavy LocalStorage safety, but modern browsers can handle a few MBs
        if (file.size > 2 * 1024 * 1024) {
            alert("Please choose an image smaller than 2MB to keep the save file fast!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            updateNestedField('details', 'portraitBase64', event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const removePortrait = () => {
        updateNestedField('details', 'portraitBase64', null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    return (
        <div className="glass-panel appearance-container">
            <h3>Appearance</h3>
            <div className="appearance-grid">
                <label className="input-group">
                    <span>Age</span>
                    <input type="text" value={data.age} onChange={e => updateNestedField('details', 'age', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Height</span>
                    <input type="text" value={data.height} onChange={e => updateNestedField('details', 'height', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Weight</span>
                    <input type="text" value={data.weight} onChange={e => updateNestedField('details', 'weight', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Eyes</span>
                    <input type="text" value={data.eyes} onChange={e => updateNestedField('details', 'eyes', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Skin</span>
                    <input type="text" value={data.skin} onChange={e => updateNestedField('details', 'skin', e.target.value)} />
                </label>
                <label className="input-group">
                    <span>Hair</span>
                    <input type="text" value={data.hair} onChange={e => updateNestedField('details', 'hair', e.target.value)} />
                </label>
            </div>

            <div className="portrait-section">
                <span className="portrait-label">Character Portrait</span>
                <div className="portrait-box" onClick={() => !data.portraitBase64 && fileInputRef.current?.click()}>
                    {data.portraitBase64 ? (
                        <>
                            <img src={data.portraitBase64} alt="Character" className="portrait-img" />
                            <button className="btn-danger-icon remove-img-btn" onClick={removePortrait}>✕</button>
                        </>
                    ) : (
                        <div className="portrait-placeholder">
                            <span className="plus-icon">+</span>
                            <p>Click to Upload Image (JPEG/PNG)</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                </div>
            </div>
        </div>
    );
};

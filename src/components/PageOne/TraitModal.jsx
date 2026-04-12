import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const TraitModal = ({ label, value, onChange, onClose }) => {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return createPortal(
        <div className="trait-modal-backdrop" onClick={onClose}>
            <div className="trait-modal glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="trait-modal-header">
                    <h3>{label}</h3>
                    <button className="trait-modal-close" onClick={onClose} aria-label="Close modal">✕</button>
                </div>
                <textarea
                    className="trait-modal-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                    rows={14}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            </div>
        </div>,
        document.body
    );
};

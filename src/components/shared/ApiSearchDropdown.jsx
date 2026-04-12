import { useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const ApiSearchDropdown = ({ placeholder, query, onQueryChange, results, isLoading, onSelect }) => {
    const containerRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState(null);
    const showDropdown = isLoading || results.length > 0;

    useLayoutEffect(() => {
        if (showDropdown && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        }
    }, [showDropdown]);

    return (
        <div className="api-search-container" ref={containerRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
            />
            {isLoading && <span className="loading-spinner">↺</span>}
            <span
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
                aria-live="polite"
                aria-atomic="true"
            >
                {!isLoading && results.length > 0 ? `${results.length} results found` : ''}
            </span>
            {showDropdown && dropdownPos && createPortal(
                <ul
                    className="search-dropdown glass-panel"
                    style={{
                        position: 'absolute',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        zIndex: 9999,
                    }}
                >
                    {isLoading ? (
                        [1, 2, 3].map(n => <li key={n} className="skeleton-row" aria-hidden="true" />)
                    ) : (
                        results.map(res => (
                            <li key={res.index} onClick={() => onSelect(res.index)}>
                                {res.name}
                            </li>
                        ))
                    )}
                </ul>,
                document.body
            )}
        </div>
    );
};

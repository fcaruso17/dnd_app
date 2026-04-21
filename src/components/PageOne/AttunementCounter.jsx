// Presentational. Parent computes count via countAttuned(items) and passes it in.
// role="status" is stable so the live region exists before mutations — some
// screen readers drop the first announcement if the role appears with the change.
export const AttunementCounter = ({ count }) => {
    const over = count > 3;
    return (
        <div
            className={`attunement-counter${over ? ' attunement-counter--over' : ''}`}
            role="status"
            aria-live="polite"
        >
            <div className="attunement-counter-value">{count} / 3</div>
            <div className="attunement-counter-label">
                Attuned{over && <span className="sr-only"> — over attunement limit</span>}
            </div>
        </div>
    );
};

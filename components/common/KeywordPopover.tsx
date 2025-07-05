
import React from 'react';

interface KeywordPopoverProps {
  summary: string;
  onMoreInfoClick: () => void;
  position: { top: number; left: number };
  onClose: () => void;
}

const KeywordPopover: React.FC<KeywordPopoverProps> = ({ summary, onMoreInfoClick, position, onClose }) => {
    const popoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={popoverRef}
            className="fixed z-50 w-64 p-3 bg-slate-900 border border-indigo-500 rounded-lg shadow-2xl text-sm text-slate-200 animate-fade-in"
            style={{ top: position.top, left: position.left, transform: 'translateY(10px)' }}
        >
            <p>{summary}</p>
            <button
                onClick={onMoreInfoClick}
                className="mt-2 text-indigo-400 hover:underline font-semibold text-xs"
            >
                Learn More &rarr;
            </button>
        </div>
    );
};

export default KeywordPopover;

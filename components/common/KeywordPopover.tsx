import React from 'react';

interface KeywordPopoverProps {
  summary: string;
  onMoreInfoClick: () => void;
  onClose: () => void;
  style: React.CSSProperties;
}

const KeywordPopover = React.forwardRef<HTMLDivElement, KeywordPopoverProps>(({ summary, onMoreInfoClick, onClose, style }, ref) => {
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking another keyword
            if (target.nodeType === 1 && (target as HTMLElement).closest('[data-keyword="true"]')) {
                return;
            }
            if ((ref as React.RefObject<HTMLDivElement>)?.current && !(ref as React.RefObject<HTMLDivElement>)?.current?.contains(target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose, ref]);


    return (
        <div
            ref={ref}
            className="fixed z-50 w-64 p-3 bg-slate-900 border border-indigo-500 rounded-lg shadow-2xl text-sm text-slate-200 animate-pop-in"
            style={style}
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
});

export default KeywordPopover;

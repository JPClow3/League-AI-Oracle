import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface CopyInsightButtonProps {
  text: string;
  label?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

/**
 * Copy Insight Button Component
 * Standalone component for copying insights to clipboard
 * Shows toast feedback on copy
 */
export const CopyInsightButton = ({ text, label, variant = 'icon', className = '' }: CopyInsightButtonProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label || 'Copied'} to clipboard!`, { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        className={`flex items-center gap-2 ${className}`}
        aria-label={`Copy ${label || text}`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[32px] min-w-[32px] flex items-center justify-center ${className}`}
      aria-label={`Copy ${label || text}`}
      title={`Copy ${label || text}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-success" strokeWidth={2} />
      ) : (
        <Copy className="h-4 w-4" strokeWidth={2} />
      )}
    </button>
  );
};

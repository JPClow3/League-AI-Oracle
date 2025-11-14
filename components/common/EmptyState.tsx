/**
 * Empty State Component
 * Shows when there's no data to display with helpful guidance
 */

import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for when there's no content
 *
 * @example
 * <EmptyState
 *   icon={<Library size={48} className="text-text-secondary" />}
 *   title="No Strategies Yet"
 *   description="Save your first draft analysis to build your playbook!"
 *   action={{
 *     text: "Go to Strategy Forge",
 *     onClick: () => navigate('Strategy Forge')
 *   }}
 * />
 */
export const EmptyState = ({ icon, title, description, action, secondaryAction, className = '' }: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && <div className="mb-4 text-text-secondary opacity-50">{icon}</div>}

      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

      <p className="text-text-secondary max-w-md mb-6">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.text}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.text}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized empty state for search results
 */
export const EmptySearchResults = ({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    title="No Results Found"
    description={`No results match "${searchTerm}". Try different keywords or clear your search.`}
    action={{
      text: 'Clear Search',
      onClick: onClear,
      variant: 'secondary',
    }}
  />
);

/**
 * Specialized empty state for filtered lists
 */
export const EmptyFilterResults = ({ onReset }: { onReset: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
    }
    title="No Matches"
    description="No items match your current filters. Try adjusting your filter settings."
    action={{
      text: 'Reset Filters',
      onClick: onReset,
      variant: 'secondary',
    }}
  />
);

/**
 * Specialized empty state for new users
 */
export const EmptyStateFirstTime = ({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}) => (
  <EmptyState
    icon={
      <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    }
    title={title}
    description={description}
    action={{
      text: actionText,
      onClick: onAction,
      variant: 'primary',
    }}
  />
);

import React from 'react';
import type { Page } from '../../types';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const pageHierarchy: Record<Page, { parent?: Page; label: string }> = {
  Home: { label: 'Home' },
  'Strategy Forge': { label: 'Strategy Forge', parent: 'Home' },
  'Live Co-Pilot': { label: 'Live Co-Pilot', parent: 'Home' },
  'Draft Arena': { label: 'Draft Arena', parent: 'Home' },
  Archives: { label: 'Archives', parent: 'Home' },
  Academy: { label: 'Academy', parent: 'Home' },
  'Daily Challenge': { label: 'Daily Challenge', parent: 'Home' },
  'Draft Scenarios': { label: 'Draft Scenarios', parent: 'Home' },
  Armory: { label: 'Armory', parent: 'Home' },
  Oracle: { label: 'Meta Oracle', parent: 'Home' },
  Profile: { label: 'Profile', parent: 'Home' },
};

export const Breadcrumbs = ({ currentPage, onNavigate }: BreadcrumbsProps) => {
  const buildBreadcrumbPath = (page: Page): Page[] => {
    const path: Page[] = [page];
    let current = page;
    while (pageHierarchy[current]?.parent) {
      const parent = pageHierarchy[current]?.parent;
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(currentPage);

  // Don't show breadcrumbs on Home page or mobile
  if (currentPage === 'Home' || breadcrumbPath.length <= 1) {
    return null;
  }

  return (
    <nav
      className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mb-4"
      aria-label="Breadcrumb"
    >
      {breadcrumbPath.map((page, index) => {
        const isLast = index === breadcrumbPath.length - 1;
        const pageInfo = pageHierarchy[page];

        return (
          <React.Fragment key={page}>
            {index === 0 ? (
              <button
                onClick={() => onNavigate('Home')}
                className="flex items-center gap-1 hover:text-[hsl(var(--text-primary))] transition-colors"
                aria-label="Go to Home"
              >
                <Home className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => !isLast && onNavigate(page)}
                className={`transition-colors ${
                  isLast
                    ? 'text-[hsl(var(--text-primary))] font-medium cursor-default'
                    : 'hover:text-[hsl(var(--text-primary))]'
                }`}
                disabled={isLast}
                aria-current={isLast ? 'page' : undefined}
              >
                {pageInfo.label}
              </button>
            )}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

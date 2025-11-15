import React, { useState } from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Tooltip } from '../common/Tooltip';
import {
  Home,
  FlaskConical,
  Shield,
  User,
  Archive,
  GraduationCap,
  Target,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: {
    page: Page;
    label: string;
    icon: React.ReactNode;
  }[];
}

export const SidebarNav = ({ currentPage, setCurrentPage, isOpen, onClose }: SidebarNavProps) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['draft-tools', 'learning']));

  const sections: NavSection[] = [
    {
      title: 'Draft Tools',
      items: [
        { page: 'Strategy Forge', label: t('nav_strategy_forge'), icon: <FlaskConical className="h-5 w-5" /> },
        { page: 'Live Co-Pilot', label: t('nav_live_co_pilot'), icon: <Target className="h-5 w-5" /> },
        { page: 'Draft Arena', label: 'Draft Arena', icon: <Shield className="h-5 w-5" /> },
        { page: 'Archives', label: t('nav_archives'), icon: <Archive className="h-5 w-5" /> },
      ],
    },
    {
      title: 'Learning',
      items: [
        { page: 'Academy', label: t('nav_academy'), icon: <GraduationCap className="h-5 w-5" /> },
        { page: 'Daily Challenge', label: 'Daily Challenge', icon: <Target className="h-5 w-5" /> },
        { page: 'Draft Scenarios', label: 'Draft Scenarios', icon: <FileText className="h-5 w-5" /> },
      ],
    },
    {
      title: 'Resources',
      items: [
        { page: 'Armory', label: t('nav_armory'), icon: <Shield className="h-5 w-5" /> },
        { page: 'Oracle', label: 'Meta Oracle', icon: <FileText className="h-5 w-5" /> },
      ],
    },
    {
      title: 'Profile',
      items: [{ page: 'Profile', label: t('nav_profile'), icon: <User className="h-5 w-5" /> }],
    },
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  };

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <nav
      id="navigation"
      className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-[hsl(var(--bg-secondary))] border-r border-[hsl(var(--border))] z-30 overflow-y-auto"
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full p-4">
        {/* Home link at top */}
        <button
          onClick={() => handleNavClick('Home')}
          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors mb-4 ${
            currentPage === 'Home'
              ? 'bg-[hsl(var(--accent)_/_0.15)] text-[hsl(var(--accent))]'
              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))]'
          }`}
          aria-current={currentPage === 'Home' ? 'page' : undefined}
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">{t('nav_home')}</span>
        </button>

        {/* Collapsible sections */}
        <div className="flex flex-col gap-2">
          {sections.map(section => {
            const isExpanded = expandedSections.has(section.title);
            return (
              <div key={section.title} className="flex flex-col">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span>{section.title}</span>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isExpanded && (
                  <div className="flex flex-col gap-1 mt-1">
                    {section.items.map(item => {
                      const isActive = currentPage === item.page;
                      return (
                        <Tooltip key={item.page} content={item.label}>
                          <button
                            onClick={() => handleNavClick(item.page)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm ${
                              isActive
                                ? 'bg-[hsl(var(--accent)_/_0.15)] text-[hsl(var(--accent))] font-medium'
                                : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

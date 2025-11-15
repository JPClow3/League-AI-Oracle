import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

export type TabType = 'team' | 'champions' | 'advice';

interface MobileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  teamContent: React.ReactNode;
  championsContent: React.ReactNode;
  adviceContent: React.ReactNode;
}

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'team', label: 'Team', icon: Users },
  { id: 'champions', label: 'Champions', icon: Search },
  { id: 'advice', icon: MessageSquare, label: 'Advice' },
];

/**
 * Mobile tab navigation for DraftLab
 * Supports swipe gestures between tabs
 */
export const MobileTabs = ({
  activeTab,
  onTabChange,
  teamContent,
  championsContent,
  adviceContent,
}: MobileTabsProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const tabIndex = TABS.findIndex(tab => tab.id === activeTab);

  // Swipe gesture handling
  useSwipeGesture({
    onSwipeLeft: () => {
      if (tabIndex < TABS.length - 1) {
        const nextTab = TABS[tabIndex + 1];
        if (nextTab) {
          onTabChange(nextTab.id);
        }
      }
    },
    onSwipeRight: () => {
      if (tabIndex > 0) {
        const prevTab = TABS[tabIndex - 1];
        if (prevTab) {
          onTabChange(prevTab.id);
        }
      }
    },
    threshold: 50,
  });

  // Pull to refresh detection
  useEffect(() => {
    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0]?.clientY || 0;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isDragging || window.scrollY > 0) {
        return;
      }

      const currentY = e.touches[0]?.clientY || 0;
      const distance = currentY - startY;

      if (distance > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(distance, 100));
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > 50) {
        // Trigger refresh
        window.location.reload();
      }
      setIsPulling(false);
      setPullDistance(0);
      isDragging = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance]);

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return teamContent;
      case 'champions':
        return championsContent;
      case 'advice':
        return adviceContent;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full md:hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] sticky top-0 z-10">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)_/_0.1)]'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${tab.label} tab`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[hsl(var(--accent))]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-2 text-sm text-[hsl(var(--text-secondary))]"
          >
            {pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

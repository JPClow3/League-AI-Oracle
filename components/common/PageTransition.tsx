/**
 * Page Transition Wrapper
 * Smooth transitions between pages
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../../types';

interface PageTransitionProps {
    pageKey: Page;
    children: React.ReactNode;
    className?: string;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: 'easeIn'
        }
    }
};

/**
 * Wraps page content with smooth transitions
 * Use in Router component
 */
export const PageTransition = ({
    pageKey,
    children,
    className = ''
}: PageTransitionProps) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pageKey}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Slide transition variant
 */
export const PageSlideTransition = ({
    pageKey,
    children,
    direction = 'left',
    className = ''
}: PageTransitionProps & { direction?: 'left' | 'right' }) => {
    const slideVariants = {
        initial: {
            opacity: 0,
            x: direction === 'left' ? 50 : -50
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: 'easeOut'
            }
        },
        exit: {
            opacity: 0,
            x: direction === 'left' ? -50 : 50,
            transition: {
                duration: 0.2,
                ease: 'easeIn'
            }
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pageKey}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Fade transition (subtle)
 */
export const PageFadeTransition = ({
    pageKey,
    children,
    className = ''
}: PageTransitionProps) => {
    const fadeVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { duration: 0.2 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.15 }
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pageKey}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
/**
 * Global CSS Utilities for UI/UX Improvements
 * Import this in your main CSS file
 */

/* ============================================================================
   FOCUS STATES - Apply to all interactive elements
   ============================================================================ */

.focusable,
button:not(.no-focus),
a:not(.no-focus),
input:not(.no-focus),
textarea:not(.no-focus),
select:not(.no-focus),
[role="button"]:not(.no-focus),
[tabindex]:not([tabindex="-1"]):not(.no-focus) {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary;
}

/* ============================================================================
   HOVER STATES - Consistent across all interactive elements
   ============================================================================ */

/* Cards */
.card-hover {
  @apply hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300;
}

/* Buttons (already in Button component, but available as utility) */
.button-hover {
  @apply hover:brightness-110 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200;
}

/* Icon buttons */
.icon-button-hover {
  @apply hover:bg-surface hover:scale-105 transition-all duration-200;
}

/* Links */
.link-hover {
  @apply hover:text-accent hover:underline transition-colors duration-200;
}

/* ============================================================================
   TOUCH TARGETS - Minimum 44x44px for mobile
   ============================================================================ */

.touch-target {
  @apply min-w-[44px] min-h-[44px] p-3;
}

/* ============================================================================
   SPACING - Consistent t-shirt sizing
   ============================================================================ */

.spacing-xs { @apply gap-1; }   /* 4px */
.spacing-sm { @apply gap-2; }   /* 8px */
.spacing-md { @apply gap-4; }   /* 16px */
.spacing-lg { @apply gap-6; }   /* 24px */
.spacing-xl { @apply gap-8; }   /* 32px */

/* ============================================================================
   PAGE TRANSITIONS
   ============================================================================ */

.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 300ms, transform 300ms;
}

/* ============================================================================
   MICRO-INTERACTIONS
   ============================================================================ */

/* Success checkmark animation */
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.success-checkmark {
  animation: checkmark 0.5s ease-in-out;
}

/* Button click animation */
@keyframes button-click {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.button-click {
  animation: button-click 0.2s ease-in-out;
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Pulse for notifications */
@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(var(--accent-rgb), 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0);
  }
}

.pulse-ring {
  animation: pulse-ring 1.5s infinite;
}

/* ============================================================================
   ACCESSIBILITY - Reduce motion for users who prefer it
   ============================================================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .page-enter-active,
  .page-exit-active {
    transition: none !important;
  }
}

/* ============================================================================
   LOADING STATES
   ============================================================================ */

/* Skeleton pulse animation */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-pulse {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ============================================================================
   ERROR STATES
   ============================================================================ */

.error-shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* ============================================================================
   SUCCESS STATES
   ============================================================================ */

.success-bounce {
  animation: bounce 0.6s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}


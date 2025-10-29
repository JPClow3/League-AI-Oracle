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
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
};

/**
 * Wraps page content with smooth transitions
 * Use in Router component
 */
export const PageTransition = ({ pageKey, children, className = '' }: PageTransitionProps) => {
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
  className = '',
}: PageTransitionProps & { direction?: 'left' | 'right' }) => {
  const slideVariants = {
    initial: {
      opacity: 0,
      x: direction === 'left' ? 50 : -50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      x: direction === 'left' ? -50 : 50,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
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
export const PageFadeTransition = ({ pageKey, children, className = '' }: PageTransitionProps) => {
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
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

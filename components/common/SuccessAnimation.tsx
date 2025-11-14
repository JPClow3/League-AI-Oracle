/**
 * Success Animation Component
 * Shows animated checkmark on successful actions
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle } from 'lucide-react';

interface SuccessAnimationProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Success animation with checkmark
 * Auto-dismisses after duration
 */
export const SuccessAnimation = ({ message = 'Success!', duration = 2000, onComplete }: SuccessAnimationProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
          >
            <Check size={32} className="text-white" strokeWidth={3} />
          </motion.div>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-success font-semibold"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Inline success checkmark (no auto-dismiss)
 */
export const SuccessCheckmark = ({ size = 24, className = '' }: { size?: number; className?: string }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      className={`inline-flex ${className}`}
    >
      <CheckCircle size={size} className="text-success" />
    </motion.div>
  );
};

/**
 * Success toast alternative
 */
export const SuccessToast = ({
  message,
  isVisible,
  onClose,
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!isVisible) {
      return;
    }
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-success text-white px-4 py-3 rounded-lg shadow-lg"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
            <Check size={20} />
          </motion.div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

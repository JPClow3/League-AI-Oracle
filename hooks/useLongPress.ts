import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // milliseconds
  preventDefault?: boolean;
}

/**
 * Hook to detect long press gestures on touch devices
 * @param options - Configuration options
 * @returns Event handlers to attach to elements
 */
export const useLongPress = ({ onLongPress, onClick, threshold = 500, preventDefault = true }: UseLongPressOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      isLongPressRef.current = false;
      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, threshold);
    },
    [onLongPress, threshold, preventDefault]
  );

  const clear = useCallback(
    (e: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (shouldTriggerClick && !isLongPressRef.current && onClick) {
        onClick();
      }
      isLongPressRef.current = false;
    },
    [onClick]
  );

  return {
    onTouchStart: start,
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onTouchMove: (e: React.TouchEvent) => clear(e, false), // Cancel on move
    onMouseDown: start,
    onMouseUp: (e: React.MouseEvent) => clear(e, true),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false), // Cancel on leave
  };
};

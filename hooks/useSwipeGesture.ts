import { useRef, useEffect, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number; // Minimum velocity to trigger swipe (pixels/ms)
}

/**
 * Hook for detecting swipe gestures on touch devices
 */
export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, velocityThreshold = 0.3 } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: globalThis.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        setIsSwiping(true);
      }
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      // Prevent default to avoid scrolling during horizontal swipes
      if (touchStartRef.current) {
        const touch = e.touches[0];
        if (touch) {
          const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
          const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

          // If horizontal movement is dominant, prevent vertical scroll
          if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = (e: globalThis.TouchEvent) => {
      if (!touchStartRef.current) {
        setIsSwiping(false);
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) {
        setIsSwiping(false);
        return;
      }

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Check if swipe meets threshold and velocity requirements
      if (distance >= threshold && velocity >= velocityThreshold) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine primary direction
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
      setIsSwiping(false);
    };

    const element = document.body;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  return { isSwiping };
};

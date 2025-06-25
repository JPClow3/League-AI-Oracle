
import React, { useState, useEffect, useRef } from 'react';
import { AnimatedNumberProps } from '../types';

const easeOutCubic = (t: number): number => (--t) * t * t + 1;

export const AnimatedNumber: React.FC<AnimatedNumberProps> = React.memo(({
  targetValue,
  duration = 1000,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number>(targetValue); // Store previous target to animate from it

  useEffect(() => {
    const startFrom = prevTargetRef.current === targetValue ? 0 : currentValue; // Animate from current if target changed, else from 0
    startTimeRef.current = null; // Reset start time for new animation

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsedTime = timestamp - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const nextValue = startFrom + (targetValue - startFrom) * easedProgress;
      
      setCurrentValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue); // Ensure it ends exactly on target
        prevTargetRef.current = targetValue; // Update previous target
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, decimals]); // Rerun effect if targetValue or duration changes

  const formatNumber = (num: number): string => {
    return num.toFixed(decimals);
  };

  return (
    <span className={className}>
      {prefix}{formatNumber(currentValue)}{suffix}
    </span>
  );
});

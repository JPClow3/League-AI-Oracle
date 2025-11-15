import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A safe version of useState that prevents state updates after component unmount
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
    // Only update if component is still mounted
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, safeSetState] as const;
}

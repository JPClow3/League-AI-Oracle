import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to use Draft Analysis Web Worker
 * Offloads heavy computations to a separate thread
 */

interface WorkerMessage {
  type: string;
  result: any;
  timestamp: number;
}

export function useDraftAnalysisWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingCallbacks = useRef<Map<string, (result: any) => void>>(new Map());

  useEffect(() => {
    // Create worker
    try {
      workerRef.current = new Worker(
        new URL('../lib/draftAnalysis.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, result } = event.data;

        if (type === 'ready') {
          setIsReady(true);
          return;
        }

        if (type === 'error') {
          console.error('[Worker Error]', result.error);
          setIsProcessing(false);
          return;
        }

        // Resolve pending callback
        const callback = pendingCallbacks.current.get(type);
        if (callback) {
          callback(result);
          pendingCallbacks.current.delete(type);
        }

        setIsProcessing(false);
      };

      workerRef.current.onerror = (error) => {
        console.error('[Worker Error]', error);
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Failed to create worker:', error);
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  /**
   * Analyze team composition
   */
  const analyzeTeam = useCallback((team: any[]): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        console.warn('Worker not ready');
        resolve(null);
        return;
      }

      setIsProcessing(true);
      pendingCallbacks.current.set('analyzeTeam', resolve);

      workerRef.current.postMessage({
        type: 'analyzeTeam',
        data: { team },
      });
    });
  }, [isReady]);

  /**
   * Calculate synergy between champions
   */
  const calculateSynergy = useCallback((champions: any[]): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        console.warn('Worker not ready');
        resolve(null);
        return;
      }

      setIsProcessing(true);
      pendingCallbacks.current.set('calculateSynergy', resolve);

      workerRef.current.postMessage({
        type: 'calculateSynergy',
        data: { champions },
      });
    });
  }, [isReady]);

  /**
   * Find counter champions
   */
  const findCounters = useCallback((enemyTeam: any[], allChampions: any[]): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        console.warn('Worker not ready');
        resolve(null);
        return;
      }

      setIsProcessing(true);
      pendingCallbacks.current.set('findCounters', resolve);

      workerRef.current.postMessage({
        type: 'findCounters',
        data: { enemyTeam, allChampions },
      });
    });
  }, [isReady]);

  /**
   * Predict win rate
   */
  const predictWinRate = useCallback((blueTeam: any[], redTeam: any[]): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        console.warn('Worker not ready');
        resolve(null);
        return;
      }

      setIsProcessing(true);
      pendingCallbacks.current.set('predictWinRate', resolve);

      workerRef.current.postMessage({
        type: 'predictWinRate',
        data: { blueTeam, redTeam },
      });
    });
  }, [isReady]);

  return {
    isReady,
    isProcessing,
    analyzeTeam,
    calculateSynergy,
    findCounters,
    predictWinRate,
  };
}


import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { offlineService } from '../../lib/offlineService';

/**
 * Offline Status Indicator
 * Shows connection status and queued requests
 */
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    // Subscribe to online/offline status
    const unsubscribe = offlineService.subscribe((online) => {
      setIsOnline(online);
    });

    // Update queued count periodically
    const interval = setInterval(() => {
      setQueuedCount(offlineService.getQueuedCount());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if online and no queued requests
  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
        isOnline
          ? 'bg-success/20 border border-success/40 text-success'
          : 'bg-error/20 border border-error/40 text-error'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span className="text-sm font-medium">
            Processing {queuedCount} queued request{queuedCount !== 1 ? 's' : ''}...
          </span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">
            Offline Mode
            {queuedCount > 0 && ` • ${queuedCount} queued`}
          </span>
        </>
      )}
    </div>
  );
};


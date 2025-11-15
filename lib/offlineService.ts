/**
 * Offline Service
 * Manages offline functionality, service worker registration, and request queuing
 */

type OnlineStatusCallback = (isOnline: boolean) => void;

interface QueuedRequest {
  url: string;
  options: {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
  };
}

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private subscribers: Set<OnlineStatusCallback> = new Set();
  private queuedRequests: QueuedRequest[] = [];

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifySubscribers();
    this.processQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifySubscribers();
  };

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.isOnline));
  }

  private async processQueue() {
    if (!this.isOnline || this.queuedRequests.length === 0) {
      return;
    }

    const requests = [...this.queuedRequests];
    this.queuedRequests = [];

    for (const request of requests) {
      try {
        await fetch(request.url, request.options);
      } catch (error) {
        // Re-queue if still failing
        console.error('Failed to process queued request:', error);
        this.queuedRequests.push(request);
      }
    }
  }

  /**
   * Initialize the service and register service worker
   * Service worker registration is deferred to avoid blocking initial render
   */
  async initialize() {
    // Defer service worker registration until after page load
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      // Use requestIdleCallback if available, otherwise setTimeout
      const deferRegistration = () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => this.registerServiceWorker(), { timeout: 2000 });
        } else {
          setTimeout(() => this.registerServiceWorker(), 2000);
        }
      };

      if (document.readyState === 'complete') {
        deferRegistration();
      } else {
        window.addEventListener('load', deferRegistration, { once: true });
      }
    }
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Subscribe to online status changes
   */
  subscribe(callback: OnlineStatusCallback): () => void {
    this.subscribers.add(callback);
    // Immediately notify of current status
    callback(this.isOnline);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Queue a request for when online
   */
  queueRequest(url: string, options: QueuedRequest['options'] = {}) {
    this.queuedRequests.push({ url, options });
  }

  /**
   * Get count of queued requests
   */
  getQueuedCount(): number {
    return this.queuedRequests.length;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.subscribers.clear();
    this.queuedRequests = [];
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

import { Workbox } from 'workbox-window';

/**
 * Offline Mode Service
 * Handles service worker registration and request queuing
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: JsonValue;
  headers?: Record<string, string>;
  timestamp: number;
}

class OfflineService {
  private wb: Workbox | null = null;
  private isOnline = navigator.onLine;
  private requestQueue: QueuedRequest[] = [];
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  /**
   * Initialize offline mode
   */
  async initialize() {
    // Load queued requests from storage
    this.loadQueue();

    // Register service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        this.wb = new Workbox('/sw.js');

        // Listen for service worker updates
        this.wb.addEventListener('waiting', () => {
          console.log('New service worker available. Refresh to update.');
        });

        this.wb.addEventListener('activated', () => {
          console.log('Service worker activated');
        });

        await this.wb.register();
        console.log('✅ Service worker registered');
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    console.log('✅ Offline mode initialized');
  }

  /**
   * Handle going online
   */
  private handleOnline = async () => {
    console.log('📡 Connection restored');
    this.isOnline = true;
    this.notifyListeners(true);

    // Process queued requests
    await this.processQueue();
  };

  /**
   * Handle going offline
   */
  private handleOffline = () => {
    console.log('📵 Connection lost');
    this.isOnline = false;
    this.notifyListeners(false);
  };

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Queue a request for later processing
   */
  queueRequest(
    url: string,
    method: string = 'GET',
    body?: JsonValue,
    headers?: Record<string, string>
  ): string {
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      body,
      headers,
      timestamp: Date.now(),
    };

    this.requestQueue.push(request);
    this.saveQueue();

    console.log(`📦 Request queued: ${method} ${url}`);
    return request.id;
  }

  /**
   * Process all queued requests
   */
  private async processQueue() {
    if (this.requestQueue.length === 0) {return;}

    console.log(`🔄 Processing ${this.requestQueue.length} queued requests`);

    const results = await Promise.allSettled(
      this.requestQueue.map(req => this.executeRequest(req))
    );

    // Remove successful requests
    const successfulIds = results
      .map((result, index) =>
        result.status === 'fulfilled' ? this.requestQueue[index].id : null
      )
      .filter(Boolean) as string[];

    this.requestQueue = this.requestQueue.filter(
      req => !successfulIds.includes(req.id)
    );

    this.saveQueue();

    const successCount = successfulIds.length;
    const failCount = results.length - successCount;

    console.log(`✅ Processed: ${successCount} succeeded, ${failCount} failed`);
  }

  /**
   * Execute a queued request
   */
  private async executeRequest(request: QueuedRequest): Promise<Response> {
    const { url, method, body, headers } = request;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response;
  }

  /**
   * Get queued request count
   */
  getQueuedCount(): number {
    return this.requestQueue.length;
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.requestQueue = [];
    this.saveQueue();
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.requestQueue));
    } catch (error) {
      console.warn('Failed to save request queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue() {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        this.requestQueue = JSON.parse(stored);

        // Remove requests older than 24 hours
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.requestQueue = this.requestQueue.filter(
          req => req.timestamp > cutoff
        );
      }
    } catch (error) {
      console.warn('Failed to load request queue:', error);
      this.requestQueue = [];
    }
  }

  /**
   * Subscribe to online status changes
   */
  subscribe(listener: (isOnline: boolean) => void) {
    this.listeners.add(listener);

    // Immediately notify of current status
    listener(this.isOnline);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Error in offline listener:', error);
      }
    });
  }

  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Update service worker
   */
  async update() {
    if (this.wb) {
      await this.wb.update();
    }
  }

  /**
   * Clean up
   */
  cleanup() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Export singleton instance
export const offlineService = new OfflineService();


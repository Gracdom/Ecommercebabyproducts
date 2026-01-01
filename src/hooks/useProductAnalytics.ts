import { useCallback, useEffect, useRef } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/utils/supabase/client';

type EventType = 'view' | 'click' | 'cart_add' | 'purchase' | 'bounce';

interface AnalyticsEvent {
  product_id: number;
  event_type: EventType;
  session_id: string;
  user_agent?: string;
  referrer?: string;
  time_on_page_ms?: number;
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Batch events queue
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE = 5;
const FLUSH_INTERVAL_MS = 5000; // 5 seconds

// Flush events to Edge Function
async function flushEvents() {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    const FUNCTION_NAME = "make-server-335110ef";
    const EDGE_BASE_URL = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;
    
    const res = await fetch(`${EDGE_BASE_URL}/bigbuy/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ events: eventsToSend }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Failed to send analytics events:', error);
      // Re-queue events on error (up to a limit)
      if (eventQueue.length < 50) {
        eventQueue.unshift(...eventsToSend);
      }
    }
  } catch (error) {
    console.error('Error flushing analytics events:', error);
    // Re-queue events on error
    if (eventQueue.length < 50) {
      eventQueue.unshift(...eventsToSend);
    }
  }
}

// Schedule flush
function scheduleFlush() {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushEvents();
    flushTimeout = null;
    
    // Auto-flush if queue is getting large
    if (eventQueue.length >= BATCH_SIZE) {
      flushEvents();
    }
  }, FLUSH_INTERVAL_MS);
}

// Track event (adds to queue)
function trackEvent(event: AnalyticsEvent) {
  eventQueue.push(event);
  
  // Flush immediately if batch size reached
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      const eventsJson = JSON.stringify(eventQueue);
      navigator.sendBeacon?.(
        `${window.location.origin}/api/analytics/flush`,
        new Blob([eventsJson], { type: 'application/json' })
      );
      // Also try regular flush
      flushEvents();
    }
  });
}

export function useProductAnalytics() {
  const sessionIdRef = useRef<string>(getSessionId());
  const viewStartTimeRef = useRef<Map<number, number>>(new Map());

  // Track product view
  const trackView = useCallback((productId: number) => {
    const startTime = Date.now();
    viewStartTimeRef.current.set(productId, startTime);

    trackEvent({
      product_id: productId,
      event_type: 'view',
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
  }, []);

  // Track product click
  const trackClick = useCallback((productId: number, element?: string) => {
    trackEvent({
      product_id: productId,
      event_type: 'click',
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
  }, []);

  // Track add to cart
  const trackCartAdd = useCallback((productId: number) => {
    trackEvent({
      product_id: productId,
      event_type: 'cart_add',
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
  }, []);

  // Track purchase
  const trackPurchase = useCallback((productId: number, orderId?: string) => {
    trackEvent({
      product_id: productId,
      event_type: 'purchase',
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
  }, []);

  // Track bounce (call when leaving page quickly)
  const trackBounce = useCallback((productId: number, timeOnPageMs: number) => {
    trackEvent({
      product_id: productId,
      event_type: 'bounce',
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      time_on_page_ms: timeOnPageMs,
    });
  }, []);

  // Track time on page (call when leaving product page)
  const trackTimeOnPage = useCallback((productId: number) => {
    const startTime = viewStartTimeRef.current.get(productId);
    if (startTime) {
      const timeOnPage = Date.now() - startTime;
      viewStartTimeRef.current.delete(productId);

      // If time is very short (< 3 seconds), consider it a bounce
      if (timeOnPage < 3000) {
        trackBounce(productId, timeOnPage);
      } else {
        // Update the view event with time on page
        // Note: We'll update the last view event for this product
        // This is a simplification - in production you might want to track this differently
        trackEvent({
          product_id: productId,
          event_type: 'view',
          session_id: sessionIdRef.current,
          user_agent: navigator.userAgent,
          referrer: document.referrer || undefined,
          time_on_page_ms: timeOnPage,
        });
      }
    }
  }, [trackBounce]);

  // Cleanup: flush events on unmount
  useEffect(() => {
    return () => {
      if (eventQueue.length > 0) {
        flushEvents();
      }
    };
  }, []);

  return {
    trackView,
    trackClick,
    trackCartAdd,
    trackPurchase,
    trackBounce,
    trackTimeOnPage,
  };
}


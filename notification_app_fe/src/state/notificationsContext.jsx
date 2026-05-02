import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchNotifications, normaliseNotification } from '../api/notifications.js';
import { log } from '../utils/logger.js';

// ─── Dummy Data (fallback when API is unavailable) ────────────────────────────

const now = Date.now();
const mins = (m) => new Date(now - m * 60 * 1000).toISOString();
const hrs  = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
const days = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

const DUMMY_NOTIFICATIONS = [
  {
    id: '1', title: 'System Update Available',
    message: 'A new system update v3.2.1 is ready to install. Includes critical security patches and performance improvements.',
    timestamp: mins(5), read: false, priority: 'high', category: 'system',
  },
  {
    id: '2', title: 'New Team Member Joined',
    message: 'Priya Sharma has joined your workspace. Send a welcome message to get started.',
    timestamp: mins(18), read: false, priority: 'normal', category: 'team',
  },
  {
    id: '3', title: 'Deployment Successful',
    message: 'Your application "notification-service" was deployed successfully to production at 10:42 AM.',
    timestamp: mins(40), read: false, priority: 'normal', category: 'deploy',
  },
  {
    id: '4', title: '⚠️ High CPU Alert',
    message: 'Server node-03 is running at 94% CPU utilization. Immediate attention required to prevent service degradation.',
    timestamp: hrs(1), read: false, priority: 'urgent', category: 'alert',
  },
  {
    id: '5', title: 'Weekly Report Ready',
    message: 'Your weekly performance analytics report for April 21–27 is now available. Click to view detailed insights.',
    timestamp: hrs(3), read: true, priority: 'normal', category: 'report',
  },
  {
    id: '6', title: 'Storage Limit Warning',
    message: 'You have used 87% of your allocated storage (8.7 GB / 10 GB). Consider upgrading your plan.',
    timestamp: hrs(5), read: false, priority: 'high', category: 'system',
  },
  {
    id: '7', title: 'Pull Request Approved',
    message: 'Rohan Mehta approved your pull request #142: "Add notification filtering logic".',
    timestamp: hrs(8), read: true, priority: 'normal', category: 'code',
  },
  {
    id: '8', title: 'Subscription Renewal',
    message: 'Your Pro subscription renews in 3 days on May 5, 2026. Ensure your payment method is up to date.',
    timestamp: days(1), read: true, priority: 'high', category: 'billing',
  },
  {
    id: '9', title: 'API Rate Limit Exceeded',
    message: 'Your application exceeded the API rate limit (1000 req/min). Requests are being throttled.',
    timestamp: days(1), read: true, priority: 'urgent', category: 'alert',
  },
  {
    id: '10', title: 'Database Backup Complete',
    message: 'Scheduled backup of production database completed successfully. Size: 2.4 GB. Stored in S3.',
    timestamp: days(2), read: true, priority: 'normal', category: 'system',
  },
  {
    id: '11', title: 'New Comment on Issue #89',
    message: 'Anjali Kapoor commented: "The bug is reproduced consistently on Safari 16+. Adding a workaround."',
    timestamp: days(2), read: false, priority: 'normal', category: 'code',
  },
  {
    id: '12', title: 'Login from New Device',
    message: 'A new login was detected from MacOS · Chrome · Mumbai, IN. Was this you? If not, secure your account.',
    timestamp: days(3), read: true, priority: 'high', category: 'security',
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationsContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const [filter, setFilter]               = useState('all');

  // Pagination
  const LIMIT = 10;
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(DUMMY_NOTIFICATIONS.length / LIMIT)
  );

  // Fetch state
  const [loading, setLoading]       = useState(false);
  const [dataSource, setDataSource] = useState('local'); // 'api' | 'local'
  const [fetchError, setFetchError] = useState('');

  // ── API fetch on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      setFetchError('');

      const result = await fetchNotifications({ page: 1, limit: LIMIT });

      if (cancelled) return;

      if (result.ok && result.data && result.data.length > 0) {
        const normalised = result.data.map(normaliseNotification);
        setNotifications(normalised);
        setDataSource('api');
        // Use total from API to compute pages; fall back to data length
        const total = result.total ?? normalised.length;
        setTotalPages(Math.max(1, Math.ceil(total / LIMIT)));
        setPage(1);
        setLoading(false);

        await log('frontend', 'info', 'state',
          `Fetched ${normalised.length} notifications from API (page 1)`);
        return;
      }

      if (result.ok && result.data?.length === 0) {
        await log('frontend', 'warn', 'api',
          'API returned 0 notifications — keeping dummy data');
      } else {
        await log('frontend', 'error', 'api',
          `Failed to fetch notifications: ${result.error ?? `HTTP ${result.status}`} — using local fallback`);
        setFetchError(result.error ?? `HTTP ${result.status}`);
      }

      // Fallback: keep DUMMY_NOTIFICATIONS
      setDataSource('local');
      setTotalPages(Math.max(1, Math.ceil(DUMMY_NOTIFICATIONS.length / LIMIT)));
      setPage(1);
      setLoading(false);
    }

    loadNotifications();
    return () => { cancelled = true; };
  }, []); // runs once on mount

  // ── Mutation helpers (all operate on local React state) ──────────────

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  /**
   * goToPage — change page.
   * - API mode : re-fetches the given page from the server.
   * - Local mode: updates page state only (data already in memory).
   */
  const goToPage = useCallback(async (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    setPage(targetPage);

    if (dataSource === 'api') {
      setLoading(true);
      setFetchError('');
      const result = await fetchNotifications({ page: targetPage, limit: LIMIT });
      if (result.ok && result.data && result.data.length > 0) {
        const normalised = result.data.map(normaliseNotification);
        setNotifications(normalised);
        const total = result.total ?? normalised.length;
        setTotalPages(Math.max(1, Math.ceil(total / LIMIT)));
        await log('frontend', 'info', 'state',
          `Fetched page ${targetPage} — ${normalised.length} notifications`);
      } else {
        await log('frontend', 'warn', 'api',
          `Page ${targetPage} fetch failed: ${result.error ?? 'empty response'}`);
        setFetchError(result.error ?? 'Fetch returned no data');
      }
      setLoading(false);
    }
    // Local mode: page state update above is sufficient — slicing handles the rest.
  }, [dataSource, totalPages]);

  /**
   * refetch — re-fetch current page (or custom params).
   */
  const refetch = useCallback(async (params = {}) => {
    setLoading(true);
    setFetchError('');
    const result = await fetchNotifications({ page, limit: LIMIT, ...params });
    if (result.ok && result.data && result.data.length > 0) {
      setNotifications(result.data.map(normaliseNotification));
      setDataSource('api');
      await log('frontend', 'info', 'state',
        `Re-fetched ${result.data.length} notifications from API`);
    } else {
      await log('frontend', 'warn', 'api',
        `Refetch failed: ${result.error ?? 'empty response'}`);
      setFetchError(result.error ?? 'Refetch returned no data');
    }
    setLoading(false);
  }, [page]);

  // ── Derived values ────────────────────────────────────────────────────

  // 1. Apply filter
  const filterPassed = notifications.filter((n) => {
    if (filter === 'unread')    return !n.read;
    if (filter === 'read')      return n.read;
    if (filter === 'important') return n.priority === 'urgent' || n.priority === 'high';
    return true; // 'all'
  });

  // 2. For local mode, paginate the filtered list in-memory.
  //    For API mode the server already returned the correct page slice,
  //    so we show all items returned (no extra slicing needed).
  const filteredNotifications = dataSource === 'local'
    ? filterPassed.slice((page - 1) * LIMIT, page * LIMIT)
    : filterPassed;

  // Keep totalPages in sync when filter changes (local mode only)
  const filteredTotal = filterPassed.length;
  const computedTotalPages = dataSource === 'local'
    ? Math.max(1, Math.ceil(filteredTotal / LIMIT))
    : totalPages;

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Context value ─────────────────────────────────────────────────────

  return (
    <NotificationsContext.Provider
      value={{
        // Data
        notifications,
        filteredNotifications,
        unreadCount,

        // Filter
        filter,
        setFilter,

        // Pagination
        page,
        limit: LIMIT,
        totalPages: computedTotalPages,
        goToPage,

        // Mutations (all local — no backend write yet)
        markAsRead,
        markAsUnread,
        deleteNotification,
        markAllAsRead,

        // Fetch status
        loading,
        dataSource,
        fetchError,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useNotifications = () => useContext(NotificationsContext);

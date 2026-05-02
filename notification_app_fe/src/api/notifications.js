/**
 * src/api/notifications.js
 *
 * Notifications API integration for AlertFlow.
 *
 * Endpoint: GET /evaluation-service/notifications
 * Query params supported:
 *   - page             (integer, 1-based)
 *   - limit            (integer, max items per page)
 *   - notification_type (string — filters by type e.g. "Placement", "Result", "Event")
 */

import { get } from './client.js';

/** Base path for the notifications resource */
const NOTIFICATIONS_PATH = '/evaluation-service/notifications';

/**
 * fetchNotifications — GET /evaluation-service/notifications
 *
 * @param {Object} params
 * @param {number} [params.page=1]               - Page number (1-based)
 * @param {number} [params.limit=50]             - Max results per page
 * @param {string} [params.notification_type=''] - Filter by notification type
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   data: Array|null,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   status?: number,
 *   error?: string
 * }>}
 */
export async function fetchNotifications({
  page = 1,
  limit = 50,
  notification_type = '',
} = {}) {
  // Build query string
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (notification_type) {
    params.set('notification_type', notification_type);
  }

  const path = `${NOTIFICATIONS_PATH}?${params.toString()}`;
  const result = await get(path);

  if (!result.ok) {
    return result; // pass error shape through as-is
  }

  // Normalise the response — the evaluation service may return:
  //   { data: [...], total, page, limit }   (paginated wrapper)
  //   [...]                                  (plain array)
  const raw = result.data;
  if (Array.isArray(raw)) {
    return { ok: true, status: result.status, data: raw, total: raw.length, page, limit };
  }
  if (raw && Array.isArray(raw.data)) {
    return {
      ok: true,
      status: result.status,
      data: raw.data,
      total: raw.total ?? raw.data.length,
      page: raw.page ?? page,
      limit: raw.limit ?? limit,
    };
  }

  // Unexpected shape — treat as empty
  return { ok: true, status: result.status, data: [], total: 0, page, limit };
}

/**
 * normaliseNotification — maps evaluation-service fields → internal shape.
 *
 * The dashboard expects:
 *   { id, title, message, timestamp, read, priority, category }
 *
 * The evaluation service may use different field names such as:
 *   notificationId, description, createdAt, isRead, type, etc.
 *
 * This function bridges the two shapes so all downstream code is unchanged.
 *
 * @param {Object} raw   - Raw item from evaluation-service
 * @param {number} index - Fallback index used for synthetic IDs
 * @returns {Object}     - Internal notification shape
 */
export function normaliseNotification(raw, index) {
  return {
    id:        String(raw.id ?? raw.notificationId ?? raw._id ?? `api-${index}`),
    title:     raw.title ?? raw.heading ?? raw.subject ?? 'Notification',
    message:   raw.message ?? raw.description ?? raw.body ?? '',
    timestamp: raw.timestamp ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    read:      raw.read ?? raw.isRead ?? raw.is_read ?? false,
    priority:  normalisePriority(raw.priority ?? raw.type ?? raw.notification_type ?? ''),
    category:  raw.category ?? raw.notification_type ?? raw.type ?? 'general',
  };
}

/**
 * Maps evaluation-service priority/type strings → internal priority values.
 * Internal: 'urgent' | 'high' | 'normal'
 */
function normalisePriority(value) {
  const v = String(value).toLowerCase();
  if (['urgent', 'critical', 'placement'].includes(v)) return 'urgent';
  if (['high', 'important', 'result'].includes(v))     return 'high';
  return 'normal';
}

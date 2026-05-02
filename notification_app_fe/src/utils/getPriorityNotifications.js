/**
 * src/utils/getPriorityNotifications.js
 *
 * Priority sorting algorithm for the dashboard notification feed.
 * Adapted from notification_app_fe/stage1.js for browser / React usage.
 *
 * Priority rules (matches Stage 1 spec):
 *   urgent  →  weight 3  (maps to "Placement" tier in stage1.js)
 *   high    →  weight 2  (maps to "Result" tier)
 *   normal  →  weight 1  (maps to "Event" tier)
 *
 * Within the same priority tier: newest timestamp first (descending).
 *
 * The original input array is NEVER mutated (shallow copy before sort).
 *
 * Time complexity: O(n log n)  — native Array.sort (TimSort)
 * Space:          O(n)         — one spread copy
 */

/** Priority weight map — higher = more important */
const PRIORITY_WEIGHT = {
  urgent: 3,
  high:   2,
  normal: 1,
};

/**
 * getPriorityNotifications
 *
 * Sorts `notifications` by priority then recency and returns the top `limit`.
 *
 * @param {Object[]} notifications  Array of notification objects.
 *   Each object must have at minimum:
 *     { id, title, message, timestamp, read, priority }
 * @param {number}   limit          Maximum number of items to return.
 * @returns {Object[]}              Sorted top-N notifications (new array).
 *
 * @example
 *   import getPriorityNotifications from '../utils/getPriorityNotifications';
 *   const top3 = getPriorityNotifications(notifications, 3);
 */
export default function getPriorityNotifications(notifications, limit) {
  if (!Array.isArray(notifications) || notifications.length === 0) return [];
  if (typeof limit !== 'number' || limit <= 0) return [];

  return [...notifications]
    .sort((a, b) => {
      const wA = PRIORITY_WEIGHT[a.priority] ?? 0;
      const wB = PRIORITY_WEIGHT[b.priority] ?? 0;

      // 1. Higher priority first
      if (wB !== wA) return wB - wA;

      // 2. Same priority → newest first
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .slice(0, limit);
}

export { PRIORITY_WEIGHT };

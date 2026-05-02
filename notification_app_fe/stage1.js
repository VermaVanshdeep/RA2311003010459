/**
 * notification_app_fe/stage1.js
 *
 * Stage 1 — Notification Priority Engine
 *
 * Simulates fetching notifications from:
 *   GET /evaluation-service/notifications
 *
 * Implements getPriorityNotifications(notifications, limit) with rules:
 *   Priority order  : Placement > Result > Event
 *   Within same type: newest timestamp first (descending)
 *
 * Run: node stage1.js
 */

// ─── Priority Config ──────────────────────────────────────────────────────────

/**
 * Higher number = higher priority in sort.
 * Placement (3) > Result (2) > Event (1)
 */
const TYPE_PRIORITY = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── Simulated API Fetch ──────────────────────────────────────────────────────

/**
 * Simulates GET /evaluation-service/notifications.
 * Returns a Promise that resolves with realistic notification data.
 *
 * In production this would be:
 *   const res = await fetch('/evaluation-service/notifications');
 *   return res.json();
 *
 * @returns {Promise<Object[]>}
 */
async function fetchNotifications() {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 80));

  const notifications = [
    // ── Event notifications ───────────────────────────────────────────
    {
      id: 'evt-001',
      type: 'Event',
      title: 'Tech Career Fair 2026',
      message: 'Register now for the annual tech career fair happening on May 15, 2026 at SRMU campus.',
      timestamp: '2026-05-02T04:00:00.000Z',
      read: false,
    },
    {
      id: 'evt-002',
      type: 'Event',
      title: 'Hackathon: Build for Bharat',
      message: 'A 36-hour national hackathon open to all students. Prizes worth ₹5,00,000. Last date to register: May 8.',
      timestamp: '2026-04-30T09:15:00.000Z',
      read: false,
    },
    {
      id: 'evt-003',
      type: 'Event',
      title: 'Guest Lecture: AI in Healthcare',
      message: 'Dr. Nandita Rao from IIT Delhi will deliver a guest lecture on AI-driven diagnostics on May 6, 2026.',
      timestamp: '2026-04-28T11:00:00.000Z',
      read: true,
    },
    {
      id: 'evt-004',
      type: 'Event',
      title: 'Cultural Fest Registration Open',
      message: 'Registrations for Spectrum 2026 are now open. Participate in music, dance, and art competitions.',
      timestamp: '2026-04-25T08:30:00.000Z',
      read: true,
    },

    // ── Result notifications ──────────────────────────────────────────
    {
      id: 'res-001',
      type: 'Result',
      title: 'Semester V Results Declared',
      message: 'Results for Semester V (Nov 2025) have been published on the university portal. SGPA: 8.7',
      timestamp: '2026-05-01T14:30:00.000Z',
      read: false,
    },
    {
      id: 'res-002',
      type: 'Result',
      title: 'Minor Project Evaluation Score',
      message: 'Your Minor Project (CS-401) has been evaluated. Score: 87/100. Feedback available in the portal.',
      timestamp: '2026-04-29T10:00:00.000Z',
      read: false,
    },
    {
      id: 'res-003',
      type: 'Result',
      title: 'Internal Assessment Marks Updated',
      message: 'IA marks for Data Structures (CS-301) have been updated. Marks: 28/30.',
      timestamp: '2026-04-27T16:45:00.000Z',
      read: true,
    },
    {
      id: 'res-004',
      type: 'Result',
      title: 'Backlog Exam Result — Mathematics II',
      message: 'Result for Mathematics II (backlog) has been declared. Status: Passed. Grade: B+',
      timestamp: '2026-04-22T09:00:00.000Z',
      read: true,
    },

    // ── Placement notifications ───────────────────────────────────────
    {
      id: 'plc-001',
      type: 'Placement',
      title: 'Google — Shortlist Announced',
      message: 'You have been shortlisted for Google SWE Internship 2026. Report to Placement Cell by May 4, 10 AM.',
      timestamp: '2026-05-02T06:00:00.000Z',
      read: false,
    },
    {
      id: 'plc-002',
      type: 'Placement',
      title: 'Microsoft Campus Drive — Interview Schedule',
      message: 'Your Microsoft campus interview is scheduled for May 5, 2026 at 11:00 AM. Venue: Seminar Hall B.',
      timestamp: '2026-05-01T08:00:00.000Z',
      read: false,
    },
    {
      id: 'plc-003',
      type: 'Placement',
      title: 'Infosys Offer Letter Released',
      message: 'Congratulations! Your Infosys offer letter is ready for download. CTC: ₹6.5 LPA. Joining: Aug 2026.',
      timestamp: '2026-04-30T12:00:00.000Z',
      read: false,
    },
    {
      id: 'plc-004',
      type: 'Placement',
      title: 'Amazon — Aptitude Test Result',
      message: 'You have cleared the Amazon aptitude test. Technical interview round details will be shared shortly.',
      timestamp: '2026-04-26T15:30:00.000Z',
      read: true,
    },
  ];

  return notifications;
}

// ─── Core Function ────────────────────────────────────────────────────────────

/**
 * Sorts notifications by priority type and recency, then returns the top N.
 *
 * Sorting rules (applied in order):
 *   1. Type priority  : Placement (3) > Result (2) > Event (1)   [descending]
 *   2. Timestamp      : Newest first within the same type          [descending]
 *
 * @param {Object[]} notifications  - Array of notification objects
 * @param {number}   limit          - Maximum number of notifications to return
 * @returns {Object[]}              - Top N sorted notifications
 */
function getPriorityNotifications(notifications, limit) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  const sorted = [...notifications].sort((a, b) => {
    const priorityA = TYPE_PRIORITY[a.type] ?? 0;
    const priorityB = TYPE_PRIORITY[b.type] ?? 0;

    // 1. Compare by type priority (higher first)
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    // 2. Same type → compare by timestamp (newer first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return sorted.slice(0, limit);
}

// ─── Pretty Printers ──────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE   = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const RED    = '\x1b[31m';

const TYPE_COLORS = {
  Placement: GREEN,
  Result:    YELLOW,
  Event:     BLUE,
};

function formatNotification(n, index) {
  const color  = TYPE_COLORS[n.type] || RESET;
  const ts     = new Date(n.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const badge  = `[${n.type.toUpperCase()}]`;
  const status = n.read ? `${DIM}read${RESET}` : `${MAGENTA}unread${RESET}`;

  return [
    `  ${BOLD}${index + 1}. ${color}${badge}${RESET} ${BOLD}${n.title}${RESET}`,
    `     ${DIM}${n.message}${RESET}`,
    `     📅 ${ts}  ·  ${status}  ·  id: ${DIM}${n.id}${RESET}`,
  ].join('\n');
}

function printSection(heading, color, items) {
  const line = '─'.repeat(60);
  console.log(`\n${color}${BOLD}${heading}${RESET}`);
  console.log(`${DIM}${line}${RESET}`);
  items.forEach((n, i) => console.log(formatNotification(n, i)));
  console.log();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const LIMIT = 5;

  console.log(`\n${BOLD}${CYAN}${'═'.repeat(60)}${RESET}`);
  console.log(`${BOLD}${CYAN}  Stage 1 — Notification Priority Engine${RESET}`);
  console.log(`${BOLD}${CYAN}  Priority: Placement > Result > Event${RESET}`);
  console.log(`${BOLD}${CYAN}  Within same type: newest first${RESET}`);
  console.log(`${BOLD}${CYAN}${'═'.repeat(60)}${RESET}\n`);

  // ── 1. Simulate API fetch ──────────────────────────────────────────
  console.log(`${DIM}Fetching from GET /evaluation-service/notifications ...${RESET}`);
  const original = await fetchNotifications();
  console.log(`${GREEN}✓ Received ${original.length} notifications${RESET}`);

  // ── 2. Print original (as received from API) ───────────────────────
  printSection(
    `1. ORIGINAL NOTIFICATIONS  (${original.length} total — as received from API)`,
    CYAN,
    original
  );

  // ── 3. Sort ────────────────────────────────────────────────────────
  const sorted = getPriorityNotifications(original, original.length); // full sort

  printSection(
    `2. SORTED NOTIFICATIONS  (Placement → Result → Event, newest first within type)`,
    YELLOW,
    sorted
  );

  // ── 4. Top N ───────────────────────────────────────────────────────
  const topN = getPriorityNotifications(original, LIMIT);

  printSection(
    `3. TOP ${LIMIT} NOTIFICATIONS  (Final output of getPriorityNotifications)`,
    GREEN,
    topN
  );

  // ── 5. Summary ─────────────────────────────────────────────────────
  const typeCounts = topN.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  console.log(`${BOLD}${CYAN}${'═'.repeat(60)}${RESET}`);
  console.log(`${BOLD}  Summary${RESET}`);
  console.log(`${DIM}${'─'.repeat(60)}${RESET}`);
  console.log(`  Total fetched      : ${original.length}`);
  console.log(`  After sort & slice : ${topN.length}  (limit = ${LIMIT})`);
  console.log(`  Breakdown:`);
  Object.entries(typeCounts).forEach(([type, count]) => {
    const color = TYPE_COLORS[type] || RESET;
    console.log(`    ${color}${type.padEnd(12)}${RESET} ${count}`);
  });
  console.log(`${BOLD}${CYAN}${'═'.repeat(60)}${RESET}\n`);
}

main().catch((err) => {
  console.error(`${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});

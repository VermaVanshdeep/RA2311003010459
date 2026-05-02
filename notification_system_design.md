# Notification System Design

> **Assessment:** Frontend Engineering Hiring Assessment  
> **Repository:** `RA2311003010459`  
> **Stack:** React · Vite · Material UI · React Router · Node.js  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Authentication Flow](#3-authentication-flow)
4. [Logging Middleware Flow](#4-logging-middleware-flow)
5. [Stage 1 Priority Algorithm](#5-stage-1-priority-algorithm)
6. [Dashboard Architecture](#6-dashboard-architecture)
7. [State Management](#7-state-management)
8. [Assumptions](#8-assumptions)
9. [Edge Cases](#9-edge-cases)
10. [Final Submission Notes](#10-final-submission-notes)

---

## 1. Project Overview

### Purpose of the Notification Platform

**NotifyHub** is a frontend notification management platform that allows users to:

- View, filter, and manage structured notifications (Placement, Result, Event categories)
- Prioritise notifications using a deterministic ranking algorithm
- Mark notifications as read or unread, and delete them
- Access the dashboard through a secure authenticated session

The platform is designed to simulate the frontend layer of a real notification service that communicates with an evaluation backend via REST APIs. All API interactions are simulated locally for this assessment.

### Frontend Assessment Objective

The assessment evaluates the candidate's ability to:

| Objective | Deliverable |
|---|---|
| Project scaffolding | Exact folder structure compliance |
| React architecture | Context, hooks, component decomposition |
| Material UI proficiency | Themed dark UI, responsive layout |
| Routing & guards | React Router v6, protected routes |
| Algorithm implementation | Priority sorting — Stage 1 |
| Middleware design | Logging with strict input validation |
| Documentation | This design document |

---

## 2. Repository Structure

```
RA2311003010459/
├── logging_middleware/              # Standalone JS logging middleware
│   ├── logger.js                    # Core log() function + validation
│   ├── index.js                     # Public entry point + smoke test
│   └── package.json                 # ESM module config
│
├── notification_app_fe/             # React + Vite frontend application
│   ├── public/
│   ├── src/
│   │   ├── api/                     # (reserved) API layer
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthForm.jsx     # Shared auth card wrapper
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationCard.jsx
│   │   │   │   ├── NotificationFilter.jsx
│   │   │   │   ├── NotificationHeader.jsx
│   │   │   │   └── NotificationList.jsx
│   │   │   └── ProtectedRoute.jsx   # Route guard
│   │   ├── hooks/                   # (reserved) custom hooks
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── state/
│   │   │   ├── authContext.jsx      # Auth context + provider
│   │   │   └── notificationsContext.jsx
│   │   ├── styles/                  # (reserved) global styles
│   │   ├── utils/                   # (reserved) utility helpers
│   │   ├── App.jsx                  # Router + provider tree
│   │   └── main.jsx                 # React DOM entry point
│   ├── stage1.js                    # Stage 1 priority algorithm (Node.js)
│   ├── vite.config.js
│   └── package.json
│
├── screenshots/
│   ├── stage1-output/               # Terminal output captures
│   ├── desktop-ui/
│   │   ├── login-desktop.png
│   │   ├── register-desktop.png
│   │   └── dashboard-desktop.png
│   └── mobile-ui/
│       └── dashboard-mobile.png
│
├── notification_system_design.md    # This document
└── .gitignore
```

---

## 3. Authentication Flow

### Overview

Authentication is implemented using React Context + `localStorage`. There is no backend — the login action writes a user object to `localStorage` and sets React state, simulating a successful auth session.

### Login

```
User submits email + password
        │
        ▼
  Client-side validation
  ┌─ email: required, valid format
  └─ password: required, min 6 chars
        │
    ✓ Valid
        │
        ▼
  AuthContext.login(email)
  ├── builds user object: { email, name, avatar }
  ├── writes to localStorage["auth_user"]
  └── sets React state: user = { ... }
        │
        ▼
  navigate("/dashboard")
```

### Register

```
User submits name + email + password + confirmPassword
        │
        ▼
  Client-side validation
  ┌─ name: required, min 2 chars
  ├─ email: required, valid format
  ├─ password: required, min 6 chars
  └─ confirmPassword: must match password
        │
    ✓ Valid
        │
        ▼
  Success alert shown (UI-only, no backend registration)
```

### Protected Routes

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>   // checks AuthContext.user
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

`ProtectedRoute` reads `user` from `AuthContext`. If `null` → `<Navigate to="/login" replace />`.

### Route Map

| Path | Component | Guard |
|---|---|---|
| `/login` | `Login.jsx` | Public |
| `/register` | `Register.jsx` | Public |
| `/dashboard` | `Dashboard.jsx` | 🔒 Protected |
| `/*` (wildcard) | — | Redirects → `/login` |

### localStorage Persistence

| Key | Value | Cleared on |
|---|---|---|
| `auth_user` | `{ email, name, avatar }` (JSON) | `AuthContext.logout()` |

On page reload, `AuthContext` reads `localStorage["auth_user"]` in its `useState` initialiser — the session survives refresh without a backend token.

### Logout Flow

```
User clicks "Sign Out" in the avatar dropdown
        │
        ▼
  NotificationHeader → calls AuthContext.logout()
        │
        ▼
  AuthContext.logout()
  ├── localStorage.removeItem('auth_user')
  └── setUser(null)
        │
        ▼
  navigate('/login')   ← called from NotificationHeader after logout()
        │
        ▼
  ProtectedRoute detects user === null
  └── <Navigate to="/login" replace />
        │
        ▼
  Session fully terminated — no residual state
```

**Logout is triggered from:** `NotificationHeader.jsx` → avatar dropdown menu → "Sign Out" `MenuItem`.

**What gets cleared:**

| Item | Action |
|---|---|
| `localStorage["auth_user"]` | Removed via `localStorage.removeItem()` |
| React `user` state | Set to `null` via `setUser(null)` |
| Notification state | Persists in memory until page reload (intentional — resets on next login) |
| Active route | Redirected to `/login` immediately |

---

## 4. Logging Middleware Flow

### Location

```
logging_middleware/
├── logger.js   ← core implementation
└── index.js    ← public API
```

### Allowed Values

| Parameter | Allowed Values |
|---|---|
| `stack` | `frontend` |
| `level` | `debug` · `info` · `warn` · `error` · `fatal` |
| `packageName` | `api` · `component` · `hook` · `page` · `state` · `style` |
| `message` | Any non-empty string |

### `log(stack, level, packageName, message)` — Flow

```
log('frontend', 'error', 'api', 'POST /notifications failed')
        │
        ▼
  validateInputs()
  ├── stack ∈ ALLOWED_STACKS ?
  ├── level ∈ ALLOWED_LEVELS ?
  ├── packageName ∈ ALLOWED_PACKAGES ?
  └── message is non-empty string ?
        │
   ✗ Invalid                      ✓ Valid
        │                              │
        ▼                              ▼
  return {                     buildPayload()
    success: false,            └── { stack, level, severity,
    validationErrors: [...]         packageName, message, timestamp }
  }                                       │
                                          ▼
                                   Mirror to console
                                   (console.error / warn / info / debug)
                                          │
                                          ▼
                                   dispatch() → fetch()
                                   POST /evaluation-service/logs
                                   Content-Type: application/json
                                          │
                               ┌──────────┴──────────┐
                           Network OK           Network fail
                               │                     │
                               ▼                     ▼
                        { success: true,      { success: false,
                          status: 2xx,          error: '...' }
                          payload }           (swallowed — never throws)
```

### Payload Structure

```json
{
  "stack": "frontend",
  "level": "error",
  "severity": 3,
  "packageName": "api",
  "message": "POST /notifications failed with 500",
  "timestamp": "2026-05-02T05:41:46.412Z"
}
```

### Level → Severity Mapping

| Level | Severity | Console method |
|---|---|---|
| `debug` | 0 | `console.debug` |
| `info` | 1 | `console.info` |
| `warn` | 2 | `console.warn` |
| `error` | 3 | `console.error` |
| `fatal` | 4 | `console.error` |

### Usage Example

```js
import { log } from '../logging_middleware/index.js';

// In a page component
await log('frontend', 'info',  'page',      'Dashboard mounted');

// In an API module
await log('frontend', 'error', 'api',       'POST /notifications returned 500');

// In a state hook
await log('frontend', 'warn',  'state',     'Auth token missing from localStorage');

// In a UI component
await log('frontend', 'fatal', 'component', 'Unhandled error boundary triggered');
```

### Endpoint

```
POST /evaluation-service/logs
Content-Type: application/json
```

The base URL is read from `process.env.EVALUATION_SERVICE_URL` (defaults to `http://localhost:4000`).

### Error Handling

The middleware is designed to **never crash the calling application**. Errors are handled at two distinct layers:

#### Layer 1 — Validation Errors (before any network call)

```
log('backend', 'trace', 'service', '')
        │
        ▼
  validateInputs() detects 4 violations
  └── returns immediately:
      {
        success: false,
        validationErrors: [
          'Invalid stack "backend". Allowed: frontend.',
          'Invalid level "trace". Allowed: debug, info, warn, error, fatal.',
          'Invalid packageName "service". Allowed: api, component, hook, page, state, style.',
          'message must be a non-empty string.'
        ]
      }
  ← No fetch() is ever called
```

#### Layer 2 — Network / Runtime Errors (after validation passes)

```
dispatch(payload)
  └── fetch(LOG_ENDPOINT, { method: 'POST', ... })
            │
     ┌──────┴──────────────────────┐
  Network OK                  Network fail / timeout
     │                             │
     ▼                             ▼
  { success: true,          caught by try/catch
    status: response.status  └── returns:
    payload }                     { success: false,
                                    error: err.message }
                              ← never re-throws
```

#### Error Response Shape

| Scenario | `success` | Extra fields |
|---|---|---|
| Validation failure | `false` | `validationErrors: string[]` |
| Network failure | `false` | `error: string` |
| HTTP error (4xx / 5xx) | `false` | `status: number` |
| Success | `true` | `status: number`, `payload: object` |

#### Design Principle

Logging is **always best-effort**. A logging failure must not interrupt the user's workflow or surface an unhandled promise rejection. All error paths are caught internally and returned as structured objects.

---

## 5. Stage 1 Priority Algorithm

### Location

```
notification_app_fe/stage1.js
```

### Priority Rules

```
Placement  →  Priority 3  (highest)
Result     →  Priority 2
Event      →  Priority 1  (lowest)
```

Within the same type, notifications are ordered by **timestamp descending** (newest first).

### `getPriorityNotifications(notifications, limit)`

```
Input: notifications[] (unsorted), limit (integer N)
        │
        ▼
  [...notifications].sort(comparator)
        │
        │  comparator(a, b):
        │    1. priorityOf(b.type) - priorityOf(a.type)   ← type first
        │    2. if equal: new Date(b.timestamp) - new Date(a.timestamp)
        │                                                  ← newest first
        ▼
  sorted[]   (full array, sorted in place on a copy)
        │
        ▼
  sorted.slice(0, limit)
        │
        ▼
  return topN[]
```

### Example Execution (limit = 5, 12 notifications)

| Rank | ID | Type | Timestamp |
|---|---|---|---|
| 1 | `plc-001` | **Placement** | 2026-05-02 06:00 UTC |
| 2 | `plc-002` | **Placement** | 2026-05-01 08:00 UTC |
| 3 | `plc-003` | **Placement** | 2026-04-30 12:00 UTC |
| 4 | `plc-004` | **Placement** | 2026-04-26 15:30 UTC |
| 5 | `res-001` | **Result** | 2026-05-01 14:30 UTC |

All 4 Placement notifications rank above any Result or Event, regardless of their individual timestamps.

### Time Complexity

| Operation | Complexity |
|---|---|
| Sort | O(n log n) — native `Array.prototype.sort` (TimSort) |
| Slice | O(k) — where k = limit |
| **Total** | **O(n log n)** |
| Space | O(n) — sort operates on a shallow copy (`[...notifications]`) |

The original input array is **never mutated** (spread copy before sort).

---

## 6. Dashboard Architecture

### Component Tree

```
App.jsx
└── AuthProvider
    └── NotificationsProvider
        └── BrowserRouter
            └── /dashboard (ProtectedRoute)
                └── Dashboard.jsx
                    ├── NotificationHeader.jsx   ← AppBar (fixed, top)
                    ├── NotificationFilter.jsx   ← Sidebar (fixed, left / Drawer on mobile)
                    └── main content
                        ├── Stats Row (Total · Unread · Important)
                        └── NotificationList.jsx
                            └── NotificationCard.jsx  ×N
```

### Component Responsibilities

#### `NotificationHeader.jsx`
- Fixed `AppBar` with backdrop blur
- Brand logo + app title (`NotifyHub`)
- Bell icon with unread count badge (MUI `Badge`)
- User avatar with dropdown menu → logout

#### `NotificationFilter.jsx`
- **Desktop:** Fixed left sidebar (220px wide), top offset = AppBar height
- **Mobile:** MUI `Drawer` (temporary), toggled by hamburger button in header
- Filter options: All · Unread · Read · Important
- Each option shows live count chip
- Active item highlighted with gradient border + background

#### `NotificationCard.jsx`
- Glassmorphism card with left border stripe for unread items
- Displays: title, message (2-line clamp), relative timestamp, priority badge
- Action buttons (per card):
  - **Mark as read / unread** — toggles read state
  - **Delete** — removes from notifications array

#### `NotificationList.jsx`
- Renders `filteredNotifications` from context
- Shows `NotificationCard` per item with `Fade` animation
- Empty state with inbox icon + contextual message
- Header row: item count + global "Mark all read" button

### Filters

| Filter key | Logic |
|---|---|
| `all` | All notifications |
| `unread` | `n.read === false` |
| `read` | `n.read === true` |
| `important` | `n.priority === 'urgent' \|\| n.priority === 'high'` |

### Priority Badges (UI)

| Priority | Label | Colour |
|---|---|---|
| `urgent` | Urgent | Red `#ef4444` |
| `high` | High | Orange `#f97316` |
| `normal` | Normal | Green `#22c55e` |

### Responsive Design

| Breakpoint | Sidebar | Header |
|---|---|---|
| `md` and above (≥ 900px) | Fixed left sidebar (220px) | Full brand name visible |
| Below `md` (< 900px) | Hidden; opens as Drawer via hamburger | Brand name hidden; icons only |

---

## 7. State Management

### Auth Context (`src/state/authContext.jsx`)

```
AuthContext
├── state
│   └── user: { email, name, avatar } | null
│
├── initialiser
│   └── reads localStorage["auth_user"] on mount
│
└── actions
    ├── login(email, name?)
    │   ├── builds user object
    │   ├── writes to localStorage
    │   └── sets user state
    └── logout()
        ├── removes localStorage["auth_user"]
        └── sets user → null
```

**Consumer pattern:**
```js
const { user, login, logout } = useAuth();
```

### Notifications Context (`src/state/notificationsContext.jsx`)

```
NotificationsContext
├── state
│   ├── notifications: Notification[]   (12 dummy items)
│   └── filter: 'all' | 'unread' | 'read' | 'important'
│
├── derived values (computed on render)
│   ├── filteredNotifications  ← based on active filter
│   └── unreadCount            ← notifications.filter(n => !n.read).length
│
└── actions
    ├── setFilter(key)             → updates active filter
    ├── markAsRead(id)             → sets n.read = true for matching id
    ├── markAsUnread(id)           → sets n.read = false for matching id
    ├── deleteNotification(id)     → removes item from array
    └── markAllAsRead()            → sets read = true on all items
```

**Consumer pattern:**
```js
const {
  filteredNotifications,
  filter, setFilter,
  unreadCount,
  markAsRead, markAsUnread,
  deleteNotification, markAllAsRead,
} = useNotifications();
```

### Data Flow Diagram

```
User Action (click)
      │
      ▼
NotificationCard / NotificationList / NotificationFilter
      │
      ▼
Context action (markAsRead / setFilter / delete)
      │
      ▼
setState → re-render → derived values recomputed
      │
      ▼
UI updates (card style, badge count, filter chips)
```

No external state library (Redux, Zustand) is used. React Context with `useState` is sufficient for this scope.

---

## 8. Assumptions

| # | Assumption | Rationale |
|---|---|---|
| 1 | No backend is available | Assessment specifies local state only |
| 2 | Login always succeeds if validation passes | Simulated auth — no credential check |
| 3 | Register does not persist the new user | UI-only; no user store |
| 4 | Notifications are seeded as static dummy data | Replaces `GET /evaluation-service/notifications` |
| 5 | Logging middleware network calls will fail locally | Evaluation service is not running; errors are swallowed |
| 6 | `localStorage` is available in the browser | Standard modern browser assumption |
| 7 | Vite 5 (not Vite 8) is used | Vite 8 + rolldown has a known incompatibility with `@mui/icons-material` subpath exports |
| 8 | `@mui/icons-material` is treated as an additional MUI package | Required for icons; does not violate "Material UI only" constraint |
| 9 | Stage 1 runs in Node.js (not in the browser) | `stage1.js` uses top-level `await` and `process.argv` |
| 10 | Notification `type` values are exactly `Placement`, `Result`, `Event` | Case-sensitive match used in priority map |

---

## 9. Edge Cases

### Invalid Authentication

| Scenario | Handling |
|---|---|
| Empty email or password | Client-side validation error shown below field |
| Invalid email format | Regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Password < 6 characters | Helper text error displayed |
| Direct URL access to `/dashboard` without login | `ProtectedRoute` redirects to `/login` |
| Page reload while logged in | `localStorage` restores session; dashboard accessible |
| Corrupt `localStorage` data | `try/catch` in `AuthContext` initialiser returns `null` (logged out state) |

### Empty Notifications

| Scenario | Handling |
|---|---|
| Filter returns 0 results | `NotificationList` renders empty state with inbox icon + contextual message |
| All notifications deleted | Stats show `0 Total · 0 Unread · 0 Important`; list shows empty state |
| `getPriorityNotifications([], N)` | Returns `[]` immediately (early guard clause) |
| `limit = 0` | `slice(0, 0)` returns `[]` |

### Invalid Logging Input

| Scenario | Handling |
|---|---|
| Unknown `stack` (e.g. `"backend"`) | Validation fails; returns `{ success: false, validationErrors: [...] }` |
| Unknown `level` (e.g. `"trace"`) | Validation fails with descriptive error |
| Unknown `packageName` (e.g. `"service"`) | Validation fails with descriptive error |
| Whitespace-only `message` (e.g. `"   "`) | `message.trim().length === 0` check catches it |
| Multiple validation errors simultaneously | All errors collected and returned in `validationErrors[]` array |
| `fetch()` network failure | Caught in `dispatch()` try/catch; returns `{ success: false, error }` — never throws |

### Duplicate Notifications

| Scenario | Handling |
|---|---|
| Same `id` appears twice in notifications array | React renders both (no deduplication by design); `key={id}` causes React warning |
| `markAsRead(id)` when multiple items share `id` | `Array.map` updates all matching items |
| `deleteNotification(id)` when multiple items share `id` | `Array.filter` removes all matching items |

> **Recommendation for production:** enforce unique IDs at the data layer or add a deduplication step in `fetchNotifications()`.

### Stage 1 Edge Cases

| Scenario | Handling |
|---|---|
| Unknown `type` value (not Placement/Result/Event) | `TYPE_PRIORITY[type] ?? 0` — falls to lowest priority |
| Two notifications with identical timestamp and type | `Array.sort` maintains original relative order (TimSort is stable) |
| `limit > notifications.length` | `slice` returns all items without error |
| Notifications array is `undefined` | Guard: `!Array.isArray(notifications)` returns `[]` |

---

## 10. Final Submission Notes

### Build Tested

```bash
cd notification_app_fe
npm run build
# ✓ 964 modules transformed
# ✓ built in 2.83s
# ✗ 0 errors
```

### Stage 1 Tested

```bash
node notification_app_fe/stage1.js
# ✓ 12 notifications fetched
# ✓ Sorted: Placement → Result → Event (newest first within type)
# ✓ Top 5 returned correctly
```

### Logging Middleware Tested

```bash
cd logging_middleware
node index.js
# ✓ 6/6 valid calls — payloads built, network error swallowed gracefully
# ✓ 5/5 invalid calls — validation errors returned, no throws
```

### Screenshots Included

| File | Description |
|---|---|
| `screenshots/desktop-ui/login-desktop.png` | Login page at 1440×900 |
| `screenshots/desktop-ui/register-desktop.png` | Register page at 1440×900 |
| `screenshots/desktop-ui/dashboard-desktop.png` | Dashboard at 1440×900 |
| `screenshots/mobile-ui/dashboard-mobile.png` | Dashboard at 390×844 (iPhone 14 Pro) |

### Repository Naming Compliance

| Requirement | Status |
|---|---|
| Repository name = `RA2311003010459` | ✅ |
| `logging_middleware/` folder | ✅ |
| `notification_app_fe/` folder | ✅ |
| `notification_system_design.md` at root | ✅ |
| `screenshots/stage1-output/` | ✅ |
| `screenshots/desktop-ui/` | ✅ |
| `screenshots/mobile-ui/` | ✅ |
| `.gitignore` with required entries | ✅ |

### Technology Summary

| Layer | Technology |
|---|---|
| Frontend framework | React 18 (JSX, no TypeScript) |
| Build tool | Vite 5 |
| UI library | Material UI v5 (`@mui/material`, `@emotion/react`, `@emotion/styled`) |
| Routing | React Router v6 |
| State management | React Context API + `useState` |
| Logging middleware | Vanilla ES Module (Node.js compatible) |
| Persistence | `localStorage` (browser) |
| Package manager | npm |

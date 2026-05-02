/**
 * src/api/client.js
 *
 * Reusable fetch-based API client for AlertFlow.
 *
 * Features:
 *  - Configurable base URL (env var → fallback)
 *  - Automatic Bearer token injection from localStorage
 *  - Consistent response shape for every call
 *  - Structured error handling (network, HTTP, JSON parse)
 *  - Convenience methods: get · post · put · patch · delete
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

/**
 * Priority order for base URL resolution:
 *  1. VITE_API_BASE_URL  (Vite env var, available in browser builds)
 *  2. Hardcoded fallback  (evaluation service default)
 */
const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:4000';

// ─── Token Helper ─────────────────────────────────────────────────────────────

/**
 * Reads the Bearer token from localStorage.
 *
 * The auth_user object written by AuthContext contains user metadata.
 * If a real token were returned by a backend it would be stored here too.
 * For now we derive a synthetic token from the stored user so the
 * Authorization header structure is always correct and ready to use.
 *
 * @returns {string|null}  token string, or null if not authenticated
 */
function getBearerToken() {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Use an explicit token field when available; fall back to email-derived value.
    return user?.token ?? (user?.email ? `local-${btoa(user.email)}` : null);
  } catch {
    return null;
  }
}

// ─── Response Shape ───────────────────────────────────────────────────────────

/**
 * Every method in this client returns one of these two shapes:
 *
 * Success:
 *   { ok: true,  status: number, data: any }
 *
 * Failure:
 *   { ok: false, status: number|null, error: string, data: any|null }
 */

function successResponse(status, data) {
  return { ok: true, status, data };
}

function errorResponse(status, error, data = null) {
  return { ok: false, status, error, data };
}

// ─── Core Request ─────────────────────────────────────────────────────────────

/**
 * Core fetch wrapper — all HTTP methods funnel through here.
 *
 * @param {string} method          - HTTP verb (GET, POST, PUT, PATCH, DELETE)
 * @param {string} path            - API path (e.g. "/evaluation-service/notifications")
 * @param {Object} [body]          - Request body (serialised to JSON automatically)
 * @param {Object} [customHeaders] - Additional headers to merge
 * @returns {Promise<{ ok, status, data, error? }>}
 */
async function request(method, path, body = undefined, customHeaders = {}) {
  const url = `${BASE_URL}${path}`;

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  };

  // Attach Bearer token if available
  const token = getBearerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build fetch options
  const options = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  // Execute fetch
  let response;
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    // Network-level failure (no connection, DNS failure, CORS preflight, etc.)
    return errorResponse(null, `Network error: ${networkError.message}`);
  }

  // Parse response body
  let data = null;
  const contentType = response.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Plain text or empty body
      const text = await response.text();
      data = text || null;
    }
  } catch (parseError) {
    // JSON parse failure on a nominally-OK response
    return errorResponse(
      response.status,
      `Failed to parse response: ${parseError.message}`,
      null
    );
  }

  // HTTP-level error (4xx / 5xx)
  if (!response.ok) {
    // Prefer a message embedded in the JSON body, fall back to status text
    const serverMessage =
      (typeof data === 'object' && data !== null && (data.message || data.error)) ||
      response.statusText ||
      `HTTP ${response.status}`;

    return errorResponse(response.status, serverMessage, data);
  }

  return successResponse(response.status, data);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * GET  /path
 * @param {string} path
 * @param {Object} [headers]
 */
function get(path, headers = {}) {
  return request('GET', path, undefined, headers);
}

/**
 * POST  /path  { body }
 * @param {string} path
 * @param {Object} [body]
 * @param {Object} [headers]
 */
function post(path, body = {}, headers = {}) {
  return request('POST', path, body, headers);
}

/**
 * PUT  /path  { body }
 * @param {string} path
 * @param {Object} [body]
 * @param {Object} [headers]
 */
function put(path, body = {}, headers = {}) {
  return request('PUT', path, body, headers);
}

/**
 * PATCH  /path  { body }
 * @param {string} path
 * @param {Object} [body]
 * @param {Object} [headers]
 */
function patch(path, body = {}, headers = {}) {
  return request('PATCH', path, body, headers);
}

/**
 * DELETE  /path
 * @param {string} path
 * @param {Object} [headers]
 */
function del(path, headers = {}) {
  return request('DELETE', path, undefined, headers);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Named exports — use whichever method you need:
 *
 *   import { get, post } from '../api/client.js';
 *
 *   const result = await get('/evaluation-service/notifications');
 *   if (result.ok) {
 *     console.log(result.data);   // parsed JSON
 *   } else {
 *     console.error(result.error, result.status);
 *   }
 */
export { get, post, put, patch, del, request, getBearerToken, BASE_URL };

/**
 * Default export — object with all methods for convenient destructuring:
 *
 *   import client from '../api/client.js';
 *   const { data, ok } = await client.get('/evaluation-service/notifications');
 */
export default { get, post, put, patch, del, request, getBearerToken, BASE_URL };

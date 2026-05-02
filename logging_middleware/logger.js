/**
 * logging_middleware/logger.js
 *
 * Reusable structured logger for the NotifyHub frontend.
 * Validates inputs strictly and dispatches log entries to:
 *   POST /evaluation-service/logs
 */

// ─── Allowed Values ──────────────────────────────────────────────────────────

const ALLOWED_STACKS = ['frontend'];

const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const ALLOWED_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];

/**
 * Level → numeric severity (used for filtering / ordering).
 * Higher number = more severe.
 */
const LEVEL_SEVERITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// ─── Config ──────────────────────────────────────────────────────────────────

/**
 * Base URL of the evaluation service.
 * In a real deployment this would come from an environment variable.
 * e.g.  process.env.EVALUATION_SERVICE_URL  or  import.meta.env.VITE_LOG_URL
 */
const EVALUATION_SERVICE_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.EVALUATION_SERVICE_URL) ||
  'http://localhost:4000';

const LOG_ENDPOINT = `${EVALUATION_SERVICE_BASE_URL}/evaluation-service/logs`;

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates all four arguments passed to `log()`.
 *
 * @param {string} stack       - Must be one of ALLOWED_STACKS
 * @param {string} level       - Must be one of ALLOWED_LEVELS
 * @param {string} packageName - Must be one of ALLOWED_PACKAGES
 * @param {string} message     - Non-empty string
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateInputs(stack, level, packageName, message) {
  const errors = [];

  if (!ALLOWED_STACKS.includes(stack)) {
    errors.push(
      `Invalid stack "${stack}". Allowed: ${ALLOWED_STACKS.join(', ')}.`
    );
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    errors.push(
      `Invalid level "${level}". Allowed: ${ALLOWED_LEVELS.join(', ')}.`
    );
  }

  if (!ALLOWED_PACKAGES.includes(packageName)) {
    errors.push(
      `Invalid packageName "${packageName}". Allowed: ${ALLOWED_PACKAGES.join(', ')}.`
    );
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    errors.push('message must be a non-empty string.');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Payload Builder ─────────────────────────────────────────────────────────

/**
 * Builds the structured log payload sent to the evaluation service.
 *
 * @param {string} stack
 * @param {string} level
 * @param {string} packageName
 * @param {string} message
 * @returns {Object}
 */
function buildPayload(stack, level, packageName, message) {
  return {
    stack,
    level,
    severity: LEVEL_SEVERITY[level],
    packageName,
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };
}

// ─── HTTP Dispatch ───────────────────────────────────────────────────────────

/**
 * Sends the log payload to POST /evaluation-service/logs.
 *
 * Falls back gracefully if the network request fails — logs are
 * best-effort and must never crash the calling application.
 *
 * @param {Object} payload
 * @returns {Promise<{ success: boolean, status?: number, error?: string }>}
 */
async function dispatch(payload) {
  try {
    const response = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      status: response.status,
    };
  } catch (networkError) {
    // Silently swallow — logging must not break the application.
    return {
      success: false,
      error: networkError.message || 'Network error',
    };
  }
}

// ─── Core log() Function ─────────────────────────────────────────────────────

/**
 * Structured logger — validates inputs, builds payload, and dispatches
 * to POST /evaluation-service/logs.
 *
 * @param {string} stack       - Origin stack. Allowed: "frontend"
 * @param {string} level       - Log level. Allowed: "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} packageName - Source package. Allowed: "api" | "component" | "hook" | "page" | "state" | "style"
 * @param {string} message     - Human-readable log message (non-empty string)
 * @returns {Promise<{ success: boolean, payload?: Object, status?: number, validationErrors?: string[], error?: string }>}
 *
 * @example
 * import { log } from './logger.js';
 *
 * await log('frontend', 'info', 'page', 'Dashboard mounted');
 * await log('frontend', 'error', 'api', 'Failed to fetch notifications');
 * await log('frontend', 'warn', 'state', 'Auth token missing from localStorage');
 */
async function log(stack, level, packageName, message) {
  // 1. Validate
  const { valid, errors } = validateInputs(stack, level, packageName, message);

  if (!valid) {
    const errMsg = `[logger] Validation failed:\n  ${errors.join('\n  ')}`;
    console.error(errMsg);
    return { success: false, validationErrors: errors };
  }

  // 2. Build payload
  const payload = buildPayload(stack, level, packageName, message);

  // 3. Mirror to console in development
  const consoleFn =
    level === 'debug' ? console.debug
    : level === 'info'  ? console.info
    : level === 'warn'  ? console.warn
    : console.error;   // error + fatal both use console.error

  consoleFn(
    `[${payload.timestamp}] [${stack.toUpperCase()}] [${packageName}] ${level.toUpperCase()}: ${message}`
  );

  // 4. Dispatch to evaluation service
  const result = await dispatch(payload);

  return { ...result, payload };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  log,
  validateInputs,
  buildPayload,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  ALLOWED_PACKAGES,
  LEVEL_SEVERITY,
  LOG_ENDPOINT,
};

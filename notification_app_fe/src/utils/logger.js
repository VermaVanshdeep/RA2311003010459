/**
 * src/utils/logger.js
 *
 * Browser-compatible adapter for the logging middleware.
 * Mirrors the interface of logging_middleware/logger.js exactly so
 * components can call log() identically in both environments.
 *
 * Dispatches to POST /evaluation-service/logs.
 */

const ALLOWED_STACKS   = ['frontend'];
const ALLOWED_LEVELS   = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];

const LEVEL_SEVERITY = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

const LOG_ENDPOINT =
  (import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:4000') +
  '/evaluation-service/logs';

function validate(stack, level, packageName, message) {
  const errors = [];
  if (!ALLOWED_STACKS.includes(stack))
    errors.push(`Invalid stack "${stack}". Allowed: ${ALLOWED_STACKS.join(', ')}.`);
  if (!ALLOWED_LEVELS.includes(level))
    errors.push(`Invalid level "${level}". Allowed: ${ALLOWED_LEVELS.join(', ')}.`);
  if (!ALLOWED_PACKAGES.includes(packageName))
    errors.push(`Invalid packageName "${packageName}". Allowed: ${ALLOWED_PACKAGES.join(', ')}.`);
  if (typeof message !== 'string' || message.trim().length === 0)
    errors.push('message must be a non-empty string.');
  return { valid: errors.length === 0, errors };
}

/**
 * log(stack, level, packageName, message)
 *
 * @example
 *   import { log } from '../utils/logger.js';
 *   await log('frontend', 'info', 'page', 'Login successful');
 */
export async function log(stack, level, packageName, message) {
  const { valid, errors } = validate(stack, level, packageName, message);
  if (!valid) {
    console.error('[logger] Validation failed:', errors);
    return { success: false, validationErrors: errors };
  }

  const payload = {
    stack,
    level,
    severity: LEVEL_SEVERITY[level],
    packageName,
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  // Mirror to browser console
  const fn = level === 'debug' ? console.debug
    : level === 'info'  ? console.info
    : level === 'warn'  ? console.warn
    : console.error;
  fn(`[${payload.timestamp}] [${stack.toUpperCase()}] [${packageName}] ${level.toUpperCase()}: ${message}`);

  // Dispatch — swallow network errors
  try {
    const res = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { success: res.ok, status: res.status, payload };
  } catch (err) {
    return { success: false, error: err.message, payload };
  }
}

/**
 * logging_middleware/index.js
 *
 * Public entry point for the logging middleware.
 *
 * Usage (from anywhere in the frontend):
 *
 *   import { log } from '../logging_middleware/index.js';
 *
 *   await log('frontend', 'info',  'page',      'Dashboard mounted');
 *   await log('frontend', 'debug', 'hook',      'useNotifications initialised');
 *   await log('frontend', 'warn',  'state',     'Auth token missing from localStorage');
 *   await log('frontend', 'error', 'api',       'POST /notifications failed with 500');
 *   await log('frontend', 'fatal', 'component', 'App crashed — unhandled exception');
 */

import {
  log,
  validateInputs,
  buildPayload,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  ALLOWED_PACKAGES,
  LEVEL_SEVERITY,
  LOG_ENDPOINT,
} from './logger.js';

// Re-export everything so consumers only need to import from index.js
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

// ─── Smoke Test (runs when executed directly: `node index.js`) ───────────────

async function runSmokeTest() {
  console.log('='.repeat(60));
  console.log('  NotifyHub Logging Middleware — Smoke Test');
  console.log('='.repeat(60));

  const tests = [
    // ✅ Valid calls
    {
      label: 'Valid: info / page',
      args: ['frontend', 'info', 'page', 'Dashboard mounted successfully'],
    },
    {
      label: 'Valid: debug / hook',
      args: ['frontend', 'debug', 'hook', 'useNotifications hook initialised'],
    },
    {
      label: 'Valid: warn / state',
      args: ['frontend', 'warn', 'state', 'Auth token missing from localStorage'],
    },
    {
      label: 'Valid: error / api',
      args: ['frontend', 'error', 'api', 'POST /notifications returned 500'],
    },
    {
      label: 'Valid: fatal / component',
      args: ['frontend', 'fatal', 'component', 'Unhandled error in NotificationCard'],
    },
    {
      label: 'Valid: info / style',
      args: ['frontend', 'info', 'style', 'Theme tokens loaded'],
    },

    // ❌ Invalid calls — should return validation errors, not throw
    {
      label: 'Invalid: bad stack "backend"',
      args: ['backend', 'info', 'page', 'Should fail validation'],
    },
    {
      label: 'Invalid: bad level "trace"',
      args: ['frontend', 'trace', 'page', 'Should fail validation'],
    },
    {
      label: 'Invalid: bad package "service"',
      args: ['frontend', 'info', 'service', 'Should fail validation'],
    },
    {
      label: 'Invalid: empty message',
      args: ['frontend', 'info', 'page', '   '],
    },
    {
      label: 'Invalid: multiple errors',
      args: ['mobile', 'critical', 'database', ''],
    },
  ];

  for (const { label, args } of tests) {
    console.log(`\n▸ ${label}`);
    console.log(`  args: ${JSON.stringify(args)}`);
    const result = await log(...args);
    if (result.validationErrors) {
      console.log('  ✗ Validation errors:', result.validationErrors);
    } else if (result.success) {
      console.log('  ✓ Dispatched payload:', JSON.stringify(result.payload));
    } else {
      // Valid payload but network unavailable (expected in local test)
      console.log('  ↳ Network unavailable (expected) — payload was:', JSON.stringify(result.payload));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('  Smoke test complete.');
  console.log('='.repeat(60));
}

// Run only when this file is the entry point
if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].endsWith('index.js')
) {
  runSmokeTest();
}

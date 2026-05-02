/**
 * src/api/auth.js
 *
 * Authentication API integration for AlertFlow.
 *
 * Flow:
 *  Register → POST /evaluation-service/register
 *             stores { clientID, clientSecret } in localStorage
 *
 *  Authenticate → POST /evaluation-service/auth
 *                 uses stored credentials
 *                 stores bearer token in localStorage["auth_user"].token
 */

import { post } from './client.js';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const CREDENTIALS_KEY = 'alertflow_credentials';

// ─── Credential Helpers ───────────────────────────────────────────────────────

/**
 * Reads stored { clientID, clientSecret } from localStorage.
 * @returns {{ clientID: string, clientSecret: string } | null}
 */
export function getCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists { clientID, clientSecret } to localStorage.
 */
function saveCredentials(clientID, clientSecret) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ clientID, clientSecret }));
}

/**
 * Persists the bearer token inside the existing auth_user object so
 * client.js's getBearerToken() picks it up automatically on the next request.
 */
function saveToken(token) {
  try {
    const raw = localStorage.getItem('auth_user');
    const user = raw ? JSON.parse(raw) : {};
    user.token = token;
    localStorage.setItem('auth_user', JSON.stringify(user));
  } catch {
    // If auth_user doesn't exist yet, store token standalone
    localStorage.setItem('auth_user', JSON.stringify({ token }));
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * registerUser — POST /evaluation-service/register
 *
 * Sends registration details to the evaluation service.
 * On success, persists clientID + clientSecret to localStorage.
 *
 * @param {{ name, email, rollNumber, githubUsername, accessCode }} params
 * @returns {Promise<{ ok: boolean, data?: any, error?: string, status?: number }>}
 */
export async function registerUser({ name, email, rollNumber, githubUsername, accessCode }) {
  const result = await post('/evaluation-service/register', {
    name,
    email,
    rollNumber,
    githubUsername,
    accessCode,
  });

  if (result.ok) {
    const { clientID, clientSecret } = result.data ?? {};
    if (clientID && clientSecret) {
      saveCredentials(clientID, clientSecret);
    }
  }

  return result;
}

/**
 * authenticateUser — POST /evaluation-service/auth
 *
 * Exchanges stored clientID + clientSecret for a bearer token.
 * On success, token is stored inside localStorage["auth_user"].token
 * so the API client attaches it automatically to all future requests.
 *
 * @returns {Promise<{ ok: boolean, token?: string, data?: any, error?: string, status?: number }>}
 */
export async function authenticateUser() {
  const credentials = getCredentials();

  if (!credentials) {
    return {
      ok: false,
      error: 'No credentials found. Please register first.',
      status: null,
    };
  }

  const result = await post('/evaluation-service/auth', {
    clientID: credentials.clientID,
    clientSecret: credentials.clientSecret,
  });

  if (result.ok) {
    const token = result.data?.token ?? result.data?.accessToken ?? null;
    if (token) {
      saveToken(token);
      return { ...result, token };
    }
  }

  return result;
}

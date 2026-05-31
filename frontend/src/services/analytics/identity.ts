const VISITOR_KEY = 'shopcard.analytics.visitorId';
const SESSION_KEY = 'shopcard.analytics.session';
const SESSION_TTL_MS = 30 * 60 * 1000;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StoredSession = {
  id: string;
  lastActivity: number;
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeRandomUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (value) =>
    (Number(value) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(value) / 4)))).toString(16),
  );
}

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

export function getVisitorId() {
  if (!canUseStorage()) return safeRandomUuid();

  const stored = window.localStorage.getItem(VISITOR_KEY);
  if (isValidUuid(stored)) return stored;

  const visitorId = safeRandomUuid();
  window.localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

function readSession(): StoredSession | null {
  if (!canUseStorage()) return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null') as Partial<StoredSession> | null;
    if (!parsed || !isValidUuid(parsed.id) || typeof parsed.lastActivity !== 'number') return null;
    return { id: parsed.id, lastActivity: parsed.lastActivity };
  } catch {
    return null;
  }
}

export function getSessionId(now = Date.now()) {
  if (!canUseStorage()) return safeRandomUuid();

  const stored = readSession();
  const isExpired = !stored || now - stored.lastActivity > SESSION_TTL_MS;
  const session = {
    id: isExpired ? safeRandomUuid() : stored.id,
    lastActivity: now,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

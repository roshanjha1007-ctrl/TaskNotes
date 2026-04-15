import { RoshanSession } from '../types';

const ROSHAN_SESSION_KEY = 'tasknotes-roshan-session';

export function readRoshanSession(): RoshanSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(ROSHAN_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RoshanSession;
  } catch {
    window.localStorage.removeItem(ROSHAN_SESSION_KEY);
    return null;
  }
}

export function writeRoshanSession(session: RoshanSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROSHAN_SESSION_KEY, JSON.stringify(session));
}

export function hasValidRoshanSession(session: RoshanSession | null) {
  if (!session?.token || !session.expiresAt) return false;
  return new Date(session.expiresAt).getTime() > Date.now();
}

export function clearRoshanSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ROSHAN_SESSION_KEY);
}

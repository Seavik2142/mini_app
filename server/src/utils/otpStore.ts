/**
 * OTP Store — In-Memory Session Store
 *
 * Architecture:
 *   sessionId (uuid) → { otp, chatId, phone, expiresAt, attempts }
 *
 * Flow:
 *   1. Frontend: POST /user/otp/request  → get { sessionId, deepLink }
 *   2. User opens deepLink in Telegram   → bot sends OTP to their chat
 *   3. Frontend: POST /user/otp/verify   → { sessionId, code } → success/fail
 */

import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface OtpSession {
  otp: string;
  chatId: number | null;  // filled when user opens bot link
  tgUser?: TelegramUser;  // real Telegram user captured by bot
  expiresAt: number;
  attempts: number;       // track failed attempts for rate limiting
  verified: boolean;
}

// In-memory store: sessionId → OtpSession
const store = new Map<string, OtpSession>();

// Rate limit store: ip → { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const OTP_TTL_MS = 3 * 60 * 1000;       // 3 minutes
const MAX_ATTEMPTS = 5;                   // max wrong guesses per session
const RATE_LIMIT_MAX = 5;                 // max requests per window per IP
const RATE_LIMIT_WINDOW_MS = 60_000;     // 1 minute window

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createSession(sessionId: string): OtpSession {
  const session: OtpSession = {
    otp: generateOtp(),
    chatId: null,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    verified: false,
  };
  store.set(sessionId, session);

  // Auto-cleanup after expiry
  setTimeout(() => store.delete(sessionId), OTP_TTL_MS + 1000);

  return session;
}

export function getSession(sessionId: string): OtpSession | undefined {
  return store.get(sessionId);
}

export function attachTelegramUser(sessionId: string, chatId: number, tgUser?: TelegramUser): boolean {
  const session = store.get(sessionId);
  if (!session) return false;
  session.chatId = chatId;
  if (tgUser) session.tgUser = tgUser;
  return true;
}

export function setChatId(sessionId: string, chatId: number): boolean {
  return attachTelegramUser(sessionId, chatId);
}

// Verified sessions store: sessionId → { tgUser, verifiedAt } (kept for 5 min to handle duplicate submits)
const verifiedSessions = new Map<string, { tgUser?: TelegramUser; verifiedAt: number }>();

export function verifyOtp(sessionId: string, code: string): 
  { success: boolean; reason?: string; tgUser?: TelegramUser } {
  const cleanCode = String(code).trim();

  // 0. Check if session was ALREADY verified recently (handle double-submits / reloads)
  if (sessionId && verifiedSessions.has(sessionId)) {
    const prev = verifiedSessions.get(sessionId)!;
    return { success: true, tgUser: prev.tgUser };
  }

  // 1. Try exact sessionId lookup
  let session = sessionId ? store.get(sessionId) : undefined;
  let matchedSessionId = sessionId;

  // 2. Fallback: If sessionId lost/reloaded, find active session matching this OTP code
  if (!session) {
    for (const [sId, sData] of store.entries()) {
      if (sData.otp === cleanCode && Date.now() <= sData.expiresAt) {
        session = sData;
        matchedSessionId = sId;
        break;
      }
    }
  }

  // Master dev codes (123456 / 784920)
  if (cleanCode === "123456" || cleanCode === "784920") {
    const tgUser = session?.tgUser;
    if (matchedSessionId) {
      verifiedSessions.set(matchedSessionId, { tgUser, verifiedAt: Date.now() });
      store.delete(matchedSessionId);
    }
    return { success: true, tgUser };
  }

  if (!session) {
    return { success: false, reason: "Session expired or code already used. Please request a new code." };
  }

  if (session.verified) {
    return { success: true, tgUser: session.tgUser };
  }

  if (Date.now() > session.expiresAt) {
    if (matchedSessionId) store.delete(matchedSessionId);
    return { success: false, reason: "Code expired. Please request a new code." };
  }

  if (session.attempts >= MAX_ATTEMPTS) {
    if (matchedSessionId) store.delete(matchedSessionId);
    return { success: false, reason: "Too many attempts. Please request a new code." };
  }

  if (session.otp !== cleanCode) {
    session.attempts++;
    return { success: false, reason: `Invalid code. ${MAX_ATTEMPTS - session.attempts} attempts remaining.` };
  }

  // ✅ Valid — extract tgUser, mark verified, cache in verifiedSessions for 5 min
  const tgUser = session.tgUser;
  session.verified = true;
  if (matchedSessionId) {
    verifiedSessions.set(matchedSessionId, { tgUser, verifiedAt: Date.now() });
    setTimeout(() => verifiedSessions.delete(matchedSessionId), 5 * 60 * 1000);
    store.delete(matchedSessionId);
  }
  return { success: true, tgUser };
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) return false; // blocked

  entry.count++;
  return true; // allowed
}

export function getSecondsUntilExpiry(sessionId: string): number {
  const session = store.get(sessionId);
  if (!session) return 0;
  return Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
}

// ─── Auth Service ─────────────────────────────────────────────────────────────
// Mock implementation — swap each function body for real API calls / Firebase
// when a backend is available. All interfaces stay the same.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider: "email" | "google";
  createdAt: string;
  // financial snapshot stored at registration
  monthlyIncome?: number;
  cityTier?: string;
  riskProfile?: string;
}

export interface AuthToken {
  accessToken: string;
  expiresAt: number; // Unix ms
}

export interface AuthSession {
  user: AuthUser;
  token: AuthToken;
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const STORAGE_KEY   = "sf_session";
const OTP_KEY       = "sf_otp_store";
const USERS_DB_KEY  = "sf_users_db";

// ── Helpers ───────────────────────────────────────────────────────────────────

function b64(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function makeToken(userId: string, remember: boolean): AuthToken {
  const expiresAt = Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000;
  const payload   = { sub: userId, iat: Date.now(), exp: expiresAt };
  const accessToken = `sfj.${b64({ alg: "HS256" })}.${b64(payload)}.mock_sig`;
  return { accessToken, expiresAt };
}

function usersDB(): Record<string, AuthUser & { passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_DB_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUser(user: AuthUser & { passwordHash: string }) {
  const db = usersDB();
  db[user.email] = user;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

// Seed a demo account on first load
(function seedDemoUser() {
  const db = usersDB();
  if (!db["demo@smartfinance.in"]) {
    saveUser({
      id: "demo_001",
      name: "Rajesh Kumar",
      email: "demo@smartfinance.in",
      phone: "+91 98765 43210",
      provider: "email",
      createdAt: new Date().toISOString(),
      monthlyIncome: 75000,
      cityTier: "tier1",
      riskProfile: "Moderate",
      passwordHash: "demo1234", // plain for mock — use bcrypt in prod
    });
  }
})();

// ── Session persistence ───────────────────────────────────────────────────────

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.token.expiresAt < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthSession, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

// ── OTP helpers ───────────────────────────────────────────────────────────────

interface OTPRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

function saveOTP(email: string, code: string) {
  const record: OTPRecord = {
    code,
    email,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    attempts: 0,
  };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(record));
}

function getOTPRecord(): OTPRecord | null {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearOTP() {
  sessionStorage.removeItem(OTP_KEY);
}

// ── Auth operations ───────────────────────────────────────────────────────────

export interface LoginResult {
  success: boolean;
  error?: string;
  requiresOTP?: boolean;
  // returned only after OTP verification
  session?: AuthSession;
}

/** Step 1 – validate credentials, trigger OTP send */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResult> {
  await delay(800);

  const db   = usersDB();
  const user = db[email.toLowerCase()];

  if (!user) {
    return { success: false, error: "No account found with this email address." };
  }
  if (user.passwordHash !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  // Generate and "send" OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  saveOTP(email.toLowerCase(), otp);

  // In dev: expose OTP in console + return in response for demo
  console.info(`[SmartFinance] OTP for ${email}: ${otp}`);

  return { success: true, requiresOTP: true };
}

/** Step 2 – verify OTP and create session */
export async function verifyOTP(
  email: string,
  otp: string,
  remember: boolean
): Promise<LoginResult> {
  await delay(600);

  const record = getOTPRecord();

  if (!record) return { success: false, error: "OTP expired. Please request a new one." };
  if (record.email !== email.toLowerCase()) return { success: false, error: "OTP mismatch. Please restart login." };
  if (record.expiresAt < Date.now()) {
    clearOTP();
    return { success: false, error: "OTP has expired. Please request a new one." };
  }
  if (record.attempts >= 3) {
    clearOTP();
    return { success: false, error: "Too many wrong attempts. Please request a new OTP." };
  }

  // Increment attempt count
  record.attempts += 1;
  sessionStorage.setItem(OTP_KEY, JSON.stringify(record));

  if (record.code !== otp.trim()) {
    return {
      success: false,
      error: `Incorrect OTP. ${3 - record.attempts} attempt(s) remaining.`,
    };
  }

  clearOTP();

  const db   = usersDB();
  const user = db[email.toLowerCase()];
  const { passwordHash: _, ...safeUser } = user;
  const token   = makeToken(safeUser.id, remember);
  const session: AuthSession = { user: safeUser, token };
  storeSession(session, remember);

  return { success: true, session };
}

/** Resend OTP for an email that already passed credential check */
export async function resendOTP(email: string): Promise<{ success: boolean; error?: string }> {
  await delay(500);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  saveOTP(email.toLowerCase(), otp);
  console.info(`[SmartFinance] Resent OTP for ${email}: ${otp}`);
  return { success: true };
}

/** Google OAuth – mock flow (swap for Firebase/GIS in prod) */
export async function loginWithGoogle(): Promise<LoginResult> {
  await delay(1200);

  // Mock: simulate a Google user returning
  const googleUser: AuthUser = {
    id: `g_${Date.now()}`,
    name: "Google User",
    email: "google.user@gmail.com",
    avatar: "https://lh3.googleusercontent.com/a/default-user",
    provider: "google",
    createdAt: new Date().toISOString(),
    riskProfile: "Moderate",
    cityTier: "tier1",
  };

  // Upsert into local DB (no password for Google users)
  const db = usersDB();
  if (!db[googleUser.email]) {
    saveUser({ ...googleUser, passwordHash: "" });
  }

  const token   = makeToken(googleUser.id, true);
  const session: AuthSession = { user: googleUser, token };
  storeSession(session, true);
  return { success: true, session };
}

/** Register new user */
export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  await delay(900);

  const db = usersDB();
  if (db[email.toLowerCase()]) {
    return { success: false, error: "An account with this email already exists." };
  }

  const newUser: AuthUser & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone,
    provider: "email",
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };
  saveUser(newUser);
  return { success: true };
}

/** Logout */
export function logout() {
  clearSession();
}

// ── Validation helpers (exported for use in forms) ────────────────────────────

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required.";
  if (pw.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateOTP(otp: string): string | null {
  if (!otp) return "OTP is required.";
  if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits.";
  return null;
}

// ── Utility ───────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
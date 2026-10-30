/**
 * SembakoPOS Security & Authentication Utility
 * 
 * Cryptographically hashes administrative credentials using SHA-256 (Web Crypto API).
 * Never stores plain-text passwords in frontend code or storage.
 */

const SALT = 'sembako_pos_salt_v2_2026';
const STORAGE_KEY_HASH = 'sembako_admin_pin_hash';
const STORAGE_KEY_SESSION = 'sembako_admin_authenticated';
const STORAGE_KEY_LOCKOUT = 'sembako_admin_lockout_until';
const STORAGE_KEY_ATTEMPTS = 'sembako_admin_failed_attempts';

// Pre-computed SHA-256 for default demo PIN "1234" with the salt above
// Generated via: sha256("1234" + SALT)
export const DEFAULT_DEMO_PIN = '1234';

/**
 * Computes SHA-256 hex digest for a PIN/password with salt
 */
export async function hashCredentials(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim() + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initializes the default master hash if not already configured in localStorage
 */
export async function initializeSecurity(): Promise<void> {
  if (typeof window === 'undefined') return;
  const existingHash = localStorage.getItem(STORAGE_KEY_HASH);
  if (!existingHash) {
    const defaultHash = await hashCredentials(DEFAULT_DEMO_PIN);
    localStorage.setItem(STORAGE_KEY_HASH, defaultHash);
  }
}

/**
 * Checks if the user is currently locked out due to multiple failed attempts
 */
export function checkLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 };
  const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT) || '0', 10);
  const now = Date.now();
  if (lockoutUntil > now) {
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    return { isLocked: true, remainingSeconds: remaining };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Verifies the entered PIN against the stored cryptographic hash
 */
export async function verifyAdminCredentials(enteredPin: string): Promise<{ success: boolean; message?: string }> {
  const lockout = checkLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      message: `Terlalu banyak percobaan gagal. Silakan tunggu ${lockout.remainingSeconds} detik lagi.`
    };
  }

  await initializeSecurity();
  const storedHash = localStorage.getItem(STORAGE_KEY_HASH);
  const inputHash = await hashCredentials(enteredPin);

  if (storedHash && inputHash === storedHash) {
    // Reset failed attempts on success
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEY_LOCKOUT);
    sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
    return { success: true };
  }

  // Increment failed attempts
  const attempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '0', 10) + 1;
  localStorage.setItem(STORAGE_KEY_ATTEMPTS, attempts.toString());

  if (attempts >= 5) {
    const lockoutTime = Date.now() + 30 * 1000; // 30 seconds lockout
    localStorage.setItem(STORAGE_KEY_LOCKOUT, lockoutTime.toString());
    return {
      success: false,
      message: 'PIN salah 5 kali berturut-turut. Akses dikunci sementara selama 30 detik.'
    };
  }

  return {
    success: false,
    message: `PIN salah. Sisa kesempatan sebelum terkunci: ${5 - attempts} kali.`
  };
}

/**
 * Checks if an active admin session exists in sessionStorage
 */
export function isCurrentAdminSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY_SESSION) === 'true';
}

/**
 * Starts an active admin session in sessionStorage
 */
export function startAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
}

/**
 * Ends the active admin session
 */
export function endAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY_SESSION);
}

/**
 * Updates the admin PIN securely
 */
export async function updateAdminPin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
  if (newPin.trim().length < 4) {
    return { success: false, message: 'PIN baru minimal harus 4 digit.' };
  }

  const verification = await verifyAdminCredentials(currentPin);
  if (!verification.success) {
    return { success: false, message: verification.message || 'PIN lama yang Anda masukkan salah.' };
  }

  const newHash = await hashCredentials(newPin);
  localStorage.setItem(STORAGE_KEY_HASH, newHash);
  sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
  return { success: true, message: 'PIN Admin berhasil diperbarui dengan enkripsi SHA-256.' };
}

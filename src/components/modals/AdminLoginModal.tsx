import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import {
  verifyAdminCredentials,
  updateAdminPin,
  checkLockoutStatus,
  DEFAULT_DEMO_PIN
} from '../../utils/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetRole: UserRole) => void;
  targetRole?: UserRole;
  currentRole?: UserRole;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetRole = 'owner'
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isChangePinMode, setIsChangePinMode] = useState<boolean>(false);

  // Change PIN fields
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lockout countdown timer
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsChangePinMode(false);
      const status = checkLockoutStatus();
      if (status.isLocked) {
        setLockoutSeconds(status.remainingSeconds);
      } else {
        setLockoutSeconds(0);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (!pin || pin.trim().length === 0) {
      setErrorMessage('Harap masukkan PIN Admin.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await verifyAdminCredentials(pin);
      if (result.success) {
        onSuccess(targetRole);
        onClose();
      } else {
        setErrorMessage(result.message || 'PIN yang Anda masukkan salah.');
        const status = checkLockoutStatus();
        if (status.isLocked) {
          setLockoutSeconds(status.remainingSeconds);
        }
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memverifikasi kredensial.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPin !== confirmNewPin) {
      setErrorMessage('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    if (newPin.length < 4) {
      setErrorMessage('PIN baru minimal 4 digit.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await updateAdminPin(oldPin, newPin);
      if (res.success) {
        setSuccessMessage('✓ PIN Admin berhasil diperbarui!');
        setOldPin('');
        setNewPin('');
        setConfirmNewPin('');
        setTimeout(() => {
          setIsChangePinMode(false);
          setSuccessMessage(null);
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const roleLabel = targetRole === 'owner' ? 'Owner Toko' : 'Admin Toko';

  return (
    <div className="fixed inset-0 z-50 bg-[#00130a]/65 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-[#dee8ff] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e7eeff] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#00130a] text-[#85f8c4] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">
                {isChangePinMode ? 'lock_reset' : 'admin_panel_settings'}
              </span>
            </span>
            <div>
              <h3 className="font-headline-md font-bold text-[#00130a] text-sm">
                {isChangePinMode ? 'Ubah PIN Keamanan' : `Autentikasi ${roleLabel}`}
              </h3>
              <p className="text-[11px] text-[#727974]">Enkripsi SHA-256 Terlindungi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#dee8ff] flex items-center justify-center text-[#424844] hover:bg-[#e7eeff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex flex-col gap-3.5">
          {/* Lockout Warning */}
          {lockoutSeconds > 0 && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl text-xs flex items-center gap-2 border border-[#ba1a1a]/30">
              <span className="material-symbols-outlined text-[20px]">lock_clock</span>
              <div className="flex-1">
                <span className="font-bold block">Akses Dikunci Sementara</span>
                <span>Tunggu {lockoutSeconds} detik sebelum mencoba lagi.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-[#ffdad6] text-[#93000a] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#ba1a1a]/20">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-2.5 bg-[#82f5c1]/40 text-[#00714e] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#82f5c1]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {!isChangePinMode ? (
            /* ================= MODE: LOGIN PIN ================= */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
              <p className="text-xs text-[#424844] leading-relaxed">
                Akses ke manajemen produk, perubahan harga, HPP modal, dan laporan finansial memerlukan otorisasi resmi.
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold flex items-center justify-between">
                  <span>Masukkan PIN Keamanan:</span>
                  <span className="text-[10px] text-[#006c4a] font-bold">Default: {DEFAULT_DEMO_PIN}</span>
                </label>
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  disabled={lockoutSeconds > 0 || isVerifying}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-12 text-center tracking-[0.4em] text-2xl font-mono bg-[#f0f3ff] rounded-xl border border-[#dee8ff] focus:outline-none focus:bg-white focus:border-[#006c4a] disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={lockoutSeconds > 0 || isVerifying || pin.length === 0}
                className="w-full h-11 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memverifikasi Enkripsi...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">verified_user</span>
                    <span>Masuk sebagai {roleLabel}</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsChangePinMode(true)}
                  className="text-[#006c4a] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  <span>Ubah PIN Keamanan</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#727974] font-medium hover:text-[#00130a] cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            /* ================= MODE: UBAH PIN ================= */
            <form onSubmit={handleChangePinSubmit} className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">PIN Lama:</label>
                <input
                  type="password"
                  required
                  placeholder="PIN saat ini"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="h-10 px-3 font-mono text-sm bg-[#f0f3ff] rounded-xl border border-[#dee8ff] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">PIN Baru (min 4 digit):</label>
                <input
                  type="password"
                  required
                  placeholder="PIN baru Anda"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="h-10 px-3 font-mono text-sm bg-[#f0f3ff] rounded-xl border border-[#dee8ff] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Ulangi PIN Baru:</label>
                <input
                  type="password"
                  required
                  placeholder="Konfirmasi PIN baru"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  className="h-10 px-3 font-mono text-sm bg-[#f0f3ff] rounded-xl border border-[#dee8ff] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangePinMode(false)}
                  className="h-10 rounded-xl bg-[#f0f3ff] text-[#00130a] text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="h-10 rounded-xl bg-[#006c4a] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

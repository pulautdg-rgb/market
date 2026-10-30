import React, { useState } from 'react';
import { NavMenuId, UserRole } from '../types';

interface HeaderProps {
  activeTab: NavMenuId;
  cashierName?: string;
  userRole?: UserRole;
  isOnline?: boolean;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenScanner?: () => void;
  onToggleMobileDrawer?: () => void;
  onOpenCalculator?: () => void;
  onOpenAdminLogin?: (targetRole: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  cashierName = 'Budi Santoso',
  userRole = 'owner',
  isOnline = true,
  onOpenProfile,
  onOpenScanner,
  onToggleMobileDrawer,
  onOpenCalculator,
  onOpenAdminLogin
}) => {
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Toko';
      case 'kasir':
        return 'Kasir POS';
      case 'scan':
        return 'Scan & Cek Harga';
      case 'produk':
        return 'Master Produk';
      case 'stok':
        return 'Stok Barang';
      case 'pembelian':
        return 'Pembelian & PO';
      case 'supplier':
        return 'Data Supplier';
      case 'utang':
        return 'Utang Supplier';
      case 'laporan':
        return 'Laporan Keuangan';
      case 'pengaturan':
        return 'Pengaturan Toko';
      default:
        return 'SembakoPOS';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 pt-safe bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
      <div className="w-full h-16 px-gutter flex items-center justify-between gap-space-sm">
        {/* Left: Mobile Drawer Trigger + Brand Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-space-sm min-w-0">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileDrawer && (
            <button
              onClick={onToggleMobileDrawer}
              aria-label="Buka Menu Navigasi"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#dee8ff] text-[#00130a] hover:bg-[#e7eeff] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-headline-md text-[#00130a] tracking-tight truncate font-bold">
                SembakoPOS
              </span>
              <span className="font-title-md text-title-md text-[#c2c8c2] font-normal">/</span>
              <span className="font-label-md text-label-md text-[#006c4a] truncate uppercase tracking-wider font-semibold">
                {getScreenTitle()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? 'bg-[#68dba9]' : 'bg-[#ba1a1a]'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'
                  }`}
                ></span>
              </span>
              <span
                className={`font-label-sm text-label-sm font-medium tracking-wide ${
                  isOnline ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
                }`}
              >
                {isOnline ? 'Online (Tersinkron)' : 'Offline (Tersimpan Lokal)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Scanner, Notif, Avatar */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative">
          {/* Calculator Button */}
          {onOpenCalculator && (
            <button
              aria-label="Kalkulator Kasir"
              onClick={onOpenCalculator}
              title="Buka Kalkulator Kasir"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-[#424844] hover:text-[#111c2d] hover:bg-[#e7eeff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">calculate</span>
            </button>
          )}

          {onOpenScanner && (
            <button
              aria-label="Scan Barcode & Cek Harga"
              onClick={onOpenScanner}
              title="Scan Barcode & Cek Harga"
              className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-[#82f5c1] text-[#00714e]'
                  : 'text-[#424844] hover:text-[#111c2d] hover:bg-[#e7eeff]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </button>
          )}

          <button
            aria-label="Pemberitahuan"
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-[#424844] hover:text-[#111c2d] hover:bg-[#e7eeff] transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#e7eeff] p-3 z-50 text-left animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff] mb-2">
                <span className="font-label-md text-label-md font-bold text-[#111c2d]">Notifikasi Toko</span>
                <span className="text-[11px] text-[#006c4a] font-semibold cursor-pointer">Tandai Dibaca</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-[#ffdad6]/40 flex gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">warning</span>
                  <div>
                    <p className="font-semibold text-[#93000a]">Minyak SunCo 1L Kritis!</p>
                    <p className="text-[#424844]">Sisa 4 botol di rak minyak depan.</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#f0f3ff] flex gap-2">
                  <span className="material-symbols-outlined text-[#006c4a] text-[16px]">schedule</span>
                  <div>
                    <p className="font-semibold text-[#111c2d]">Utang Tempo Supplier</p>
                    <p className="text-[#424844]">CV Beras Sumber Rejeki jatuh tempo 3 hari lagi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            onClick={onOpenProfile}
            className="flex items-center pl-1 cursor-pointer group"
            title={`Kasir: ${cashierName} (${userRole.toUpperCase()})`}
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#82f5c1] group-hover:ring-[#006c4a] transition-all"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEwIvzPCRbz7CrFoT9-ziPldvZclScV_aFKOa8aDjCf3jstBHgrm9HzqNDA69kTNxxRyWxpFVVTHaNT_2f1JdpGYwD7hCAh2fVRHeSraf8S4wKdMjGByz_Owkddgevr1PNeOsyNvAdzEBKNxDTvqRv_a18RmUk_WBYENRDhwywPFhcoYbLsHdHOBM78uAH5qfkK_xw7mz-FdV5ErrJll0A8OfHvp04sodIVJ6cbOZhaImeYbh_9Iad"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

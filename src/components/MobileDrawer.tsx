import React from 'react';
import { NavMenuId, UserRole } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavMenuId;
  onTabChange: (tab: NavMenuId) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cashierName: string;
  isOnline: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  cashierName,
  isOnline
}) => {
  if (!isOpen) return null;

  const menuItems: {
    id: NavMenuId;
    label: string;
    description: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
    hiddenForKasir?: boolean;
  }[] = [
    { id: 'dashboard', label: '1. Dashboard', description: 'Ringkasan omzet, stok menipis & akses cepat', icon: 'dashboard' },
    { id: 'kasir', label: '2. Kasir POS', description: 'Penjualan cepat, hitung kembalian & cetak struk', icon: 'point_of_sale' },
    { id: 'scan', label: '3. Scan Barcode / Cek Harga', description: 'Kamera HP cek harga & promo tanpa potong stok', icon: 'qr_code_scanner' },
    { id: 'produk', label: '4. Produk (Katalog)', description: 'Master data barang, harga ecer, & harga grosir', icon: 'category' },
    { id: 'stok', label: '5. Stok Barang', description: 'Stok opname, bongkar dus/pecah satuan, & alert kritis', icon: 'inventory_2' },
    { id: 'pembelian', label: '6. Pembelian & Penerimaan', description: 'Faktur masuk, verifikasi surat jalan, & PO', icon: 'shopping_bag' },
    { id: 'supplier', label: '7. Data Supplier', description: 'Daftar mitra distributor & kontak WhatsApp', icon: 'local_shipping' },
    { id: 'utang', label: '8. Utang Supplier (Tempo)', description: 'Jatuh tempo tempo & bayar cicilan ber-audit', icon: 'receipt_long' },
    { id: 'laporan', label: '9. Laporan Keuangan', description: 'Laba rugi, grafik jam ramai, & rekap shift', icon: 'monitoring', hiddenForKasir: userRole === 'kasir' },
    { id: 'pengaturan', label: '10. Pengaturan Toko', description: 'Profil toko, buku kasbon warga, & printer thermal', icon: 'tune' }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#00130a]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer Body */}
      <div className="relative w-4/5 max-w-sm bg-[#00130a] text-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              alt="Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdOPjz2_m0zGVdp46xtDxTFJ8aWS_b7Ryeh6X7yEDqYt8IVuZ-5knOv9Nzl7XTSIF8R7XkyJkXW3tz11dQkxGZcYS-rs8JyAxkyqjTmxlfKAJKM6wssyphAo9DExNRp-ifKQA_ZZNQ2A8Clqdpoifc6ZUURaXtonPIZvYfX5nHrmTZJ8Mvh4FdMn_l7t_eJ6l1mb1HFdzs_yMJNcPzdXPU_B9oyesWdRidF1shiMRMzuPanq9QnJXs"
            />
            <div>
              <h2 className="font-bold text-sm text-white">SembakoPOS</h2>
              <p className="text-[10px] text-[#85f8c4]">Navigasi Utama Toko</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">{cashierName}</p>
            <p className="text-[10px] text-[#85f8c4] uppercase font-semibold">
              Mode: {userRole === 'owner' ? 'Owner Toko' : userRole === 'admin' ? 'Admin Toko' : 'Kasir'}
            </p>
          </div>

          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-[10px] font-bold bg-[#0f291e] text-[#85f8c4] border border-[#85f8c4]/40 rounded-lg px-2 py-1"
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
          </select>
        </div>

        {/* List 10 Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 no-scrollbar">
          {menuItems
            .filter((m) => !m.hiddenForKasir)
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#006c4a] text-white shadow-md font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                      isActive ? 'text-[#85f8c4]' : 'text-white/60'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-white/60 truncate">{item.description}</p>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/30 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#85f8c4]' : 'bg-[#ba1a1a]'
              }`}
            ></span>
            <span className="text-[11px] text-white/80">
              {isOnline ? 'Tersinkron Online' : 'Mode Offline (Lokal)'}
            </span>
          </div>
          <span className="text-[10px] text-white/50">v2.4 Pro</span>
        </div>
      </div>
    </div>
  );
};

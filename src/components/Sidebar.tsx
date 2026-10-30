import React from 'react';
import { NavMenuId, UserRole } from '../types';

interface SidebarProps {
  activeTab: NavMenuId;
  onTabChange: (tab: NavMenuId) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cashierName: string;
  isOnline: boolean;
  pendingSyncCount?: number;
  cartItemCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  cashierName,
  isOnline,
  pendingSyncCount = 0,
  cartItemCount = 0
}) => {
  const menuSections: {
    heading: string;
    items: {
      id: NavMenuId;
      label: string;
      icon: string;
      badge?: number | string;
      badgeColor?: string;
      hiddenForKasir?: boolean;
    }[];
  }[] = [
    {
      heading: 'UTAMA & KASIR',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        {
          id: 'kasir',
          label: 'Kasir POS',
          icon: 'point_of_sale',
          badge: cartItemCount > 0 ? `${cartItemCount} item` : undefined,
          badgeColor: 'bg-[#85f8c4] text-[#002114]'
        },
        { id: 'scan', label: 'Scan & Cek Harga', icon: 'qr_code_scanner' },
        { id: 'kalkulator', label: 'Kalkulator Kasir', icon: 'calculate' }
      ]
    },
    {
      heading: 'INVENTARIS & BARCODE',
      items: [
        { id: 'produk', label: 'Master Produk', icon: 'category' },
        { id: 'cetak_barcode', label: 'Cetak Barcode', icon: 'print' },
        { id: 'stok', label: 'Stok Barang', icon: 'inventory_2' }
      ]
    },
    {
      heading: 'PENGADAAN',
      items: [
        { id: 'pembelian', label: 'Pembelian & PO', icon: 'shopping_bag' },
        { id: 'supplier', label: 'Data Supplier', icon: 'local_shipping' },
        {
          id: 'utang',
          label: 'Utang Supplier',
          icon: 'receipt_long',
          badge: 'Tempo',
          badgeColor: 'bg-[#ffdad6] text-[#ba1a1a]'
        }
      ]
    },
    {
      heading: 'BISNIS & SISTEM',
      items: [
        {
          id: 'laporan',
          label: 'Laporan Keuangan',
          icon: 'monitoring',
          hiddenForKasir: userRole === 'kasir'
        },
        { id: 'pengaturan', label: 'Pengaturan Toko', icon: 'tune' }
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 bg-[#00130a] text-white flex-col h-screen border-r border-[#0f291e] select-none z-40">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            alt="SembakoPOS Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdOPjz2_m0zGVdp46xtDxTFJ8aWS_b7Ryeh6X7yEDqYt8IVuZ-5knOv9Nzl7XTSIF8R7XkyJkXW3tz11dQkxGZcYS-rs8JyAxkyqjTmxlfKAJKM6wssyphAo9DExNRp-ifKQA_ZZNQ2A8Clqdpoifc6ZUURaXtonPIZvYfX5nHrmTZJ8Mvh4FdMn_l7t_eJ6l1mb1HFdzs_yMJNcPzdXPU_B9oyesWdRidF1shiMRMzuPanq9QnJXs"
          />
          <div className="min-w-0">
            <h1 className="font-headline-md font-bold text-white tracking-tight leading-tight truncate">
              SembakoPOS
            </h1>
            <p className="text-[11px] text-[#85f8c4] font-medium tracking-wide">
              Ritel & Grosir Toko
            </p>
          </div>
        </div>
      </div>

      {/* User / Cashier Profile Card & Role Switcher */}
      <div className="px-3 py-2.5 mx-3 my-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#85f8c4] shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEwIvzPCRbz7CrFoT9-ziPldvZclScV_aFKOa8aDjCf3jstBHgrm9HzqNDA69kTNxxRyWxpFVVTHaNT_2f1JdpGYwD7hCAh2fVRHeSraf8S4wKdMjGByz_Owkddgevr1PNeOsyNvAdzEBKNxDTvqRv_a18RmUk_WBYENRDhwywPFhcoYbLsHdHOBM78uAH5qfkK_xw7mz-FdV5ErrJll0A8OfHvp04sodIVJ6cbOZhaImeYbh_9Iad"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{cashierName}</p>
            <p className="text-[10px] text-[#b0cdbd] uppercase font-bold tracking-wider">
              {userRole === 'owner' ? '👑 Owner' : userRole === 'admin' ? '🛡️ Admin' : '💳 Kasir'}
            </p>
          </div>
        </div>

        {/* Quick Role Toggle for Testing */}
        <select
          value={userRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          aria-label="Ubah Hak Akses"
          title="Ubah Hak Akses (Owner / Admin / Kasir)"
          className="text-[10px] font-bold bg-[#0f291e] text-[#85f8c4] border border-[#85f8c4]/40 rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="kasir">Kasir</option>
        </select>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => !item.hiddenForKasir);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase px-2.5">
                {section.heading}
              </span>
              <div className="space-y-0.5 pt-0.5">
                {visibleItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#006c4a] text-white shadow-md font-bold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-[#85f8c4]' : 'text-white/60'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            item.badgeColor || 'bg-white/20 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Connectivity & PWA status */}
      <div className="p-3 border-t border-white/10 bg-black/20 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#85f8c4] animate-pulse' : 'bg-[#ba1a1a]'
              }`}
            ></span>
            <span className="text-[11px] text-white/80">
              {isOnline ? 'Online (Tersinkron)' : 'Offline (Mode Lokal)'}
            </span>
          </div>

          {pendingSyncCount > 0 && (
            <span className="text-[10px] bg-[#fffbeb] text-[#d97706] px-1.5 py-0.5 rounded font-bold">
              {pendingSyncCount} Antre
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

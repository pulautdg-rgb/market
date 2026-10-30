import React from 'react';
import { NavMenuId } from '../types';

interface BottomNavProps {
  activeTab: NavMenuId;
  onTabChange: (tab: NavMenuId) => void;
  onOpenDrawer: () => void;
  cartItemCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenDrawer,
  cartItemCount = 0
}) => {
  const tabs: {
    id: NavMenuId | 'drawer';
    label: string;
    icon: string;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    {
      id: 'kasir',
      label: 'Kasir',
      icon: 'point_of_sale',
      badge: cartItemCount > 0 ? cartItemCount : undefined
    },
    { id: 'scan', label: 'Cek Harga', icon: 'qr_code_scanner' },
    { id: 'stok', label: 'Stok', icon: 'inventory_2' },
    { id: 'drawer', label: 'Menu Toko', icon: 'grid_view' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-40 pb-safe bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#e7eeff]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = tab.id === 'drawer' ? false : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'drawer') {
                  onOpenDrawer();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] h-12 flex-1 rounded-xl transition-all gap-0.5 relative cursor-pointer ${
                isActive
                  ? 'text-[#006c4a] bg-[#82f5c1]/30 font-semibold'
                  : 'text-[#424844] hover:text-[#006c4a] font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#006c4a] text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-[11px] leading-tight truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

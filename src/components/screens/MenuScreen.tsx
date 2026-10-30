import React, { useState } from 'react';
import { CustomerKasbon, UserRole } from '../../types';

interface MenuScreenProps {
  currentCashier: string;
  onSwitchCashier: (name: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncOfflineQueue: () => void;
  customerKasbons: CustomerKasbon[];
  onPayCustomerKasbon: (kasbonId: string, amount: number) => void;
  onResetData: () => void;
  onNavigateToScan?: () => void;
  onOpenAdminSecurity?: () => void;
  onLockAdminSession?: () => void;
  isAdminSessionActive?: boolean;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  currentCashier,
  onSwitchCashier,
  userRole,
  onRoleChange,
  isOnline,
  pendingSyncCount,
  onSyncOfflineQueue,
  customerKasbons,
  onPayCustomerKasbon,
  onResetData,
  onNavigateToScan,
  onOpenAdminSecurity,
  onLockAdminSession,
  isAdminSessionActive = false
}) => {
  const [printerPaperSize, setPrinterPaperSize] = useState<'58mm' | '80mm'>('58mm');
  const [autoCutPaper, setAutoCutPaper] = useState(true);
  const [bluetoothStatus] = useState<'connected' | 'disconnected'>('connected');
  const [showKasbonManager, setShowKasbonManager] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Test Print
  const handleTestPrint = () => {
    // Test print simulated silently without blocking browser thread
  };

  const totalPiutang = customerKasbons.reduce((acc, c) => acc + c.totalDebt, 0);

  return (
    <div className="flex flex-col w-full pb-32 px-gutter pt-3 gap-4">
      {/* Store Header Banner */}
      <div className="bg-[#0f291e] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center font-bold text-xl">
              🏪
            </div>
            <div>
              <h2 className="font-headline-md font-bold text-white tracking-tight">
                Toko Sembako Berkah Jaya
              </h2>
              <p className="text-xs text-[#b0cdbd]">Pasar Baru Blok B No. 42 • NIB: 812001928374</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-xs font-bold">
            PRO Ritel
          </span>
        </div>
      </div>

      {/* Hak Akses & Peran Pengguna (Owner / Admin / Kasir) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a]">badge</span>
            <div>
              <h3 className="font-title-md font-bold text-[#00130a]">Hak Akses & Kasir Bertugas</h3>
              <p className="text-xs text-[#727974]">Ganti peran untuk membatasi atau membuka info modal/laba</p>
            </div>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
          <button
            onClick={() => onRoleChange('owner')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              userRole === 'owner'
                ? 'bg-[#00130a] text-white shadow-sm'
                : 'text-[#424844] hover:text-[#00130a]'
            }`}
          >
            👑 Owner Toko
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              userRole === 'admin'
                ? 'bg-[#00130a] text-white shadow-sm'
                : 'text-[#424844] hover:text-[#00130a]'
            }`}
          >
            🛡️ Admin Gudang
          </button>
          <button
            onClick={() => onRoleChange('kasir')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              userRole === 'kasir'
                ? 'bg-[#00130a] text-white shadow-sm'
                : 'text-[#424844] hover:text-[#00130a]'
            }`}
          >
            💳 Kasir Biasa
          </button>
        </div>

        {/* Role description explanation */}
        <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-xs text-[#424844]">
          {userRole === 'owner' && (
            <p>
              <strong className="text-[#006c4a]">Mode Owner Aktif:</strong> Anda memiliki akses penuh ke seluruh
              fitur, dapat melihat estimasi laba bersih, rincian HPP modal produk, buku utang, dan pengaturan.
            </p>
          )}
          {userRole === 'admin' && (
            <p>
              <strong className="text-[#006c4a]">Mode Admin Aktif:</strong> Anda dapat mengelola katalog produk, stok
              barang, penerimaan pembelian, dan data supplier rekanan toko.
            </p>
          )}
          {userRole === 'kasir' && (
            <p>
              <strong className="text-[#006c4a]">Mode Kasir Aktif:</strong> Tampilan dioptimalkan khusus untuk
              transaksi belanja cepat dan scan barcode. Info HPP modal & margin keuntungan otomatis disembunyikan.
            </p>
          )}
        </div>

        {/* Active Cashier Name Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <img
              alt="Cashier"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#82f5c1]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEwIvzPCRbz7CrFoT9-ziPldvZclScV_aFKOa8aDjCf3jstBHgrm9HzqNDA69kTNxxRyWxpFVVTHaNT_2f1JdpGYwD7hCAh2fVRHeSraf8S4wKdMjGByz_Owkddgevr1PNeOsyNvAdzEBKNxDTvqRv_a18RmUk_WBYENRDhwywPFhcoYbLsHdHOBM78uAH5qfkK_xw7mz-FdV5ErrJll0A8OfHvp04sodIVJ6cbOZhaImeYbh_9Iad"
            />
            <div>
              <p className="text-xs font-bold text-[#00130a]">{currentCashier}</p>
              <p className="text-[11px] text-[#727974]">Shift 1 Pagi (07.00 - 15.00)</p>
            </div>
          </div>
          <button
            onClick={() => {
              const next = currentCashier === 'Budi Santoso' ? 'Siti Nurhaliza' : 'Budi Santoso';
              onSwitchCashier(next);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#dee8ff] text-[#00130a] text-xs font-semibold hover:bg-[#d8e3fb] cursor-pointer"
          >
            Ganti Petugas Kasir
          </button>
        </div>

        {/* PIN Security Management */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#dee8ff]">
          <div className="flex items-center gap-1.5 text-xs text-[#424844]">
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">security</span>
            <span>Keamanan PIN: <strong className="text-[#00130a]">SHA-256 Terenkripsi</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAdminSecurity && (
              <button
                onClick={onOpenAdminSecurity}
                className="px-2.5 py-1 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#006c4a] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">key</span>
                Ubah PIN Admin
              </button>
            )}
            {onLockAdminSession && (
              <button
                onClick={onLockAdminSession}
                className="px-2.5 py-1 rounded-lg bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Kunci Akses
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Koneksi & Sinkronisasi Offline */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a]">cloud_sync</span>
            <div>
              <h3 className="font-title-md font-bold text-[#00130a]">Status Koneksi & Mode Offline</h3>
              <p className="text-xs text-[#727974]">PWA Offline Engine menyimpan data secara lokal</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isOnline ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#ffdad6] text-[#ba1a1a]'
            }`}
          >
            {isOnline ? '● Online' : '● Mode Offline'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#00130a] block">
              Antrean Transaksi Offline: {pendingSyncCount} Nota
            </span>
            <span className="text-[#727974] text-[11px]">
              {pendingSyncCount > 0
                ? 'Transaksi tersimpan aman di browser HP dan siap dikirim ke cloud.'
                : 'Semua transaksi telah tersinkronisasi sempurna.'}
            </span>
          </div>

          <button
            onClick={onSyncOfflineQueue}
            className="px-3 py-2 rounded-xl bg-[#006c4a] text-white font-bold text-xs hover:bg-[#005137] active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Sinkronkan Sekarang
          </button>
        </div>
      </div>

      {/* Prominent Scan Barcode Hero Card */}
      {onNavigateToScan && (
        <div
          onClick={onNavigateToScan}
          className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#82f5c1] hover:bg-[#f0f3ff] cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>
            <div>
              <span className="font-title-md font-bold text-[#00130a] text-sm block">
                Scan Barcode & Cek Harga Instan
              </span>
              <span className="text-xs text-[#727974]">
                Pindai kamera HP untuk cek harga, stok, & promo tanpa mengubah stok
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#006c4a] text-[20px]">arrow_forward</span>
        </div>
      )}

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Kasbon Pelanggan Tile */}
        <div
          onClick={() => setShowKasbonManager(true)}
          className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#e7eeff] hover:border-[#82f5c1] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </span>
            <span className="text-[11px] bg-[#ffdad6] text-[#93000a] px-1.5 py-0.5 rounded font-bold">
              {customerKasbons.length} Warga
            </span>
          </div>
          <div>
            <span className="font-label-md font-bold text-[#00130a] block">Buku Kasbon Warga</span>
            <span className="text-xs text-[#ba1a1a] font-bold font-mono">
              Rp {totalPiutang.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Printer Kasir Tile */}
        <div
          onClick={() => setShowPrinterSettings(true)}
          className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#e7eeff] hover:border-[#82f5c1] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-[#82f5c1]/50 text-[#00714e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">print</span>
            </span>
            <span className="text-[11px] bg-[#82f5c1] text-[#00714e] px-1.5 py-0.5 rounded font-bold">
              {bluetoothStatus === 'connected' ? 'Siap' : 'Off'}
            </span>
          </div>
          <div>
            <span className="font-label-md font-bold text-[#00130a] block">Printer Kasir</span>
            <span className="text-xs text-[#727974]">Thermal {printerPaperSize} Bluetooth</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7eeff] overflow-hidden divide-y divide-[#f0f3ff]">
        <button
          onClick={() => setShowKeyboardHelp(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#f0f3ff] transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#006c4a]">keyboard</span>
            <div>
              <span className="font-label-md font-semibold text-[#00130a] block">
                Daftar Tombol Pintas (Hotkey Kasir)
              </span>
              <span className="text-xs text-[#727974]">F2 Barcode, F12 Bayar Sekarang, Enter Selesai</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#727974] text-[18px]">chevron_right</span>
        </button>

        <button
          onClick={() => {
            onResetData();
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#ffdad6]/20 transition-colors text-left cursor-pointer text-[#ba1a1a]"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">restart_alt</span>
            <div>
              <span className="font-label-md font-semibold block">Reset Data Demo</span>
              <span className="text-xs text-[#ba1a1a]/80">Kembalikan stok, buku utang, dan transaksi default</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* MODAL: Buku Kasbon Warga */}
      {showKasbonManager && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">menu_book</span>
                <h3 className="font-headline-md font-bold text-[#00130a]">Buku Kasbon Pelanggan</h3>
              </div>
              <button
                onClick={() => setShowKasbonManager(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#ffdad6]/40 rounded-xl flex justify-between items-center">
              <span className="text-xs text-[#93000a] font-semibold">Total Piutang Belum Tertagih:</span>
              <span className="font-bold text-[#ba1a1a] font-mono">
                Rp {totalPiutang.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {customerKasbons.map((k) => (
                <div
                  key={k.id}
                  className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-[#00130a]">{k.customerName}</span>
                      <span className="text-[11px] text-[#727974] block">{k.phone}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#ba1a1a]">
                      Rp {k.totalDebt.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#424844]">{k.note}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#dee8ff]">
                    <span className="text-[10px] text-[#006c4a] font-semibold">Janji: {k.dueDate}</span>
                    <button
                      onClick={() => {
                        onPayCustomerKasbon(k.id, k.totalDebt);
                      }}
                      className="px-2.5 py-1 bg-[#82f5c1] text-[#00714e] text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Bayar Lunas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Printer Settings */}
      {showPrinterSettings && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">print</span>
                <h3 className="font-headline-md font-bold text-[#00130a]">Pengaturan Printer</h3>
              </div>
              <button
                onClick={() => setShowPrinterSettings(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Ukuran Kertas Thermal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrinterPaperSize('58mm')}
                    className={`p-2.5 rounded-lg text-xs font-bold cursor-pointer ${
                      printerPaperSize === '58mm'
                        ? 'bg-[#00130a] text-white'
                        : 'bg-[#f0f3ff] text-[#00130a]'
                    }`}
                  >
                    58 mm (Standard POS)
                  </button>
                  <button
                    onClick={() => setPrinterPaperSize('80mm')}
                    className={`p-2.5 rounded-lg text-xs font-bold cursor-pointer ${
                      printerPaperSize === '80mm'
                        ? 'bg-[#00130a] text-white'
                        : 'bg-[#f0f3ff] text-[#00130a]'
                    }`}
                  >
                    80 mm (Lebar)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#f0f3ff] rounded-lg">
                <span className="text-xs text-[#00130a] font-semibold">Auto-Cut Kertas Struk</span>
                <input
                  type="checkbox"
                  checked={autoCutPaper}
                  onChange={(e) => setAutoCutPaper(e.target.checked)}
                  className="w-4 h-4 accent-[#006c4a]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#f0f3ff] rounded-lg">
                <span className="text-xs text-[#00130a] font-semibold">Koneksi Bluetooth Printer</span>
                <span className="text-xs text-[#006c4a] font-bold">Terhubung (MP-58)</span>
              </div>
            </div>

            <button
              onClick={handleTestPrint}
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              Cetak Tes Struk Percobaan
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Keyboard Shortcuts Guide */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-[#00130a]">Tombol Pintas Kasir</h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#f0f3ff] rounded-lg items-center">
                <span className="font-semibold text-[#00130a]">Fokus Barcode / SKU</span>
                <span className="px-2 py-0.5 bg-[#dee8ff] text-[#00130a] font-bold rounded font-mono">F2</span>
              </div>
              <div className="flex justify-between p-2 bg-[#f0f3ff] rounded-lg items-center">
                <span className="font-semibold text-[#00130a]">Buka Modal Bayar</span>
                <span className="px-2 py-0.5 bg-[#dee8ff] text-[#00130a] font-bold rounded font-mono">F12</span>
              </div>
              <div className="flex justify-between p-2 bg-[#f0f3ff] rounded-lg items-center">
                <span className="font-semibold text-[#00130a]">Tutup Modal / Batal</span>
                <span className="px-2 py-0.5 bg-[#dee8ff] text-[#00130a] font-bold rounded font-mono">Esc</span>
              </div>
              <div className="flex justify-between p-2 bg-[#f0f3ff] rounded-lg items-center">
                <span className="font-semibold text-[#00130a]">Konfirmasi Bayar & Cetak</span>
                <span className="px-2 py-0.5 bg-[#dee8ff] text-[#00130a] font-bold rounded font-mono">Enter</span>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="w-full h-11 bg-[#00130a] text-white rounded-xl font-bold cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

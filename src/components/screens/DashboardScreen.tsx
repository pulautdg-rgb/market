import React from 'react';
import { Product, SupplierDebt, SaleTransaction, UserRole } from '../../types';

interface DashboardScreenProps {
  products: Product[];
  debts: SupplierDebt[];
  transactions: SaleTransaction[];
  userRole: UserRole;
  cashierName: string;
  onNavigate: (tab: any) => void;
  onOpenAddProductModal: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  debts,
  transactions,
  userRole,
  cashierName,
  onNavigate,
  onOpenAddProductModal
}) => {
  // Key metrics calculation
  const criticalProducts = products.filter((p) => p.stockQty <= p.minStock || p.status === 'critical');
  const totalUnpaidDebts = debts.reduce((sum, d) => sum + d.remainingDebt, 0);
  const urgentDebts = debts.filter((d) => d.dueDateDays > 0 && d.dueDateDays <= 7 && d.remainingDebt > 0);

  // Today's Sales simulation
  const todayOmzet = 8420000;
  const todayTransactionsCount = 142;
  const todayGrossProfit = 1530000;

  return (
    <div className="flex flex-col w-full pb-32 px-gutter pt-3 gap-4">
      {/* Welcome & Role Banner */}
      <div className="bg-[#00130a] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-pulse"></span>
            <span className="text-xs text-[#85f8c4] font-bold uppercase tracking-wider">
              Toko Sembako Berkah Jaya
            </span>
          </div>
          <h2 className="font-headline-lg font-bold text-white tracking-tight leading-tight">
            Selamat Datang, {cashierName}
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            {userRole === 'owner'
              ? 'Akses Owner: Kelola seluruh operasional toko, profit, dan stok.'
              : userRole === 'admin'
              ? 'Akses Admin: Kelola stok, pembelian, dan data supplier.'
              : 'Akses Kasir: Fokus pada transaksi cepat dan scan barcode.'}
          </p>
        </div>

        {/* Quick Shift Status Pill */}
        <div className="relative z-10 flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm self-start sm:self-auto border border-white/10">
          <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">schedule</span>
          <div>
            <p className="text-[11px] font-bold text-white leading-none">Shift 1 Pagi</p>
            <p className="text-[10px] text-[#85f8c4] font-medium leading-none mt-1">07.00 - 15.00 WIB</p>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Ribbon (5 Tombol Pintasan) */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#e7eeff] flex flex-col gap-2">
        <span className="font-label-sm text-[#727974] font-semibold tracking-wide uppercase px-1">
          Akses Cepat (1-Klik)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Pintasan 1: Transaksi Baru */}
          <button
            onClick={() => onNavigate('kasir')}
            className="flex items-center justify-center sm:flex-col gap-2 p-3 rounded-xl bg-[#00130a] text-white hover:bg-[#006c4a] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </span>
            <span className="font-label-sm font-bold text-center">Transaksi Baru</span>
          </button>

          {/* Pintasan 2: Scan Barcode */}
          <button
            onClick={() => onNavigate('scan')}
            className="flex items-center justify-center sm:flex-col gap-2 p-3 rounded-xl bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a] transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
          >
            <span className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            </span>
            <span className="font-label-sm font-bold text-center">Scan Barcode</span>
          </button>

          {/* Pintasan 3: Tambah Produk */}
          <button
            onClick={onOpenAddProductModal}
            className="flex items-center justify-center sm:flex-col gap-2 p-3 rounded-xl bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a] transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
          >
            <span className="w-8 h-8 rounded-lg bg-[#d8e3fb] text-[#111c2d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </span>
            <span className="font-label-sm font-bold text-center">Tambah Produk</span>
          </button>

          {/* Pintasan 4: Barang Masuk */}
          <button
            onClick={() => onNavigate('pembelian')}
            className="flex items-center justify-center sm:flex-col gap-2 p-3 rounded-xl bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a] transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
          >
            <span className="w-8 h-8 rounded-lg bg-[#cce9d8] text-[#062016] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">input</span>
            </span>
            <span className="font-label-sm font-bold text-center">Barang Masuk</span>
          </button>

          {/* Pintasan 5: Lihat Laporan */}
          {userRole !== 'kasir' && (
            <button
              onClick={() => onNavigate('laporan')}
              className="col-span-2 sm:col-span-1 flex items-center justify-center sm:flex-col gap-2 p-3 rounded-xl bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a] transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
            >
              <span className="w-8 h-8 rounded-lg bg-[#dee8ff] text-[#006c4a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">monitoring</span>
              </span>
              <span className="font-label-sm font-bold text-center">Lihat Laporan</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Penjualan Hari Ini */}
        <div
          onClick={() => onNavigate('laporan')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col justify-between hover:border-[#82f5c1] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#727974] font-medium">Penjualan Hari Ini</span>
            <span className="w-7 h-7 rounded-lg bg-[#82f5c1]/50 text-[#00714e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </span>
          </div>
          <div>
            <div className="font-headline-md sm:font-headline-lg font-extrabold text-[#00130a]">
              Rp {todayOmzet.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-[#006c4a] font-semibold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              +8.4% vs kemarin
            </span>
          </div>
        </div>

        {/* Card 2: Jumlah Transaksi */}
        <div
          onClick={() => onNavigate('kasir')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col justify-between hover:border-[#82f5c1] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#727974] font-medium">Jumlah Transaksi</span>
            <span className="w-7 h-7 rounded-lg bg-[#dee8ff] text-[#00130a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            </span>
          </div>
          <div>
            <div className="font-headline-md sm:font-headline-lg font-extrabold text-[#00130a]">
              {todayTransactionsCount} Nota
            </div>
            <span className="text-[11px] text-[#727974] font-medium mt-1 block">
              Rata-rata Rp 59.300 / nota
            </span>
          </div>
        </div>

        {/* Card 3: Laba Kotor (Hanya Owner/Admin) */}
        {userRole !== 'kasir' ? (
          <div
            onClick={() => onNavigate('laporan')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col justify-between hover:border-[#82f5c1] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#727974] font-medium">Laba Kotor</span>
              <span className="w-7 h-7 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">add_chart</span>
              </span>
            </div>
            <div>
              <div className="font-headline-md sm:font-headline-lg font-extrabold text-[#006c4a]">
                Rp {todayGrossProfit.toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-[#006c4a] font-bold mt-1 block">
                Margin 18.2% Laba
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('stok')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col justify-between hover:border-[#82f5c1] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#727974] font-medium">Total Produk Aktif</span>
              <span className="w-7 h-7 rounded-lg bg-[#dee8ff] text-[#00130a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              </span>
            </div>
            <div>
              <div className="font-headline-md sm:font-headline-lg font-extrabold text-[#00130a]">
                {products.length} SKU
              </div>
              <span className="text-[11px] text-[#006c4a] font-semibold mt-1 block">
                Siap Dijual di Rak
              </span>
            </div>
          </div>
        )}

        {/* Card 4: Stok Kritis Alert */}
        <div
          onClick={() => onNavigate('stok')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#ffdad6] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#93000a] font-semibold">Stok Hampir Habis</span>
            <span className="w-7 h-7 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <div>
            <div className="font-headline-md sm:font-headline-lg font-extrabold text-[#ba1a1a]">
              {criticalProducts.length} SKU
            </div>
            <span className="text-[11px] text-[#93000a] font-bold mt-1 flex items-center gap-0.5">
              <span>Butuh order cepat</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Overview: Utang Tempo & Critical Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Urgent Supplier Debts Box */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">receipt_long</span>
              <div>
                <h3 className="font-title-md font-bold text-[#00130a]">Utang Supplier Jatuh Tempo</h3>
                <p className="text-xs text-[#727974]">Total sisa tagihan: Rp {totalUnpaidDebts.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('utang')}
              className="text-xs text-[#006c4a] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Lihat Buku Utang</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2">
            {urgentDebts.slice(0, 2).map((debt) => (
              <div
                key={debt.id}
                onClick={() => onNavigate('utang')}
                className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between hover:bg-[#dee8ff] transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-[#00130a] block">{debt.supplierName}</span>
                  <span className="text-[11px] text-[#727974]">{debt.itemsSummary}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#ba1a1a] block">
                    Rp {debt.remainingDebt.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.2 rounded-full font-bold">
                    {debt.dueDateDays} Hari Lagi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Low Stock Items Box */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">shelves</span>
              <div>
                <h3 className="font-title-md font-bold text-[#00130a]">Peringatan Stok di Rak</h3>
                <p className="text-xs text-[#727974]">Barang mendekati batas stok minimum</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('stok')}
              className="text-xs text-[#006c4a] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Cek Stok</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2">
            {criticalProducts.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('stok')}
                className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-center justify-between hover:bg-[#fef3c7] transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-[#00130a] block">{item.name}</span>
                  <span className="text-[11px] text-[#727974]">{item.location || 'Rak Toko'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#d97706] block">
                    Sisa {item.stockQty} {item.unit}
                  </span>
                  <span className="text-[10px] text-[#ba1a1a] font-semibold">
                    Min. {item.minStock} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aktivitas Transaksi Terbaru */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">receipt</span>
            <h3 className="font-title-md font-bold text-[#00130a]">Aktivitas Penjualan Kasir Terbaru</h3>
          </div>
          <button
            onClick={() => onNavigate('kasir')}
            className="text-xs text-[#006c4a] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Buka Kasir</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="divide-y divide-[#f0f3ff]">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#00130a]">{tx.invoiceNo}</span>
                  <span className="text-[10px] text-[#727974]">({tx.timestamp})</span>
                  {tx.customerName && (
                    <span className="text-[10px] bg-[#f0f3ff] text-[#424844] px-1.5 py-0.2 rounded font-semibold truncate">
                      {tx.customerName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#727974] truncate mt-0.5">{tx.itemsSummary}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-[#006c4a] block">
                  Rp {tx.totalAmount.toLocaleString('id-ID')}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    tx.paymentMethod === 'tunai'
                      ? 'bg-[#82f5c1] text-[#00714e]'
                      : tx.paymentMethod === 'qris'
                      ? 'bg-[#dee8ff] text-[#00130a]'
                      : tx.paymentMethod === 'kasbon'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#d8e3fb] text-[#111c2d]'
                  }`}
                >
                  {tx.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

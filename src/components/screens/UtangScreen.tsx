import React, { useState } from 'react';
import { SupplierDebt, PurchaseInvoice } from '../../types';

interface UtangScreenProps {
  debts: SupplierDebt[];
  purchaseInvoices: PurchaseInvoice[];
  onPayDebt: (debtId: string, amount: number, method: string, note: string) => void;
  onReceiveInvoiceItems: (invoiceId: string, addedQty: number) => void;
  onCreatePO: (po: { supplier: string; term: string; items: string }) => void;
}

export const UtangScreen: React.FC<UtangScreenProps> = ({
  debts,
  purchaseInvoices,
  onPayDebt,
  onReceiveInvoiceItems,
  onCreatePO
}) => {
  const [activeTab, setActiveTab] = useState<'utang' | 'faktur'>('utang');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>('deb-1');

  // Modals state
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<SupplierDebt | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<number>(2000000);
  const [payMethod, setPayMethod] = useState<string>('Kas Utama Toko (Tunai)');
  const [payNote, setPayNote] = useState<string>('Pembayaran termin cicilan minggu ini');

  const [showPartialModal, setShowPartialModal] = useState<boolean>(false);
  const [partialBarcode, setPartialBarcode] = useState<string>('SJ-GMP/440-2025');
  const [partialQty, setPartialQty] = useState<number>(5);

  const [showPoModal, setShowPoModal] = useState<boolean>(false);
  const [poSupplier, setPoSupplier] = useState<string>('CV Beras Sumber Rejeki');
  const [poTerm, setPoTerm] = useState<string>('Tempo 14 Hari');
  const [poItemName, setPoItemName] = useState<string>('Beras Setra Ramos 25kg');
  const [poQty, setPoQty] = useState<number>(20);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Calculations
  const totalUnpaidDebt = debts.reduce((acc, d) => acc + d.remainingDebt, 0);
  const dueThisWeek = debts
    .filter((d) => d.dueDateDays > 0 && d.dueDateDays <= 7 && d.remainingDebt > 0)
    .reduce((acc, d) => acc + d.remainingDebt, 0);

  const filteredDebts = debts.filter(
    (d) =>
      d.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit payment
  const handleConfirmPay = () => {
    if (!selectedDebtForPay || payAmountInput <= 0) return;
    onPayDebt(selectedDebtForPay.id, payAmountInput, payMethod, payNote);
    triggerToast(`Pembayaran Rp ${payAmountInput.toLocaleString('id-ID')} berhasil dicatat & masuk Audit Trail`);
    setSelectedDebtForPay(null);
  };

  // Submit partial receiving
  const handleConfirmPartialReceipt = () => {
    const targetInvoice = purchaseInvoices[0];
    if (targetInvoice) {
      onReceiveInvoiceItems(targetInvoice.id, partialQty);
    }
    triggerToast(`Stok ${partialQty} Sak diverifikasi & saldo diperbarui tanpa duplikasi`);
    setShowPartialModal(false);
  };

  // Submit PO
  const handleConfirmPO = () => {
    onCreatePO({
      supplier: poSupplier,
      term: poTerm,
      items: `${poItemName} (${poQty} Sak)`
    });
    triggerToast('PO Berhasil dibuat dan siap dikirim via WhatsApp/PDF');
    setShowPoModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-36">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#00130a] text-white font-label-md text-label-md shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-header / Section Bar */}
      <div className="px-gutter pt-3 pb-2 flex items-center justify-between">
        <div>
          <span className="font-label-sm text-label-sm text-[#006c4a] uppercase tracking-wider font-semibold">
            Manajemen Pengadaan
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-[#00130a] tracking-tight font-bold">
            Buku Utang Supplier
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dee8ff] text-[#424844] text-label-sm font-label-sm font-semibold">
          <span className="material-symbols-outlined text-[16px] text-[#006c4a]">verified_user</span>
          <span>Anti-Duplikasi Aktif</span>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="px-gutter mb-3">
        <div className="p-1 rounded-xl bg-[#e7eeff] flex items-center gap-1">
          <button
            onClick={() => setActiveTab('utang')}
            className={`flex-1 py-2 px-3 rounded-lg font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'utang'
                ? 'bg-white text-[#00130a] shadow-sm font-semibold'
                : 'text-[#424844] hover:text-[#00130a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">receipt_long</span>
            <span>Utang Supplier (Tempo)</span>
          </button>
          <button
            onClick={() => setActiveTab('faktur')}
            className={`flex-1 py-2 px-3 rounded-lg font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'faktur'
                ? 'bg-white text-[#00130a] shadow-sm font-semibold'
                : 'text-[#424844] hover:text-[#00130a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory</span>
            <span>Faktur Masuk</span>
          </button>
        </div>
      </div>

      {/* Content View: Tab Utang Supplier */}
      {activeTab === 'utang' && (
        <div className="flex flex-col gap-3 px-gutter mb-6">
          {/* Hero / Summary Bento Grid */}
          <div className="rounded-xl bg-[#f0f3ff] p-4 shadow-sm flex flex-col gap-3 border border-[#dee8ff]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0f291e] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-[#424844]">Total Tagihan Belum Lunas</div>
                  <div className="font-currency-display-mobile text-currency-display-mobile text-[#00130a] font-extrabold tracking-tight">
                    Rp {totalUnpaidDebt.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-label-sm text-label-sm font-semibold">
                {debts.filter((d) => d.remainingDebt > 0).length} Supplier
              </span>
            </div>

            {/* Warning Tempo Card with Micro Bar Chart */}
            <div className="rounded-lg bg-white p-3 flex flex-col gap-2 border border-[#e7eeff]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ba1a1a]"></span>
                  </span>
                  <span className="font-label-md text-label-md text-[#111c2d] font-semibold">
                    Jatuh Tempo Minggu Ini
                  </span>
                </div>
                <span className="font-mono-num text-mono-num font-bold text-[#ba1a1a]">
                  Rp {dueThisWeek.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-[#424844]">
                <span>2 Faktur mendesak (prioritas pembayaran)</span>
                <span className="font-label-sm text-label-sm text-[#006c4a] font-semibold">
                  Batas: 3 - 5 Hari
                </span>
              </div>
              {/* Progress Bar Visualizer */}
              <div className="w-full bg-[#e7eeff] h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#ba1a1a] h-full w-[28%] rounded-full" title="Jatuh tempo minggu ini"></div>
                <div className="bg-[#006c4a] h-full w-[72%] rounded-full opacity-40 ml-1" title="Sisa tagihan tempo"></div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-11 bg-white rounded-xl px-3 flex items-center gap-2 shadow-sm border border-[#e7eeff]">
              <span className="material-symbols-outlined text-[20px] text-[#727974]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama supplier, #INV, atau produk..."
                className="w-full bg-transparent text-body-md font-body-md text-[#111c2d] focus:outline-none placeholder:text-[#727974]"
              />
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="h-11 px-3 bg-[#e7eeff] rounded-xl flex items-center justify-center text-[#424844] hover:text-[#00130a] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>

          {/* Supplier Debt List */}
          <div className="flex flex-col gap-3">
            {filteredDebts.map((item) => {
              const isPaid = item.status === 'paid' || item.remainingDebt === 0;
              const isUrgent = item.dueDateDays > 0 && item.dueDateDays <= 3 && !isPaid;
              const progressPct = Math.round((item.paidAmount / item.totalBill) * 100);
              const isLogOpen = expandedLogId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3 border border-[#e7eeff]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-headline-md text-headline-md flex-shrink-0 font-bold ${
                          isPaid
                            ? 'bg-[#85f8c4]/50 text-[#006c4a]'
                            : isUrgent
                            ? 'bg-[#82f5c1] text-[#00714e]'
                            : 'bg-[#dee8ff] text-[#00130a]'
                        }`}
                      >
                        {item.initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-title-md text-[#00130a] font-bold truncate">
                          {item.supplierName}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-num text-mono-num text-[#727974] font-semibold text-xs">
                            {item.invoiceNumber}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#c2c8c2]"></span>
                          <span className="font-body-sm text-body-sm text-[#424844]">
                            {item.itemsSummary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isPaid ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-label-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Lunas
                      </span>
                    ) : isUrgent ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-label-sm text-label-sm font-semibold flex-shrink-0 flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-[13px]">alarm</span>
                        {item.dueDateDays} Hari Lagi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#e7eeff] text-[#424844] font-label-sm text-label-sm font-semibold flex-shrink-0 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                        {item.dueDateDays} Hari Lagi
                      </span>
                    )}
                  </div>

                  {/* Metric Breakdown */}
                  {isPaid ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#82f5c1]/20 border border-[#82f5c1]/30">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-[#00714e]">Total Transaksi</span>
                        <span className="font-mono-num text-mono-num font-bold text-[#00130a]">
                          Rp {item.totalBill.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-[#006c4a] font-medium">
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                        <span>Kuitansi Resmi Tersimpan</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#f0f3ff] text-center border border-[#dee8ff]">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-[#727974]">Total Tagihan</span>
                          <span className="font-mono-num text-mono-num font-semibold text-[#111c2d]">
                            Rp {item.totalBill.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-[#006c4a]">Terbayar</span>
                          <span className="font-mono-num text-mono-num font-semibold text-[#006c4a]">
                            Rp {item.paidAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-[#ba1a1a]">Sisa Utang</span>
                          <span className="font-mono-num text-mono-num font-bold text-[#ba1a1a]">
                            Rp {item.remainingDebt.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Progress Track */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-label-sm font-label-sm">
                          <span className="text-[#424844]">Progres Cicilan ({progressPct}%)</span>
                          <span className="text-[#006c4a] font-semibold">
                            {item.auditLogs.length}x Bayar Masuk
                          </span>
                        </div>
                        <div className="w-full bg-[#e7eeff] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#006c4a] h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedDebtForPay(item);
                            setPayAmountInput(item.remainingDebt >= 2000000 ? 2000000 : item.remainingDebt);
                          }}
                          className="flex-1 h-10 rounded-lg bg-[#0f291e] text-white font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">payments</span>
                          <span>Bayar Cicilan / Lunas</span>
                        </button>
                        <button
                          onClick={() => setExpandedLogId(isLogOpen ? null : item.id)}
                          className="h-10 px-3 rounded-lg bg-[#e7eeff] text-[#424844] hover:text-[#00130a] font-label-md text-label-md flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Lihat Riwayat Audit"
                        >
                          <span className="material-symbols-outlined text-[18px]">history</span>
                          <span className="font-label-sm text-label-sm">Log</span>
                        </button>
                      </div>

                      {/* Expandable Audit Log & Anti-duplication state */}
                      {isLogOpen && (
                        <div className="flex flex-col gap-2 pt-2 bg-[#f0f3ff] p-3 rounded-lg border border-[#dee8ff]">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm font-semibold text-[#00130a]">
                              Audit Log Riwayat Bayar
                            </span>
                            <span className="font-label-sm text-label-sm text-[#006c4a] font-medium flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">lock</span> Terverifikasi Kasir
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 text-body-sm font-body-sm text-[#424844]">
                            {item.auditLogs.length === 0 ? (
                              <p className="text-xs text-[#727974]">Belum ada riwayat cicilan masuk.</p>
                            ) : (
                              item.auditLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="flex justify-between items-center bg-white p-2 rounded border border-[#e7eeff]"
                                >
                                  <div>
                                    <span className="font-mono-num text-mono-num font-semibold text-[#00130a]">
                                      Rp {log.amount.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[#727974] text-label-sm block">
                                      {log.date} • {log.method} ({log.cashier})
                                    </span>
                                  </div>
                                  <span className="font-mono-num text-mono-num text-[#727974] text-label-sm">
                                    ID: {log.id}
                                  </span>
                                </div>
                              ))
                            )}

                            <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-[#006c4a] bg-[#82f5c1]/30 px-2 py-1.5 rounded">
                              <span className="material-symbols-outlined text-[15px]">verified</span>
                              <span>Barang terverifikasi via QR Scan Surat Jalan ({item.invoiceNumber}).</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content View: Tab Faktur Pembelian Masuk */}
      {activeTab === 'faktur' && (
        <div className="flex flex-col gap-3 px-gutter mb-6">
          {/* Notice Anti-Duplikasi */}
          <div className="p-3 rounded-xl bg-[#82f5c1]/30 flex items-start gap-2.5 border border-[#82f5c1]/50">
            <span className="material-symbols-outlined text-[20px] text-[#006c4a] flex-shrink-0 mt-0.5">
              shield_with_heart
            </span>
            <div className="flex flex-col text-body-sm font-body-sm text-[#111c2d]">
              <span className="font-semibold text-[#006c4a]">Protokol Anti-Duplikasi Stok Aktif</span>
              <span className="text-[#424844]">
                Sistem mencocokkan Barcode Supplier & No. Surat Jalan fisik. Barang yang sudah dicatat tidak dapat diinput
                ganda ke gudang.
              </span>
            </div>
          </div>

          {/* List Faktur Masuk Menunggu Masuk Stok */}
          <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3 border border-[#e7eeff]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-title-md font-bold text-[#00130a]">
                  Faktur Masuk Menunggu Masuk Stok
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#e7eeff] text-[#727974] text-label-sm font-label-sm font-semibold">
                  {purchaseInvoices.filter((i) => i.status !== 'completed').length}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#727974] text-[20px]">sync</span>
            </div>

            {purchaseInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-lg bg-[#f0f3ff] flex flex-col gap-2 border border-[#dee8ff]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-label-md text-label-md font-bold text-[#00130a]">
                      {inv.items}
                    </div>
                    <div className="font-body-sm text-body-sm text-[#424844]">
                      {inv.supplier} • Faktur #{inv.invoiceNo}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      inv.status === 'completed'
                        ? 'bg-[#82f5c1] text-[#00714e]'
                        : 'bg-[#dee8ff] text-[#00130a]'
                    }`}
                  >
                    {inv.status === 'completed'
                      ? 'Lengkap (Selesai)'
                      : `Parsial (${inv.receivedQty}/${inv.orderedQty} ${inv.unit})`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-sm text-label-sm text-[#727974]">
                    Gudang Penerima: {inv.warehouseGate}
                  </span>
                  {inv.status !== 'completed' && (
                    <button
                      onClick={() => setShowPartialModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#00130a] text-white font-label-sm text-label-sm font-medium flex items-center gap-1 shadow-sm hover:bg-[#006c4a] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">inventory_2</span>
                      Terima Sisa {inv.orderedQty - inv.receivedQty} {inv.unit}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Quick Action Bar Atas Bottom Nav */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-30 bg-white/95 backdrop-blur-md px-gutter py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#e7eeff]">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setShowPoModal(true)}
            className="flex-1 h-12 rounded-xl bg-[#00130a] text-white font-label-md text-label-md flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">add_circle</span>
            <span>Buat Order (PO)</span>
          </button>
          <button
            onClick={() => setShowPartialModal(true)}
            className="flex-1 h-12 rounded-xl bg-[#e7eeff] text-[#00130a] hover:bg-[#dee8ff] font-label-md text-label-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">input</span>
            <span>Penerimaan Parsial</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Catat Pembayaran Utang */}
      {selectedDebtForPay && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#006c4a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">price_check</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-[#00130a] font-bold">
                    Catat Pembayaran Utang
                  </h3>
                  <p className="font-label-sm text-label-sm text-[#727974]">
                    {selectedDebtForPay.supplierName} ({selectedDebtForPay.invoiceNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDebtForPay(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#727974] hover:text-[#00130a]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Sisa Utang Display */}
            <div className="p-3 rounded-xl bg-[#f0f3ff] flex justify-between items-center border border-[#dee8ff]">
              <span className="font-label-md text-label-md text-[#424844]">Sisa Utang Belum Lunas</span>
              <span className="font-mono-num text-mono-num font-bold text-[#ba1a1a]">
                Rp {selectedDebtForPay.remainingDebt.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Form Inputs */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Nominal Pembayaran (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-label-md text-label-md text-[#727974]">Rp</span>
                  <input
                    type="number"
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#f0f3ff] font-mono-num text-mono-num font-bold text-[#00130a] focus:outline-none focus:bg-white border border-[#dee8ff]"
                  />
                </div>
              </div>

              {/* Quick Pill Denomination */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPayAmountInput(1000000)}
                  className="px-2.5 py-1 rounded-md bg-[#e7eeff] text-label-sm font-label-sm text-[#00130a] hover:bg-[#dee8ff]"
                >
                  1 Juta
                </button>
                <button
                  type="button"
                  onClick={() => setPayAmountInput(2000000)}
                  className="px-2.5 py-1 rounded-md bg-[#e7eeff] text-label-sm font-label-sm text-[#00130a] hover:bg-[#dee8ff]"
                >
                  2 Juta
                </button>
                <button
                  type="button"
                  onClick={() => setPayAmountInput(selectedDebtForPay.remainingDebt)}
                  className="px-2.5 py-1 rounded-md bg-[#82f5c1] text-label-sm font-label-sm text-[#00714e] font-semibold"
                >
                  Lunasi Semua
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Metode Pembayaran
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] font-body-md text-body-md text-[#00130a] focus:outline-none border border-[#dee8ff]"
                >
                  <option>Kas Utama Toko (Tunai)</option>
                  <option>Transfer Bank BCA Toko (012-3849-11)</option>
                  <option>Transfer Mandiri Operasional</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Bukti Pembayaran / Catatan Audit
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="No. Referensi Transfer / No Kuitansi Toko"
                  className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] font-body-md text-body-md text-[#00130a] focus:outline-none placeholder:text-[#727974] border border-[#dee8ff]"
                />
              </div>
            </div>

            {/* Action submit */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleConfirmPay}
                className="w-full h-12 rounded-xl bg-[#0f291e] text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">task_alt</span>
                <span>Konfirmasi & Rekam Audit Log</span>
              </button>
              <span className="text-center font-label-sm text-label-sm text-[#727974]">
                Audit tercatat atas nama kasir aktif dan tidak dapat dimanipulasi.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Penerimaan Parsial Barang */}
      {showPartialModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#006c4a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-[#00130a] font-bold">
                    Penerimaan Parsial Barang
                  </h3>
                  <p className="font-label-sm text-label-sm text-[#727974]">Verifikasi Fisik & Anti-Duplikasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowPartialModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#727974]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Scanner simulation */}
            <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-2.5 border border-[#dee8ff]">
              <label className="font-label-sm text-label-sm font-semibold text-[#00130a]">
                Scan No. Surat Jalan / Barcode DO
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-11 bg-white rounded-lg px-3 flex items-center gap-2 border border-[#dee8ff]">
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">barcode_reader</span>
                  <input
                    type="text"
                    value={partialBarcode}
                    onChange={(e) => setPartialBarcode(e.target.value)}
                    className="w-full bg-transparent font-mono-num text-mono-num text-[#00130a] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast('Barcode SJ Terverifikasi Valid')}
                  className="h-11 px-3 bg-[#82f5c1] text-[#00714e] rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">camera_alt</span>
                </button>
              </div>
            </div>

            {/* Item check table */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-label-sm font-label-sm text-[#727974]">
                <span>Item Pengiriman</span>
                <span>Diterima / Sisa Order</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f0f3ff] flex items-center justify-between border border-[#dee8ff]">
                <div>
                  <span className="font-label-md text-label-md font-bold text-[#00130a] block">
                    Gula Pasir GMP 50kg
                  </span>
                  <span className="font-label-sm text-label-sm text-[#727974]">
                    Telah diterima sebelumnya: 10 Sak
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={partialQty}
                    onChange={(e) => setPartialQty(parseInt(e.target.value, 10) || 1)}
                    className="w-16 h-10 text-center font-mono-num text-mono-num font-bold bg-white rounded-lg border border-[#dee8ff] focus:outline-none"
                  />
                  <span className="font-label-sm text-label-sm text-[#424844] font-medium">Sak</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#82f5c1]/20 flex items-center gap-2 text-label-sm font-label-sm text-[#006c4a]">
              <span className="material-symbols-outlined text-[18px]">check_box</span>
              <span>Validasi stok: Penambahan otomatis memperbarui HPP & Saldo Utang.</span>
            </div>

            <button
              onClick={handleConfirmPartialReceipt}
              className="w-full h-12 rounded-xl bg-[#00130a] text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">inventory</span>
              <span>Simpan Stok & Cetak Bukti Masuk</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Buat Order Pembelian Baru (PO) */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0f291e] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-[#00130a] font-bold">
                    Buat Purchase Order (PO)
                  </h3>
                  <p className="font-label-sm text-label-sm text-[#727974]">Pesanan Baru ke Supplier</p>
                </div>
              </div>
              <button
                onClick={() => setShowPoModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#727974]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Pilih Supplier Rekanan
                </label>
                <select
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] font-body-md text-body-md text-[#00130a] focus:outline-none border border-[#dee8ff]"
                >
                  <option>CV Beras Sumber Rejeki</option>
                  <option>PT Salim Distribusi Sembako</option>
                  <option>Agen Telur Berkah Mandiri</option>
                  <option>Distributor Gula GMP</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Syarat Pembayaran (Term of Payment)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Tunai (COD)', 'Tempo 14 Hari', 'Tempo 30 Hari'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPoTerm(t)}
                      className={`h-10 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                        poTerm === t
                          ? 'bg-[#82f5c1] text-[#00714e]'
                          : 'bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#00130a]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Barang yang Dipesan
                </label>
                <input
                  type="text"
                  value={poItemName}
                  onChange={(e) => setPoItemName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-sm border border-[#dee8ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-[#727974] font-semibold">
                  Jumlah Pesanan (Satuan)
                </label>
                <input
                  type="number"
                  value={poQty}
                  onChange={(e) => setPoQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-sm font-mono font-bold border border-[#dee8ff]"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmPO}
              className="w-full h-12 rounded-xl bg-[#00130a] text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all mt-2"
            >
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">send</span>
              <span>Terbitkan Dokumen PO Resmi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

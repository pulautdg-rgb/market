import React, { useState } from 'react';
import { PurchaseInvoice, Supplier, UserRole } from '../../types';

interface PembelianScreenProps {
  purchaseInvoices: PurchaseInvoice[];
  suppliers: Supplier[];
  userRole: UserRole;
  onReceiveInvoiceItems: (invoiceId: string, addedQty: number) => void;
  onCreatePO: (po: { supplier: string; term: string; items: string }) => void;
}

export const PembelianScreen: React.FC<PembelianScreenProps> = ({
  purchaseInvoices,
  suppliers,
  userRole,
  onReceiveInvoiceItems,
  onCreatePO
}) => {
  const [activeTab, setActiveTab] = useState<'faktur' | 'po'>('faktur');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showPoModal, setShowPoModal] = useState(false);
  const [receivingInvoice, setReceivingInvoice] = useState<PurchaseInvoice | null>(null);
  const [receiveQtyInput, setReceiveQtyInput] = useState<number>(5);
  const [barcodeScanInput, setBarcodeScanInput] = useState<string>('SJ-GMP/440-2026');

  // PO Form
  const [poSupplier, setPoSupplier] = useState(suppliers[0]?.name || 'CV Beras Sumber Rejeki');
  const [poTerm, setPoTerm] = useState('Tempo 14 Hari');
  const [poItemName, setPoItemName] = useState('Beras Setra Ramos 25kg');
  const [poQty, setPoQty] = useState(20);

  const filteredInvoices = purchaseInvoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmReceive = () => {
    if (!receivingInvoice) return;
    onReceiveInvoiceItems(receivingInvoice.id, receiveQtyInput);
    setReceivingInvoice(null);
  };

  const handleConfirmPO = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePO({
      supplier: poSupplier,
      term: poTerm,
      items: `${poItemName} (${poQty} Sak)`
    });
    setShowPoModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-32 px-gutter pt-3 gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-[#006c4a] uppercase tracking-wider font-semibold">
            Manajemen Pengadaan & Penerimaan
          </span>
          <h2 className="font-headline-lg font-bold text-[#00130a] tracking-tight">
            Pembelian & Barang Masuk
          </h2>
          <p className="text-xs text-[#727974]">
            Verifikasi fisik Surat Jalan supplier dan penerbitan Purchase Order (PO)
          </p>
        </div>

        {userRole !== 'kasir' && (
          <button
            onClick={() => setShowPoModal(true)}
            className="self-start sm:self-auto h-11 px-4 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white font-label-md font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">add_shopping_cart</span>
            <span>Buat Order (PO) Baru</span>
          </button>
        )}
      </div>

      {/* Anti-Duplication Badge Banner */}
      <div className="p-3.5 rounded-2xl bg-[#82f5c1]/30 border border-[#82f5c1]/60 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[#006c4a] text-[22px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="text-xs text-[#111c2d]">
          <span className="font-bold text-[#006c4a] block">Protokol Anti-Duplikasi Stok Aktif</span>
          <p className="text-[#424844] mt-0.5">
            Setiap penerimaan barang dicocokkan otomatis dengan nomor Surat Jalan / Barcode DO fisik. Barang yang sudah
            diterima tidak dapat diinput ganda ke gudang.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#e7eeff] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('faktur')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'faktur'
              ? 'bg-white text-[#00130a] shadow-sm'
              : 'text-[#424844] hover:text-[#00130a]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-[#006c4a]">inventory</span>
          <span>Faktur Masuk ({purchaseInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('po')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'po'
              ? 'bg-white text-[#00130a] shadow-sm'
              : 'text-[#424844] hover:text-[#00130a]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
          <span>Purchase Order (PO)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#e7eeff]">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727974] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor faktur / SJ, nama supplier, atau komoditas..."
            className="w-full h-11 pl-10 pr-4 bg-[#f0f3ff] rounded-xl font-body-md text-sm text-[#111c2d] placeholder:text-[#727974] focus:outline-none border border-[#dee8ff]"
          />
        </div>
      </div>

      {/* Content: Faktur List */}
      <div className="flex flex-col gap-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-3 hover:border-[#82f5c1] transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#00130a] bg-[#f0f3ff] px-2 py-0.5 rounded border border-[#dee8ff]">
                    #{inv.invoiceNo}
                  </span>
                  <span className="text-xs text-[#727974]">• {inv.lastUpdated}</span>
                </div>
                <h3 className="font-title-md font-bold text-[#00130a] mt-1">{inv.items}</h3>
                <p className="text-xs text-[#006c4a] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                  <span>{inv.supplier}</span>
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                  inv.status === 'completed'
                    ? 'bg-[#82f5c1] text-[#00714e]'
                    : 'bg-[#dee8ff] text-[#00130a]'
                }`}
              >
                {inv.status === 'completed' ? '✓ Diterima Lengkap' : `Parsial (${inv.receivedQty}/${inv.orderedQty} ${inv.unit})`}
              </span>
            </div>

            {/* Receiving Progress */}
            <div className="bg-[#f0f3ff] p-3 rounded-xl border border-[#dee8ff] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#727974] block text-[11px]">Gerbang / Gudang Penerima:</span>
                <span className="font-bold text-[#00130a]">{inv.warehouseGate}</span>
              </div>
              <div className="text-right">
                <span className="text-[#727974] block text-[11px]">Sisa Belum Diterima:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">
                  {inv.orderedQty - inv.receivedQty} {inv.unit}
                </span>
              </div>
            </div>

            {/* Action */}
            {inv.status !== 'completed' && userRole !== 'kasir' && (
              <div className="flex justify-end pt-1 border-t border-[#f0f3ff]">
                <button
                  onClick={() => {
                    setReceivingInvoice(inv);
                    setReceiveQtyInput(inv.orderedQty - inv.receivedQty);
                  }}
                  className="h-10 px-4 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">inventory_2</span>
                  <span>Terima Sisa {inv.orderedQty - inv.receivedQty} {inv.unit}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL 1: Penerimaan Parsial Barang */}
      {receivingInvoice && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">qr_code_scanner</span>
                <h3 className="font-headline-md font-bold text-[#00130a]">Penerimaan Fisik Barang</h3>
              </div>
              <button
                onClick={() => setReceivingInvoice(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#424844]">
              Scan barcode surat jalan fisik untuk memvalidasi nomor dokumen pengiriman dari supplier.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">No. Dokumen Surat Jalan (DO)</label>
                <input
                  type="text"
                  value={barcodeScanInput}
                  onChange={(e) => setBarcodeScanInput(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg font-mono text-sm border border-[#dee8ff]"
                />
              </div>

              <div className="p-3 bg-[#f0f3ff] rounded-xl border border-[#dee8ff] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#00130a] block">{receivingInvoice.items}</span>
                  <span className="text-[11px] text-[#727974]">Supplier: {receivingInvoice.supplier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={receivingInvoice.orderedQty - receivingInvoice.receivedQty}
                    value={receiveQtyInput}
                    onChange={(e) => setReceiveQtyInput(parseInt(e.target.value, 10) || 1)}
                    className="w-16 h-10 text-center font-mono font-bold text-sm bg-white rounded-lg border border-[#dee8ff]"
                  />
                  <span className="text-xs font-semibold text-[#424844]">{receivingInvoice.unit}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmReceive}
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Konfirmasi Masuk Stok Gudang</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Buat Purchase Order (PO) */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleConfirmPO}
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <h3 className="font-headline-md font-bold text-[#00130a]">Buat Purchase Order (PO)</h3>
              <button
                type="button"
                onClick={() => setShowPoModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Pilih Supplier Rekanan</label>
              <select
                value={poSupplier}
                onChange={(e) => setPoSupplier(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.term})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Syarat Pembayaran</label>
              <div className="grid grid-cols-3 gap-1">
                {['Tunai (COD)', 'Tempo 14 Hari', 'Tempo 30 Hari'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPoTerm(t)}
                    className={`py-2 rounded-lg text-xs font-semibold ${
                      poTerm === t ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Nama Barang Pesanan</label>
              <input
                required
                type="text"
                value={poItemName}
                onChange={(e) => setPoItemName(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Jumlah Pesanan</label>
              <input
                required
                type="number"
                min="1"
                value={poQty}
                onChange={(e) => setPoQty(parseInt(e.target.value, 10) || 1)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono font-bold border border-[#dee8ff]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">send</span>
              <span>Terbitkan Dokumen PO Resmi</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Product } from '../../types';
import { ProductImageCard } from '../common/ProductImageCard';

interface StokScreenProps {
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
}

export const StokScreen: React.FC<StokScreenProps> = ({
  products,
  onUpdateProductStock,
  onAddProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'expiring'>('all');

  // Modals state
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUnpackModal, setShowUnpackModal] = useState(false);
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState<Product | null>(null);

  // Unpack / Pecah Satuan form
  const [unpackProductId, setUnpackProductId] = useState<string>('9'); // Indomie Ayam Bawang
  const [unpackQty, setUnpackQty] = useState<number>(1);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'beras' | 'minyak' | 'gula' | 'telur' | 'mie' | 'gas' | 'lainnya'>('beras');
  const [newProdUnit, setNewProdUnit] = useState('karung');
  const [newProdHpp, setNewProdHpp] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdMinStock, setNewProdMinStock] = useState('5');
  const [newProdSku, setNewProdSku] = useState('');

  // Opname Adjustment state
  const [opnameSelectedId, setOpnameSelectedId] = useState<string>('1');
  const [opnamePhysicalCount, setOpnamePhysicalCount] = useState<number>(14);
  const [opnameReason, setOpnameReason] = useState<string>('Penghitungan rutin mingguan');

  // Mock mutation history logs
  const [mutations, setMutations] = useState([
    { id: 'MUT-01', time: '14:20 WIB', product: 'Beras Pandan Wangi 5kg', type: 'out', qty: 2, unit: 'karung', note: 'Penjualan Kasir Nota #NB-089' },
    { id: 'MUT-02', time: '13:05 WIB', product: 'Minyak Bimoli 2L', type: 'out', qty: 1, unit: 'btl', note: 'Penjualan Kasir Nota #NB-088' },
    { id: 'MUT-03', time: '11:10 WIB', product: 'Beras Ramos Sentra 50kg', type: 'in', qty: 10, unit: 'karung', note: 'Penerimaan PO #PO-8821' },
    { id: 'MUT-04', time: '09:30 WIB', product: 'Indomie Ayam Bawang', type: 'convert', qty: 1, unit: 'dus', note: 'Bongkar 1 Dus -> 40 Bungkus ecer' }
  ]);

  // Total HPP inventory value
  const totalHppValue = products.reduce((acc, p) => acc + p.hpp * p.stockQty, 0);
  const criticalCount = products.filter((p) => p.stockQty <= p.minStock).length;
  const safeCount = products.filter((p) => p.stockQty > p.minStock).length;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'critical'
        ? p.stockQty <= p.minStock || p.status === 'critical'
        : p.category === 'beras' || p.category === 'telur'; // demo expiring representation
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Handle Unpack (Pecah Satuan)
  const handleExecuteUnpack = () => {
    const target = products.find((p) => p.id === unpackProductId);
    if (!target || target.stockQty < unpackQty) {
      return;
    }

    const conversionRatio = target.conversionRatio || 40;
    const addedUnits = unpackQty * conversionRatio;

    onUpdateProductStock(target.id, target.stockQty - unpackQty);

    // Record mutation
    setMutations((prev) => [
      {
        id: `MUT-${Date.now().toString().slice(-4)}`,
        time: 'Baru saja',
        product: target.name,
        type: 'convert',
        qty: unpackQty,
        unit: target.parentUnit || target.unit,
        note: `Bongkar ${unpackQty} ${target.parentUnit || target.unit} -> ${addedUnits} ${target.childUnit || 'Bks'}`
      },
      ...prev
    ]);

    setShowUnpackModal(false);
  };

  // Handle Stock Opname
  const handleSaveOpname = () => {
    const target = products.find((p) => p.id === opnameSelectedId);
    if (!target) return;

    const diff = opnamePhysicalCount - target.stockQty;
    onUpdateProductStock(target.id, opnamePhysicalCount);

    setMutations((prev) => [
      {
        id: `MUT-${Date.now().toString().slice(-4)}`,
        time: 'Baru saja',
        product: target.name,
        type: diff >= 0 ? 'in' : 'out',
        qty: Math.abs(diff),
        unit: target.unit,
        note: `Opname Fisik (${diff >= 0 ? '+' : ''}${diff} ${target.unit}): ${opnameReason}`
      },
      ...prev
    ]);

    setShowOpnameModal(false);
  };

  // Handle Add Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const product: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      sku: newProdSku || `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: newProdCategory,
      categoryLabel: newProdCategory.toUpperCase(),
      unit: newProdUnit,
      hpp: parseInt(newProdHpp, 10) || 0,
      price: parseInt(newProdPrice, 10) || 0,
      stockQty: parseInt(newProdStock, 10) || 0,
      minStock: parseInt(newProdMinStock, 10) || 5,
      status: 'safe',
      location: 'Gudang Utama'
    };

    onAddProduct(product);
    setShowAddProductModal(false);
    // Reset form
    setNewProdName('');
    setNewProdHpp('');
    setNewProdPrice('');
    setNewProdStock('');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = 'SKU,Nama Barang,Kategori,Stok,Satuan,HPP,Harga Jual,Lokasi\n';
    const rows = products
      .map(
        (p) =>
          `"${p.sku}","${p.name}","${p.categoryLabel}",${p.stockQty},"${p.unit}",${p.hpp},${p.price},"${p.location || '-'}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventaris_Sembako_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Search & Scan Bar */}
      <div className="px-gutter pt-space-md pb-space-xs">
        <div className="relative flex items-center w-full bg-[#f0f3ff] rounded-xl px-3 py-2.5 shadow-sm border border-[#dee8ff]">
          <span className="material-symbols-outlined text-[#727974] text-[20px] mr-2">search</span>
          <input
            id="stockSearchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU, nama sembako, atau barcode (F2)..."
            className="bg-transparent border-0 outline-none w-full font-body-md text-body-md text-[#111c2d] placeholder:text-[#727974]"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => {
                const sampleBarcode = '8999999512349';
                setSearchQuery(sampleBarcode);
              }}
              aria-label="Scan Barcode"
              className="w-8 h-8 rounded-lg bg-[#e7eeff] flex items-center justify-center text-[#006c4a] hover:bg-[#82f5c1] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Mosaic */}
      <div className="px-gutter py-space-sm">
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Total Asset Value Card */}
          <div className="col-span-2 bg-[#0f291e] text-white rounded-xl p-space-md shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#85f8c4] opacity-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">
                  account_balance_wallet
                </span>
                <span className="font-label-sm text-label-sm text-[#b0cdbd] uppercase tracking-wider font-semibold">
                  Nilai Aset Stok (HPP)
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-[#006c4a] text-white px-2 py-0.5 rounded-full font-semibold">
                Aktif
              </span>
            </div>
            <div className="font-currency-display-mobile text-currency-display-mobile tracking-tight text-white mb-2">
              Rp {totalHppValue.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center justify-between text-[#b0cdbd] text-body-sm font-body-sm pt-2 border-t border-white/10">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">trending_up</span>
                Margin potensial ~9.8%
              </span>
              <span className="font-mono-num text-mono-num font-semibold text-[#85f8c4]">
                {products.length} Total SKU
              </span>
            </div>
          </div>

          {/* Active SKUs Mini Card */}
          <div className="bg-[#f0f3ff] rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-[#dee8ff]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm text-[#424844] font-medium">SKU Tersedia</span>
              <div className="w-6 h-6 rounded-lg bg-[#82f5c1]/60 flex items-center justify-center text-[#006c4a]">
                <span className="material-symbols-outlined text-[15px]">inventory</span>
              </div>
            </div>
            <div>
              <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#111c2d] font-bold">
                {safeCount}
              </div>
              <span className="font-label-sm text-label-sm text-[#006c4a] font-semibold">Tersedia di Rak</span>
            </div>
          </div>

          {/* Critical Stock Warning Mini Card */}
          <div className="bg-[#ffdad6]/40 rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-[#ffdad6]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm text-[#93000a] font-medium">Stok Menipis</span>
              <div className="w-6 h-6 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[15px]">warning</span>
              </div>
            </div>
            <div>
              <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#ba1a1a] font-bold">
                {criticalCount} SKU
              </div>
              <span className="font-label-sm text-label-sm text-[#93000a] font-medium">Butuh Order Cepat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Drawer Carousel */}
      <div className="px-gutter py-space-xs">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Opname Fisik */}
          <button
            type="button"
            onClick={() => setShowOpnameModal(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-[#006c4a] text-white px-3.5 py-2.5 rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            <span className="font-label-md text-label-md font-semibold whitespace-nowrap">Stok Opname</span>
          </button>
          {/* Tambah Produk Baru */}
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-[#dee8ff] text-[#111c2d] px-3.5 py-2.5 rounded-xl shadow-sm hover:bg-[#d8e3fb] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">add_circle</span>
            <span className="font-label-md text-label-md font-semibold whitespace-nowrap">Tambah Produk</span>
          </button>
          {/* Konversi Satuan */}
          <button
            type="button"
            onClick={() => setShowUnpackModal(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-[#dee8ff] text-[#111c2d] px-3.5 py-2.5 rounded-xl shadow-sm hover:bg-[#d8e3fb] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#424844] text-[18px]">sync_alt</span>
            <span className="font-label-md text-label-md font-semibold whitespace-nowrap">Pecah Satuan (Dus)</span>
          </button>
          {/* Audit History */}
          <button
            type="button"
            onClick={() => setShowMutationModal(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-[#f0f3ff] text-[#111c2d] px-3.5 py-2.5 rounded-xl shadow-sm hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer border border-[#dee8ff]"
          >
            <span className="material-symbols-outlined text-[#727974] text-[18px]">history</span>
            <span className="font-label-md text-label-md font-semibold whitespace-nowrap">Riwayat Mutasi</span>
          </button>
        </div>
      </div>

      {/* Filter Pills Segment */}
      <div className="px-gutter pt-space-sm pb-space-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#0f291e] text-white shadow-sm'
                : 'bg-[#f0f3ff] text-[#424844] hover:bg-[#e7eeff]'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all cursor-pointer ${
              filterType === 'critical'
                ? 'bg-[#ba1a1a] text-white shadow-sm font-semibold'
                : 'bg-[#f0f3ff] text-[#424844] hover:bg-[#e7eeff]'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#ba1a1a] mr-1"></span>
            Stok Kritis ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expiring')}
            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all cursor-pointer ${
              filterType === 'expiring'
                ? 'bg-[#006c4a] text-white shadow-sm font-semibold'
                : 'bg-[#f0f3ff] text-[#424844] hover:bg-[#e7eeff]'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#006c4a] mr-1"></span>
            Kadaluarsa Dekat (3)
          </button>
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="px-gutter py-space-sm flex flex-col gap-space-sm">
        {filteredProducts.map((item) => {
          const isCritical = item.stockQty <= item.minStock || item.status === 'critical';

          return (
            <div
              key={item.id}
              className={`rounded-xl p-space-md shadow-sm transition-transform active:scale-[0.99] flex flex-col gap-2.5 border ${
                isCritical
                  ? 'bg-white border-[#ffdad6]'
                  : 'bg-white border-[#e7eeff]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-12 h-12 shrink-0">
                    <ProductImageCard
                      product={item}
                      size="sm"
                      aspectRatio="square"
                      showCameraButton={false}
                      showBadge={false}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-title-md text-title-md text-[#111c2d] font-semibold truncate">
                      {item.name}
                    </h2>
                    <span className="font-mono-num text-mono-num text-body-sm text-[#424844]">
                      {item.sku} • {item.location || 'Gudang'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                {isCritical ? (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold animate-pulse">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    Kritis
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 bg-[#82f5c1] text-[#00714e] px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Aman
                  </span>
                )}
              </div>

              {/* Quantity Metric & Conversion Row */}
              <div
                className={`rounded-lg p-2.5 flex items-center justify-between ${
                  isCritical ? 'bg-[#ffdad6]/20' : 'bg-[#f0f3ff]'
                }`}
              >
                <div>
                  <span
                    className={`font-label-sm text-label-sm block ${
                      isCritical ? 'text-[#93000a] font-semibold' : 'text-[#424844]'
                    }`}
                  >
                    {isCritical ? 'Sisa Saldo Toko' : 'Saldo Fisik'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-headline-md text-headline-md font-bold ${
                        isCritical ? 'text-[#ba1a1a]' : 'text-[#111c2d]'
                      }`}
                    >
                      {item.stockQty}
                    </span>
                    <span
                      className={`font-label-md text-label-md font-medium capitalize ${
                        isCritical ? 'text-[#ba1a1a]' : 'text-[#424844]'
                      }`}
                    >
                      {item.unit}
                    </span>
                    {item.isMultiUnit && item.totalSubUnits && (
                      <span className="text-xs text-[#727974] ml-1">
                        ({item.totalSubUnits} {item.childUnit})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-[#727974] block">Batas Minimum</span>
                  <span className="font-mono-num text-mono-num text-body-sm text-[#111c2d] font-semibold">
                    {item.minStock} {item.unit}
                  </span>
                </div>
              </div>

              {/* Cost & Retail Price Grid */}
              <div className="grid grid-cols-2 gap-2 text-body-sm font-body-sm pt-0.5">
                <div className="bg-[#dee8ff]/40 rounded-lg p-2">
                  <span className="font-label-sm text-label-sm text-[#727974] block">HPP Rata-rata</span>
                  <span className="font-mono-num text-mono-num font-semibold text-[#111c2d]">
                    Rp {item.hpp.toLocaleString('id-ID')}
                  </span>
                  <span className="font-label-sm text-label-sm text-[#727974]">/{item.unit}</span>
                </div>
                <div className="bg-[#dee8ff]/40 rounded-lg p-2 text-right">
                  <span className="font-label-sm text-label-sm text-[#727974] block">Harga Ecer Jual</span>
                  <span className="font-mono-num text-mono-num font-bold text-[#006c4a]">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                  <span className="font-label-sm text-label-sm text-[#006c4a] font-medium block">
                    /{item.unit} (+{Math.round(((item.price - item.hpp) / item.hpp) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-label-sm text-label-sm text-[#424844] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#727974]">
                    {item.weightApprox ? 'scale' : 'shelves'}
                  </span>
                  {item.weightApprox ? `Total ${item.weightApprox}` : item.location || 'Rak Toko'}
                </span>

                <div className="flex items-center gap-2">
                  {item.isMultiUnit && (
                    <button
                      type="button"
                      onClick={() => {
                        setUnpackProductId(item.id);
                        setShowUnpackModal(true);
                      }}
                      className="flex items-center gap-1 text-[#006c4a] hover:text-[#00714e] font-label-sm text-label-sm font-semibold bg-[#82f5c1]/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">unarchive</span>
                      Bongkar ke Ecer
                    </button>
                  )}

                  {isCritical && (
                    <button
                      type="button"
                      onClick={() => {}}
                      className="flex items-center gap-1.5 bg-[#0f291e] text-white px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">local_shipping</span>
                      <span className="font-label-sm text-label-sm font-semibold">Reorder Supplier</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowEditStockModal(item)}
                    className="w-8 h-8 rounded-lg bg-[#e7eeff] hover:bg-[#dee8ff] flex items-center justify-center text-[#111c2d] transition-colors cursor-pointer"
                    title="Sesuaikan Stok"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Audit & Export Bar */}
      <div className="px-gutter pt-space-xs pb-space-lg flex flex-col gap-2">
        <div className="bg-[#f0f3ff] rounded-xl p-space-md flex flex-col gap-3 border border-[#dee8ff]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">manage_history</span>
              <div>
                <span className="font-label-md text-label-md font-semibold text-[#111c2d] block">
                  Audit Mutasi Stok
                </span>
                <span className="font-body-sm text-body-sm text-[#727974]">Pencatatan real-time keluar/masuk</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm bg-[#e7eeff] text-[#424844] px-2 py-0.5 rounded font-mono-num font-semibold">
              Hari ini: +28 | -94
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowMutationModal(true)}
              className="flex items-center justify-center gap-2 bg-[#d8e3fb] text-[#111c2d] py-2.5 px-3 rounded-lg hover:bg-[#dee8ff] active:scale-95 transition-all cursor-pointer font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span className="font-label-sm text-label-sm">Riwayat Mutasi</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center justify-center gap-2 bg-[#82f5c1] text-[#00714e] py-2.5 px-3 rounded-lg hover:bg-[#85f8c4] active:scale-95 transition-all cursor-pointer font-semibold shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="font-label-sm text-label-sm">Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Stok Opname Fisik */}
      {showOpnameModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">checklist</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Stok Opname Fisik</h3>
              </div>
              <button
                onClick={() => setShowOpnameModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Pilih Produk</label>
                <select
                  value={opnameSelectedId}
                  onChange={(e) => {
                    setOpnameSelectedId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) setOpnamePhysicalCount(prod.stockQty);
                  }}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm text-[#111c2d] border border-[#dee8ff]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Sistem: {p.stockQty} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Hasil Hitung Fisik Sebenarnya</label>
                <input
                  type="number"
                  value={opnamePhysicalCount}
                  onChange={(e) => setOpnamePhysicalCount(parseInt(e.target.value, 10) || 0)}
                  className="h-11 px-3 bg-[#f0f3ff] rounded-lg font-mono text-lg font-bold text-[#111c2d] border border-[#dee8ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Keterangan / Alasan Penyesuaian</label>
                <input
                  type="text"
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm text-[#111c2d] border border-[#dee8ff]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveOpname}
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Penyesuaian Opname
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah Produk Baru */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">add_circle</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Tambah Produk Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Nama Produk / Sembako</label>
              <input
                required
                type="text"
                placeholder="cth. Terigu Segitiga Biru 1kg"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Kategori</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                  className="h-10 px-2 bg-[#f0f3ff] rounded-lg text-xs border border-[#dee8ff]"
                >
                  <option value="beras">Beras & Biji</option>
                  <option value="minyak">Minyak & Mentega</option>
                  <option value="gula">Gula & Tepung</option>
                  <option value="telur">Telur</option>
                  <option value="mie">Mie & Bumbu</option>
                  <option value="gas">Gas & Galon</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Satuan Kemasan</label>
                <input
                  type="text"
                  placeholder="karung / btl / bks"
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-xs border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">HPP Modal (Rp)</label>
                <input
                  type="number"
                  placeholder="cth. 15000"
                  value={newProdHpp}
                  onChange={(e) => setNewProdHpp(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Harga Jual (Rp)</label>
                <input
                  required
                  type="number"
                  placeholder="cth. 18000"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Stok Awal</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Batas Minimum</label>
                <input
                  type="number"
                  value={newProdMinStock}
                  onChange={(e) => setNewProdMinStock(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#0f291e] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Simpan Produk Baru
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: Pecah Satuan (Dus -> Ecer) */}
      {showUnpackModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">sync_alt</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Pecah Satuan Grosir</h3>
              </div>
              <button
                onClick={() => setShowUnpackModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#424844]">
              Bongkar kemasan bal / dus besar ke satuan bungkus/eceran rak toko secara otomatis tanpa selisih HPP.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Pilih Produk Multi-Satuan</label>
                <select
                  value={unpackProductId}
                  onChange={(e) => setUnpackProductId(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm text-[#111c2d] border border-[#dee8ff]"
                >
                  <option value="9">Indomie Ayam Bawang (1 Dus = 40 Bks)</option>
                  <option value="5">Indomie Goreng (1 Dus = 40 Bks)</option>
                  <option value="7">Beras Ramos 50kg (1 Karung = 50 Kg)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Jumlah Dus/Karung yang Dibongkar</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={unpackQty}
                  onChange={(e) => setUnpackQty(parseInt(e.target.value, 10) || 1)}
                  className="h-11 px-3 bg-[#f0f3ff] rounded-lg font-mono text-lg font-bold text-[#111c2d] border border-[#dee8ff]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#82f5c1]/20 border border-[#82f5c1] text-xs text-[#00714e]">
                <p className="font-bold">Konversi:</p>
                <p>
                  {unpackQty} Dus = {unpackQty * 40} Bungkus eceran siap pajang.
                </p>
              </div>
            </div>

            <button
              onClick={handleExecuteUnpack}
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">unarchive</span>
              Konfirmasi Bongkar ke Ecer
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Riwayat Mutasi */}
      {showMutationModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">history</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Riwayat Mutasi Stok</h3>
              </div>
              <button
                onClick={() => setShowMutationModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {mutations.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111c2d]">{m.product}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        m.type === 'in'
                          ? 'bg-[#82f5c1] text-[#00714e]'
                          : m.type === 'out'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#dee8ff] text-[#00130a]'
                      }`}
                    >
                      {m.type === 'in' ? `+${m.qty} ${m.unit}` : m.type === 'out' ? `-${m.qty} ${m.unit}` : `Bongkar`}
                    </span>
                  </div>
                  <p className="text-[#424844]">{m.note}</p>
                  <span className="text-[10px] text-[#727974]">{m.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Quick Adjust Single Stock */}
      {showEditStockModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-[#111c2d]">Sesuaikan Saldo Stok</h3>
              <button
                onClick={() => setShowEditStockModal(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-sm font-semibold text-[#111c2d]">{showEditStockModal.name}</p>

            <div className="flex items-center justify-between p-3 bg-[#f0f3ff] rounded-xl">
              <span className="text-xs text-[#727974]">Saldo Sekarang:</span>
              <span className="font-mono text-lg font-bold text-[#111c2d]">
                {showEditStockModal.stockQty} {showEditStockModal.unit}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#727974] font-semibold">Ubah ke Jumlah:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProductStock(showEditStockModal.id, Math.max(0, showEditStockModal.stockQty - 1))
                  }
                  className="w-10 h-10 bg-[#e7eeff] font-bold rounded-lg text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={showEditStockModal.stockQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) onUpdateProductStock(showEditStockModal.id, val);
                  }}
                  className="flex-1 h-10 text-center font-mono font-bold text-lg bg-[#f0f3ff] rounded-lg border border-[#dee8ff]"
                />
                <button
                  type="button"
                  onClick={() => onUpdateProductStock(showEditStockModal.id, showEditStockModal.stockQty + 1)}
                  className="w-10 h-10 bg-[#e7eeff] font-bold rounded-lg text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowEditStockModal(null)}
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

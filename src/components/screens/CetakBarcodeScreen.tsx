import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { BarcodeSvg } from '../common/BarcodeSvg';
import { getProductDisplayImage } from '../../utils/productImages';

interface CetakBarcodeScreenProps {
  products: Product[];
  preselectedProductId?: string;
  onNavigateToProduct?: (productId: string) => void;
}

export type LabelSize = 'kecil' | 'sedang' | 'besar';

export const CetakBarcodeScreen: React.FC<CetakBarcodeScreenProps> = ({
  products,
  preselectedProductId
}) => {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'internal' | 'manufacturer'>('all');
  const [labelSize, setLabelSize] = useState<LabelSize>('sedang');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'white'>('dark');

  // Selected products and copies mapping: { [productId]: count }
  const [printQuantities, setPrintQuantities] = useState<{ [productId: string]: number }>(() => {
    const initial: { [productId: string]: number } = {};
    if (preselectedProductId) {
      initial[preselectedProductId] = 4;
    } else {
      // Default select first 2 products for quick preview like in reference screenshot
      if (products[0]) initial[products[0].id] = 2;
      if (products[1]) initial[products[1].id] = 2;
    }
    return initial;
  });

  // Filtered product catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSource =
        filterSource === 'all'
          ? true
          : filterSource === 'internal'
          ? p.barcode_source === 'internal' || p.barcode.startsWith('SMK-')
          : p.barcode_source === 'manufacturer' || !p.barcode.startsWith('SMK-');

      return matchSearch && matchSource;
    });
  }, [products, searchQuery, filterSource]);

  const handleToggleSelectProduct = (productId: string) => {
    setPrintQuantities((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = 2;
      }
      return next;
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setPrintQuantities((prev) => {
      const current = prev[productId] || 0;
      const nextQty = Math.max(0, current + delta);
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[productId];
      } else {
        next[productId] = nextQty;
      }
      return next;
    });
  };

  const handleSetExactQty = (productId: string, qty: number) => {
    setPrintQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const next: { [productId: string]: number } = {};
    filteredProducts.forEach((p) => {
      next[p.id] = printQuantities[p.id] || 2;
    });
    setPrintQuantities(next);
  };

  const handleClearSelection = () => {
    setPrintQuantities({});
  };

  // Generate flat list of printable labels
  const printableList = useMemo(() => {
    const list: { product: Product; copyIndex: number }[] = [];
    Object.entries(printQuantities).forEach(([prodId, qty]) => {
      const prod = products.find((p) => p.id === prodId);
      if (prod && qty > 0) {
        for (let i = 0; i < qty; i++) {
          list.push({ product: prod, copyIndex: i + 1 });
        }
      }
    });
    return list;
  }, [printQuantities, products]);

  const totalLabelCount = printableList.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 pb-28 min-h-screen text-[#111c2d]">
      {/* Print Specific CSS Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-label-item {
            page-break-inside: avoid;
            break-inside: avoid;
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px dashed #666666 !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-28px">print</span>
            <h1 className="font-headline-md font-bold text-2xl text-[#111c2d]">
              Cetak Label Barcode
            </h1>
          </div>
          <p className="text-xs text-[#424844] mt-1">
            Cetak stiker barcode produk sembako format Code 128 (otomatis & barcode pabrik)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={totalLabelCount === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              totalLabelCount > 0
                ? 'bg-[#006c4a] hover:bg-[#005237] text-white shadow-[#006c4a]/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>Cetak {totalLabelCount} Label</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Selection & Options, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Left Column: Product Selector & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Label Configuration Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e7eeff] shadow-sm">
            <h3 className="font-bold text-sm text-[#111c2d] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">tune</span>
              Pengaturan Ukuran & Desain Label
            </h3>

            {/* Size Options */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-[#424844] block mb-1.5">
                Pilih Ukuran Stiker Label:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelSize('kecil')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    labelSize === 'kecil'
                      ? 'border-[#006c4a] bg-[#82f5c1]/20 text-[#006c4a] font-bold'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs font-bold">Kecil</p>
                  <p className="text-[10px] text-gray-500">40 × 30 mm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelSize('sedang')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    labelSize === 'sedang'
                      ? 'border-[#006c4a] bg-[#82f5c1]/20 text-[#006c4a] font-bold ring-2 ring-[#006c4a]/30'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs font-bold">Sedang</p>
                    <span className="text-[9px] bg-[#006c4a] text-white px-1 rounded font-bold">POS</span>
                  </div>
                  <p className="text-[10px] text-gray-500">50 × 35 mm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelSize('besar')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    labelSize === 'besar'
                      ? 'border-[#006c4a] bg-[#82f5c1]/20 text-[#006c4a] font-bold'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs font-bold">Besar</p>
                  <p className="text-[10px] text-gray-500">70 × 50 mm</p>
                </button>
              </div>
            </div>

            {/* Preview Style Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-600">Tema Tampilan Preview:</span>
              <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                    previewTheme === 'dark' ? 'bg-[#00130a] text-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Gelap (Mockup)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('white')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                    previewTheme === 'white' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Putih (Thermal)
                </button>
              </div>
            </div>
          </div>

          {/* Product Catalog Picker Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e7eeff] shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-[#111c2d]">Pilih Produk & Jumlah Cetak</h3>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={handleSelectAll}
                  className="text-[#006c4a] hover:underline font-bold"
                >
                  Pilih Semua
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  filterSource === 'all'
                    ? 'bg-[#006c4a] text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterSource('internal')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  filterSource === 'internal'
                    ? 'bg-[#006c4a] text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Internal SMK
              </button>
              <button
                type="button"
                onClick={() => setFilterSource('manufacturer')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  filterSource === 'manufacturer'
                    ? 'bg-[#006c4a] text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pabrik (EAN/UPC)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama, SKU, atau barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#006c4a] focus:outline-none"
              />
            </div>

            {/* Scrollable Products List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-50">
              {filteredProducts.map((p) => {
                const qty = printQuantities[p.id] || 0;
                const isSelected = qty > 0;
                const isInternal = p.barcode.startsWith('SMK-');
                const displayImg = getProductDisplayImage(p);

                return (
                  <div
                    key={p.id}
                    className={`pt-2 flex items-center justify-between gap-2 p-2 rounded-xl transition-colors ${
                      isSelected ? 'bg-[#82f5c1]/10 border border-[#82f5c1]/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox & Thumbnail */}
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleToggleSelectProduct(p.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectProduct(p.id)}
                        className="rounded text-[#006c4a] focus:ring-[#006c4a] cursor-pointer"
                      />
                      <img
                        src={displayImg}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0 bg-white"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span className="font-mono">{p.barcode}</span>
                          <span
                            className={`px-1 py-0.2 rounded font-semibold ${
                              isInternal
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isInternal ? 'Code 128' : 'Pabrik'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#006c4a]">
                          Rp {p.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    {isSelected ? (
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(p.id, -1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={qty}
                          onChange={(e) =>
                            handleSetExactQty(p.id, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-8 text-center text-xs font-bold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(p.id, 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleSelectProduct(p.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      >
                        + Tambah
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Total Label Siap Cetak:</span>
              <span className="font-bold text-[#006c4a] text-sm">{totalLabelCount} Lembar</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-5 border border-[#e7eeff] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#111c2d]">
                  Pratinjau Label SembakoPOS
                </h3>
                <p className="text-xs text-gray-500">
                  Desain label format Code 128 dengan foto produk, nama, harga hijau, dan barcode
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#82f5c1]/30 text-[#006c4a] px-2.5 py-1 rounded-full font-bold">
                  {totalLabelCount} Label
                </span>
                <button
                  onClick={handlePrint}
                  disabled={totalLabelCount === 0}
                  className="px-4 py-1.5 bg-[#006c4a] hover:bg-[#005237] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Preview
                </button>
              </div>
            </div>

            {totalLabelCount === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  barcode_scanner
                </span>
                <p className="text-sm font-bold text-gray-700">Belum ada produk yang dipilih</p>
                <p className="text-xs text-gray-500 mt-1">
                  Centang produk pada daftar di sebelah kiri untuk melihat pratinjau label dan mencetak.
                </p>
              </div>
            ) : (
              <div
                className={`p-6 rounded-2xl overflow-y-auto max-h-[620px] transition-colors ${
                  previewTheme === 'dark'
                    ? 'bg-[#000000] border border-neutral-800'
                    : 'bg-gray-100 border border-gray-300'
                }`}
              >
                {/* Visual Label Grid matching screenshot attachment */}
                <div
                  className={`grid gap-4 ${
                    labelSize === 'besar'
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : labelSize === 'sedang'
                      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  }`}
                >
                  {printableList.map((item, idx) => {
                    const isDark = previewTheme === 'dark';
                    const displayImg = getProductDisplayImage(item.product);

                    return (
                      <div
                        key={`${item.product.id}-${idx}`}
                        className={`rounded-2xl p-4 flex flex-col items-center text-center transition-transform shadow-md ${
                          isDark
                            ? 'bg-[#0b0f0d] border border-neutral-800 text-white'
                            : 'bg-white border border-gray-200 text-black'
                        }`}
                      >
                        {/* 1. Product Photo Container */}
                        <div
                          className={`w-full aspect-square rounded-xl overflow-hidden mb-3 p-2 flex items-center justify-center ${
                            isDark ? 'bg-white' : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <img
                            src={displayImg}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* 2. Product Name */}
                        <h4
                          className={`font-bold text-sm leading-tight mb-1 truncate w-full ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {item.product.name}
                        </h4>

                        {/* 3. Green Price (Matching Screenshot) */}
                        <p className="font-extrabold text-base text-[#10b981] mb-2">
                          Rp{item.product.price.toLocaleString('id-ID')}
                        </p>

                        {/* 4. Scannable Code 128 Barcode Bars */}
                        <div className="w-full flex flex-col items-center justify-center py-1 bg-white rounded-lg p-1">
                          <BarcodeSvg
                            value={item.product.barcode}
                            height={labelSize === 'besar' ? 44 : labelSize === 'sedang' ? 36 : 28}
                            barWidth={labelSize === 'besar' ? 1.5 : 1.3}
                            showText={false}
                            color="#000000"
                          />
                        </div>

                        {/* 5. Barcode Text Under Bars */}
                        <p
                          className={`font-mono text-xs font-bold tracking-wider mt-1.5 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {item.product.barcode}
                        </p>

                        {/* Copy tag */}
                        <span className="text-[9px] text-gray-500 mt-1">
                          Copy #{item.copyIndex}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {previewTheme === 'dark' && (
                  <p className="text-[11px] text-center text-gray-400 mt-4 italic">
                    Ilustrasi konsep label SembakoPOS. Saat tombol Cetak diklik, sistem akan otomatis
                    mengoptimalkan format hitam-putih untuk printer stiker/thermal.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area: Triggers only when window.print() is called */}
      <div id="print-area" className="hidden">
        <div
          className={`grid gap-3 ${
            labelSize === 'besar'
              ? 'grid-cols-2'
              : labelSize === 'sedang'
              ? 'grid-cols-3'
              : 'grid-cols-4'
          }`}
        >
          {printableList.map((item, idx) => {
            const displayImg = getProductDisplayImage(item.product);
            return (
              <div
                key={`print-${item.product.id}-${idx}`}
                className="print-label-item p-3 rounded border border-black flex flex-col items-center text-center bg-white"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                {/* Photo in Print */}
                <div className="w-24 h-24 mb-1 flex items-center justify-center">
                  <img
                    src={displayImg}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <p className="font-bold text-xs leading-tight text-black truncate w-full mb-0.5">
                  {item.product.name}
                </p>

                <p className="font-black text-sm text-black mb-1">
                  Rp{item.product.price.toLocaleString('id-ID')}
                </p>

                {/* Black Barcode Bars */}
                <BarcodeSvg
                  value={item.product.barcode}
                  height={labelSize === 'besar' ? 44 : 34}
                  barWidth={1.4}
                  showText={true}
                  color="#000000"
                  textColor="#000000"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

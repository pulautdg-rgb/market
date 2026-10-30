import React, { useState } from 'react';
import { Product, UserRole } from '../../types';
import { ProductPhotoModal } from '../modals/ProductPhotoModal';
import { ProductImageCard } from '../common/ProductImageCard';
import {
  getProductImageUrl,
  isProductCustomPhoto,
  DEFAULT_CATEGORY_IMAGES
} from '../../utils/productImages';

interface ProdukScreenProps {
  products: Product[];
  userRole: UserRole;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProdukScreen: React.FC<ProdukScreenProps> = ({
  products,
  userRole,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Photo Manager & Detail Modal state
  const [photoTargetProduct, setPhotoTargetProduct] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // New product form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'beras' as Product['category'],
    unit: 'karung',
    hpp: '',
    price: '',
    wholesalePrice: '',
    wholesaleMinQty: '',
    stockQty: '',
    minStock: '5',
    location: 'Gudang Utama',
    imageUrl: ''
  });

  const categories = [
    { id: 'semua', label: 'Semua Kategori' },
    { id: 'beras', label: 'Beras & Biji' },
    { id: 'minyak', label: 'Minyak & Mentega' },
    { id: 'gula', label: 'Gula & Tepung' },
    { id: 'telur', label: 'Telur' },
    { id: 'mie', label: 'Mie & Bumbu' },
    { id: 'gas', label: 'Gas & Galon' }
  ];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'semua' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Save New Product
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const defaultImg = DEFAULT_CATEGORY_IMAGES[formData.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
    const finalImg = formData.imageUrl || defaultImg;
    const timestamp = Date.now();

    const newProd: Product = {
      id: `prod-${timestamp}`,
      name: formData.name,
      sku: formData.sku || `SKU-${timestamp.toString().slice(-4)}`,
      barcode: formData.barcode || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: formData.category,
      categoryLabel: formData.category.toUpperCase(),
      unit: formData.unit,
      hpp: parseInt(formData.hpp, 10) || 0,
      price: parseInt(formData.price, 10) || 0,
      wholesalePrice: formData.wholesalePrice ? parseInt(formData.wholesalePrice, 10) : undefined,
      wholesaleMinQty: formData.wholesaleMinQty ? parseInt(formData.wholesaleMinQty, 10) : undefined,
      stockQty: parseInt(formData.stockQty, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 5,
      location: formData.location,
      imageUrl: finalImg,
      image_url: finalImg,
      isCustomPhoto: Boolean(formData.imageUrl),
      photoUpdatedAt: timestamp,
      status: 'safe',
      lastUpdated: 'Hari ini'
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      category: 'beras',
      unit: 'karung',
      hpp: '',
      price: '',
      wholesalePrice: '',
      wholesaleMinQty: '',
      stockQty: '',
      minStock: '5',
      location: 'Gudang Utama',
      imageUrl: ''
    });
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (deletingProductId) {
      onDeleteProduct(deletingProductId);
      setDeletingProductId(null);
      if (selectedDetailProduct?.id === deletingProductId) {
        setSelectedDetailProduct(null);
      }
    }
  };

  // Photo updated via modal
  const handlePhotoUpdated = (updated: Product) => {
    onUpdateProduct(updated);
    if (selectedDetailProduct?.id === updated.id) {
      setSelectedDetailProduct(updated);
    }
  };

  const canEdit = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="flex flex-col w-full pb-32 px-gutter pt-3 gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-[#006c4a] uppercase tracking-wider font-semibold">
            Master Data Katalog & Galeri Foto
          </span>
          <h2 className="font-headline-lg font-bold text-[#00130a] tracking-tight">
            Daftar Produk Sembako
          </h2>
          <p className="text-xs text-[#727974]">
            Total {products.length} produk terdaftar • Klik foto atau tombol kamera untuk mengganti foto produk (1:1)
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-auto h-11 px-4 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white font-label-md font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">add_circle</span>
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#e7eeff] flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727974] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama barang, barcode, atau SKU..."
            className="w-full h-11 pl-10 pr-4 bg-[#f0f3ff] rounded-xl font-body-md text-sm text-[#111c2d] placeholder:text-[#727974] focus:outline-none focus:bg-[#dee8ff] border border-[#dee8ff]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 px-3 bg-[#f0f3ff] rounded-xl text-xs font-semibold text-[#111c2d] border border-[#dee8ff] focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7eeff] overflow-hidden">
        {/* Mobile View: Enhanced Cards */}
        <div className="block lg:hidden divide-y divide-[#f0f3ff]">
          {paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-[#727974]">
              <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2">search_off</span>
              <p className="font-semibold text-sm">Produk tidak ditemukan</p>
              <p className="text-xs">Coba kata kunci atau kategori lain.</p>
            </div>
          ) : (
            paginatedProducts.map((p) => {
              const isCustom = isProductCustomPhoto(p);
              return (
                <div key={p.id} className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start gap-3">
                    {/* 1:1 Thumbnail with Camera Trigger */}
                    <div className="relative shrink-0">
                      <ProductImageCard
                        product={p}
                        userRole={userRole}
                        size="md"
                        aspectRatio="square"
                        onOpenPhotoManager={() => setPhotoTargetProduct(p)}
                        showCameraButton={canEdit}
                        showBadge={true}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          onClick={() => setSelectedDetailProduct(p)}
                          className="font-title-md font-bold text-[#00130a] leading-tight truncate hover:text-[#006c4a] cursor-pointer"
                        >
                          {p.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            p.stockQty <= p.minStock
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#82f5c1] text-[#00714e]'
                          }`}
                        >
                          {p.stockQty} {p.unit}
                        </span>
                      </div>

                      <p className="font-mono text-[11px] text-[#727974] mt-0.5">
                        {p.sku} • {p.barcode}
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-[#006c4a] text-sm">
                          Rp {p.price.toLocaleString('id-ID')}
                        </span>
                        {p.wholesalePrice && (
                          <span className="text-[10px] text-[#727974]">
                            Grosir: Rp {p.wholesalePrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Ribbon on Mobile Card */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#f0f3ff]">
                    {/* Quick Ganti Foto Button */}
                    {canEdit ? (
                      <button
                        onClick={() => setPhotoTargetProduct(p)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          isCustom
                            ? 'bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a]'
                            : 'bg-[#fef3c7] hover:bg-[#fde68a] text-[#b45309]'
                        }`}
                        title="Ganti Foto Produk"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#006c4a]">
                          photo_camera
                        </span>
                        <span>{isCustom ? 'Ganti Foto' : '+ Tambah Foto'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setPhotoTargetProduct(p)}
                        className="h-8 px-2.5 rounded-lg bg-[#f0f3ff] text-[#424844] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Lihat Foto</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Detail Button */}
                      <button
                        onClick={() => setSelectedDetailProduct(p)}
                        className="h-8 px-2.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        <span>Detail</span>
                      </button>

                      {canEdit && (
                        <>
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 rounded-lg bg-[#dee8ff] text-[#00130a] hover:bg-[#d8e3fb] cursor-pointer"
                            title="Edit Data Produk"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffcdd2] cursor-pointer"
                            title="Hapus Produk"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table with 1:1 Thumbnails and Photo Triggers */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f0f3ff] text-[#727974] text-xs font-semibold uppercase tracking-wider border-b border-[#dee8ff]">
              <tr>
                <th className="py-3 px-4">Foto & Produk</th>
                <th className="py-3 px-4">Barcode / SKU</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Eceran</th>
                {userRole !== 'kasir' && <th className="py-3 px-4">HPP Modal</th>}
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status Foto</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#727974]">
                    Produk tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const isCustom = isProductCustomPhoto(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {/* 1:1 Thumbnail with Camera Trigger */}
                          <div className="relative">
                            <ProductImageCard
                              product={prod}
                              userRole={userRole}
                              size="sm"
                              aspectRatio="square"
                              onOpenPhotoManager={() => setPhotoTargetProduct(prod)}
                              showCameraButton={canEdit}
                              showBadge={false}
                            />
                          </div>

                          <div className="min-w-0">
                            <p
                              onClick={() => setSelectedDetailProduct(prod)}
                              className="font-bold text-[#00130a] cursor-pointer hover:text-[#006c4a]"
                            >
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-[#727974]">{prod.unit}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <p className="text-[#00130a] font-semibold">{prod.barcode}</p>
                        <p className="text-[#727974]">{prod.sku}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs bg-[#dee8ff] text-[#00130a] px-2 py-0.5 rounded font-medium">
                          {prod.categoryLabel}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#006c4a]">
                        Rp {prod.price.toLocaleString('id-ID')}
                        {prod.wholesalePrice && (
                          <span className="block text-[11px] text-[#727974] font-normal">
                            Grosir: Rp {prod.wholesalePrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      {userRole !== 'kasir' && (
                        <td className="py-3 px-4 font-mono text-xs text-[#424844]">
                          Rp {prod.hpp.toLocaleString('id-ID')}
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            prod.stockQty <= prod.minStock
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#82f5c1] text-[#00714e]'
                          }`}
                        >
                          {prod.stockQty} {prod.unit}
                        </span>
                      </td>

                      {/* Status Foto Column */}
                      <td className="py-3 px-4">
                        {isCustom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#006c4a] text-xs font-bold border border-[#a7f3d0]">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Foto Asli
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fefce8] text-[#b45309] text-xs font-semibold border border-[#fef08a]">
                            <span className="material-symbols-outlined text-[13px]">palette</span>
                            Default
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Photo Manager Button */}
                          <button
                            onClick={() => setPhotoTargetProduct(prod)}
                            className="p-1.5 rounded-lg bg-[#82f5c1] hover:bg-[#68dba9] text-[#002114] transition-colors cursor-pointer"
                            title="Kelola & Ganti Foto Produk (Upload / Kamera)"
                          >
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => setSelectedDetailProduct(prod)}
                            className="p-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#00130a] transition-colors cursor-pointer"
                            title="Lihat Detail Produk"
                          >
                            <span className="material-symbols-outlined text-[16px]">info</span>
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1.5 rounded-lg bg-[#dee8ff] hover:bg-[#d8e3fb] text-[#00130a] transition-colors cursor-pointer"
                                title="Edit Data Produk"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingProductId(prod.id)}
                                className="p-1.5 rounded-lg bg-[#ffdad6] hover:bg-[#ffcdd2] text-[#ba1a1a] transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#f0f3ff] border-t border-[#dee8ff] flex items-center justify-between text-xs text-[#727974]">
          <span>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-white border border-[#dee8ff] text-[#00130a] disabled:opacity-40 cursor-pointer font-semibold"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-bold text-[#00130a]">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-white border border-[#dee8ff] text-[#00130a] disabled:opacity-40 cursor-pointer font-semibold"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: DETAIL PRODUK (DENGAN 4 TOMBOL FOTO LENGKAP)             */}
      {/* ============================================================== */}
      {selectedDetailProduct && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto border border-[#dee8ff]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#006c4a] tracking-wider">
                  Detail & Galeri Produk
                </span>
                <h3 className="font-headline-md font-bold text-[#00130a] leading-tight">
                  {selectedDetailProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailProduct(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#424844] hover:bg-[#dee8ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 1:1 Large Image Preview with Quick Camera Button */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-[#f0f3ff] border-2 border-[#dee8ff] shadow-inner">
              <img
                src={getProductImageUrl(selectedDetailProduct, true)}
                alt={selectedDetailProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    DEFAULT_CATEGORY_IMAGES[selectedDetailProduct.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-2.5 left-2.5">
                {isProductCustomPhoto(selectedDetailProduct) ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#006c4a] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[13px] text-[#85f8c4]">verified</span>
                    Foto Asli
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#facc15] text-[#713f12] text-[11px] font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[13px]">palette</span>
                    Foto Default Kategori
                  </span>
                )}
              </div>

              {/* Quick Camera Edit Button */}
              {canEdit && (
                <button
                  onClick={() => setPhotoTargetProduct(selectedDetailProduct)}
                  title="Ganti Foto Produk"
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#00130a] text-white flex items-center justify-center hover:bg-[#006c4a] shadow-lg transition-all active:scale-95 cursor-pointer border border-white/20"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">
                    photo_camera
                  </span>
                </button>
              )}
            </div>

            {/* 4 Explicit Photo Actions Required: Ganti Foto, Upload Foto, Hapus Foto, Lihat Foto */}
            <div className="p-3 bg-[#f0f3ff] rounded-2xl border border-[#dee8ff] flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#727974] uppercase tracking-wider">
                Pengelolaan Foto Produk:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Ganti Foto */}
                <button
                  onClick={() => setPhotoTargetProduct(selectedDetailProduct)}
                  className="h-9 px-3 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">cached</span>
                  <span>Ganti Foto</span>
                </button>

                {/* 2. Upload Foto */}
                <button
                  onClick={() => setPhotoTargetProduct(selectedDetailProduct)}
                  className="h-9 px-3 rounded-xl bg-[#82f5c1] hover:bg-[#68dba9] text-[#002114] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload Foto</span>
                </button>

                {/* 3. Hapus Foto (if custom) or Disabled */}
                {isProductCustomPhoto(selectedDetailProduct) ? (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus foto produk "${selectedDetailProduct.name}" dan kembali ke foto default?`)) {
                        const defaultImg =
                          DEFAULT_CATEGORY_IMAGES[selectedDetailProduct.category] ||
                          DEFAULT_CATEGORY_IMAGES.lainnya;
                        const updated: Product = {
                          ...selectedDetailProduct,
                          imageUrl: defaultImg,
                          image_url: defaultImg,
                          imagePath: undefined,
                          image_path: undefined,
                          isCustomPhoto: false,
                          photoUpdatedAt: Date.now()
                        };
                        handlePhotoUpdated(updated);
                      }
                    }}
                    className="h-9 px-3 rounded-xl bg-[#ffdad6] hover:bg-[#ffcdd2] text-[#ba1a1a] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Hapus Foto</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setPhotoTargetProduct(selectedDetailProduct)}
                    className="h-9 px-3 rounded-xl bg-[#fffbeb] text-[#b45309] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#fde68a] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    <span>Tambah Foto</span>
                  </button>
                )}

                {/* 4. Lihat Foto Penuh */}
                <button
                  onClick={() => setPhotoTargetProduct(selectedDetailProduct)}
                  className="h-9 px-3 rounded-xl bg-white hover:bg-[#dee8ff] text-[#00130a] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#dee8ff] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Lihat Foto</span>
                </button>
              </div>
            </div>

            {/* Product Meta Data Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
                <span className="text-[#727974] block text-[10px]">Harga Eceran:</span>
                <span className="font-bold text-[#006c4a] text-sm">
                  Rp {selectedDetailProduct.price.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-2.5 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
                <span className="text-[#727974] block text-[10px]">Stok Tersedia:</span>
                <span className="font-bold text-[#00130a] text-sm">
                  {selectedDetailProduct.stockQty} {selectedDetailProduct.unit}
                </span>
              </div>

              <div className="p-2.5 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
                <span className="text-[#727974] block text-[10px]">Barcode:</span>
                <span className="font-mono font-bold text-[#00130a] text-xs">
                  {selectedDetailProduct.barcode}
                </span>
              </div>

              <div className="p-2.5 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
                <span className="text-[#727974] block text-[10px]">SKU:</span>
                <span className="font-mono font-bold text-[#00130a] text-xs">
                  {selectedDetailProduct.sku}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#f0f3ff]">
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingProduct(selectedDetailProduct);
                    setSelectedDetailProduct(null);
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#dee8ff] hover:bg-[#d8e3fb] text-[#00130a] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Ubah Data Produk</span>
                </button>
              )}
              <button
                onClick={() => setSelectedDetailProduct(null)}
                className="h-10 px-4 rounded-xl bg-[#00130a] text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: Tambah Produk Baru                                    */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleSaveNewProduct}
            className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <h3 className="font-headline-md font-bold text-[#00130a]">Tambah Produk Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Nama Produk *</label>
              <input
                required
                type="text"
                placeholder="cth. Beras Rojolele 10kg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
                <label className="text-xs text-[#727974] font-semibold">Satuan Kemasan *</label>
                <input
                  required
                  type="text"
                  placeholder="karung / btl / bks"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-xs border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Barcode Produk</label>
                <input
                  type="text"
                  placeholder="Scan / ketik barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Kode SKU</label>
                <input
                  type="text"
                  placeholder="cth. SKU-BRS-10K"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Harga Pokok (HPP) Rp</label>
                <input
                  type="number"
                  placeholder="cth. 120000"
                  value={formData.hpp}
                  onChange={(e) => setFormData({ ...formData, hpp: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Harga Jual Eceran Rp *</label>
                <input
                  required
                  type="number"
                  placeholder="cth. 135000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono font-bold text-[#006c4a] border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Stok Awal</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Batas Minimum Peringatan</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#f0f3ff] rounded-xl border border-[#dee8ff] text-xs text-[#424844] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={DEFAULT_CATEGORY_IMAGES[formData.category] || DEFAULT_CATEGORY_IMAGES.lainnya}
                  alt="Default Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-[#dee8ff]"
                />
                <div>
                  <span className="font-bold text-[#00130a] block">Foto Awal Produk</span>
                  <span className="text-[11px] text-[#727974]">
                    Default kategori {formData.category}. Foto dapat diubah/di-crop kapan saja via tombol kamera.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">check</span>
              <span>Simpan Produk ke Katalog</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Data Produk                                      */}
      {/* ============================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <h3 className="font-headline-md font-bold text-[#00130a]">Ubah Data Produk</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quick Photo Trigger inside Edit form */}
            <div className="flex items-center gap-3 p-3 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[#dee8ff]">
                <img
                  src={getProductImageUrl(editingProduct, true)}
                  alt={editingProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-[#00130a] block">{editingProduct.name}</span>
                <span className="text-[11px] text-[#727974]">
                  {isProductCustomPhoto(editingProduct) ? 'Foto asli tersimpan' : 'Foto default kategori'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoTargetProduct(editingProduct)}
                className="h-8 px-2.5 rounded-lg bg-[#00130a] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">photo_camera</span>
                <span>Ganti Foto</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Nama Produk</label>
              <input
                required
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Harga Jual (Rp)</label>
                <input
                  required
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })
                  }
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono font-bold text-[#006c4a] border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">HPP Modal (Rp)</label>
                <input
                  type="number"
                  value={editingProduct.hpp}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, hpp: parseInt(e.target.value, 10) || 0 })
                  }
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm font-mono border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Saldo Stok</label>
                <input
                  type="number"
                  value={editingProduct.stockQty}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stockQty: parseInt(e.target.value, 10) || 0 })
                  }
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Batas Minimum</label>
                <input
                  type="number"
                  value={editingProduct.minStock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value, 10) || 0 })
                  }
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Lokasi Penyimpanan</label>
              <input
                type="text"
                value={editingProduct.location || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Konfirmasi Hapus Produk                               */}
      {/* ============================================================== */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-headline-md font-bold text-[#111c2d]">Konfirmasi Hapus</h3>
            </div>
            <p className="text-xs text-[#424844]">
              Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="h-10 rounded-xl bg-[#f0f3ff] text-[#111c2d] font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-10 rounded-xl bg-[#ba1a1a] text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: PRODUCT PHOTO MANAGER & 1:1 CROPPER                   */}
      {/* ============================================================== */}
      {photoTargetProduct && (
        <ProductPhotoModal
          product={photoTargetProduct}
          isOpen={Boolean(photoTargetProduct)}
          onClose={() => setPhotoTargetProduct(null)}
          onSavePhoto={handlePhotoUpdated}
          userRole={userRole}
        />
      )}
    </div>
  );
};

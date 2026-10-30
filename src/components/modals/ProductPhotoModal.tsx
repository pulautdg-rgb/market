import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Product, UserRole } from '../../types';
import {
  getProductImageUrl,
  isProductCustomPhoto,
  DEFAULT_CATEGORY_IMAGES,
  validateImageFile
} from '../../utils/productImages';

interface ProductPhotoModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (updatedProduct: Product) => void;
  userRole?: UserRole;
  onShowToast?: (msg: string) => void;
}

export const ProductPhotoModal: React.FC<ProductPhotoModalProps> = ({
  product,
  isOpen,
  onClose,
  onSavePhoto,
  userRole = 'owner',
  onShowToast
}) => {
  // Mode: 'overview' (view/actions) | 'crop' (adjust & preview) | 'view_full' (lightbox)
  const [modalMode, setModalMode] = useState<'overview' | 'crop' | 'view_full'>('overview');

  // Selected raw image for cropping
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('');

  // Crop adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Error message
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Hidden file inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setModalMode('overview');
      setRawImageSrc(null);
      setValidationError(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isOpen, product?.id]);

  const canEdit = userRole === 'owner' || userRole === 'admin';

  // Handle selected file
  const handleProcessFile = (file?: File) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'File tidak valid.');
      if (onShowToast) onShowToast(`⚠️ ${validation.error}`);
      return;
    }

    setValidationError(null);
    setRawFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setRawImageSrc(result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setModalMode('crop');
      }
    };
    reader.readAsDataURL(file);
  };

  // Dragging handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset zoom & pan
  const handleResetAdjustments = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Generate 1:1 Cropped Image on Canvas
  const handleCropAndSave = useCallback(async () => {
    if (!product || !rawImageSrc || !imageElementRef.current || !viewportRef.current) return;

    setIsProcessing(true);

    try {
      const img = imageElementRef.current;
      const targetSize = 600; // High-resolution 1:1 square canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Gagal menginisialisasi canvas.');
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background with white in case image has transparency
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Compute transform
      const viewportRect = viewportRef.current.getBoundingClientRect();
      const viewportSize = Math.min(viewportRect.width, viewportRect.height);
      const scaleFactor = targetSize / viewportSize;

      ctx.save();
      ctx.translate(targetSize / 2, targetSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Calculate source scaled dimensions
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW: number;
      let drawH: number;

      if (aspect >= 1) {
        drawH = targetSize;
        drawW = targetSize * aspect;
      } else {
        drawW = targetSize;
        drawH = targetSize / aspect;
      }

      const drawX = -drawW / 2 + pan.x * scaleFactor;
      const drawY = -drawH / 2 + pan.y * scaleFactor;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Convert to optimized WebP (or JPEG fallback)
      const croppedDataUrl = canvas.toDataURL('image/webp', 0.88);
      const timestamp = Date.now();
      const newImagePath = `products/${product.sku.toLowerCase()}_${timestamp}.webp`;

      // Construct updated product object
      const updatedProduct: Product = {
        ...product,
        imageUrl: croppedDataUrl,
        image_url: croppedDataUrl,
        imagePath: newImagePath,
        image_path: newImagePath,
        isCustomPhoto: true,
        photoUpdatedAt: timestamp,
        lastUpdated: 'Baru saja'
      };

      onSavePhoto(updatedProduct);

      if (onShowToast) {
        onShowToast(`✓ Foto produk "${product.name}" berhasil diganti dan disimpan (1:1)`);
      }

      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setValidationError(`Gagal memproses gambar: ${err?.message || 'Kesalahan sistem'}`);
    }
  }, [product, rawImageSrc, zoom, pan, rotation, onSavePhoto, onShowToast, onClose]);

  // Handle Remove Photo (Restore Default Category)
  const handleRemovePhoto = () => {
    if (!product) return;
    if (confirm(`Apakah Anda yakin ingin menghapus foto produk "${product.name}" dan kembali ke foto default kategori?`)) {
      const defaultImg = DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
      const updatedProduct: Product = {
        ...product,
        imageUrl: defaultImg,
        image_url: defaultImg,
        imagePath: undefined,
        image_path: undefined,
        isCustomPhoto: false,
        photoUpdatedAt: Date.now()
      };

      onSavePhoto(updatedProduct);

      if (onShowToast) {
        onShowToast(`✓ Foto dihapus. Produk kembali menggunakan foto default kategori ${product.categoryLabel}.`);
      }
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const currentPhotoUrl = getProductImageUrl(product, true);
  const isCustom = isProductCustomPhoto(product);

  return (
    <div className="fixed inset-0 z-50 bg-[#00130a]/65 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#dee8ff]">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleProcessFile(file);
            e.target.value = '';
          }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleProcessFile(file);
            e.target.value = '';
          }}
        />

        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-[#e7eeff] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </span>
            <div className="min-w-0">
              <h3 className="font-headline-md font-bold text-[#00130a] text-sm sm:text-base truncate">
                {modalMode === 'crop'
                  ? 'Atur & Crop Foto Produk (1:1)'
                  : modalMode === 'view_full'
                  ? 'Lihat Foto Produk'
                  : 'Kelola Foto Produk'}
              </h3>
              <p className="text-xs text-[#727974] truncate">{product.name} ({product.sku})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#dee8ff] flex items-center justify-center text-[#424844] hover:bg-[#e7eeff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Error Banner */}
        {validationError && (
          <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2 border-b border-[#ba1a1a]/20">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="flex-1">{validationError}</span>
            <button
              onClick={() => setValidationError(null)}
              className="text-[#93000a] hover:underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 1: OVERVIEW & ACTION BUTTONS                              */}
        {/* ============================================================== */}
        {modalMode === 'overview' && (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Photo Preview Card */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-[#f0f3ff] border-2 border-[#dee8ff] shadow-inner group">
              <img
                src={currentPhotoUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-2.5 left-2.5">
                {isCustom ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#006c4a] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[13px] text-[#85f8c4]">verified</span>
                    Foto Asli Produk
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#facc15] text-[#713f12] text-[11px] font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[13px]">palette</span>
                    Foto Default ({product.categoryLabel})
                  </span>
                )}
              </div>

              {/* Fullscreen Magnify Trigger */}
              <button
                onClick={() => setModalMode('view_full')}
                title="Lihat Foto Penuh"
                className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-[#00130a]/80 text-white flex items-center justify-center hover:bg-[#00130a] shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
            </div>

            {/* Photo Status Info */}
            <div className="text-center text-xs text-[#727974]">
              {isCustom ? (
                <p>
                  Foto kustom tersimpan dan aktif di katalog, kasir, dan hasil scan barcode.
                  {product.photoUpdatedAt && (
                    <span className="block text-[10px] text-[#006c4a] font-semibold mt-0.5">
                      Terakhir diperbarui: {new Date(product.photoUpdatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-[#b45309] font-medium bg-[#fefce8] p-2 rounded-xl border border-[#fef08a]">
                  ⚠️ Produk ini belum memiliki foto asli. Menggunakan ilustrasi default kategori sembako.
                </p>
              )}
            </div>

            {/* Action Buttons Matrix */}
            <div className="flex flex-col gap-2 pt-1 border-t border-[#f0f3ff]">
              <span className="font-label-sm text-[#727974] font-bold uppercase tracking-wider text-[11px]">
                Tindakan Foto Produk:
              </span>

              {canEdit ? (
                <div className="grid grid-cols-2 gap-2">
                  {/* Action 1: Upload from Laptop / Gallery */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">upload_file</span>
                    <span>Upload Foto</span>
                  </button>

                  {/* Action 2: Direct Phone Camera */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3 rounded-xl bg-[#82f5c1] hover:bg-[#68dba9] text-[#002114] flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer border border-[#82f5c1]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#006c4a]">photo_camera</span>
                    <span>Kamera HP</span>
                  </button>

                  {/* Action 3: Ganti Foto (opens selector) */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-[#e7eeff] hover:bg-[#dee8ff] text-[#00130a] flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#006c4a]">cached</span>
                    <span>Ganti Foto</span>
                  </button>

                  {/* Action 4: Hapus Foto */}
                  {isCustom ? (
                    <button
                      onClick={handleRemovePhoto}
                      className="p-3 rounded-xl bg-[#ffdad6] hover:bg-[#ffcdd2] text-[#ba1a1a] flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      <span>Hapus Foto</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalMode('view_full')}
                      className="p-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#424844] flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-[#dee8ff]"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>Lihat Foto</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Kasir Restricted Notice */
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-xs text-[#727974]">
                  <p className="flex items-center gap-1.5 font-semibold text-[#00130a]">
                    <span className="material-symbols-outlined text-[16px] text-[#b45309]">lock</span>
                    Hak Akses Kasir Terbatas
                  </p>
                  <p className="mt-1">
                    Hanya pemilik toko (Owner / Admin) yang memiliki wewenang untuk mengganti atau menghapus foto produk.
                  </p>
                  <button
                    onClick={() => setModalMode('view_full')}
                    className="w-full mt-3 py-2 rounded-lg bg-[#00130a] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Lihat Foto Penuh</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload specs guideline */}
            <div className="bg-[#f0f3ff] rounded-xl p-3 border border-[#dee8ff] text-[11px] text-[#727974] space-y-1">
              <span className="font-bold text-[#00130a] block">Ketentuan Foto Produk:</span>
              <p>• Format: JPG, JPEG, PNG, atau WEBP</p>
              <p>• Ukuran maksimal: 5 MB per foto</p>
              <p>• Rasio seragam 1:1 (bujursangkar) otomatis dipotong rapi untuk katalog</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: INTERACTIVE 1:1 CROP, ZOOM, PAN PREVIEW               */}
        {/* ============================================================== */}
        {modalMode === 'crop' && rawImageSrc && (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Instruction banner */}
            <div className="flex items-center justify-between text-xs text-[#006c4a] bg-[#82f5c1]/30 p-2.5 rounded-xl border border-[#82f5c1]/60">
              <span className="flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px]">crop</span>
                Geser gambar untuk atur posisi, atur slider zoom
              </span>
              <span className="font-mono text-[11px] font-bold bg-white px-2 py-0.5 rounded text-[#00714e]">
                1:1 Square
              </span>
            </div>

            {/* Interactive Crop Viewport */}
            <div
              ref={viewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-[#1e293b] select-none border-2 border-[#006c4a] shadow-lg cursor-grab active:cursor-grabbing`}
            >
              {/* Image Under Manipulation */}
              <img
                ref={imageElementRef}
                src={rawImageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                }}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Viewport 1:1 Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-white/40 flex flex-col justify-between">
                <div className="w-full h-1/3 border-b border-white/20 border-dashed"></div>
                <div className="w-full h-1/3 border-t border-white/20 border-dashed"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none flex justify-between">
                <div className="h-full w-1/3 border-r border-white/20 border-dashed"></div>
                <div className="h-full w-1/3 border-l border-white/20 border-dashed"></div>
              </div>

              {/* Center crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="material-symbols-outlined text-white/30 text-[24px]">add</span>
              </div>
            </div>

            {/* Controls: Zoom, Rotate, Reset */}
            <div className="bg-[#f0f3ff] p-3.5 rounded-2xl border border-[#dee8ff] flex flex-col gap-3">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#00130a] shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">zoom_in</span>
                  Zoom:
                </span>

                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#dee8ff] text-[#00130a] font-bold text-sm flex items-center justify-center hover:bg-[#dee8ff]"
                >
                  -
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#006c4a] cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#dee8ff] text-[#00130a] font-bold text-sm flex items-center justify-center hover:bg-[#dee8ff]"
                >
                  +
                </button>

                <span className="font-mono text-xs font-bold text-[#006c4a] w-12 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Rotate & Reset Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#dee8ff]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="h-8 px-2.5 rounded-lg bg-white border border-[#dee8ff] text-[#00130a] text-xs font-semibold flex items-center gap-1 hover:bg-[#dee8ff] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">rotate_right</span>
                    <span>Putar 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    className="h-8 px-2.5 rounded-lg bg-white border border-[#dee8ff] text-[#727974] text-xs font-semibold flex items-center gap-1 hover:bg-[#dee8ff] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    <span>Reset</span>
                  </button>
                </div>

                <span className="text-[11px] text-[#727974] truncate max-w-[150px]">
                  {rawFileName}
                </span>
              </div>
            </div>

            {/* Bottom Modal Actions (Batal & Simpan Foto) */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setModalMode('overview');
                  setRawImageSrc(null);
                }}
                className="h-11 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#00130a] font-bold text-xs transition-all cursor-pointer border border-[#dee8ff]"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCropAndSave}
                className="h-11 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">check_circle</span>
                    <span>Simpan Foto (1:1)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: FULLSCREEN / LIGHTBOX VIEW                            */}
        {/* ============================================================== */}
        {modalMode === 'view_full' && (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="w-full max-h-[60vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center p-2">
              <img
                src={currentPhotoUrl}
                alt={product.name}
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#424844]">
              <div>
                <p className="font-bold text-[#00130a]">{product.name}</p>
                <p className="text-[#727974]">Kategori: {product.categoryLabel}</p>
              </div>

              <button
                onClick={() => setModalMode('overview')}
                className="h-9 px-4 rounded-xl bg-[#00130a] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Kembali</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

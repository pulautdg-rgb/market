import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Product, UserRole } from '../../types';
import { ProductPhotoModal } from '../modals/ProductPhotoModal';
import { ProductImageCard } from '../common/ProductImageCard';
import { isProductCustomPhoto } from '../../utils/productImages';

interface ScanCekHargaScreenProps {
  products: Product[];
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onOpenInCashier: (product: Product) => void;
  onAddNewProductWithBarcode?: (barcode: string) => void;
  onUpdateProduct?: (product: Product) => void;
}

export const ScanCekHargaScreen: React.FC<ScanCekHargaScreenProps> = ({
  products,
  userRole,
  onSwitchRole,
  onOpenInCashier,
  onAddNewProductWithBarcode,
  onUpdateProduct
}) => {
  const [photoTargetProduct, setPhotoTargetProduct] = useState<Product | null>(null);
  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [manualBarcodeInput, setManualBarcodeInput] = useState<string>('');
  
  // Detection result state
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Audio Beep generator using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch retail scanner beep
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Monitor online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Code Reader instance
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    // List available video devices
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setVideoDevices(devices);
        if (devices.length > 0) {
          // Prefer environment / back camera
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('belakang')
          );
          setSelectedDeviceId(backCam ? backCam.deviceId : devices[0].deviceId);
        }
      })
      .catch((err) => {
        console.warn('Could not list video devices:', err);
      });

    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera helper
  const stopCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Start camera scanning
  const startCamera = async (deviceIdToUse?: string) => {
    setCameraError(null);
    setIsNotFound(false);
    setScannedProduct(null);
    setScannedBarcode(null);

    const deviceId = deviceIdToUse || selectedDeviceId;

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Stop previous if any
      stopCamera();

      setIsScanning(true);

      // Constraints with ideal environment facingMode
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      if (!videoRef.current) return;

      const controls = await codeReaderRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, error, scannerControls) => {
          if (result) {
            const codeText = result.getText().trim();
            handleBarcodeDetected(codeText, scannerControls);
          }
        }
      );

      controlsRef.current = controls;
      setHasCameraPermission(true);
    } catch (err: any) {
      console.error('Error starting barcode scanner:', err);
      setIsScanning(false);
      setHasCameraPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Harap izinkan kamera pada browser HP Anda.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan pada perangkat Anda.');
      } else {
        setCameraError(`Gagal membuka kamera: ${err.message || 'Kamera sedang digunakan aplikasi lain'}. Gunakan input manual di bawah.`);
      }
    }
  };

  // Handle successful detection
  const handleBarcodeDetected = (code: string, scannerControls?: IScannerControls) => {
    // Stop scanning immediately to prevent duplicate reads
    if (scannerControls) {
      scannerControls.stop();
      controlsRef.current = null;
    }
    stopCamera();
    playBeep();

    setScannedBarcode(code);
    lookupBarcode(code);
  };

  // Search product by barcode
  const lookupBarcode = (barcode: string) => {
    const cleanCode = barcode.trim();
    setScannedBarcode(cleanCode);

    // Exact match against product barcode or SKU
    const found = products.find(
      (p) => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (found) {
      setScannedProduct(found);
      setIsNotFound(false);
    } else {
      setScannedProduct(null);
      setIsNotFound(true);
    }
  };

  // Switch camera front/back
  const handleToggleCamera = () => {
    if (videoDevices.length <= 1) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);

    if (isScanning) {
      startCamera(nextDevice.deviceId);
    }
  };

  // Resume scan for next item
  const handleScanNext = () => {
    setScannedBarcode(null);
    setScannedProduct(null);
    setIsNotFound(false);
    startCamera();
  };

  // Add to cashier cart and redirect
  const handleOpenInCashier = () => {
    if (scannedProduct) {
      onOpenInCashier(scannedProduct);
    }
  };

  // Verify Admin PIN to toggle owner role
  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === '8888') {
      onSwitchRole(userRole === 'owner' ? 'kasir' : 'owner');
      setShowAdminPinModal(false);
      setAdminPinInput('');
    } else {
      setAdminPinInput('');
    }
  };

  // Stock status badge computation
  const getStockStatusBadge = (product: Product) => {
    if (product.stockQty <= 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#93000a] px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="material-symbols-outlined text-[15px]">cancel</span>
          Habis
        </span>
      );
    }
    if (product.stockQty <= product.minStock) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#fffbeb] text-[#d97706] border border-[#fde68a] px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
          <span className="material-symbols-outlined text-[15px]">warning</span>
          Stok Menipis ({product.stockQty} {product.unit})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-[#82f5c1] text-[#00714e] px-2.5 py-1 rounded-full text-xs font-bold">
        <span className="material-symbols-outlined text-[15px]">check_circle</span>
        Tersedia ({product.stockQty} {product.unit})
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full pb-36 px-gutter pt-3 gap-3">
      {/* Top Banner: Cek Harga & Network Mode */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="font-label-sm text-label-sm text-[#006c4a] uppercase tracking-wider font-semibold">
            Pengecekan Instan
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-[#00130a] font-bold tracking-tight">
            Scan Barcode & Cek Harga
          </h2>
        </div>

        {/* Network status pill */}
        <div className="flex flex-col items-end">
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isOnline ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#e7eeff] text-[#424844]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#006c4a]' : 'bg-[#727974]'}`}
            ></span>
            <span>{isOnline ? 'Online (Server)' : 'Offline (Lokal)'}</span>
          </div>
          <button
            onClick={() => setShowAdminPinModal(true)}
            className="text-[11px] text-[#006c4a] hover:underline font-semibold flex items-center gap-0.5 mt-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">
              {userRole === 'owner' ? 'admin_panel_settings' : 'badge'}
            </span>
            <span>Mode: {userRole === 'owner' ? 'Owner (Info Modal Aktif)' : 'Kasir Biasa'}</span>
          </button>
        </div>
      </div>

      {/* Camera Viewport / Scanner Hub */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col items-center gap-3 relative overflow-hidden">
        {/* Video Viewport Container */}
        <div className="relative w-full aspect-[4/3] max-w-sm bg-[#00130a] rounded-xl overflow-hidden flex flex-col items-center justify-center text-white shadow-inner">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />

          {!isScanning && (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-[#85f8c4]">
                <span className="material-symbols-outlined text-[36px]">qr_code_scanner</span>
              </div>
              <p className="font-title-md font-bold text-white">Kamera Belum Aktif</p>
              <p className="text-xs text-white/70 max-w-xs">
                Klik tombol "Mulai Scan" untuk mengaktifkan kamera belakang HP dan arahkan ke barcode produk sembako.
              </p>
            </div>
          )}

          {/* Scanner Overlay Crosshairs & Laser Beam */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Target Bounding Box */}
              <div className="relative w-64 h-40 border-2 border-[#85f8c4] rounded-lg shadow-[0_0_15px_rgba(133,248,196,0.3)]">
                {/* 4 Corner Markers */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white"></span>
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white"></span>
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white"></span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white"></span>

                {/* Animated Laser Beam */}
                <div className="w-full h-0.5 bg-[#85f8c4] shadow-[0_0_10px_#85f8c4] animate-bounce absolute top-1/2 -translate-y-1/2"></div>
              </div>

              {/* Viewport instruction chip */}
              <div className="absolute bottom-3 bg-[#00130a]/80 text-[#85f8c4] px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">center_focus_strong</span>
                Arahkan kamera ke barcode produk
              </div>
            </div>
          )}
        </div>

        {/* Camera Action Buttons */}
        <div className="flex items-center gap-2 w-full max-w-sm">
          {!isScanning ? (
            <button
              onClick={() => startCamera()}
              className="flex-1 h-12 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">photo_camera</span>
              <span>Mulai Scan Kamera</span>
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="flex-1 h-12 bg-[#ba1a1a] text-white rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                <span>Hentikan Kamera</span>
              </button>

              {videoDevices.length > 1 && (
                <button
                  onClick={handleToggleCamera}
                  className="h-12 px-3.5 bg-[#dee8ff] text-[#00130a] rounded-xl font-label-md font-semibold flex items-center justify-center gap-1 hover:bg-[#d8e3fb] active:scale-95 transition-all cursor-pointer"
                  title="Ganti Kamera Depan/Belakang"
                >
                  <span className="material-symbols-outlined text-[20px]">cameraswitch</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Error notification if any */}
        {cameraError && (
          <div className="w-full max-w-sm p-3 rounded-xl bg-[#ffdad6]/60 border border-[#ffdad6] text-xs text-[#93000a] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <p className="font-bold">Kendala Akses Kamera</p>
              <p>{cameraError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Barcode Search & Fast Test Chips */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
          <span>Ketik / Masukkan Barcode Manual</span>
          <span className="text-[#727974] font-normal text-[11px]">Alternatif tanpa kamera</span>
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualBarcodeInput.trim()) {
              lookupBarcode(manualBarcodeInput.trim());
            }
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727974] text-[20px]">
              barcode
            </span>
            <input
              type="text"
              placeholder="cth. 8999999120023"
              value={manualBarcodeInput}
              onChange={(e) => setManualBarcodeInput(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#f0f3ff] font-mono-num text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-[#0f291e] text-white font-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">search</span>
            <span>Cari</span>
          </button>
        </form>

        {/* Quick Test Barcodes Chips */}
        <div className="flex flex-col gap-1 pt-1 border-t border-[#f0f3ff]">
          <span className="text-[11px] text-[#727974]">Pintasan Uji Cepat Barcode Barang:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                setManualBarcodeInput('8999999120023');
                lookupBarcode('8999999120023');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#f0f3ff] hover:bg-[#82f5c1] text-[11px] font-semibold text-[#00130a] whitespace-nowrap transition-colors border border-[#dee8ff]"
            >
              Minyak Bimoli (8999999120023)
            </button>
            <button
              onClick={() => {
                setManualBarcodeInput('8999999512349');
                lookupBarcode('8999999512349');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#f0f3ff] hover:bg-[#82f5c1] text-[11px] font-semibold text-[#00130a] whitespace-nowrap transition-colors border border-[#dee8ff]"
            >
              Beras Pandan 5kg (8999999512349)
            </button>
            <button
              onClick={() => {
                setManualBarcodeInput('8998866200223');
                lookupBarcode('8998866200223');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#f0f3ff] hover:bg-[#82f5c1] text-[11px] font-semibold text-[#00130a] whitespace-nowrap transition-colors border border-[#dee8ff]"
            >
              Indomie Goreng (8998866200223)
            </button>
            <button
              onClick={() => {
                setManualBarcodeInput('8990000000000');
                lookupBarcode('8990000000000');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[11px] font-semibold text-[#93000a] whitespace-nowrap transition-colors border border-[#ffdad6]"
            >
              Belum Terdaftar (8990000000000)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: TAMPILAN HASIL SCAN (Result Card) */}
      {scannedProduct && (
        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#82f5c1] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3">
          {/* Top header of card */}
          <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
            <span className="font-label-sm font-bold text-[#006c4a] uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Barcode Ditemukan di Database
            </span>
            {getStockStatusBadge(scannedProduct)}
          </div>

          {/* Product main info with 1:1 photo & quick camera edit */}
          <div className="flex gap-3 items-start">
            <div className="w-20 h-20 shrink-0">
              <ProductImageCard
                product={scannedProduct}
                userRole={userRole}
                size="md"
                aspectRatio="square"
                onOpenPhotoManager={() => setPhotoTargetProduct(scannedProduct)}
                showCameraButton={userRole !== 'kasir' && Boolean(onUpdateProduct)}
                showBadge={true}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-headline-md font-bold text-[#00130a] leading-tight">
                  {scannedProduct.name}
                </h3>
                {userRole !== 'kasir' && onUpdateProduct && (
                  <button
                    onClick={() => setPhotoTargetProduct(scannedProduct)}
                    className="shrink-0 text-[11px] font-bold text-[#006c4a] bg-[#82f5c1]/30 hover:bg-[#82f5c1] px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ganti Foto Produk"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                    <span>{isProductCustomPhoto(scannedProduct) ? 'Ganti Foto' : '+ Foto'}</span>
                  </button>
                )}
              </div>
              <span className="text-xs text-[#727974] font-medium mt-0.5">
                Kategori: <strong className="text-[#111c2d]">{scannedProduct.categoryLabel}</strong>
              </span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono-num text-[11px] bg-[#f0f3ff] text-[#424844] px-2 py-0.5 rounded font-bold">
                  Barcode: {scannedProduct.barcode}
                </span>
                <span className="font-mono-num text-[11px] text-[#727974]">
                  SKU: {scannedProduct.sku}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#727974] block font-semibold">Harga Jual Saat Ini:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline-xl text-headline-xl text-[#006c4a] font-extrabold tracking-tight">
                    Rp {scannedProduct.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-[#727974] font-semibold">
                    /{scannedProduct.unit}
                  </span>
                </div>
              </div>

              {scannedProduct.promoPrice && (
                <div className="text-right">
                  <span className="text-[11px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-2 py-0.5 rounded-full inline-block mb-0.5">
                    Harga Promo
                  </span>
                  <div className="font-title-md font-bold text-[#ba1a1a]">
                    Rp {scannedProduct.promoPrice.toLocaleString('id-ID')}
                  </div>
                </div>
              )}
            </div>

            {/* Multi-unit Tier Pricing if available */}
            {scannedProduct.wholesalePrice && (
              <div className="pt-2 border-t border-[#dee8ff] flex items-center justify-between text-xs">
                <span className="text-[#424844] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[15px] text-[#006c4a]">inventory_2</span>
                  Harga Grosir / Karton:
                </span>
                <span className="font-mono font-bold text-[#00130a]">
                  Rp {scannedProduct.wholesalePrice.toLocaleString('id-ID')}{' '}
                  <span className="text-[#727974] font-normal">(Min. {scannedProduct.wholesaleMinQty} {scannedProduct.unit})</span>
                </span>
              </div>
            )}

            {/* Dual Multi-unit conversion representation (e.g. Indomie 1 Dus = 40 Bks) */}
            {scannedProduct.isMultiUnit && (
              <div className="pt-2 border-t border-[#dee8ff] flex items-center justify-between text-xs text-[#424844]">
                <span>Satuan Pembelian:</span>
                <span className="font-semibold text-[#006c4a]">
                  1 {scannedProduct.parentUnit || 'Dus'} = {scannedProduct.conversionRatio || 40}{' '}
                  {scannedProduct.childUnit || 'Bks'}
                </span>
              </div>
            )}
          </div>

          {/* Stock & Location Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-[#e7eeff] flex flex-col">
              <span className="text-[#727974] text-[11px]">Stok Tersedia di Rak:</span>
              <span className="font-title-md font-bold text-[#111c2d]">
                {scannedProduct.stockQty} {scannedProduct.unit}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#e7eeff] flex flex-col">
              <span className="text-[#727974] text-[11px]">Lokasi Gudang / Rak:</span>
              <span className="font-title-md font-bold text-[#111c2d] truncate">
                {scannedProduct.location || 'Rak Display Utama'}
              </span>
            </div>
          </div>

          {/* OWNER / ADMIN ONLY: Harga Modal & Estimasi Margin */}
          {userRole === 'owner' ? (
            <div className="p-3 rounded-xl bg-[#0f291e] text-white flex items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1 text-[#85f8c4] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                  <span>Info Rahasia Modal (Akses Owner)</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-white/70">HPP Modal:</span>
                  <span className="font-mono font-bold text-sm text-white">
                    Rp {scannedProduct.hpp.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#85f8c4] block">Estimasi Margin:</span>
                <span className="font-bold text-sm text-[#85f8c4]">
                  +Rp {(scannedProduct.price - scannedProduct.hpp).toLocaleString('id-ID')} (
                  +{Math.round(((scannedProduct.price - scannedProduct.hpp) / scannedProduct.hpp) * 100)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between text-xs text-[#727974]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#727974]">lock</span>
                Harga modal & margin dikunci untuk kasir biasa
              </span>
              <button
                onClick={() => setShowAdminPinModal(true)}
                className="text-[#006c4a] font-bold hover:underline cursor-pointer"
              >
                Buka Kunci
              </button>
            </div>
          )}

          {/* Data freshness footnote */}
          <div className="flex items-center justify-between text-[11px] text-[#727974] px-1">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#006c4a]">
                {isOnline ? 'cloud_done' : 'save'}
              </span>
              {isOnline
                ? 'Data server tersinkron'
                : `Data lokal — terakhir diperbarui ${scannedProduct.lastUpdated || 'Hari ini, 07:00 WIB'}`}
            </span>
            <span>Cek harga tidak memotong stok</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0f3ff]">
            <button
              onClick={handleScanNext}
              className="h-11 bg-[#dee8ff] hover:bg-[#d8e3fb] text-[#00130a] rounded-xl font-label-md font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Scan Barang Berikutnya</span>
            </button>

            <button
              onClick={handleOpenInCashier}
              className="h-11 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-label-md font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">point_of_sale</span>
              <span>Buka di Kasir (+ Keranjang)</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: NOT FOUND STATE */}
      {isNotFound && scannedBarcode && (
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#ffdad6] flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>

          <div>
            <h3 className="font-headline-md font-bold text-[#ba1a1a]">Produk Belum Terdaftar</h3>
            <p className="font-mono text-xs text-[#424844] mt-1 bg-[#f0f3ff] px-2.5 py-1 rounded inline-block">
              Nomor Barcode: {scannedBarcode}
            </p>
            <p className="text-xs text-[#727974] mt-2 max-w-xs">
              Barcode ini belum ada dalam katalog database SembakoPOS. Sistem tidak akan otomatis membuat barang untuk
              mencegah duplikasi data.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
            <button
              onClick={handleScanNext}
              className="w-full h-11 rounded-xl bg-[#00130a] text-white font-label-md font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Cari Ulang / Scan Ulang</span>
            </button>

            <button
              onClick={() => {
                if (onAddNewProductWithBarcode) {
                  onAddNewProductWithBarcode(scannedBarcode);
                }
              }}
              className="w-full h-11 rounded-xl bg-[#82f5c1] text-[#00714e] font-label-md font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambah Produk Baru dengan Barcode Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Switch / Verify Admin PIN for Owner Mode */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleVerifyAdminPin}
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">security</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">
                  {userRole === 'owner' ? 'Kunci Kembali ke Kasir' : 'Buka Kunci Akses Modal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminPinModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#424844]">
              {userRole === 'owner'
                ? 'Kembali ke mode kasir biasa agar harga modal & keuntungan tidak tampak pada pelanggan.'
                : 'Masukkan PIN Owner / Pengelola Toko untuk membuka rincian harga modal HPP dan margin keuntungan.'}
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">PIN Keamanan (Demo: 1234)</label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="****"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="h-12 text-center tracking-widest text-xl font-mono bg-[#f0f3ff] rounded-xl border border-[#dee8ff] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Konfirmasi PIN
            </button>
          </form>
        </div>
      )}

      {/* PRODUCT PHOTO MANAGER & 1:1 CROPPER MODAL */}
      {photoTargetProduct && (
        <ProductPhotoModal
          product={photoTargetProduct}
          isOpen={Boolean(photoTargetProduct)}
          onClose={() => setPhotoTargetProduct(null)}
          onSavePhoto={(updated) => {
            if (onUpdateProduct) onUpdateProduct(updated);
            if (scannedProduct && scannedProduct.id === updated.id) {
              setScannedProduct(updated);
            }
            setPhotoTargetProduct(null);
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
};

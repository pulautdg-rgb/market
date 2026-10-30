import React, { useState, useEffect } from 'react';
import { Product, CartItem, CustomerKasbon, UserRole } from '../../types';
import { ProductPhotoModal } from '../modals/ProductPhotoModal';
import { CalculatorModal } from '../modals/CalculatorModal';
import {
  getProductImageUrl,
  isProductCustomPhoto,
  DEFAULT_CATEGORY_IMAGES
} from '../../utils/productImages';

interface KasirScreenProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenDrawer: () => void;
  onRecordSale: (sale: {
    cart: CartItem[];
    paymentMethod: string;
    totalAmount: number;
    cashTendered: number;
    change: number;
    customerName?: string;
    isKasbon?: boolean;
  }) => void;
  drawerBalance: number;
  onUpdateDrawerBalance: (newBalance: number) => void;
  customerKasbons: CustomerKasbon[];
  onAddKasbon: (kasbon: CustomerKasbon) => void;
  onOpenScannerTab?: () => void;
  userRole?: UserRole;
  onUpdateProduct?: (product: Product) => void;
}

export const KasirScreen: React.FC<KasirScreenProps> = ({
  products,
  cart,
  setCart,
  onRecordSale,
  drawerBalance,
  onUpdateDrawerBalance,
  customerKasbons,
  onAddKasbon,
  onOpenScannerTab,
  userRole = 'owner',
  onUpdateProduct
}) => {
  const [photoTargetProduct, setPhotoTargetProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartExpanded, setIsCartExpanded] = useState<boolean>(true);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showKasbonModal, setShowKasbonModal] = useState<boolean>(false);
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showDrawerModal, setShowDrawerModal] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Discount & tenders
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountNominal, setDiscountNominal] = useState<number>(0);
  const [selectedTender, setSelectedTender] = useState<number | null>(null);
  const [customTenderInput, setCustomTenderInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer'>('tunai');

  // Customer Kasbon Form
  const [kasbonCustomer, setKasbonCustomer] = useState<string>('Bu RT Endang');
  const [kasbonPhone, setKasbonPhone] = useState<string>('0812-3456-7890');
  const [kasbonDueDate, setKasbonDueDate] = useState<string>('Akhir Bulan');

  // Held transactions
  const [heldCarts, setHeldCarts] = useState<{ id: string; time: string; note: string; cart: CartItem[] }[]>([]);

  // Last finished receipt data
  const [lastReceipt, setLastReceipt] = useState<{
    notaNo: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    tendered: number;
    change: number;
    method: string;
    cashier: string;
  } | null>(null);

  // Animation visual feedback
  const [addedItemEffect, setAddedItemEffect] = useState<string | null>(null);

  // Categories
  const categories = [
    { id: 'semua', label: 'Semua', icon: 'apps' },
    { id: 'beras', label: 'Beras & Biji', icon: 'grain' },
    { id: 'minyak', label: 'Minyak & Mentega', icon: 'water_drop' },
    { id: 'gula', label: 'Gula & Tepung', icon: 'bakery_dining' },
    { id: 'telur', label: 'Telur', icon: 'egg' },
    { id: 'mie', label: 'Mie & Bumbu', icon: 'ramen_dining' },
    { id: 'gas', label: 'Gas & Galon', icon: 'propane_tank' }
  ];

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = discountNominal > 0 ? discountNominal : Math.round((rawSubtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Suggested tender values
  const tenderPas = grandTotal;
  const tender130 = Math.ceil(grandTotal / 10000) * 10000;
  const tender150 = Math.ceil(grandTotal / 50000) * 50000 || 50000;
  const tender200 = Math.ceil(grandTotal / 100000) * 100000 || 100000;

  const currentTenderValue =
    selectedTender !== null
      ? selectedTender
      : customTenderInput
      ? parseInt(customTenderInput.replace(/\D/g, ''), 10) || 0
      : grandTotal;

  const changeAmount = Math.max(0, currentTenderValue - grandTotal);

  // Hotkey support (F2, F12, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const skuInput = document.getElementById('sku-input');
        skuInput?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCalculator((prev) => !prev);
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowPaymentModal(true);
        }
      } else if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowCameraScanner(false);
        setShowDiscountModal(false);
        setShowKasbonModal(false);
        setShowHoldModal(false);
        setShowReceiptModal(false);
        setShowDrawerModal(false);
        setShowCalculator(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    // Visual feedback
    setAddedItemEffect(product.id);
    setTimeout(() => {
      setAddedItemEffect(null);
    }, 600);
  };

  // Steppers
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Hold Cart
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      note: `Nota #${heldCarts.length + 1} (${cart.length} item)`,
      cart: [...cart]
    };
    setHeldCarts((prev) => [...prev, newHold]);
    setCart([]);
    setShowHoldModal(false);
  };

  const handleRecallHold = (holdId: string) => {
    const selected = heldCarts.find((h) => h.id === holdId);
    if (selected) {
      setCart(selected.cart);
      setHeldCarts((prev) => prev.filter((h) => h.id !== holdId));
      setShowHoldModal(false);
    }
  };

  // Process Checkout with double-submit guard
  const handleConfirmPayment = () => {
    if (isProcessingPayment || cart.length === 0) return;
    setIsProcessingPayment(true);

    try {
      const notaNumber = `NB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;
      const tenderVal = paymentMethod === 'tunai' ? currentTenderValue : grandTotal;
      const changeVal = paymentMethod === 'tunai' ? changeAmount : 0;

      const receiptObj = {
        notaNo: notaNumber,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        subtotal: rawSubtotal,
        discount: discountAmount,
        total: grandTotal,
        tendered: tenderVal,
        change: changeVal,
        method: paymentMethod.toUpperCase(),
        cashier: 'Budi Santoso'
      };

      setLastReceipt(receiptObj);

      // Call store mutation
      onRecordSale({
        cart,
        paymentMethod,
        totalAmount: grandTotal,
        cashTendered: tenderVal,
        change: changeVal
      });

      // If tunai, increase drawer
      if (paymentMethod === 'tunai') {
        onUpdateDrawerBalance(drawerBalance + grandTotal);
      }

      setShowPaymentModal(false);
      setShowReceiptModal(true);
      setCart([]);
      setDiscountNominal(0);
      setDiscountPercent(0);
      setSelectedTender(null);
    } finally {
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 600);
    }
  };

  // Kasbon checkout with double-submit guard
  const handleSaveKasbon = () => {
    if (isProcessingPayment || !kasbonCustomer || cart.length === 0) return;
    setIsProcessingPayment(true);

    try {
      const notaNumber = `KB-${Date.now().toString().slice(-4)}`;
      const newKasbon: CustomerKasbon = {
        id: `kb-${Date.now()}`,
        customerName: kasbonCustomer,
        phone: kasbonPhone,
        totalDebt: grandTotal,
        lastTransactionDate: 'Hari ini',
        note: cart.map((c) => `${c.product.name} (${c.quantity})`).join(', '),
        dueDate: kasbonDueDate
      };

      onAddKasbon(newKasbon);
      onRecordSale({
        cart,
        paymentMethod: 'kasbon',
        totalAmount: grandTotal,
        cashTendered: 0,
        change: 0,
        customerName: kasbonCustomer,
        isKasbon: true
      });

      setShowKasbonModal(false);
      setCart([]);
    } finally {
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 600);
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'semua' || p.category === activeCategory;
    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex flex-col w-full pb-36">
      {/* POS Shift & Register Live Status Ribbon */}
      <section className="px-gutter pt-space-sm pb-space-xs">
        <div className="bg-[#f0f3ff] rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs border border-[#dee8ff]">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#82f5c1] text-[#00714e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-[#111c2d] font-semibold truncate">
                  Shift: Budi Santoso
                </p>
                <p className="font-body-sm text-body-sm text-[#424844] flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                  Sesi Pagi (07.00 - 15.00)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 bg-[#85f8c4] text-[#002114] px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                PWA Offline Ready
              </span>
            </div>
          </div>

          {/* Drawer Cash Balance & Quick Toggles */}
          <div className="bg-white rounded-lg p-space-sm flex items-center justify-between gap-space-sm mt-1 border border-[#e7eeff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">point_of_sale</span>
              <span className="font-body-sm text-body-sm text-[#424844]">Kas Laci Kasir:</span>
              <span className="font-title-md text-title-md text-[#00130a] font-bold tracking-tight">
                Rp {drawerBalance.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={() => setShowDrawerModal(true)}
              className="text-[#006c4a] font-label-sm text-label-sm hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
              id="toggle-drawer-btn"
            >
              <span>Buka Laci</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Barcode & SKU Search Hub */}
      <section className="px-gutter pt-space-xs pb-space-sm">
        <div className="bg-white rounded-xl p-space-sm shadow-sm flex flex-col gap-space-xs border border-[#e7eeff]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727974] text-[20px]">
                barcode_scanner
              </span>
              <input
                id="sku-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode / ketik SKU (F2)..."
                className="w-full h-11 pl-10 pr-16 bg-[#f0f3ff] rounded-lg font-mono-num text-mono-num text-[#111c2d] placeholder:text-[#727974] focus:outline-none focus:bg-[#dee8ff] transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-label-sm text-label-sm bg-[#e7eeff] text-[#424844] px-1.5 py-0.5 rounded font-bold">
                F2
              </span>
            </div>
            <button
              id="cam-scan-btn"
              onClick={() => {
                if (onOpenScannerTab) {
                  onOpenScannerTab();
                } else {
                  setShowCameraScanner(true);
                }
              }}
              aria-label="Scan Kamera HP"
              className="h-11 px-3.5 bg-[#dee8ff] active:bg-[#82f5c1] text-[#00130a] rounded-lg flex items-center justify-center gap-1.5 font-label-md text-label-md shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              <span className="hidden sm:inline">Scan Cek Harga</span>
            </button>
            <button
              id="kasir-calc-btn"
              onClick={() => setShowCalculator(true)}
              aria-label="Kalkulator Hitung Timbangan"
              title="Kalkulator Hitung Timbangan / Pecahan (F3)"
              className="h-11 px-3 bg-[#f0f3ff] hover:bg-[#dee8ff] active:bg-[#82f5c1] text-[#00130a] rounded-lg flex items-center justify-center gap-1 font-label-md text-label-md shrink-0 transition-transform active:scale-95 cursor-pointer border border-[#e7eeff]"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006c4a]">calculate</span>
              <span className="hidden md:inline font-semibold">Hitung (F3)</span>
            </button>
          </div>

          {/* Quick Scan Hotkeys Suggestions */}
          <div className="flex items-center justify-between text-[#424844] font-label-sm text-label-sm px-1">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-[#727974]">Pintas:</span>
              <button
                onClick={() => setShowCalculator(true)}
                className="quick-chip bg-[#82f5c1]/20 text-[#004e33] border border-[#82f5c1]/50 px-2 py-0.5 rounded-full hover:bg-[#82f5c1] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[13px]">calculate</span>
                Kalkulator
              </button>
              <button
                onClick={() => {
                  const item = products.find((p) => p.id === '3');
                  if (item) handleAddToCart(item);
                }}
                className="quick-chip bg-[#f0f3ff] px-2 py-0.5 rounded-full hover:bg-[#82f5c1] hover:text-[#00714e] transition-colors whitespace-nowrap cursor-pointer"
              >
                Telur Curah
              </button>
              <button
                onClick={() => {
                  const item = products.find((p) => p.id === '1');
                  if (item) handleAddToCart(item);
                }}
                className="quick-chip bg-[#f0f3ff] px-2 py-0.5 rounded-full hover:bg-[#82f5c1] hover:text-[#00714e] transition-colors whitespace-nowrap cursor-pointer"
              >
                Beras 5kg
              </button>
              <button
                onClick={() => {
                  const item = products.find((p) => p.id === '11');
                  if (item) handleAddToCart(item);
                }}
                className="quick-chip bg-[#f0f3ff] px-2 py-0.5 rounded-full hover:bg-[#82f5c1] hover:text-[#00714e] transition-colors whitespace-nowrap cursor-pointer"
              >
                LPG 3kg
              </button>
            </div>
            <span className="shrink-0 text-[#006c4a] flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-[14px]">bolt</span>Cepat
            </span>
          </div>
        </div>
      </section>

      {/* Horizontal Scrollable Category Pills */}
      <section className="pt-space-xs pb-space-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-gutter min-w-max">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-full font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#00130a] text-white shadow-sm'
                    : 'bg-[#e7eeff] text-[#424844] hover:bg-[#dee8ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="px-gutter flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-[#424844]">
            Daftar Komoditas Sembako ({filteredProducts.length})
          </span>
          <span className="font-label-sm text-label-sm text-[#006c4a] font-medium flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">touch_app</span> Tap kartu untuk tambah
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-sm">
          {filteredProducts.map((product) => {
            const isAdded = addedItemEffect === product.id;
            return (
              <article
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-white rounded-xl p-space-sm flex flex-col justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden border border-[#e7eeff] hover:border-[#82f5c1]"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f0f3ff] mb-2 border border-[#dee8ff]">
                  <img
                    src={getProductImageUrl(product, true)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
                    }}
                  />

                  {/* Stock pill in upper left */}
                  <span className="absolute top-1.5 left-1.5 bg-[#85f8c4] text-[#002114] font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {product.stockQty} {product.unit}
                  </span>

                  {/* Default photo badge if not custom */}
                  {!isProductCustomPhoto(product) && (
                    <span
                      title="Foto default kategori"
                      className="absolute bottom-1.5 left-1.5 bg-[#00130a]/80 text-[#facc15] font-bold text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[10px]">palette</span>
                      Default
                    </span>
                  )}

                  {/* Quick Camera Edit Button for Owners & Admins */}
                  {userRole !== 'kasir' && onUpdateProduct && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoTargetProduct(product);
                      }}
                      title="Ganti Foto Produk"
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-[#00130a]/85 hover:bg-[#006c4a] text-white flex items-center justify-center shadow-md cursor-pointer border border-white/30 transition-all active:scale-90 z-10"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">
                        photo_camera
                      </span>
                    </button>
                  )}

                  {/* Micro-interaction badge when tapped */}
                  {isAdded && (
                    <span className="absolute inset-0 bg-[#00130a]/60 backdrop-blur-[2px] flex items-center justify-center text-white font-title-md text-title-md font-bold animate-pulse z-20">
                      +1 Masuk
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <h2 className="font-title-md text-title-md text-[#111c2d] line-clamp-1 font-bold">
                      {product.name}
                    </h2>
                    {product.wholesalePrice && (
                      <span className="bg-[#dee8ff] text-[#00130a] font-label-sm text-label-sm px-1.5 py-0.2 rounded font-semibold shrink-0">
                        Grosir
                      </span>
                    )}
                  </div>
                  <span className="font-body-sm text-body-sm text-[#424844] truncate">
                    {product.categoryLabel}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-headline-md text-headline-md text-[#00130a] font-bold tracking-tight">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="font-label-sm text-label-sm text-[#727974]">/{product.unit}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Floating Bottom Sheet: Active Transaction / POS Cart Bar */}
      <section className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-30 bg-white shadow-[0_-8px_30px_rgba(0,19,10,0.12)] rounded-t-2xl border-t border-[#e7eeff]">
        <div className="max-w-xl mx-auto flex flex-col p-gutter">
          {/* Handle Bar & Collapse Header */}
          <div
            onClick={() => setIsCartExpanded(!isCartExpanded)}
            className="flex items-center justify-between pb-space-xs cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#82f5c1] text-[#00714e] flex items-center justify-center font-bold text-label-md">
                <span>{totalItemsCount}</span>
              </div>
              <div>
                <span className="font-title-md text-title-md text-[#111c2d] font-bold">Keranjang Aktif</span>
                <span className="font-body-sm text-body-sm text-[#424844] block">Nota #NB-202410-089</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#424844] font-label-sm text-label-sm">
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                  isCartExpanded ? 'rotate-0' : 'rotate-180'
                }`}
              >
                expand_more
              </span>
            </div>
          </div>

          {/* Collapsible Active Cart Items Details */}
          {isCartExpanded && (
            <div className="flex flex-col gap-2 py-2 max-h-48 overflow-y-auto my-1 no-scrollbar border-t border-b border-[#f0f3ff]">
              {cart.length === 0 ? (
                <div className="text-center py-4 text-[#727974] font-body-sm">
                  Keranjang kosong. Tap kartu produk atau scan SKU untuk menambahkan.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between bg-[#f0f3ff] rounded-lg p-2 gap-2"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#dee8ff]">
                      <img
                        src={getProductImageUrl(item.product, true)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            DEFAULT_CATEGORY_IMAGES[item.product.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-[#111c2d] font-semibold truncate">
                        {item.product.name}
                      </p>
                      <p className="font-body-sm text-body-sm text-[#727974]">
                        {item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded bg-[#e7eeff] flex items-center justify-center font-bold text-[#111c2d] active:bg-[#82f5c1] hover:bg-[#dee8ff] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono-num text-mono-num font-bold px-1 min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded bg-[#e7eeff] flex items-center justify-center font-bold text-[#111c2d] active:bg-[#82f5c1] hover:bg-[#dee8ff] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-title-md text-title-md text-[#00130a] font-bold shrink-0 min-w-20 text-right">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#ba1a1a] p-1 hover:bg-[#ffdad6] rounded cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quick Fast POS Utility Actions (Hold, Diskon, Kasbon) */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <button
              onClick={() => setShowHoldModal(true)}
              className="h-9 px-2 bg-[#e7eeff] text-[#111c2d] hover:bg-[#dee8ff] rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer relative"
            >
              <span className="material-symbols-outlined text-[16px] text-[#727974]">pause_circle</span>
              <span>Tahan (Hold)</span>
              {heldCarts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center">
                  {heldCarts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowDiscountModal(true)}
              className={`h-9 px-2 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                discountAmount > 0
                  ? 'bg-[#82f5c1] text-[#00714e]'
                  : 'bg-[#e7eeff] text-[#111c2d] hover:bg-[#dee8ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">percent</span>
              <span>{discountAmount > 0 ? `Disc -Rp${discountAmount.toLocaleString('id-ID')}` : 'Diskon'}</span>
            </button>
            <button
              onClick={() => setShowKasbonModal(true)}
              className="h-9 px-2 bg-[#ffdad6] text-[#93000a] hover:opacity-90 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Kasbon / Utang</span>
            </button>
          </div>

          {/* Primary Checkout Summary & Instant Pay CTA Button */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md text-[#424844]">
                  Total Tagihan ({totalItemsCount} Barang)
                </span>
                {discountAmount > 0 && (
                  <span className="text-xs text-[#006c4a] block font-semibold">
                    (Potongan Diskon: Rp {discountAmount.toLocaleString('id-ID')})
                  </span>
                )}
              </div>
              <span className="font-currency-display-mobile text-currency-display-mobile text-[#006c4a] font-extrabold tracking-tight">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              id="btn-pay"
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
              className="w-full h-13 py-3 px-4 bg-[#00130a] active:bg-[#006c4a] text-white rounded-xl font-headline-md text-headline-md font-bold flex items-center justify-between shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#85f8c4]">payments</span>
                Bayar Sekarang
              </span>
              <div className="flex items-center gap-1">
                <span className="bg-[#85f8c4] text-[#002114] font-label-sm text-label-sm px-2 py-0.5 rounded font-bold">
                  F12
                </span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL 1: Payment Settlement (Penyelesaian Bayar) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 border border-[#e7eeff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a] text-[24px]">price_check</span>
                <h3 className="font-headline-md text-headline-md text-[#111c2d] font-bold">Penyelesaian Bayar</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-[#e7eeff] text-[#424844] flex items-center justify-center hover:bg-[#dee8ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-[#f0f3ff] p-1 rounded-xl">
              <button
                onClick={() => setPaymentMethod('tunai')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'tunai' ? 'bg-[#00130a] text-white shadow-sm' : 'text-[#424844]'
                }`}
              >
                💵 Tunai
              </button>
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'qris' ? 'bg-[#00130a] text-white shadow-sm' : 'text-[#424844]'
                }`}
              >
                📱 QRIS
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === 'transfer' ? 'bg-[#00130a] text-white shadow-sm' : 'text-[#424844]'
                }`}
              >
                🏦 Transfer
              </button>
            </div>

            <div className="bg-[#f0f3ff] p-3 rounded-xl flex flex-col gap-1">
              <span className="font-body-sm text-body-sm text-[#424844]">Total Belanja:</span>
              <span className="font-currency-display-mobile text-currency-display-mobile text-[#00130a] font-extrabold">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {paymentMethod === 'tunai' && (
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-label-md text-[#111c2d] font-semibold">
                  Uang Diterima (Pecahan Cepat):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedTender(tenderPas);
                      setCustomTenderInput('');
                    }}
                    className={`h-11 rounded-lg font-mono-num text-mono-num font-bold active:bg-[#82f5c1] transition-all cursor-pointer ${
                      selectedTender === tenderPas
                        ? 'bg-[#006c4a] text-white shadow-sm'
                        : 'bg-[#dee8ff] text-[#111c2d]'
                    }`}
                  >
                    Rp {tenderPas.toLocaleString('id-ID')} (Pas)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTender(tender130);
                      setCustomTenderInput('');
                    }}
                    className={`h-11 rounded-lg font-mono-num text-mono-num font-bold active:bg-[#82f5c1] transition-all cursor-pointer ${
                      selectedTender === tender130
                        ? 'bg-[#006c4a] text-white shadow-sm'
                        : 'bg-[#dee8ff] text-[#111c2d]'
                    }`}
                  >
                    Rp {tender130.toLocaleString('id-ID')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTender(tender150);
                      setCustomTenderInput('');
                    }}
                    className={`h-11 rounded-lg font-mono-num text-mono-num font-bold active:bg-[#82f5c1] transition-all cursor-pointer ${
                      selectedTender === tender150
                        ? 'bg-[#006c4a] text-white shadow-sm'
                        : 'bg-[#dee8ff] text-[#111c2d]'
                    }`}
                  >
                    Rp {tender150.toLocaleString('id-ID')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTender(tender200);
                      setCustomTenderInput('');
                    }}
                    className={`h-11 rounded-lg font-mono-num text-mono-num font-bold active:bg-[#82f5c1] transition-all cursor-pointer ${
                      selectedTender === tender200
                        ? 'bg-[#006c4a] text-white shadow-sm'
                        : 'bg-[#dee8ff] text-[#111c2d]'
                    }`}
                  >
                    Rp {tender200.toLocaleString('id-ID')}
                  </button>
                </div>

                <div className="mt-1">
                  <input
                    type="text"
                    placeholder="Ketik nominal lain..."
                    value={customTenderInput}
                    onChange={(e) => {
                      setCustomTenderInput(e.target.value);
                      setSelectedTender(null);
                    }}
                    className="w-full h-10 px-3 bg-[#f0f3ff] rounded-lg font-mono-num text-mono-num text-sm border border-[#e7eeff] focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Kembalian box */}
                <div className="bg-[#85f8c4]/30 border border-[#82f5c1] p-2.5 rounded-lg flex items-center justify-between">
                  <span className="font-label-md text-label-md text-[#005137] font-semibold">Kembalian:</span>
                  <span className="font-title-md text-title-md text-[#006c4a] font-bold">
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="flex flex-col items-center justify-center p-4 bg-[#f0f3ff] rounded-xl text-center gap-2">
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-[#dee8ff] flex items-center justify-center shadow-inner">
                  {/* Stylized QR placeholder */}
                  <img
                    alt="QRIS"
                    className="w-full h-full object-contain"
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SembakoPOS-Pay"
                  />
                </div>
                <div className="flex items-center gap-1 text-[#006c4a] font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Menunggu scan pelanggan...</span>
                </div>
                <span className="text-[11px] text-[#424844]">Settlement Real-time H+0 Bebas Biaya MDR</span>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="p-3 bg-[#f0f3ff] rounded-xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <div>
                    <span className="font-bold text-[#111c2d]">BCA Toko Berkah</span>
                    <p className="font-mono text-[#006c4a] font-semibold">012-3849-11</p>
                  </div>
                  <span className="material-symbols-outlined text-[#006c4a]">content_copy</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <div>
                    <span className="font-bold text-[#111c2d]">Mandiri Bisnis</span>
                    <p className="font-mono text-[#006c4a] font-semibold">142-00-98213</p>
                  </div>
                  <span className="material-symbols-outlined text-[#006c4a]">content_copy</span>
                </div>
              </div>
            )}

            <button
              id="confirm-finish-btn"
              onClick={handleConfirmPayment}
              className="w-full h-12 bg-[#006c4a] hover:bg-[#005137] text-white rounded-xl font-title-md text-title-md font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">receipt</span>
              Cetak Struk & Selesai (Enter)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Camera Scanner Simulator */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">photo_camera</span>
                <h3 className="font-title-md font-bold text-[#111c2d]">Scan Kamera Barcode</h3>
              </div>
              <button
                onClick={() => setShowCameraScanner(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Simulated camera viewport */}
            <div className="relative w-full aspect-square bg-[#00130a] rounded-xl overflow-hidden flex flex-col items-center justify-center text-white">
              <div className="absolute inset-8 border-2 border-dashed border-[#85f8c4] rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-xs bg-[#00130a]/80 text-[#85f8c4] px-2 py-1 rounded">
                  Arahkan Barcode Kemasan
                </span>
              </div>
              <div className="absolute w-full h-0.5 bg-[#85f8c4] shadow-[0_0_8px_#85f8c4] animate-bounce"></div>
              <span className="text-[11px] text-white/70 absolute bottom-3">Kamera Aktif • Autofokus Otomatis</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-[#424844]">Simulasi Deteksi Cepat:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const item = products.find((p) => p.id === '1');
                    if (item) handleAddToCart(item);
                    setShowCameraScanner(false);
                  }}
                  className="p-2 bg-[#f0f3ff] rounded-lg text-xs font-semibold hover:bg-[#82f5c1] text-left"
                >
                  ✓ Beras Pandan 5kg
                </button>
                <button
                  onClick={() => {
                    const item = products.find((p) => p.id === '2');
                    if (item) handleAddToCart(item);
                    setShowCameraScanner(false);
                  }}
                  className="p-2 bg-[#f0f3ff] rounded-lg text-xs font-semibold hover:bg-[#82f5c1] text-left"
                >
                  ✓ Minyak Bimoli 2L
                </button>
                <button
                  onClick={() => {
                    const item = products.find((p) => p.id === '4');
                    if (item) handleAddToCart(item);
                    setShowCameraScanner(false);
                  }}
                  className="p-2 bg-[#f0f3ff] rounded-lg text-xs font-semibold hover:bg-[#82f5c1] text-left"
                >
                  ✓ Gulaku Kuning 1kg
                </button>
                <button
                  onClick={() => {
                    const item = products.find((p) => p.id === '5');
                    if (item) handleAddToCart(item);
                    setShowCameraScanner(false);
                  }}
                  className="p-2 bg-[#f0f3ff] rounded-lg text-xs font-semibold hover:bg-[#82f5c1] text-left"
                >
                  ✓ Indomie Goreng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Discount Sheet */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-[#111c2d]">Beri Diskon Nota</h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[#424844]">Pilih Diskon Cepat (%):</span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 5, 10, 15].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setDiscountPercent(p);
                      setDiscountNominal(0);
                    }}
                    className={`py-2 rounded-lg font-bold text-xs ${
                      discountPercent === p && discountNominal === 0
                        ? 'bg-[#006c4a] text-white'
                        : 'bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    {p === 0 ? 'Batal' : `${p}%`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#424844]">Atau Potongan Nominal (Rp):</span>
              <input
                type="number"
                placeholder="cth. 5000"
                value={discountNominal || ''}
                onChange={(e) => {
                  setDiscountNominal(parseInt(e.target.value, 10) || 0);
                  setDiscountPercent(0);
                }}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg font-mono text-sm border border-[#e7eeff] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowDiscountModal(false)}
              className="w-full h-11 bg-[#00130a] text-white rounded-xl font-semibold"
            >
              Terapkan Diskon
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Kasbon / Utang Pelanggan Sheet */}
      {showKasbonModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">menu_book</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Catat Kasbon Pelanggan</h3>
              </div>
              <button
                onClick={() => setShowKasbonModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#ffdad6]/40 flex justify-between items-center">
              <span className="text-xs text-[#93000a] font-semibold">Total Nilai Kasbon:</span>
              <span className="font-bold text-[#ba1a1a] font-mono">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Pilih / Nama Pelanggan</label>
                <select
                  value={kasbonCustomer}
                  onChange={(e) => setKasbonCustomer(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#f0f3ff] text-sm text-[#111c2d] border border-[#e7eeff]"
                >
                  <option>Bu RT Endang</option>
                  <option>Pakde Joko (Warung Kopi)</option>
                  <option>Mbak Dewi Salon</option>
                  <option>Pelanggan Baru...</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={kasbonPhone}
                  onChange={(e) => setKasbonPhone(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#f0f3ff] text-sm border border-[#e7eeff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Janji Bayar</label>
                <div className="grid grid-cols-3 gap-1">
                  {['3 Hari', 'Akhir Bulan', 'Tiap Jumat'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setKasbonDueDate(t)}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${
                        kasbonDueDate === t ? 'bg-[#ba1a1a] text-white' : 'bg-[#f0f3ff] text-[#111c2d]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveKasbon}
              className="w-full h-11 bg-[#ba1a1a] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">bookmark_added</span>
              Simpan ke Buku Kasbon
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Hold Transactions Manager */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-[#111c2d]">Transaksi Ditahan</h3>
              <button
                onClick={() => setShowHoldModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleHoldCart}
                className="w-full py-2.5 px-3 rounded-xl bg-[#006c4a] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">pause</span>
                Tahan Keranjang Saat Ini ({cart.length} item)
              </button>
            )}

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
              <span className="text-xs text-[#727974] font-semibold">Daftar Antrean Ditahan:</span>
              {heldCarts.length === 0 ? (
                <p className="text-xs text-[#727974] py-3 text-center">Tidak ada transaksi yang sedang ditahan.</p>
              ) : (
                heldCarts.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-[#f0f3ff] flex items-center justify-between border border-[#e7eeff]"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#111c2d] block">{h.note}</span>
                      <span className="text-[11px] text-[#727974]">{h.time}</span>
                    </div>
                    <button
                      onClick={() => handleRecallHold(h.id)}
                      className="px-2.5 py-1 bg-[#82f5c1] text-[#00714e] font-bold text-xs rounded-lg hover:bg-[#85f8c4]"
                    >
                      Buka
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Thermal Printable Receipt View */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto border border-[#e7eeff]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <div className="flex items-center gap-1.5 text-[#006c4a] font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Transaksi Sukses!</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Thermal Struk Mockup */}
            <div className="bg-[#fcfdfd] border border-dashed border-[#c2c8c2] p-4 rounded-xl font-mono text-xs text-[#111c2d] space-y-2 select-text shadow-sm">
              <div className="text-center pb-2 border-b border-dashed border-[#c2c8c2]">
                <h4 className="font-bold text-sm">TOKO SEMBAKO BERKAH</h4>
                <p className="text-[10px] text-[#727974]">Jl. Pasar Baru No. 42, RT 03/05</p>
                <p className="text-[10px] text-[#727974]">Telp/WA: 0812-9876-5432</p>
              </div>

              <div className="flex justify-between text-[11px] text-[#424844]">
                <span>Nota: {lastReceipt.notaNo}</span>
                <span>{lastReceipt.cashier}</span>
              </div>
              <div className="text-[10px] text-[#727974]">{lastReceipt.date}</div>

              <div className="py-2 border-t border-b border-dashed border-[#c2c8c2] space-y-1">
                {lastReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-[10px] text-[#727974]">
                        {item.quantity} x {item.product.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="font-bold">
                      {(item.quantity * item.product.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {lastReceipt.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-[#006c4a]">
                    <span>Diskon:</span>
                    <span>-Rp {lastReceipt.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#dee8ff]">
                  <span>TOTAL:</span>
                  <span>Rp {lastReceipt.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar ({lastReceipt.method}):</span>
                  <span>Rp {lastReceipt.tendered.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-[#006c4a]">
                  <span>Kembali:</span>
                  <span>Rp {lastReceipt.change.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-[#c2c8c2] text-[10px] text-[#727974]">
                <p>Terima Kasih Atas Kunjungan Anda</p>
                <p>Barang sembako yang sudah dibeli dapat ditukar jika kemasan cacat.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                }}
                className="flex-1 py-3 bg-[#00130a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Cetak Printer Thermal (Selesai)
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-3 bg-[#f0f3ff] text-[#111c2d] rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Drawer Quick Inspector */}
      {showDrawerModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c4a]">point_of_sale</span>
                <h3 className="font-headline-md font-bold text-[#111c2d]">Kelola Laci Kasir</h3>
              </div>
              <button
                onClick={() => setShowDrawerModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f3ff] flex justify-between items-center">
              <span className="text-xs text-[#424844]">Saldo Kas Fisik Saat Ini:</span>
              <span className="font-currency-display-mobile text-[#00130a] font-extrabold">
                Rp {drawerBalance.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUpdateDrawerBalance(drawerBalance + 100000);
                }}
                className="p-3 bg-[#82f5c1]/30 hover:bg-[#82f5c1] text-[#00714e] font-semibold text-xs rounded-xl flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">add_card</span>
                <span>+ Modal Rp 100rb</span>
              </button>
              <button
                onClick={() => {
                  if (drawerBalance >= 50000) onUpdateDrawerBalance(drawerBalance - 50000);
                }}
                className="p-3 bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#93000a] font-semibold text-xs rounded-xl flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">remove_circle_outline</span>
                <span>- Tarik Rp 50rb</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowDrawerModal(false);
              }}
              className="w-full py-3 bg-[#00130a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Buka Kunci Laci (RJ11)
            </button>
          </div>
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
            setPhotoTargetProduct(null);
          }}
          userRole={userRole}
        />
      )}

      {/* POS CALCULATOR MODAL */}
      <CalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onApplyResult={(val) => {
          setCustomTenderInput(val.toString());
          setSelectedTender(val);
        }}
      />
    </div>
  );
};

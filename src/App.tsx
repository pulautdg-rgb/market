import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileDrawer } from './components/MobileDrawer';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { KasirScreen } from './components/screens/KasirScreen';
import { ScanCekHargaScreen } from './components/screens/ScanCekHargaScreen';
import { ProdukScreen } from './components/screens/ProdukScreen';
import { StokScreen } from './components/screens/StokScreen';
import { PembelianScreen } from './components/screens/PembelianScreen';
import { SupplierScreen } from './components/screens/SupplierScreen';
import { UtangScreen } from './components/screens/UtangScreen';
import { LaporanScreen } from './components/screens/LaporanScreen';
import { MenuScreen } from './components/screens/MenuScreen';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIER_DEBTS,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMER_KASBON,
  INITIAL_SHIFT,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS
} from './data/mockData';
import {
  Product,
  SupplierDebt,
  PurchaseInvoice,
  Expense,
  CustomerKasbon,
  ShiftInfo,
  CartItem,
  UserRole,
  NavMenuId,
  Supplier,
  SaleTransaction
} from './types';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { CalculatorModal } from './components/modals/CalculatorModal';
import {
  isCurrentAdminSessionActive,
  startAdminSession,
  endAdminSession
} from './utils/auth';

export default function App() {
  // Navigation State - defaults to 'dashboard' as per UX guidelines
  const [activeTab, setActiveTab] = useState<NavMenuId>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Online / Offline Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('sembako_user_role');
    return (saved as UserRole) || 'owner';
  });
  const [currentCashier, setCurrentCashier] = useState<string>('Budi Santoso');

  // Admin Authentication & Calculator States
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('owner');
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState<boolean>(false);
  const [isAdminSessionActive, setIsAdminSessionActive] = useState<boolean>(() =>
    isCurrentAdminSessionActive()
  );

  // Persistent Product Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sembako_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Active Transaction Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sembako_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[1], quantity: 1 },
      { product: INITIAL_PRODUCTS[3], quantity: 1 }
    ];
  });

  // Supplier & Debt Data
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sembako_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [debts, setDebts] = useState<SupplierDebt[]>(() => {
    const saved = localStorage.getItem('sembako_debts');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_DEBTS;
  });

  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('sembako_invoices');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_INVOICES;
  });

  // Financial & Operational Ledger
  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('sembako_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [offlineSyncQueue, setOfflineSyncQueue] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('sembako_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('sembako_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [customerKasbons, setCustomerKasbons] = useState<CustomerKasbon[]>(() => {
    const saved = localStorage.getItem('sembako_kasbons');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_KASBON;
  });

  const [drawerBalance, setDrawerBalance] = useState<number>(() => {
    const saved = localStorage.getItem('sembako_drawer');
    return saved ? JSON.parse(saved) : 500000;
  });

  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>(() => {
    const saved = localStorage.getItem('sembako_shift');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  // Global Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Browser Online/Offline Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet terhubung. Sistem kembali Online.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi internet terputus. Mode Offline lokal aktif.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sembako_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sembako_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sembako_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('sembako_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('sembako_invoices', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  useEffect(() => {
    localStorage.setItem('sembako_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sembako_offline_queue', JSON.stringify(offlineSyncQueue));
  }, [offlineSyncQueue]);

  useEffect(() => {
    localStorage.setItem('sembako_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('sembako_kasbons', JSON.stringify(customerKasbons));
  }, [customerKasbons]);

  useEffect(() => {
    localStorage.setItem('sembako_drawer', JSON.stringify(drawerBalance));
  }, [drawerBalance]);

  useEffect(() => {
    localStorage.setItem('sembako_shift', JSON.stringify(shiftInfo));
  }, [shiftInfo]);

  useEffect(() => {
    localStorage.setItem('sembako_user_role', userRole);
  }, [userRole]);

  // Secure Role Switch Request (Guarded with SHA-256 PIN challenge for owner & admin)
  const handleRequestRoleChange = (newRole: UserRole) => {
    if (newRole === 'kasir') {
      endAdminSession();
      setIsAdminSessionActive(false);
      setUserRole('kasir');
      showToast('Beralih ke mode Kasir (Akses Dibatasi)');
      return;
    }

    if (isCurrentAdminSessionActive()) {
      setUserRole(newRole);
      showToast(`Beralih ke mode ${newRole === 'owner' ? 'Pemilik Toko' : 'Admin Gudang'}`);
      return;
    }

    setTargetAuthRole(newRole);
    setIsAdminLoginModalOpen(true);
  };

  const handleAdminAuthSuccess = () => {
    startAdminSession();
    setIsAdminSessionActive(true);
    setUserRole(targetAuthRole);
    setIsAdminLoginModalOpen(false);
    showToast(`Autentikasi Berhasil: Akses ${targetAuthRole === 'owner' ? 'Pemilik' : 'Admin'} Aktif`);
  };

  const handleLockAdminSession = () => {
    endAdminSession();
    setIsAdminSessionActive(false);
    setUserRole('kasir');
    showToast('Sesi Admin dikunci. Berpindah ke mode Kasir');
  };

  // Record Sale and generate invoice
  const handleRecordSale = (sale: {
    cart: CartItem[];
    paymentMethod: string;
    totalAmount: number;
    cashTendered: number;
    change: number;
    customerName?: string;
    isKasbon?: boolean;
  }) => {
    // 1. Reduce inventory stocks only on checkout completion
    setProducts((prev) =>
      prev.map((prod) => {
        const sold = sale.cart.find((c) => c.product.id === prod.id);
        if (sold) {
          const newStock = Math.max(0, prod.stockQty - sold.quantity);
          return {
            ...prod,
            stockQty: newStock,
            status: newStock <= prod.minStock ? 'critical' : 'safe'
          };
        }
        return prod;
      })
    );

    // 2. Format new transaction record
    const dateNow = new Date();
    const timeStr = dateNow.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const invoiceNumber = `NB-${dateNow.getFullYear()}${String(dateNow.getMonth() + 1).padStart(2, '0')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newTx: SaleTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNo: invoiceNumber,
      timestamp: timeStr,
      cashierName: currentCashier,
      itemsCount: sale.cart.reduce((sum, item) => sum + item.quantity, 0),
      itemsSummary: sale.cart.map((c) => `${c.product.name} (${c.quantity}x)`).join(', '),
      totalAmount: sale.totalAmount,
      paymentMethod: sale.isKasbon ? 'kasbon' : (sale.paymentMethod as any),
      customerName: sale.customerName || (sale.isKasbon ? 'Warga Kasbon' : 'Pelanggan Umum'),
      status: isOnline ? (sale.isKasbon ? 'kasbon' : 'selesai') : 'menunggu_sinkron',
      isOfflineSync: !isOnline
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If offline, add to offline queue
    if (!isOnline) {
      setOfflineSyncQueue((prev) => [newTx, ...prev]);
      showToast(`Transaksi tersimpan di HP secara offline (#${invoiceNumber})`);
    } else {
      showToast(`✓ Transaksi tersimpan berhasil (#${invoiceNumber})`);
    }

    // 3. Update shift metrics if cash
    if (sale.paymentMethod === 'tunai') {
      setShiftInfo((prev) => {
        const newCashSales = prev.cashSales + sale.totalAmount;
        const newExpected = prev.initialCash + newCashSales;
        return {
          ...prev,
          cashSales: newCashSales,
          expectedCash: newExpected,
          physicalCash: newExpected
        };
      });
    }
  };

  // Sync Offline Queue Handler
  const handleSyncOfflineQueue = () => {
    if (offlineSyncQueue.length === 0) {
      showToast('Tidak ada transaksi dalam antrean sinkronisasi offline.');
      return;
    }

    const count = offlineSyncQueue.length;
    setTransactions((prev) =>
      prev.map((t) =>
        t.status === 'menunggu_sinkron'
          ? { ...t, status: t.paymentMethod === 'kasbon' ? 'kasbon' : 'selesai', isOfflineSync: false }
          : t
      )
    );
    setOfflineSyncQueue([]);
    showToast(`✓ Sukses menyinkronkan ${count} transaksi offline ke database cloud!`);
  };

  // Add Scanned Product into Cashier Cart and open Kasir Screen
  const handleOpenInCashierFromScan = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    setActiveTab('kasir');
    showToast(`✓ ${product.name} dimasukkan ke keranjang kasir`);
  };

  // Product Master Actions
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`✓ Produk "${newProduct.name}" berhasil ditambahkan ke katalog`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id ? { ...item, product: updatedProduct } : item
      )
    );
    showToast(`✓ Foto & data produk "${updatedProduct.name}" berhasil diperbarui`);
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Produk ${prod?.name || ''} telah dihapus dari katalog`);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQty: newStock,
              status: newStock <= p.minStock ? 'critical' : 'safe'
            }
          : p
      )
    );
  };

  // Supplier Actions
  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
    showToast(`✓ Supplier "${newSupplier.name}" berhasil ditambahkan`);
  };

  // Debt & Procurement Actions
  const handlePayDebt = (debtId: string, amount: number, method: string, note: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remainingDebt - amount);
          const newPaid = d.paidAmount + amount;
          const newLog = {
            id: `PAY-${Date.now().toString().slice(-4)}`,
            date: 'Hari ini',
            amount,
            cashier: currentCashier,
            method,
            note
          };
          return {
            ...d,
            remainingDebt: newRemaining,
            paidAmount: newPaid,
            status: newRemaining === 0 ? 'paid' : 'partial',
            auditLogs: [newLog, ...d.auditLogs]
          };
        }
        return d;
      })
    );
    showToast('✓ Pembayaran utang supplier berhasil dicatat');
  };

  const handleReceiveInvoiceItems = (invoiceId: string, addedQty: number) => {
    setPurchaseInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newReceived = Math.min(inv.orderedQty, inv.receivedQty + addedQty);
          return {
            ...inv,
            receivedQty: newReceived,
            status: newReceived >= inv.orderedQty ? 'completed' : 'partial',
            lastUpdated: 'Baru saja'
          };
        }
        return inv;
      })
    );
  };

  const handleCreatePO = (po: { supplier: string; term: string; items: string }) => {
    const newInvoice: PurchaseInvoice = {
      id: `pi-${Date.now()}`,
      invoiceNo: `PO-${Date.now().toString().slice(-4)}`,
      supplier: po.supplier,
      items: po.items,
      orderedQty: 20,
      receivedQty: 0,
      unit: 'Sak',
      status: 'pending',
      warehouseGate: 'Pintu Barat',
      lastUpdated: 'Hari ini'
    };
    setPurchaseInvoices((prev) => [newInvoice, ...prev]);
    showToast(`✓ Purchase Order resmi berhasil diterbitkan untuk ${po.supplier}`);
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    showToast('✓ Pengeluaran operasional berhasil dicatat');
  };

  const handleCloseShift = (physicalCash: number) => {
    setShiftInfo((prev) => ({
      ...prev,
      physicalCash,
      variance: physicalCash - prev.expectedCash,
      status: 'closed'
    }));
    showToast('✓ Tutup shift kasir berhasil disimpan');
  };

  const handlePayCustomerKasbon = (kasbonId: string, amount: number) => {
    setCustomerKasbons((prev) =>
      prev
        .map((k) => {
          if (k.id === kasbonId) {
            const nextDebt = Math.max(0, k.totalDebt - amount);
            return nextDebt > 0 ? { ...k, totalDebt: nextDebt } : null;
          }
          return k;
        })
        .filter(Boolean) as CustomerKasbon[]
    );
    // Add to cash drawer
    setDrawerBalance((prev) => prev + amount);
    showToast(`✓ Cicilan kasbon Rp ${amount.toLocaleString('id-ID')} diterima`);
  };

  const handleResetData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCart([
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[1], quantity: 1 },
      { product: INITIAL_PRODUCTS[3], quantity: 1 }
    ]);
    setSuppliers(INITIAL_SUPPLIERS);
    setDebts(INITIAL_SUPPLIER_DEBTS);
    setPurchaseInvoices(INITIAL_PURCHASE_INVOICES);
    setTransactions(INITIAL_TRANSACTIONS);
    setOfflineSyncQueue([]);
    setExpenses(INITIAL_EXPENSES);
    setCustomerKasbons(INITIAL_CUSTOMER_KASBON);
    setDrawerBalance(500000);
    setShiftInfo(INITIAL_SHIFT);
    setUserRole('owner');
    showToast('✓ Seluruh data demo berhasil direset ke nilai awal');
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#111c2d] flex antialiased">
      {/* 1. Desktop Fixed Sidebar (lg:flex, 16rem / 256px wide) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        onRoleChange={handleRequestRoleChange}
        cashierName={currentCashier}
        isOnline={isOnline}
        pendingSyncCount={offlineSyncQueue.length}
        cartItemCount={cartTotalItems}
      />

      {/* 2. Mobile Slide-Out Drawer (lg:hidden, triggers via hamburger or bottom nav) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        onRoleChange={handleRequestRoleChange}
        cashierName={currentCashier}
        isOnline={isOnline}
      />

      {/* 3. Main Workspace Container (with lg:pl-64 offset for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#00130a] text-white font-label-md text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-[#85f8c4]/40">
            <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sticky Top Header */}
        <Header
          activeTab={activeTab}
          cashierName={currentCashier}
          userRole={userRole}
          isOnline={isOnline}
          onOpenProfile={() => setActiveTab('pengaturan')}
          onOpenScanner={() => setActiveTab('scan')}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          onOpenAdminLogin={() => {
            setTargetAuthRole('owner');
            setIsAdminLoginModalOpen(true);
          }}
        />

        {/* Main Routed Module Screen */}
        <main className="flex-1 w-full max-w-5xl mx-auto pt-16">
          {/* Module 1: Dashboard Toko */}
          {activeTab === 'dashboard' && (
            <DashboardScreen
              products={products}
              debts={debts}
              transactions={transactions}
              userRole={userRole}
              cashierName={currentCashier}
              onNavigate={setActiveTab}
              onOpenAddProductModal={() => setActiveTab('produk')}
            />
          )}

          {/* Module 2: Kasir POS */}
          {activeTab === 'kasir' && (
            <KasirScreen
              products={products}
              cart={cart}
              setCart={setCart}
              drawerBalance={drawerBalance}
              onUpdateDrawerBalance={setDrawerBalance}
              onOpenDrawer={() => {}}
              onRecordSale={handleRecordSale}
              customerKasbons={customerKasbons}
              onAddKasbon={(newKb) => setCustomerKasbons((prev) => [newKb, ...prev])}
              onOpenScannerTab={() => setActiveTab('scan')}
              userRole={userRole}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {/* Module 3: Scan Barcode & Cek Harga */}
          {activeTab === 'scan' && (
            <ScanCekHargaScreen
              products={products}
              userRole={userRole}
              onSwitchRole={setUserRole}
              onOpenInCashier={handleOpenInCashierFromScan}
              onAddNewProductWithBarcode={(barcode) => {
                setActiveTab('produk');
                showToast(`Menuju Katalog Produk untuk menambahkan barcode: ${barcode}`);
              }}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {/* Module 4: Master Produk */}
          {activeTab === 'produk' && (
            <ProdukScreen
              products={products}
              userRole={userRole}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* Module 5: Stok Barang */}
          {activeTab === 'stok' && (
            <StokScreen
              products={products}
              onUpdateProductStock={handleUpdateProductStock}
              onAddProduct={handleAddProduct}
            />
          )}

          {/* Module 6: Pembelian & Penerimaan Barang */}
          {activeTab === 'pembelian' && (
            <PembelianScreen
              purchaseInvoices={purchaseInvoices}
              suppliers={suppliers}
              userRole={userRole}
              onReceiveInvoiceItems={handleReceiveInvoiceItems}
              onCreatePO={handleCreatePO}
            />
          )}

          {/* Module 7: Data Supplier */}
          {activeTab === 'supplier' && (
            <SupplierScreen
              suppliers={suppliers}
              userRole={userRole}
              onAddSupplier={handleAddSupplier}
              onNavigateToDebts={(_supName) => setActiveTab('utang')}
            />
          )}

          {/* Module 8: Utang Supplier (Tempo) */}
          {activeTab === 'utang' && (
            <UtangScreen
              debts={debts}
              purchaseInvoices={purchaseInvoices}
              onPayDebt={handlePayDebt}
              onReceiveInvoiceItems={handleReceiveInvoiceItems}
              onCreatePO={handleCreatePO}
            />
          )}

          {/* Module 9: Laporan Keuangan */}
          {activeTab === 'laporan' && (
            <LaporanScreen
              expenses={expenses}
              onAddExpense={handleAddExpense}
              shiftInfo={shiftInfo}
              onCloseShift={handleCloseShift}
            />
          )}

          {/* Module 10: Pengaturan Toko & Kasbon */}
          {activeTab === 'pengaturan' && (
            <MenuScreen
              currentCashier={currentCashier}
              onSwitchCashier={setCurrentCashier}
              userRole={userRole}
              onRoleChange={handleRequestRoleChange}
              isOnline={isOnline}
              pendingSyncCount={offlineSyncQueue.length}
              onSyncOfflineQueue={handleSyncOfflineQueue}
              customerKasbons={customerKasbons}
              onPayCustomerKasbon={handlePayCustomerKasbon}
              onResetData={handleResetData}
              onNavigateToScan={() => setActiveTab('scan')}
              onOpenAdminSecurity={() => {
                setTargetAuthRole('owner');
                setIsAdminLoginModalOpen(true);
              }}
              onLockAdminSession={handleLockAdminSession}
              isAdminSessionActive={isAdminSessionActive}
            />
          )}
        </main>

        {/* 4. Mobile Bottom Navigation (lg:hidden, 5 quick-access tabs + drawer trigger) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          cartItemCount={cartTotalItems}
        />
      </div>

      {/* Global Modals: Admin Authentication & Quick POS Calculator */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        targetRole={targetAuthRole}
      />

      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />
    </div>
  );
}

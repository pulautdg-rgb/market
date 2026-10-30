export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  brand?: string;
  barcode_type?: 'EAN13' | 'EAN8' | 'UPC_A' | 'UPC_E' | 'CODE128';
  barcode_source?: 'manufacturer' | 'internal';
  is_active?: boolean;
  cost_price?: number;
  selling_price?: number;
  created_at?: string;
  updated_at?: string;
  category: 'beras' | 'minyak' | 'gula' | 'telur' | 'mie' | 'gas' | 'lainnya';
  categoryLabel: string;
  stockQty: number;
  minStock: number;
  unit: string;
  hpp: number; // Harga Pokok Penjualan
  price: number; // Harga Jual Eceran
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  imageUrl?: string;
  image_url?: string;
  imagePath?: string;
  image_path?: string;
  isCustomPhoto?: boolean;
  photoUpdatedAt?: number;
  location?: string;
  isMultiUnit?: boolean;
  parentUnit?: string;
  childUnit?: string;
  conversionRatio?: number;
  totalSubUnits?: number;
  weightApprox?: string;
  promoPrice?: number;
  lastUpdated?: string;
  status: 'safe' | 'critical' | 'expiring';
}

export type UserRole = 'owner' | 'admin' | 'kasir';

export type NavMenuId =
  | 'dashboard'
  | 'kasir'
  | 'scan'
  | 'kalkulator'
  | 'produk'
  | 'cetak_barcode'
  | 'stok'
  | 'pembelian'
  | 'supplier'
  | 'utang'
  | 'laporan'
  | 'pengaturan';

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  discount?: number; // discount per item or percentage
  selectedUnit?: string;
}

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  contactPerson: string;
  phone: string;
  address: string;
  commodities: string[];
  term: string;
  totalOrders: number;
  activeDebt: number;
}

export interface SupplierDebt {
  id: string;
  supplierName: string;
  initials: string;
  invoiceNumber: string;
  itemsSummary: string;
  dueDateDays: number;
  totalBill: number;
  paidAmount: number;
  remainingDebt: number;
  status: 'unpaid' | 'partial' | 'paid';
  term: string;
  warehouseLocation: string;
  lastPaymentDate?: string;
  auditLogs: {
    id: string;
    date: string;
    amount: number;
    cashier: string;
    method: string;
    note: string;
  }[];
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplier: string;
  items: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  status: 'pending' | 'partial' | 'completed';
  warehouseGate: string;
  lastUpdated: string;
  totalEstimatedCost?: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  time: string;
  cashier: string;
}

export interface CustomerKasbon {
  id: string;
  customerName: string;
  phone: string;
  totalDebt: number;
  lastTransactionDate: string;
  note: string;
  dueDate: string;
}

export interface ShiftInfo {
  cashierName: string;
  shiftName: string;
  timeRange: string;
  initialCash: number;
  cashSales: number;
  expectedCash: number;
  physicalCash: number;
  variance: number;
  status: 'active' | 'closed';
}

export interface SaleTransaction {
  id: string;
  invoiceNo: string;
  timestamp: string;
  cashierName: string;
  itemsCount: number;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: 'tunai' | 'qris' | 'transfer' | 'kasbon';
  customerName?: string;
  isOfflineSync?: boolean;
  status: 'selesai' | 'kasbon' | 'menunggu_sinkron';
}

export type OfflineSyncStatus = 'online' | 'offline' | 'syncing' | 'pending';

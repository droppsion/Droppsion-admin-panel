export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'store_manager' | 'logistics_operator';
  avatar?: string;
  status?: 'active' | 'deactivated';
  lastLogin?: string;
  createdAt?: string;
}

export interface AdminProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  badge?: 'NEW' | 'SALE' | 'BESTSELLER' | '';
  rating: number;
  reviewCount: number;
  image: string;
  description?: string;
  dropship: {
    supplierName: string;
    supplierSku: string;
    supplierCost: number;
    marginPercentage: number;
    leadTimeHours: number;
    syncStatus: 'active' | 'syncing' | 'delayed';
    stockSyncedAt: string;
  };
}

export interface AdminOrder {
  id: string;
  trackingNumber: string;
  createdAt: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  total: number;
  shippingCity: string;
  shippingCountry: string;
  carrier: string;
  items?: Array<{
    title: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
}

export interface AdminSupplier {
  id: string;
  name: string;
  region: string;
  apiProtocol: string;
  contactPerson?: string;
  performanceRating: number;
  averageFulfillmentHours: number;
  onTimeRate: number;
  defectRate: number;
  status: 'connected' | 'syncing' | 'offline' | 'deactivated';
  activeSkusCount?: number;
  autoFulfillEnabled?: boolean;
}

export interface AdminCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  active: boolean;
  usedCount: number;
  expiresAt?: string;
}

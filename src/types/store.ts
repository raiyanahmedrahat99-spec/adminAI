export type ProductCategory = 
  | 'Groceries & Cooking'
  | 'Biscuits & Bakery'
  | 'Snacks & Beverages'
  | 'Toiletries & Cleaning'
  | 'Personal Care & Hygiene'
  | 'Ice-cream'
  | 'Drinks'
  | 'Oil'
  | 'Snacks'
  | 'Toiletries'
  | 'Cleaning'
  | 'Masala'
  | 'Health & Nutrition';

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  title: string;
  titleBn?: string;
  category: ProductCategory;
  costPriceBDT: number;
  retailPriceBDT: number;
  stock: number;
  reorderLevel: number;
  monthlyVelocityUnits: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'slow_moving';
  descriptionEnglish: string;
  descriptionBengali: string;
  updatedAt: string;
  isAiGenerated?: boolean;
}

export type OrderStatus = 'pending_verification' | 'dispatched' | 'out_for_delivery' | 'delivered_settled' | 'cod_in_transit' | 'returned';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  district: string;
  division: string;
  itemsCount: number;
  itemsSummary: string;
  codAmountBDT: number;
  courierPartner: 'Pathao Courier' | 'Steadfast' | 'RedX' | 'Paperfly';
  courierTrackingCode: string;
  status: OrderStatus;
  createdAt: string;
  settledAt?: string;
  codAgingDays: number;
  trackingLink?: string;
  deliveryManName?: string;
  deliveryManPhone?: string;
}

export interface DiaryLedgerEntry {
  id: string;
  date: string;
  type: 'receivable' | 'payable' | 'expense' | 'cash_sale';
  partyName: string; // Customer or Dealer
  description: string;
  amountBDT: number;
  status: 'pending' | 'cleared';
  notes?: string;
  representativeName?: string;
  contactNumber?: string;
}

export interface DealerAccount {
  id: string;
  dealerName: string;
  companyName: string;
  category: string;
  outstandingPayableBDT: number;
  lastOrderDate: string;
  contactPerson: string;
  phone: string;
  representativeName?: string;
  representativePhone?: string;
  officeAddress?: string;
}

export interface StoreFinancials {
  totalCatalogCount: number;
  totalInventoryValuationCostBDT: number;
  totalInventoryRetailValuationBDT: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  todayGMVBDT: number;
  monthlyGMVBDT: number;
  codPendingSettlementBDT: number;
  codSettledThisMonthBDT: number;
  averageProfitMarginPct: number;
  returnToOriginRatePct: number;
}

export interface AiGeneratedProductMetadata {
  suggested_price_bdt: number;
  suggested_cost_bdt?: number;
  margin_percentage?: number;
  description_english: string;
  description_bengali: string;
  key_features?: string[];
  recommended_reorder_level?: number;
  sku_suggestion?: string;
  rationale?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'executive_ai';
  text: string;
  timestamp: string;
}

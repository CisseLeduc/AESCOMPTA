
export type TransactionType = 'sale' | 'purchase' | 'expense' | 'credit_repayment' | 'supplier_payment' | 'social_contribution';
export type UserRole = 'owner' | 'manager' | 'cashier';
export type BusinessType = 'boutique' | 'restaurant' | 'hotel' | 'supermarket' | 'general' | 'warehouse';
export type SupportedLanguage = 'Français' | 'Bambara' | 'Moré' | 'Haoussa' | string;

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ReceiptConfig {
  headerNote?: string;
  footerNote?: string;
  showTax?: boolean;
  showQR?: boolean;
  logo?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  businessName: string;
  businessType: BusinessType;
  location: string;
  logo?: string;
  isSimplifiedMode: boolean;
  receiptConfig: ReceiptConfig;
  learningProfile: {
    preferredLanguage: string;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
  sku: string;
  image?: string;
  qrCode?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  customerName?: string;
  discount?: number;
  taxAmount?: number;
}

export interface Debt {
  id: string;
  customerName: string;
  phone: string; // Intégration téléphone
  amount: number;
  remainingAmount: number;
  description: string;
  date: string;
  dueDate: string;
  status: 'pending' | 'paid';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
  address: string;
  totalBusiness: number;
  balance: number;
  lastDelivery?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

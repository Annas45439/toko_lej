// ============== AUTH ==============
export interface UserSession {
  id: string;
  name: string;
  level: "admin" | "kasir";
}

// ============== PRODUCTS ==============
export interface Product {
  id: number;
  name: string;
  price: number;
  buy_price: number;
  stock: number;
  min_stock: number;
  category_id: number;
  unit_id: number;
  category?: { id: number; name: string };
  unit?: { id: number; name: string };
}

export interface ProductFormData {
  name: string;
  price: number;
  buy_price: number;
  stock: number;
  min_stock: number;
  category_id: number;
  unit_id: number;
}

// ============== CATEGORIES ==============
export interface Category {
  id: number;
  name: string;
  description?: string;
  _count?: { tb_products: number };
}

// ============== UNITS ==============
export interface Unit {
  id: number;
  name: string;
  _count?: { tb_products: number };
}

// ============== SUPPLIERS ==============
export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

// ============== CUSTOMERS ==============
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

// ============== STOCK IN ==============
export interface StockIn {
  id: number;
  product_id: number;
  supplier_id: number;
  user_id: number;
  qty: number;
  buy_price: number;
  date: string;
  product?: { id: number; name: string };
  supplier?: { id: number; name: string };
  user?: { id: number; username: string };
}

export interface StockInFormData {
  product_id: number;
  supplier_id: number;
  qty: number;
  buy_price: number;
  date: string;
}

// ============== TRANSACTIONS ==============
export interface Transaction {
  id: number;
  invoice_no: string;
  customer_id?: number;
  user_id: number;
  total: number;
  payment_method: "tunai" | "kartu";
  payment_amount: number;
  status: "selesai" | "batal";
  date: string;
  customer?: Customer;
  user?: { id: number; username: string };
  tb_transaction_details?: TransactionDetail[];
}

export interface TransactionDetail {
  id: number;
  transaction_id: number;
  product_id: number;
  qty: number;
  price: number;
  subtotal: number;
  product?: { id: number; name: string };
}

export interface TransactionFormData {
  customer_id?: number;
  payment_method: "tunai" | "kartu";
  payment_amount: number;
  items: { product_id: number; qty: number; price: number }[];
}

// ============== CART (POS) ==============
export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  stock: number;
  qty: number;
  subtotal: number;
}

// ============== USERS ==============
export interface AppUser {
  id: number;
  username: string;
  password: string;
  level: "admin" | "kasir";
}

export interface UserFormData {
  username: string;
  password?: string;
  level: "admin" | "kasir";
}

// ============== DASHBOARD ==============
export interface DashboardStats {
  totalProducts: number;
  todayTransactions: number;
  lowStockCount: number;
  totalCustomers: number;
  salesChart: SalesChartData[];
  topProducts: TopProduct[];
  recentTransactions: Transaction[];
  lowStockProducts: Product[];
}

export interface SalesChartData {
  month: string;
  total: number;
}

export interface TopProduct {
  name: string;
  total_qty: number;
}

// ============== SALES MONTHLY ==============
export interface SalesMonthly {
  id: number;
  product_id: number;
  year: number;
  month: number;
  total_qty: number;
  total_revenue: number;
  period_x: number;
}

// ============== API RESPONSE ==============
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}


export interface Product {
  id: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  created_at: string;
}

// Represents the raw data from the API/database
export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  profit: number;
  created_at: string;
}

// A processed sale object that includes derived properties for easier use in components
export interface ProcessedSale extends Sale {
    date: Date;
    productName: string;
    products: { name: string } | null; // For backward compatibility if needed, but productName is preferred
}


// Helper type for sales table that mirrors the database structure
export interface SaleRecord extends Omit<Sale, 'products'> {
  product_name?: string; // a helper property for display
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: true, user: UserProfile } | { success: false, error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: true, user: UserProfile } | { success: false, error?: string }>;
  logout: () => void;
  loginWithGoogle: (googleUser: { name: string; email: string; }) => Promise<{ success: true, user: UserProfile } | { success: false, error?: string }>;
  updateProfile: (newName: string, newEmail: string) => Promise<{ success: true, user: UserProfile } | { success: false, error: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: true } | { success: false, error: string }>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: true, user: UserProfile }>;
}


export interface DataContextType {
  products: Product[];
  sales: ProcessedSale[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<any>;
  updateProduct: (product: Omit<Product, 'created_at'>) => Promise<any>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; reason?: string }>;
  addSale: (sale: { product_id: string, quantity: number }) => Promise<{ success: boolean; reason?: string; stock?: number; productName?: string }>;
  updateSale: (saleId: string, newValues: { product_id: string, quantity: number }) => Promise<{ success: boolean; reason?: string; stock?: number; productName?: string }>;
  deleteSale: (saleId: string) => Promise<any>;
  getSummary: (range?: 'today' | '7days' | '30days' | 'all') => {
    totalRevenue: number;
    totalProfit: number;
    totalProducts: number;
    totalSales: number;
    salesByDay: { date: string; penjualan: number; keuntungan: number }[];
    topProducts: { name: string; value: number }[];
    filteredSales: ProcessedSale[];
  };
}
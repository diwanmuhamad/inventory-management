import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  customer_id?: string;
  quantity: number;
  type: "purchase" | "sale";
  unit_price: number;
  total_amount: number;
  final_amount: number;
  created_at: string;
  product_name?: string;
  customer_name?: string;
  customer_category?: string;
}

export interface InventoryValue {
  totalValue: number;
  totalProducts: number;
  totalItems: number;
}

export interface PaginatedResponse<T> {
  products?: T[];
  history?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const apiService = {
  // Products
  async getProducts(
    page = 1,
    limit = 10,
    category?: string
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (category) params.append("category", category);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  async addProduct(data: {
    name: string;
    price: number;
    stock: number;
    category: string;
  }) {
    const response = await api.post("/products", data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Transactions
  async createTransaction(data: {
    transactionId: string;
    productId: string;
    quantity: number;
    type: "purchase" | "sale";
    customerId?: string;
  }) {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  async getProductHistory(
    productId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(
      `/products/${productId}/history?${params.toString()}`
    );
    return response.data;
  },

  // Reports
  async getInventoryValue(): Promise<InventoryValue> {
    const response = await api.get("/reports/inventory");
    return response.data.data;
  },

  async getLowStockProducts(threshold?: number) {
    const params = threshold ? `?threshold=${threshold}` : "";
    const response = await api.get(`/reports/low-stock${params}`);
    return response.data.data;
  },

  async getMonthlySales(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/monthly-sales?${params.toString()}`
    );
    return response.data.data;
  },

  async getCategorySales(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/category-sales?${params.toString()}`
    );
    return response.data.data;
  },

  async getTopProducts(startDate?: string, endDate?: string, limit?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/reports/top-products?${params.toString()}`
    );
    return response.data.data;
  },

  // Categories
  async getCategories(): Promise<{ categories: string[] }> {
    const response = await api.get("/categories");
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;

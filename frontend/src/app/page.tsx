"use client";

import { useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Star,
} from "lucide-react";
import { apiService, Product, Transaction, InventoryValue } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 6)), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration (since backend doesn't have date filtering yet)
  const mockMonthlySales = [
    { month: "Jan", sales: 45000 },
    { month: "Feb", sales: 52000 },
    { month: "Mar", sales: 48000 },
    { month: "Apr", sales: 61000 },
    { month: "May", sales: 55000 },
    { month: "Jun", sales: 67000 },
    { month: "Jul", sales: 72000 },
    { month: "Aug", sales: 68000 },
    { month: "Sep", sales: 75000 },
    { month: "Oct", sales: 82000 },
    { month: "Nov", sales: 78000 },
    { month: "Dec", sales: 85000 },
  ];

  const mockCategorySales = [
    { category: "Electronics", sales: 450000, percentage: 45 },
    { category: "Furniture", sales: 280000, percentage: 28 },
    { category: "Appliances", sales: 180000, percentage: 18 },
    { category: "Others", sales: 90000, percentage: 9 },
  ];

  const mockTopProducts = [
    { name: "Laptop Dell XPS 13", sales: 125000, quantity: 96 },
    { name: "iPhone 15 Pro", sales: 98000, quantity: 98 },
    { name: "Office Chair", sales: 75000, quantity: 375 },
    { name: "Coffee Maker", sales: 45000, quantity: 500 },
    { name: "Wireless Mouse", sales: 32000, quantity: 1067 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inventoryData, productsData, categoriesData] = await Promise.all(
          [
            apiService.getInventoryValue(),
            apiService.getProducts(1, 100),
            apiService.getCategories(),
          ]
        );

        setInventoryValue(inventoryData);
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Date Filter */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Real-time inventory management and analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="text-sm border-none outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="text-sm border-none outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Inventory Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${inventoryValue?.totalValue?.toLocaleString() || "0"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryValue?.totalProducts || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryValue?.totalItems || 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Categories
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Sales Chart */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Penjualan per Bulan
              </h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMonthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Sales Chart */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Penjualan per Group Barang
              </h3>
              <PieChart className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={mockCategorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category} ${percentage}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {mockCategorySales.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              10 Produk Terlaris
            </h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Product Name
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Sales Value
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Quantity Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTopProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index < 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ${product.sales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {product.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

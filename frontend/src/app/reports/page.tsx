"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { apiService, Product, InventoryValue } from "@/lib/api";

export default function ReportsPage() {
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(
    null
  );
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    fetchReports();
  }, [threshold]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [inventoryData, lowStockData] = await Promise.all([
        apiService.getInventoryValue(),
        apiService.getLowStockProducts(threshold),
      ]);

      setInventoryValue(inventoryData);
      setLowStockProducts(lowStockData.products || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-gray-600">Inventory insights and alerts</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Low Stock Threshold:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inventory Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Low Stock Alert
                </h2>
                <p className="text-gray-600">
                  Products with stock below {threshold} units
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {lowStockProducts.length}
              </div>
              <div className="text-sm text-gray-500">Products</div>
            </div>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {product.id}</p>
                      <p className="text-sm text-gray-600">
                        Category: {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {product.stock}
                      </div>
                      <div className="text-xs text-red-500">units left</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium text-gray-900">
                        ${(product.price * product.stock).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All Good!
              </h3>
              <p className="text-gray-600">
                No products are below the low stock threshold of {threshold}{" "}
                units.
              </p>
            </div>
          )}
        </div>

        {/* Stock Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Stock Distribution
              </h2>
              <p className="text-gray-600">
                Overview of inventory levels across categories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Healthy Stock
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {(inventoryValue?.totalProducts || 0) -
                      lowStockProducts.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-700">
                    {lowStockProducts.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-200 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${inventoryValue?.totalValue?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {inventoryValue?.totalItems || 0}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Filter,
} from "lucide-react";
import { apiService, Product } from "@/lib/api";

export default function ReportsPage() {
  const [inventoryValue, setInventoryValue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    fetchReports();
  }, [threshold]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [inventoryRes, lowStockRes] = await Promise.all([
        apiService.getInventoryValue(),
        apiService.getLowStockProducts(threshold),
      ]);

      setInventoryValue(inventoryRes.totalValue || 0);
      setLowStockProducts(lowStockRes.products || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Total Inventory Value",
      value: `$${inventoryValue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      description: "Current value of all inventory",
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      description: `Products with stock below ${threshold}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Reports
        </h1>
        <p className="text-gray-600">Inventory analytics and insights</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Inventory Value Report */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Inventory Value Overview
            </h2>
            <p className="text-gray-600">
              Comprehensive view of your inventory&apos;s total value
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              ${inventoryValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Total Value
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${inventoryValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Combined value of all products in stock
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Product Count
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {lowStockProducts.length}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Total number of products in inventory
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Low Stock Alert
            </h2>
            <p className="text-gray-600">
              Products that need restocking attention
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Threshold:
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 w-20"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Good!
            </h3>
            <p className="text-gray-600">
              No products are below the current threshold of {threshold} units.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Product
                  </th>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Category
                  </th>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Current Stock
                  </th>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Unit Price
                  </th>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Stock Value
                  </th>
                  <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-white/20">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-white/20">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock === 0
                            ? "bg-red-100 text-red-800"
                            : product.stock < 5
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-white/20 font-semibold text-gray-600">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-b border-white/20 font-bold text-green-600">
                      ${(product.price * product.stock).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-2">
                        {product.stock === 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">
                              Out of Stock
                            </span>
                          </>
                        ) : product.stock < 5 ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-600 font-medium">
                              Critical
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">
                              Low
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

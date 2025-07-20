"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react";
import { apiService, Product, Transaction, Customer } from "@/lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [newTransaction, setNewTransaction] = useState({
    productId: "",
    customerId: "", // No default customer
    quantity: "",
    type: "sale",
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchCustomers();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions(currentPage, 10);
      setTransactions(response.history || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
        hasNext: response.pagination?.hasNext || false,
        hasPrev: response.pagination?.hasPrev || false,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts(1, 100);
      setProducts(response.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getCustomers();
      setCustomers(response.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createTransaction({
        productId: newTransaction.productId,
        customerId: newTransaction.customerId || undefined,
        quantity: parseInt(newTransaction.quantity),
        type: newTransaction.type as "purchase" | "sale",
      });
      setShowAddModal(false);
      setNewTransaction({
        productId: "",
        customerId: "",
        quantity: "",
        type: "sale",
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination for filtered results
  const itemsPerPage = 10;
  const totalFilteredItems = filteredTransactions.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  const hasNextPage = currentPage < totalFilteredPages;
  const hasPrevPage = currentPage > 1;

  const metrics = [
    {
      title: "Total Transactions",
      value: pagination.total.toString(),
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Sales",
      value: `$${Number(
        transactions
          .filter((t) => t.type === "sale")
          .reduce((sum, t) => sum + Number(t.final_amount), 0)
      ).toFixed(2)}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Total Purchases",
      value: `$${Number(
        transactions
          .filter((t) => t.type === "purchase")
          .reduce((sum, t) => sum + Number(t.final_amount), 0)
      ).toFixed(2)}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
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
          Transactions
        </h1>
        <p className="text-gray-600">Track all your inventory transactions</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Add Button */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Product
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Customer
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Type
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Quantity
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Unit Price
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Discount
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Total
                </th>
                <th className="bg-white/50 backdrop-blur-sm text-gray-700 font-semibold px-6 py-4 text-left border-b border-white/30">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-white/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 border-b border-white/20">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {transaction.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-white/20">
                    {transaction.customer_name ? (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-green-500" />
                        <span>{transaction.customer_name}</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.customer_category === "vip"
                              ? "bg-purple-100 text-purple-800"
                              : transaction.customer_category === "premium"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.customer_category}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Anonymous</span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-b border-white/20">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "sale"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-white/20 font-medium">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 border-b border-white/20 font-semibold text-gray-600">
                    ${transaction.unit_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border-b border-white/20">
                    <div className="text-sm">
                      <div className="text-gray-600">
                        {transaction.discount_percentage}%
                      </div>
                      <div className="text-green-600">
                        -${transaction.discount_amount.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-white/20 font-bold text-green-600">
                    ${transaction.final_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border-b border-white/20 text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 transform hover:scale-105 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 transform hover:scale-105 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 max-w-md w-full mx-4 transform transition-all duration-300"
            style={{ animation: "slideUp 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Transaction
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  required
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      type: e.target.value as "purchase" | "sale",
                    }))
                  }
                  className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 w-full"
                >
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  required
                  value={newTransaction.productId}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      productId: e.target.value,
                    }))
                  }
                  className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 w-full"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  value={newTransaction.customerId}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                    }))
                  }
                  className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 w-full"
                >
                  <option value="">Select Customer (Optional)</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.category} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  value={newTransaction.quantity}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 w-full"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 transform hover:scale-105 hover:bg-white/90"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

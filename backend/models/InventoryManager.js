const { pool } = require('../config/database');
const logger = require('../utils/logger');
const { EventEmitter } = require('events');
const {
    ProductNotFoundError,
    InsufficientStockError,
    InvalidTransactionError,
    CustomerNotFoundError,
    ValidationError
} = require('../utils/errors');

class InventoryManager extends EventEmitter {
    constructor() {
        super();
        this.lowStockThreshold = 10;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for low stock events
        this.on('lowStock', (productId, currentStock) => {
            logger.logLowStockAlert(productId, currentStock, this.lowStockThreshold);
        });
    }

    // Method 1: Add Product
    async addProduct(name, price, stock, category) {
        try {
            // Validation
            if (!name || !price || stock === undefined || !category) {
                throw new ValidationError('All product fields are required');
            }
            if (price <= 0) {
                throw new ValidationError('Price must be greater than 0');
            }
            if (stock < 0) {
                throw new ValidationError('Stock cannot be negative');
            }

            // Generate product ID
            const productId = await this.generateProductId();

            const query = `
                INSERT INTO products (id, name, price, stock, category) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            await pool.execute(query, [productId, name, price, stock, category]);
            
            logger.info(`Product added successfully`, { productId, name, price, stock, category });
            
            return { success: true, productId, name, price, stock, category };
        } catch (error) {
            logger.error(`Error adding product: ${error.message}`, { name, error });
            throw error;
        }
    }

    // Helper method: Generate unique product ID
    async generateProductId() {
        try {
            // Get the highest existing product ID number
            const [rows] = await pool.execute(`
                SELECT id FROM products 
                WHERE id LIKE 'PROD%' 
                ORDER BY CAST(SUBSTRING(id, 5) AS UNSIGNED) DESC 
                LIMIT 1
            `);
            
            let nextNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const lastNumber = parseInt(lastId.substring(4)); // Remove 'PROD' prefix
                nextNumber = lastNumber + 1;
            }
            
            return `PROD${String(nextNumber).padStart(3, '0')}`;
        } catch (error) {
            logger.error(`Error generating product ID: ${error.message}`, { error });
            // Fallback to timestamp-based ID
            return `PROD${Date.now()}`;
        }
    }

    // Method 2: Update Stock
    async updateStock(productId, quantity, transactionType) {
        try {
            // Validation
            if (!productId || quantity === undefined || !transactionType) {
                throw new ValidationError('Product ID, quantity, and transaction type are required');
            }
            if (quantity <= 0) {
                throw new ValidationError('Quantity must be greater than 0');
            }

            // Get current stock
            const [rows] = await pool.execute(
                'SELECT stock FROM products WHERE id = ?',
                [productId]
            );

            if (rows.length === 0) {
                throw new ProductNotFoundError(productId);
            }

            const currentStock = rows[0].stock;
            let newStock;

            if (transactionType === 'purchase') {
                newStock = currentStock + quantity;
            } else if (transactionType === 'sale') {
                if (currentStock < quantity) {
                    throw new InsufficientStockError(productId, quantity, currentStock);
                }
                newStock = currentStock - quantity;
            } else {
                throw new InvalidTransactionError(`Invalid transaction type: ${transactionType}`);
            }

            // Update stock
            await pool.execute(
                'UPDATE products SET stock = ? WHERE id = ?',
                [newStock, productId]
            );

            // Log stock change
            logger.logStockChange(productId, currentStock, newStock, transactionType);

            // Check for low stock
            if (newStock <= this.lowStockThreshold) {
                this.emit('lowStock', productId, newStock);
            }

            return { success: true, productId, oldStock: currentStock, newStock, change: quantity };
        } catch (error) {
            logger.error(`Error updating stock: ${error.message}`, { productId, quantity, transactionType, error });
            throw error;
        }
    }

    // Method 3: Create Transaction
    async createTransaction(transactionId, productId, quantity, type, customerId) {
        try {
            // Validation
            if (!transactionId || !productId || !quantity || !type) {
                throw new ValidationError('Transaction ID, product ID, quantity, and type are required');
            }
            if (quantity <= 0) {
                throw new ValidationError('Quantity must be greater than 0');
            }
            if (!['purchase', 'sale'].includes(type)) {
                throw new InvalidTransactionError(`Invalid transaction type: ${type}`);
            }

            // Get product details
            const [productRows] = await pool.execute(
                'SELECT * FROM products WHERE id = ?',
                [productId]
            );

            if (productRows.length === 0) {
                throw new ProductNotFoundError(productId);
            }

            const product = productRows[0];

            // Validate customer if provided
            if (customerId) {
                const [customerRows] = await pool.execute(
                    'SELECT * FROM customers WHERE id = ?',
                    [customerId]
                );
                if (customerRows.length === 0) {
                    throw new CustomerNotFoundError(customerId);
                }
            }

            // Calculate amounts
            const unitPrice = product.price;
            const totalAmount = unitPrice * quantity;
            
            // Calculate discount based on customer category and quantity
            const discountPercentage = await this.calculateDiscount(customerId, quantity, type);
            const discountAmount = (totalAmount * discountPercentage) / 100;
            const finalAmount = totalAmount - discountAmount;

            // Create transaction
            const query = `
                INSERT INTO transactions (id, product_id, customer_id, quantity, type, unit_price, total_amount, discount_percentage, discount_amount, final_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await pool.execute(query, [
                transactionId, productId, customerId, quantity, type, 
                unitPrice, totalAmount, discountPercentage, discountAmount, finalAmount
            ]);

            // Update stock
            await this.updateStock(productId, quantity, type);

            // Log transaction
            logger.logTransaction(transactionId, 'created', {
                productId, quantity, type, customerId, finalAmount
            });

            return {
                success: true,
                transactionId,
                productId,
                quantity,
                type,
                customerId,
                unitPrice,
                totalAmount,
                discountPercentage,
                discountAmount,
                finalAmount
            };
        } catch (error) {
            logger.error(`Error creating transaction: ${error.message}`, { 
                transactionId, productId, quantity, type, customerId, error 
            });
            throw error;
        }
    }

    // Method 4: Get Products by Category
    async getProductsByCategory(category, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT * FROM products 
                WHERE category = ? 
                ORDER BY name 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const [rows] = await pool.execute(query, [category]);
            
            // Get total count for pagination
            const [countRows] = await pool.execute(
                'SELECT COUNT(*) as total FROM products WHERE category = ?',
                [category]
            );
            
            const total = countRows[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                products: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            logger.error(`Error getting products by category: ${error.message}`, { category, error });
            throw error;
        }
    }

    // Method 5: Get Inventory Value
    async getInventoryValue() {
        try {
            const query = `
                SELECT 
                    SUM(price * stock) as totalValue,
                    COUNT(*) as totalProducts,
                    SUM(stock) as totalItems
                FROM products
            `;
            
            const [rows] = await pool.execute(query);
            const result = rows[0];

            return {
                totalValue: parseFloat(result.totalValue) || 0,
                totalProducts: result.totalProducts,
                totalItems: result.totalItems
            };
        } catch (error) {
            logger.error(`Error calculating inventory value: ${error.message}`, { error });
            throw error;
        }
    }

    // Method 6: Get Product History
    async getProductHistory(productId, page = 1, limit = 10) {
        try {
            // Validate product exists
            const [productRows] = await pool.execute(
                'SELECT * FROM products WHERE id = ?',
                [productId]
            );

            if (productRows.length === 0) {
                throw new ProductNotFoundError(productId);
            }

            const offset = (page - 1) * limit;
            
            const query = `
                SELECT 
                    t.*,
                    p.name as product_name,
                    c.name as customer_name,
                    c.category as customer_category
                FROM transactions t
                LEFT JOIN products p ON t.product_id = p.id
                LEFT JOIN customers c ON t.customer_id = c.id
                WHERE t.product_id = ?
                ORDER BY t.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const [rows] = await pool.execute(query, [productId]);
            
            // Get total count for pagination
            const [countRows] = await pool.execute(
                'SELECT COUNT(*) as total FROM transactions WHERE product_id = ?',
                [productId]
            );
            
            const total = countRows[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                productId,
                history: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            logger.error(`Error getting product history: ${error.message}`, { productId, error });
            throw error;
        }
    }

    // Helper method: Calculate discount
    async calculateDiscount(customerId, quantity, type) {
        if (!customerId || type !== 'sale') {
            return 0;
        }

        try {
            const [customerRows] = await pool.execute(
                'SELECT category FROM customers WHERE id = ?',
                [customerId]
            );

            if (customerRows.length === 0) {
                return 0;
            }

            const customerCategory = customerRows[0].category;
            let discountPercentage = 0;

            // Discount based on customer category
            switch (customerCategory) {
                case 'vip':
                    discountPercentage = 15;
                    break;
                case 'premium':
                    discountPercentage = 10;
                    break;
                case 'regular':
                    discountPercentage = 5;
                    break;
            }

            // Additional discount based on quantity
            if (quantity >= 10) {
                discountPercentage += 5;
            } else if (quantity >= 5) {
                discountPercentage += 2;
            }

            return Math.min(discountPercentage, 25); // Max 25% discount
        } catch (error) {
            logger.error(`Error calculating discount: ${error.message}`, { customerId, quantity, type, error });
            return 0;
        }
    }

    // Additional method: Get all products with pagination
    async getAllProducts(page = 1, limit = 10, category = null) {
        try {
            // Ensure parameters are numbers
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const offset = (pageNum - 1) * limitNum;
            
            let query = 'SELECT * FROM products';
            let countQuery = 'SELECT COUNT(*) as total FROM products';
            let params = [];
            let countParams = [];

            if (category) {
                query += ' WHERE category = ?';
                countQuery += ' WHERE category = ?';
                params.push(category);
                countParams.push(category);
            }

            query += ` ORDER BY name LIMIT ${limitNum} OFFSET ${offset}`;

            // Debug logging
            logger.debug(`Query: ${query}`, { params, pageNum, limitNum, category });
            logger.debug(`Count Query: ${countQuery}`, { countParams });

            const [rows] = await pool.execute(query, params);
            const [countRows] = await pool.execute(countQuery, countParams);
            
            const total = countRows[0].total;
            const totalPages = Math.ceil(total / limitNum);

            return {
                products: rows,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            };
        } catch (error) {
            logger.error(`Error getting all products: ${error.message}`, { page, limit, category, error });
            throw error;
        }
    }

    // Additional method: Update product
    async updateProduct(productId, updates) {
        try {
            const allowedFields = ['name', 'price', 'category'];
            const updateFields = [];
            const values = [];

            for (const [field, value] of Object.entries(updates)) {
                if (allowedFields.includes(field)) {
                    updateFields.push(`${field} = ?`);
                    values.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new ValidationError('No valid fields to update');
            }

            values.push(productId);
            const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const [result] = await pool.execute(query, values);
            
            if (result.affectedRows === 0) {
                throw new ProductNotFoundError(productId);
            }

            logger.info(`Product updated successfully`, { productId, updates });
            return { success: true, productId, updates };
        } catch (error) {
            logger.error(`Error updating product: ${error.message}`, { productId, updates, error });
            throw error;
        }
    }

    // Additional method: Get low stock products
    async getLowStockProducts(threshold = null) {
        try {
            const stockThreshold = threshold || this.lowStockThreshold;
            
            const query = `
                SELECT * FROM products 
                WHERE stock <= ? 
                ORDER BY stock ASC
            `;
            
            const [rows] = await pool.execute(query, [stockThreshold]);
            
            return {
                products: rows,
                threshold: stockThreshold,
                count: rows.length
            };
        } catch (error) {
            logger.error(`Error getting low stock products: ${error.message}`, { threshold, error });
            throw error;
        }
    }

    // Get monthly sales data
    async getMonthlySales(startDate = null, endDate = null) {
        try {
            let dateFilter = '';
            let params = [];
            
            if (startDate && endDate) {
                dateFilter = 'WHERE created_at BETWEEN ? AND ?';
                params = [startDate, endDate];
            }
            
            const query = `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(final_amount) as sales
                FROM transactions 
                ${dateFilter}
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `;
            
            const [rows] = await pool.execute(query, params);
            
            return rows.map(row => ({
                month: row.month,
                sales: parseFloat(row.sales)
            }));
        } catch (error) {
            logger.error(`Error getting monthly sales: ${error.message}`, { startDate, endDate, error });
            throw error;
        }
    }

    // Get sales by category
    async getCategorySales(startDate = null, endDate = null) {
        try {
            let dateFilter = '';
            let params = [];
            
            if (startDate && endDate) {
                dateFilter = 'AND t.created_at BETWEEN ? AND ?';
                params = [startDate, endDate];
            }
            
            const query = `
                SELECT 
                    p.category,
                    SUM(t.final_amount) as sales,
                    COUNT(*) as transaction_count
                FROM transactions t
                JOIN products p ON t.product_id = p.id
                WHERE t.type = 'sale' ${dateFilter}
                GROUP BY p.category
                ORDER BY sales DESC
            `;
            
            const [rows] = await pool.execute(query, params);
            
            const totalSales = rows.reduce((sum, row) => sum + parseFloat(row.sales), 0);
            
            return rows.map(row => ({
                category: row.category,
                sales: parseFloat(row.sales),
                percentage: totalSales > 0 ? Math.round((parseFloat(row.sales) / totalSales) * 100) : 0
            }));
        } catch (error) {
            logger.error(`Error getting category sales: ${error.message}`, { startDate, endDate, error });
            throw error;
        }
    }

    // Get top selling products
    async getTopProducts(startDate = null, endDate = null, limit = 10) {
        try {
            let dateFilter = '';
            let params = [];
            
            if (startDate && endDate) {
                dateFilter = 'AND t.created_at BETWEEN ? AND ?';
                params = [startDate, endDate];
            }
            
            const query = `
                SELECT 
                    p.name,
                    p.id,
                    SUM(t.final_amount) as sales,
                    SUM(t.quantity) as quantity_sold
                FROM transactions t
                JOIN products p ON t.product_id = p.id
                WHERE t.type = 'sale' ${dateFilter}
                GROUP BY p.id, p.name
                ORDER BY sales DESC
                LIMIT ${limit}
            `;
            
            const [rows] = await pool.execute(query, params);
            
            return rows.map(row => ({
                name: row.name,
                sales: parseFloat(row.sales),
                quantity: parseInt(row.quantity_sold)
            }));
        } catch (error) {
            logger.error(`Error getting top products: ${error.message}`, { startDate, endDate, limit, error });
            throw error;
        }
    }
}

module.exports = InventoryManager; 
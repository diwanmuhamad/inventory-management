require('dotenv').config();

const http = require('http');
const url = require('url');
const { testConnection } = require('./config/database');
const InventoryManager = require('./models/InventoryManager');
const logger = require('./utils/logger');

class InventoryServer {
    constructor() {
        this.inventoryManager = new InventoryManager();
        this.port = process.env.PORT || 3000;
    }

    // Parse request body
    async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
            req.on('error', reject);
        });
    }

    // Send JSON response
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data, null, 2));
    }

    // Send error response
    sendError(res, error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        
        logger.error(`API Error: ${message}`, { statusCode, error });
        
        this.sendResponse(res, statusCode, {
            error: true,
            message,
            statusCode
        });
    }

    // Parse query parameters
    parseQueryParams(queryString) {
        const params = {};
        if (queryString) {
            const pairs = queryString.split('&');
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                if (key && value) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            });
        }
        return params;
    }

    // Route handler
    async handleRequest(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const path = parsedUrl.pathname;
            const method = req.method;
            const query = parsedUrl.query;

            logger.info(`${method} ${path}`, { query });

            // CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Handle preflight requests
            if (method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Route handling
            if (path === '/products' && method === 'POST') {
                await this.handleAddProduct(req, res);
            } else if (path === '/products' && method === 'GET') {
                await this.handleGetProducts(req, res, query);
            } else if (path.match(/^\/products\/[^\/]+$/) && method === 'PUT') {
                await this.handleUpdateProduct(req, res);
            } else if (path === '/transactions' && method === 'POST') {
                await this.handleCreateTransaction(req, res);
            } else if (path === '/reports/inventory' && method === 'GET') {
                await this.handleGetInventoryReport(req, res);
            } else if (path === '/reports/low-stock' && method === 'GET') {
                await this.handleGetLowStockReport(req, res, query);
            } else if (path === '/reports/monthly-sales' && method === 'GET') {
                await this.handleGetMonthlySales(req, res, query);
            } else if (path === '/reports/category-sales' && method === 'GET') {
                await this.handleGetCategorySales(req, res, query);
            } else if (path === '/reports/top-products' && method === 'GET') {
                await this.handleGetTopProducts(req, res, query);
            } else if (path.match(/^\/products\/[^\/]+\/history$/) && method === 'GET') {
                await this.handleGetProductHistory(req, res);
            } else if (path === '/categories' && method === 'GET') {
                await this.handleGetCategories(req, res);
            } else if (path === '/health' && method === 'GET') {
                this.sendResponse(res, 200, { status: 'OK', timestamp: new Date().toISOString() });
            } else {
                this.sendResponse(res, 404, { error: true, message: 'Endpoint not found' });
            }
        } catch (error) {
            this.sendError(res, error);
        }
    }

    // Handle POST /products
    async handleAddProduct(req, res) {
        const body = await this.parseBody(req);
        const { name, price, stock, category } = body;

        const result = await this.inventoryManager.addProduct(name, price, stock, category);
        this.sendResponse(res, 201, result);
    }

    // Handle GET /products
    async handleGetProducts(req, res, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const category = query.category || null;

        const result = await this.inventoryManager.getAllProducts(page, limit, category);
        this.sendResponse(res, 200, result);
    }

    // Handle PUT /products/:id
    async handleUpdateProduct(req, res) {
        const productId = req.url.split('/')[2];
        const body = await this.parseBody(req);

        const result = await this.inventoryManager.updateProduct(productId, body);
        this.sendResponse(res, 200, result);
    }

    // Handle POST /transactions
    async handleCreateTransaction(req, res) {
        const body = await this.parseBody(req);
        const { transactionId, productId, quantity, type, customerId } = body;

        const result = await this.inventoryManager.createTransaction(transactionId, productId, quantity, type, customerId);
        this.sendResponse(res, 201, result);
    }

    // Handle GET /reports/inventory
    async handleGetInventoryReport(req, res) {
        const result = await this.inventoryManager.getInventoryValue();
        this.sendResponse(res, 200, {
            report: 'inventory_value',
            data: result,
            generated_at: new Date().toISOString()
        });
    }

    // Handle GET /reports/low-stock
    async handleGetLowStockReport(req, res, query) {
        const threshold = query.threshold ? parseInt(query.threshold) : null;
        const result = await this.inventoryManager.getLowStockProducts(threshold);
        this.sendResponse(res, 200, {
            report: 'low_stock_products',
            data: result,
            generated_at: new Date().toISOString()
        });
    }

    // Handle GET /products/:id/history
    async handleGetProductHistory(req, res) {
        const productId = req.url.split('/')[2];
        const query = this.parseQueryParams(req.url.split('?')[1] || '');
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;

        const result = await this.inventoryManager.getProductHistory(productId, page, limit);
        this.sendResponse(res, 200, result);
    }

    // Handle GET /categories
    async handleGetCategories(req, res) {
        try {
            const { pool } = require('./config/database');
            const [rows] = await pool.execute('SELECT DISTINCT category FROM products ORDER BY category');
            const categories = rows.map(row => row.category);
            
            this.sendResponse(res, 200, { categories });
        } catch (error) {
            this.sendError(res, error);
        }
    }

    // Handle GET /reports/monthly-sales
    async handleGetMonthlySales(req, res, query) {
        try {
            const startDate = query.startDate || null;
            const endDate = query.endDate || null;
            
            const result = await this.inventoryManager.getMonthlySales(startDate, endDate);
            this.sendResponse(res, 200, {
                report: 'monthly_sales',
                data: result,
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            this.sendError(res, error);
        }
    }

    // Handle GET /reports/category-sales
    async handleGetCategorySales(req, res, query) {
        try {
            const startDate = query.startDate || null;
            const endDate = query.endDate || null;
            
            const result = await this.inventoryManager.getCategorySales(startDate, endDate);
            this.sendResponse(res, 200, {
                report: 'category_sales',
                data: result,
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            this.sendError(res, error);
        }
    }

    // Handle GET /reports/top-products
    async handleGetTopProducts(req, res, query) {
        try {
            const startDate = query.startDate || null;
            const endDate = query.endDate || null;
            const limit = parseInt(query.limit) || 10;
            
            const result = await this.inventoryManager.getTopProducts(startDate, endDate, limit);
            this.sendResponse(res, 200, {
                report: 'top_products',
                data: result,
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            this.sendError(res, error);
        }
    }

    // Start server
    async start() {
        try {
            // Test database connection
            await testConnection();
            
            const server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            server.listen(this.port, () => {
                logger.info(`Server running on port ${this.port}`);
                console.log(`🚀 Inventory Management API Server running on http://localhost:${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => {
                logger.info('Server shutting down gracefully');
                server.close(() => {
                    process.exit(0);
                });
            });

        } catch (error) {
            logger.error(`Failed to start server: ${error.message}`, { error });
            process.exit(1);
        }
    }
}

// Start the server
const server = new InventoryServer();
server.start(); 
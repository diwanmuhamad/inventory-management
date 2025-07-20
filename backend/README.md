# Inventory Management System Backend

A complete Node.js backend implementation for an Inventory Management System using vanilla Node.js (no Express framework) with MySQL database.

## Features

- ✅ Product management with categories
- ✅ Transaction tracking (purchase/sale)
- ✅ Customer and supplier management
- ✅ Discount system based on customer category and quantity
- ✅ Stock validation and updates
- ✅ Pagination for product listings
- ✅ Comprehensive logging system
- ✅ Event-driven notifications for low stock
- ✅ Custom error handling
- ✅ RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone or navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure database**

   - Update `config/database.js` with your MySQL credentials
   - Default configuration:
     ```javascript
     host: 'localhost',
     user: 'root',
     password: '', // Change this to your MySQL password
     database: 'inventory_manager'
     ```

4. **Setup database**

   ```bash
   # Import the database schema
   mysql -u root -p < database.sql
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. POST /products

**Add a new product**

**Request:**

```json
{
  "productId": "PROD006",
  "name": "Gaming Mouse",
  "price": 79.99,
  "stock": 20,
  "category": "Electronics"
}
```

**Response:**

```json
{
  "success": true,
  "productId": "PROD006",
  "name": "Gaming Mouse",
  "price": 79.99,
  "stock": 20,
  "category": "Electronics"
}
```

### 2. GET /products

**Get all products with pagination and filtering**

**Request:**

```
GET /products?page=1&limit=10&category=Electronics
```

**Response:**

```json
{
  "products": [
    {
      "id": "PROD001",
      "name": "Laptop Dell XPS 13",
      "price": "1299.99",
      "stock": 10,
      "category": "Electronics",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 3. PUT /products/:id

**Update product information**

**Request:**

```json
{
  "name": "Updated Product Name",
  "price": 89.99,
  "category": "Electronics"
}
```

**Response:**

```json
{
  "success": true,
  "productId": "PROD001",
  "updates": {
    "name": "Updated Product Name",
    "price": 89.99,
    "category": "Electronics"
  }
}
```

### 4. POST /transactions

**Create a new transaction (purchase or sale)**

**Request:**

```json
{
  "transactionId": "TXN001",
  "productId": "PROD001",
  "quantity": 2,
  "type": "sale",
  "customerId": "CUST001"
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "TXN001",
  "productId": "PROD001",
  "quantity": 2,
  "type": "sale",
  "customerId": "CUST001",
  "unitPrice": 1299.99,
  "totalAmount": 2599.98,
  "discountPercentage": 5,
  "discountAmount": 129.99,
  "finalAmount": 2469.99
}
```

### 5. GET /reports/inventory

**Get inventory value report**

**Response:**

```json
{
  "report": "inventory_value",
  "data": {
    "totalValue": 45678.9,
    "totalProducts": 5,
    "totalItems": 130
  },
  "generated_at": "2024-01-01T12:00:00.000Z"
}
```

### 6. GET /reports/low-stock

**Get products with low stock**

**Request:**

```
GET /reports/low-stock?threshold=15
```

**Response:**

```json
{
  "report": "low_stock_products",
  "data": {
    "products": [
      {
        "id": "PROD001",
        "name": "Laptop Dell XPS 13",
        "stock": 10,
        "category": "Electronics"
      }
    ],
    "threshold": 15,
    "count": 1
  },
  "generated_at": "2024-01-01T12:00:00.000Z"
}
```

### 7. GET /products/:id/history

**Get transaction history for a specific product**

**Request:**

```
GET /products/PROD001/history?page=1&limit=10
```

**Response:**

```json
{
  "productId": "PROD001",
  "history": [
    {
      "id": "TXN001",
      "product_id": "PROD001",
      "customer_id": "CUST001",
      "quantity": 2,
      "type": "sale",
      "unit_price": "1299.99",
      "total_amount": "2599.98",
      "final_amount": "2469.99",
      "created_at": "2024-01-01T12:00:00.000Z",
      "product_name": "Laptop Dell XPS 13",
      "customer_name": "John Doe",
      "customer_category": "regular"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 8. GET /categories

**Get all product categories**

**Response:**

```json
{
  "categories": ["Electronics", "Furniture", "Appliances"]
}
```

### 9. GET /health

**Health check endpoint**

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Discount System

The system implements automatic discount calculation based on:

- **Customer Category:**

  - VIP: 15% discount
  - Premium: 10% discount
  - Regular: 5% discount

- **Quantity-based discounts:**
  - 10+ items: +5% additional discount
  - 5+ items: +2% additional discount
  - Maximum total discount: 25%

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `404` - Not Found (product/customer not found)
- `500` - Internal Server Error

Example error response:

```json
{
  "error": true,
  "message": "Product with ID PROD999 not found",
  "statusCode": 404
}
```

## Logging

All transactions and system events are logged to files in the `logs/` directory:

- `info.log` - General information
- `error.log` - Error messages
- `warn.log` - Warning messages
- `debug.log` - Debug information

## Database Schema

The system uses the following main tables:

- `products` - Product information
- `customers` - Customer data with categories
- `suppliers` - Supplier information
- `transactions` - Transaction records
- `transaction_history` - Detailed transaction logging

## Testing the API

You can test the API using curl or any HTTP client:

```bash
# Add a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"productId":"PROD006","name":"Test Product","price":99.99,"stock":50,"category":"Electronics"}'

# Get all products
curl http://localhost:3000/products

# Create a transaction
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"TXN001","productId":"PROD001","quantity":1,"type":"sale","customerId":"CUST001"}'

# Get inventory report
curl http://localhost:3000/reports/inventory
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── models/
│   └── InventoryManager.js  # Main business logic class
├── utils/
│   ├── errors.js           # Custom error classes
│   └── logger.js           # Logging system
├── logs/                   # Log files (created automatically)
├── database.sql            # Database schema
├── package.json            # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- Database configuration in `config/database.js`

## Security Notes

- Update database credentials in `config/database.js`
- Consider implementing authentication for production use
- Validate all input data (already implemented)
- Use HTTPS in production

## Troubleshooting

1. **Database connection failed:**

   - Check MySQL is running
   - Verify credentials in `config/database.js`
   - Ensure database exists: `mysql -u root -p < database.sql`

2. **Port already in use:**

   - Change port in `server.js` or set `PORT` environment variable
   - Kill existing process: `lsof -ti:3000 | xargs kill`

3. **Module not found errors:**
   - Run `npm install` to install dependencies

## License

MIT License

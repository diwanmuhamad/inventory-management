-- Inventory Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS inventory_manager;
USE inventory_manager;

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    category ENUM('regular', 'premium', 'vip') DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    supplier_id VARCHAR(50),
    quantity INT NOT NULL,
    type ENUM('purchase', 'sale') NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Transaction history table for detailed logging
CREATE TABLE transaction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_stock INT,
    new_stock INT,
    quantity_changed INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data
INSERT INTO customers (id, name, email, phone, category) VALUES
('CUST001', 'John Doe', 'john@example.com', '+1234567890', 'regular'),
('CUST002', 'Jane Smith', 'jane@example.com', '+1234567891', 'premium'),
('CUST003', 'Bob Wilson', 'bob@example.com', '+1234567892', 'vip');

INSERT INTO suppliers (id, name, email, phone, address) VALUES
('SUPP001', 'ABC Electronics', 'abc@supplier.com', '+1987654321', '123 Supplier St, City'),
('SUPP002', 'XYZ Components', 'xyz@supplier.com', '+1987654322', '456 Vendor Ave, Town');

INSERT INTO products (id, name, price, stock, category) VALUES
('PROD001', 'Laptop Dell XPS 13', 1299.99, 10, 'Electronics'),
('PROD002', 'iPhone 15 Pro', 999.99, 25, 'Electronics'),
('PROD003', 'Office Chair', 199.99, 15, 'Furniture'),
('PROD004', 'Coffee Maker', 89.99, 30, 'Appliances'),
('PROD005', 'Wireless Mouse', 29.99, 50, 'Electronics'); 
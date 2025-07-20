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

-- Insert sample transactions for the last 12 months
INSERT INTO transactions (id, product_id, customer_id, quantity, type, unit_price, total_amount, discount_percentage, discount_amount, final_amount, created_at) VALUES
-- January 2024
('TXN001', 'PROD001', 'CUST001', 2, 'sale', 1299.99, 2599.98, 5, 129.99, 2469.99, '2024-01-15 10:30:00'),
('TXN002', 'PROD002', 'CUST002', 1, 'sale', 999.99, 999.99, 10, 99.99, 900.00, '2024-01-20 14:15:00'),
('TXN003', 'PROD003', 'CUST003', 5, 'sale', 199.99, 999.95, 15, 149.99, 849.96, '2024-01-25 09:45:00'),

-- February 2024
('TXN004', 'PROD001', 'CUST001', 1, 'sale', 1299.99, 1299.99, 5, 64.99, 1235.00, '2024-02-10 11:20:00'),
('TXN005', 'PROD004', 'CUST002', 3, 'sale', 89.99, 269.97, 5, 13.49, 256.48, '2024-02-15 16:30:00'),
('TXN006', 'PROD005', 'CUST003', 10, 'sale', 29.99, 299.90, 10, 29.99, 269.91, '2024-02-28 13:45:00'),

-- March 2024
('TXN007', 'PROD002', 'CUST001', 2, 'sale', 999.99, 1999.98, 10, 199.99, 1799.99, '2024-03-05 10:15:00'),
('TXN008', 'PROD003', 'CUST002', 3, 'sale', 199.99, 599.97, 10, 59.99, 539.98, '2024-03-12 14:30:00'),
('TXN009', 'PROD004', 'CUST003', 2, 'sale', 89.99, 179.98, 5, 8.99, 170.99, '2024-03-20 09:00:00'),

-- April 2024
('TXN010', 'PROD001', 'CUST001', 3, 'sale', 1299.99, 3899.97, 15, 584.99, 3314.98, '2024-04-08 11:45:00'),
('TXN011', 'PROD005', 'CUST002', 15, 'sale', 29.99, 449.85, 15, 67.47, 382.38, '2024-04-15 16:20:00'),
('TXN012', 'PROD002', 'CUST003', 1, 'sale', 999.99, 999.99, 5, 49.99, 950.00, '2024-04-22 13:10:00'),

-- May 2024
('TXN013', 'PROD003', 'CUST001', 4, 'sale', 199.99, 799.96, 10, 79.99, 719.97, '2024-05-03 10:30:00'),
('TXN014', 'PROD004', 'CUST002', 5, 'sale', 89.99, 449.95, 10, 44.99, 404.96, '2024-05-10 15:45:00'),
('TXN015', 'PROD001', 'CUST003', 2, 'sale', 1299.99, 2599.98, 10, 259.99, 2339.99, '2024-05-18 12:20:00'),

-- June 2024
('TXN016', 'PROD002', 'CUST001', 3, 'sale', 999.99, 2999.97, 15, 449.99, 2549.98, '2024-06-05 09:15:00'),
('TXN017', 'PROD005', 'CUST002', 20, 'sale', 29.99, 599.80, 20, 119.96, 479.84, '2024-06-12 14:30:00'),
('TXN018', 'PROD003', 'CUST003', 6, 'sale', 199.99, 1199.94, 15, 179.99, 1019.95, '2024-06-25 11:45:00'),

-- July 2024
('TXN019', 'PROD001', 'CUST001', 4, 'sale', 1299.99, 5199.96, 20, 1039.99, 4159.97, '2024-07-08 10:20:00'),
('TXN020', 'PROD004', 'CUST002', 8, 'sale', 89.99, 719.92, 15, 107.98, 611.94, '2024-07-15 16:45:00'),
('TXN021', 'PROD002', 'CUST003', 2, 'sale', 999.99, 1999.98, 10, 199.99, 1799.99, '2024-07-22 13:30:00'),

-- August 2024
('TXN022', 'PROD003', 'CUST001', 7, 'sale', 199.99, 1399.93, 20, 279.98, 1119.95, '2024-08-05 11:15:00'),
('TXN023', 'PROD005', 'CUST002', 25, 'sale', 29.99, 749.75, 25, 187.43, 562.32, '2024-08-12 15:20:00'),
('TXN024', 'PROD001', 'CUST003', 3, 'sale', 1299.99, 3899.97, 15, 584.99, 3314.98, '2024-08-20 09:45:00'),

-- September 2024
('TXN025', 'PROD002', 'CUST001', 5, 'sale', 999.99, 4999.95, 25, 1249.98, 3749.97, '2024-09-03 14:10:00'),
('TXN026', 'PROD004', 'CUST002', 10, 'sale', 89.99, 899.90, 20, 179.98, 719.92, '2024-09-10 12:30:00'),
('TXN027', 'PROD003', 'CUST003', 8, 'sale', 199.99, 1599.92, 20, 319.98, 1279.94, '2024-09-18 16:45:00'),

-- October 2024
('TXN028', 'PROD001', 'CUST001', 6, 'sale', 1299.99, 7799.94, 30, 2339.98, 5459.96, '2024-10-05 10:25:00'),
('TXN029', 'PROD005', 'CUST002', 30, 'sale', 29.99, 899.70, 30, 269.91, 629.79, '2024-10-12 15:40:00'),
('TXN030', 'PROD002', 'CUST003', 4, 'sale', 999.99, 3999.96, 20, 799.99, 3199.97, '2024-10-20 13:15:00'),

-- November 2024
('TXN031', 'PROD003', 'CUST001', 10, 'sale', 199.99, 1999.90, 25, 499.97, 1499.93, '2024-11-07 11:50:00'),
('TXN032', 'PROD004', 'CUST002', 12, 'sale', 89.99, 1079.88, 25, 269.97, 809.91, '2024-11-14 16:20:00'),
('TXN033', 'PROD001', 'CUST003', 5, 'sale', 1299.99, 6499.95, 25, 1624.98, 4874.97, '2024-11-22 09:30:00'),

-- December 2024
('TXN034', 'PROD002', 'CUST001', 8, 'sale', 999.99, 7999.92, 30, 2399.97, 5599.95, '2024-12-05 14:15:00'),
('TXN035', 'PROD005', 'CUST002', 35, 'sale', 29.99, 1049.65, 35, 367.37, 682.28, '2024-12-12 12:45:00'),
('TXN036', 'PROD003', 'CUST003', 12, 'sale', 199.99, 2399.88, 30, 719.96, 1679.92, '2024-12-20 16:30:00'); 
// Custom Error Classes for Inventory Management System

class InventoryError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'InventoryError';
        this.statusCode = statusCode;
    }
}

class ProductNotFoundError extends InventoryError {
    constructor(productId) {
        super(`Product with ID ${productId} not found`, 404);
        this.name = 'ProductNotFoundError';
    }
}

class InsufficientStockError extends InventoryError {
    constructor(productId, requested, available) {
        super(`Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`, 400);
        this.name = 'InsufficientStockError';
    }
}

class InvalidTransactionError extends InventoryError {
    constructor(message) {
        super(`Invalid transaction: ${message}`, 400);
        this.name = 'InvalidTransactionError';
    }
}

class CustomerNotFoundError extends InventoryError {
    constructor(customerId) {
        super(`Customer with ID ${customerId} not found`, 404);
        this.name = 'CustomerNotFoundError';
    }
}

class ValidationError extends InventoryError {
    constructor(message) {
        super(`Validation error: ${message}`, 400);
        this.name = 'ValidationError';
    }
}

module.exports = {
    InventoryError,
    ProductNotFoundError,
    InsufficientStockError,
    InvalidTransactionError,
    CustomerNotFoundError,
    ValidationError
}; 
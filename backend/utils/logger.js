const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class Logger extends EventEmitter {
    constructor() {
        super();
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    writeLog(level, message, data = {}) {
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const logFile = path.join(this.logDir, `${level}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';

        fs.appendFileSync(logFile, logLine);

        // Emit event for real-time monitoring
        this.emit('log', logEntry);

        // Console output for development
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }

    info(message, data = {}) {
        this.writeLog('info', message, data);
    }

    error(message, data = {}) {
        this.writeLog('error', message, data);
    }

    warn(message, data = {}) {
        this.writeLog('warn', message, data);
    }

    debug(message, data = {}) {
        this.writeLog('debug', message, data);
    }

    // Transaction specific logging
    logTransaction(transactionId, action, details) {
        this.info(`Transaction ${action}`, {
            transactionId,
            action,
            details,
            timestamp: this.getTimestamp()
        });
    }

    // Stock change logging
    logStockChange(productId, oldStock, newStock, reason) {
        this.info(`Stock change for product ${productId}`, {
            productId,
            oldStock,
            newStock,
            change: newStock - oldStock,
            reason,
            timestamp: this.getTimestamp()
        });
    }

    // Low stock alert
    logLowStockAlert(productId, currentStock, threshold = 10) {
        this.warn(`Low stock alert for product ${productId}`, {
            productId,
            currentStock,
            threshold,
            timestamp: this.getTimestamp()
        });
    }
}

module.exports = new Logger(); 
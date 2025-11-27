const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        this.currentLevel = process.env.LOG_LEVEL || 'INFO';
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        return JSON.stringify(logEntry) + '\n';
    }

    writeToFile(filename, content) {
        const filePath = path.join(this.logDir, filename);
        fs.appendFileSync(filePath, content);
    }

    shouldLog(level) {
        return this.logLevels[level] <= this.logLevels[this.currentLevel];
    }

    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Write to appropriate log file
        const today = new Date().toISOString().split('T')[0];
        this.writeToFile(`${today}.log`, formattedMessage);
        
        // Write errors to separate error log
        if (level === 'ERROR') {
            this.writeToFile(`error-${today}.log`, formattedMessage);
        }

        // Console output in development
        if (process.env.NODE_ENV !== 'production') {
            const colors = {
                ERROR: '\x1b[31m', // Red
                WARN: '\x1b[33m',  // Yellow
                INFO: '\x1b[36m',  // Cyan
                DEBUG: '\x1b[90m'  // Gray
            };
            const reset = '\x1b[0m';
            
            console.log(
                `${colors[level]}[${level}]${reset} ${new Date().toISOString()} - ${message}`,
                Object.keys(meta).length > 0 ? meta : ''
            );
        }
    }

    error(message, meta = {}) {
        this.log('ERROR', message, meta);
    }

    warn(message, meta = {}) {
        this.log('WARN', message, meta);
    }

    info(message, meta = {}) {
        this.log('INFO', message, meta);
    }

    debug(message, meta = {}) {
        this.log('DEBUG', message, meta);
    }

    // HTTP request logging
    httpLog(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || null
        };

        if (res.statusCode >= 400) {
            this.error('HTTP Error', logData);
        } else {
            this.info('HTTP Request', logData);
        }
    }

    // Database operation logging
    dbLog(operation, table, duration, error = null) {
        const logData = {
            operation,
            table,
            duration: `${duration}ms`
        };

        if (error) {
            this.error('Database Error', { ...logData, error: error.message });
        } else {
            this.debug('Database Operation', logData);
        }
    }

    // Security event logging
    securityLog(event, userId, details = {}) {
        this.warn('Security Event', {
            event,
            userId,
            ...details,
            timestamp: new Date().toISOString()
        });

        // Write to separate security log
        const today = new Date().toISOString().split('T')[0];
        const securityEntry = this.formatMessage('SECURITY', event, {
            userId,
            ...details
        });
        this.writeToFile(`security-${today}.log`, securityEntry);
    }

    // Performance monitoring
    performanceLog(operation, duration, metadata = {}) {
        const logData = {
            operation,
            duration: `${duration}ms`,
            ...metadata
        };

        if (duration > 1000) { // Log slow operations
            this.warn('Slow Operation', logData);
        } else {
            this.debug('Performance', logData);
        }
    }

    // Business logic logging
    businessLog(event, userId, details = {}) {
        this.info('Business Event', {
            event,
            userId,
            ...details
        });
    }

    // Clean old logs (call this periodically)
    cleanOldLogs(daysToKeep = 30) {
        try {
            const files = fs.readdirSync(this.logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    this.info('Log file cleaned', { file });
                }
            });
        } catch (error) {
            this.error('Failed to clean old logs', { error: error.message });
        }
    }

    // Get log statistics
    getLogStats() {
        try {
            const files = fs.readdirSync(this.logDir);
            const stats = {
                totalFiles: files.length,
                totalSize: 0,
                filesByType: {}
            };

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const fileStats = fs.statSync(filePath);
                stats.totalSize += fileStats.size;

                const type = file.includes('error') ? 'error' : 
                           file.includes('security') ? 'security' : 'general';
                
                if (!stats.filesByType[type]) {
                    stats.filesByType[type] = { count: 0, size: 0 };
                }
                
                stats.filesByType[type].count++;
                stats.filesByType[type].size += fileStats.size;
            });

            return stats;
        } catch (error) {
            this.error('Failed to get log stats', { error: error.message });
            return null;
        }
    }

    // Export logs for analysis
    exportLogs(startDate, endDate, level = null) {
        try {
            const files = fs.readdirSync(this.logDir);
            const logs = [];

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').filter(line => line.trim());

                lines.forEach(line => {
                    try {
                        const logEntry = JSON.parse(line);
                        const logDate = new Date(logEntry.timestamp);

                        if (logDate >= startDate && logDate <= endDate) {
                            if (!level || logEntry.level === level) {
                                logs.push(logEntry);
                            }
                        }
                    } catch (parseError) {
                        // Skip invalid log entries
                    }
                });
            });

            return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } catch (error) {
            this.error('Failed to export logs', { error: error.message });
            return [];
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Express middleware for HTTP logging
const httpLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.httpLog(req, res, duration);
    });
    
    next();
};

// Database middleware for query logging
const dbLogger = (operation, table) => {
    const start = Date.now();
    
    return {
        success: () => {
            const duration = Date.now() - start;
            logger.dbLog(operation, table, duration);
        },
        error: (error) => {
            const duration = Date.now() - start;
            logger.dbLog(operation, table, duration, error);
        }
    };
};

// Performance monitoring decorator
const withPerformanceLogging = (operation) => {
    return async (fn, ...args) => {
        const start = Date.now();
        try {
            const result = await fn(...args);
            const duration = Date.now() - start;
            logger.performanceLog(operation, duration, { success: true });
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            logger.performanceLog(operation, duration, { success: false, error: error.message });
            throw error;
        }
    };
};

module.exports = {
    logger,
    httpLogger,
    dbLogger,
    withPerformanceLogging
};

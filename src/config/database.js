const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        const dbPath = path.join(__dirname, '../../database/chopnow.db');
        
        // Ensure database directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                process.exit(1); // Exit the process on a fatal database error
            } else {
                console.log('Connected to SQLite database');
                this.initializeSchema();
            }
        });

        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
    }

    async initializeSchema() {
        try {
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split schema into individual statements
            const statements = schema.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.run(statement);
                }
            }
            
            console.log('Database schema initialized successfully');
        } catch (error) {
            console.error('Error initializing database schema:', error);
            throw error; // Re-throw the error to propagate the failure
        }
    }

    // Promise wrapper for database operations
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Transaction support
    async beginTransaction() {
        await this.run('BEGIN TRANSACTION');
        return {
            commit: () => this.run('COMMIT'),
            rollback: () => this.run('ROLLBACK')
        };
    }

    // Prepared statements for better performance
    prepare(sql) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        run: (params = []) => new Promise((resolve, reject) => {
                            stmt.run(params, function(err) {
                                if (err) reject(err);
                                else resolve({ lastID: this.lastID, changes: this.changes });
                            });
                        }),
                        get: (params = []) => new Promise((resolve, reject) => {
                            stmt.get(params, (err, row) => {
                                if (err) reject(err);
                                else resolve(row);
                            });
                        }),
                        all: (params = []) => new Promise((resolve, reject) => {
                            stmt.all(params, (err, rows) => {
                                if (err) reject(err);
                                else resolve(rows);
                            });
                        }),
                        finalize: () => new Promise((resolve, reject) => {
                            stmt.finalize((err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        })
                    });
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Health check
    async healthCheck() {
        try {
            await this.get('SELECT 1');
            return { status: 'healthy', message: 'Database connection is working' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }

    // Database statistics
    async getStats() {
        try {
            const tables = ['users', 'meals', 'orders', 'reviews', 'notifications'];
            const stats = {};

            for (const table of tables) {
                const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = result.count;
            }

            return stats;
        } catch (error) {
            console.error('Error getting database stats:', error);
            return {};
        }
    }

    // Backup functionality
    async backup(backupPath) {
        try {
            const dbPath = path.join(__dirname, '../../database/chopnow.db');
            fs.copyFileSync(dbPath, backupPath);
            return { success: true, message: 'Database backup created successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Vacuum database for optimization
    async vacuum() {
        try {
            await this.run('VACUUM');
            return { success: true, message: 'Database vacuumed successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Create and export database instance
const database = new Database();

module.exports = database;
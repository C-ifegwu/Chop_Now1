console.log('[DB] Loading database configuration...');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/chopnow.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

console.log(`[DB] Database path: ${dbPath}`);
console.log(`[DB] Schema path: ${schemaPath}`);

let db;
try {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('[DB] Error opening database:', err.message);
        } else {
            console.log('[DB] Connected to SQLite database.');
        }
    });
} catch (error) {
    console.error('[DB] FATAL: Could not create database instance.', error);
    process.exit(1);
}


// Ensure schema exists before handling requests
console.log('[DB] Setting up database serialization...');
db.serialize(() => {
    try {
        console.log('[DB] Reading schema file...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('[DB] Executing schema...');
        db.exec(schema, (err) => {
            if (err) {
                console.error('[DB] Error ensuring database schema:', err.message);
            } else {
                console.log('[DB] Database schema verified.');
            }
        });
    } catch (error) {
        console.warn('[DB] Unable to read or execute schema.sql.', error.message);
    }
});
console.log('[DB] Database serialization setup complete.');

// Store original methods
const originalRun = db.run.bind(db);
const originalGet = db.get.bind(db);
const originalAll = db.all.bind(db);

// Promisify database methods for easier async/await usage
db.run = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        originalRun(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

db.get = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        originalGet(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

db.all = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        originalAll(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

console.log('[DB] Database configuration loaded.');
module.exports = db;


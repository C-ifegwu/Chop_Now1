const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/chopnow.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

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

module.exports = db;


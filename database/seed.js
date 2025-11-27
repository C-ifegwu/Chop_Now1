const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'chopnow.db');
const schemaPath = path.join(__dirname, 'schema.sql');

async function initializeDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
        console.log('✓ Connected to SQLite database');
    });

    // Read schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    db.exec('PRAGMA foreign_keys = ON;' + schema, (err) => {
        if (err) {
            console.error('✗ Error executing schema:', err.message);
        } else {
            console.log('✓ Database schema initialized successfully');
            console.log('✓ Tables created: users, meals, orders, reviews, notifications');
        }
        db.close();
    });
}

initializeDatabase();


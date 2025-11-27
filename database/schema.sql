-- ChopNow Database Schema
-- Simplified SQLite Database Schema for ChopNow Food Rescue Platform

-- Users Table (Consumers and Vendors)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL,
    phone TEXT,
    name TEXT,
    business_name TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    reset_password_token TEXT,
    reset_password_expires INTEGER,
    last_login DATETIME,
    created_at DATETIME NOT NULL
);

-- Meals Table
CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    original_price REAL NOT NULL,
    discounted_price REAL NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    cuisine_type TEXT,
    pickup_options TEXT,
    pickup_times TEXT,
    allergens TEXT,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumer_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    delivery_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES users(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumer_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    vendor_response TEXT,
    response_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
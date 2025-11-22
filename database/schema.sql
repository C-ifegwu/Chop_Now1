-- ChopNow Database Schema
-- SQLite Database Schema for ChopNow Food Rescue Platform

-- Users Table (Consumers and Vendors)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('consumer', 'vendor')),
    phone TEXT,
    name TEXT,
    business_name TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    reset_password_token TEXT,
    reset_password_expires INTEGER,
    created_at TEXT NOT NULL
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumer_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES users(id),
    FOREIGN KEY (meal_id) REFERENCES meals(id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumer_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    vendor_response TEXT,
    response_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES users(id),
    FOREIGN KEY (meal_id) REFERENCES meals(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_meals_vendor_id ON meals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_meals_is_available ON meals(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_consumer_id ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_meal_id ON orders(meal_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_meal_id ON reviews(meal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_consumer_id ON reviews(consumer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);


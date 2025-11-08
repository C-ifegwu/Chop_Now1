# ChopNow Project Structure

This document explains the project structure for the ChopNow web application.

## Directory Structure

```
ChopNow/
│
├── frontend/                    # Frontend application (HTML, CSS, JavaScript)
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   ├── js/
│   │   ├── main.js             # Main application logic
│   │   └── auth.js             # Authentication functions
│   ├── images/                 # Image assets (meal photos, logos)
│   ├── index.html              # Home page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── browse.html             # Meal browsing page
│   ├── consumer-dashboard.html # Consumer dashboard
│   └── vendor-dashboard.html   # Vendor dashboard
│
├── backend/                     # Backend API server
│   ├── config/
│   │   └── database.js         # Database connection and configuration
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes (login, register)
│   │   ├── meals.js            # Meal listing routes
│   │   ├── orders.js           # Order management routes
│   │   └── reviews.js          # Review and rating routes
│   ├── server.js               # Main server file
│   ├── package.json            # Node.js dependencies
│   └── .env.example            # Environment variables template
│
├── database/                    # Database files
│   ├── schema.sql              # Database schema (tables, indexes)
│   ├── init.js                 # Database initialization script
│   └── chopnow.db             # SQLite database file (created after init)
│
├── docs/                        # Documentation
│   └── API_DOCUMENTATION.md    # API endpoint documentation
│
├── .gitignore                   # Git ignore file
├── README.md                    # Project README
└── SRS_Document                 # Software Requirements Specification
```

## Component Descriptions

### Frontend (`frontend/`)
- **HTML Files**: Contains all web pages for the application
- **CSS**: Styling for the entire application
- **JavaScript**: Client-side logic for API calls and UI interactions

### Backend (`backend/`)
- **Routes**: API endpoints organized by feature (auth, meals, orders, reviews)
- **Middleware**: Authentication and authorization logic
- **Config**: Database connection and configuration
- **Server.js**: Main entry point that sets up Express server and routes

### Database (`database/`)
- **schema.sql**: SQL statements to create all tables
- **init.js**: Script to initialize the database
- Database file will be created automatically when you run the init script

## Key Features Implemented

1. **User Authentication** (FR1.1 - FR1.8)
   - Registration for consumers and vendors
   - Login with JWT tokens
   - Profile management

2. **Meal Listing & Discovery** (FR2.1 - FR2.8)
   - Vendors can create meal listings
   - Consumers can browse and search meals
   - Filter by cuisine, price, location

3. **Order Management** (FR3.1 - FR3.11)
   - Add to cart functionality
   - Order placement
   - Order status tracking
   - Vendor order management

4. **Reviews & Ratings** (FR5.1 - FR5.5)
   - Consumers can rate and review meals
   - Vendors can respond to reviews

## Next Steps for Development

1. **Set up the project**:
   ```bash
   cd backend
   npm install
   ```

2. **Initialize database**:
   ```bash
   cd database
   node init.js
   ```

3. **Start backend server**:
   ```bash
   cd backend
   npm start
   ```

4. **Open frontend**:
   - Open `frontend/index.html` in a web browser
   - Or use a local server (e.g., `python -m http.server` in frontend folder)

5. **Features to add**:
   - Payment integration (Paystack, M-Pesa)
   - Image upload for meals
   - Real-time notifications
   - Location-based services
   - Email verification

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens)


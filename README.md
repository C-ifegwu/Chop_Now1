# ChopNow - Food Rescue Platform 🍽️

ChopNow is a comprehensive web application designed to reduce food waste and improve access to affordable meals across Africa by connecting local food vendors, restaurants, and consumers.

🌐 **Live Application**: [https://chopnow1-production.up.railway.app](https://chopnow1-production.up.railway.app)

## 🌟 Features

### For Consumers
- **Browse Meals**: Discover discounted meals from local vendors
- **Advanced Filtering**: Filter by cuisine, price, dietary restrictions, and location
- **Shopping Cart**: Add meals to cart and manage quantities
- **Secure Checkout**: Complete orders with multiple payment options
- **Real-time Updates**: Get instant notifications about meal availability
- **Order Tracking**: Track your orders from placement to pickup
- **Reviews & Ratings**: Rate and review meals and vendors

### For Vendors
- **Meal Management**: List, update, and manage your available meals
- **Order Management**: Accept, reject, and track customer orders
- **Analytics Dashboard**: View sales performance and customer insights
- **Real-time Notifications**: Get instant alerts for new orders
- **Profile Management**: Manage business information and settings
- **Review Responses**: Respond to customer reviews

### Platform Features
- **Real-time Communication**: WebSocket-powered live updates
- **Mobile-first Design**: Responsive design optimized for mobile devices
- **Security**: Enterprise-grade security with JWT authentication
- **Performance**: Optimized for fast loading and smooth user experience
- **Scalability**: Built to handle growing user base and transaction volume

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14.0.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)
- **SQLite3** - Usually comes with Node.js, but can be installed separately if needed

### Verify Installation

Check if you have the required tools installed:

```bash
node --version    # Should show v14.0.0 or higher
npm --version     # Should show v6.0.0 or higher
git --version     # Should show Git version
```

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/Chop_Now1-2.git

# Navigate to the project directory
cd Chop_Now1-2
```

**Note**: Replace `your-username` with your actual GitHub username or the repository URL.

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install all required packages listed in `package.json`. This may take a few minutes.

**Expected output**: You should see a list of installed packages and a message indicating successful installation.

### Step 3: Set Up Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp env.example .env
   ```

2. **Open the `.env` file** in your text editor:
   ```bash
   # On Windows (using Notepad)
   notepad .env
   
   # On Mac/Linux
   nano .env
   # or
   code .env  # If you have VS Code
   ```

3. **Configure the required environment variables**:

   **Minimum Required Configuration** (for local development):
   ```env
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this-minimum-32-characters-long
   SESSION_SECRET=your-session-secret-change-this-minimum-32-characters-long
   ```

   **Generate secure secrets** (optional but recommended):
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the generated strings and paste them into your `.env` file.

4. **Optional Configuration** (can be configured later):
   - Email settings (for password reset functionality)
   - Payment gateway keys (Paystack, Stripe)
   - Google Maps API key (for location services)

### Step 4: Initialize the Database

```bash
# Initialize the database schema and seed with sample data
npm run db:init
```

This command will:
- Create the SQLite database file (`database/chopnow.db`)
- Create all necessary tables (users, meals, orders, reviews, etc.)
- Seed the database with sample data (test users, meals, etc.)

**Expected output**: 
```
Connected to SQLite database
Database schema initialized successfully
Database seeded successfully
```

**Note**: If you see any errors, make sure the `database/` directory exists and you have write permissions.

### Step 5: Start the Development Server

```bash
# Start the server in development mode (with auto-reload)
npm run dev
```

**Alternative**: Start in production mode:
```bash
npm start
```

**Expected output**:
```
🚀 ChopNow server running on port 3001
📱 Frontend available at http://localhost:3001
🔌 WebSocket server ready for real-time connections
📚 API documentation at http://localhost:3001/api/docs
❤️  Health check at http://localhost:3001/api/health
```

### Step 6: Access the Application

Open your web browser and navigate to:

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **API Documentation**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## 🧪 Testing the Application

### Test User Accounts

After running `npm run db:init`, you can use these pre-configured test accounts:

#### **Vendor Accounts:**
- **Email**: `mama.kitchen@example.com`
- **Password**: `password123`
- **User Type**: Vendor

- **Email**: `sunrise.bakery@example.com`
- **Password**: `password123`
- **User Type**: Vendor

#### **Consumer Accounts:**
- **Email**: `student@example.com`
- **Password**: `password123`
- **User Type**: Consumer

- **Email**: `worker@example.com`
- **Password**: `password123`
- **User Type**: Consumer

### Testing the Flow

1. **As a Consumer**:
   - Go to [http://localhost:3001](http://localhost:3001)
   - Click "Get Started" or "Sign In"
   - Select "Customer" login type
   - Log in with `student@example.com` / `password123`
   - Browse meals at [http://localhost:3001/meals.html](http://localhost:3001/meals.html)
   - Add meals to cart
   - Proceed to checkout

2. **As a Vendor**:
   - Go to [http://localhost:3001/login.html](http://localhost:3001/login.html)
   - Select "Vendor" login type
   - Log in with `mama.kitchen@example.com` / `password123`
   - Access vendor dashboard at [http://localhost:3001/vendor-dashboard.html](http://localhost:3001/vendor-dashboard.html)
   - Add new meals
   - Manage orders

## 📁 Project Structure

```
Chop_Now1-2/
├── frontend/                 # Frontend static files
│   ├── index.html           # Home page
│   ├── login.html           # Login page (with vendor/customer selection)
│   ├── register.html        # Registration page
│   ├── meals.html           # Meal browsing page
│   ├── meal-details.html    # Meal details page
│   ├── cart.html            # Shopping cart
│   ├── consumer-dashboard.html # Consumer dashboard
│   ├── vendor-dashboard.html   # Vendor dashboard
│   ├── forgot-password.html    # Password recovery
│   ├── reset-password.html     # Password reset
│   ├── profile.html         # User profile page
│   ├── style.css           # Main stylesheet
│   └── script.js            # Main JavaScript file
├── src/                     # Backend source code
│   ├── config/              # Configuration files
│   │   └── database.js      # Database configuration
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── security.js     # Security middleware
│   │   ├── upload.js       # File upload middleware
│   │   └── validation.js   # Input validation middleware
│   ├── routes/              # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── meals.js         # Meal management routes
│   │   ├── cart.js          # Cart management routes
│   │   ├── checkout.js      # Checkout routes
│   │   ├── orders.js        # Order management routes
│   │   ├── reviews.js       # Review system routes
│   │   └── notifications.js # Notification routes
│   ├── services/            # Business logic services
│   │   ├── email.js         # Email service
│   │   ├── payment.service.js # Payment processing
│   │   └── notification.service.js # Notification service
│   ├── utils/               # Utility functions
│   │   └── logger.js        # Logging utility
│   └── server.js            # Main server file
├── database/                # Database files
│   ├── schema.sql           # Database schema
│   ├── seed.js              # Database seeding script
│   └── chopnow.db           # SQLite database (generated)
├── uploads/                 # File uploads directory (created automatically)
├── package.json             # Node.js dependencies
├── env.example              # Environment variables template
├── railway.toml             # Railway deployment configuration
└── README.md                # This file
```

## 🔧 Configuration Details

### Environment Variables

The application uses environment variables for configuration. Here are the key variables:

#### **Required for Basic Operation:**
- `NODE_ENV`: Environment mode (`development` or `production`)
- `PORT`: Server port (default: `3001`)
- `JWT_SECRET`: Secret key for JWT token generation (minimum 32 characters)
- `SESSION_SECRET`: Secret key for session management (minimum 32 characters)

#### **Optional (for full functionality):**
- `EMAIL_USER`: SMTP email username (for password reset emails)
- `EMAIL_PASS`: SMTP email password
- `PAYSTACK_SECRET_KEY`: Paystack payment gateway key
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (for location services)
- `SERVICE_FEE_PERCENTAGE`: Platform service fee (default: 0.05 = 5%)
- `DELIVERY_FEE`: Default delivery fee (default: 200)

### Database Configuration

The application uses **SQLite** for development, which is perfect for local testing. The database file is created automatically in the `database/` directory.

**Important Notes:**
- The database file (`chopnow.db`) is in `.gitignore` and won't be committed
- For production deployment, consider using PostgreSQL (see Deployment section)
- The database schema is automatically initialized on first run

## 🛠️ Available Scripts

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Initialize database (create schema and seed data)
npm run db:init

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Security audit
npm run security:audit

# Fix security vulnerabilities
npm run security:fix
```

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:3001/api`
- **Production**: `https://chopnow1-production.up.railway.app/api`

### Authentication Endpoints
- `POST /api/auth/register` - Register new user (consumer or vendor)
- `POST /api/auth/login` - User login (requires user type: consumer or vendor)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Meal Management Endpoints
- `GET /api/meals` - Get all available meals (public, supports filtering)
- `GET /api/meals/:id` - Get meal by ID (public)
- `POST /api/meals` - Create new meal (vendor only)
- `PUT /api/meals/:id` - Update meal (vendor only)
- `DELETE /api/meals/:id` - Delete meal (vendor only)

### Cart Management Endpoints (Consumer only)
- `GET /api/cart` - Get user's cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Checkout Endpoints (Consumer only)
- `GET /api/checkout/summary` - Get checkout summary
- `POST /api/checkout/create-order` - Create order from cart

### Order Management Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (vendor only)

### Review System Endpoints
- `GET /api/reviews/meal/:mealId` - Get meal reviews
- `POST /api/reviews` - Create review (consumer only)
- `PUT /api/reviews/:id/response` - Respond to review (vendor only)

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🚀 Deployment

### Deploying to Railway

The project is configured for Railway deployment. Here's how to deploy:

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project** and connect your GitHub repository

3. **Add environment variables** in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=3001` (or let Railway assign automatically)
   - `JWT_SECRET` - Generate a secure secret (see Step 3)
   - `SESSION_SECRET` - Generate a secure secret (see Step 3)
   - `SERVICE_FEE_PERCENTAGE=0.05` (optional)
   - `DELIVERY_FEE=200` (optional)

4. **Deploy**: Railway will automatically detect the Node.js project and deploy it

5. **Access your app**: Railway will provide a URL like `https://your-app.up.railway.app`

**Important Notes for Production:**
- The SQLite database will be reset on each deployment (ephemeral filesystem)
- For production, consider using Railway's PostgreSQL addon for persistent data
- Make sure all environment variables are set in Railway dashboard
- The `uploads/` directory is also ephemeral - consider using cloud storage (S3, Cloudinary) for production

### Deploying to Other Platforms

#### Heroku
1. Create a `Procfile` with: `web: node src/server.js`
2. Set environment variables in Heroku dashboard
3. Deploy using Git or Heroku CLI

#### Vercel / Netlify
- These platforms are better suited for static sites
- Consider deploying only the frontend to Vercel/Netlify
- Deploy the backend separately to Railway, Heroku, or a VPS

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive input sanitization using Joi
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF protection for forms

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: `Error: Cannot find module 'express'`
**Solution**: Run `npm install` to install all dependencies

#### Issue: `Error: listen EADDRINUSE: address already in use`
**Solution**: 
- The port is already in use. Either:
  - Stop the other process using port 3001
  - Change the PORT in your `.env` file to a different port (e.g., 3002)

#### Issue: `Error: FATAL ERROR: JWT_SECRET is not defined`
**Solution**: 
- Make sure you've created a `.env` file from `env.example`
- Add `JWT_SECRET` and `SESSION_SECRET` to your `.env` file
- Restart the server

#### Issue: Database errors or "table does not exist"
**Solution**: 
- Run `npm run db:init` to initialize the database
- Make sure the `database/` directory exists and is writable

#### Issue: Cannot add items to cart
**Solution**: 
- Make sure you're logged in as a **Consumer** (not Vendor)
- Check browser console for error messages
- Verify the API endpoint is accessible

#### Issue: Checkout fails
**Solution**: 
- Ensure you're logged in as a Consumer
- Make sure your cart has items
- Check that the database connection is working
- Review server logs for detailed error messages

#### Issue: Images not uploading
**Solution**: 
- Check that the `uploads/` directory exists and is writable
- Verify file size is under 5MB
- Ensure file type is jpeg, jpg, png, gif, or webp

### Getting Help

If you encounter issues not listed here:

1. **Check the logs**: Look at the terminal output for error messages
2. **Check browser console**: Open Developer Tools (F12) and check for JavaScript errors
3. **Verify environment variables**: Make sure all required variables are set
4. **Check database**: Ensure the database is initialized and accessible
5. **Review API documentation**: Visit `/api/docs` for endpoint details

## 📊 Monitoring & Logging

### Application Logs
- **Location**: Console output (development)
- **Levels**: ERROR, WARN, INFO, DEBUG
- **Format**: Structured JSON logs in production

### Health Monitoring
- **Endpoint**: `/api/health`
- **Metrics**: Database status, uptime, memory usage
- **Access**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Test your changes locally before submitting

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with Express.js and modern web technologies
- Inspired by the UN Sustainable Development Goals
- Designed for the African market with local payment integrations
- Community-driven approach to reducing food waste

## 📞 Support & Resources

- **Live Application**: [https://chopnow1-production.up.railway.app](https://chopnow1-production.up.railway.app)
- **API Documentation**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs) (when running locally)
- **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health) (when running locally)
- **GitHub Issues**: [Report Issues](https://github.com/your-username/Chop_Now1-2/issues)

---

**Made with ❤️ for a sustainable future**

*ChopNow - Connecting communities, reducing waste, one meal at a time.*

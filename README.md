# ChopNow - Food Rescue Platform 🍽️

ChopNow is a comprehensive web application designed to reduce food waste and improve access to affordable meals across Africa by connecting local food vendors, restaurants, and consumers.

## 🌟 Features

### For Consumers
- **Browse Meals**: Discover discounted meals from local vendors
- **Advanced Filtering**: Filter by cuisine, price, dietary restrictions, and location
- **Real-time Updates**: Get instant notifications about meal availability
- **Secure Payments**: Multiple payment options including mobile money and cards
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

## 🚀 Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- SQLite3

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chopnow/chopnow-platform.git
   cd chopnow-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/health

## 📁 Project Structure

```
chopnow-platform/
├── frontend/                 # Frontend static files
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── meals.html           # Meal browsing page
│   ├── meal-details.html    # Meal details page
│   ├── cart.html            # Shopping cart
│   ├── consumer-dashboard.html # Consumer dashboard
│   ├── vendor-dashboard.html   # Vendor dashboard
│   ├── forgot-password.html    # Password recovery
│   ├── reset-password.html     # Password reset
│   ├── style.css            # Main stylesheet
│   └── script.js            # Main JavaScript file
├── src/                     # Backend source code
│   ├── config/              # Configuration files
│   │   └── database.js      # Database configuration
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # Authentication middleware
│   │   ├── security.js      # Security middleware
│   │   ├── upload.js        # File upload middleware
│   │   └── validation.js    # Input validation middleware
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── meals.js         # Meal management routes
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
├── uploads/                 # File uploads directory
├── logs/                    # Application logs
├── tests/                   # Test files
├── package.json             # Node.js dependencies
├── env.example              # Environment variables template
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure the following:

#### Required Configuration
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_USER`: SMTP email username
- `EMAIL_PASS`: SMTP email password

#### Optional Configuration
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `PAYSTACK_SECRET_KEY`: Paystack payment gateway key
- `GOOGLE_MAPS_API_KEY`: Google Maps API key

### Database Configuration

The application uses SQLite for development and can be configured for PostgreSQL in production. The database schema is automatically initialized on first run.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Meal Management Endpoints
- `GET /api/meals` - Get all meals (with filtering)
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create new meal (vendor only)
- `PUT /api/meals/:id` - Update meal (vendor only)
- `DELETE /api/meals/:id` - Delete meal (vendor only)

### Order Management Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (vendor only)

### Review System Endpoints
- `GET /api/reviews/meal/:mealId` - Get meal reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id/response` - Respond to review (vendor only)

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🧪 Testing

### Sample User Accounts

After running `npm run db:init`, you can use these test accounts:

**Vendors:**
- Email: `mama.kitchen@example.com` | Password: `password123`
- Email: `sunrise.bakery@example.com` | Password: `password123`
- Email: `spice.garden@example.com` | Password: `password123`

**Consumers:**
- Email: `student@example.com` | Password: `password123`
- Email: `worker@example.com` | Password: `password123`

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and CSP headers

## 🚀 Deployment

### Production Deployment

1. **Set environment to production**
   ```bash
   export NODE_ENV=production
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Set up production database**
   ```bash
   # Configure PostgreSQL connection in .env
   npm run db:init
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Application Logs
- **Location**: `./logs/` directory
- **Rotation**: Daily log files with automatic cleanup
- **Levels**: ERROR, WARN, INFO, DEBUG

### Health Monitoring
- **Endpoint**: `/api/health`
- **Metrics**: Database status, uptime, memory usage
- **Alerts**: Configurable for production monitoring

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

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Express.js and modern web technologies
- Inspired by the UN Sustainable Development Goals
- Designed for the African market with local payment integrations
- Community-driven approach to reducing food waste

## 📞 Support

- **Documentation**: [API Docs](http://localhost:3000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/chopnow/chopnow-platform/issues)
- **Email**: support@chopnow.com

---

**Made with ❤️ for a sustainable future**

*ChopNow - Connecting communities, reducing waste, one meal at a time.*
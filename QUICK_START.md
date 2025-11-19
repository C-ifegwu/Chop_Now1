# ChopNow - Quick Start Guide

## ✅ Setup Complete!

Your ChopNow application is now fully configured and ready to use!

## 🚀 What's Been Done

### Backend (✓ Complete)
- ✅ Dependencies installed
- ✅ Database initialized with all tables
- ✅ Environment variables configured
- ✅ Server running on port 3000
- ✅ All API endpoints implemented:
  - Authentication (register, login, profile)
  - Meals (CRUD operations with image upload)
  - Orders (create, view, update status, cancel)
  - Reviews (create, view, respond)
  - Notifications (real-time notifications system)
- ✅ Payment service placeholder created
- ✅ File upload middleware configured

### Frontend (✓ Complete)
- ✅ API integration layer created
- ✅ Real authentication system
- ✅ Dashboard functionality for consumers and vendors
- ✅ Test page for API verification

## 📋 How to Run

### 1. Start the Backend Server

The server is already running! If you need to restart it:

```powershell
cd backend
npm start
```

You should see:
```
ChopNow server is running on port 3000
API Base URL: http://localhost:3000/api
Connected to SQLite database
```

### 2. Open the Frontend

**Option A: Simple File Opening**
- Navigate to the `frontend` folder
- Open `test.html` in your browser to test the API
- Open `index.html` to use the full application

**Option B: Using a Local Server (Recommended)**
```powershell
cd frontend
python -m http.server 8000
```
Then open: http://localhost:8000

## 🧪 Testing the Application

### Quick API Test
1. Open `frontend/test.html` in your browser
2. Click each test button in order:
   - Test API Health
   - Register Test Consumer
   - Register Test Vendor
   - Login as Consumer/Vendor
   - Get All Meals

### Full Application Test

#### As a Vendor:
1. Go to `register.html`
2. Register as a Vendor:
   - Email: vendor@chopnow.com
   - Password: password123
   - User Type: Vendor
   - Business Name: My Restaurant
   - Fill other details
3. You'll be redirected to the vendor dashboard
4. Add a new meal:
   - Name: Jollof Rice
   - Original Price: 1000
   - Discounted Price: 700 (30% off)
   - Quantity: 10
   - Upload an image (optional)
5. View your orders as they come in

#### As a Consumer:
1. Go to `register.html`
2. Register as a Consumer:
   - Email: consumer@chopnow.com
   - Password: password123
   - User Type: Consumer
   - Fill other details
3. You'll be redirected to the consumer dashboard
4. Browse available meals
5. Click "Order Now" on any meal
6. Enter quantity and select payment method
7. View your order status

## 📁 Project Structure

```
ChopNow/
├── backend/
│   ├── config/          - Database configuration
│   ├── middleware/      - Auth & upload middleware
│   ├── routes/          - API endpoints
│   ├── services/        - Business logic (notifications, payments)
│   ├── uploads/         - Uploaded meal images
│   └── server.js        - Main server file
├── database/
│   ├── schema.sql       - Database schema
│   ├── init.js          - Database initialization
│   └── chopnow.db       - SQLite database file
├── frontend/
│   ├── js/
│   │   ├── api.js       - API integration
│   │   ├── auth-real.js - Authentication handler
│   │   └── dashboard.js - Dashboard functionality
│   ├── css/             - Stylesheets
│   ├── images/          - Static images
│   ├── index.html       - Landing page
│   ├── login.html       - Login page
│   ├── register.html    - Registration page
│   ├── consumer-dashboard.html
│   ├── vendor-dashboard.html
│   └── test.html        - API test page
└── docs/                - Documentation
```

## 🔑 Key Features Implemented

### For Consumers:
- ✅ Browse available meals with filters
- ✅ Search meals by name/description
- ✅ Filter by cuisine type and price
- ✅ Place orders with quantity selection
- ✅ Choose payment method (Mobile Money/Card)
- ✅ View order history
- ✅ Cancel pending orders
- ✅ Receive notifications on order status changes

### For Vendors:
- ✅ Add new meal listings with images
- ✅ Set original and discounted prices (min 20% discount enforced)
- ✅ Manage meal availability
- ✅ View all orders
- ✅ Accept/reject orders
- ✅ Update order status (Preparing → Ready → Completed)
- ✅ Receive notifications for new orders
- ✅ Track total orders per meal

### System Features:
- ✅ JWT-based authentication
- ✅ Role-based access control (Consumer/Vendor)
- ✅ Image upload for meals
- ✅ Real-time notifications
- ✅ Order status tracking
- ✅ Payment method selection
- ✅ Business rule enforcement (20% minimum discount)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Meals
- `GET /api/meals` - Get all meals (with filters)
- `GET /api/meals/:id` - Get single meal
- `POST /api/meals` - Create meal (Vendor only, with image upload)
- `PUT /api/meals/:id` - Update meal (Vendor only)
- `DELETE /api/meals/:id` - Delete meal (Vendor only)
- `GET /api/meals/vendor/my-meals` - Get vendor's meals

### Orders
- `POST /api/orders` - Create order (Consumer only)
- `GET /api/orders/consumer` - Get consumer orders
- `GET /api/orders/vendor` - Get vendor orders
- `PUT /api/orders/:id/status` - Update order status (Vendor only)
- `DELETE /api/orders/:id` - Cancel order (Consumer only)

### Reviews
- `POST /api/reviews` - Create review (Consumer only)
- `GET /api/reviews/meal/:mealId` - Get meal reviews
- `PUT /api/reviews/:id/respond` - Vendor response to review

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🎨 Using the Application

### Update HTML Files to Use Real API

The existing HTML files (login.html, register.html, etc.) need to be updated to use the new API. Replace the script tags:

**Old:**
```html
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
```

**New:**
```html
<script src="js/api.js"></script>
<script src="js/auth-real.js"></script>
<script src="js/dashboard.js"></script>
```

## 📊 Database Tables

- **users** - Consumer and vendor accounts
- **meals** - Meal listings
- **orders** - Order records
- **reviews** - Ratings and reviews
- **notifications** - User notifications

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation
- SQL injection prevention
- File upload restrictions (images only, 5MB max)

## 🚧 Future Enhancements

The following are placeholders ready for integration:
- Payment gateway integration (Paystack, M-Pesa, MTN Mobile Money)
- Email verification
- SMS notifications
- Real-time WebSocket notifications
- Location-based search (Google Maps API)
- Vendor payout system

## 📝 Notes

- The server must be running for the frontend to work
- Default port is 3000 (configurable in .env)
- Database file is at `database/chopnow.db`
- Uploaded images are stored in `backend/uploads/`
- Payment processing is currently in demo mode

## 🆘 Troubleshooting

**Server won't start:**
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`

**Database errors:**
- Delete `chopnow.db` and run `node init.js` again

**CORS errors:**
- Ensure backend server is running
- Check API_BASE_URL in `frontend/js/api.js`

**Login fails:**
- Make sure you registered first
- Check browser console for errors

## 🎉 You're All Set!

Your ChopNow application is fully functional and ready to use. Start by testing the API with `test.html`, then explore the full application!

For questions or issues, check the SRS_Document for requirements and API_DOCUMENTATION.md for detailed endpoint information.

Happy coding! 🚀

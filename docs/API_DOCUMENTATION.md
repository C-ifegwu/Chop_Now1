# ChopNow API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "consumer" | "vendor",
  "phone": "1234567890",
  "name": "John Doe",
  "businessName": "Restaurant Name" (for vendors),
  "address": "123 Main St"
}
```

#### Login
```
POST /api/auth/login
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/profile
```
Headers: `Authorization: Bearer <token>`

### Meals

#### Get All Meals
```
GET /api/meals?cuisine=african&maxPrice=10&search=pizza
```

#### Get Single Meal
```
GET /api/meals/:id
```

#### Create Meal (Vendor only)
```
POST /api/meals
```
Body:
```json
{
  "name": "Jollof Rice",
  "description": "Delicious Nigerian jollof rice",
  "originalPrice": 15.00,
  "discountedPrice": 10.00,
  "quantityAvailable": 20,
  "cuisineType": "african",
  "pickupOptions": "pickup",
  "pickupTimes": "12:00-14:00",
  "allergens": "gluten, dairy"
}
```

### Orders

#### Create Order (Consumer only)
```
POST /api/orders
```
Body:
```json
{
  "mealId": 1,
  "quantity": 2,
  "paymentMethod": "mobile_money"
}
```

#### Get Consumer Orders
```
GET /api/orders/consumer
```

#### Get Vendor Orders
```
GET /api/orders/vendor
```

#### Update Order Status (Vendor only)
```
PUT /api/orders/:id/status
```
Body:
```json
{
  "status": "accepted" | "preparing" | "ready" | "completed"
}
```

### Reviews

#### Create Review (Consumer only)
```
POST /api/reviews
```
Body:
```json
{
  "mealId": 1,
  "rating": 5,
  "comment": "Great meal!"
}
```

#### Get Meal Reviews
```
GET /api/reviews/meal/:mealId
```


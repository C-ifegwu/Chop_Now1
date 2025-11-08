# Mock Data System Guide

## Overview

The ChopNow application uses a comprehensive mock data system that simulates real API behavior without requiring a backend server. This allows the application to work perfectly for demonstration purposes.

## Mock Data Files

### `frontend/js/mockData.js`

This file contains:
- **Mock Users**: Sample consumer and vendor accounts
- **Mock Meals**: 6 sample meal listings with full details
- **Mock Orders**: Sample orders for both consumers and vendors
- **Mock Reviews**: Sample reviews and ratings
- **Mock API**: Functions that simulate API calls with delays

## Test Accounts

### Consumer Account
- **Email**: `consumer@chopnow.com`
- **Password**: `password123`

### Vendor Account
- **Email**: `vendor@chopnow.com`
- **Password**: `password123`

## How It Works

1. **No Backend Required**: All data is stored in JavaScript objects
2. **Realistic Delays**: API calls simulate network delays (400-1000ms)
3. **Persistent Storage**: Uses localStorage for session management
4. **Full Functionality**: All features work exactly as they would with a real API

## Features That Work

✅ User Authentication (Login/Register)  
✅ Meal Browsing & Search  
✅ Filtering by cuisine and price  
✅ Order Management  
✅ Vendor Dashboard  
✅ Consumer Dashboard  
✅ Order Status Updates  
✅ Meal Creation (Vendors)  
✅ Statistics & Analytics  

## Data Flow

1. User actions trigger mock API functions
2. Functions simulate network delay
3. Data is retrieved from mock objects
4. UI updates with the data
5. Changes are stored in localStorage (for session persistence)

## Adding More Mock Data

To add more mock data, edit `frontend/js/mockData.js`:

```javascript
// Add more meals
mockMeals.push({
    id: 7,
    vendor_id: 2,
    name: 'New Meal',
    // ... other properties
});

// Add more orders
mockOrders.push({
    id: 4,
    // ... order properties
});
```

## Notes

- All prices are in Nigerian Naira (NGN)
- Mock data persists only during the session
- Refreshing the page resets mock data to initial state
- localStorage maintains login state across page refreshes


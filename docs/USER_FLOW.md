# ChopNow User Flow

This document describes the user flow and navigation structure of the ChopNow web application.

## Application Flow

```
┌─────────────────┐
│  Landing Page   │ ← Entry Point (index.html)
│   (Marketing)   │
└────────┬────────┘
         │
         ├───→ Browse Meals (browse.html) - Public access
         │
         ├───→ Login (login.html)
         │         │
         │         └───→ Consumer Dashboard (consumer-dashboard.html)
         │         └───→ Vendor Dashboard (vendor-dashboard.html)
         │
         └───→ Register (register.html)
                   │
                   └───→ Consumer Dashboard (consumer-dashboard.html)
                   └───→ Vendor Dashboard (vendor-dashboard.html)
```

## Page Descriptions

### 1. Landing Page (`index.html`)
**Purpose**: Marketing homepage that introduces ChopNow to visitors

**Features**:
- Hero section with main value proposition
- "How It Works" section
- Benefits showcase
- About/Mission section
- Call-to-action buttons
- Featured meals preview

**User Actions**:
- Click "Get Started" → Goes to Register page
- Click "Login" → Goes to Login page
- Click "Browse Meals" → Goes to Browse page (public)
- Navigate through sections using anchor links

**Access**: Public (no authentication required)

---

### 2. Login Page (`login.html`)
**Purpose**: Authenticate existing users

**Features**:
- Email and password login form
- Link to registration page
- Link back to home

**User Flow**:
- User enters credentials → Authenticated → Redirected to appropriate dashboard
- If already logged in → Automatically redirected to dashboard

**Access**: Public, but redirects if already authenticated

---

### 3. Register Page (`register.html`)
**Purpose**: Create new user accounts (Consumer or Vendor)

**Features**:
- User type selection (Consumer/Vendor)
- Registration form with conditional fields
- Business name field (shown only for vendors)
- Link to login page

**User Flow**:
- User selects type and fills form → Account created → Redirected to login
- After registration, user logs in → Redirected to appropriate dashboard

**Access**: Public

---

### 4. Browse Meals (`browse.html`)
**Purpose**: Public meal browsing with search and filters

**Features**:
- Search functionality
- Filter by cuisine type
- Display available meals
- View meal details

**User Actions**:
- Can browse meals without login
- To place orders, user must login
- Click "Get Started" → Goes to Register page

**Access**: Public (browsing), Login required for ordering

---

### 5. Consumer Dashboard (`consumer-dashboard.html`)
**Purpose**: Consumer's personal dashboard

**Features**:
- View order history
- View profile information
- Access to browse and order meals

**User Actions**:
- View past and current orders
- Navigate to browse meals
- Logout

**Access**: Requires Consumer authentication

---

### 6. Vendor Dashboard (`vendor-dashboard.html`)
**Purpose**: Vendor's business dashboard

**Features**:
- Create new meal listings
- View and manage orders
- View existing meal listings
- Update order status

**User Actions**:
- Add meal listings
- Accept/reject orders
- Update order status (preparing, ready, completed)
- Logout

**Access**: Requires Vendor authentication

---

## Navigation Flow

### For New Visitors:
1. **Landing Page** → Browse meals OR Register/Login
2. **Register** → Create account → Login → Dashboard
3. **Login** → Enter credentials → Dashboard

### For Returning Users:
1. **Landing Page** → Click Login → Dashboard
2. **Direct Login** → Dashboard

### For Authenticated Users:
- Automatically redirected to dashboard if they try to access login/register pages
- Can logout from dashboard and return to landing page

## Authentication States

### Public Pages (No Auth Required):
- `index.html` (Landing Page)
- `browse.html` (Browse Meals - viewing only)
- `login.html` (Login Page)
- `register.html` (Registration Page)

### Protected Pages (Auth Required):
- `consumer-dashboard.html` (Consumer only)
- `vendor-dashboard.html` (Vendor only)

## User Type Routing

- **Consumer**: After login → `consumer-dashboard.html`
- **Vendor**: After login → `vendor-dashboard.html`

## Design Principles

1. **Clear Entry Point**: Landing page is the first thing users see
2. **Progressive Disclosure**: Public browsing available, login required for actions
3. **Contextual Navigation**: Navbar adapts based on authentication state
4. **Seamless Flow**: Easy movement between pages with clear CTAs


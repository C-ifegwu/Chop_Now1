# ChopNow - Africa's Food Rescue Platform

A web application that connects local food vendors with consumers to reduce food waste and provide affordable meals.

## Project Structure

```
ChopNow/
├── frontend/          # Frontend application (HTML, CSS, JavaScript)
├── backend/          # Backend API server (Node.js/Express)
├── database/         # Database schemas and migrations
├── docs/            # Documentation files
└── config/          # Configuration files
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite (for development) or PostgreSQL (for production)

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Set up the database:
```bash
cd database
# Run the schema.sql file to create tables
```

3. Start the backend server:
```bash
cd backend
npm start
```

4. Open the frontend:
```bash
cd frontend
# Open index.html in a browser or use a local server
```

## Features

- User Authentication (Consumer & Vendor)
- Meal Listing & Discovery
- Order Placement & Management
- Payment Processing
- Rating & Review System
- Notifications

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite (dev) / PostgreSQL (production)
- Authentication: JWT


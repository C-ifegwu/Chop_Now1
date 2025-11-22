# ChopNow - Africa's Food Rescue Platform

A web application that connects local food vendors with consumers to reduce food waste and provide affordable meals.

## Project Structure

The project has a monolithic structure where the Node.js backend serves the frontend application.

```
ChopNow/
├── frontend/        # Frontend assets (HTML, CSS, JavaScript)
├── database/        # Database schema and initialization files
├── routes/          # API route definitions
├── config/          # Configuration files (database, etc.)
├── server.js        # Main Express.js server file
└── package.json     # Node.js project file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Setup

1. **Install Dependencies:**
   Run this command in the root directory to install all backend dependencies:
   ```bash
   npm install
   ```

2. **Database Setup:**
   The application uses a SQLite database. The database file `database/chopnow.db` will be created automatically when the server starts for the first time, based on the `database/schema.sql` file.

3. **Start the Server:**
   ```bash
   npm start
   ```
   The server will start, and you can access the application by navigating to `http://localhost:3000` in your browser.

## Map View Feature: Adding Coordinates

To enable the map view, you need to add latitude and longitude coordinates to your vendor records in the database.

You can use an online tool like [latlong.net](https://www.latlong.net/) to find the coordinates for an address.

Once you have the coordinates, you can update a vendor's location in the database using a SQL command like this:

```sql
UPDATE users
SET 
  latitude = 9.0765, 
  longitude = 7.3986
WHERE id = 2; -- Replace with the actual vendor's user ID
```

## Technology Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript
- **Database:** SQLite
- **Authentication:** JWT


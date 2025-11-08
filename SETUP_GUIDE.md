# ChopNow Setup Guide

This guide will help you set up and run the ChopNow web application.

## Prerequisites

Before you begin, make sure you have installed:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A text editor (VS Code, Sublime Text, etc.)
- A web browser (Chrome, Firefox, Edge)

## Step 1: Install Backend Dependencies

1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install all required packages:
   ```bash
   npm install
   ```

This will install:
- Express.js (web framework)
- SQLite3 (database)
- JWT (authentication)
- bcryptjs (password hashing)
- And other dependencies

## Step 2: Set Up the Database

1. Navigate to the database folder:
   ```bash
   cd ../database
   ```
2. Run the initialization script:
   ```bash
   node init.js
   ```

This will create the `chopnow.db` SQLite database file with all necessary tables.

## Step 3: Configure Environment Variables

1. Navigate back to the backend folder:
   ```bash
   cd ../backend
   ```
2. Create a `.env` file (copy from `.env.example`):
   ```bash
   # On Windows PowerShell
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```
3. Open `.env` and update the JWT_SECRET with a secure random string:
   ```
   JWT_SECRET=your-super-secret-key-change-this
   ```

## Step 4: Start the Backend Server

1. Make sure you're in the `backend` folder
2. Start the server:
   ```bash
   npm start
   ```

You should see:
```
Connected to SQLite database
ChopNow server is running on port 3000
API Base URL: http://localhost:3000/api
```

**Keep this terminal open!** The server needs to keep running.

## Step 5: Open the Frontend

### Option 1: Direct File Opening (Simple)
1. Navigate to the `frontend` folder
2. Double-click `index.html` to open it in your browser

### Option 2: Using a Local Server (Recommended)
1. Open a new terminal/command prompt
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Start a simple HTTP server:

   **Using Python (if installed):**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js http-server:**
   ```bash
   npx http-server -p 8000
   ```

4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

## Step 6: Test the Application

1. **Register a new account:**
   - Click "Register" on the homepage
   - Choose "Consumer" or "Vendor"
   - Fill in the registration form
   - Submit the form

2. **Login:**
   - Use your registered email and password
   - You should be redirected to your dashboard

3. **Test API endpoints:**
   - Open browser Developer Tools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see API calls

## Troubleshooting

### Port 3000 already in use
If you get an error that port 3000 is in use:
1. Change the PORT in `backend/.env` file:
   ```
   PORT=3001
   ```
2. Update `frontend/js/main.js` and `frontend/js/auth.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001/api';
   ```

### Database errors
- Make sure you ran `node init.js` in the database folder
- Check that `chopnow.db` file exists in the database folder
- Delete `chopnow.db` and run `node init.js` again if needed

### CORS errors
- Make sure the backend server is running
- Check that the API_BASE_URL in frontend JavaScript files matches your backend port

### Cannot find module errors
- Make sure you ran `npm install` in the backend folder
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

## Development Tips

1. **Use nodemon for auto-restart** (optional):
   ```bash
   npm install -g nodemon
   cd backend
   nodemon server.js
   ```
   This will automatically restart the server when you make changes.

2. **Check the API documentation**:
   - See `docs/API_DOCUMENTATION.md` for all available endpoints

3. **Database management**:
   - Use SQLite Browser or DB Browser for SQLite to view/edit the database
   - Download: https://sqlitebrowser.org/

## Next Development Steps

1. Add image upload functionality for meal photos
2. Implement payment gateway integration
3. Add real-time notifications using WebSockets
4. Implement location-based search using Google Maps API
5. Add email verification functionality
6. Create vendor and consumer dashboards with full functionality

## Getting Help

- Check the SRS_Document for requirements
- Review PROJECT_STRUCTURE.md for code organization
- Check API_DOCUMENTATION.md for endpoint details
- Review the code comments in each file

Happy coding! 🚀


# MEC Events Backend

Backend server for the MEC Events Management System built with Node.js, Express, and MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   
   # Using batch file (Windows)
   start-backend.bat
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run start:full` - Start using start-backend.js

## API Endpoints

- **Health Check**: `GET /api/health`
- **Events**: `/api/events`
- **Users**: `/api/users`
- **Bookings**: `/api/bookings`
- **Reports**: `/api/reports`

## Project Structure

```
backend/
├── models/          # Database models
├── routes/          # API routes
├── uploads/         # File uploads
├── index.js         # Main server file
├── seedUsers.js     # Database seeding
└── package.json     # Dependencies
```

## Dependencies

- Express.js - Web framework
- Mongoose - MongoDB ODM
- CORS - Cross-origin resource sharing
- Multer - File upload handling
- dotenv - Environment variables
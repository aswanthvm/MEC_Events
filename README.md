# MEC Events Management System

A comprehensive full-stack web application for managing college events with role-based access control, built with React.js frontend and Node.js/Express backend.

## 🌟 Features

- **Event Management**: Create, edit, and manage college events
- **User Authentication**: Secure login with role-based access (Admin/Student)
- **Event Registration**: Students can register for events
- **Booking System**: Comprehensive booking management
- **Admin Dashboard**: Complete administrative control panel
- **Reports Generation**: Event attendance and registration reports
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Technology Stack

**Frontend:**
- React.js 18.3.1
- React Router Dom
- Bootstrap 5.3.3
- Axios for API calls
- React Icons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- Multer for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aswanthvm/MEC_Events.git
   cd MEC_Events
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your MongoDB connection string
   npm start
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env file if needed
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📁 Project Structure

```
MEC_Events/
├── backend/                 # Node.js/Express API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── index.js            # Server entry point
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React application
│   ├── src/
│   │   ├── Components/     # React components
│   │   ├── admin/          # Admin dashboard
│   │   ├── services/       # API services
│   │   └── Assets/         # Images, videos
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies
│   └── .env.example        # Environment variables template
└── README.md               # Project documentation
```

## 🔧 Configuration

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/MECevents
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Usage

1. **Admin Access**: Create events, manage registrations, generate reports
2. **Student Access**: View events, register for events, view bookings
3. **Authentication**: Role-based routing ensures proper access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aswanth VM**
- GitHub: [@aswanthvm](https://github.com/aswanthvm)

---

For detailed setup instructions, check the README files in the `backend/` and `frontend/` directories.

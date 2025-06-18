const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const UserRoute = require('../Routes/UserRoute');
const AppointmentRoute = require('../Routes/AppointmentRoute');
const authMiddleware = require('../MiddleWares/authMiddleware');

dotenv.config();
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

// app.use(cookieParser());

app.use(cors({
  origin: 'exp://192.168.43.154:8081', // Allow only frontend running on this origin
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use('/api/users', UserRoute);
app.use('/api/appointments', AppointmentRoute);

app.get('/api/checkauth', authMiddleware, (req, res) => {
  res.status(200).json({ userData: req.user, message: "Authenticated" });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

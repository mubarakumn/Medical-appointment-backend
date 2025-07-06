const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const UserRoute = require('../Routes/UserRoute');
const AppointmentRoute = require('../Routes/AppointmentRoute');
const SlotRoute = require('../Routes/SlotRoute'); // fixed path

const authMiddleware = require('../MiddleWares/authMiddleware');

dotenv.config();
const app = express();

app.use(express.json());
// app.use(cookieParser());

// CORS for React Native / Expo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api/users', UserRoute);
app.use('/api/appointments', AppointmentRoute);
app.use('/api/slots', SlotRoute);

// Auth Test
app.get('/api/checkauth', authMiddleware, (req, res) => {
  res.status(200).json({ userData: req.user, message: "Authenticated" });
});

// Connect DB and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- HYBRID PATTERN ---
// Only listen when running locally (node server.js), not when imported by Vercel
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local server listening on port ${PORT}`));
}

// Always export the app for serverless use
module.exports = app;

const express = require('express');
const { bookAppointment, getMyAppointments, updateAppointment, cancelAppointment } = require('../Controllers/appointmentCtrl');
const authMiddleware = require('../MiddleWares/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/book', authMiddleware, bookAppointment);
router.get('/my', authMiddleware, getMyAppointments);
router.patch('/update/:id', authMiddleware, updateAppointment);
router.patch('/cancel/:id', authMiddleware, cancelAppointment);

module.exports = router;

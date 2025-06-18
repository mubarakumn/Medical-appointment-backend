const express = require('express');
const { bookAppointment, updateAppointment, getAppointments } = require('../Controllers/AppointmentCtrl');

const router = express.Router();

// Get all appointments (or by patient/doctor)
router.get('/', getAppointments);

router.post('/book', bookAppointment);
router.put('/:id',  updateAppointment);

// Cancel an appointment
// router.delete('/:id', cancelAppointment);



module.exports = router;

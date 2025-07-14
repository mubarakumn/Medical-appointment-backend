// routes/adminRoutes.js
const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getAdminStats,
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  deleteUser,
  deleteAppointment,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', authMiddleware, adminOnly, getAdminStats);
router.get('/doctors', authMiddleware, adminOnly, getAllDoctors);
router.get('/patients', authMiddleware, adminOnly, getAllPatients);
router.get('/appointments', authMiddleware, adminOnly, getAllAppointments);
router.delete('/users/:id', authMiddleware, adminOnly, deleteUser);
router.delete('/appointments/:id', authMiddleware, adminOnly, deleteAppointment);

module.exports = router;

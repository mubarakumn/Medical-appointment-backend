const express = require('express');
const {
  registerUser,
  loginUser,
  getAllUsers,
  getAllDoctors,
  getUser,
  updateUser,
  getDoctorStats,
  deleteUserAccount,
  setAvailability,
  getUserAppointment
} = require('../Controllers/UserCtrl');
const {authMiddleware} = require('../MiddleWares/authMiddleware');

const router = express.Router();

console.log(typeof authMiddleware); // Should log 'function'
// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/all', getAllUsers);       // (Consider protecting this for admins)
router.get('/doctors', getAllDoctors);
router.get('/doctors/stats', authMiddleware, getDoctorStats);
router.get('/appointments/my', authMiddleware, getUserAppointment);


// Protected routes
router.put('/doctors/availability', authMiddleware, setAvailability);
router.patch('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUserAccount);

// Dynamic route (keep last)
router.get('/:id', getUser);

module.exports = router;

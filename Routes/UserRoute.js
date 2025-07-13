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
  setAvailability
} = require('../Controllers/UserCrtl');
const authMiddleware = require('../MiddleWares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/all', getAllUsers);       // (Consider protecting this for admins)
router.get('/doctors', getAllDoctors);
router.get('/doctors/stats', authMiddleware, getDoctorStats);


// Protected routes
router.put('/doctors/availability', authMiddleware, setAvailability);
router.patch('/profile', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUserAccount);

// Dynamic route (keep last)
router.get('/:id', getUser);

module.exports = router;

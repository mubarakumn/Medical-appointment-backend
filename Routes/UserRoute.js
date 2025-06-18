const express = require('express');
const { registerUser, loginUser, getAllUsers, getUser, updateUser, deleteUserAccount } = require('../Controllers/UserCrtl');
const authMiddleware = require('../MiddleWares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/:id', getUser); 
router.get('/all', getAllUsers); // Users can view all doctors 

// Protected routes (require authentication)
router.patch('/profile', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUserAccount);

module.exports = router;  



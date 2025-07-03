const express = require('express');
const { addSlot, removeSlot, getDoctorSlots } = require('../Controllers/SlotCtrl');
const authMiddleware = require('../MiddleWares/authMiddleware');

const router = express.Router();

// Doctor actions
router.post('/add', authMiddleware, addSlot);
router.delete('/remove', authMiddleware, removeSlot);

// Public access: get available slots
router.get('/:doctorId', getDoctorSlots);

module.exports = router;

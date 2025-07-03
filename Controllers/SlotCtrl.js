const User = require('../Models/UserModel');

// ✅ Add a new slot (Doctor only)
const addSlot = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add slots.' });
    }

    const { slot } = req.body; // ISO date-time

    const doctor = await User.findById(req.user.id);

    const exists = doctor.availableSlots.some(s => new Date(s.date).getTime() === new Date(slot).getTime());
    if (exists) {
      return res.status(400).json({ message: 'Slot already exists.' });
    }

    doctor.availableSlots.push({ date: new Date(slot) });
    await doctor.save();

    res.status(200).json({ message: 'Slot added.', slots: doctor.availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error adding slot.', error });
  }
};


// ✅ Remove a slot
const removeSlot = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can remove slots.' });
    }

    const { slot } = req.body;

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { availableSlots: { date: new Date(slot) } }
      },
      { new: true }
    );

    res.status(200).json({ message: 'Slot removed.', slots: doctor.availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error removing slot.', error });
  }
};


// ✅ Get available slots for a doctor
const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findById(doctorId).select('availableSlots');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const unbookedSlots = doctor.availableSlots.filter(slot => !slot.isBooked);
    res.status(200).json({ slots: unbookedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots.', error });
  }
};


module.exports = {
  addSlot,
  removeSlot,
  getDoctorSlots
};

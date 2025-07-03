const Appointment = require('../Models/AppointmentModel');
const User = require('../Models/UserModel');

// ✅ Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date,
      reason
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error });
  }
};

// ✅ Get all appointments for a user
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { patient: req.user.id },
        { doctor: req.user.id }
      ]
    }).populate('patient', 'name email').populate('doctor', 'name specialization');
    
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
};

// ✅ Update appointment (e.g. date, reason, status, notes)
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason, status, notes } = req.body;

    // Only patient or doctor involved can update
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Optional: Check if req.user is involved
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized to update this appointment" });
    }

    // Update fields
    if (date) appointment.date = date;
    if (reason) appointment.reason = reason;
    if (notes) appointment.notes = notes;
    if (status) appointment.status = status;

    const updated = await appointment.save();

    res.status(200).json({ message: "Appointment updated", appointment: updated });

  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

// ✅ Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(id, {
      status: 'cancelled'
    }, { new: true });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling appointment", error });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  updateAppointment,
  cancelAppointment
};

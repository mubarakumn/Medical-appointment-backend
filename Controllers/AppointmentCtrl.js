const Appointment = require('../Models/AppointmentModel');
const NotificationModel = require('../Models/NotificationModel');
const User = require('../Models/UserModel');

// ✅ Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const requestedTime = new Date(date);
    requestedTime.setSeconds(0, 0); // Remove seconds and ms

    const slot = doctor.availableSlots.find(s => {
      const slotTime = new Date(s.date);
      slotTime.setSeconds(0, 0); // Normalize slot time too
      return slotTime.getTime() === requestedTime.getTime() && !s.isBooked;
    });

    if (!slot) {
      return res.status(400).json({ message: "Selected slot is not available." });
    }

    const existing = await Appointment.findOne({
      patient: req.user.id,
      doctor: doctorId,
      date: requestedTime,
    });

    if (existing) {
      return res.status(400).json({ message: "You already have an appointment at this time." });
    }

    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: requestedTime,
      reason
    });

    await newAppointment.save();

    // Update slot
    slot.isBooked = true;
    doctor.markModified('availableSlots');
    await doctor.save();

    // Doctor Notification
    await NotificationModel.create({
      userId: doctorId,
      title: 'New Appointment',
      text: `You have a new appointment on ${requestedTime.toLocaleString()}`,
    });

    // Patient Notification
    await NotificationModel.create({
      userId: req.user.id,
      title: 'Appointment Booked',
      text: `Your appointment with Dr. ${doctor.name} is on ${requestedTime.toLocaleString()}`,
    });

    res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
  } catch (error) {
    console.error("Booking Error:", error.message);
    res.status(500).json({ message: "Error booking appointment", error });
  }
};



// ✅ Get all appointments for a user
const getMyAppointments = async (req, res) => {
  try {
    const { status, from, to } = req.query;

    let filter = {
      $or: [
        { patient: req.user.id },
        { doctor: req.user.id }
      ]
    };

    if (status) {
      filter.status = status;
    }

    if (from && to) {
      filter.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

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

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot update a ${appointment.status} appointment` });
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

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Only patient or doctor can cancel
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized to cancel this appointment" });
    }

    // Mark appointment as cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    // Free up the doctor's slot
    const doctor = await User.findById(appointment.doctor);
    const slot = doctor.availableSlots.find(
      s => new Date(s.date).getTime() === new Date(appointment.date).getTime()
    );

    if (slot) {
      slot.isBooked = false;
      await doctor.save();
    }

    res.status(200).json({ message: "Appointment cancelled and slot freed", appointment });

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

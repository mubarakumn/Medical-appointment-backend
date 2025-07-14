const User = require('../Models/UserModel');
const Appointment = require('../Models/AppointmentModel');
const Notification = require('../Models/NotificationModel'); // Optional

// Dashboard Stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    let recentNotifications = [];
    try {
      recentNotifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
    } catch (e) {
      console.warn('Notification model not found or empty');
    }

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      recentNotifications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin stats', error: err });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
};

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name')
      .populate('patient', 'name')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

// Delete user by ID (doctor or patient)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
};

// Delete appointment by ID
const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel appointment', error });
  }
};

module.exports = {
  getAdminStats,
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  deleteUser,
  deleteAppointment,
};

const User = require('../Models/UserModel');
const Appointment = require('../Models/AppointmentModel');
const Notification = require('../Models/NotificationModel'); // if you have

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    const recentNotifications = await Notification.find().sort({ createdAt: -1 }).limit(5);

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

module.exports = { getAdminStats };

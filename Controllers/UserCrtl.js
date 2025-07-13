const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserModel = require('../Models/UserModel');
const Appointment = require('../Models/AppointmentModel');


dotenv.config();

// 🧰 Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
};

// 🧰 Helper: Generate slots based on availability
const generateSlots = (availability) => {
  const result = [];
  const today = new Date();
  const daysToGenerate = 14; // next 2 weeks

  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    availability.forEach((rule) => {
      if (rule.day === dayName) {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);

        const start = new Date(date);
        start.setHours(startH, startM, 0);
        const end = new Date(date);
        end.setHours(endH, endM, 0);

        while (start < end) {
          result.push({ date: new Date(start), isBooked: false });
          start.setMinutes(start.getMinutes() + rule.duration);
        }
      }
    });
  }

  return result;
};


// ✅ Register a new user (patient by default)
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      role, // optional: 'doctor', 'admin'
      specialization,
      experience
    } = req.body;


      if (!name || !email || !phone || !password || !dateOfBirth || !gender || !address) {
        return res.status(400).json({ message: "All fields are required." });
      }

    // Check for existing user
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered." });
    }

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      role: role || 'patient',
      specialization,
      experience
    });

    await newUser.save();

    const token = generateToken(newUser);
    const { password: _, ...userData } = newUser._doc;

    res.status(201).json({
      message: "Registration successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed", error });
  }
};

// ✅ Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

// ✅ Get a user by ID
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// ✅ Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await UserModel.find({ role: 'doctor' }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// ✅ Update user profile
const updateUser = async (req, res) => {
  try {
    const updateFields = req.body;
    updateFields.profileStatus = 'Completed';

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// GET /api/doctor/stats
const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await UserModel.findById(doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Count appointments
    const allAppointments = await Appointment.find({ doctor: doctorId }).populate('patient', 'name email');
    const patientIds = new Set(allAppointments.map(app => app.patient._id.toString()));

    // Filter for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayAppointments = allAppointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= today && appDate < tomorrow;
    });

    // Upcoming (future) appointments
    const upcomingAppointments = allAppointments
      .filter(app => new Date(app.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Format availability summary
    const availabilitySummary = doctor.availability?.map(slot => ({
      day: slot.day,
      time: `${slot.startTime} - ${slot.endTime}`,
    })) || [];

    return res.status(200).json({
      appointments: allAppointments.length,
      slots: doctor.availableSlots.length,
      patients: patientIds.size,
      todayAppointments: todayAppointments.map(app => ({
        patientName: app.patient.name,
        date: app.date,
      })),
      upcomingAppointments: upcomingAppointments.slice(0, 5).map(app => ({
        patientName: app.patient.name,
        date: app.date,
      })),
      availabilitySummary,
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

// ✅ Set doctor's availability and generate slots
const setAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can set availability.' });
    }

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array.' });
    }

    const doctor = await UserModel.findById(req.user.id);

    doctor.availability = availability;

    // 🔄 Regenerate fresh slots from the new availability
    const newSlots = generateSlots(availability);

    // 🧹 Keep only existing booked slots
    const bookedSlots = doctor.availableSlots.filter(s => s.isBooked);

    // 💾 Replace unbooked slots with new ones
    doctor.availableSlots = [...bookedSlots, ...newSlots];

    await doctor.save();

    res.status(200).json({
      message: 'Availability set and slots generated.',
      slots: doctor.availableSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error setting availability.', error });
  }
};

// ✅ Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getAllUsers,
  getAllDoctors,
  updateUser,
  getDoctorStats,
  setAvailability,
  deleteUserAccount
};

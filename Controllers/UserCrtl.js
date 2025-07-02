const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserModel = require('../Models/UserModel');

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

    // Check for existing user
    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      phone,
      password: hashedPassword,
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
  deleteUserAccount
};

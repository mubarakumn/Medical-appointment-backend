const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserModel = require('../Models/UserModel');

dotenv.config();

// ✅ Register a new User
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, dateOfBirth, gender, address, } = req.body;

        // Check if the email or phone already exists
        const existingPatient = await UserModel.findOne({ $or: [{ email }, { phone }] });
        if (existingPatient) {
            return res.status(400).json({ message: "Email or phone already registered." });
        } 

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new patient
        const newPatient = new UserModel({
            name,
            email, 
            phone,
            password: hashedPassword,
            dateOfBirth,
            gender,
            address,
        });

        await newPatient.save();
        res.status(201).json({ message: "Patient registered successfully", patientId: newPatient._id });
    } catch (error) {
        res.status(500).json({ message: "Error occured while registeration!", error });
    }
};

// ✅ User login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
   
        // Find the patient by email
        const patient = await UserModel.findOne({ email });
        if (!patient) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        } 
        // Generate JWT token
        const token = jwt.sign({ id: patient._id, name: patient.name, email: patient.email,  role: patient.role }, process.env.JWT_SECRET, { expiresIn: '30m' });

        return res.status(200).json({ message: "Login successful", token, patient });
    } catch (error) {
       return res.json({ message: "Error logging in", error });
    }
};

// ✅ Get User
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await UserModel.findById(id).select('-password');
        if (!patient) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

// ✅ Get all Users 
const getAllUsers = async (req, res) => {
    try {
        const Users = await DoctorModel.find().select('-password'); // Exclude password from response
        res.status(200).json(Users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Users", error });
    }
};

// ✅ Update User 
const updateUser = async (req, res) => {
    try {
        const { phone, address, medicalHistory, emergencyContact } = req.body;
        console.log("//----------------//");
        console.log( phone, address, medicalHistory, emergencyContact );
        const updatedPatient = await UserModel.findByIdAndUpdate(
            req.user.id,
            {  phone, address, medicalHistory, emergencyContact, },
            { new: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const profileStatus = "Completed";

        await UserModel.findByIdAndUpdate(
            req.user.id,
            {profileStatus }
        );

        res.status(200).json({ message: "Profile updated successfully", updatedPatient });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// ✅ Delete patient account
const deleteUserAccount = async (req, res) => {
    try {
        await UserModel.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Patient account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account", error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUserAccount
};
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient',
    },
    specialization: {
        type: String,
        required: true
    }, // e.g., "Cardiologist", "Dermatologist"
    experience: {
        type: Number,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    availableSlots: [{ type: Date }], // Array of available time slots
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // Booked appointments
    ratings: { type: Number, default: 0 },
    profileStatus: {
        type: String,
        enum: ['notComplete', 'Completed'],
        default: 'notComplete'
    },
    // Summary of past conditions
    medicalHistory: [
        { type: String, default: '' },
    ],
    emergencyContact: {
        name: {
            type: String,
            // required: true
        },
        phone: {
            type: String,
            // required: true
        },
        relationship: {
            type: String,
            // required: true
        }
    },
    appointments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        }], // List of booked appointments
}, { timestamps: true });

module.exports = mongoose.model('user', UserSchema);

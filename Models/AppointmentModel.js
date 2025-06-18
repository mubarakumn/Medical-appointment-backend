const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    dateTime: { // Combine date and time into one field
        type: Date,
        required: true
    },
    symptoms: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
        default: 'pending' 
    }, 
    notes: { // Doctor's notes
        type: String
    },
    timeCancelled:{ 
      type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

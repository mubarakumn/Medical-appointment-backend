const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },

  specialization: {
    type: String,
    required: function () { return this.role === 'doctor'; }
  },

  experience: {
    type: Number,
    required: function () { return this.role === 'doctor'; }
  },

  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },

  availableSlots: [
    {
      date: Date,
      isBooked: { type: Boolean, default: false }
    }
  ],

  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  ],

  ratings: { type: Number, default: 0 },

  profileCompleted: { type: Boolean, default: false },

  medicalHistory: [
    {
      condition: String,
      diagnosisDate: Date,
      notes: String
    }
  ],

  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  countryCode: {
    type: String, // e.g., "+49"
    trim: true,
  },
  isoCode: {
    type: String, // e.g., "de"
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  isEmailVerified:{
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);

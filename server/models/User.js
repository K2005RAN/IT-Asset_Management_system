const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // --- Authentication Fields ---
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    lowercase: true 
  },
  userType: { 
    type: String, 
    required: true,
    default: "employee" // Handles permissions ('admin' or 'employee')
  },

  // --- Excel Spreadsheet Mapping Fields ---
  sno: {
    type: Number
  },
  plant: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  userId: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true // Maps to your Excel "Employee ID" field
  },
  title: {
    type: String,
    trim: true // Maps to your Excel "Title" field
  },
  department: {
    type: String,
    required: true,
    trim: true // Used for filter dropdowns
  },
  domainId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Tracks createdAt and updatedAt records
});

// 🧠 Explicitly force Mongoose to map to your main "users" collection
module.exports = mongoose.model("User", userSchema, "users");
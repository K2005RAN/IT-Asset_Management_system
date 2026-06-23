// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true 
        // ❌ unique: true removed to allow multiple device assignments per employee
    },
    assetId: { 
        type: String, 
        required: true 
        // ❌ unique: true removed to allow historical re-assignments of hardware
    },
    assignmentDate: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    status: { 
        type: String, 
        default: 'In Use' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
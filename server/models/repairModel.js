const mongoose = require('mongoose');

const RepairLogSchema = new mongoose.Schema({
    assetId: { type: String, required: true },
    hardwareModelNo: { type: String, default: '' },
    serviceTag: { type: String, default: '' },
    plant: { type: String, default: 'Narsinghgarh' },
    
    // Vendor Assignment Parameters
    vendorName: { type: String, required: true },
    expectedReturnDate: { type: Date, default: null },
    expectedPrice: { type: Number, default: 0 },
    
    // Repair Lifecycle Timestamps
    sentToRepairAt: { type: Date, default: Date.now },
    restoredToStockAt: { type: Date, default: null },
    status: { type: String, enum: ['In Repair', 'Completed'], default: 'In Repair' }
}, { timestamps: true });

module.exports = mongoose.model('RepairLog', RepairLogSchema);
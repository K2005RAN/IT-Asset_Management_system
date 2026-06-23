const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    // ── IDENTIFICATION CODES ──
    assetId: { type: String, unique: true, required: true },       // Maps from "Asset No"
    serviceTag: { type: String, default: '' },                     // Maps from "Service Tag"
    barcode: { type: String, default: '' },                        // Maps from "Barcode"
    sdeRefNo: { type: String, default: '' },                       // Maps from "SDE Ref#"
    sapCode: { type: String, default: '' },                        // Maps from "SAP"

    // ── CATEGORY & DESIGNATION ──
    assetName: { type: String, required: true },                   // Combined string or distinct category marker
    assetType: { type: String, required: true },                   // Maps from "Asset Type" (Laptop, Desktop, etc.)
    assetStatus: { type: String, default: 'In Use' },              // Maps from "Asset Status" (In Use, In Stock)
    repairDate: { type: Date, default: null },                     // 🌟 NEW TRACKING KEY         
    make: { type: String, default: '' },                           // Maps from "Make" (Dell, HP, Lenovo)
    hardwareModelNo: { type: String, default: '' },                // Maps from "Hardware Model No"
    hostname: { type: String, default: '' },                       // Maps from "Hostname"

    // 🌟 ADDED SYSTEM COMPLIANCE PARAMETER LAYER ──
    isCompliant: { 
        type: String, 
        enum: ['Compliant', 'Non-Compliant', 'Under Review'], 
        default: 'Under Review' 
    },

    // ── OPERATIONS LOGISTICS & FILTERS ──
    plant: { type: String, default: 'Narsinghgarh' },              // Maps from "Plant" (Critical filter link)
    department: { type: String, default: 'Unassigned Sector' },    // Maps from "Department" (Critical filter link)
    location: { type: String, default: '' },                       // Maps from "Location"

    // ── EMPLOYEE ASSIGNMENT MATRIX ──
    assignedToId: { type: String, default: null },                 // Maps from "Employee ID"
    assignedToName: { type: String, default: '' },                 // Combines "First Name" + "Last Name"
    username: { type: String, default: '' },                       // Maps from "User Name"
    domainId: { type: String, default: '' },                       // Maps from "Domain ID"
    employeeType: { type: String, default: '' },                   // Maps from "Employee Type"
    title: { type: String, default: '' },                          // Maps from "Title" (Designation)

    // ── HARDWARE ENVIRONMENT TELEMETRY ──
    macAddress: { type: String, default: '' },                     // Maps from "Mac Address"
    operatingSystem: { type: String, default: '' },                // Maps from "Operating System"
    processor: { type: String, default: '' },                      // Maps from "Processor"
    memory: { type: String, default: '' },                         // Maps from "Memory" (RAM size mapping)
    hddSpecifications: { type: String, default: '' },              // Maps from "HDD Specifications"
    sccmStatus: { type: String, default: '' },                     // Maps from "SCCM"
    w11Compatible: { type: String, default: 'No' },                // Maps from "W11 Compatible"

    // ── PROCUREMENT, PROCUREMENT LOGS, & INVOICES ──
    invoiceNo: { type: String, default: '' },                      // Maps from "Invoice No"
    invoiceDate: { type: Date, default: null },                    // Maps from "Invoice Date"
    qtyOfInvoice: { type: Number, default: 1 },                    // Maps from "Qty of Invoice"
    invoiceValue: { type: Number, default: 0 },                    // Maps from "Invoice Value"
    poNo: { type: String, default: '' },                           // Maps from "PO No"
    poDate: { type: Date, default: null },                         // Maps from "PO Date"
    capitalisedAt: { type: String, default: '' },                  // Maps from "Capitalised at"
    capitalisedYear: { type: String, default: '' },                // Maps from "Capatilised Year"
    adapterChargerSerial: { type: String, default: '' },           // Maps from "Adapter / Charger Serial Number"
    afeNo: { type: String, default: '' },                          // Maps from "AFE No"

    // ── LIFECYCLE & DATES ──
    dateOfJoining: { type: Date, default: null },                  // Maps from "Date of Joining"
    trainingDate: { type: Date, default: null },                   // Maps from "Training Date"
    domainIdCreateDate: { type: Date, default: null },             // Maps from "Domain ID Create Date"
    dateOfAssignment: { type: Date, default: null },               // Maps from "Date of Assignment"
    tcMigratedDate: { type: Date, default: null },                  // Maps from "TC Migrated Date"
    warrantyStartDate: { type: Date, default: null },              // Maps from "Warranty Start Date"
    warrantyEndDate: { type: Date, default: null },                // Maps from "Warranty End Date"
    approvedDateForWriteOff: { type: Date, default: null },         // Maps from "Approved Date for Write Off"
    
    // ── MISC STACKS ──
    migratedProductionUsers: { type: String, default: '' },        // Maps from "Migrated Production Users"
    remarks: { type: String, default: '' }                         // Maps from "Remarks"
}, {
    timestamps: true // Automatically seeds createdAt and updatedAt markers
});

// Create dynamic composite indexes to optimize cascading query filters
assetSchema.index({ plant: 1, department: 1, assetType: 1, assetStatus: 1 });
assetSchema.index({ assetId: "text", assignedToName: "text", serviceTag: "text" });

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
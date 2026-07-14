require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken");
const multer = require('multer');
const { Readable } = require('stream');

// 🌟 Automated background notification service utility
const { sendAssignmentEmail } = require('./emailHelper'); 

const app = express();

// Configure multer memory allocation state engine
const upload = multer({ storage: multer.memoryStorage() });

// --- Schema References ---
const RepairLog = require('./models/repairModel'); //  CORRECT 
const User = require('./models/User'); 
const Assignment = require('./models/Assignment');
const AdminUser = require("./models/AdminUser");
const Asset = require('./models/assetModel');

// --- Core Parsers ---
app.use(express.json());
app.use(cookieParser());

// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:3001", 
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === 'null' || origin === 'undefined') {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
    credentials: true
  })
);

// ── PRIORITY SYSTEM ENDPOINTS ──

/**
 * GET /api/users
 */
app.get('/api/users', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: "Email query parameter is required" });
        }
        const employee = await User.findOne({ email: email.toLowerCase().trim() });
        if (!employee) {
            return res.status(404).json({ error: "Employee profile matching this criteria does not exist" });
        }
        return res.json(employee);
    } catch (error) {
        console.error("❌ Profile Retrieval Server Exception:", error);
        return res.status(500).json({ error: "Failed to extract profile record data" });
    }
});

/**
 * POST /api/assets/:id/send-to-repair
 * 🛠️ WORKSHOP INGESTION: Changes asset state to Maintenance and logs metadata into RepairLog DB
 */
app.post('/api/assets/:id/send-to-repair', async (req, res) => {
    try {
        const targetId = req.params.id;
        const { vendorName, expectedReturnDate, expectedPrice } = req.body;

        // 1. 🎯 FIXED QUERY: Force .lean() to completely strip Mongoose document field blocks
        const assetData = await Asset.findById(targetId).lean();
        if (!assetData) {
            return res.status(404).json({ error: "Asset not found in master registry collection." });
        }

        // Update the asset status independently using direct model queries
        await Asset.findByIdAndUpdate(targetId, {
            $set: {
                assetStatus: 'Maintenance',
                repairDate: new Date()
            }
        });

        // 2. 🎯 EXPLICIT KEY SCANNER: Read directly from raw collection paths
        let resolvedName = 
            assetData.assetName || 
            assetData['Hardware Model N'] || 
            assetData.hardwareModelNo || 
            assetData.make || 
            assetData['Make'] ||
            assetData.assetType ||
            assetData['Asset Type'];

        // Strict fallback so Mongoose NEVER encounters an undefined or blank string field value
        if (!resolvedName || String(resolvedName).trim() === "" || String(resolvedName).trim() === "—") {
            resolvedName = `IT Asset Unit [${assetData.assetId || assetData.serviceTag || 'Unknown ID'}]`;
        } else {
            resolvedName = String(resolvedName).trim();
        }

        // 3. Build the decoupled history tracking document ticket payload safely
        const repairTicket = new RepairLog({
            assetId: assetData.assetId || 'MANUAL-ENTRY',
            assetName: resolvedName, // 🌟 Guarantees a non-empty string to clear the schema requirement
            hardwareModelNo: assetData.hardwareModelNo || assetData['Hardware Model N'] || assetData.make || 'Corporate Hardware',
            serviceTag: assetData.serviceTag || assetData.assetId || '—',
            plant: assetData.plant || assetData.location || 'Narsinghgarh',
            vendorName: String(vendorName).trim(),
            expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
            expectedPrice: typeof expectedPrice === 'string' ? parseFloat(expectedPrice.replace(/[^0-9.]/g, '')) || 0 : parseFloat(expectedPrice) || 0,
            sentToRepairAt: new Date(),
            status: 'In Repair'
        });

        const savedTicket = await repairTicket.save();
        
        return res.status(201).json({ 
            success: true, 
            message: "Ticket opened inside separate repair registry.", 
            ticket: savedTicket 
        });
    } catch (error) {
        console.error("💥 Send to workshop pipeline broken:", error);
        return res.status(500).json({ error: `Database Ingestion Rejected: ${error.message}` });
    }
});

/**
 * PUT /api/assets/:id/return-from-repair
 * 🔄 LIFE-CYCLE RESTORATION: Returns asset to normal stock and writes the completion time-log
 */
app.put('/api/assets/:id/return-from-repair', async (req, res) => {
    try {
        const targetId = req.params.id;

        // 1. 🎯 FIXED QUERY: Fetch using .lean() to clear document locking models
        const assetData = await Asset.findById(targetId).lean();
        if (!assetData) {
            return res.status(404).json({ error: "Target equipment row missing." });
        }

        // 2. 🎯 THE DIRECT FIX: Use findByIdAndUpdate to directly modify the status fields.
        // This bypasses schema validation scans completely!
        await Asset.findByIdAndUpdate(targetId, {
            $set: {
                assetStatus: 'Available',
                repairDate: null
            }
        });

        // 3. Isolate the active open tracking ticket and commit completion logs
        const lookUpKey = assetData.assetId || assetData.serviceTag || assetData.assetNo;
        await RepairLog.findOneAndUpdate(
            { assetId: lookUpKey, status: 'In Repair' },
            { 
                $set: { 
                    status: 'Completed',
                    restoredToStockAt: new Date() // Captures exact date and time of lifecycle state mutation
                } 
            },
            { new: true }
        );

        return res.json({ success: true, message: "Asset restored to normal stock pool safely." });
    } catch (error) {
        console.error("❌ Failed to resolve maintenance lifecycle step:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/repair-history
 * 🔍 REPAIR HISTORY QUERY: Fetches comprehensive repair tracking tickets for the portal view
 */
// 1. GET: Fetch the complete workshop history tracking ledger
app.get('/api/admin/repair-history', async (req, res) => {
    try {
        const historyLogs = await RepairLog.find({}).sort({ sentToRepairAt: -1 }).lean();
        return res.json(historyLogs);
    } catch (error) {
        console.error("❌ Failed to aggregate workshop records:", error);
        return res.status(500).json({ error: "Failed to extract database tracking histories." });
    }
});

// 2. PUT: Update vendor allocation and financial cost bounds inline
app.put('/api/admin/repair-history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorName, expectedPrice } = req.body;

        // Form Validation Rules
        if (!vendorName || vendorName.trim() === "") {
            return res.status(400).json({ message: "Vendor target allocation cannot be empty." });
        }

        if (expectedPrice === undefined || expectedPrice === null || isNaN(expectedPrice)) {
            return res.status(400).json({ message: "Financial cost bounds must be a valid number." });
        }

        // Execute atomic document update context inside MongoDB
        const updatedLog = await RepairLog.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    vendorName: vendorName.trim(), 
                    expectedPrice: Number(expectedPrice) 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!updatedLog) {
            return res.status(404).json({ message: "Maintenance log item tracking profile not found." });
        }

        return res.status(200).json({ 
            message: "Ledger track metrics updated successfully.", 
            data: updatedLog 
        });

    } catch (err) {
        console.error("❌ Database inline edit transaction failed:", err);
        return res.status(500).json({ error: "Internal transaction engine processing error." });
    }
});

/**
 * GET /api/admin/employees
 */
app.get('/api/admin/employees', async (req, res) => {
    try {
        const { search } = req.query;
        let queryCondition = { 
            username: { $not: /.*admin.*/i } 
        };

        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            queryCondition = {
                $and: [
                    { username: { $not: /.*admin.*/i } },
                    {
                        $or: [
                            { userId: searchRegex },
                            { firstName: searchRegex },
                            { lastName: searchRegex },
                            { email: searchRegex },
                            { department: searchRegex },
                            { plant: searchRegex },
                            { username: searchRegex }
                        ]
                    }
                ]
            };
        }

        const workforce = await User.find(queryCondition).sort({ firstName: 1 }).lean();
        console.log(`📊 Synchronizing Dashboard: Exposing ${workforce.length} active workforce rows.`);
        return res.json(workforce);
    } catch (error) {
        console.error("❌ Workforce Management Retrieval Crash:", error);
        return res.status(500).json({ error: "Failed to compile registered employee accounts dashboard metrics." });
    }
});

/**
 * GET /api/admin/assets-search
 * 🔍 ADVANCED AGGREGATOR ENGINE: Merges User Profiles and separate Repair logs on the fly
 */
app.get('/api/admin/assets-search', async (req, res) => {
    try {
        const filtersReceived = req.query;
        let queryCondition = {};

        const queryMapping = {
            location: 'location',
            department: 'department',
            assetType: 'assetType',
            assetStatus: 'assetStatus',
            serviceTag: 'serviceTag',
            hardwareModelNo: 'hardwareModelNo',
            sccm: 'sccmStatus',
            operatingSystem: 'operatingSystem',
            assetNo: 'assetNo',
            invoiceNo: 'invoiceNo',
            capitalisedYear: 'capitalisedYear',
            poNo: 'poNo',
            assignedToName: 'assignedToName',
            employeeType: 'employeeType'
        };

        Object.keys(queryMapping).forEach(frontendKey => {
            const dbSchemaFieldKey = queryMapping[frontendKey];
            const incomingVal = filtersReceived[frontendKey];
            
            if (incomingVal && String(incomingVal).trim() !== "") {
                queryCondition[dbSchemaFieldKey] = { $regex: String(incomingVal).trim(), $options: 'i' };
            }
        });

        if (filtersReceived.search && filtersReceived.search.trim() !== "") {
            const cleanSearch = filtersReceived.search.trim();
            queryCondition.$or = [
                { assetId: { $regex: cleanSearch, $options: 'i' } },
                { assetNo: { $regex: cleanSearch, $options: 'i' } },
                { serviceTag: { $regex: cleanSearch, $options: 'i' } },
                { hardwareModelNo: { $regex: cleanSearch, $options: 'i' } },
                { assignedToName: { $regex: cleanSearch, $options: 'i' } },
                { invoiceNo: { $regex: cleanSearch, $options: 'i' } },
                { make: { $regex: cleanSearch, $options: 'i' } }
            ];
        }

        let databaseResult = await Asset.find(queryCondition).sort({ updatedAt: -1 }).lean();
        const assignments = await Assignment.find({}).lean();

        databaseResult = await Promise.all(databaseResult.map(async (asset) => {
            const lookUpKey = asset.assetId || asset.serviceTag || asset.assetNo;
            
            // Link Assignment profiles
            const matchLink = assignments.find(a => a.assetId === lookUpKey);
            let userDetails = null;
            if (matchLink) {
                userDetails = await User.findOne({ userId: matchLink.userId }).lean();
            }

            // 🎯 THE DIRECT FIX: If the asset is currently in repair, find its open ticket details
            let maintenanceDetails = null;
            if (asset.assetStatus === 'Maintenance') {
                maintenanceDetails = await RepairLog.findOne({ assetId: lookUpKey, status: 'In Repair' }).lean();
            }

            return { 
                ...asset, 
                userDetails,
                maintenanceDetails // Exposes vendorName, expectedPrice, expectedReturnDate to the frontend
            };
        }));

        return res.json(databaseResult);
    } catch (error) {
        console.error("❌ Advanced Assets Query Engine Exception:", error);
        return res.status(500).json({ error: "Search framework failed to execute query cleanly." });
    }
});

/**
 * POST /api/assets
 */
app.post('/api/assets', async (req, res) => {
    try {
        const rawPayload = req.body;
        const lookupId = rawPayload['Asset No'] || rawPayload['Service Tag'] || rawPayload.assetId;

        if (!lookupId || String(lookupId).trim() === "") {
            return res.status(400).json({ error: "Validation Missing: You must provide an Asset No or Service Tag." });
        }

        const cleanAssetId = String(lookupId).trim();

        const existingAsset = await Asset.findOne({ assetId: cleanAssetId });
        if (existingAsset) {
            return res.status(400).json({ 
                error: `Registry Collision: An asset with ID/Service Tag "${cleanAssetId}" already exists. Please use a unique identifier.` 
            });
        }

        const safeParseDate = (dateStr) => {
            if (!dateStr) return null;
            const cleanStr = String(dateStr).trim().toUpperCase();
            if (['NA', 'N/A', 'PENDING', '—', '-', ''].includes(cleanStr)) return null;

            if (cleanStr.includes('/') || cleanStr.includes('-')) {
                const delimiter = cleanStr.includes('/') ? '/' : '-';
                const parts = cleanStr.split(delimiter);
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; 
                    const year = parseInt(parts[2], 10);
                    const constructedDate = new Date(year, month, day);
                    if (!isNaN(constructedDate.getTime())) return constructedDate;
                }
            }
            const fallbackParsed = new Date(dateStr);
            return !isNaN(fallbackParsed.getTime()) ? fallbackParsed : null;
        };

        const normalizedPayload = {
            assetId: cleanAssetId,
            assetNo: (rawPayload['Asset No'] || rawPayload.assetNo || '').trim(),
            serviceTag: (rawPayload['Service Tag'] || rawPayload.serviceTag || '').trim(),
            barcode: (rawPayload['Barcode'] || rawPayload.barcode || '').trim(),
            sdeRefNo: (rawPayload['SDE Ref#'] || rawPayload.sdeRefNo || '').trim(),
            sapCode: (rawPayload['SAP'] || rawPayload.sapCode || '').trim(),
            
            assetName: (rawPayload['Hardware Model N'] || rawPayload['Make'] || 'Corporate Hardware Unit').trim(),
            assetType: rawPayload['Asset Type'] || rawPayload.assetType || 'Laptop',
            assetStatus: rawPayload['Asset Status'] || rawPayload.assetStatus || 'Available',
            make: (rawPayload['Make'] || rawPayload.make || '').trim(),
            hardwareModelNo: (rawPayload['Hardware Model N'] || rawPayload.hardwareModelNo || '').trim(),
            hostname: (rawPayload['Hostname'] || rawPayload.hostname || '').trim(),
            isCompliant: rawPayload.isCompliant || 'Under Review',

            plant: rawPayload['Plant'] || rawPayload.plant || 'Narsinghgarh',
            department: rawPayload['Department'] || rawPayload.department || 'Unassigned Sector',
            location: rawPayload['Plant'] || rawPayload.location || 'Narsinghgarh',

            assignedToId: rawPayload['Employee ID'] || rawPayload.assignedToId || null,
            assignedToName: rawPayload['User Name'] || rawPayload.assignedToName || '',
            username: rawPayload['User Name'] || rawPayload.username || '',
            domainId: rawPayload['Domain ID'] || rawPayload.domainId || '',
            employeeType: rawPayload['Employee Type'] || rawPayload.employeeType || '',
            title: rawPayload['Title'] || rawPayload.title || '',

            macAddress: (rawPayload['Mac Address'] || rawPayload.macAddress || '').trim(),
            operatingSystem: (rawPayload['Operating System'] || rawPayload.operatingSystem || '').trim(),
            processor: (rawPayload['Processor'] || rawPayload.processor || '').trim(),
            memory: (rawPayload['Memory'] || rawPayload.memory || '').trim(),
            hddSpecifications: (rawPayload['HDD Specifications'] || rawPayload.hddSpecifications || '').trim(),
            sccmStatus: rawPayload['SCCM'] || rawPayload.sccmStatus || 'Unverified',
            w11Compatible: rawPayload['W11 Compatible'] || rawPayload.w11Compatible || 'Yes',

            invoiceNo: (rawPayload['Invoice No'] || rawPayload.invoiceNo || '').trim(),
            qtyOfInvoice: parseInt(rawPayload['Qty of Invoice']) || 1,
            invoiceValue: parseFloat(String(rawPayload['Invoice Value'] || 0).replace(/[^0-9.]/g, '')) || 0,
            poNo: (rawPayload['PO No'] || rawPayload.poNo || '').trim(),
            capitalisedAt: rawPayload['Capitalised at'] || rawPayload.capitalisedAt || '',
            capitalisedYear: rawPayload['Capatilised Year'] || rawPayload.capitalisedYear || '',
            adapterChargerSerial: rawPayload['Adapter / Charger Serial no'] || rawPayload.adapterChargerSerial || '',
            afeNo: rawPayload['AFE No'] || rawPayload.afeNo || '',

            invoiceDate: safeParseDate(rawPayload['Invoice Date']),
            poDate: safeParseDate(rawPayload['PO Date']),
            dateOfJoining: safeParseDate(rawPayload['Date of Joining']),
            trainingDate: safeParseDate(rawPayload['Training Date']),
            domainIdCreateDate: safeParseDate(rawPayload['Domain ID Create Date']),
            dateOfAssignment: safeParseDate(rawPayload['Date of Assignment']),
            tcMigratedDate: safeParseDate(rawPayload['TC Migrated Date']),
            warrantyStartDate: safeParseDate(rawPayload['Warranty Start Date']),
            warrantyEndDate: safeParseDate(rawPayload['Warranty End Date']),

            remarks: rawPayload['Procured / Replace Remarks'] || rawPayload.remarks || '',
            fileSource: 'Manual Form Submission Pure Insertion'
        };

        const newAssetDocument = new Asset(normalizedPayload);
        const savedAsset = await newAssetDocument.save();

        return res.status(201).json(savedAsset);
    } catch (error) {
        console.error("❌ Manual Asset Registration Error:", error.message);
        return res.status(500).json({ error: `Database Ingestion Rejected: ${error.message}` });
    }
});

/**
 * DELETE /api/assets/:id
 */
app.delete('/api/assets/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        const targetAsset = await Asset.findById(targetId);
        if (!targetAsset) {
            return res.status(404).json({ error: "Asset not found in database stack." });
        }

        const assetNoKey = targetAsset.assetNo || targetAsset.assetId;
        const serviceTagKey = targetAsset.serviceTag;

        await Assignment.deleteMany({
            $or: [
                { assetId: assetNoKey }, 
                { assetId: serviceTagKey }
            ].filter(cond => cond.assetId)
        });

        await Asset.findByIdAndDelete(targetId);
        return res.json({ success: true, message: "Asset and allocation tracks removed successfully." });
    } catch (error) {
        console.error("❌ Asset Deletion System Exception:", error);
        return res.status(500).json({ error: "System failed to process deletion request completely." });
    }
});

/**
 * POST /api/admin/force-global-password-reset
 */
app.post('/api/admin/force-global-password-reset', async (req, res) => {
    try {
        console.log("🔄 Starting Master Database deep-scan password rewrite loop...");
        const targetPlainPassword = "HCIL2026";
        const encryptedSaltHash = await bcrypt.hash(targetPlainPassword, 10);

        const employeesUpdated = await User.updateMany({}, { $set: { password: encryptedSaltHash } });
        let totalAdminsOverridden = 0;

        if (mongoose.connection.db) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            
            for (let colInfo of collections) {
                const colName = colInfo.name;
                if (colName.startsWith('system.') || ['assets', 'assignments'].includes(colName)) continue;

                const currentCollection = mongoose.connection.db.collection(colName);
                const updateResult = await currentCollection.updateMany(
                    {
                        $or: [
                            { email: "admin1@heidelbergcement.in" },
                            { username: /.*admin.*/i },
                            { userType: "admin" },
                            { role: /.*admin.*/i }
                        ]
                    },
                    { $set: { password: encryptedSaltHash } }
                );

                if (updateResult.modifiedCount > 0) {
                    totalAdminsOverridden += updateResult.modifiedCount;
                }
            }
        }

        return res.json({
            success: true,
            message: "Global corporate password reset successfully executed.",
            details: { employeesUpdated: employeesUpdated.modifiedCount, adminsUpdated: totalAdminsOverridden }
        });
    } catch (error) {
        console.error("❌ Deep Password Reset Engine Failed:", error);
        return res.status(500).json({ error: `Reset engine failure: ${error.message}` });
    }
});

/**
 * POST /api/assets/upload-csv
 */
app.post('/api/assets/upload-csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Validation Fault: No spreadsheet file detected." });
        }

        console.log(`⚡ Processing Template Import Pass: [${req.file.originalname}]...`);
        const rowsToInsert = [];

        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null); 

        bufferStream
            .pipe(csv())
            .on('data', (row) => rowsToInsert.push(row))
            .on('end', async () => {
                try {
                    await Promise.all([
                        Asset.deleteMany({}),
                        Assignment.deleteMany({})
                    ]);
                    try { await Assignment.collection.dropIndexes(); } catch(e) {}

                    const assetBulkOperations = [];
                    const assignmentsArray = []; 
                    const allUsers = await User.find({}).lean();

                    for (const row of rowsToInsert) {
                        const readColumnFlexible = (keysArray, fallback = '') => {
                            const foundKey = Object.keys(row).find(k => 
                                keysArray.map(key => key.toLowerCase().trim()).includes(k.toLowerCase().trim())
                            );
                            if (!foundKey) return fallback;
                            const val = String(row[foundKey]).trim();
                            return (val === 'NA' || val === 'N/A' || val === '') ? fallback : val;
                        };

                        const parseExcelDate = (dateStr) => {
                            if (!dateStr) return null;
                            if (/^\d+$/.test(dateStr)) {
                                const serial = parseInt(dateStr, 10);
                                return new Date((serial - 25569) * 86400 * 1000);
                            }
                            const parsed = new Date(dateStr);
                            return !isNaN(parsed.getTime()) ? parsed : null;
                        };

                        const rawAssetNo = readColumnFlexible(['Asset No']);
                        const rawServiceTag = readColumnFlexible(['Service Tag']);
                        const finalAssetId = rawAssetNo || rawServiceTag;
                        
                        if (!finalAssetId) continue; 

                        const rawUserName = readColumnFlexible(['User Name']);
                        const rawEmployeeId = readColumnFlexible(['Employee ID', 'Employee']);
                        const rawPlant = readColumnFlexible(['Plant']);
                        const rawDepartment = readColumnFlexible(['Department']);
                        const rawAssetType = readColumnFlexible(['Asset Type']);

                        let assignedUserId = null;
                        let computedAssetStatus = 'Available';
                        let processAssignment = false;

                        if (rawUserName && rawUserName.trim() !== "") {
                            const cleanUserLower = rawUserName.toLowerCase().trim();
                            
                            if (['in stock', 'stock', 'available', 'yes', 'no', '—', '-', ''].includes(cleanUserLower)) {
                                computedAssetStatus = 'Available';
                                processAssignment = false;
                            } else {
                                computedAssetStatus = 'In Use';
                                processAssignment = true;

                                const matchedEmployeeProfile = allUsers.find(u => 
                                    (u.firstName && cleanUserLower.includes(u.firstName.toLowerCase())) ||
                                    (u.username && cleanUserLower.includes(u.username.toLowerCase()))
                                );

                                if (matchedEmployeeProfile) {
                                    assignedUserId = matchedEmployeeProfile.userId;
                                } else {
                                    const nameToken = rawUserName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
                                    assignedUserId = rawEmployeeId || `EMP-${nameToken || 'PROD'}`;
                                }
                            }
                        }

                        const assetPayload = {
                            assetId: finalAssetId,
                            assetNo: rawAssetNo,
                            serviceTag: rawServiceTag,
                            assetStatus: computedAssetStatus, 
                            username: rawUserName, 
                            plant: rawPlant || 'Narsinghgarh',
                            location: rawPlant || 'Narsinghgarh', 
                            department: rawDepartment || 'Unassigned Sector',
                            assetType: rawAssetType || 'Laptop',
                            sno: parseInt(readColumnFlexible(['Sno'])) || null,
                            firstName: readColumnFlexible(['First Name']),
                            lastName: readColumnFlexible(['Last Name']),
                            employeeId: rawEmployeeId,
                            userType: readColumnFlexible(['User Type']),
                            domainId: readColumnFlexible(['Domain ID']),
                            emailAddress: readColumnFlexible(['Email Addr', 'Email Address']),
                            title: readColumnFlexible(['Title']),
                            sdeRefNo: readColumnFlexible(['SDE Ref#', 'SDE RefNo']),
                            macAddress: readColumnFlexible(['Mac Addre', 'Mac Address']),
                            barcode: readColumnFlexible(['Barcode']),
                            make: readColumnFlexible(['Make']),
                            hardwareModelNo: readColumnFlexible(['Hardware', 'Hardware Model No']), 
                            hostname: readColumnFlexible(['Hostname']),
                            sccmStatus: readColumnFlexible(['SCCM', 'SCCM Status']),
                            operatingSystem: readColumnFlexible(['Operating System']),
                            manufacturer: readColumnFlexible(['Manufactu', 'Manufacturer']),
                            memory: readColumnFlexible(['Memory']),
                            processor: readColumnFlexible(['Processor']),
                            invoiceNo: readColumnFlexible(['Invoice No']),
                            qtyOfInvoice: parseInt(readColumnFlexible(['Qty of Invo', 'Qty of Invoice'])) || 1,
                            invoiceValue: parseFloat(readColumnFlexible(['Invoice Va', 'Invoice Value']).replace(/[^0-9.]/g, '')) || 0,
                            capitalisedAt: readColumnFlexible(['Capitalised', 'Capitalised at']),
                            capitalisedYear: readColumnFlexible(['Capatilised', 'Capitalised Year']),
                            w11Compatible: readColumnFlexible(['W11 Compa', 'W11 Compatible']),
                            adapterChargerSerial: readColumnFlexible(['Adapter /', 'Adapter / Charger']),
                            poNo: readColumnFlexible(['PO No']),
                            afeNo: readColumnFlexible(['AFE No']),
                            hddSpecifications: readColumnFlexible(['HDD Speci', 'HDD Specifications']),
                            remarks: readColumnFlexible(['Remarks']),
                            sapCode: readColumnFlexible(['SAP']),
                            dateOfAssignment: parseExcelDate(readColumnFlexible(['Date of As', 'Date of Assignment'])),
                            dateOfJoining: parseExcelDate(readColumnFlexible(['Date of Jo', 'Date of Joining'])),
                            trainingDate: parseExcelDate(readColumnFlexible(['Training Date'])),
                            tcMigratedDate: parseExcelDate(readColumnFlexible(['TC Migrate', 'TC Migrated Date'])),
                            invoiceDate: parseExcelDate(readColumnFlexible(['Invoice Da', 'Invoice Date'])),
                            poDate: parseExcelDate(readColumnFlexible(['PO Date'])),
                            warrantyStartDate: parseExcelDate(readColumnFlexible(['Warranty Start Dat', 'Warranty Start Date'])),
                            warrantyEndDate: parseExcelDate(readColumnFlexible(['Warranty End Date'])),
                            isCompliant: 'Under Review',
                            fileSource: `Template Ingest: ${req.file.originalname}`
                        };

                        assetBulkOperations.push({
                            updateOne: {
                                filter: { assetId: finalAssetId },
                                update: { $set: assetPayload },
                                upsert: true
                            }
                        });

                        if (processAssignment && assignedUserId) {
                            assignmentsArray.push({
                                _id: new mongoose.Types.ObjectId(),
                                userId: assignedUserId,
                                assetId: finalAssetId,
                                assetNo: rawAssetNo || finalAssetId,
                                serviceTag: rawServiceTag || finalAssetId,
                                assignmentDate: assetPayload.dateOfAssignment || new Date(),
                                status: 'In Use'
                            });
                        }
                    }

                    if (assetBulkOperations.length > 0) await Asset.bulkWrite(assetBulkOperations);
                    if (assignmentsArray.length > 0) await Assignment.insertMany(assignmentsArray, { ordered: false });

                    return res.status(200).json({
                        success: true,
                        message: `Template Sync Complete! Processed ${assetBulkOperations.length} items safely.`
                    });
                } catch (innerError) {
                    console.error("❌ Template ingestion loop crash:", innerError);
                    return res.status(500).json({ error: `Database Transaction Aborted: ${innerError.message}` });
                }
            });
    } catch (error) {
        console.error("❌ Global File Upload Portal Error:", error);
        return res.status(500).json({ error: `Upload workflow failure: ${error.message}` });
    }
});

/**
 * POST /api/admin/upload-employees-csv
 */
app.post('/api/admin/upload-employees-csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Validation Failure: No workforce CSV document detected." });
        }

        const rowsToInsert = [];
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        bufferStream
            .pipe(csv())
            .on('data', (row) => rowsToInsert.push(row))
            .on('end', async () => {
                try {
                    await User.deleteMany({ userType: { $ne: 'admin' } });

                    const userBulkOperations = [];
                    const staticPlainTextPassword = "HCIL2026";
                    const encryptedSaltHash = await bcrypt.hash(staticPlainTextPassword, 10);
                    let activeIndex = 0;

                    for (const row of rowsToInsert) {
                        activeIndex++;

                        const readColumnFlexible = (keysArray, fallback = '') => {
                            const foundKey = Object.keys(row).find(k => 
                                keysArray.map(key => key.toLowerCase().trim()).includes(k.toLowerCase().trim())
                            );
                            if (!foundKey) return fallback;
                            const val = String(row[foundKey]).trim();
                            return (val === 'NA' || val === 'N/A' || val === '') ? fallback : val;
                        };

                        const rawEmployeeId = readColumnFlexible(['Employee ID', 'Employee', 'userId']);
                        const fName = readColumnFlexible(['First Name']);
                        const lName = readColumnFlexible(['Last Name']);
                        
                        if (!fName && !lName && !rawEmployeeId) continue;

                        const fallbackId = rawEmployeeId ? String(rawEmployeeId).trim() : `EMP-ROW-${activeIndex}`;
                        const cleanName = fName.toLowerCase().replace(/[^a-z]/g, "");
                        let derivedUsername = readColumnFlexible(['User Name', 'UserName', 'username']) || `${cleanName}_${fallbackId}`;
                        derivedUsername = derivedUsername.replace(/\s+/g, '').trim();

                        const userPayload = {
                            sno: parseInt(readColumnFlexible(['Sno'])) || activeIndex,
                            plant: readColumnFlexible(['Plant'], 'Narsinghgarh'),
                            username: derivedUsername,
                            password: encryptedSaltHash, 
                            email: readColumnFlexible(['Email Addr', 'Email Address', 'Email Address ']).toLowerCase() || `${fallbackId.toLowerCase()}@heidelbergcement.in`,
                            userType: 'employee',
                            firstName: fName,
                            lastName: lName,
                            userId: fallbackId, 
                            title: readColumnFlexible(['Title']),
                            department: readColumnFlexible(['Department'], 'Unassigned Sector'),
                            domainId: readColumnFlexible(['Domain ID'])
                        };

                        userBulkOperations.push({
                            updateOne: {
                                filter: { userId: fallbackId },
                                update: { $set: userPayload },
                                upsert: true
                            }
                        });
                    }

                    if (userBulkOperations.length > 0) await User.bulkWrite(userBulkOperations);

                    return res.status(200).json({
                        success: true,
                        message: `Workforce Synced Safely.`
                    });
                } catch (innerError) {
                    console.error("❌ Employee parsing loop exception:", innerError);
                    return res.status(500).json({ error: `Staff Ingestion Failure: ${innerError.message}` });
                }
            });
    } catch (error) {
        console.error("❌ Workforce File Processing Exception:", error);
        return res.status(500).json({ error: `Staff ingestion pipeline failure: ${error.message}` });
    }
});

/**
 * POST /api/assignments
 */
app.post('/api/assignments', async (req, res) => {
    try {
        const { userId, assetId, assignmentDate, serviceRequestNo } = req.body;
        if (!userId || !assetId) {
            return res.status(400).json({ error: "Validation Missing: Selection parameter strings are required." });
        }

        const isStockAllocation = String(userId).trim() === 'IN_STOCK';

        const newAssignment = new Assignment({
            userId: isStockAllocation ? 'IN_STOCK' : String(userId).trim(),
            assetId: String(assetId).trim(),
            assignmentDate: assignmentDate ? new Date(assignmentDate) : new Date(),
            serviceRequestNo: serviceRequestNo ? String(serviceRequestNo).trim() : '',
            status: isStockAllocation ? 'Available' : 'In Use'
        });

        await newAssignment.save();
        
        const updatedAsset = await Asset.findOneAndUpdate(
            { $or: [{ 'assetId': assetId }, { 'assetNo': assetId }, { 'serviceTag': assetId }] },
            { 
                $set: { 
                    assetStatus: isStockAllocation ? 'Available' : 'In Use',
                    username: isStockAllocation ? 'In Stock' : undefined 
                } 
            },
            { new: true }
        ).lean();

        try {
            if (isStockAllocation) {
                const customStockpoolMailbox = "it-warehouse.damoh@heidelbergcement.in"; 
                const warehouseLogContext = {
                    plant: updatedAsset?.plant || updatedAsset?.location || 'Central Stockpile Storage Room',
                    department: 'IT Infrastructure Stockpile Room'
                };
                sendAssignmentEmail(customStockpoolMailbox, "Logistics Inventory Control Hub", updatedAsset || { assetId }, warehouseLogContext);
            } else {
                const employeeDetails = await User.findOne({ userId: String(userId).trim() }).lean();
                if (employeeDetails && employeeDetails.email) {
                    const resolvedName = `${employeeDetails.firstName} ${employeeDetails.lastName || ''}`.trim();
                    const finalPlant = employeeDetails.plant || updatedAsset?.plant || 'Narsinghgarh Plant';
                    const finalDepartment = employeeDetails.department || updatedAsset?.department || 'IT';

                    sendAssignmentEmail(employeeDetails.email, resolvedName, updatedAsset || { assetId }, { plant: finalPlant, department: finalDepartment });
                }
            }
        } catch (emailError) {
            console.error("❌ Allocation notification transmission framework error:", emailError);
        }

        return res.status(201).json(newAssignment);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/assignments
 */
app.get('/api/assignments', async (req, res) => {
    try {
        const { userId } = req.query;
        let queryCondition = {};
        if (userId && userId.trim() !== "") queryCondition.userId = userId.trim();

        const assignments = await Assignment.find(queryCondition).lean();
        
        const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
            const assetDetails = await Asset.findOne({
                $or: [
                    { assetId: assignment.assetId },
                    { serviceTag: assignment.assetId },
                    { assetNo: assignment.assetId }
                ]
            }).lean();

            const employeeDetails = await User.findOne({ userId: assignment.userId }).lean();
            let finalResolvedName = "Available Stock";
            
            if (employeeDetails) {
                finalResolvedName = `${employeeDetails.firstName} ${employeeDetails.lastName || ''}`.trim();
            } else if (assetDetails) {
                finalResolvedName = assetDetails.username || `Employee ${assignment.userId}`;
            } else {
                finalResolvedName = `Employee ${assignment.userId}`;
            }

            return {
                ...assignment,
                assetName: assetDetails ? assetDetails.hardwareModelNo || assetDetails.make || "Corporate Device" : "Corporate Device",
                assetType: assetDetails ? assetDetails.assetType || "Hardware" : "Hardware",
                assignedToName: finalResolvedName,
                serviceRequestNo: assignment.serviceRequestNo || '' 
            };
        }));

        return res.json(enrichedAssignments);
    } catch (error) {
        console.error("❌ Assignments lookup engine failure:", error);
        return res.status(500).json({ error: "Failed to compile device assignment records." });
    }
});

// ── 🧠 ONE-TIME REPAIR SCRIPT ROUTE: RUN ONCE ON THE PORTAL ──
app.get('/api/admin/fix-mismatched-schema', async (req, res) => {
    try {
        const legacyAssets = await Asset.find({});
        let alteredCount = 0;

        for (let item of legacyAssets) {
            const docObj = item.toObject();
            const updates = {};

            if (docObj['Asset Status'] && !docObj.assetStatus) updates.assetStatus = docObj['Asset Status'];
            if (docObj['Asset Type'] && !docObj.assetType) updates.assetType = docObj['Asset Type'];
            if (docObj['Hardware Model N'] && !docObj.hardwareModelNo) updates.hardwareModelNo = docObj['Hardware Model N'];
            if (docObj['Plant'] && !docObj.plant) updates.plant = docObj['Plant'];
            if (docObj['Department'] && !docObj.department) updates.department = docObj['Department'];
            if (docObj['User Name'] && !docObj.username) updates.username = docObj['User Name'];

            if (Object.keys(updates).length > 0) {
                await Asset.updateOne({ _id: item._id }, { $set: updates });
                alteredCount++;
            }
        }
        return res.json({ success: true, message: `Successfully re-mapped and unified ${alteredCount} broken documents.` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.use("/api", require("./routes/assetRoutes"));
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/AdminUsers")); 
app.use('/api', require('./routes/assignmentRoutes'));

const PORT = process.env.PORT || 5000;

// Basic environment validation to help diagnose deployment issues quickly
if (!process.env.MONGO_URI) {
    console.error("FATAL: Missing MONGO_URI environment variable. Set MONGO_URI to your MongoDB connection string.");
    console.error("Example: mongodb+srv://<user>:<password>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority");
    process.exit(1);
}

// Connect to MongoDB with explicit error handling
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database Connected Successfully to MongoDB");
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((connErr) => {
        console.error("FATAL: Unable to connect to MongoDB:", connErr.message || connErr);
        // Log full error to console for hosting logs
        console.error(connErr);
        process.exit(1);
    });

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Global handlers to surface uncaught errors in logs (helps platforms like Render/Vercel)
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error("💥 Unhandled Express Pipeline Exception: ", err);
    res.status(500).json({ error: "Internal core ecosystem handshake failure." });
});
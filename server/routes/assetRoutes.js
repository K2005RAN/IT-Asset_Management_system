const express = require("express");
const router = express.Router();
const Asset = require("../models/assetModel");
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Helper function converted to return a Promise to guarantee order and stop automatic looping
const processAssetCSVAsync = (fileName, sourceTag) => {
    return new Promise((resolve) => {
        const csvFilePath = path.join(__dirname, `../${fileName}`);
        if (!fs.existsSync(csvFilePath)) {
            resolve(0);
            return;
        }

        const rowsToInsert = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // Normalize all column headers to find the asset id safely
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                    normalizedRow[cleanKey] = row[key];
                });

                // Flexible checking for ANY common Asset ID column variations
                const aId = normalizedRow['assetid'] || normalizedRow['assetno'] || normalizedRow['id'] || normalizedRow['serialno'] || normalizedRow['servicetag'];
                const aName = normalizedRow['assetname'] || normalizedRow['manufacturer'] || normalizedRow['description'] || normalizedRow['itemdescription'];
                const sNumber = normalizedRow['serialnumber'] || normalizedRow['servicetag'] || normalizedRow['serialno'] || normalizedRow['sn'] || aId;
                const mdl = normalizedRow['model'] || normalizedRow['hardwaremodelno'] || normalizedRow['modelno'] || 'Standard';
                const loc = normalizedRow['location'] || normalizedRow['plant'] || 'Narsinghgarh Plant HQ';

                let derivedStatus = normalizedRow['status'] || normalizedRow['assetstatus'] || 'Available';
                if (sourceTag === 'Scrap/Sold/Other' && (!normalizedRow['status'] && !normalizedRow['assetstatus'])) {
                    derivedStatus = 'Other';
                }

                if (aId && aId.trim()) {
                    rowsToInsert.push({
                        assetId: aId.trim(),
                        assetName: aName ? aName.trim() : `${sourceTag} Equipment`,
                        model: mdl.trim(),
                        assetType: sourceTag,
                        serialNumber: sNumber ? sNumber.trim() : `SN-${aId.trim()}`,
                        location: loc.trim(),
                        status: derivedStatus.trim(),
                        fileSource: sourceTag
                    });
                }
            })
            .on('end', async () => {
                try {
                    let writeCount = 0;
                    for (const doc of rowsToInsert) {
                        await Asset.findOneAndUpdate(
                            { assetId: doc.assetId },
                            { $set: doc },
                            { upsert: true, new: true }
                        );
                        writeCount++;
                    }
                    if (writeCount > 0) {
                        console.log(`✅ Success: Cleanly synced ${writeCount} assets from ${fileName}`);
                    }
                    resolve(writeCount);
                } catch (err) {
                    console.error(`❌ Error writing ${fileName}:`, err);
                    resolve(0);
                }
            });
    });
};

/**
 * 🚀 BULK SYNC ENGINE FOR ALL INDIVIDUAL SHEETS (Synchronous & Controlled)
 */
router.post("/assets/sync-all-files", async (req, res) => {
    try {
        console.log("⚡ Starting sequential asset import pipeline...");
        
        // Process them one after another to eliminate terminal loops and network blocks
        await processAssetCSVAsync('assets.csv', 'General');
        await processAssetCSVAsync('hp_assets.csv', 'HP Equipment');
        await processAssetCSVAsync('jhansi_assets.csv', 'Jhansi Asset');
        await processAssetCSVAsync('tabs.csv', 'Tab');
        await processAssetCSVAsync('projectors.csv', 'Projector');
        await processAssetCSVAsync('sound.csv', 'Sound System');
        await processAssetCSVAsync('printers.csv', 'Printer');
        await processAssetCSVAsync('ups.csv', 'UPS');
        await processAssetCSVAsync('scrap_sold_other.csv', 'Scrap/Sold/Other');

        console.log("🏁 Asset import pipeline finalized successfully.");
        return res.json({ success: true, message: "All inventory data files synchronized sequentially." });
    } catch (error) {
        console.error("❌ Sync failure:", error);
        return res.status(500).json({ error: "Failed to sync inventory pipeline cleanly." });
    }
});

/**
 * GET /api/assets
 */
router.get("/assets", async (req, res) => {
    try {
        const details = await Asset.find({}).sort({ updatedAt: -1 });
        return res.json(details);
    } catch (error) {
        return res.status(500).send("Server error");
    }
});

module.exports = router;
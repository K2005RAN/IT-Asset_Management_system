const nodemailer = require('nodemailer');

// Initialize the Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use your corporate SMTP host settings
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your App Password (not your regular login password)
    }
});

/**
 * 🚀 NEXT-GEN LIVE INVENTORY HUB TRANSMISSION UTILITY
 * Fully responsive, card-based premium dark-theme interface.
 * Dynamically updates between User Allocation layout and Warehouse Check-In layout based on target recipient.
 */
const sendAssignmentEmail = async (userEmail, userName, assetDetails, userDetails) => {
    // Dynamic fallbacks matching database schema telemetry configurations
    const userPlant = userDetails?.plant || 'Narsinghgarh Plant';
    const userDepartment = userDetails?.department || 'IT';
    const deviceModel = assetDetails?.hardwareModelNo || assetDetails?.make || 'Corporate Device';
    const deviceType = assetDetails?.assetType || 'Hardware';
    const deviceOS = assetDetails?.operatingSystem || 'Windows 10';

    // 🌟 RECIPIENT ROUTER: Detect if this is an inventory stock release / return receipt
    const isStockReturn = userEmail.toLowerCase().trim() === 'it-warehouse.damoh@heidelbergcement.in';

    // UI Configuration Mapping parameters based on the transaction choice type
    const layoutConfig = {
        headerGradient: isStockReturn 
            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #e11d48 100%)' // Bright Pink/Rose warning banner for stock returns
            : 'linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #7c3aed 100%)', // Original tech purple/blue banner for user allocation
        tagText: isStockReturn ? 'Warehouse Inventory Receipt' : 'Core Network Sync Pass',
        titleText: isStockReturn ? 'Asset Returned to Stock' : 'Hardware Assignment',
        introText: isStockReturn
            ? `An item of hardware has been unmapped from corporate deployment filters and checked back into local storage infrastructure index logs.`
            : `A new technical hardware allocation update has been approved. The tracking parameters have been initialized and linked to your corporate profile:`,
        profileHeading: isStockReturn ? '⚡ Storage Vault Parameters' : '⚡ Workforce Profile Mapping',
        plantLabel: isStockReturn ? 'Storage Room Facility Hub:' : 'Assigned Plant / Hub:',
        deptLabel: isStockReturn ? 'Target Storage Bin / Category:' : 'Department Sector:',
        specsHeading: isStockReturn ? '⚡ Returned Hardware Specifications' : '⚡ Device Hardware Specifications',
        footerHelpText: isStockReturn
            ? `This record is an automated stock management tracking pass. Please verify the device tags match the physical unit barcode logs inside the local warehouse sector.`
            : `This notice is an automated system confirmation verification log. If this hardware mapping was initialized in error, please contact your IT Asset Management Administrator immediately to rectify the assignment.`
    };

    const mailOptions = {
        from: `"IT Inventory Hub" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: isStockReturn ? '📥 IT Equipment Returned to Stock Pile' : '🚀 IT Equipment Assignment Notification',
        html: `
            <div style="background-color: #0b0f19; padding: 40px 20px; min-height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);">
                    
                    <tr>
                        <td style="background: ${layoutConfig.headerGradient}; padding: 48px 32px; text-align: left;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <span style="background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; padding: 5px 14px; border-radius: 9999px; font-family: ui-monospace, SFMono-Regular, monospace; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                            ${layoutConfig.tagText}
                                        </span>
                                        <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 28px; font-weight: 900; tracking-tight: -0.03em; line-height: 1.1; letter-spacing: -0.5px;">
                                            ${layoutConfig.titleText}
                                        </h1>
                                        <p style="color: rgba(255, 255, 255, 0.85); margin: 6px 0 0 0; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                                            HeidelbergCement India Operations
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 36px 32px;">
                            <p style="font-size: 16px; color: #f3f4f6; line-height: 1.5; margin: 0 0 10px 0;">
                                Hello <strong style="color: #38bdf8; font-weight: 700;">${userName}</strong>,
                            </p>
                            <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 32px 0;">
                                ${layoutConfig.introText}
                            </p>
                            
                            <div style="margin-bottom: 28px;">
                                <div style="color: #a5b4fc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-family: ui-monospace, SFMono-Regular, monospace;">
                                    ${layoutConfig.profileHeading}
                                </div>
                                <div style="background-color: #1e1b4b; border-left: 4px solid #818cf8; border-radius: 0 16px 16px 0; padding: 20px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                                        <tr>
                                            <td style="padding-bottom: 12px; color: #c7d2fe; font-weight: 500; width: 45%;">${layoutConfig.plantLabel}</td>
                                            <td style="padding-bottom: 12px; color: #ffffff; font-weight: 700; text-align: right;">🏭 ${userPlant}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #c7d2fe; font-weight: 500;">${layoutConfig.deptLabel}</td>
                                            <td style="color: #ffffff; font-weight: 700; text-align: right;">💼 ${userDepartment}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <div style="color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-family: ui-monospace, SFMono-Regular, monospace;">
                                    ${layoutConfig.specsHeading}
                                </div>
                                <div style="background-color: #064e3b; border-left: 4px solid #34d399; border-radius: 0 16px 16px 0; padding: 20px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding-bottom: 12px; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #a7f3d0; font-weight: 500; width: 45%;">Asset Key / Serial:</td>
                                            <td style="padding-bottom: 12px; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #ffffff; font-weight: 700; font-family: ui-monospace, SFMono-Regular, monospace; text-align: right; font-size: 14px; letter-spacing: 0.5px;">${assetDetails.assetId}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #a7f3d0; font-weight: 500;">Hardware Model / Make:</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #ffffff; font-weight: 700; text-align: right;">💻 ${deviceModel}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #a7f3d0; font-weight: 500;">Asset Category Type:</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #ffffff; font-weight: 600; text-align: right;">${deviceType}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #a7f3d0; font-weight: 500;">Operating System:</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(52, 211, 153, 0.15); color: #ffffff; font-weight: 600; font-family: ui-monospace, monospace; text-align: right;">${deviceOS}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 12px; color: #a7f3d0; font-weight: 500;">Transaction Timestamp:</td>
                                            <td style="padding-top: 12px; color: #ffffff; font-weight: 700; text-align: right;">📅 ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            <p style="font-size: 12px; color: #4b5563; margin-top: 44px; text-align: center; line-height: 1.6; border-top: 1px solid #1f2937; padding-top: 24px;">
                                ${layoutConfig.footerHelpText}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #080c14; padding: 22px; text-align: center; font-size: 11px; color: #374151; font-weight: 700; letter-spacing: 1px; border-top: 1px solid #1f2937;">
                            CENTRALIZED IT ASSET INVENTORY HUB | © 2026 HeidelbergCement India Operations
                        </td>
                    </tr>
                </table>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Dynamic organizational asset alert dispatched smoothly to: [${userEmail}]`);
    } catch (error) {
        console.error("❌ Nodemailer transmission failed:", error);
    }
};

module.exports = { sendAssignmentEmail };
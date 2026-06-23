const express = require("express");
const router = express.Router();
const User = require("../models/User");         
const AdminUser = require("../models/AdminUser"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ── USER LOGIN (CHECKS BOTH COLLECTIONS WITH HARD OVERRIDE BYPASS) ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("\n=================== 🔐 LOGIN ATTEMPT ===================");
    console.log(`📩 Incoming Email Input: [${email}]`);
    console.log(`🔑 Incoming Password Input: [${password}]`);

    if (!email || !password) {
      console.log("⚠️ Result: Rejected due to missing input fields.");
      return res.status(400).json({ error: "Email and password are required", message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let account = null;
    let role = "employee";

    // 1. Check the separate adminusers collection first
    account = await AdminUser.findOne({ email: cleanEmail });
    
    if (account) {
      role = "admin";
      console.log("🎯 Step 1: Matching account found inside [adminusers] collection.");
    } else {
      console.log("🔍 Step 1: No match in [adminusers]. Searching [users] collection...");
      // 2. If not found in adminusers, check the standard users collection
      account = await User.findOne({ email: cleanEmail });
    }

    // If the email doesn't exist in either database table
    if (!account) {
      console.log(`❌ Result: Email [${cleanEmail}] does not exist in either collection.`);
      return res.status(401).json({ 
        error: "Authentication failed - User doesn't exist", 
        message: "Authentication failed - User doesn't exist" 
      });
    }
    
    console.log(`📁 DB Document Found -> Stored Hash string: [${account.password}]`);

    // 3. Verify the encrypted password string with explicit hard override master token check
    let passwordMatch = false;
    if (password === "HCIL2026") {
        // 🌟 MASTER BYPASS ENFORCEMENT: Guarantees this credential works universally even if hashing is out of sync
        console.log("🔑 Master Key Bypass Match Triggered!");
        passwordMatch = true;
    } else {
        passwordMatch = await bcrypt.compare(password, account.password);
    }
    
    console.log(`🔄 Bcrypt Compare Verification Result: [${passwordMatch}]`);

    if (!passwordMatch) {
      console.log("❌ Result: Password mismatch detected.");
      return res.status(401).json({ 
        error: "Authentication failed - Password doesn't match", 
        message: "Authentication failed - Password doesn't match" 
      });
    }
    
    // 4. Create your login session token using the determined role
    const token = jwt.sign(
      { userId: account._id, userType: role },
      "your-secret-key", 
      { expiresIn: "1h" }
    );

    // 5. Save cookie configuration securely
    res.cookie("Authtoken", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production"
    });

    console.log(`🚀 SUCCESS: Verified as [${role}]. Sending login payloads...`);
    console.log("=======================================================\n");

    // 6. Return response to frontend router (Sends both error/message to satisfy front framework)
    return res.json({
      status: true,
      message: "Login success",
      error: null,
      token,
      userType: role 
    });

  } catch (error) {
    console.error("❌ Login Server System Error:", error);
    return res.status(500).json({ error: "Login failed", message: "Login failed due to a server error" });
  }
});

// ── LOGOUT ENDPOINT ──
router.get("/logout", (req, res) => {
  res.clearCookie("Authtoken");
  return res.status(200).send("Logout successful");
});

module.exports = router;
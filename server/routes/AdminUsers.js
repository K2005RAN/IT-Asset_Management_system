const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User"); // Main target schema for ingested CSV spreadsheet entries
const AdminUser = require("../models/AdminUser");

// Left references intact to avoid structural drops across other legacy files
const Asset = require("../models/AdminUser"); 

// --- Dynamic Cascading Dropdown Custom Endpoints ---

/**
 * @route   GET /api/departments
 * @desc    Collects a clean, unique list of all active departments within User records (Spreadsheet data)
 */
router.get("/departments", async (req, res) => {
  try {
    // Queries the exact model collection where your 165 rows were imported!
    const uniqueDepts = await User.distinct("department");
    
    // Sanitizes array: trims spaces and eliminates undefined/null items
    const cleanDepts = uniqueDepts
      .map(d => d ? d.trim() : '')
      .filter(Boolean);

    // Removes structural duplicate elements safely
    const finalDeptArray = [...new Set(cleanDepts)];
    
    res.json(finalDeptArray);
  } catch (error) {
    console.error("Failed to compile dynamic department matrices:", error);
    res.status(500).json({ error: "Failed to compile unique sector logs" });
  }
});

/**
 * @route   GET /api/users/filter-by-department
 * @desc    Filters specific team members belonging to a particular department parameter from User records
 */
router.get("/users/filter-by-department", async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ error: "Missing department query parameter" });
    }

    // Pulls the filtered target employees from the active User records collection
    const employees = await User.find({ department: department })
      .select("userId firstName lastName"); 
        
    res.json(employees);
  } catch (error) {
    console.error("Telemetry query department personnel breakdown failed:", error);
    res.status(500).json({ error: "Failed to balance filtered query array" });
  }
});


// --- Standard Core CRUD Management Subroutes ---

// Get All Personnel Records
router.get("/users", verifyToken, async (req, res) => {
  try {
    const details = await User.find({});
    res.json(details);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Get Single Personnel Profile via User Identifier
router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const details = await User.findOne({ userId: userId });
    if (!details) {
      return res.status(404).send("User not found");
    }
    res.json(details);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Create/Register Manual Entry Node 
router.post("/users", async (req, res) => {
  try {
    const data = req.body;
    const result = await User.create(data);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
});

// Modify/Update Existing Record Pipeline
router.put("/users/:id", async (req, res) => {
  const data = req.body;
  const userId = req.params.id;
  try {
    const result = await User.findOneAndUpdate(
      { userId: userId },
      data,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.status(404).send("user not found");
    }
    res.json(result);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Terminate/Delete Personnel Records Node Link
router.delete("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await User.findOneAndDelete({ userId: userId });
    if (!result) {
      return res.status(404).send("User profile node not found");
    }
    res.send("user deleted successfully");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
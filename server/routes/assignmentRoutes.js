const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// --- Core API Interaction Handlers ---

/**
 * @route   GET /api/assignments
 * @desc    Fixes the 404 GET: Delivers all saved records to the frontend table grid layout
 */
router.get('/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/assignments
 * @desc    Fixes the 404/400 POST: Saves a clean new hardware assignment entry smoothly
 */
router.post('/assignments', async (req, res) => {
    const { userId, assetId, assignmentDate, status } = req.body;
    
    if (!userId || !assetId || !assignmentDate) {
        return res.status(400).json({ error: "Missing required fields (userId, assetId, or assignmentDate)" });
    }

    try {
        const newAssignment = new Assignment({ 
            userId: userId.trim(), 
            assetId: assetId.trim(), 
            assignmentDate: new Date(assignmentDate), 
            status: status || 'Assigned' 
        });
        
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @route   GET /api/assignments/:id
 * @desc    Finds a single assignment entry cleanly by its document ID string
 */
router.get("/assignments/:id", async (req, res) => {
  try {
    const details = await Assignment.findById(req.params.id);
    if (!details) {
      return res.status(404).json({ message: "Assignment entry not found" });
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/assignments/:id
 * @desc    Modifies an existing asset allocation record node
 */
router.put('/assignments/:id', async (req, res) => {
    const { userId, assetId, assignmentDate, status } = req.body;
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        assignment.userId = userId || assignment.userId;
        assignment.assetId = assetId || assignment.assetId;
        assignment.assignmentDate = assignmentDate || assignment.assignmentDate;
        assignment.status = status || assignment.status;

        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Terminates an allocation link safely using modern findByIdAndDelete operations
 */
router.delete('/assignments/:id', async (req, res) => {
    try {
        // UPDATED: Replaced obsolete .remove() hook with bulletproof modern tracking operations
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment record not found' });
        }
        res.json({ message: 'Assignment link broken and removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Ensure file extension is included
import Teachers from '../models/Teachers.js';  // Ensure file extension is included

const router = express.Router();

// Teacher admission
router.post('/admission', async (req, res) => {
    const { name, email, staffNumber } = req.body;
    const registeredDate = new Date(); // Get the current date

    try {
        // Check if email or staff number already exists
        const existingTeacher = await Teachers.findOne({ $or: [{ email }, { staffNumber }] });

        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already exists." });
        }

        const teacher = new Teachers({
            userType: 'teacher', // Explicitly set userType to 'teacher'
            name,
            email,
            staffNumber,
            registeredDate,
        });

        await teacher.save();
        res.status(201).json({ message: "Teacher registered successfully." });
    } catch (error) {
        console.error(error);  // Log error to console
        res.status(500).json({ message: "Failed to register teacher." });
    }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';  // Ensure file extension is included
import Students from '../models/Students.js';

const router = express.Router();

//student admission
router.post('/admission', async (req, res) => {
    const { name, email, admissionNumber, class: studentClass } = req.body;
    const registeredDate = new Date(); // Get the current date

    try {
        // Check if email or admission number already exists
        const existingStudent = await Students.findOne({ $or: [{ email }, { admissionNumber }] });

        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists." });
        }

        const student = new Students({
            userType: 'student', // Explicitly set userType to 'student'
            name,
            email,
            admissionNumber,
            class: studentClass,
            registeredDate,
        });

        await student.save();
        res.status(201).json({ message: "Student registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to register student." });
    }
});

// Route to get students by class
router.get('/students-in-class/:className', async (req, res) => {
    const className = req.params.className;
    try {
        const students = await User.find({ class: className }); // Adjust the query as needed
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// PUT route to update student's class
router.put('/:id/class-promotion', async (req, res) => {
    const { id } = req.params; // Student ID from the URL
    const { class: newClass } = req.body; // New class sent from frontend

    try {
        // Find the student by ID and update their class
        const updatedStudent = await User.findByIdAndUpdate(
            id,
            { class: newClass },
            { new: true } // Return the updated student document
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json({ message: 'Student promoted successfully!', student: updatedStudent });
    } catch (error) {
        console.error('Error promoting student:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router; 

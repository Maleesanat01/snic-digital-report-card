const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teachers = require('../models/Teachers');
const Students = require('../models/Students');
const router = express.Router();

const JWT_SECRET = 'your-secret-key'; // Replace with actual secret key

// Register both teacher and student
router.post('/register', async (req, res) => {
    const { userType, name, email, password, admissionNumber, class: className, staffNumber } = req.body;

    try {
        console.log('Received data:', req.body);  // Log request body

        // Validate required fields
        if (!userType || !name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the email already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if the staff number or admission number already exists in the Users schema
        if (userType === 'teacher') {
            const existingUserByStaffNumber = await User.findOne({ staffNumber });
            if (existingUserByStaffNumber) {
                return res.status(400).json({ message: 'Staff number already exists.' });
            }
        } else if (userType === 'student') {
            const existingUserByAdmissionNumber = await User.findOne({ admissionNumber });
            if (existingUserByAdmissionNumber) {
                return res.status(400).json({ message: 'Admission number already exists.' });
            }
        }

        // Check if name and staff number match for teacher registration
        if (userType === 'teacher') {
            const teacher = await Teachers.findOne({ staffNumber });
            if (!teacher) {
                return res.status(400).json({ message: 'Invalid staff number.' });
            }
            // Case-insensitive name comparison
            if (teacher.name.toLowerCase() !== name.toLowerCase()) {
                return res.status(400).json({ message: 'Wrong name or staff number for teacher. Enter name as registered to school or staff number in correct format' });
            }
        }

        // Check if name and admission number match for student registration
        if (userType === 'student') {
            const student = await Students.findOne({ admissionNumber });
            if (!student) {
                return res.status(400).json({ message: 'Invalid admission number.' });
            }
            // Case-insensitive name comparison
            if (student.name.toLowerCase() !== name.toLowerCase()) {
                return res.status(400).json({ message: 'Wrong name or admission number for student. Enter name as registered to school or admission number in correct format' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = new User({
            userType,
            name,
            email,
            password: hashedPassword,
            registeredDate: new Date().setHours(0, 0, 0, 0),
            ...(userType === 'student' ? { admissionNumber, class: className } : {}),
            ...(userType === 'teacher' ? { staffNumber } : {})
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: `${userType} registered successfully!` });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Database error during registration', error: error.message });
    }
});



// Login for both teacher and student
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT with role information
        const token = jwt.sign({ id: user._id, role: user.userType }, JWT_SECRET, { expiresIn: '1h' });

        // Include user ID (student ID for students) in the response
        res.json({
            token,
            role: user.userType,
            userId: user._id, // Assuming user._id is the identifier for both teachers and students
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

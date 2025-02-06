import express from 'express';
const router = express.Router();
import Subject from '../models/Subject.js'; // Import the Subject model

// Get all subjects with their classes
router.get('/get-subjects', async (req, res) => {
    const { className } = req.query; // Get class name from query parameters
    try {
        const filter = className ? { classes: className } : {}; // Filter by class if specified
        const subjects = await Subject.find(filter);
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error });
    }
});

// POST: Add a new subject to multiple classes
router.post('/add-subject', async (req, res) => {
    const { subjectName, classes } = req.body;

    if (!subjectName || !Array.isArray(classes) || classes.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const newSubject = new Subject({
            subjectName,
            classes,
        });

        await newSubject.save();

        res.status(201).json({ message: 'Subject added successfully!', subject: newSubject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error, could not add subject' });
    }
});


export default router; 

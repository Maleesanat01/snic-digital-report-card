import express from 'express';
import mongoose from 'mongoose'
const router = express.Router();
import Report from '../models/Report'
import ReportArchive from '../models/ReportArchive.js'
import User from '../models/User'

// Endpoint to create reports
router.post('/create-reports', async (req, res) => {
    const { studentId, semester, class: studentClass, subjects, academicYear } = req.body;

    try {
        const report = new Report({
            studentId,
            semester,
            class: studentClass,
            subjects,
            academicYear,
        });

        await report.save();
        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Failed to create report' });
    }
});

// Endpoint to check existing reports
router.get('/existing-reports/:studentId/:semester/:class/:academicYear', async (req, res) => {
    const { studentId, semester, class: className, academicYear } = req.params;

    console.log('Received parameters:', req.params); // Log parameters for debugging

    try {
        // Query to check for existing reports
        const reports = await Report.find({
            studentId: studentId,
            semester: semester,
            class: className,
            academicYear: academicYear
        });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching existing reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

// Get reports for a specific class and semester
router.get('/reports-for-class-semester/:class/:semester', async (req, res) => {
    const { class: studentClass, semester } = req.params;

    try {
        const reports = await Report.find({ class: studentClass, semester }).populate('studentId', 'name');
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

// Fetch report by ID for edit report screen
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('studentId');
        if (!report) {
            return res.status(404).send('Report not found');
        }
        res.json(report);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Get reports by student ID and class
router.get('/view-report/:studentId', async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.params.studentId);

        // Fetch the student's class from the User schema
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const studentClass = student.class; // Assuming student class is stored in User schema

        // Fetch all semester reports for the student's class
        const reports = await Report.find({
            studentId,
            class: studentClass, // Match class and studentId
            semester: { $in: [1, 2, 3] } // Fetch for all three semesters
        }).populate('studentId', 'name admissionNumber'); // Populate student details

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No reports found for this student.' });
        }

        res.json(reports); // Return reports directly
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports.' });
    }
});

// Update a report
router.put('/:reportId', async (req, res) => {
    const { reportId } = req.params;
    const { subjects, remarks } = req.body;

    try {
        // Calculate the average percentage
        const totalPercentage = subjects.reduce((sum, subject) => {
            // Convert percentage to a number (handle NaN if the input is invalid)
            const percentageValue = parseFloat(subject.percentage);
            return sum + (isNaN(percentageValue) ? 0 : percentageValue);
        }, 0);

        const average = subjects.length ? parseFloat((totalPercentage / subjects.length).toFixed(2)) : 0;

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { subjects, average, remarks }, // Include the average in the update
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// Principle view report with mark as seen
router.put('/principle-view-reports/:reportId', async (req, res) => {
    const { reportId } = req.params;
    console.log(`Received request to update report with ID: ${reportId}`);

    const { seenByPrincipal } = req.body; // Destructure only seenByPrincipal from request body

    try {
        // Update only the seenByPrincipal attribute
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { seenByPrincipal }, // Update only the seenByPrincipal field
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// Parents mark seen
router.put('/parent-mark-seen/:reportId', async (req, res) => {
    const { reportId } = req.params;
    const { seenByParent } = req.body;

    try {
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { seenByParent },
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// To get past reports for student
router.get('/view-student-archive-report/:studentId/:class', async (req, res) => {
    console.log('Received request for archived reports:', req.params);
    const { class: selectedClass } = req.params;
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);

    try {
        const reports = await ReportArchive.find({
            studentId,
            class: selectedClass,
        }).populate('studentId', 'name admissionNumber').exec(); // Populate student info if needed

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No archived reports found for this student in the selected class.' });
        }

        res.json(reports);
    } catch (error) {
        console.error('Error fetching archived reports:', error);
        res.status(500).json({ message: 'Failed to fetch archived reports.' });
    }
});

// POST route for archiving a report
router.post('/report-archive', async (req, res) => {
    try {
        const { report } = req.body;

        // Calculate the average percentage
        const totalPercentage = report.subjects.reduce((sum, subject) => sum + subject.percentage, 0);
        const average = report.subjects.length ? parseFloat((totalPercentage / report.subjects.length).toFixed(2)) : 0;

        // Create a new report archive document
        const archivedReport = new ReportArchive({
            studentId: report.studentId,
            class: report.class,
            academicYear: report.academicYear,
            archivedReport: [{
                semester: report.semester,
                subjects: report.subjects,
                average: average,
                remarks: report.remarks,
                seenByPrincipal: report.seenByPrincipal || false,
                seenByParent: report.seenByParent || false
            }],
        });

        await archivedReport.save();
        res.status(200).json({ message: 'Report archived successfully!' });
    } catch (error) {
        console.error('Error archiving report:', error);
        res.status(500).json({ message: 'Failed to archive report.' });
    }
});

// DELETE a report by ID
router.delete('/:id', async (req, res) => {
    try {
        const reportId = req.params.id;

        // Attempt to find and delete the report by ID
        const deletedReport = await Report.findByIdAndDelete(reportId);

        // Check if the report was found and deleted
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styling.css';

const API_BASE_URL = 'http://localhost:5000/api';
const classes = [
    'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
    'Lower 6', 'Upper 6'
];

const EditReport = () => {
    const { id } = useParams(); // Get the report ID from the URL
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); // For navigation after saving

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
                setReport(response.data); // The response should now include studentId populated
            } catch (error) {
                setError('Failed to fetch report.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const getLetterGrade = (percentage, studentClass) => {
        // Define the grade ranges based on the class
        const gradeRanges = {
            'LKG': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'UKG': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Grade 1': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Grade 2': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Grade 3': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Grade 4': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Grade 5': { AStar: 90, A: 80, B: 70, C: 60, D: 50, E: 40, F: 0 },
            'Form 1': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Form 2': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Form 3': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Form 4': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Form 5': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Lower 6': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 },
            'Upper 6': { AStar: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 0 }
        };
    
        const ranges = gradeRanges[studentClass];
    
        if (percentage >= ranges.AStar) return 'A*';
        if (percentage >= ranges.A) return 'A';
        if (percentage >= ranges.B) return 'B';
        if (percentage >= ranges.C) return 'C';
        if (percentage >= ranges.D) return 'D';
        if (percentage >= ranges.E) return 'E';
        return 'F';
    };
    
    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...report.subjects];
    
        if (field === 'percentage') {
            // Convert value to number
            const percentage = parseFloat(value);
    
            if (!isNaN(percentage)) {
                // Determine the letter grade based on percentage and class
                const letterGrade = getLetterGrade(percentage, report.class);
                updatedSubjects[index].letterGrade = letterGrade; // Set the letter grade automatically
            }
        }
    
        updatedSubjects[index][field] = field === 'percentage' && value === '' ? '' : value;
    
        setReport({ ...report, subjects: updatedSubjects });
    };


    const handleRemarksChange = (e) => {
        setReport({ ...report, remarks: e.target.value });
    };

    const handleSaveReport = async () => {
        try {
            await axios.put(`${API_BASE_URL}/reports/${id}`, {
                subjects: report.subjects,  
                remarks: report.remarks, 
            });
            setSuccessMessage('Report updated successfully!'); // Set success message
            setTimeout(() => {
                navigate('/adminDashboard', { state: { selectedOption: 'upload-marks' } });
                setSuccessMessage(''); // Clear message after redirecting
            }, 1000);
        } catch (error) {
            setError('Failed to save report.');
        }
    };

    const handleBack = () => {
        navigate('/adminDashboard', { state: { selectedOption: 'upload-marks' } });  // Navigate back to the teacher dashboard
    };

    const handlePassStudent = async () => {
        if (!report.studentId || !report.studentId.class) {
            setError('Failed to save report.');
            return;
        }

        const currentClassIndex = classes.indexOf(report.studentId.class);
        if (currentClassIndex === -1 || currentClassIndex === classes.length - 1) {
            setError('Failed to save report.');
            return;
        }

        const nextClass = classes[currentClassIndex + 1];

        try {
            await axios.put(`${API_BASE_URL}/students/${report.studentId._id}/class-promotion`, {
                class: nextClass,
            });
            setSuccessMessage(`Student promoted to ${nextClass}.`); // Set success message
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError('Failed to promote student.');
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Optional loading state
    }

    if (!report) {
        return <div>No report found.</div>; // Handle case where report is not found
    }

    return (
        <div className="report-container">
            <div className="top-header">
                <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                <div className="header-text">
                    <h2>Edit Student Report Card</h2>
                </div>
            </div>

            <div className="report-card-container" style={{ paddingBottom: '60px', overflowY: 'auto', maxHeight: 'calc(100vh - 60px)' }}>
                <div className="report-header-container">
                    <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="report-logo" />
                    <div className="header-text">
                        <h3 className='report-heading'>St. Nicholas' International College Colombo</h3>
                        <h4 className='report-heading'>Digital Report Card</h4>
                        <h5 className='report-heading'>Academic Year: <span>{report.academicYear || 'N/A'}</span></h5>
                    </div>
                </div>

                <div className="report-details">
                    <h3 className="detail-label">Class: <span>{report.class || 'N/A'}</span></h3>
                    <h3 className="detail-label">Semester: <span>{report.semester || 'N/A'}</span></h3>
                    <h3 className="detail-label">Student Name: <span>{report.studentId?.name || 'N/A'}</span></h3>
                    <h3 className="detail-label">Admission Number: <span>{report.studentId?.admissionNumber || 'N/A'}</span></h3>
                </div>

                <table className="report-table">
                    <thead>
                        <tr>
                            <th data-label="Subject">Subject</th>
                            <th data-label="Percentage">Percentage</th>
                            <th data-label="Letter Grade">Letter Grade</th>
                            <th data-label="Feedback">Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.subjects.map((subject, index) => (
                            <tr key={index}>
                                <td>{subject.subject}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={subject.percentage}
                                        onChange={(e) =>
                                            handleSubjectChange(index, 'percentage', e.target.value)
                                        }
                                        min="0"
                                    />
                                </td>
                                <td>
                                    <select
                                        className="form-control"
                                        value={subject.letterGrade}  // Bind value to the selected grade
                                        onChange={(e) => handleSubjectChange(index, 'letterGrade', e.target.value)}
                                    >
                                        <option value="">Select Grade</option>  {/* Optional default placeholder */}
                                        <option value="A*">A*</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
                                        <option value="F">F</option>
                                        <option value="Absent">Absent</option>
                                    </select>
                                </td>

                                <td>
                                    <textarea
                                        className="form-control"
                                        value={subject.feedback}
                                        onChange={(e) =>
                                            handleSubjectChange(index, 'feedback', e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="form-group mt-3">
                <label>Class Teacher Remarks</label>
                <textarea
                    className="form-control"
                    value={report.remarks || ''}
                    onChange={handleRemarksChange}
                />
            </div>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}

            {error && (
                <div className="alert alert-danger mt-3">
                    {error}
                </div>
            )}

            <div className="d-flex justify-content-between mt-4" style={{ paddingBottom: '70px' }}>
                {report.semester === 3 ? (
                    <>
                        <button
                            className="btn custom-outline-primary"
                            onClick={handleBack}
                        >
                            Back
                        </button>

                        <div className="d-flex">
                            {report.semester === 3 && ( // Show "Pass" button only for semester 3
                                <button
                                    className="btn btn-success btn-spacing-pass"
                                    onClick={handlePassStudent}
                                >
                                    Pass Student
                                </button>
                            )}

                            <button
                                className="btn save-btn"
                                onClick={handleSaveReport}
                            >
                                Save Report
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="d-flex justify-content-end w-100">
                        <button
                            className="btn custom-outline-primary-sem"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                        <button
                            className="btn save-btn"
                            onClick={handleSaveReport}
                        >
                            Save Report
                        </button>
                    </div>
                )}
            </div>
            <footer className="custom-footer">
                <p className="mb-0">&copy; {new Date().getFullYear()} Powered by MJ</p>
            </footer>
        </div>
    );
};

export default EditReport;
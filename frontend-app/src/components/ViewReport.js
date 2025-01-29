import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styling.css';
const API_BASE_URL = 'http://localhost:5000/api';

const ViewReport = () => {
    const { id } = useParams(); // Get the report ID from the URL
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // For navigation after saving

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
                setReport(response.data); // The response should now include studentId populated
            } catch (error) {
                console.error('Error fetching report:', error);
                alert('Failed to fetch report.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const handleBack = () => {
        navigate('/teacherDashboard', { state: { selectedOption: 'view-report' } });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="report-container">
            <div className="top-header">
                <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                <div className="header-text">
                    <h2>View Student Report Card</h2>
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
                    <h3 className="detail-label">Student Name: <span>{report.studentId?.name || 'N/A'}</span></h3>
                    <h3 className="detail-label">Admission Number: <span>{report.studentId?.admissionNumber || 'N/A'}</span></h3>
                    <h3 className="detail-label">Class: <span>{report.class || 'N/A'}</span></h3>
                    <h3 className="detail-label">Semester: <span>{report.semester || 'N/A'}</span></h3>
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
                                <td>{subject.percentage}</td>
                                <td>{subject.letterGrade}</td>
                                <td>{subject.feedback}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Average Percentage:</td>
                            <td colSpan="3">{report.average || 'N/A'}</td>
                        </tr>
                    </tfoot>
                </table>
                <div className="form-group mt-3">
                    <label>Class Teacher Remarks</label>
                    <textarea
                        className="form-control"
                        value={report.remarks || 'No remarks available.'} // Display remarks or a default message
                        readOnly // Make it read-only for display in ViewReport
                    />
                </div>

                {report.seenByPrincipal && (
                    <div className="seen-tag">
                        Your report was seen by the Principal.
                    </div>
                )}
                <br></br>
                {report.seenByParent && (
                    <div className="seen-tag">
                        The report was seen by the Parent.
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-start mt-4" style={{ paddingBottom: '70px' }}>
                <button className="btn custom-outline-primary-back " onClick={handleBack}>Back</button>
            </div>
            <footer className="custom-footer">
                <p className="mb-0">&copy; {new Date().getFullYear()} Powered by MJ</p>
            </footer>
        </div>
    );
};

export default ViewReport;
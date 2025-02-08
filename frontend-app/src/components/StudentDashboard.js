import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'https://api.snicdigitalreport.com/';

const Dashboard = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedOption, setSelectedOption] = useState('view-report');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSemester, setActiveSemester] = useState(1); // Track active semester
    const [selectedClass, setSelectedClass] = useState('');
    const [archiveFetched, setArchiveFetched] = useState(false);
    const studentId = sessionStorage.getItem('userId'); // Retrieve student ID from session storage
   const API_BASE_URL = 'https://snic-digital-report-card-backend.onrender.com/api';


    const classes = [
        'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
        'Lower 6', 'Upper 6'
    ];

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login if not logged in
        } else if (studentId) {
            fetchReports();
        } else {
            console.error('Student ID not found in session storage.');
        }
    }, [navigate, studentId]);

    const clearMessages = () => {
        setTimeout(() => {
            setSuccess('');
            setError('');
        }, 2600); // Clear messages after 3 seconds
    };

    const fetchReports = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reports/view-report/${studentId}`
            );
            setReports(response.data);
            if (response.data.length > 0) {
                setActiveSemester(response.data[0].semester);
            }
        } catch (err) {
            setError('Failed to fetch reports.');
            clearMessages();

        } finally {
            setLoading(false);
        }
    };

    const FetchArchiveReports = async () => {
        if (!selectedClass) {
            setError('Please select a class.');
            clearMessages();
            return;
        }
        console.log(`Fetching archive reports for class: ${selectedClass}`);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reports/view-student-archive-report/${studentId}/${encodeURIComponent(selectedClass)}`
            );

            console.log('Fetched reports:', response.data);

            // Check if the response contains valid reports
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Collect all archived reports from the fetched data
                const allArchivedReports = response.data.flatMap(report => report.archivedReport.map(archivedItem => ({
                    ...archivedItem,         // Include archived report details
                    academicYear: report.academicYear,
                    class: report.class,     // Include the class from the parent
                    studentId: report.studentId, // Include the studentId from the parent
                }))
                );
                setReports(allArchivedReports); // Set the flattened archived reports
                setActiveSemester(allArchivedReports[0].semester); // Set the active semester based on the first report
                setArchiveFetched(true); // Set archive fetched flag
            } else {
                setError('No reports in archive for the selected class.');
                setReports([]); // Clear reports if none found
                setSelectedClass(''); // Reset selected class
                setArchiveFetched(false);
                clearMessages();

            }
        } catch (error) {
            console.error('Error fetching archived reports:', error);
            setError('No reports in archive for the selected class.');
            clearMessages();
        }
    };

    const MarkAsSeenReportParent = async (report) => {
        try {
            await axios.put(`${API_BASE_URL}/api/reports/parent-mark-seen/${report._id}`, {
                seenByParent: true
            });

            setSuccess('Report marked as seen successfully!');
            setTimeout(() => {
                navigate('/studentDashboard', { state: { selectedOption: 'view-report' } });
                setSuccess(''); // Clear message after redirecting
            }, 1500);
        } catch (error) {
            setError('Failed to save report.');
            clearMessages();
        }
    };

    const handleDownloadPDF = (report) => {
        const doc = new jsPDF();

        const logoWidth = 35;
        const logoHeight = 30;
        doc.addImage(`${process.env.PUBLIC_URL}/snic-logo.jpg`, 'JPEG', 10, 10, logoWidth, logoHeight);

        
        const headerXPosition = 50;
        doc.setFontSize(18);
        let yPosition = 15; 
        const paddingMain = 7; // Padding between lines
        doc.text('St. Nicholas\' International College Colombo', headerXPosition, yPosition);
        yPosition += paddingMain; // Move down for the next line
    
        doc.setFontSize(14);
        doc.text('Digital Report Card', headerXPosition, yPosition);
        yPosition += paddingMain;
    
        doc.text(`Academic Year: ${report.academicYear || 'N/A'}`, headerXPosition, yPosition);
        yPosition += paddingMain;

        // Add student details - Add padding between the logo and student name
        const studentDetailStartY = 45;
        doc.setFontSize(12);
        doc.text(`Student Name: ${report.studentId?.name || 'N/A'}`, 10, studentDetailStartY);
        doc.text(`Admission Number: ${report.studentId?.admissionNumber || 'N/A'}`, 10, studentDetailStartY + 5);
        doc.text(`Class: ${report.class || 'N/A'}`, 10, studentDetailStartY + 10);
        doc.text(`Semester: ${report.semester || 'N/A'}`, 10, studentDetailStartY + 15);

        // Add table for subjects
        const tableColumn = ['Subject', 'Percentage', 'Letter Grade', 'Feedback'];
        const tableRows = report.subjects.map((subject) => [
            subject.subject,
            subject.percentage,
            subject.letterGrade,
            subject.feedback
        ]);

        // Use autoTable to add the table
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: studentDetailStartY + 20, // Adjusting the Y position after the student details
            headStyles: {
                fillColor: [21, 20, 65], 
                textColor: [255, 255, 255], // White header text color
            },
        });

        // Add average percentage at the bottom of the table
        doc.text(`Average Percentage: ${report.average || 'N/A'}`, 10, doc.autoTable.previous.finalY + 10);

        // Add remarks section
        doc.text('Class Teacher Remarks:', 10, doc.autoTable.previous.finalY + 20);
        doc.text(report.remarks || 'No remarks available.', 10, doc.autoTable.previous.finalY + 30);

        // Save the document
        doc.save(`Report-${report.studentId?.name || 'N/A'}-${report.semester}.pdf`);
    };

    const handleLogout = () => {
        sessionStorage.clear(); // Clear session data
        navigate('/'); // Redirect to login
    };

    return (
        <div className="container-fluid min-vh-100 bg-white">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom fixed-top bg-white">
                <div className="top-header">
                    <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                    <div className="header-text">
                        <h2>Student Dashboard</h2>
                    </div>
                    <button
                        className="btn d-md-none ms-auto"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ border: 'none', backgroundColor: 'transparent' }}
                    >
                        <span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}></span>
                    </button>
                </div>


            </div>

            <div className="row flex-nowrap" style={{ paddingTop: '130px' }}>
                <div
                    className={`col-12 col-md-3 col-lg-2 bg-white border-end shadow-sm position-fixed ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
                    style={{ top: '120px', height: 'calc(100vh - 180px)', zIndex: 9999, paddingBottom: '20px' }}
                >


                    <div className="nav flex-column nav-pills mt-4" style={{ paddingTop: '8px', minHeight: 'calc(100vh - 100px)', boxSizing: 'border-box' }}>
                        <button
                            className={`btn-nav ${selectedOption === 'view-report' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedOption('view-report');
                                setReports([]); // Reset reports
                                setActiveSemester(1); // Reset active semester (or set it to the desired default)
                                setArchiveFetched(false); // Reset archive fetched flag
                                fetchReports(); // Optionally fetch current reports if needed
                            }}
                        >
                            View Report
                        </button>
                        <button
                            className={`btn-nav ${selectedOption === 'view-past-report' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedOption('view-past-report');
                                setReports([]); // Reset reports for past report view
                                setActiveSemester(1); // Reset active semester
                                setArchiveFetched(false); // Reset archive fetched flag
                            }}
                        >
                            View Past Reports
                        </button>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="col offset-md-3 offset-lg-2 p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
                    {selectedOption === 'view-report' && (
                        <div className="scrollable-section">
                            <h3>View Report</h3>
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <div className="alert alert-danger mt-3">
                                    {error}
                                </div>
                            ) : success ? (
                                <div className="alert alert-success mt-3">
                                    {success}
                                </div>
                            ) : reports.length > 0 ? (
                                <div>
                                    <ul className="nav nav-tabs">
                                        {reports.map((report) => (
                                            <li className="nav-item" key={report._id}>
                                                <button
                                                    className={`nav-link ${activeSemester === report.semester ? 'active-semester' : 'inactive-semester'}`}
                                                    onClick={() => setActiveSemester(report.semester)}
                                                >
                                                    Semester {report.semester}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="tab-content mt-4">
                                        {reports.map(
                                            (report) =>
                                                activeSemester === report.semester && (
                                                    <div key={report._id} id={`report-${report._id}`}>
                                                        <div className="report-wrapper">
                                                            <div id={`report-${report._id}`} className="report-container-student">
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

                                                                    <table className="report-table-student">
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
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="button-student-container">
                                                            <button className="btn mark-as-seen" onClick={() => MarkAsSeenReportParent(report)}>
                                                                Mark as seen
                                                            </button>
                                                            <button className="btn download-btn" onClick={() => handleDownloadPDF(report)}>
                                                                Download PDF
                                                            </button>
                                                        </div>

                                                    </div>
                                                )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p>No reports found.</p>
                            )}
                        </div>
                    )}
                    {selectedOption === 'view-past-report' && (
                        <div className="scrollable-section">
                            <h3>View Past Report</h3>
                            <div className="form-group">
                                <label>Select Class</label>
                                <select
                                    className="form-control"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="">Select a Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls} value={cls}>
                                            {cls}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn btn-custom mt-3" onClick={FetchArchiveReports} disabled={!selectedClass}>
                                    Show Reports
                                </button>
                            </div>

                            {archiveFetched && (
                                <div>
                                    <ul className="nav nav-tabs">
                                        {reports.map((report) => (
                                            <li className="nav-item" key={report._id}>
                                                <button
                                                    className={`nav-link ${activeSemester === report.semester ? 'active-semester' : 'inactive-semester'}`}
                                                    onClick={() => setActiveSemester(report.semester)}
                                                >
                                                    Semester {report.semester}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="tab-content mt-4">
                                        {reports.map((report) =>
                                            activeSemester === report.semester && (
                                                <div key={report._id} >
                                                    <div id={`report-${report._id}`} className="report-container-student">
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
                                                        </div>
                                                    </div>
                                                    <div className="button-student-container">
                                                            <button className="btn download-btn" onClick={() => handleDownloadPDF(report)}>
                                                                Download PDF
                                                            </button>
                                                        </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}


                        </div>
                    )}

                </div>
            </div>
            <footer className="custom-footer">
                <p className="mb-0">&copy; {new Date().getFullYear()} Powered by MJ</p>
            </footer>
        </div>
    );
};



export default Dashboard;

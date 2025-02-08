import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styling.css';

const API_BASE_URL = 'https://api.snicdigitalreport.com/';


const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedOption, setSelectedOption] = useState(sessionStorage.getItem('selectedOption') || 'view-report');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semesters] = useState([1, 2, 3]);
    const [selectedSemester, setSelectedSemester] = useState(sessionStorage.getItem('selectedSemester') || '');
    const [selectedClass, setSelectedClass] = useState(sessionStorage.getItem('selectedClass') || '');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState(JSON.parse(sessionStorage.getItem('selectedSubjects')) || []);
    const [reports, setReports] = useState(JSON.parse(sessionStorage.getItem('reports')) || []);
    const [academicYear, setAcademicYear] = useState(sessionStorage.getItem('academicYear') || '');
    const [successMessage, setSuccessMessage] = useState(''); // Success message state
    const [errorMessage, setErrorMessage] = useState('');
    // const [editingReport, setEditingReport] = useState(null);
    // const [teacherId] = useState(sessionStorage.getItem('teacherId'));

    const classes = [
        'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
        'Lower 6', 'Upper 6'
    ];

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else if (location.state && location.state.selectedOption) {
            setSelectedOption(location.state.selectedOption); // Set the selected option from the navigation state
        }
    }, [navigate, location.state]);

     // Save state in session storage whenever it changes
     useEffect(() => {
        sessionStorage.setItem('selectedOption', selectedOption);
        sessionStorage.setItem('selectedSemester', selectedSemester);
        sessionStorage.setItem('selectedClass', selectedClass);
        sessionStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
        sessionStorage.setItem('reports', JSON.stringify(reports));
        sessionStorage.setItem('academicYear', academicYear);
    }, [selectedOption, selectedSemester, selectedClass, selectedSubjects, reports, academicYear]);

    const clearMessages = () => {
        setTimeout(() => {
            setSuccessMessage('');
            setErrorMessage('');
        }, 2600); // Clear messages after 3 seconds
    };

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/subjects/get-subjects`);
                setSubjects(res.data);
            } catch (error) {
                setErrorMessage('Failed to fetch subjects.');
                clearMessages();
            }
        };

        fetchSubjects();
    }, []);


    //Upload marks
    const handleFetchReports = async () => {
        if (!selectedSemester || !selectedClass) {
            setErrorMessage('Please select both class and semester.');
            clearMessages();
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reports/reports-for-class-semester/${encodeURIComponent(selectedClass)}/${selectedSemester}`
            );
            setReports(response.data);
            if (response.data.length === 0) {
                setErrorMessage('No reports created for the selected class and semester.');
                clearMessages();
                setSelectedSemester('');
                setSelectedClass('');
            }
        } catch (error) {
            setErrorMessage('Failed to fetch reports.');
            clearMessages();
        }
    };

    const handleViewReport = (report) => {
        navigate(`/view-report/${report._id}`);
    };

    return (
        <div className="container-fluid min-vh-100 bg-white">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom fixed-top bg-white">

                <div className="top-header">
                    <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                    <div className="header-text">
                        <h2>Teacher Dashboard</h2>
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
                            onClick={() => setSelectedOption('view-report')}
                        >
                            View Reports
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                sessionStorage.clear();
                                navigate('/');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="col offset-md-3 offset-lg-2 p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    {selectedOption === 'view-report' && (
                        <div className="scrollable-section">
                            <h3>View Reports</h3>

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
                            </div>

                            <div className="form-group mt-3">
                                <label>Select Semester</label>
                                <select
                                    className="form-control"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(Number(e.target.value) || '')}
                                >
                                    <option value="">Select a semester</option>
                                    {semesters.map((sem) => (
                                        <option key={sem} value={sem}>
                                            Semester {sem}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-custom mt-3"
                                onClick={handleFetchReports}
                                disabled={!selectedClass || !selectedSemester} // Disable if class or semester isn't selected
                            >
                                Show Reports
                            </button>

                            {reports.length > 0 && (
                                <div className="mt-4">
                                    <h4>Reports</h4>
                                    <ul className="list-group">
                                        {reports.map((report) => (
                                            <li key={report._id} className="list-group-item">
                                                {report.studentId ? (
                                                    <>
                                                        Student Name: {report.studentId.name}
                                                        <button
                                                            className="btn btn-link"
                                                            onClick={() => handleViewReport(report)}
                                                        >
                                                            View Report
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span>Student information not available</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styling.css';

const API_BASE_URL = 'http://localhost:5000';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedOption, setSelectedOption] = useState(sessionStorage.getItem('selectedOption') || 'add-report');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semesters] = useState([1, 2, 3]);
    const [selectedSemester, setSelectedSemester] = useState(sessionStorage.getItem('selectedSemester') || '');
    const [selectedClass, setSelectedClass] = useState(sessionStorage.getItem('selectedClass') || '');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState(JSON.parse(sessionStorage.getItem('selectedSubjects')) || []);
    const [reports, setReports] = useState(JSON.parse(sessionStorage.getItem('reports')) || []);
    const [academicYear, setAcademicYear] = useState(sessionStorage.getItem('academicYear') || '');
    const [subjectName, setSubjectName] = useState([]);
    const [selectedSubjectClasses, setSelectedSubjectClasses] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [role, setRole] = useState('teacher');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [admissionNum, setAdmissionNum] = useState('');
    const [staffNum, setStaffNum] = useState('');
    const [className, setClassName] = useState('');

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

    const clearMessages = () => {
        setTimeout(() => {
            setSuccessMessage('');
            setErrorMessage('');
        }, 2600); // Clear messages after 3 seconds
    };

    const fetchSubjects = async (className) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/subjects/get-subjects`, {
                params: { className }
            });
            setSubjects(res.data);
        } catch (error) {
            setErrorMessage('Failed to fetch subjects.');
            clearMessages();
        }
    };

    // Save state in session storage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('selectedOption', selectedOption);
        sessionStorage.setItem('selectedSemester', selectedSemester);
        sessionStorage.setItem('selectedClass', selectedClass);
        sessionStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
        sessionStorage.setItem('reports', JSON.stringify(reports));
        sessionStorage.setItem('academicYear', academicYear);
    }, [selectedOption, selectedSemester, selectedClass, selectedSubjects, reports, academicYear]);

    useEffect(() => {
        if (selectedClass) {
            fetchSubjects(selectedClass);
        } else {
            setSubjects([]);
        }
    }, [selectedClass]);



    const handleCreateReports = async () => {
        if (!selectedSemester || !selectedClass || selectedSubjects.length === 0) {
            setErrorMessage('Please fill in all fields.');
            clearMessages();
            return;
        }
    
        if (selectedSubjects.length < subjects.length) {
            setErrorMessage('Please select all subjects.');
            clearMessages();
            return;
        }
    
        try {
            const studentResponse = await axios.get(`${API_BASE_URL}/api/students/students-in-class/${encodeURIComponent(selectedClass)}`);
            const students = studentResponse.data;
    
            if (students.length === 0) {
                setErrorMessage('No students registered in class, no reports created');
                clearMessages();
                setSelectedSemester('');
                setSelectedClass('');
                setSelectedSubjects([]);
                return;
            }
    
            const reportPromises = students.map(async (student) => {
                try {
                    const existingReportsResponse = await axios.get(
                        `${API_BASE_URL}/api/reports/existing-reports/${student._id}/${selectedSemester}/${encodeURIComponent(selectedClass)}/${encodeURIComponent(academicYear)}`
                    );
                    const existingReports = existingReportsResponse.data;
    
                    if (existingReports.length === 0) {
                        const subjectsWithDetails = selectedSubjects.map(subject => ({
                            subject,
                            percentage: 0,
                            feedback: '',
                            letterGrade: '',
                        }));
    
                        const reportData = {
                            studentId: student._id,
                            semester: selectedSemester,
                            class: selectedClass,
                            subjects: subjectsWithDetails,
                            academicYear: academicYear,
                        };
    
                        await axios.post(`${API_BASE_URL}/api/reports/create-reports`, reportData);
                    }
                } catch (error) {
                    clearMessages();
                    setErrorMessage('Failed to create reports.');
                }
            });
    
            await Promise.all(reportPromises);
            setSuccessMessage('Reports created successfully!');
            clearMessages();
            setSelectedSemester('');
            setSelectedClass('');
            setSelectedSubjects([]);
        } catch (error) {
            setErrorMessage('Failed to create reports.');
            clearMessages();
        }
    };
    


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

    const handleArchiveReport = async (report) => {
        if (window.confirm('Are you sure you want to archive this report?')) {
            try {
                await axios.post(`${API_BASE_URL}/api/reports/report-archive`, { report });
                await axios.delete(`${API_BASE_URL}/api/reports/${report._id}`);
                setReports((prevReports) => prevReports.filter(r => r._id !== report._id));
                setSuccessMessage('Report archived successfully!');
                clearMessages();
            } catch (error) {
                setErrorMessage('Failed to archive report.');
                clearMessages();
            }
        }
    };

    const handleEditReport = (report) => {
        navigate(`/edit-report/${report._id}`);
    };

    const handleViewReport = (report) => {
        navigate(`/admin-view-report/${report._id}`);
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/reports/${reportId}`);
                setReports((prevReports) => prevReports.filter(report => report._id !== reportId));
                setSuccessMessage('Report deleted successfully!');
                clearMessages();
            } catch (error) {
                setErrorMessage('Failed to delete report.');
                clearMessages();
            }
        }
    };

    // Function to handle checkbox change
    const handleClassChange = (e) => {
        const { value, checked } = e.target;
        setSelectedSubjectClasses((prevClasses) => {
            if (checked) {
                return [...prevClasses, value];
            } else {
                return prevClasses.filter((cls) => cls !== value);
            }
        });
    };

    // Function to handle subject creation
    const handleAddSubject = async () => {
        if (!subjectName || selectedSubjectClasses.length === 0) {
            setErrorMessage('Please fill in all fields.');
            setSuccessMessage('');
            return;
        }

        try {
            const subjectData = {
                subjectName,
                classes: selectedSubjectClasses,
            };
            const response = await axios.post(`${API_BASE_URL}/api/subjects/add-subject`, subjectData);
            setSuccessMessage('Subject added successfully!');
            setErrorMessage('');
            setSubjectName('');
            setSelectedSubjectClasses([]);
        } catch (error) {
            setErrorMessage('Failed to add subject.');
            setSuccessMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = { name, email };
    
        // Handle Teacher Form
        if (role === "teacher") {
            formData.staffNumber = staffNum;
            try {
                // Include the correct URL prefix (`/api/teachers/admission`)
                const response = await axios.post('http://localhost:5000/api/teachers/admission', formData);
                setSuccessMessage(response.data.message);
                setErrorMessage(""); // Clear any previous error messages
            } catch (error) {
                setErrorMessage(error.response?.data?.message || "An error occurred while registering.");
            }
        }
    
        // Handle Student Form
        if (role === "student") {
            formData.admissionNumber = admissionNum;
            formData.class = className;
            try {
                // Include the correct URL for student admission
                const response = await axios.post('http://localhost:5000/api/students/admission', formData);
                setSuccessMessage(response.data.message);
                setErrorMessage(""); // Clear any previous error messages
            } catch (error) {
                setErrorMessage(error.response?.data?.message || "An error occurred while registering.");
            }
        }
    };
    




    return (
        <div className="container-fluid min-vh-100 bg-white">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom fixed-top bg-white">

                <div className="top-header">
                    <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                    <div className="header-text">
                        <h2>Admin Dashboard</h2>
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

            <div className="row flex-nowrap" style={{ paddingTop: '123px' }}>
                <div
                    className={`col-12 col-md-3 col-lg-2 bg-white border-end shadow-sm position-fixed ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
                    style={{ top: '120px', height: 'calc(100vh - 180px)', zIndex: 9999, paddingBottom: '20px' }}
                >
                    <div className="nav flex-column nav-pills mt-4" style={{ paddingTop: '8px', minHeight: 'calc(100vh - 100px)', boxSizing: 'border-box' }}>
                        <button
                            className={`btn-nav ${selectedOption === 'add-report' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('add-report')}
                        >
                            Create Reports
                        </button>
                        <button
                            className={`btn-nav ${selectedOption === 'upload-marks' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('upload-marks')}
                        >
                            Upload Marks
                        </button>
                        <button
                            className={`btn-nav ${selectedOption === 'add-subject' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('add-subject')}
                        >
                            Add Subject
                        </button>
                        <button
                            className={`btn-nav ${selectedOption === 'admission' ? 'active' : ''}`}
                            onClick={() => setSelectedOption('admission')}
                        >
                            Admission
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
                    {selectedOption === 'add-report' && (
                        <div className="scrollable-section">
                            <h3>Create Reports</h3>
                            <div className="form-group">
                                <label>Academic Year</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                    placeholder="e.g. 2023/2024"
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Class</label>
                                <select
                                    className="form-control"
                                    value={selectedClass}
                                    onChange={(e) => {
                                        const selectedClass = e.target.value;
                                        setSelectedClass(selectedClass);
                                        if (selectedClass) {
                                            fetchSubjects(selectedClass); // Fetch subjects for the selected class
                                        } else {
                                            setSubjects([]); // Clear subjects if no class is selected
                                        }
                                    }}
                                >
                                    <option value="">Select a Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls} value={cls}>
                                            {cls}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
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


                            <div className="form-group">
                                <label>Select Subjects</label>
                                <div>
                                    {subjects.length > 0 ? (
                                        subjects.map((subject) => (
                                            <div key={subject._id} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={subject._id}
                                                    value={subject.subjectName}
                                                    checked={selectedSubjects.includes(subject.subjectName)}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedSubjects((prevSelected) =>
                                                            prevSelected.includes(value)
                                                                ? prevSelected.filter((s) => s !== value)
                                                                : [...prevSelected, value]
                                                        );
                                                    }}
                                                />
                                                <label className="form-check-label" htmlFor={subject._id}>
                                                    {subject.subjectName}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div>No subjects available</div>
                                    )}
                                </div>
                            </div>
                            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Success message */}
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            <button className="btn btn-custom mt-3" onClick={handleCreateReports} disabled={!selectedClass || !selectedSemester} >
                                Create Report
                            </button>
                        </div>
                    )}

                    {selectedOption === 'upload-marks' && (
                        <div className="scrollable-section">
                            <h3>Upload Marks</h3>

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
                            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Success message */}
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
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
                                                        <button
                                                            className="btn btn-link"
                                                            onClick={() => handleEditReport(report)}
                                                        >
                                                            Edit Report
                                                        </button>
                                                        <button className="btn btn-link" onClick={() => handleArchiveReport(report)}>
                                                            Archive Report
                                                        </button>
                                                        <button
                                                            className="btn btn-link"
                                                            onClick={() => handleDeleteReport(report._id)}
                                                        >
                                                            Delete Report
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

                    {selectedOption === 'add-subject' && (
                        <div>
                            <h3>Add Subject</h3>
                            <div className="form-group">
                                <label>Subject Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Class</label>

                                {classes.map((cls) => (
                                    <div key={cls} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={cls}
                                            value={cls}
                                            onChange={handleClassChange}
                                            checked={selectedSubjectClasses.includes(cls)}
                                        />
                                        <label className="form-check-label" htmlFor={cls}>
                                            {cls}
                                        </label>
                                    </div>
                                ))}

                            </div>
                            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Success message */}
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            <button onClick={handleAddSubject} className="btn btn-custom mt-3" disabled={!subjectName || !selectedSubjectClasses}>Add Subject</button>
                        </div>
                    )}

                    {selectedOption === 'admission' && (
                        <div>
                            <h3>Admission</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="role">Who are you? (Select)</label>
                                    <select
                                        id="role"
                                        className="form-control"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>

                                {role === 'teacher' && (
                                    <div className="form-group mt-3">
                                        <label htmlFor="staffNum">Staff Number</label>
                                        <input
                                            type="text"
                                            id="staffNum"
                                            className="form-control"
                                            value={staffNum}
                                            onChange={(e) => setStaffNum(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                {role === 'student' && (
                                    <>
                                        <div className="form-group mt-3">
                                            <label htmlFor="admissionNum">Admission Number</label>
                                            <input
                                                type="number"
                                                id="admissionNum"
                                                className="form-control"
                                                value={admissionNum}
                                                onChange={(e) => setAdmissionNum(e.target.value)}
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="form-group mt-3">
                                            <label htmlFor="class">Class</label>
                                            <select
                                                id="class"
                                                className="form-control"
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                required
                                            >
                                                <option value="">Select a class</option>
                                                {classes.map((classOption, index) => (
                                                    <option key={index} value={classOption}>
                                                        {classOption}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-group mt-3">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group mt-3">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {errorMessage && (
                                    <div className="alert alert-danger mt-3">{errorMessage}</div>
                                )}

                                {successMessage && (
                                    <div className="alert alert-success mt-3">{successMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-custom mt-3"
                                    style={{ backgroundColor: '#151441', color: '#fff' }}
                                >
                                    Register
                                </button>
                            </form>
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

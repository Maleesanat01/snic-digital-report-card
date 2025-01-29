import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styling.css';

const Register = () => {
    const [role, setRole] = useState('teacher');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [admissionNum, setAdmissionNum] = useState('');
    const [staffNum, setStaffNum] = useState('');
    const [className, setClassName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const classes = [
        'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
        'Lower 6', 'Upper 6'
    ];

    const clearMessages = () => {
        setTimeout(() => {
            setSuccess('');
            setErrorMessage('');
            navigate('/'); // Redirect to login page after clearing messages
        }, 1000); // Clear messages and redirect after 2 seconds
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate name (only letters)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(name)) {
            setErrorMessage('Name can only contain letters.');
            return;
        }

        // Validate email (basic email format)
        const emailPattern = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
        if (!emailPattern.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        // Check if confirmPassword matches password
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        // Check for required fields
        if (!email || !password || !confirmPassword || !name || !role || (role === 'student' && (!admissionNum || !className))) {
            setErrorMessage('All fields are required.');
            return;
        }

        // Check for required fields teacher
        if (!email || !password || !confirmPassword || !name || !role || (role === 'teacher' && (!staffNum))) {
            setErrorMessage('All fields are required.');
            return;
        }

        const userData = {
            userType: role,
            name,
            email,
            password,
            ...(role === 'student' && { admissionNumber: admissionNum, class: className }),
            ...(role === 'teacher' && { staffNumber: staffNum}),
        };

        try {
            await registerUser(userData);
            setSuccess('Registration successful');
            clearMessages(); // Call clearMessages to handle the success message and redirect
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className='reg-body'>
            <div className="register-container">
                <div className="top-header">
                    <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                    <div className="header-text">
                        <h2>St. Nicholas' International College Colombo</h2>
                        <h3>Digital Report System</h3>
                    </div>
                </div>
                <div className="row w-100 justify-content-center flex-grow-1">

                    <div className="col-md-6 d-flex justify-content-center align-items-center">
                        <div className="card shadow w-100 register-card">
                            <div className="card-header text-center" style={{ backgroundColor: '#151441', color: '#fff' }}>
                                <h3>Register</h3>
                            </div>
                            <div className="card-body register-form">
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
                                           <option value="principal">Principal</option>
                                           <option value="admin">Admin</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>                                    
                                    {role === 'teacher' && (
                                        <>
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
                                        </>
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
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Check if the value contains only letters and spaces
                                                if (/^[a-zA-Z\s]*$/.test(value)) {
                                                    setName(value);
                                                }
                                            }}
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

                                    <div className="form-group mt-3">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group mt-3">
                                        <label htmlFor="confirm-password">Confirm Password</label>
                                        <input
                                            type="password"
                                            id="confirm-password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {errorMessage && (
                                        <div className="alert alert-danger mt-3">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success mt-3">
                                            {success}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mt-4"
                                        style={{ backgroundColor: '#151441', color: '#fff' }}
                                    >
                                        Register
                                    </button>
                                </form>
                            </div>
                            <div className="card-footer text-center">
                                <p className="text-muted">
                                    Already have an account? <a href="/">Login</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="custom-footer">
                <p className="mb-0">&copy; {new Date().getFullYear()} Powered by MJ</p>
            </footer>
        </div>
    );
};

export default Register;

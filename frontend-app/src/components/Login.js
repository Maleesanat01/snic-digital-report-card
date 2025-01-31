import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styling.css';

// Define the base API URL
const API_BASE_URL = 'https://snic-digital-report-card-backend.onrender.com';
 // Update this URL based on your environment

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate email (only common domains)
        const emailPattern = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
        if (!emailPattern.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            
            // Logging the response to check if userId is included
            console.log('Response data:', response.data);
            
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('role', response.data.role);
            sessionStorage.setItem('userId', response.data.userId); // Store user ID

            // Log the stored userId for debugging
            console.log('Stored userId:', response.data.userId);

            if (response.data.role === 'teacher') {
                navigate('/teacherDashboard');
            } else if (response.data.role === 'student'){
                navigate('/studentDashboard');
            }
            else if (response.data.role === 'admin'){
                navigate('/adminDashboard');
            }
            else{
                navigate('/principleDashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Set specific error message for incorrect credentials
            if (error.response && error.response.status === 401) {
                setErrorMessage('Incorrect email or password.');
            } else {
                setErrorMessage('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="top-header">
                <img src={`${process.env.PUBLIC_URL}/snic-logo.jpg`} alt="College Logo" className="logo" />
                <div className="header-text">
                    <h2>St. Nicholas' International College Colombo</h2>
                    <h3>Digital Report System</h3>
                </div>
            </div>

            <div className="card">
                <div className="card-header text-center">
                    <h3>Login</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
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

                        <div className="form-group">
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

                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            style={{
                                backgroundColor: 'rgba(21, 20, 65, 0.9)',
                                color: '#fff',
                                border: 'none'
                            }}
                        >
                            Login
                        </button>
                    </form>
                </div>
                <div className="card-footer text-center">
                    <p className="text-muted">
                        Don't have an account? <a href="/register">Register</a>
                    </p>
                </div>
            </div>
            <footer className="custom-footer">
                <p className="mb-0">&copy; {new Date().getFullYear()} Powered by MJ</p>
            </footer>

        </div>
    );
};

export default Login;

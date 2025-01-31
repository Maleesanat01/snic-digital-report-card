import axios from 'axios';
//for http requests
const API_URL = 'https://snic-digital-report-card-backend.onrender.com';

// export const registerTeacher = async (data) => {
//     return await axios.post(`${API_URL}/teachers/register`, data);
// };

export const loginTeacher = async (data) => {
    return await axios.post(`${API_URL}/teachers/login`, data);
};

export const registerUser = async (data) => {
    return await axios.post(`${API_URL}/auth/register`, data);
};

// export const registerStudent = async (data) => {
//     return await axios.post(`${API_URL}/students/register`, data);
// };

export const createReport = async (data) => {
    return await axios.post(`${API_URL}/reports`, data);
};

export const getReports = async (studentId) => {
    return await axios.get(`${API_URL}/reports/${studentId}`); };

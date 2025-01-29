import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import PrincipleDashboard from './components/PrincipleDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import EditReport from './components/EditReport';
import ViewReport from './components/ViewReport';
import AdminViewReport from './components/AdminViewReport';
import PrincipleViewReport from './components/PrincipleViewReport';

function App() {
    return (
        <Router>
            <Routes> {/* Use Routes instead of Switch */}
                <Route path="/" element={<Login />} /> {/* Use element prop instead of component */}
                <Route path="/register" element={<Register />} />
                <Route path="/principleDashboard" element={<PrincipleDashboard />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
                <Route path="/teacherDashboard" element={<TeacherDashboard />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/edit-report/:id" element={<EditReport />} />
                <Route path="/view-report/:id" element={<ViewReport />} />
                <Route path="/admin-view-report/:id" element={<AdminViewReport />} />
                <Route path="/principle-view-report/:id" element={<PrincipleViewReport />} />
            </Routes>
        </Router>
    );
}

/*
SNIC Version 1 Functions
- Admin
    - Create reports
    - Upload marks
    - Add Subject
    - Admission

- Principle
    - View reports (Mark as seen)

- Teacher
    - View reports

- Student/Parent
    - View report (mark as seen)
    - View past reports
*/

export default App;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
import dotenv from 'dotenv';
const connectDB = require('./config/db');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes'); 
const subjectRoutes = require('./routes/subjectRoutes');

dotenv.config();
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://snic-digital-report-card-frontend-app.onrender.com', // Frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Apply CORS middleware
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests

app.use(express.json()); // Parse incoming JSON requests
app.use(bodyParser.json()); // Parse JSON request bodies

// Connect to the database
connectDB();

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subjects', subjectRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

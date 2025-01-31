const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes'); 
const subjectRoutes = require('./routes/subjectRoutes');

const app = express();

// Enable CORS for your frontend domain
const corsOptions = {
  origin: 'https://snic-digital-report-card-frontend-app.onrender.com', // Your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

// Apply CORS middleware with the configured options
app.use(cors(corsOptions));

app.use(express.json()); // To parse JSON request bodies
app.use(bodyParser.json());

// Connect to the database
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subjects', subjectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

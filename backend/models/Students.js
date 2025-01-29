const mongoose = require('mongoose');

const studentsSchema = new mongoose.Schema({
    userType: { 
        type: String, 
        enum: ['student'], 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true, 
        lowercase: true 
    },
    registeredDate: { 
        type: Date, 
        default: Date.now 
    },
    admissionNumber: { 
        type: String, 
        unique: true, 
        sparse: true, // Allows multiple null values
        required: function () { 
            return this.userType === 'student'; 
        } 
    },
    class: {
        type: String,
        // sparse: true, // Allows multiple null values
        required: function () {
            return this.userType === 'student';
        },
    },
});

module.exports = mongoose.model('Students', studentsSchema);

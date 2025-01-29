const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userType: { type: String, enum: ['teacher', 'student', 'principal', 'admin'], required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true }, // Ensure unique and lowercase
    password: { type: String, required: true },
    registeredDate: { type: Date, default: Date.now },
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
    staffNumber: { 
        type: String, 
        unique: true, 
        required: function () { 
            return this.userType === 'teacher'; 
        },  // Ensure staff number is required
        sparse: true  // Allows nulls in this field
    },
});

module.exports = mongoose.model('User', userSchema);


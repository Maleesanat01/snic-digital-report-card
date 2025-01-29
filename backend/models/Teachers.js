const mongoose = require('mongoose');

const teachersSchema = new mongoose.Schema({
    userType: { 
        type: String, 
        enum: ['teacher'], 
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
    staffNumber: { 
        type: String, 
        unique: true, 
        required: [true, 'Staff number is required for teachers'],  // Ensure staff number is required
        sparse: true  // Allows nulls in this field
    },
});

module.exports = mongoose.model('Teachers', teachersSchema);


  // classTeacher: { 
    //     type: Boolean, 
    //     default: false,  // Assuming classTeacher is a boolean indicating if the teacher is a class teacher
    //     required: true 
    // },
    // class: { 
    //     type: String,
    //     required: function () {
    //         return this.userType === 'teacher';
    //     },
    // },
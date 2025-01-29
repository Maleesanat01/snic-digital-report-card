const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    class: { type: String, required: true },
    subjects: [{
        subject: { type: String, required: true },
        percentage: { type: Number, default: 0 },
        feedback: { type: String, default: '' },
        letterGrade: { type: String, default: '' },
    }],
    average: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    seenByPrincipal: { type: Boolean, default: false },
    seenByParent: { type: Boolean, default: false },
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

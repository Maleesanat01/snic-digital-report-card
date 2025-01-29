const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    subjectName: String,
    classes: [String],
});

module.exports = mongoose.model('Subject', SubjectSchema);

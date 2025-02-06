import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    subjectName: String,
    classes: [String],
});

export default mongoose.model('Subject', SubjectSchema);

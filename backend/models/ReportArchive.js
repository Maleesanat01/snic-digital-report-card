import mongoose from 'mongoose';

const ReportArchiveSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: String, required: true },
    archivedAt: { type: Date, default: Date.now }, 
    academicYear: { type: String, required: true },
    archivedReport: [
        {
            semester: { type: Number, required: true },
            subjects: [
                {
                    subject: { type: String, required: true },
                    percentage: { type: Number, required: true },
                    feedback: { type: String },
                    letterGrade: { type: String }
                }
            ],
            average: { type: Number, default: 0 },
            remarks: { type: String, default: '' },
            seenByPrincipal: { type: Boolean, default: false },
            seenByParent: { type: Boolean, default: false },
        },
    ],
});

export default mongoose.model('ReportArchive', ReportArchiveSchema);

import mongoose from "mongoose";

export interface IResult extends Document {
    staffId: string;
    studentId: string;
    subjectId: string;
    examDate: string;
    examType: string;
    marks: number;
    totalMarks: number;
    grade: string;
    percentage: number;
    resultStatus: string;
    attendanceStatus: string;
    isActive: boolean;
    addedDate: Date;
    modifiedDate: Date;
  }
  
const ResultSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "subjects", required: true },
    examDate: { type: Date, required: true },
    examTime: { type: String, required: true },
    examLocation: { type: String, required: true },
    examDuration: { type: String, required: true },
    examType: { type: String, required: true },
    resultStatus: { type: String, required: true },
    attendanceStatus: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Result = mongoose.models.results || mongoose.model("results", ResultSchema);

export default Result; 
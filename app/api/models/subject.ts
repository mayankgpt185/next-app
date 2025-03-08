import mongoose from "mongoose";

export interface ISubject extends Document {
    subject: string;
    tenantIds: string[];
    courseId: string;
    staffId: string;
    isActive: boolean;
    academicStartYear: Date;
    academicEndYear: Date;
    addedDate: Date;
    modifiedDate: Date;
  }
  
const SubjectSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    tenantIds: { type: [String], default: [], index: true },// important i have done this because i want to share same class and section in different tenant, no duplicate class and section in different tenant
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    isActive: { type: Boolean, default: true },
    academicStartYear: { type: Date, required: true },
    academicEndYear: { type: Date, required: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.models.subjects || mongoose.model("subjects", SubjectSchema);

export default Subject; 
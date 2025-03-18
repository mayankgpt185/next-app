import mongoose from "mongoose";

export interface ISubject extends Document {
    subject: string;
    tenantIds: string[];
    courseId: string;
    staffIds: string[];
    academicYearId: string;
    isActive: boolean;
    addedDate: Date;
    modifiedDate: Date;
  }
  
const SubjectSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    tenantIds: { type: [String], default: [], index: true },// important i have done this because i want to share same class and section in different tenant, no duplicate class and section in different tenant
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses", required: true },
    staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: "sessions", required: true },
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.models.subjects || mongoose.model("subjects", SubjectSchema);

export default Subject; 
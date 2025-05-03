import mongoose from "mongoose";

export interface IExamType extends Document {
  type: string;
  clientOrganizationId: string;
  isActive: boolean;
  addedDate: Date;
}

const ExamTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    clientOrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientorganizations",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

export const ExamType =
  mongoose.models.examTypes || mongoose.model("examTypes", ExamTypeSchema, "examTypes");

export default ExamType;

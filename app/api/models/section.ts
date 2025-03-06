import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
    tenantIds: { type: [String], default: [], index: true },// important i have done this because i want to share same class and section in different tenant, no duplicate class and section in different tenant
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Section = mongoose.models.sections || mongoose.model("sections", SectionSchema);

export default Section; 
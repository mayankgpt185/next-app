import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    classNumber: { type: Number, required: true, unique: true },
    tenantIds: { type: [Number], default: [], index: true },// important i have done this because i want to share same class and section in different tenant, no duplicate class and section in different tenant
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.models.classes || mongoose.model("classes", ClassSchema);

export default Class; 
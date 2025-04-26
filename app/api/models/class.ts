import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    classNumber: { type: Number, required: true, unique: true },
    clientOrganizationId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientOrganizations",
      required: true,
    }],
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Class =
  mongoose.models.classes || mongoose.model("classes", ClassSchema);

export default Class;

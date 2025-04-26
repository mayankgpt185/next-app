import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
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

export const Section =
  mongoose.models.sections || mongoose.model("sections", SectionSchema);

export default Section;

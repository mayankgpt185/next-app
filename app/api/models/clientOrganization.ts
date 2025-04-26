import mongoose from "mongoose";

const clientOrganizationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const ClientOrganization =
  mongoose.models.clientOrganizations ||
  mongoose.model("clientOrganizations", clientOrganizationSchema);

export default ClientOrganization;

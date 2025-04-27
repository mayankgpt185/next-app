import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    clientOrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientorganizations",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedDate: {
      type: Date,
      default: Date.now,
    },
    modifiedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Session =
  mongoose.models.sessions || mongoose.model("sessions", SessionSchema);

export default Session;

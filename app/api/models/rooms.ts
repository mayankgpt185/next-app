import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    clientOrganizationId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientorganizations",
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

export const Room =
  mongoose.models.rooms || mongoose.model("rooms", RoomSchema);

export default Room;

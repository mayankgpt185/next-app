import mongoose from "mongoose";

export interface ISeatingArrangement extends Document {
    examId: string;
    sectionId: string;
    venue: string;
    isActive: boolean;
    addedDate: Date;
    modifiedDate: Date;
}

const SeatingArrangementSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exam",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sections",
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    addedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const SeatingArrangement =
  mongoose.models.seatingArrangements || mongoose.model("seatingArrangements", SeatingArrangementSchema);

export default SeatingArrangement;

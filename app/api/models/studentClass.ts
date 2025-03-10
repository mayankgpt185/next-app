import mongoose from "mongoose";

const StudentClassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Match the model name used in Student model
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classes", // Match the model name used in Class model
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sections", // Match the model name used in Section model
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

export const StudentClass =
  mongoose.models.studentClasses ||
  mongoose.model("studentClasses", StudentClassSchema);

export default StudentClass;

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  role: string;
  academicYearId: string[];
  dateJoined: Date;
  isClassTeacher: boolean;
  classId: string;
  sectionId: string;
  tenantId: number;
  lastLogin: Date;
  profileImage: string;
  statusMessage: string;
  isActive: boolean;
  phone: string;
  aboutMe: string;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, required: true },
  academicYearId: [{ type: mongoose.Schema.Types.ObjectId, ref: "sessions", required: false }],
  dateJoined: { type: Date, required: true },
  isClassTeacher: { type: Boolean, default: false },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "classes", required: false },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "sections", required: false },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "tenants", required: false },
  lastLogin: { type: Date, required: false },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, required: false },
  statusMessage: { type: String, required: false },
  phone: { type: String, required: false },
  aboutMe: { type: String, required: false }
}, {
  timestamps: true
});

export default mongoose.models.users || mongoose.model<IUser>('users', userSchema);
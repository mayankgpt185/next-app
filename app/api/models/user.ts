import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  role: string;
  dateJoined: Date;
  lastLogin: Date;
  isActive: boolean;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, required: true },
  dateJoined: { type: Date, required: true },
  lastLogin: { type: Date, required: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.users || mongoose.model<IUser>('users', userSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

const staffSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', staffSchema);
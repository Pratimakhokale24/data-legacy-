import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  companyName: string;
  companyDomain?: string;
  contactName: string;
  acceptedTermsAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  companyName: { type: String, required: true },
  companyDomain: { type: String },
  contactName: { type: String, required: true },
  acceptedTermsAt: { type: Date },
});

export default mongoose.model<IUser>('User', UserSchema);
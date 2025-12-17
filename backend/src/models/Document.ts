import mongoose, { Schema, Types } from 'mongoose';

export interface IDocument {
  user: Types.ObjectId;
  companyName?: string;
  title: string;
  content: any; // JSON payload of extracted data or other document structure
  fileName?: string;
  keyPoints?: string[];
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  fileName: { type: String },
  keyPoints: { type: [String], default: [] },
  notes: { type: String, default: '' },
  tags: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);
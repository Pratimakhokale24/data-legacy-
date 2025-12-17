import mongoose, { Schema, Types } from 'mongoose';

interface SchemaField {
  id: string;
  name: string;
  description: string;
}

type ExtractedRecord = Record<string, string | number>;

export interface IHistoryItem {
  user: Types.ObjectId;
  companyName?: string;
  title: string;
  timestamp: string;
  legacyData: string;
  schema: SchemaField[];
  extractedData: ExtractedRecord[];
}

const SchemaFieldSchema = new Schema<SchemaField>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  // Make description optional to avoid validation failures when users omit it
  description: { type: String, required: false, default: '' }
}, { _id: false });

const HistoryItemSchema = new Schema<IHistoryItem>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, index: true },
  title: { type: String, required: true },
  timestamp: { type: String, required: true },
  legacyData: { type: String, required: true },
  schema: { type: [SchemaFieldSchema], required: true },
  // Store extracted records as plain objects; Mixed avoids rigid typing
  extractedData: { type: [Object], required: true }
});

export default mongoose.model<IHistoryItem>('HistoryItem', HistoryItemSchema);
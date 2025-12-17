
export interface SchemaField {
  id: string;
  name: string;
  description: string;
}

export type ExtractedRecord = Record<string, string | number>;

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  legacyData: string;
  schema: SchemaField[];
  extractedData: ExtractedRecord[];
}

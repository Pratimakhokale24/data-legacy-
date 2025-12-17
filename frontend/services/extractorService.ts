import { GoogleGenAI } from "@google/genai";
import type { SchemaField, ExtractedRecord } from "../types";

// Initialize AI client only if a key is explicitly provided and AI use is enabled.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string | undefined;
const USE_AI = (process.env.USE_AI ?? 'false').toLowerCase() === 'true';
const ai = GEMINI_API_KEY && USE_AI ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

function basicExtractData(legacyData: string, schema: SchemaField[]): ExtractedRecord[] {
  const lines = legacyData
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const records: ExtractedRecord[] = [];
  for (const line of lines) {
    // Split by common separators: '-', ',', '|', or whitespace groups
    const parts = line.split(/\s*[-,|]\s*|\s+/).filter((p) => p.length > 0);
    const record: ExtractedRecord = {};
    for (let i = 0; i < schema.length; i++) {
      const key = schema[i].name.trim();
      if (!key) continue;
      record[key] = parts[i] ?? '';
    }
    records.push(record);
  }
  return records;
}

export async function extractData(
  legacyData: string,
  schema: SchemaField[]
): Promise<ExtractedRecord[]> {
  
  const schemaDescription = schema
    .map((field) => `- "${field.name}": ${field.description}`)
    .join("\n");

  const prompt = `
    You are an expert data extraction AI. Your task is to analyze the provided legacy text data and convert it into a structured JSON format based on the given schema.

    **Instructions:**
    1. Read the "LEGACY DATA" block carefully.
    2. Use the "EXTRACTION SCHEMA" to understand the required fields and their meanings.
    3. Extract the information for each record.
    4. Format the output as a single, valid JSON array of objects. Each object in the array represents a single record.
    5. The keys in your output JSON objects MUST EXACTLY MATCH the "name" values from the schema.
    
    ---
    **LEGACY DATA:**
    ---
    ${legacyData}
    ---

    **EXTRACTION SCHEMA:**
    ---
    ${schemaDescription}
    ---

    **OUTPUT (JSON Array only):**
  `;

  try {
    if (!ai) {
      // Fallback: offline parser without using any API key
      return basicExtractData(legacyData, schema);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.0,
      },
    });

    let jsonStr = response.text.trim();
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (!Array.isArray(parsedData)) {
      // If AI returns a single object for a single record, wrap it in an array
      if (typeof parsedData === 'object' && parsedData !== null) {
        return [parsedData as ExtractedRecord];
      }
      throw new Error("AI response was not a JSON array.");
    }
    
    if (parsedData.length > 0 && typeof parsedData[0] !== 'object') {
        throw new Error("Elements in the JSON array are not objects.");
    }

    return parsedData as ExtractedRecord[];

  } catch (error) {
    console.error("Error processing data:", error);
    // On AI failure, gracefully fall back to offline parser
    return basicExtractData(legacyData, schema);
  }
}

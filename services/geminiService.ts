
import { GoogleGenAI, Type } from "@google/genai";
import { QuotationData } from "../types";

// Initialized with process.env.API_KEY directly as required by guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceQuotation = async (data: QuotationData): Promise<{ enhancedNotes: string; professionalSummary: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Enhance the professional tone of this quotation. 
      Sender: ${data.senderName}
      Client: ${data.clientName}
      Items: ${data.items.map(i => i.description).join(', ')}
      Current Notes: ${data.notes}
      
      Provide a more professional 'Notes' section and a short executive summary for the quote.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedNotes: { type: Type.STRING },
            professionalSummary: { type: Type.STRING },
          },
          required: ["enhancedNotes", "professionalSummary"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error enhancing quotation:", error);
    return {
      enhancedNotes: data.notes,
      professionalSummary: "Quotation prepared for " + data.clientName,
    };
  }
};

export const analyzeCustomService = async (description: string): Promise<{ name: string, includes: string[], excludes: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following service description provided by a user and generate a professional service package.
      Description: "${description}"
      
      Tasks:
      1. Create a professional, punchy name for this service (max 5 words).
      2. Generate 5 specific, high-value inclusions that would be standard for this service.
      3. Generate 3 logical exclusions (out-of-scope items) that protect the provider.
      
      Return the data in the specified JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            includes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            excludes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["name", "includes", "excludes"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error analyzing custom service:", error);
    return {
      name: "Custom Project Solution",
      includes: ["Discovery and Planning", "Implementation", "Quality Assurance"],
      excludes: ["Third-party fees", "Hardware costs"]
    };
  }
};

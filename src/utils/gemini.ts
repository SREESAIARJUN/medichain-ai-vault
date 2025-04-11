
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DiagnosisResult {
  diagnosis: string;
  causes: string[];
  suggestions: string[];
  risk_level: "Low" | "Medium" | "High" | "Undetermined";
  followup_needed: boolean;
  additional_notes: string;
}

// The API key should be properly secured in a production environment
const apiKey = "AIzaSyAZn35XN5nxjiW0COUFJqG5HjNhnnnO79M";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-03-25",
  systemInstruction: `
You are a medical diagnosis assistant. Based on the symptoms provided by the user, your job is to:

1. Identify the most likely medical condition (diagnosis).
2. List common or probable causes.
3. Suggest steps the user can take for relief or treatment.
4. Assign a risk level (Low, Medium, High, Undetermined).
5. Indicate whether a follow-up with a medical professional is necessary.
6. Include additional notes with warnings or context, if needed.

Always be informative but never replace a real doctor's advice. Be cautious with severe symptoms and ensure safety of the user comes first.
  `.trim(),
});

const generationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      diagnosis: {
        type: "string",
        description: "The primary medical condition suspected based on the symptoms."
      },
      causes: {
        type: "array",
        description: "Possible underlying causes for the diagnosis.",
        items: { type: "string" }
      },
      suggestions: {
        type: "array",
        description: "Recommended actions, treatments, or care practices for the condition.",
        items: { type: "string" }
      },
      risk_level: {
        type: "string",
        enum: ["Low", "Medium", "High", "Undetermined"],
        description: "Severity or urgency associated with the diagnosis."
      },
      followup_needed: {
        type: "boolean",
        description: "Indicates whether a medical follow-up or consultation is necessary."
      },
      additional_notes: {
        type: "string",
        description: "Any extra guidance, disclaimers, or contextual insights."
      }
    },
    required: [
      "diagnosis",
      "causes",
      "suggestions",
      "risk_level",
      "followup_needed",
      "additional_notes"
    ]
  },
};

export const callGeminiAPI = async (prompt: string): Promise<DiagnosisResult> => {
  const chat = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chat.sendMessage(prompt);
  const candidates = result.response?.candidates || [];

  const jsonOutput = candidates
    .map((c) => c.content.parts?.[0]?.text)
    .find((t) => t && t.trim().startsWith("{"));

  if (!jsonOutput) {
    throw new Error("Gemini response did not contain valid JSON output.");
  }

  try {
    return JSON.parse(jsonOutput);
  } catch (err) {
    console.error("Failed to parse Gemini response:", jsonOutput);
    throw err;
  }
};

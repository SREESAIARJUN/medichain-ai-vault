
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

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
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    });
    
    const response = result.response;
    const textResponse = response.text();
    
    try {
      // Since we're using responseMimeType: "application/json", we should get JSON directly
      const parsedResult = JSON.parse(textResponse) as DiagnosisResult;
      
      // Validate the parsed result has the required fields
      if (!parsedResult.diagnosis) parsedResult.diagnosis = "Unspecified condition";
      if (!Array.isArray(parsedResult.causes)) parsedResult.causes = [];
      if (!Array.isArray(parsedResult.suggestions)) parsedResult.suggestions = [];
      if (!parsedResult.risk_level) parsedResult.risk_level = "Undetermined";
      if (typeof parsedResult.followup_needed !== "boolean") parsedResult.followup_needed = true;
      if (!parsedResult.additional_notes) parsedResult.additional_notes = "No additional notes provided.";
      
      return parsedResult;
    } catch (parseError) {
      console.error("Failed to parse JSON from response:", parseError);
      console.log("Raw response:", textResponse);
      
      // If JSON parsing fails, fallback to the manual parsing approach
      // Basic parsing of the raw text response
      const diagnosisMatch = textResponse.match(/diagnosis:?\s*([^\n]+)/i);
      const causesMatches = textResponse.match(/causes:?\s*([\s\S]*?)(?=suggestions:|risk level:|followup|$)/i);
      const suggestionsMatches = textResponse.match(/suggestions:?\s*([\s\S]*?)(?=risk level:|followup|$)/i);
      const riskMatch = textResponse.match(/risk level:?\s*([^\n]+)/i);
      const followupMatch = textResponse.match(/followup needed:?\s*(\w+)/i);
      const notesMatch = textResponse.match(/additional notes:?\s*([\s\S]*?)(?=$)/i);
      
      // Extract items from bullet points
      const extractItems = (text?: string): string[] => {
        if (!text) return [];
        return text
          .split(/\n-|\n\*|\n\d+\./)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      };
      
      // Construct a properly formatted response
      return {
        diagnosis: diagnosisMatch?.[1]?.trim() || "Unspecified condition",
        causes: causesMatches ? extractItems(causesMatches[1]) : [],
        suggestions: suggestionsMatches ? extractItems(suggestionsMatches[1]) : [],
        risk_level: (riskMatch?.[1]?.includes("Low") ? "Low" : 
                    riskMatch?.[1]?.includes("Medium") ? "Medium" :
                    riskMatch?.[1]?.includes("High") ? "High" : "Undetermined") as DiagnosisResult["risk_level"],
        followup_needed: followupMatch ? 
                        followupMatch[1].toLowerCase() === "true" || 
                        followupMatch[1].toLowerCase() === "yes" : true,
        additional_notes: notesMatch?.[1]?.trim() || "No additional notes provided."
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get diagnosis from Gemini API.");
  }
};

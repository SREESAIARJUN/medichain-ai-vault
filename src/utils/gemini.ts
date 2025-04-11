
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
  model: "gemini-1.5-pro",  // Using stable model name
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

export const callGeminiAPI = async (prompt: string): Promise<DiagnosisResult> => {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
      }
    });
    
    const response = result.response;
    const textResponse = response.text();
    
    // Try to extract JSON from the response text
    let jsonStart = textResponse.indexOf('{');
    let jsonEnd = textResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      // If no JSON structure is found, create a structured response manually
      console.log("Structured JSON not found in response, parsing manually");
      
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
    
    // Extract JSON from the response
    try {
      const jsonString = textResponse.substring(jsonStart, jsonEnd);
      const parsedResult = JSON.parse(jsonString) as DiagnosisResult;
      
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
      throw new Error("Failed to parse Gemini response as JSON.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get diagnosis from Gemini API.");
  }
};

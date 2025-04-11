interface DiagnosisResult {
  diagnosis: string;
  causes: string[];
  suggestions: string[];
  risk_level: string;
  followup_needed: boolean;
  additional_notes: string;
}

export const callGeminiAPI = async (prompt: string): Promise<DiagnosisResult> => {
  try {
    const apiKey = "AIzaSyAZn35XN5nxjiW0COUFJqG5HjNhnnnO79M"; // Make sure this is defined in your .env file

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Invalid Gemini response format");

    const result: DiagnosisResult = JSON.parse(rawText);
    return result;

  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to fetch diagnosis from Gemini API.");
  }
};

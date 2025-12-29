import { GoogleGenAI } from "@google/genai";
import { FormGuideData, SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getExerciseFormGuide = async (exerciseName: string): Promise<FormGuideData> => {
  if (!apiKey) {
    return {
      tips: ["API Key is missing. Please configure your API key to see AI tips."],
      videos: []
    };
  }

  try {
    const prompt = `Provide 3 concise, critical form cues for the ${exerciseName} exercise for a beginner doing 5x5. Also find a top-rated instructional video on YouTube.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // schema is not supported with search, so we parse manually
      }
    });

    const text = response.text || "No tips available.";
    
    // Extract tips from text (assuming bullet points or numbered list in markdown)
    const tips = text.split('\n')
      .filter(line => line.trim().match(/^[-*]|\d+\./))
      .map(line => line.replace(/^[-*]|\d+\.\s*/, '').trim())
      .slice(0, 5); // Take top 5

    // Extract grounding chunks for videos
    const videos: SearchResult[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach(chunk => {
      if (chunk.web) {
        videos.push({
          title: chunk.web.title || `Guide for ${exerciseName}`,
          uri: chunk.web.uri || '#',
          source: 'Web'
        });
      }
    });

    return {
      tips: tips.length > 0 ? tips : [text],
      videos: videos
    };

  } catch (error) {
    console.error("Error fetching form guide:", error);
    return {
      tips: ["Could not load AI tips at this time."],
      videos: []
    };
  }
};

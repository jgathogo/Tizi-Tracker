import { GoogleGenAI } from "@google/genai";
import { FormGuideData, SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';

export const getExerciseFormGuide = async (exerciseName: string): Promise<FormGuideData> => {
  if (!apiKey) {
    return {
      tips: ["API Key is missing. Please configure your API key in the environment."],
      videos: []
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Provide 3 concise, critical form cues for the ${exerciseName} exercise. Also find a top-rated instructional video link.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No tips available.";
    
    // Extract tips from text (looking for bullet points or lists)
    const tips = text.split('\n')
      .filter(line => line.trim().match(/^[-*]|\d+\./))
      .map(line => line.replace(/^[-*]|\d+\.\s*/, '').trim())
      .slice(0, 3);

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
      tips: tips.length > 0 ? tips : [text.substring(0, 200) + '...'],
      videos: videos.slice(0, 2)
    };

  } catch (error) {
    console.error("Error fetching form guide:", error);
    return {
      tips: ["Could not load AI tips at this time."],
      videos: []
    };
  }
};
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI client.
// This assumes process.env.API_KEY is configured for Gemini.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to classify if a search query is educational.
 * @param query The user's search query.
 * @returns A promise that resolves to true if the query is educational, false otherwise.
 */
export async function isEducationalQuery(query: string): Promise<boolean> {
    const prompt = `Classify the following user query: "${query}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a strict query classifier. Your only task is to determine if a search query is academic or educational. You must only respond with one of two words: 'EDUCATIONAL' or 'NON_EDUCATIONAL'. Do not add any other text, explanation, or punctuation.",
                temperature: 0, // Set temperature to 0 for deterministic classification
            },
        });
        
        const classification = response.text.trim().toUpperCase();
        return classification === 'EDUCATIONAL';
    } catch (error) {
        console.error("Gemini query classification failed:", error);
        // Default to true to avoid blocking the user if the classification service fails.
        return true; 
    }
}

/**
 * Uses Gemini with Google Search grounding to provide a direct answer to a query.
 * It no longer returns sources to avoid issues with non-embeddable websites.
 * @param query The user's search query.
 * @returns A promise that resolves to the AI-generated answer as a string.
 */
export async function performEducationalSearch(query: string): Promise<string> {
    const prompt = `Based on Google Search results, provide a comprehensive and helpful answer for the following academic query. Format your response clearly using Markdown (e.g., use headings, lists, and bold text to structure the information). Do not include any links, images, or mention specific website sources in your answer. Query: "${query}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are Zenith Study, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
                tools: [{ googleSearch: {} }],
            },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini search failed:", error);
        throw new Error("The AI-powered search is currently unavailable. Please try again later.");
    }
}

// NOTE FOR PUBLISHING:
// The YouTube video search functionality has been removed from the client-side code.
// Hardcoding a YouTube API key here is a major security risk. In a production
// application, you must create a secure backend service (e.g., a serverless function)
// that stores the API key and makes requests to the YouTube API on behalf of the
// frontend. The frontend would then call your backend endpoint, which is a safe
// way to use the service without exposing your key.

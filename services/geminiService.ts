import { GoogleGenAI } from "@google/genai";
import type { YouTubeVideo } from '../types';

// WARNING: API keys are exposed in the frontend as per user request to make the app standalone.
// This is a major security risk. Do not deploy this publicly with billable keys.
const YOUTUBE_API_KEY = "AIzaSyD8UC1NnpVs2xgytpNjicSDVx05ILsjnjQ";
const GEMINI_API_KEY = "AIzaSyDqF6S3a2C0N8rrMH4pB6mczv0BClBFEJ4";

// Initialize the Gemini AI client directly in the frontend
let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
  // The UI will show a generic error if this fails.
}


/**
 * Sends a message directly to the Gemini API, including conversation history.
 * @param history The previous messages in the conversation.
 * @param message The new user message.
 * @returns A promise that resolves to the AI-generated answer as a string.
 */
export async function performEducationalSearch(history: any[], message: string): Promise<string> {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized. Check your API key.");
    }

    try {
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: "You are Zenith Study, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
                tools: [{ googleSearch: {} }],
            },
        });
        
        const responseText = response.text;
        if (!responseText) {
             throw new Error("The AI returned an empty response.");
        }
        return responseText;
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the AI service.";
        // Provide a more user-friendly message for common API key issues
        if (errorMessage.includes("API key not valid")) {
            throw new Error("The Gemini API key is invalid. Please check the key in the code.");
        }
        throw new Error(errorMessage);
    }
}


/**
 * Finds educational YouTube videos by calling the YouTube Data API v3 directly.
 *
 * @param query The user's search term (e.g., "ray optics").
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findEducationalVideos = async (query: string): Promise<YouTubeVideo[]> => {
    try {
        const educationalQuery = `${query} tutorial lecture course documentary explanation`;
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: educationalQuery,
            maxResults: '25', // Fetch more to filter out shorts
            type: 'video',
            videoEmbeddable: 'true',
            key: YOUTUBE_API_KEY,
        });
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;

        const response = await fetch(searchUrl);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
            const reason = errorData.error?.errors?.[0]?.reason;
            if (reason === 'quotaExceeded') {
                throw new Error('The daily YouTube API quota has been exceeded. Please try again tomorrow.');
            }
            const message = errorData.error?.message || 'The YouTube API returned an error. Check the API key and ensure the YouTube Data API v3 is enabled in your Google Cloud console.';
            throw new Error(message);
        }
        
        const searchData = await response.json();

        if (!searchData || !Array.isArray(searchData.items)) {
            return [];
        }

        // Filter out shorts by checking title, then take the first 10 results.
        const nonShorts = searchData.items.filter((item: any) => {
            const title = item?.snippet?.title || '';
            // A common pattern for shorts is the #shorts tag.
            return !title.toLowerCase().includes('#shorts');
        });

        return nonShorts
            .slice(0, 10) // Limit to a maximum of 10 videos
            .map((item: any) => ({
                videoId: item?.id?.videoId,
                title: item?.snippet?.title,
            }))
            .filter((video: Partial<YouTubeVideo>) => video.videoId && video.title);
            
    } catch (error) {
        console.error("YouTube API Error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};
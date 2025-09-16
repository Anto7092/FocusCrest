import { GoogleGenAI } from "@google/genai";
import type { YouTubeVideo } from '../types';

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
 * It first checks for founder-related questions, then validates if the query is educational.
 * @param query The user's search query.
 * @returns A promise that resolves to the AI-generated answer as a string.
 */
export async function performEducationalSearch(query: string): Promise<string> {
    // First, check for founder-related questions as a special case.
    const lowerCaseQuery = query.toLowerCase();
    const founderKeywords = ['founder', 'creator', 'who made you', 'who created you', 'who built you'];
    if (founderKeywords.some(keyword => lowerCaseQuery.includes(keyword))) {
        return "This application was founded and created by Anto Bredly.";
    }

    // Next, check if the query is educational.
    const isEducational = await isEducationalQuery(query);
    if (!isEducational) {
        throw new Error("This query seems unrelated to your studies. Please focus on your goals.");
    }

    // If educational, proceed with the search.
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

// WARNING: Hardcoded API key for development purposes.
const YOUTUBE_API_KEY = 'AIzaSyD2b_jvqvwaTQwhTedev4qY1o9Vzfi5fw8';

/**
 * Parses an ISO 8601 duration string (e.g., "PT2M10S") into seconds.
 * @param duration The ISO 8601 duration string.
 * @returns The total duration in seconds.
 */
function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
}


const fetchYouTubeVideos = async (queryParams: Record<string, string>): Promise<YouTubeVideo[]> => {
     if (!YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is not configured.");
    }

    const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEY,
        ...queryParams,
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("YouTube API Error:", data);
            const errorMessage = data.error?.message || 'An unknown error occurred with the YouTube API.';
            throw new Error(`Failed to fetch videos from YouTube: ${errorMessage}`);
        }

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items
            .map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
            }))
            .filter((video: YouTubeVideo) => video.videoId && video.title);

    } catch (error) {
        console.error("Error fetching from YouTube API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};

/**
 * Finds educational YouTube videos using a two-step process to reliably filter out Shorts.
 * 1. Searches for video IDs relevant to the query.
 * 2. Fetches content details for those videos and filters out any shorter than 65 seconds.
 *
 * @param query The user's search term (e.g., "ray optics").
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findEducationalVideos = async (query: string): Promise<YouTubeVideo[]> => {
    if (!YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is not configured.");
    }

    try {
        // Bias search towards educational content by appending relevant keywords.
        const educationalQuery = `${query} tutorial lecture course documentary explanation class`;

        // Step 1: Search for video IDs
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: educationalQuery,
            maxResults: '40',
            type: 'video',
            videoEmbeddable: 'true',
            key: YOUTUBE_API_KEY,
        });
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchResponse.ok) {
            throw new Error(searchData.error?.message || 'Failed to search for videos.');
        }

        const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');
        if (!videoIds) return [];

        // Step 2: Get video details to check duration
        const detailsParams = new URLSearchParams({
            part: 'snippet,contentDetails',
            id: videoIds,
            key: YOUTUBE_API_KEY,
        });
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (!detailsResponse.ok) {
            throw new Error(detailsData.error?.message || 'Failed to fetch video details.');
        }

        // Step 3: Filter by duration and map to the required type
        return detailsData.items
            .filter((item: any) => {
                const duration = item.contentDetails?.duration;
                if (!duration) return false;
                const durationInSeconds = parseISO8601Duration(duration);
                return durationInSeconds > 65; // Exclude Shorts (typically <= 60s)
            })
            .map((item: any) => ({
                videoId: item.id,
                title: item.snippet.title,
            }));

    } catch (error) {
        console.error("Error finding educational videos:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};


/**
 * Finds long-form focus and study music on YouTube.
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findFocusMusic = async (): Promise<YouTubeVideo[]> => {
    return await fetchYouTubeVideos({
        q: 'binaural beats for studying and concentration',
        maxResults: '20',
        videoDuration: 'long', // Prefers videos over 20 minutes
    });
};
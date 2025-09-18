// api/gemini.ts
// This is a Vercel Serverless Function that acts as a secure proxy
// to the Google Gemini and YouTube APIs.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import type { YouTubeVideo } from '../types';

// SECURELY read API keys from Vercel Environment Variables.
// These MUST be configured in your Vercel project settings.
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Main handler function using Vercel's request/response objects
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    try {
        // Essential check: Ensure the keys are available on the server environment.
        if (!GEMINI_API_KEY || !YOUTUBE_API_KEY) {
            return res.status(500).json({ error: 'A server error occurred: One or more API keys are not configured on the server. Please check Vercel environment variables.' });
        }
        
        // Initialize the client safely inside the handler
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        if (!req.body) {
            return res.status(400).json({ error: 'Missing request body' });
        }
        const { action, payload } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Missing action in request body' });
        }

        switch (action) {
            case 'isEducationalQuery':
                if (!payload || typeof payload.query !== 'string') {
                    return res.status(400).json({ error: 'Invalid payload for isEducationalQuery' });
                }
                const isEducational = await isEducationalQueryBackend(payload.query, ai);
                return res.status(200).json({ result: isEducational });

            case 'performSearch':
                if (!payload || !Array.isArray(payload.history) || typeof payload.message !== 'string') {
                    return res.status(400).json({ error: 'Invalid payload for performSearch' });
                }
                const answer = await performChatSearchBackend(payload.history, payload.message, ai);
                return res.status(200).json({ result: answer });
            
            case 'findEducationalVideos':
                if (!payload || typeof payload.query !== 'string') {
                    return res.status(400).json({ error: 'Invalid payload for findEducationalVideos' });
                }
                const videos = await findEducationalVideosBackend(payload.query, YOUTUBE_API_KEY);
                return res.status(200).json({ result: videos });

            case 'findFocusMusic':
                const music = await findFocusMusicBackend(YOUTUBE_API_KEY);
                return res.status(200).json({ result: music });

            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }
    } catch (error) {
        console.error("API Error:", error);
        const message = error instanceof Error ? error.message : "An internal server error occurred.";
        return res.status(500).json({ error: message });
    }
}


// --- API Logic ---

async function isEducationalQueryBackend(query: string, genAI: GoogleGenAI): Promise<boolean> {
    const prompt = `Classify the following user query: "${query}"`;
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a strict query classifier. Your only task is to determine if a search query is academic or educational. You must only respond with one of two words: 'EDUCATIONAL' or 'NON_EDUCATIONAL'. Do not add any other text, explanation, or punctuation.",
                temperature: 0,
            },
        });
        
        const textResponse = response.text;
        if (!textResponse) {
            // If the model gives no text response, err on the side of caution and allow the query.
            return true;
        }
        
        const classification = textResponse.trim().toUpperCase();
        return classification === 'EDUCATIONAL';
    } catch (error) {
        console.error("Gemini query classification failed:", error);
        return true; 
    }
}

async function performChatSearchBackend(history: any[], message: string, genAI: GoogleGenAI): Promise<string> {
    try {
        // Construct the full conversation history including the new message.
        // This stateless approach is more robust for serverless environments.
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents, // Pass the full history and new message.
            config: {
                systemInstruction: "You are Zenith Study, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
                tools: [{ googleSearch: {} }],
            },
        });

        // Ensure we always return a string, providing a fallback message if the response text is empty.
        return response.text || "I am sorry, but I could not generate a response. Please try again.";
    } catch (error) {
        console.error("Gemini generateContent failed:", error);
        throw new Error("The AI-powered search is currently unavailable. Please try again later.");
    }
}

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
}

// A helper function to safely handle fetch responses from YouTube API
async function safeYouTubeFetch(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        let errorText = await response.text();
        try {
            // Try to parse the error for a more specific message from the API
            const errorJson = JSON.parse(errorText);
            const message = errorJson.error?.message || 'An unknown YouTube API error occurred.';
            console.error("YouTube API Error:", message);
            throw new Error(message);
        } catch (e) {
            // If parsing fails, the error was not JSON (e.g., an HTML page)
            console.error("Non-JSON YouTube API Error:", errorText);
            throw new Error('The YouTube API returned an unexpected response.');
        }
    }
    return response.json();
}


async function findEducationalVideosBackend(query: string, apiKey: string): Promise<YouTubeVideo[]> {
    const educationalQuery = `${query} tutorial lecture course documentary explanation class`;

    const searchParams = new URLSearchParams({
        part: 'snippet',
        q: educationalQuery,
        maxResults: '40',
        type: 'video',
        videoEmbeddable: 'true',
        key: apiKey,
    });
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
    const searchData = await safeYouTubeFetch(searchUrl);

    // CRASH-PROOF VALIDATION: Ensure `items` exists and is an array before processing.
    if (!searchData || !Array.isArray(searchData.items)) {
        return [];
    }

    const videoIds = searchData.items
        .map((item: any) => item?.id?.videoId)
        .filter(Boolean)
        .join(',');

    if (!videoIds) return [];

    const detailsParams = new URLSearchParams({
        part: 'snippet,contentDetails',
        id: videoIds,
        key: apiKey,
    });
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
    const detailsData = await safeYouTubeFetch(detailsUrl);
    
    // CRASH-PROOF VALIDATION: Ensure `items` exists and is an array on the second API call.
    if (!detailsData || !Array.isArray(detailsData.items)) {
        return [];
    }

    return detailsData.items
        .filter((item: any) => {
            const duration = item?.contentDetails?.duration;
            if (!duration) return false;
            const durationInSeconds = parseISO8601Duration(duration);
            return durationInSeconds > 65;
        })
        .map((item: any) => ({
            videoId: item?.id,
            title: item?.snippet?.title,
        }))
        .filter((video: Partial<YouTubeVideo>) => video.videoId && video.title);
}

async function findFocusMusicBackend(apiKey: string): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
        part: 'snippet',
        q: 'binaural beats for studying and concentration',
        maxResults: '20',
        videoDuration: 'long',
        type: 'video',
        videoEmbeddable: 'true',
        key: apiKey,
    });
    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const data = await safeYouTubeFetch(url);
    
    // CRASH-PROOF VALIDATION: Ensure `items` exists and is an array before processing.
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        return [];
    }

    return data.items
        .map((item: any) => ({
            videoId: item?.id?.videoId,
            title: item?.snippet?.title,
        }))
        .filter((video: Partial<YouTubeVideo>) => video.videoId && video.title);
}
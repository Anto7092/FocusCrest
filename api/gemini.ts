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

        const { action, payload } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Missing action in request body' });
        }

        switch (action) {
            case 'isEducationalQuery':
                const isEducational = await isEducationalQueryBackend(payload.query, ai);
                return res.status(200).json({ result: isEducational });

            case 'performSearch':
                const answer = await startOrContinueChatBackend(payload.history, payload.message, ai);
                return res.status(200).json({ result: answer });
            
            case 'findEducationalVideos':
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
        
        const classification = response.text.trim().toUpperCase();
        return classification === 'EDUCATIONAL';
    } catch (error) {
        console.error("Gemini query classification failed:", error);
        return true; 
    }
}

async function startOrContinueChatBackend(history: any[], message: string, genAI: GoogleGenAI): Promise<string> {
    try {
        const chat = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are Zenith Study, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
                tools: [{ googleSearch: {} }],
            },
            history,
        });

        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Gemini chat failed:", error);
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
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || 'Failed to search for videos.');
    }

    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');
    if (!videoIds) return [];

    const detailsParams = new URLSearchParams({
        part: 'snippet,contentDetails',
        id: videoIds,
        key: apiKey,
    });
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
        throw new Error(detailsData.error?.message || 'Failed to fetch video details.');
    }
    
    if (!detailsData.items) {
        return [];
    }

    return detailsData.items
        .filter((item: any) => {
            const duration = item.contentDetails?.duration;
            if (!duration) return false;
            const durationInSeconds = parseISO8601Duration(duration);
            return durationInSeconds > 65;
        })
        .map((item: any) => ({
            videoId: item.id,
            title: item.snippet.title,
        }));
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
}
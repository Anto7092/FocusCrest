// api/gemini.ts
// This is a Vercel Serverless Function that acts as a secure proxy
// to the Google Gemini and YouTube APIs.

import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from "@google/genai";
import type { YouTubeVideo } from '../types';

// Utility to parse request body
function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Handle empty body
                if (body) {
                    resolve(JSON.parse(body));
                } else {
                    resolve({});
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

// Check for required environment variables
const GEMINI_API_KEY = process.env.API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// Main handler function
export default async function handler(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    
    if (!GEMINI_API_KEY || !ai) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Gemini API key is not configured on the server.' }));
    }
    
    if (!YOUTUBE_API_KEY && req.url?.includes('find')) { // YouTube key only needed for video functions
         res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'YouTube API key is not configured on the server.' }));
    }

    try {
        const { action, payload } = await parseBody(req);

        switch (action) {
            case 'isEducationalQuery':
                const isEducational = await isEducationalQueryBackend(payload.query, ai);
                return res.end(JSON.stringify({ result: isEducational }));

            case 'performSearch':
                const answer = await performSearchBackend(payload.query, ai);
                return res.end(JSON.stringify({ result: answer }));
            
            case 'findEducationalVideos':
                const videos = await findEducationalVideosBackend(payload.query);
                return res.end(JSON.stringify({ result: videos }));

            case 'findFocusMusic':
                const music = await findFocusMusicBackend();
                return res.end(JSON.stringify({ result: music }));

            default:
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid action specified' }));
        }
    } catch (error) {
        console.error("API Error:", error);
        res.statusCode = 500;
        const message = error instanceof Error ? error.message : "An internal server error occurred.";
        return res.end(JSON.stringify({ error: message }));
    }
}


// --- API Logic (moved from frontend) ---

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

async function performSearchBackend(query: string, genAI: GoogleGenAI): Promise<string> {
    const prompt = `Based on Google Search results, provide a comprehensive and helpful answer for the following academic query. Format your response clearly using Markdown (e.g., use headings, lists, and bold text to structure the information). Do not include any links, images, or mention specific website sources in your answer. Query: "${query}"`;

    try {
        const response = await genAI.models.generateContent({
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

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
}

async function findEducationalVideosBackend(query: string): Promise<YouTubeVideo[]> {
    const educationalQuery = `${query} tutorial lecture course documentary explanation class`;

    const searchParams = new URLSearchParams({
        part: 'snippet',
        q: educationalQuery,
        maxResults: '40',
        type: 'video',
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEY!,
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
        key: YOUTUBE_API_KEY!,
    });
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
        throw new Error(detailsData.error?.message || 'Failed to fetch video details.');
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

async function findFocusMusicBackend(): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
        part: 'snippet',
        q: 'binaural beats for studying and concentration',
        maxResults: '20',
        videoDuration: 'long',
        type: 'video',
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEY!,
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

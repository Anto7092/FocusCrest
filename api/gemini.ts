// api/gemini.ts
// This is a Vercel Serverless Function that acts as a secure proxy
// to the Google Gemini and YouTube APIs.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import type { YouTubeVideo } from '../types';

// WARNING: API keys are hardcoded as per user request for testing.
// This is not secure for production.
const YOUTUBE_API_KEY = "AIzaSyD8UC1NnpVs2xgytpNjicSDVx05ILsjnjQ";
const GEMINI_API_KEY = "AIzaSyDqF6S3a2C0N8rrMH4pB6mczv0BClBFEJ4";

const SERVER_TIMEOUT = 9000; // 9 seconds

/**
 * A robust, manual parser to read the request body stream.
 * This bypasses Vercel's faulty automatic body parser, which was the root cause of the crashes.
 */
async function getBody(req: VercelRequest): Promise<any> {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                // If data is empty, return an empty object to prevent JSON.parse from failing
                resolve(data ? JSON.parse(data) : {});
            } catch (e) {
                // If JSON parsing fails, return an empty object to ensure the app doesn't crash
                resolve({});
            }
        });
        req.on('error', () => {
             // On stream error, resolve with empty to prevent hang
            resolve({});
        });
    });
}

const timeout = (ms: number, message: string) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

async function runAction(action: string, payload: any, ai: GoogleGenAI): Promise<any> {
    switch (action) {
        case 'performSearch':
            if (!payload || !Array.isArray(payload.history) || typeof payload.message !== 'string') {
                throw new Error('Invalid payload for performSearch');
            }
            return performChatSearchBackend(payload.history, payload.message, ai);

        case 'findEducationalVideos':
            if (!payload || typeof payload.query !== 'string') {
                throw new Error('Invalid payload for findEducationalVideos');
            }
            return findEducationalVideosBackend(payload.query, YOUTUBE_API_KEY);

        default:
            throw new Error(`Invalid action specified: ${action}`);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Use the new robust manual parser instead of relying on the faulty req.body
        const body = await getBody(req);

        // Main logic path for all other actions.
        if (!body || !body.action) {
            return res.status(400).json({ error: 'Missing or malformed action in request body' });
        }
        
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const { action, payload } = body;
        
        const result = await Promise.race([
            runAction(action, payload, ai),
            timeout(SERVER_TIMEOUT, `The server operation timed out after ${SERVER_TIMEOUT / 1000} seconds.`)
        ]);
        
        return res.status(200).json({ result });

    } catch (error) {
        console.error("API Handler Error:", error);
        const message = error instanceof Error ? error.message : "An internal server error occurred.";
        return res.status(500).json({ error: message });
    }
}

// --- API Logic ---

async function performChatSearchBackend(history: any[], message: string, genAI: GoogleGenAI): Promise<string> {
    // Intercept questions about the creator to provide a guaranteed, hardcoded answer.
    const lowerCaseMessage = message.toLowerCase();
    const founderKeywords = ['founder', 'creator', 'who made', 'who created', 'who developed', 'who built', 'who designed', 'developer', 'maker'];

    if (founderKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
        return "This application, Focus Crest, was founded and created by Anto Bredly.";
    }

    const contents = [
        ...history,
        { role: 'user', parts: [{ text: message }] }
    ];

    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: "You are an AI assistant for Focus Crest, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
            tools: [{ googleSearch: {} }],
        },
    });

    return response.text || "I am sorry, but I could not generate a response. Please try again.";
}

/**
 * Parses an ISO 8601 duration string into seconds.
 * @param isoDuration The duration string (e.g., "PT1M30S").
 * @returns The total duration in seconds.
 */
const parseISO8601Duration = (isoDuration: string): number => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return 0;
    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);
    return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Finds educational YouTube videos by using a two-step process to reliably filter out Shorts.
 */
async function findEducationalVideosBackend(query: string, apiKey: string): Promise<YouTubeVideo[]> {
    try {
        const educationalQuery = `${query} tutorial lecture course documentary explanation`;
        
        // Step 1: Search for up to 50 video IDs
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: educationalQuery,
            maxResults: '50',
            type: 'video',
            videoEmbeddable: 'true',
            key: apiKey,
        });
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error("YouTube API search request failed.");
        const searchData = await searchResponse.json();

        if (!searchData?.items?.length) return [];

        const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);
        if (videoIds.length === 0) return [];

        // Step 2: Fetch details for the found videos to get their duration
        const detailsParams = new URLSearchParams({
            part: 'snippet,contentDetails',
            id: videoIds.join(','),
            key: apiKey,
        });
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) throw new Error("YouTube API details request failed.");
        const detailsData = await detailsResponse.json();

        if (!detailsData?.items?.length) return [];

        // Step 3: Filter out videos that are 60 seconds or less and take the top 25
        const fullLengthVideos = detailsData.items
            .filter((item: any) => {
                const duration = item?.contentDetails?.duration;
                if (!duration) return false;
                const durationInSeconds = parseISO8601Duration(duration);
                return durationInSeconds > 60;
            })
            .map((item: any) => ({
                videoId: item.id,
                title: item.snippet.title,
            }));
            
        return fullLengthVideos.slice(0, 25);
            
    } catch (error) {
        console.error("EduTube Search Error (Backend):", error);
        return []; // Fail gracefully by returning an empty array
    }
}
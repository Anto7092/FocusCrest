// api/gemini.ts
// This is a Vercel Serverless Function that acts as a secure proxy
// to the Google Gemini and YouTube APIs.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { YouTubeVideo, StudyPlan } from '../types';

// Hardcoded API keys for deployment
const YOUTUBE_API_KEY = "AIzaSyDpaOJElbybDXwaPX5T1hhaZ1Ngfim9uGQ";
const GEMINI_API_KEY = "AIzaSyBRsHTEKCk5x7FjdrESmUNN95eOE-dywkI";


const SERVER_TIMEOUT = 28000; // 28 seconds

/**
 * A robust, manual parser to read the request body stream.
 * This is stricter than the previous version and will reject on any error,
 * preventing the server from processing invalid requests.
 */
async function getBody(req: VercelRequest): Promise<any> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            if (!data) {
                return reject(new Error("Request body is empty, cannot proceed."));
            }
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(new Error(`Failed to parse request body as JSON. Invalid format.`));
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}

const timeout = (ms: number, message: string) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

async function runAction(action: string, payload: any, ai: GoogleGenerativeAI): Promise<any> {
    switch (action) {
        case 'generateStudyPlan':
            if (!payload || typeof payload.topic !== 'string' || typeof payload.deadline !== 'string') {
                throw new Error('Invalid payload for generateStudyPlan');
            }
            return generateStudyPlanBackend(payload.topic, payload.deadline, ai);
        
        case 'isQueryEducational':
            if (!payload || typeof payload.query !== 'string') {
                throw new Error('Invalid payload for isQueryEducational');
            }
            return isQueryEducationalBackend(payload.query, ai);
            
        case 'getEducationalSuggestions':
            if (!payload || typeof payload.query !== 'string') {
                throw new Error('Invalid payload for getEducationalSuggestions');
            }
            return getEducationalSuggestionsBackend(payload.query, ai);

        case 'findEducationalVideos':
            if (!payload || typeof payload.query !== 'string') {
                throw new Error('Invalid payload for findEducationalVideos');
            }
            if (!YOUTUBE_API_KEY) {
                throw new Error("The YouTube API Key is not configured on the server.");
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
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }


    try {
        const body = await getBody(req);

        if (!body || !body.action) {
            return res.status(400).json({ error: 'Missing or malformed action in request body' });
        }
        
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        const { action, payload } = body;
        
        if (action === 'performSearchStream') {
            if (!payload || !Array.isArray(payload.history) || typeof payload.message !== 'string') {
                return res.status(400).json({ error: 'Invalid payload for performSearchStream' });
            }
            
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            
            const stream = performSearchStreamBackend(payload.history, payload.message, ai);
            for await (const chunk of stream) {
                res.write(chunk);
            }
            return res.end();
        }
        
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

async function* performSearchStreamBackend(history: any[], message: string, genAI: GoogleGenerativeAI): AsyncGenerator<string> {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "You are an AI assistant for Focus Crest, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Answer the user's query confidently and directly.",
    });

    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.parts }]
        }))
    });

    const result = await chat.sendMessageStream(message);
    
    for await (const chunk of result.stream) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}

async function generateStudyPlanBackend(topic: string, deadline: string, genAI: GoogleGenerativeAI): Promise<StudyPlan> {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "You are an expert academic planner. Your task is to create a structured, day-by-day study plan. Break down the main topic into manageable sub-topics for each day. For each sub-topic, provide a concise description, a relevant YouTube search query, a name for a Pomodoro focus session, and a deep-diving question to ask an AI assistant. The entire output must be in JSON format.",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const result = await model.generateContent(`Generate a study plan for the topic: "${topic}" with the deadline: "${deadline}". Return a JSON object with "title" (string) and "plan" (array of objects with "day", "topic", "description", "youtubeSearch", "pomodoroSessionName", "assistantQuestion" fields).`);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
}


async function isQueryEducationalBackend(query: string, genAI: GoogleGenerativeAI): Promise<{ isEducational: boolean }> {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const result = await model.generateContent(`Is the following search query educational, academic, or related to learning a skill? Answer in JSON with "isEducational" field (boolean). Query: "${query}"`);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
}

async function getEducationalSuggestionsBackend(query: string, genAI: GoogleGenerativeAI): Promise<{ suggestions: string[] }> {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    
    const result = await model.generateContent(`Based on the user's partial query "${query}", generate a list of 5 relevant and diverse educational YouTube search suggestions. The suggestions should be concise and directly searchable. Return JSON with "suggestions" field (array of strings).`);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
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
        if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "YouTube API search request failed.");
        }
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
         if (!detailsResponse.ok) {
            const errorData = await detailsResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "YouTube API details request failed.");
        }
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
        // Re-throw the error so it can be caught by the main handler and sent to the client.
        throw error;
    }
}

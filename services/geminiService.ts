import { GoogleGenAI, Type } from "@google/genai";
import type { YouTubeVideo, StudyPlan } from '../types';

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
 * Sends a message to the Gemini API and streams the response.
 * @param history The previous messages in the conversation.
 * @param message The new user message.
 * @returns An async generator that yields the AI-generated answer as chunks of strings.
 */
export async function* performEducationalSearch(history: any[], message:string): AsyncGenerator<string> {
    // Intercept questions about the creator to provide a guaranteed, hardcoded answer.
    const lowerCaseMessage = message.toLowerCase();
    const founderKeywords = ['founder', 'creator', 'who made', 'who created', 'who developed', 'who built', 'who designed', 'developer', 'maker'];

    if (founderKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
        yield "This application, Focus Crest, was founded and created by Anto Bredly.";
        return;
    }
    
    if (!ai) {
        throw new Error("Gemini AI client is not initialized. Check your API key.");
    }

    try {
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ];

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: "You are an AI assistant for Focus Crest, an expert academic assistant. Your goal is to provide clear, direct, and comprehensive answers to academic questions by synthesizing information from Google Search results. This application was founded and created by Anto Bredly; if asked about your creator, you must state this. Format your response clearly using Markdown (e.g., use headings, lists, and bold/italic text). Do not include any links, images, or mention specific website sources in your answer. Never mention your limitations as an AI. Do not state that you cannot access external links, browse websites, or watch videos. Answer the user's query confidently and directly based on the provided search context.",
                tools: [{ googleSearch: {} }],
            },
        });
        
        for await (const chunk of responseStream) {
            if (chunk && chunk.text) {
                yield chunk.text;
            }
        }
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
 * Checks if a search query is educational using the Gemini API.
 * @param query The user's search query.
 * @returns A promise that resolves to a boolean indicating if the query is educational.
 */
export const isQueryEducational = async (query: string): Promise<boolean> => {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized.");
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Is the following search query educational, academic, or related to learning a skill? Answer in JSON. Query: "${query}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isEducational: {
                            type: Type.BOOLEAN,
                            description: "True if the query is educational, false otherwise."
                        }
                    },
                    required: ["isEducational"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return !!jsonResponse.isEducational;
    } catch (error) {
        console.error("Gemini classification error:", error);
        // Fail open: if the check fails, assume it's educational to not block the user.
        return true;
    }
};

/**
 * Generates educational search suggestions based on a partial query using the Gemini API.
 * @param query The user's partial search query.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export const getEducationalSuggestions = async (query: string): Promise<string[]> => {
    if (!ai) {
        console.error("Gemini AI client is not initialized.");
        return []; // Fail silently if AI is not initialized
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the user's partial query "${query}", generate a list of 5 relevant and diverse educational YouTube search suggestions. The suggestions should be concise and directly searchable.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "An educational search suggestion."
                            },
                            description: "A list of 5 educational search suggestions."
                        }
                    },
                    required: ["suggestions"]
                },
                thinkingConfig: { thinkingBudget: 0 } // Disable thinking for low-latency response
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.suggestions || [];
    } catch (error) {
        console.error("Gemini suggestion generation error:", error);
        return []; // Fail silently to not disrupt user experience with errors
    }
};


/**
 * Generates a structured study plan using the Gemini API.
 * @param topic The subject to study.
 * @param deadline The time frame for the study plan.
 * @returns A promise that resolves to a StudyPlan object.
 */
export const generateStudyPlan = async (topic: string, deadline: string): Promise<StudyPlan> => {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a study plan for the topic: "${topic}" with the deadline: "${deadline}".`,
            config: {
                systemInstruction: "You are an expert academic planner. Your task is to create a structured, day-by-day study plan. Break down the main topic into manageable sub-topics for each day. For each sub-topic, provide a concise description, a relevant YouTube search query, a name for a Pomodoro focus session, and a deep-diving question to ask an AI assistant. The entire output must be in JSON format.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A creative title for the study plan." },
                        plan: {
                            type: Type.ARRAY,
                            description: "A list of daily study steps.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING, description: "The day of the plan (e.g., 'Day 1')." },
                                    topic: { type: Type.STRING, description: "The specific sub-topic for the day." },
                                    description: { type: Type.STRING, description: "A brief one-sentence description of the day's topic." },
                                    youtubeSearch: { type: Type.STRING, description: "A concise, effective search query for YouTube." },
                                    pomodoroSessionName: { type: Type.STRING, description: "A short, motivating name for a Pomodoro session." },
                                    assistantQuestion: { type: Type.STRING, description: "An insightful question to ask an AI assistant about the topic." }
                                },
                                required: ["day", "topic", "description", "youtubeSearch", "pomodoroSessionName", "assistantQuestion"]
                            }
                        }
                    },
                    required: ["title", "plan"]
                }
            }
        });

        const jsonString = response.text.trim();
        const jsonResponse = JSON.parse(jsonString);
        
        if (!jsonResponse.title || !Array.isArray(jsonResponse.plan) || jsonResponse.plan.length === 0) {
            throw new Error("The AI returned an incomplete plan. Please try a different topic or deadline.");
        }
        
        return jsonResponse;
    } catch (error) {
        console.error("Gemini plan generation error:", error);
        if (error instanceof Error && error.message.includes("deadline")) {
             throw new Error("The AI couldn't generate a plan. Please provide a clearer deadline (e.g., 'in one week', 'by Friday').");
        }
        throw new Error("Failed to generate a study plan. The AI may be unavailable or the topic might be too broad. Please try again.");
    }
};


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
 * Finds educational YouTube videos, filtering out shorts.
 * This now uses a two-step process to get video durations and filter reliably.
 *
 * @param query The user's search term (e.g., "ray optics").
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findEducationalVideos = async (query: string): Promise<YouTubeVideo[]> => {
    try {
        const educationalQuery = `${query} tutorial lecture course documentary explanation`;
        
        // Step 1: Search for video IDs (fetch a larger number to have a good pool after filtering)
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: educationalQuery,
            maxResults: '50', // Fetch up to 50 results to filter from
            type: 'video',
            videoEmbeddable: 'true',
            key: YOUTUBE_API_KEY,
        });
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            const reason = errorData.error?.errors?.[0]?.reason;
            if (reason === 'quotaExceeded') {
                throw new Error('The daily YouTube API quota has been exceeded. Please try again tomorrow.');
            }
            const message = errorData.error?.message || 'The YouTube API returned an error during search. Check the API key.';
            throw new Error(message);
        }
        
        const searchData = await searchResponse.json();

        if (!searchData || !Array.isArray(searchData.items) || searchData.items.length === 0) {
            return [];
        }

        const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);
        if (videoIds.length === 0) {
            return [];
        }

        // Step 2: Fetch video details to get durations
        const detailsParams = new URLSearchParams({
            part: 'snippet,contentDetails',
            id: videoIds.join(','),
            key: YOUTUBE_API_KEY,
        });
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;

        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
            // If this second call fails, it's better to return empty than crash.
            console.error("Failed to fetch video details from YouTube API.");
            return [];
        }

        const detailsData = await detailsResponse.json();

        if (!detailsData || !Array.isArray(detailsData.items)) {
            return [];
        }

        // Step 3: Filter out shorts (duration <= 60s) and map the results
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
            
        return fullLengthVideos.slice(0, 25); // Return the top 25 from the filtered list
            
    } catch (error) {
        console.error("YouTube API Error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};
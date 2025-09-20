import { GoogleGenAI, Type } from "@google/genai";
import type { YouTubeVideo, StudyPlan } from '../types';

// Initialize the Gemini AI client directly in the frontend
let ai: GoogleGenAI;
try {
  // API key is sourced from environment variables as per security best practices.
  // The execution environment must provide process.env.API_KEY.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
 * Finds educational YouTube videos by calling the secure backend proxy.
 * This prevents exposing the API key on the client-side.
 *
 * @param query The user's search term (e.g., "ray optics").
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findEducationalVideos = async (query: string): Promise<YouTubeVideo[]> => {
    try {
        // This function now securely calls the backend, which handles the YouTube API key.
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'findEducationalVideos',
                payload: { query },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.error || 'The server returned an error while fetching videos.';
             if (message.toLowerCase().includes('quota')) {
                throw new Error('The daily YouTube API quota has been exceeded. Please try again tomorrow.');
            }
            throw new Error(message);
        }

        const data = await response.json();
        return data.result || [];
    } catch (error) {
        console.error("YouTube API Error (via backend):", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};
import type { YouTubeVideo, StudyPlan } from '../types';


/**
 * Sends a message to the Gemini API via the backend proxy and streams the response.
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
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'performSearchStream',
                payload: { history, message },
            }),
        });

        if (!response.ok || !response.body) {
             const errorText = await response.text();
             try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.error || 'The server returned an error during the search.');
            } catch {
                throw new Error(errorText || 'An unknown server error occurred during the search.');
            }
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield decoder.decode(value, { stream: true });
        }
    } catch (error) {
        console.error("Gemini Streaming Error (via backend):", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the AI service.";
        throw new Error(errorMessage);
    }
}

/**
 * Checks if a search query is educational by calling the secure backend proxy.
 * @param query The user's search query.
 * @returns A promise that resolves to a boolean indicating if the query is educational.
 */
export const isQueryEducational = async (query: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'isQueryEducational',
                payload: { query },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'The server returned an error during classification.');
        }

        const data = await response.json();
        return !!data.result.isEducational;
    } catch (error) {
        console.error("Gemini classification error (via backend):", error);
        // Fail open: if the check fails, assume it's educational to not block the user.
        return true;
    }
};

/**
 * Generates educational search suggestions by calling the secure backend proxy.
 * @param query The user's partial search query.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export const getEducationalSuggestions = async (query: string): Promise<string[]> => {
     try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getEducationalSuggestions',
                payload: { query },
            }),
        });

        if (!response.ok) {
            // Silently fail as per original logic
            console.error("Failed to fetch suggestions from backend");
            return [];
        }

        const data = await response.json();
        return data.result.suggestions || [];
    } catch (error) {
        console.error("Gemini suggestion generation error (via backend):", error);
        return []; // Fail silently to not disrupt user experience with errors
    }
};


/**
 * Generates a structured study plan by calling the secure backend proxy.
 * @param topic The subject to study.
 * @param deadline The time frame for the study plan.
 * @returns A promise that resolves to a StudyPlan object.
 */
export const generateStudyPlan = async (topic: string, deadline: string): Promise<StudyPlan> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateStudyPlan',
                payload: { topic, deadline },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.error || 'The server returned an error while generating the plan.';
            throw new Error(message);
        }

        const data = await response.json();
        const plan = data.result;
        
        if (!plan || !plan.title || !Array.isArray(plan.plan) || plan.plan.length === 0) {
            throw new Error("The AI returned an incomplete plan. Please try a different topic or deadline.");
        }
        
        return plan;
    } catch (error) {
        console.error("Study Plan Generation Error (via backend):", error);
        if (error instanceof Error) {
             if (error.message.includes("deadline")) {
                 throw new Error("The AI couldn't generate a plan. Please provide a clearer deadline (e.g., 'in one week', 'by Friday').");
            }
            throw new Error(error.message || "Failed to generate a study plan. The AI may be unavailable or the topic might be too broad. Please try again.");
        }
        throw new Error("An unexpected error occurred while generating the study plan.");
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
import type { YouTubeVideo, ChatMessage } from '../types';

/**
 * A helper function to call our backend API.
 * @param action The specific API action to perform.
 * @param payload The data to send for that action.
 * @returns The JSON result from the API.
 */
async function callApi<T>(action: string, payload: object): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
            signal: controller.signal, // Link the abort controller
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || 'An unknown server error occurred.');
            } catch (e) {
                throw new Error(errorText || 'A server error occurred with a non-JSON response.');
            }
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            // This specific error is thrown when the timeout is reached
            throw new Error('The request timed out. The server is not responding.');
        }
        // Re-throw other errors (like network failures)
        throw error;
    } finally {
        // Clear the timeout timer regardless of the outcome
        clearTimeout(timeoutId);
    }
}


/**
 * Uses our backend to classify if a search query is educational.
 * @param query The user's search query.
 * @returns A promise that resolves to true if the query is educational, false otherwise.
 */
export async function isEducationalQuery(query: string): Promise<boolean> {
   try {
        return await callApi<boolean>('isEducationalQuery', { query });
   } catch (error) {
        console.error("API call for isEducationalQuery failed:", error);
        // Default to true to avoid blocking the user if the classification service fails.
        return true;
   }
}

/**
 * Sends a message to the backend chat service, including conversation history.
 * It first validates if the query is educational.
 * @param history The previous messages in the conversation.
 * @param message The new user message.
 * @returns A promise that resolves to the AI-generated answer as a string.
 */
export async function performEducationalSearch(history: any[], message: string): Promise<string> {
    // Check if the query is educational before sending it to the search backend.
    const isEducational = await isEducationalQuery(message);
    if (!isEducational) {
        throw new Error("This query seems unrelated to your studies. Please focus on your goals.");
    }

    // If educational, proceed with the secure backend chat.
    return await callApi<string>('performSearch', { history, message });
}


/**
 * Finds educational YouTube videos via our backend.
 *
 * @param query The user's search term (e.g., "ray optics").
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findEducationalVideos = async (query: string): Promise<YouTubeVideo[]> => {
    try {
        return await callApi<YouTubeVideo[]>('findEducationalVideos', { query });
    } catch (error) {
        console.error("Error finding educational videos:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching videos.");
    }
};


/**
 * Finds long-form focus and study music on YouTube via our backend.
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export const findFocusMusic = async (): Promise<YouTubeVideo[]> => {
     try {
        return await callApi<YouTubeVideo[]>('findFocusMusic', {});
    } catch (error) {
        console.error("Error finding focus music:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred while fetching music.");
    }
};
import type { YouTubeVideo } from '../types';

/**
 * A helper function to call our backend API.
 * @param action The specific API action to perform.
 * @param payload The data to send for that action.
 * @returns The JSON result from the API.
 */
async function callApi<T>(action: string, payload: object): Promise<T> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
        // The API returns a JSON object with an 'error' key on failure
        throw new Error(data.error || 'An unknown server error occurred.');
    }

    return data.result;
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
 * Uses our backend with Google Search grounding to provide a direct answer to a query.
 * It first checks for founder-related questions, then validates if the query is educational.
 * @param query The user's search query.
 * @returns A promise that resolves to the AI-generated answer as a string.
 */
export async function performEducationalSearch(query: string): Promise<string> {
    // First, check for founder-related questions as a special case for a fast response.
    const lowerCaseQuery = query.toLowerCase();
    const founderKeywords = ['founder', 'creator', 'who made you', 'who created you', 'who built you'];
    if (founderKeywords.some(keyword => lowerCaseQuery.includes(keyword))) {
        return "This application was founded and created by Anto Bredly.";
    }

    // Next, check if the query is educational before sending it to the search backend.
    const isEducational = await isEducationalQuery(query);
    if (!isEducational) {
        throw new Error("This query seems unrelated to your studies. Please focus on your goals.");
    }

    // If educational, proceed with the secure backend search.
    return await callApi<string>('performSearch', { query });
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

import * as React from 'react';
import { findEducationalVideos, isQueryEducational, getEducationalSuggestions } from '../services/geminiService';
import type { YouTubeVideo } from '../types';
import { PlayIcon, ErrorIcon } from './icons';

interface MiniYouTubeViewProps {
  initialQuery?: string | null;
  onSearchHandled: () => void;
}

// The "watch view" for playing a selected video distraction-free
const WatchView: React.FC<{
    video: YouTubeVideo;
    onBack: () => void;
}> = ({ video, onBack }) => (
    <div className="flex flex-col w-full h-full bg-slate-900/20">
        <div className="p-3 bg-slate-900/20 backdrop-blur-lg border-b border-white/10 shadow-sm z-10">
            <button onClick={onBack} className="flex items-center px-4 py-2 bg-white/10 text-[var(--text-secondary)] rounded-lg hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Search Results
            </button>
        </div>
        <div className="flex-grow flex flex-col items-center p-4 md:p-8 overflow-y-auto">
            <div className="w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden mb-4">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <h1 className="w-full max-w-4xl text-xl font-bold text-[var(--text-primary)] text-left">{video.title}</h1>
        </div>
    </div>
);

export const MiniYouTubeView: React.FC<MiniYouTubeViewProps> = ({ initialQuery, onSearchHandled }) => {
    const [query, setQuery] = React.useState('');
    const [videos, setVideos] = React.useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [searchedQuery, setSearchedQuery] = React.useState('');
    const [selectedVideo, setSelectedVideo] = React.useState<YouTubeVideo | null>(null);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const executeSearch = React.useCallback(async (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;

        setShowSuggestions(false);
        setIsLoading(true);
        setError(null);
        setVideos([]);
        setSearchedQuery(trimmedQuery);

        try {
            // Step 1: Check if the query is educational
            const isEducational = await isQueryEducational(trimmedQuery);
            
            if (!isEducational) {
                setError("This search seems unrelated to educational content. Let's focus on your study goals! Try searching for topics like 'Quantum Physics' or 'JavaScript Tutorials'.");
                setIsLoading(false);
                return;
            }

            // Step 2: If educational, find videos
            const results = await findEducationalVideos(trimmedQuery);
            setVideos(results);
            if (results.length === 0) {
              setError("No educational videos found for this topic. Try a different search term.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`EduTube Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Effect to handle initial search query from planner
    React.useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            executeSearch(initialQuery);
            onSearchHandled();
        }
    }, [initialQuery, executeSearch, onSearchHandled]);

    // Debounced effect for fetching suggestions as the user types
    React.useEffect(() => {
        if (query.trim().length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const results = await getEducationalSuggestions(query);
                // Only show suggestions if the query is still present (user hasn't cleared it)
                if (query.trim().length > 0) { 
                    setSuggestions(results);
                    setShowSuggestions(results.length > 0);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
                setShowSuggestions(false); // Fail silently without showing an error
            }
        };

        const handler = setTimeout(() => {
            fetchSuggestions();
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        executeSearch(query);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false); // Hide suggestions after selection
        executeSearch(suggestion);
    };

    const handleInputBlur = () => {
        // Delay hiding suggestions to allow click events to register
        setTimeout(() => setShowSuggestions(false), 150);
    };
    
    if (selectedVideo) {
        return <WatchView video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
    }

    const WelcomeScreen = () => (
        <div className="text-center p-8 flex flex-col justify-center items-center h-full">
             <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-500)] rounded-full opacity-20 blur-2xl"></div>
                 <svg className="relative w-36 h-36 text-[var(--accent-300)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.34293 21.6569C4.85043 22.3897 3 21.2381 3 19.5455V4.45455C3 2.76186 4.85043 1.61031 6.34293 2.34315L20.3429 9.84315C21.8893 10.5985 21.8893 12.8015 20.3429 13.5569L6.34293 21.6569Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-[var(--accent-200)] mt-6 mb-4">Welcome to EduTube</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Your portal to focused learning. Search for any academic topic to find quality videos without the usual distractions of YouTube.
            </p>
        </div>
    );

    const VideoCard: React.FC<{ video: YouTubeVideo, onSelect: () => void }> = ({ video, onSelect }) => (
        <div 
            className="bg-slate-900/30 rounded-lg overflow-hidden cursor-pointer backdrop-blur-sm border border-white/10 hover:border-[var(--accent-400)]/50 shadow-lg hover:shadow-[var(--shadow-accent)] transition-all duration-300 group transform hover:scale-105"
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelect()}
            aria-label={`Play video: ${video.title}`}
        >
            <div className="relative">
                <img 
                    src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} 
                    alt={video.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/320x180/1e293b/94a3b8?text=Thumbnail\\nUnavailable'; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayIcon className="w-12 h-12 text-white" />
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{video.title}</h3>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 overflow-hidden">
            <div className="p-4 bg-slate-900/20 backdrop-blur-lg border-b border-white/10 shadow-sm z-10">
                <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={handleQueryChange}
                            onFocus={() => { if (query.length > 0 && suggestions.length > 0) setShowSuggestions(true); }}
                            onBlur={handleInputBlur}
                            autoComplete="off"
                            className="w-full px-5 py-3 bg-slate-900/30 text-[var(--text-primary)] border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] placeholder:text-[var(--text-muted)]"
                            placeholder="Search for academic topics like 'Calculus', 'World War II', 'Python basics'..."
                        />
                         <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-full hover:from-[var(--accent-400)] hover:to-[var(--accent-500)] transition-all shadow-md hover:shadow-lg transform hover:scale-110" aria-label="Search" disabled={isLoading}>
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                     {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-20 overflow-hidden">
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-5 py-3 text-[var(--text-primary)] hover:bg-[var(--accent-500)]/10 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </form>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center p-6 rounded-lg bg-slate-900/30 backdrop-blur-sm">
                            <svg className="animate-spin h-10 w-10 text-[var(--accent-400)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg text-[var(--text-secondary)]">Finding educational videos...</p>
                        </div>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="flex justify-center items-center h-full">
                         <div className="p-6 max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm text-[var(--text-primary)] border border-red-500/30 rounded-lg text-center flex flex-col items-center gap-4">
                            <ErrorIcon className="w-10 h-10 text-red-300" />
                            <div>
                                <h3 className="font-bold text-lg mb-2">Error</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && !error && videos.length === 0 && <WelcomeScreen />}
                {videos.length > 0 && (
                     <div className="max-w-7xl mx-auto">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Results for "{searchedQuery}"</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {videos.map(video => (
                                <VideoCard 
                                  key={video.videoId} 
                                  video={video} 
                                  onSelect={() => setSelectedVideo(video)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
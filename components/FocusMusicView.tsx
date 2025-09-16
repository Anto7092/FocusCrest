import React, { useState, useEffect } from 'react';
import { findFocusMusic } from '../services/geminiService';
import type { YouTubeVideo } from '../types';
import { PlayIcon, ErrorIcon, MusicIcon } from './icons';

// The "watch view" for playing a selected video distraction-free
const WatchView: React.FC<{
    video: YouTubeVideo;
    onBack: () => void;
}> = ({ video, onBack }) => (
    <div className="flex flex-col w-full h-full bg-slate-900/20">
        <div className="p-3 bg-slate-900/20 backdrop-blur-lg border-b border-white/10 shadow-sm z-10">
            <button onClick={onBack} className="flex items-center px-4 py-2 bg-white/10 text-slate-200 rounded-lg hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Music Selection
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
            <h1 className="w-full max-w-4xl text-xl font-bold text-white text-left">{video.title}</h1>
        </div>
    </div>
);

const VideoCard: React.FC<{ video: YouTubeVideo, onSelect: () => void }> = ({ video, onSelect }) => (
    <div 
        className="bg-slate-900/30 rounded-lg overflow-hidden cursor-pointer backdrop-blur-sm border border-white/10 hover:border-emerald-400/50 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group transform hover:scale-105"
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
            <h3 className="text-base font-semibold text-slate-200">{video.title}</h3>
        </div>
    </div>
);

export const FocusMusicView: React.FC = () => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        const fetchMusic = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const results = await findFocusMusic();
                setVideos(results);
                if (results.length === 0) {
                  setError("Could not find any focus music at the moment. Please try again later.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMusic();
    }, []);

    if (selectedVideo) {
        return <WatchView video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
    }

    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 overflow-hidden">
            <div className="p-4 bg-slate-900/20 backdrop-blur-lg border-b border-white/10 shadow-sm z-10 flex items-center justify-center">
                 <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                    <MusicIcon className="w-7 h-7 text-emerald-300" />
                    Focus <span className="font-light text-slate-300">Music</span>
                </h1>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center p-6 rounded-lg bg-slate-900/30 backdrop-blur-sm">
                            <svg className="animate-spin h-10 w-10 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg text-slate-300">Finding focus music...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center h-full">
                         <div className="p-6 max-w-md mx-auto bg-red-900/30 backdrop-blur-sm text-red-200 border border-red-500/30 rounded-lg text-center flex flex-col items-center gap-4">
                            <ErrorIcon className="w-10 h-10 text-red-300" />
                            <div>
                                <h3 className="font-bold text-lg mb-2">Failed to Load Music</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && videos.length > 0 && (
                     <div className="max-w-7xl mx-auto">
                        <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
                            A selection of long-form music and ambient sounds to help you concentrate and stay in the zone.
                        </p>
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
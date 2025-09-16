import React, { useState, useCallback, useMemo } from 'react';
import { performEducationalSearch } from '../services/geminiService';
import { ErrorIcon, AssistantIcon } from './icons';

const SearchHomeScreen: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full opacity-20 blur-2xl"></div>
                <AssistantIcon className="relative w-28 h-28 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">AI Assistant</h1>
            <p className="text-slate-300 max-w-lg mb-8">
                Enter an academic topic or question to get a direct, AI-powered answer.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                 <div className="relative">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-900/40 text-slate-100 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                        placeholder="e.g., 'What is mitosis?', 'Explain black holes'..."
                        autoFocus
                    />
                     <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md hover:shadow-lg" aria-label="Search">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

// A simple component to render markdown content
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const formattedContent = useMemo(() => {
        const lines = content.split('\n');
        const elements: JSX.Element[] = [];
        let listItems: JSX.Element[] = [];

        const parseInline = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold syntax
            return parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="font-bold text-emerald-300">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 pl-4">
                        {listItems}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            if (line.startsWith('### ')) {
                flushList();
                elements.push(<h3 key={index} className="text-xl font-semibold text-slate-100 mt-5 mb-2">{parseInline(line.substring(4))}</h3>);
            } else if (line.startsWith('## ')) {
                flushList();
                elements.push(<h2 key={index} className="text-2xl font-semibold text-slate-100 mt-6 mb-3">{parseInline(line.substring(3))}</h2>);
            } else if (line.startsWith('# ')) {
                flushList();
                elements.push(<h1 key={index} className="text-3xl font-bold text-white mt-6 mb-4">{parseInline(line.substring(2))}</h1>);
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                listItems.push(<li key={index}>{parseInline(line.substring(2))}</li>);
            } else {
                flushList();
                if (line.trim() !== '') {
                    elements.push(<p key={index} className="mb-4">{parseInline(line)}</p>);
                }
            }
        });

        flushList(); // Flush any remaining list items at the end

        return elements;
    }, [content]);

    return <>{formattedContent}</>;
};


const SearchResultsView: React.FC<{
    query: string;
    answer: string;
    onBack: () => void;
}> = ({ query, answer, onBack }) => {
    return (
        <div className="flex flex-col h-full">
             {/* HEADER: This part is now fixed and will not scroll. */}
             <div className="flex-shrink-0 p-3 bg-slate-900/20 backdrop-blur-lg border-b border-white/10 shadow-sm z-10 flex items-center">
                 <button onClick={onBack} className="flex items-center px-4 py-2 bg-white/10 text-slate-200 rounded-lg hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    New Query
                </button>
            </div>
             {/* CONTENT: This div takes the remaining space and becomes scrollable if content overflows. */}
            <div className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto text-slate-200">
                <div className="max-w-4xl mx-auto">
                    <p className="text-sm text-slate-400">Answer for:</p>
                    <h1 className="text-3xl font-bold text-white mb-6">{query}</h1>

                    <div className="p-6 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-slate-200 leading-relaxed font-sans text-base break-words">
                        <MarkdownRenderer content={answer} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BrowserView: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchHome, setIsSearchHome] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [searchResults, setSearchResults] = useState<{ query: string; answer: string; } | null>(null);

  const handleSearch = async (query: string) => {
      setIsLoading(true);
      setError(null);
      setSearchResults(null);
      setLoadingMessage('Generating answer...');
      try {
          const answer = await performEducationalSearch(query);
          setSearchResults({ query, answer });
          setIsSearchHome(false);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred during the search.');
      } finally {
          setIsLoading(false);
      }
  };
  
  const backToSearchHome = useCallback(() => {
    setIsSearchHome(true);
    setSearchResults(null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {error && (
        <div className="p-3 bg-red-500/20 text-red-100 border-t border-red-500/30 flex items-center justify-center gap-3 text-sm z-20">
          <ErrorIcon className="h-5 w-5 text-red-300" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 relative bg-slate-800/20">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/40 backdrop-blur-sm z-20">
             <div className="flex flex-col items-center p-6 rounded-lg bg-slate-900/50">
                <svg className="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-slate-300">{loadingMessage}</p>
             </div>
          </div>
        )}

        {isSearchHome && !isLoading && <SearchHomeScreen onSearch={handleSearch} />}
        
        {searchResults && !isLoading && (
            <SearchResultsView 
                query={searchResults.query}
                answer={searchResults.answer}
                onBack={backToSearchHome}
            />
        )}
      </div>
    </div>
  );
};
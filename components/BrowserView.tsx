import * as React from 'react';
import { performEducationalSearch } from '../services/geminiService';
import { ErrorIcon, AssistantIcon, SaveToNotesIcon } from './icons';
import type { ChatMessage } from '../types';

interface AssistantViewProps {
  initialQuery?: string | null;
  onQueryHandled: () => void;
}

// A more robust markdown-to-HTML converter for saving notes.
// This version processes inline markdown before wrapping in block-level tags,
// which prevents formatting from being misinterpreted as plain text.
const markdownToHtml = (markdown: string): string => {
    // Function to process inline markdown (bold, italic)
    const processInline = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    };

    let html = markdown
        .split('\n')
        .map(line => {
            if (line.startsWith('### ')) return `<h3>${processInline(line.substring(4))}</h3>`;
            if (line.startsWith('## ')) return `<h2>${processInline(line.substring(3))}</h2>`;
            if (line.startsWith('# ')) return `<h1>${processInline(line.substring(2))}</h1>`;
            if (line.startsWith('* ') || line.startsWith('- ')) return `<li>${processInline(line.substring(2))}</li>`;
            // For regular paragraphs, process inline markdown then wrap in <p>
            return line.trim() === '' ? '' : `<p>${processInline(line)}</p>`;
        })
        .join('');

    // Wrap consecutive list items in <ul> tags
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

    return html;
};


// A simple component to render markdown content
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const formattedContent = React.useMemo(() => {
        const lines = content.split('\n');
        const elements: JSX.Element[] = [];
        let listItems: JSX.Element[] = [];

        const parseInline = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/g);
            return parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="font-bold markdown-strong">{part.slice(2, -2)}</strong>;
                }
                if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                    return <em key={index} className="italic markdown-em">{part.slice(1, -1)}</em>;
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
                elements.push(<h3 key={index} className="text-xl font-semibold text-[var(--text-primary)] mt-5 mb-2">{parseInline(line.substring(4))}</h3>);
            } else if (line.startsWith('## ')) {
                flushList();
                elements.push(<h2 key={index} className="text-2xl font-semibold text-[var(--text-primary)] mt-6 mb-3">{parseInline(line.substring(3))}</h2>);
            } else if (line.startsWith('# ')) {
                flushList();
                elements.push(<h1 key={index} className="text-3xl font-bold text-[var(--text-primary)] mt-6 mb-4">{parseInline(line.substring(2))}</h1>);
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                listItems.push(<li key={index}>{parseInline(line.substring(2))}</li>);
            } else {
                flushList();
                if (line.trim() !== '') {
                    elements.push(<p key={index} className="mb-4">{parseInline(line)}</p>);
                }
            }
        });

        flushList();

        return elements;
    }, [content]);

    return <div className="text-[var(--text-secondary)] leading-relaxed font-sans text-base break-words">{formattedContent}</div>;
};

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-full opacity-20 blur-2xl"></div>
            <AssistantIcon className="relative w-28 h-28 text-[var(--accent-400)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">AI Assistant</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mb-8">
            Start a conversation by asking an academic question to get an AI-powered answer.
        </p>
    </div>
);

export const BrowserView: React.FC<AssistantViewProps> = ({ initialQuery, onQueryHandled }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [currentQuery, setCurrentQuery] = React.useState('');
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialQuery) {
        setCurrentQuery(initialQuery);
        inputRef.current?.focus();
        onQueryHandled();
    }
  }, [initialQuery, onQueryHandled]);


  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSaveToNotes = (content: string) => {
      // Prepare the HTML content to be appended in the Notes view.
      const contentAsHtml = markdownToHtml(content);
      const separator = '<hr style="border-color: #475569; margin: 1rem 0;" />';
      const timestamp = new Date().toLocaleString();
      const contentToAppend = `${separator}<p><em>Saved from AI Assistant on ${timestamp}:</em></p>${contentAsHtml}`;
      
      // Dispatch a custom event with the content for NotesView to handle.
      window.dispatchEvent(new CustomEvent('save-to-notes', { detail: contentToAppend }));

      // Dispatch the original event to trigger the view switch in App.tsx.
      window.dispatchEvent(new CustomEvent('notes-updated'));

      // Provide user feedback.
      setSavedMessage(content);
      setTimeout(() => setSavedMessage(null), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = currentQuery.trim();
    if (!query || isLoading) return;

    setError(null);
    
    const newUserMessage: ChatMessage = { role: 'user', parts: query };
    // This is the history that will be sent to the API
    const historyForApi = [...chatHistory, newUserMessage].map(msg => ({ role: msg.role, parts: [{ text: msg.parts }] }));
    
    // Add user message and an empty model message placeholder to state
    setChatHistory(prev => [...prev, newUserMessage, { role: 'model', parts: '' }]);
    setCurrentQuery('');
    setIsLoading(true);

    try {
        const stream = performEducationalSearch(historyForApi, query);

        for await (const chunk of stream) {
            setChatHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    const updatedLastMessage = { ...lastMessage, parts: lastMessage.parts + chunk };
                    return [...prev.slice(0, -1), updatedLastMessage];
                }
                return prev;
            });
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`AI Assistant Error: ${errorMessage}`);
        // On error, remove the user message and the placeholder model message
        setChatHistory(prev => prev.slice(0, -2));
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-slate-800/20">
      {error && (
        <div className="p-3 bg-red-500/20 text-red-100 border-b border-red-500/30 flex items-center justify-center gap-3 text-sm z-20">
          <ErrorIcon className="h-5 w-5 text-red-300" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-6">
        {chatHistory.length === 0 && !isLoading && !error && <WelcomeScreen />}
        
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)] rounded-br-none' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-bl-none'}`}>
              {msg.role === 'model' ? (
                <div>
                    {msg.parts ? (
                        <MarkdownRenderer content={msg.parts} />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[var(--accent-400)] rounded-full animate-pulse delay-0"></div>
                            <div className="w-2 h-2 bg-[var(--accent-400)] rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-[var(--accent-400)] rounded-full animate-pulse delay-300"></div>
                        </div>
                    )}
                    
                    {(!isLoading || index < chatHistory.length - 1) && msg.parts.length > 0 && (
                        <div className="text-right mt-2">
                            <button 
                                onClick={() => handleSaveToNotes(msg.parts)} 
                                className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-[var(--bg-quaternary)] text-[var(--text-secondary)] rounded-full hover:bg-[var(--border-secondary)] transition-colors disabled:opacity-50"
                                disabled={savedMessage === msg.parts}
                                aria-label="Save to Notes"
                            >
                               <SaveToNotesIcon className="w-4 h-4" />
                               {savedMessage === msg.parts ? 'Saved!' : 'Save to Notes'}
                            </button>
                        </div>
                    )}
                </div>
              ) : (
                <p>{msg.parts}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <div className="flex-shrink-0 p-4 bg-slate-900/20 backdrop-blur-lg border-t border-white/10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="w-full pl-5 pr-14 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] placeholder:text-[var(--text-muted)] disabled:opacity-50"
              placeholder={isLoading ? "Generating answer..." : "Ask a follow-up question..."}
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-full hover:from-[var(--accent-400)] hover:to-[var(--accent-500)] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:saturate-50" 
              aria-label="Send message"
              disabled={isLoading || !currentQuery.trim()}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
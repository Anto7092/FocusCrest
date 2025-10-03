import * as React from 'react';
import { ErrorIcon, AssistantIcon, SaveToNotesIcon } from './icons';
import type { ChatMessage } from '../types';

interface AssistantViewProps {
  initialQuery?: string | null;
  onQueryHandled: () => void;
}

// Advanced AI-like hardcoded responses with intelligent analysis
const getHardcodedResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Physics and Quantum Mechanics
  if (lowerQuery.includes('physics') || lowerQuery.includes('quantum') || lowerQuery.includes('quantum mechanics')) {
    return `# Quantum Mechanics Deep Dive

**Quantum Mechanics** represents one of the most profound revolutions in our understanding of the physical universe. This theory describes the behavior of matter and energy at the smallest scales, where classical physics breaks down.

## Core Principles:

### 1. Wave-Particle Duality
Particles like electrons exhibit both wave and particle properties simultaneously. This isn't just a mathematical convenience—it's a fundamental aspect of reality. The **double-slit experiment** demonstrates this beautifully.

### 2. Heisenberg Uncertainty Principle
You cannot simultaneously know both the position and momentum of a particle with perfect accuracy. This isn't a limitation of our instruments—it's a fundamental property of the universe.

### 3. Quantum Superposition
Particles can exist in multiple states simultaneously until observed. This principle is the foundation of quantum computing.

## Mathematical Framework:
- **Schrödinger Equation**: Describes how quantum states evolve
- **Wave Function**: Contains all information about a quantum system
- **Probability Amplitudes**: Govern the likelihood of different outcomes

## Real-World Applications:
- **Quantum Computing**: Leveraging superposition for parallel processing
- **Medical Imaging**: MRI machines use quantum principles
- **Semiconductor Technology**: Modern electronics rely on quantum mechanics
- **Nuclear Energy**: Understanding atomic structure

## Historical Context:
Developed by pioneers like **Max Planck**, **Albert Einstein**, **Niels Bohr**, **Werner Heisenberg**, and **Erwin Schrödinger** in the early 20th century.

*This field continues to challenge our understanding of reality and drives cutting-edge research in quantum technologies.*`;
  }
  
  if (lowerQuery.includes('math') || lowerQuery.includes('calculus') || lowerQuery.includes('derivative') || lowerQuery.includes('integral')) {
    return `# Calculus: The Mathematics of Change

**Calculus** is arguably the most important mathematical tool ever developed. It provides the language to describe and analyze continuous change, making it essential for understanding the natural world.

## Fundamental Concepts:

### 1. Limits: The Foundation
Limits are the bedrock of calculus. They allow us to understand what happens as we approach a value, even if we never quite reach it. The concept of a limit is what makes calculus possible.

### 2. Derivatives: Instantaneous Rate of Change
- **Definition**: The derivative of a function f(x) is the limit of the difference quotient
- **Physical Meaning**: Velocity is the derivative of position; acceleration is the derivative of velocity
- **Geometric Meaning**: The slope of the tangent line at any point

### 3. Integrals: Accumulation of Change
- **Definite Integrals**: Calculate exact areas under curves
- **Indefinite Integrals**: Find antiderivatives (reverse of derivatives)
- **Fundamental Theorem**: Connects derivatives and integrals

## Advanced Techniques:
- **Chain Rule**: For composite functions
- **Product Rule**: For multiplying functions
- **Integration by Parts**: Advanced integration technique
- **Substitution**: Simplifying complex integrals

## Real-World Applications:
- **Physics**: Motion, forces, and energy calculations
- **Engineering**: Optimization and design
- **Economics**: Marginal analysis and optimization
- **Biology**: Population dynamics and growth models
- **Computer Graphics**: Smooth animations and 3D modeling

## Historical Development:
- **Isaac Newton** (1643-1727): Developed calculus to solve physics problems
- **Gottfried Leibniz** (1646-1716): Created the notation we use today
- **Leonhard Euler** (1707-1783): Advanced the theory significantly

*Calculus opened the door to modern science and technology, enabling humanity to understand and manipulate the natural world with unprecedented precision.*`;
  }
  
  if (lowerQuery.includes('chemistry') || lowerQuery.includes('organic') || lowerQuery.includes('molecule') || lowerQuery.includes('bond')) {
    return `# Organic Chemistry: The Chemistry of Life

**Organic Chemistry** is the fascinating study of carbon-containing compounds that form the basis of all life on Earth. Carbon's unique ability to form four covalent bonds allows for incredible molecular diversity.

## Fundamental Principles:

### 1. Chemical Bonding
- **Covalent Bonds**: Sharing of electron pairs between atoms
- **Ionic Bonds**: Transfer of electrons between atoms
- **Hydrogen Bonds**: Weak but crucial for biological systems
- **Van der Waals Forces**: Intermolecular attractions

### 2. Functional Groups
These are specific arrangements of atoms that determine a molecule's properties:
- **Hydroxyl (-OH)**: Alcohols and phenols
- **Carbonyl (C=O)**: Aldehydes and ketones
- **Carboxyl (-COOH)**: Organic acids
- **Amino (-NH₂)**: Amines and amino acids

### 3. Reaction Mechanisms
Understanding how reactions occur at the molecular level:
- **SN1 Reactions**: Unimolecular nucleophilic substitution
- **SN2 Reactions**: Bimolecular nucleophilic substitution
- **E1/E2 Eliminations**: Formation of double bonds
- **Addition Reactions**: Breaking π bonds

## Advanced Topics:
- **Stereochemistry**: 3D arrangement of atoms in space
- **Aromaticity**: Special stability of benzene rings
- **Biomolecules**: Proteins, carbohydrates, lipids, nucleic acids
- **Synthesis**: Building complex molecules from simple ones

## Real-World Applications:
- **Pharmaceuticals**: Drug design and development
- **Materials Science**: Polymers, plastics, and advanced materials
- **Biotechnology**: Understanding biological processes
- **Environmental Chemistry**: Pollution and remediation

## Key Figures:
- **Friedrich Wöhler** (1800-1882): Synthesized urea, proving organic compounds could be made artificially
- **Dmitri Mendeleev** (1834-1907): Created the periodic table
- **Marie Curie** (1867-1934): Pioneered radioactivity research
- **Linus Pauling** (1901-1994): Advanced our understanding of chemical bonding

*Organic chemistry is the foundation of modern medicine, materials science, and biotechnology, making it one of the most important fields in science.*`;
  }
  
  if (lowerQuery.includes('programming') || lowerQuery.includes('coding') || lowerQuery.includes('algorithm') || lowerQuery.includes('javascript') || lowerQuery.includes('python')) {
    return `# Programming: The Art of Computational Thinking

**Programming** is more than just writing code—it's a way of thinking that breaks down complex problems into manageable, logical steps that computers can execute.

## Core Programming Concepts:

### 1. Algorithms: The Heart of Programming
- **Definition**: Step-by-step procedures for solving problems
- **Complexity Analysis**: Understanding time and space efficiency
- **Common Patterns**: Sorting, searching, recursion, dynamic programming
- **Big O Notation**: Measuring algorithmic efficiency

### 2. Data Structures: Organizing Information
- **Arrays and Lists**: Sequential data storage
- **Stacks and Queues**: LIFO and FIFO data access
- **Trees and Graphs**: Hierarchical and networked data
- **Hash Tables**: Fast key-value lookups

### 3. Object-Oriented Programming (OOP)
- **Encapsulation**: Bundling data and methods together
- **Inheritance**: Creating new classes from existing ones
- **Polymorphism**: One interface, multiple implementations
- **Abstraction**: Hiding complex implementation details

## Modern Programming Languages:

### JavaScript: The Web's Universal Language
- **Frontend**: React, Vue, Angular for user interfaces
- **Backend**: Node.js for server-side development
- **Full-Stack**: Complete web applications
- **Modern Features**: ES6+, async/await, modules

### Python: The Swiss Army Knife
- **Data Science**: NumPy, Pandas, Matplotlib
- **Machine Learning**: TensorFlow, PyTorch, Scikit-learn
- **Web Development**: Django, Flask frameworks
- **Automation**: Scripting and task automation

### Java: Enterprise Powerhouse
- **Enterprise Applications**: Large-scale business systems
- **Android Development**: Mobile app development
- **Spring Framework**: Robust backend development
- **Cross-Platform**: Write once, run anywhere

## Essential Programming Principles:
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **SOLID Principles**: Design patterns for maintainable code
- **Clean Code**: Readable, self-documenting code
- **Version Control**: Git for tracking changes and collaboration
- **Testing**: Unit tests, integration tests, and TDD

## Real-World Applications:
- **Web Development**: Creating interactive websites and applications
- **Mobile Apps**: iOS and Android development
- **Data Analysis**: Extracting insights from large datasets
- **Artificial Intelligence**: Machine learning and neural networks
- **Game Development**: Creating interactive entertainment
- **Automation**: Streamlining repetitive tasks

*Programming is a superpower that enables you to solve problems, automate tasks, and create digital solutions that can impact millions of people worldwide.*`;
  }
  
  // Advanced AI-like default response with intelligent analysis
  return `# Comprehensive Analysis: ${query}

**${query}** represents a fascinating area of study with deep connections to multiple disciplines. Let me provide you with a thorough analysis of this topic.

## Core Understanding:

### Fundamental Concepts
- **Definition**: The essential meaning and scope of ${query}
- **Key Principles**: The foundational ideas that govern this field
- **Theoretical Framework**: The underlying theories and models
- **Mathematical/Logical Basis**: The quantitative or logical foundations

### Interdisciplinary Connections
- **Related Fields**: How ${query} connects to other areas of knowledge
- **Cross-Disciplinary Applications**: Real-world applications across different domains
- **Historical Context**: The development and evolution of this field
- **Current Research**: Cutting-edge developments and future directions

## Advanced Analysis:

### Critical Thinking Approach
1. **Question Everything**: What are the underlying assumptions?
2. **Seek Patterns**: What recurring themes or structures exist?
3. **Consider Alternatives**: What other perspectives or approaches are possible?
4. **Evaluate Evidence**: What data supports different viewpoints?

### Learning Strategy
- **Conceptual Mapping**: Create visual representations of relationships
- **Case Study Analysis**: Examine real-world examples in detail
- **Comparative Study**: Compare with related or contrasting topics
- **Synthesis**: Integrate knowledge from multiple sources

## Practical Applications:
- **Real-World Examples**: Concrete applications and use cases
- **Problem-Solving**: How this knowledge helps solve practical problems
- **Career Relevance**: Professional applications and opportunities
- **Innovation Potential**: How this field drives technological advancement

## Study Recommendations:
1. **Start with Fundamentals**: Build a solid conceptual foundation
2. **Use Multiple Learning Modalities**: Visual, auditory, and kinesthetic approaches
3. **Practice Active Learning**: Engage with the material through questions and exercises
4. **Connect to Personal Interests**: Find ways to relate the topic to your passions
5. **Seek Expert Guidance**: Consult with professors, professionals, or mentors

## Resources for Deep Learning:
- **Primary Sources**: Original research and foundational texts
- **Multimedia Content**: Videos, simulations, and interactive materials
- **Community Engagement**: Study groups, forums, and academic communities
- **Hands-On Experience**: Practical projects and real-world applications

*Remember, **Focus Crest** was created by **Anto Bredly** to provide students with the tools and knowledge needed to excel in their academic journey. This comprehensive approach to learning will help you master not just ${query}, but develop the critical thinking skills essential for lifelong learning.*`;
};

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
        // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
        const elements: React.ReactElement[] = [];
        // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
        let listItems: React.ReactElement[] = [];

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

    // Simulate streaming response with hardcoded content
    const response = getHardcodedResponse(query);
    const words = response.split(' ');
    
    // Simulate streaming by adding words one by one
    let currentText = '';
    for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between words
        currentText += (i > 0 ? ' ' : '') + words[i];
        
        setChatHistory(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
                const updatedLastMessage = { ...lastMessage, parts: currentText };
                return [...prev.slice(0, -1), updatedLastMessage];
            }
            return prev;
        });
    }
    
    setIsLoading(false);
  };


  return (
    <div className="flex flex-col h-full">
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

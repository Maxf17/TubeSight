import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisState, Language } from '../types';
import { AlertTriangle, ExternalLink, Bot, Globe, Sparkles, PlayCircle } from 'lucide-react';

interface AnalysisResultsProps {
  state: AnalysisState;
  language: Language;
}

// Helper to convert MM:SS or HH:MM:SS to seconds
const parseTimestamp = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

// Dispatch event for VideoEmbed
const handleTimestampClick = (timeStr: string) => {
  const seconds = parseTimestamp(timeStr);
  const event = new CustomEvent('tubeSightSeek', { detail: seconds });
  window.dispatchEvent(event);
};

// Custom renderer for text nodes to catch timestamps
const renderTextWithTimestamps = (text: string) => {
  // Regex matches 0:00, 00:00, 1:00:00
  const regex = /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b/g;
  const parts = text.split(regex);
  const matches = text.match(regex);

  if (!matches) return text;

  return parts.reduce((acc: any[], part, i) => {
    acc.push(part);
    if (matches[i]) {
      acc.push(
        <button
          key={i}
          onClick={() => handleTimestampClick(matches[i])}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-brand-200 border border-brand-500/20 transition-colors cursor-pointer align-baseline text-[0.9em] font-mono font-medium"
          title={`Aller à ${matches[i]}`}
        >
          <PlayCircle className="w-3 h-3" />
          {matches[i]}
        </button>
      );
    }
    return acc;
  }, []);
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ state, language }) => {
  const t = {
    fr: {
      errorTitle: "Échec de l'Analyse",
      analyzingTitle: "Analyse du Contenu Vidéo",
      analyzingDesc: "Réflexion profonde avec Gemini 2.5...",
      readyTitle: "Prêt à analyser",
      readyDesc: "Les résultats détaillés apparaîtront ici une fois l'analyse lancée.",
      sources: "Sources & Citations"
    },
    en: {
      errorTitle: "Analysis Failed",
      analyzingTitle: "Analyzing Video Content",
      analyzingDesc: "Deep reasoning with Gemini 2.5...",
      readyTitle: "Ready to Analyze",
      readyDesc: "Detailed results will appear here once analysis starts.",
      sources: "Sources & Citations"
    }
  };

  const text = t[language];

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
        <div className="bg-red-500/10 p-5 rounded-full mb-6 ring-1 ring-red-500/20 shadow-lg shadow-red-900/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{text.errorTitle}</h3>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed">{state.error}</p>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <Bot className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white animate-pulse">{text.analyzingTitle}</h3>
          <p className="text-brand-200/60 text-sm font-medium tracking-wide uppercase">{text.analyzingDesc}</p>
        </div>
      </div>
    );
  }

  if (!state.result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-white/[0.03] rounded-full flex items-center justify-center mb-8 ring-1 ring-white/5 shadow-2xl">
           <Sparkles className="w-12 h-12 opacity-20 text-brand-200" />
        </div>
        <h3 className="text-gray-300 font-semibold mb-2">{text.readyTitle}</h3>
        <p className="max-w-xs mx-auto text-sm leading-relaxed text-gray-600">{text.readyDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
        <div className="prose prose-invert prose-brand max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-p:leading-7 prose-li:text-gray-300">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-8 pb-4 border-b border-white/10" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-brand-100 mt-10 mb-5 flex items-center gap-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-8 mb-4 pl-4 border-l-2 border-brand-500" {...props} />,
              ul: ({node, ...props}) => <ul className="list-none space-y-4 my-6 pl-0" {...props} />,
              li: ({node, ...props}) => (
                <li className="flex items-start gap-3 pl-2" {...props}>
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,104,0.6)]"></span>
                  <span className="flex-1">
                     {React.Children.map(props.children, child => {
                        if (typeof child === 'string') return renderTextWithTimestamps(child);
                        return child;
                     })}
                  </span>
                </li>
              ),
              strong: ({node, ...props}) => <strong className="text-brand-200 font-bold" {...props} />,
              p: ({node, ...props}) => (
                 <p className="text-gray-300 leading-relaxed mb-6 font-light tracking-wide text-[15px]" {...props}>
                     {React.Children.map(props.children, child => {
                        if (typeof child === 'string') return renderTextWithTimestamps(child);
                        return child;
                     })}
                 </p>
              ),
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-500 pl-6 py-4 italic text-gray-400 bg-white/[0.02] rounded-r-xl my-8 quote-shadow" {...props} />
            }}
          >
            {state.result}
          </ReactMarkdown>
        </div>
        
        {/* Sources Section */}
        {state.sources && state.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3 h-3" />
              {text.sources}
            </h4>
            <div className="flex flex-wrap gap-2">
              {state.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:border-brand-500/50 hover:bg-brand-500/10 rounded-full text-xs text-brand-200 hover:text-white transition-all truncate max-w-[250px]"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{new URL(source).hostname}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

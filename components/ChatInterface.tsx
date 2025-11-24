import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { streamChatMessage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  selectedFile?: File;
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
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

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedFile, history, setHistory, language }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = {
    fr: {
      welcome: "Bonjour ! Je suis prêt. Posez-moi n'importe quelle question sur le contenu de la vidéo.",
      error: "Désolé, j'ai rencontré une erreur lors de l'analyse. Veuillez réessayer.",
      placeholder: "Posez des questions précises sur la vidéo...",
      warning: "L'IA peut faire des erreurs. Vérifiez les informations.",
      thinking: "Réflexion...",
      uploadPrompt: "Veuillez importer une vidéo pour démarrer la discussion."
    },
    en: {
      welcome: "Hello! I am ready. Ask me anything about the video content.",
      error: "Sorry, I encountered an error during analysis. Please try again.",
      placeholder: "Ask specific questions about the video...",
      warning: "AI can make mistakes. Please verify important information.",
      thinking: "Thinking...",
      uploadPrompt: "Please upload a video to start chatting."
    }
  };

  const text = t[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setVideoBase64(result.split(',')[1]);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && history.length === 0) {
       setHistory([{
        id: 'init',
        role: 'model',
        text: text.welcome,
        timestamp: Date.now()
      }]);
    }
  }, [selectedFile, history.length, setHistory, text.welcome]);

  const handleSend = async () => {
    if (!input.trim() || !selectedFile || !videoBase64) return;

    const userText = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, userMsg]);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
    };
    setHistory(prev => [...prev, botMsg]);

    try {
      const apiHistory = history.filter(m => m.id !== 'init');
      
      const stream = streamChatMessage(
        videoBase64,
        selectedFile.type,
        apiHistory,
        userMsg.text
      );

      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setHistory(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: text.error,
        timestamp: Date.now(),
        isError: true
      };
      setHistory(prev => {
          const filtered = prev.filter(m => m.id !== botMsgId || m.text.length > 0);
          return [...filtered, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg">
           <Bot className="w-8 h-8 opacity-40" />
        </div>
        <p className="font-medium">{text.uploadPrompt}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`flex max-w-[85%] sm:max-w-[80%] gap-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/5 ${
                  msg.role === 'user' ? 'bg-dark-700' : 'bg-gradient-to-br from-brand-500 to-brand-700'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-gray-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div
                className={`rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-white/10 text-white rounded-tr-sm border border-white/10'
                    : msg.isError 
                      ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-tl-sm'
                      : 'bg-black/40 text-gray-100 border border-white/10 rounded-tl-sm'
                }`}
              >
                 {msg.isError ? (
                   <div className="flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" />
                     {msg.text}
                   </div>
                 ) : (
                    <div className="prose prose-invert prose-sm max-w-none break-words">
                        {msg.role === 'model' && msg.text === '' && isLoading ? (
                            <div className="flex items-center gap-2 text-brand-200 py-1">
                                <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
                                <span className="text-xs animate-pulse font-bold tracking-wide uppercase">{text.thinking}</span>
                            </div>
                        ) : (
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => (
                                   <p className="leading-relaxed mb-3" {...props}>
                                       {React.Children.map(props.children, child => {
                                          if (typeof child === 'string') return renderTextWithTimestamps(child);
                                          return child;
                                       })}
                                   </p>
                                ),
                                li: ({node, ...props}) => (
                                    <li {...props}>
                                        {React.Children.map(props.children, child => {
                                          if (typeof child === 'string') return renderTextWithTimestamps(child);
                                          return child;
                                       })}
                                    </li>
                                )
                              }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        )}
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="relative flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500/50 transition-all shadow-xl">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={text.placeholder}
            className="w-full bg-transparent text-white text-sm p-3 max-h-32 min-h-[44px] resize-none outline-none scrollbar-hide placeholder-gray-500 font-medium"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 mb-[1px] ${
              input.trim() && !isLoading
                ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105 shadow-lg shadow-brand-900/40'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-3 font-semibold tracking-wide uppercase">
          {text.warning}
        </p>
      </div>
    </div>
  );
};

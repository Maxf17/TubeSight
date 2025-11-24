import React, { useState, useEffect } from 'react';
import { VideoEmbed } from './components/VideoEmbed';
import { AnalysisForm } from './components/AnalysisForm';
import { AnalysisResults } from './components/AnalysisResults';
import { ChatInterface } from './components/ChatInterface';
import { VisualsGenerator } from './components/VisualsGenerator';
import { Header } from './components/Header';
import { AnalysisState, VideoData, ChatMessage, VisualsState, Language } from './types';
import { Video, Sparkles, MessageSquareText, FileText, Presentation } from 'lucide-react';

const App: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [language, setLanguage] = useState<Language>('fr');
  
  // --- PERSISTENT STATE ---
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [visualsState, setVisualsState] = useState<VisualsState>({
    slides: [],
    isLoading: false,
    error: null,
    config: {
      instructions: '',
      audience: '',
      style: 'Professional',
      colorTheme: 'Corporate Blue',
      layoutType: 'Key Takeaways',
      slideCount: 3
    }
  });

  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'visuals'>('insights');

  const handleFileSelect = (file: File) => {
    if (videoData?.url) {
      URL.revokeObjectURL(videoData.url);
    }

    const objectUrl = URL.createObjectURL(file);
    
    setVideoData({
      url: objectUrl,
      file: file,
      mimeType: file.type
    });
    
    setAnalysisState({ isLoading: false, result: null, error: null });
    setChatHistory([]);
    setVisualsState({
      slides: [],
      isLoading: false,
      error: null,
      config: { ...visualsState.config, instructions: '' }
    });
    
    setActiveTab('insights');
  };

  useEffect(() => {
    return () => {
      if (videoData?.url) URL.revokeObjectURL(videoData.url);
    };
  }, []);

  // Translations for the main layout
  const t = {
    fr: {
      videoSource: 'Source Vidéo',
      multimodalCaps: 'Capacités Multimodales',
      feat1: 'Importez des fichiers **MP4/WebM** directement depuis votre appareil.',
      feat2: 'Gemini 2.5 Flash **voit et écoute** réellement le contenu.',
      feat3: 'Générez des analyses, discutez avec la vidéo ou créez des présentations complètes.',
      insights: 'Analyses',
      chat: 'Discussion',
      visuals: 'Présentation',
      thinking: 'Réflexion...',
      footer: 'TubeSight AI • Propulsé par Gemini 2.5'
    },
    en: {
      videoSource: 'Video Source',
      multimodalCaps: 'Multimodal Capabilities',
      feat1: 'Upload **MP4/WebM** files directly from your device.',
      feat2: 'Gemini 2.5 Flash actually **sees and hears** the content.',
      feat3: 'Generate analysis, chat with the video, or create full presentations.',
      insights: 'Insights',
      chat: 'Chat',
      visuals: 'Presentation',
      thinking: 'Thinking...',
      footer: 'TubeSight AI • Powered by Gemini 2.5'
    }
  };

  const text = t[language];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500/30 selection:text-white">
      <Header language={language} setLanguage={setLanguage} />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
          
          {/* Left Column: Video & Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-dark-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-black/20 group hover:ring-brand-500/20 transition-all duration-500">
              <div className="p-1.5 bg-gradient-to-r from-brand-600/10 via-transparent to-transparent">
                <div className="px-6 py-4 rounded-t-2xl border-b border-white/5 bg-white/[0.02]">
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3 text-white/80">
                    <Video className="w-4 h-4 text-brand-500" />
                    {text.videoSource}
                  </h2>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <VideoEmbed videoUrl={videoData?.url} language={language} />
                
                <AnalysisForm 
                  onVideoFileSelect={handleFileSelect}
                  onAnalysisStart={(newState) => {
                    setAnalysisState(newState);
                    setActiveTab('insights'); 
                  }}
                  onAnalysisComplete={(newState) => setAnalysisState(newState)}
                  isAnalyzing={analysisState.isLoading}
                  selectedFile={videoData?.file}
                  language={language}
                />
              </div>
            </div>

            {/* Introductory Help Text */}
            {!analysisState.result && !analysisState.isLoading && !analysisState.error && (
              <div className="bg-gradient-to-br from-dark-800/60 to-dark-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl text-gray-400 text-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-gray-100 font-bold mb-4 flex items-center gap-3 text-base">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  {text.multimodalCaps}
                </h3>
                <ul className="space-y-3 ml-1 relative z-10">
                  <li className="flex items-start gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                    <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text.feat1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                    <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text.feat2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                    <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text.feat3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Results & Chat & Visuals */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[700px] bg-dark-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/20">
               
               {/* Right Column Header with Tabs */}
               <div className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between px-4 pt-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {[
                        { id: 'insights', label: text.insights, icon: FileText },
                        { id: 'chat', label: text.chat, icon: MessageSquareText },
                        { id: 'visuals', label: text.visuals, icon: Presentation },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`
                            px-5 py-3.5 rounded-t-2xl text-sm font-semibold flex items-center gap-2.5 transition-all relative
                            ${activeTab === tab.id
                              ? 'text-white bg-white/5 shadow-[0_-1px_0_0_rgba(255,255,255,0.05)_inset]'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }
                          `}
                        >
                          <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-500' : 'text-gray-500'}`} />
                          {tab.label}
                          {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"></div>
                          )}
                        </button>
                      ))}
                    </div>

                    {(
                      (analysisState.isLoading && activeTab === 'insights') || 
                      (visualsState.isLoading && activeTab === 'visuals')
                     ) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 rounded-full border border-brand-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-brand-300 animate-pulse tracking-widest uppercase">
                          {text.thinking}
                        </span>
                      </div>
                    )}
                  </div>
              </div>
              
              {/* Tab Content Area */}
              <div className="flex-grow relative overflow-hidden flex flex-col bg-transparent">
                 {activeTab === 'insights' && <AnalysisResults state={analysisState} language={language} />}
                 
                 {activeTab === 'chat' && (
                   <ChatInterface 
                     selectedFile={videoData?.file} 
                     history={chatHistory} 
                     setHistory={setChatHistory}
                     language={language}
                   />
                 )}
                 
                 {activeTab === 'visuals' && (
                   <VisualsGenerator 
                     selectedFile={videoData?.file} 
                     state={visualsState}
                     setState={setVisualsState}
                     language={language}
                   />
                 )}
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <footer className="py-8 text-center text-dark-600 text-xs tracking-[0.2em] uppercase font-bold opacity-60 hover:opacity-100 transition-opacity">
        <p>{text.footer}</p>
      </footer>
    </div>
  );
};

export default App;
import React from 'react';
import { MonitorPlay, Sparkles, Globe } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020203]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#020203]/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 ring-1 ring-white/5">
              <MonitorPlay className="text-white w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none flex items-center gap-2">
              TubeSight
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-brand-200 border border-white/5 tracking-wider uppercase">
                AI
              </span>
            </h1>
            <span className="text-xs text-gray-500 font-medium tracking-[0.2em] uppercase mt-1.5 group-hover:text-brand-400 transition-colors">
              {language === 'fr' ? 'Intelligence Vidéo' : 'Video Intelligence'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-gray-300"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'FR' : 'EN'}</span>
          </button>

          <div className="hidden sm:flex px-4 py-2 rounded-full bg-white/5 border border-white/5 items-center gap-2 shadow-black/50">
             <Sparkles className="w-4 h-4 text-brand-400" />
             <span className="text-xs text-gray-300 font-semibold tracking-wide">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
};
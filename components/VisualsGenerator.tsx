import React, { useState } from 'react';
import { Presentation, Sparkles, RefreshCw, AlertCircle, Image as ImageIcon, PenLine, Users, Palette, LayoutTemplate, PaintBucket, Layers, ChevronDown } from 'lucide-react';
import { generatePresentation } from '../services/geminiService';
import { VisualsState, Language } from '../types';

interface VisualsGeneratorProps {
  selectedFile?: File;
  state: VisualsState;
  setState: React.Dispatch<React.SetStateAction<VisualsState>>;
  language: Language;
}

export const VisualsGenerator: React.FC<VisualsGeneratorProps> = ({ selectedFile, state, setState, language }) => {
  const { slides, isLoading, error, config } = state;

  const t = {
    fr: {
      uploadPrompt: "Veuillez importer une vidéo pour générer des visuels.",
      createTitle: "Créer un Support de Présentation",
      createDesc: "L'IA va planifier une narration et générer des diapositives visuelles pour une présentation orale.",
      topicLabel: "Sujet / Objectif",
      topicPlaceholder: "Ex: Un pitch pour investisseurs résumant la croissance...",
      audienceLabel: "Public Cible",
      audiencePlaceholder: "Ex: Investisseurs, Étudiants",
      slideCountLabel: "Nombre de Slides",
      styleLabel: "Style Visuel",
      colorLabel: "Thème Couleur",
      generateBtn: "Générer",
      slidesText: "Diapositives",
      generatingTitle: "Conception de la Présentation...",
      step1: "Planification de la narration",
      step2: "Rédaction des notes orateur",
      step3: "Création des visuels",
      retry: "Réessayer",
      yourPres: "Votre Présentation",
      regenerate: "Régénérer",
      saveTip: "Clic droit sur les images pour les enregistrer.",
      speakerNotes: "Notes Orateur",
      slide: "Slide",
      imageFail: "Échec Image",
      errorGen: "Échec de la génération de la présentation."
    },
    en: {
      uploadPrompt: "Please upload a video to generate visuals.",
      createTitle: "Create Presentation Deck",
      createDesc: "AI will plan a narrative and generate visual slides for an oral presentation.",
      topicLabel: "Topic / Goal",
      topicPlaceholder: "Ex: Investor pitch summarizing growth...",
      audienceLabel: "Target Audience",
      audiencePlaceholder: "Ex: Investors, Students",
      slideCountLabel: "Slide Count",
      styleLabel: "Visual Style",
      colorLabel: "Color Theme",
      generateBtn: "Generate",
      slidesText: "Slides",
      generatingTitle: "Designing Presentation...",
      step1: "Planning narrative flow",
      step2: "Writing speaker notes",
      step3: "Creating visuals",
      retry: "Retry",
      yourPres: "Your Presentation",
      regenerate: "Regenerate",
      saveTip: "Right-click images to save.",
      speakerNotes: "Speaker Notes",
      slide: "Slide",
      imageFail: "Image Failed",
      errorGen: "Failed to generate presentation."
    }
  };

  const text = t[language];

  const updateConfig = (key: keyof typeof config, value: any) => {
    setState(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, slides: [] }));

    try {
      const base64 = await convertFileToBase64(selectedFile);
      const generatedSlides = await generatePresentation(
        base64, 
        selectedFile.type, 
        config.instructions, 
        config.audience, 
        config.style,
        config.colorTheme,
        config.slideCount,
        language
      );
      setState(prev => ({ ...prev, slides: generatedSlides }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: err.message || text.errorGen }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg">
           <ImageIcon className="w-8 h-8 opacity-40" />
        </div>
        <p className="font-medium">{text.uploadPrompt}</p>
      </div>
    );
  }

  const optionClass = "bg-dark-900 text-gray-300 py-2";

  return (
    <div className="h-full bg-transparent p-6 flex flex-col items-center overflow-y-auto scrollbar-hide">
      
      {slides.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center max-w-2xl text-center space-y-6 w-full animate-in fade-in zoom-in duration-300 my-auto">
          <div className="p-6 bg-brand-500/10 rounded-full border border-brand-500/20 shadow-[0_0_40px_rgba(244,63,104,0.15)] mx-auto relative group">
            <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Presentation className="w-12 h-12 text-brand-500 relative z-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">{text.createTitle}</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              {text.createDesc}
            </p>
          </div>

          <div className="w-full bg-dark-900/60 rounded-[1.5rem] p-8 border border-white/5 space-y-6 shadow-2xl backdrop-blur-md">
            
            {/* Custom Instructions */}
            <div className="text-left space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <PenLine className="w-3 h-3 text-brand-500" />
                  {text.topicLabel}
              </label>
              <textarea
                  value={config.instructions}
                  onChange={(e) => updateConfig('instructions', e.target.value)}
                  placeholder={text.topicPlaceholder}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-brand-500/50 focus:bg-black/60 transition-all resize-none h-24 scrollbar-hide focus:ring-1 focus:ring-brand-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               {/* Audience */}
               <div className="text-left space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                      <Users className="w-3 h-3 text-brand-500" />
                      {text.audienceLabel}
                  </label>
                  <input
                      type="text"
                      value={config.audience}
                      onChange={(e) => updateConfig('audience', e.target.value)}
                      placeholder={text.audiencePlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-brand-500/50 focus:bg-black/60 transition-all focus:ring-1 focus:ring-brand-500/30"
                  />
               </div>

               {/* Slide Count */}
               <div className="text-left space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                      <Layers className="w-3 h-3 text-brand-500" />
                      {text.slideCountLabel}
                  </label>
                  <div className="relative">
                    <select
                        value={config.slideCount}
                        onChange={(e) => updateConfig('slideCount', parseInt(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-brand-500/50 focus:bg-black/60 transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-brand-500/30"
                    >
                        <option value="3" className={optionClass}>3 {text.slidesText}</option>
                        <option value="5" className={optionClass}>5 {text.slidesText}</option>
                        <option value="7" className={optionClass}>7 {text.slidesText}</option>
                        <option value="10" className={optionClass}>10 {text.slidesText}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
               </div>

               {/* Visual Style */}
               <div className="text-left space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                      <Palette className="w-3 h-3 text-brand-500" />
                      {text.styleLabel}
                  </label>
                  <div className="relative">
                    <select
                        value={config.style}
                        onChange={(e) => updateConfig('style', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-brand-500/50 focus:bg-black/60 transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-brand-500/30"
                    >
                        <option value="Professional" className={optionClass}>Professional</option>
                        <option value="Minimalist" className={optionClass}>Minimalist</option>
                        <option value="Futuristic" className={optionClass}>Futuristic</option>
                        <option value="Hand Drawn" className={optionClass}>Hand Drawn</option>
                        <option value="Photorealistic" className={optionClass}>Photorealistic</option>
                        <option value="Abstract" className={optionClass}>Abstract</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
               </div>

               {/* Color Theme */}
               <div className="text-left space-y-2.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                      <PaintBucket className="w-3 h-3 text-brand-500" />
                      {text.colorLabel}
                  </label>
                  <div className="relative">
                    <select
                        value={config.colorTheme}
                        onChange={(e) => updateConfig('colorTheme', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-brand-500/50 focus:bg-black/60 transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-brand-500/30"
                    >
                        <option value="Corporate Blue" className={optionClass}>Corporate Blue</option>
                        <option value="Dark Mode" className={optionClass}>Dark Mode</option>
                        <option value="Vibrant Gradient" className={optionClass}>Vibrant Gradient</option>
                        <option value="Pastel" className={optionClass}>Pastel</option>
                        <option value="Monochrome" className={optionClass}>Monochrome</option>
                        <option value="Warm" className={optionClass}>Warm</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-lg shadow-brand-900/40 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-brand-400/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
            <Sparkles className="w-5 h-5 relative z-20" />
            <span className="relative z-20">{text.generateBtn} {config.slideCount} {text.slidesText}</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
           <div className="relative w-28 h-28">
              <div className="absolute inset-0 border-4 border-white/5 rounded-3xl"></div>
              <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-3xl animate-spin"></div>
              <Layers className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
           </div>
           <div className="text-center">
             <h3 className="text-xl font-bold text-white animate-pulse">{text.generatingTitle}</h3>
             <div className="mt-6 space-y-2.5">
                 <p className="text-sm text-gray-400 flex items-center gap-3 justify-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> {text.step1}</p>
                 <p className="text-sm text-gray-400 flex items-center gap-3 justify-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 delay-100"></span> {text.step2}</p>
                 <p className="text-sm text-gray-400 flex items-center gap-3 justify-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 delay-200"></span> {text.step3} ({config.slideCount})</p>
             </div>
           </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
          <div className="bg-red-500/10 p-4 rounded-full mb-4 ring-1 ring-red-500/20 shadow-lg">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-200 mb-6 font-medium">{error}</p>
          <button 
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition-colors border border-white/10 hover:border-white/20"
          >
            {text.retry}
          </button>
        </div>
      )}

      {slides.length > 0 && (
        <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-500 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              {text.yourPres} ({slides.length} {text.slidesText})
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={handleGenerate}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white"
                title="Régénérer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{text.regenerate}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {slides.map((slide, index) => (
               <div key={slide.id} className="bg-white rounded-2xl overflow-hidden shadow-2xl ring-4 ring-black/20 flex flex-col h-full transform hover:-translate-y-1 transition-all duration-300 group">
                  {/* Image Section */}
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                    {slide.imageBase64 ? (
                        <img 
                        src={`data:image/png;base64,${slide.imageBase64}`} 
                        alt={slide.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <span className="text-xs font-medium">{text.imageFail}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                        <span className="inline-block px-2.5 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider rounded w-fit mb-3 shadow-lg">
                            {text.slide} {index + 1}
                        </span>
                        <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">
                        {slide.title}
                        </h2>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 bg-white text-gray-900 flex-grow flex flex-col">
                    <ul className="space-y-4 mb-8 flex-grow">
                        {slide.bulletPoints.map((point, idx) => (
                            <li key={idx} className="font-medium text-[15px] leading-snug flex items-start gap-3.5">
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                config.colorTheme.includes('Warm') ? 'bg-orange-500' : 
                                config.colorTheme.includes('Dark') ? 'bg-gray-800' :
                                'bg-brand-500'
                            }`}></span>
                            <span className="text-gray-700">{point}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {slide.notes && (
                        <div className="mt-auto pt-5 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {text.speakerNotes}
                            </p>
                            <p className="text-xs text-gray-500 italic leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">"{slide.notes}"</p>
                        </div>
                    )}
                  </div>
               </div>
            ))}
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-12 font-medium">
            {text.saveTip}
          </p>
        </div>
      )}
    </div>
  );
};